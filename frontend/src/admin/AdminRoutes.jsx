import { Route, Routes } from 'react-router-dom';

import CrudSection from './CrudSection.jsx';
import EducationForm from './EducationForm.jsx';
import ExperienceForm from './ExperienceForm.jsx';
import ProfileForm from './ProfileForm.jsx';
import SkillGroupForm from './SkillGroupForm.jsx';
import Summary from './Summary.jsx';

/**
 * Empat layar admin, satu per item sidebar.
 *
 * Dipisah dari `Dashboard.jsx` karena file itu sudah memegang gerbang auth dan
 * pengambilan data; menambahkan empat konfigurasi CrudSection di sana akan
 * mendorongnya lewat ±150 baris (aturan 6).
 *
 * Sebelum ada sidebar, keempatnya ditumpuk di satu halaman panjang. Sekarang
 * masing-masing punya rute sendiri, jadi alamatnya bisa di-bookmark, tombol
 * kembali bekerja, dan memuat ulang tetap mendarat di layar yang sama.
 */
export default function AdminRoutes({ data, setters, onError }) {
  const { profile, experiences, education, skillGroups } = data;

  return (
    <Routes>
      <Route
        index
        element={
          <Summary
            profile={profile}
            experiences={experiences}
            education={education}
            skillGroups={skillGroups}
          />
        }
      />

      <Route
        path="profil"
        element={
          profile === null ? null : (
            <ProfileForm profile={profile} onSaved={setters.setProfile} />
          )
        }
      />

      <Route
        path="experience"
        element={
          <CrudSection
            title="Experience"
            path="/experiences"
            items={experiences}
            setItems={setters.setExperiences}
            onError={onError}
            addLabel="Add new experience"
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
        }
      />

      <Route
        path="education"
        element={
          <CrudSection
            title="Education"
            path="/education"
            items={education}
            setItems={setters.setEducation}
            onError={onError}
            addLabel="Add new education"
            renderLabel={(item) => `${item.qualification} — ${item.org}`}
            confirmText={(item) => `Hapus "${item.qualification}"? Tidak bisa dibatalkan.`}
            renderForm={({ item, onSaved, onCancel }) => (
              <EducationForm education={item} onSaved={onSaved} onCancel={onCancel} />
            )}
          />
        }
      />

      <Route
        path="skills"
        element={
          <CrudSection
            title="Skills"
            path="/skills"
            writePath="/skill-groups"
            items={skillGroups}
            setItems={setters.setSkillGroups}
            onError={onError}
            addLabel="Add new skill group"
            renderLabel={(item) => `${item.name} (${item.skills.length} skill)`}
            confirmText={(item) =>
              `Hapus grup "${item.name}" beserta ${item.skills.length} skill di dalamnya? Tidak bisa dibatalkan.`
            }
            renderForm={({ item, onSaved, onCancel }) => (
              <SkillGroupForm group={item} onSaved={onSaved} onCancel={onCancel} />
            )}
          />
        }
      />
    </Routes>
  );
}
