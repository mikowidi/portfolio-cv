import { Link } from 'react-router-dom';

import { BriefcaseIcon, CapIcon, SparkIcon, UserIcon } from './icons.jsx';

/**
 * Layar pembuka admin: berapa banyak isi tiap bagian, dan pintu ke masing-masing.
 *
 * Angkanya dihitung dari data yang SUDAH dimuat `Dashboard`, bukan dari
 * permintaan API baru — layar ini karenanya tidak menambah satu pun request.
 *
 * Sengaja tidak menampilkan "terakhir diubah": kontrak API publik tidak
 * mengembalikan `updated_at` (keputusan task 4 — id dan updated_at tidak ikut
 * bocor), jadi menampilkannya berarti mengubah kontrak dulu.
 */
export default function Summary({ profile, experiences, education, skillGroups }) {
  const jumlahSkill = skillGroups.reduce((n, g) => n + g.skills.length, 0);

  const kartu = [
    {
      to: '/admin/experience',
      Icon: BriefcaseIcon,
      label: 'Experience',
      angka: experiences.length,
      satuan: experiences.length === 1 ? 'entri' : 'entri',
    },
    {
      to: '/admin/education',
      Icon: CapIcon,
      label: 'Education',
      angka: education.length,
      satuan: 'entri',
    },
    {
      to: '/admin/skills',
      Icon: SparkIcon,
      label: 'Skills',
      angka: skillGroups.length,
      satuan: `grup · ${jumlahSkill} skill`,
    },
    {
      to: '/admin/profil',
      Icon: UserIcon,
      label: 'Profil',
      angka: profile === null ? '—' : profile.social_links.length,
      satuan: 'social link',
    },
  ];

  return (
    <section>
      <h1>Ringkasan</h1>

      <p className="ringkas-intro">
        {profile === null ? 'Memuat profil…' : `Halaman publik atas nama ${profile.full_name}.`}
      </p>

      <ul className="ringkas-kartu">
        {kartu.map(({ to, Icon, label, angka, satuan }) => (
          <li key={to}>
            {/* Seluruh kartu jadi satu tautan: sasaran kliknya besar, dan
                pembaca layar hanya menemukan satu tautan per kartu, bukan
                judul dan angka yang bisa diklik sendiri-sendiri. */}
            <Link to={to}>
              <span className="ringkas-ikon" aria-hidden="true">
                <Icon />
              </span>
              <span className="ringkas-angka">{angka}</span>
              <span className="ringkas-label">{label}</span>
              <span className="ringkas-satuan">{satuan}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
