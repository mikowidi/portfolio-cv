import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiGet, apiPost } from '../api/client.js';
import AdminLayout from './AdminLayout.jsx';
import AdminRoutes from './AdminRoutes.jsx';

/**
 * Gerbang auth dan pemuat data admin panel.
 *
 * Data keempat layar diambil SEKALI di sini, lalu dioper ke `AdminRoutes`.
 * Berpindah antar-item sidebar karenanya tidak menembak API lagi — yang
 * berganti cuma layar yang dirender.
 */
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [skillGroups, setSkillGroups] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      apiGet('/auth/me'),
      apiGet('/profile'),
      apiGet('/experiences'),
      apiGet('/education'),
      apiGet('/skills'),
    ])
      .then(([me, loadedProfile, loadedExperiences, loadedEducation, loadedGroups]) => {
        if (cancelled) return;
        setUser(me);
        setProfile(loadedProfile);
        setExperiences(loadedExperiences);
        setEducation(loadedEducation);
        setSkillGroups(loadedGroups);
      })
      .catch((err) => {
        if (cancelled) return;

        // Pengalihan ini cuma soal kenyamanan. Yang benar-benar menegakkan
        // aturan tetap requireAuth di server — halaman ini boleh saja dibuka,
        // datanya tetap tidak akan keluar tanpa cookie yang sah.
        if (err.status === 401) navigate('/admin/login', { replace: true });
        else setError(err);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleLogout() {
    try {
      await apiPost('/auth/logout');
      navigate('/admin/login', { replace: true });
    } catch (err) {
      setError(err);
    }
  }

  // Layar gagal dan memuat sengaja TIDAK memakai kerangka sidebar: keduanya
  // muncul sebelum `user` ada, dan topbar yang menyebut nama pengguna belum
  // punya apa pun untuk ditulis.
  if (error !== null) {
    return (
      <main className="admin">
        <h1>Gagal memuat admin</h1>
        <p role="alert">{error.message}</p>
      </main>
    );
  }

  if (user === null) {
    return (
      <main className="admin">
        <p>Memuat…</p>
      </main>
    );
  }

  return (
    <AdminLayout user={user} onLogout={handleLogout}>
      <AdminRoutes
        data={{ profile, experiences, education, skillGroups }}
        setters={{ setProfile, setExperiences, setEducation, setSkillGroups }}
        onError={setError}
      />
    </AdminLayout>
  );
}
