import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { apiDelete, apiGet, apiPost } from '../api/client.js';
import ExperienceForm from './ExperienceForm.jsx';
import ProfileForm from './ProfileForm.jsx';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [experiences, setExperiences] = useState([]);

  // null = tidak sedang mengedit. { experience: null } = sedang menambah baru.
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    Promise.all([apiGet('/auth/me'), apiGet('/profile'), apiGet('/experiences')])
      .then(([me, loadedProfile, loadedExperiences]) => {
        if (cancelled) return;
        setUser(me);
        setProfile(loadedProfile);
        setExperiences(loadedExperiences);
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

  async function reloadExperiences() {
    setExperiences(await apiGet('/experiences'));
  }

  async function handleDelete(experience) {
    const confirmed = window.confirm(
      `Hapus "${experience.position}" beserta ${experience.highlights.length} highlight-nya? Tidak bisa dibatalkan.`,
    );
    if (!confirmed) return;

    try {
      await apiDelete(`/experiences/${experience.id}`);
      await reloadExperiences();
    } catch (err) {
      setError(err);
    }
  }

  async function handleLogout() {
    try {
      await apiPost('/auth/logout');
      navigate('/admin/login', { replace: true });
    } catch (err) {
      setError(err);
    }
  }

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
    <main>
      <h1>Admin</h1>

      <p>
        Masuk sebagai <strong>{user.username}</strong>.{' '}
        <button type="button" onClick={handleLogout}>
          Keluar
        </button>{' '}
        <Link to="/">Lihat halaman publik</Link>
      </p>

      {profile !== null && <ProfileForm profile={profile} onSaved={setProfile} />}

      <section>
        <h2>Experience</h2>

        {editing === null ? (
          <button type="button" onClick={() => setEditing({ experience: null })}>
            Tambah experience
          </button>
        ) : (
          // `key` memaksa form dibuat ulang saat berpindah antar-experience.
          // Tanpa itu, state form yang lama ikut terbawa ke record berikutnya.
          <ExperienceForm
            key={editing.experience?.id ?? 'baru'}
            experience={editing.experience}
            onSaved={async () => {
              setEditing(null);
              await reloadExperiences();
            }}
            onCancel={() => setEditing(null)}
          />
        )}

        <ul>
          {experiences.map((experience) => (
            <li key={experience.id}>
              {experience.position} — {experience.org} ({experience.highlights.length}{' '}
              highlight){' '}
              <button type="button" onClick={() => setEditing({ experience })}>
                Edit
              </button>{' '}
              <button type="button" onClick={() => handleDelete(experience)}>
                Hapus
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
