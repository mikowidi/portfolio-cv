import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import {
  BriefcaseIcon,
  CapIcon,
  ExternalIcon,
  LogoutIcon,
  MenuIcon,
  SparkIcon,
  UserIcon,
} from './icons.jsx';

/**
 * Kerangka admin panel: merek, topbar, sidebar, lalu area isi.
 *
 * Tata letaknya meniru W3CRM — rail kiri 15rem, topbar 3.125rem, isi mengisi
 * sisanya — tapi **ditulis ulang dengan CSS grid biasa**, bukan diimpor.
 * Template aslinya butuh Bootstrap, jQuery, dan metisMenu; aturan 5 melarang
 * ketiganya, dan metisMenu mengubah DOM langsung sehingga akan berebut dengan
 * React. Yang ditiru bentuknya, bukan dependensinya.
 *
 * Warna seluruhnya dari token yang sudah ada, jadi admin tetap satu bahasa
 * visual dengan halaman publik dan tidak ada angka kontras yang perlu diukur
 * ulang.
 */
const MENU = [
  { to: '/admin', label: 'Profil', Icon: UserIcon, end: true },
  { to: '/admin/experience', label: 'Experience', Icon: BriefcaseIcon },
  { to: '/admin/education', label: 'Education', Icon: CapIcon },
  { to: '/admin/skills', label: 'Skills', Icon: SparkIcon },
];

export default function AdminLayout({ user, onLogout, children }) {
  // Hanya dipakai di bawah 64rem; di atas itu sidebar selalu tampil dan
  // state ini tidak berpengaruh sama sekali.
  const [terbuka, setTerbuka] = useState(false);

  return (
    <div className={`shell${terbuka ? ' shell-nav-terbuka' : ''}`}>
      <div className="shell-brand">
        <span className="shell-brand-mark" aria-hidden="true">
          AT
        </span>
        <span className="shell-brand-teks">Portfolio CV</span>
      </div>

      <header className="shell-topbar">
        <button
          type="button"
          className="shell-toggle"
          aria-expanded={terbuka}
          aria-controls="admin-sidebar"
          aria-label={terbuka ? 'Tutup menu' : 'Buka menu'}
          onClick={() => setTerbuka((v) => !v)}
        >
          <MenuIcon />
        </button>

        <p className="shell-user">
          Masuk sebagai <strong>{user.username}</strong>
        </p>
      </header>

      {/* `id` menyambung ke aria-controls tombol di atas. */}
      <nav id="admin-sidebar" className="shell-sidebar" aria-label="Navigasi admin">
        <ul className="shell-menu">
          {MENU.map(({ to, label, Icon, end }) => (
            <li key={to}>
              {/* NavLink memasang aria-current="page" sendiri saat cocok —
                  itu penanda yang dibaca pembaca layar, bukan sekadar warna. */}
              <NavLink to={to} end={end} onClick={() => setTerbuka(false)}>
                <Icon />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="shell-menu-kaki">
          <a href="/" className="shell-menu-tautan">
            <ExternalIcon />
            <span>Lihat halaman publik</span>
          </a>
          <button type="button" className="shell-menu-tautan" onClick={onLogout}>
            <LogoutIcon />
            <span>Keluar</span>
          </button>
        </div>
      </nav>

      {/* Menutup sidebar saat area isi disentuh di layar sempit. Sengaja bukan
          <button>: perannya menangkap sentuhan di luar menu, dan menjadikannya
          kontrol yang bisa difokus justru menambah satu perhentian tab yang
          tidak berarti apa-apa. Tombol tutup yang sesungguhnya ada di topbar. */}
      <div
        className="shell-tirai"
        hidden={!terbuka}
        onClick={() => setTerbuka(false)}
      />

      <main className="shell-isi admin">{children}</main>
    </div>
  );
}
