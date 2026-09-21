import { useState } from 'react';

import { NAV_ITEMS } from './navItems.js';

/**
 * Bar navigasi yang menempel di atas, khusus layar di bawah 64rem — di atas itu
 * nav tinggal di kolom kiri (Hero). Polanya dari v4 brittanychiang.com: link
 * sebaris selama muat, dilipat ke tombol menu di bawah 48rem.
 *
 * Dua nav ini tidak pernah tampil bersamaan. Yang tersembunyi `display: none`,
 * jadi pembaca layar dan urutan tab cuma pernah menemui satu.
 *
 * `href="#top"` tidak butuh elemen ber-id: spesifikasi HTML menjadikan fragmen
 * "top" selalu berarti puncak dokumen.
 */
export default function TopNav({ name }) {
  // Hanya berpengaruh di bawah 48rem; di atas itu daftar selalu tampil sebaris
  // dan tombolnya disembunyikan.
  const [terbuka, setTerbuka] = useState(false);

  return (
    <nav
      className={`topnav${terbuka ? ' topnav-terbuka' : ''}`}
      aria-label="Navigasi bagian"
    >
      <a className="topnav-nama" href="#top" onClick={() => setTerbuka(false)}>
        {name.split(' ')[0]}
      </a>

      <button
        type="button"
        className="topnav-tombol"
        aria-expanded={terbuka}
        aria-controls="topnav-daftar"
        aria-label={terbuka ? 'Tutup menu' : 'Buka menu'}
        onClick={() => setTerbuka((v) => !v)}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {terbuka ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      <ul id="topnav-daftar" className="topnav-daftar">
        {NAV_ITEMS.map(([id, label]) => (
          <li key={id}>
            {/* Menutup menu saat tautan dipilih; tanpa ini panelnya tetap
                terbuka dan menutupi bagian yang baru saja dilompati. */}
            <a href={`#${id}`} onClick={() => setTerbuka(false)}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
