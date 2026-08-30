import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { apiGet, apiPost } from '../api/client.js';
import CrudSection from './CrudSection.jsx';
import EducationForm from './EducationForm.jsx';
import ExperienceForm from './ExperienceForm.jsx';
import ProfileForm from './ProfileForm.jsx';
import SkillGroupForm from './SkillGroupForm.jsx';

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

      <CrudSection
        title="Experience"
        path="/experiences"
        items={experiences}
        setItems={setExperiences}
        onError={setError}
        addLabel="Tambah experience"
        renderLabel={(item) =>
          `${item.position} — ${item.org} (${item.highlights.length} highlight)`
        }
        confirmText={(item) =>
          `Hapus "${item.position}" beserta ${item.highlights.length} highlight-nya? Tidak bisa dibatalkan.`
        }
        renderForm={({ item, onSaved, onCancel }) => (
          <ExperienceForm experience={item} onSaved={onSaved} onCancel={onCancel} />
        )}
      />

      <CrudSection
        title="Education"
        path="/education"
        items={education}
        setItems={setEducation}
        onError={setError}
        addLabel="Tambah education"
        renderLabel={(item) => `${item.qualification} — ${item.org}`}
        confirmText={(item) =>
          `Hapus "${item.qualification}"? Tidak bisa dibatalkan.`
        }
        renderForm={({ item, onSaved, onCancel }) => (
          <EducationForm education={item} onSaved={onSaved} onCancel={onCancel} />
        )}
      />

      <CrudSection
        title="Skills"
        path="/skills"
        writePath="/skill-groups"
        items={skillGroups}
        setItems={setSkillGroups}
        onError={setError}
        addLabel="Tambah skill group"
        renderLabel={(item) => `${item.name} (${item.skills.length} skill)`}
        confirmText={(item) =>
          `Hapus grup "${item.name}" beserta ${item.skills.length} skill di dalamnya? Tidak bisa dibatalkan.`
        }
        renderForm={({ item, onSaved, onCancel }) => (
          <SkillGroupForm group={item} onSaved={onSaved} onCancel={onCancel} />
        )}
      />
    </main>
  );
}
