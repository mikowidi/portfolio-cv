import { NAV_ITEMS } from './navItems.js';

/**
 * Kolom kiri di layar lebar: identitas, nav, lalu social link di bawah.
 *
 * Nav-nya anchor biasa ke `id` milik tiap section — tanpa JavaScript, tanpa
 * scroll-spy. Item aktif sengaja TIDAK mengikuti posisi scroll: itu butuh
 * IntersectionObserver dan sudah diputuskan di luar lingkup redesign.
 *
 * Di bawah 64rem nav ini disembunyikan lewat CSS dan TopNav — bar yang
 * menempel di atas — mengambil alih, supaya navigasi tidak hilang di jendela
 * setengah layar.
 */

export default function Hero({ profile }) {
  return (
    <section className="hero">
      <div className="hero-identity">
        <h1>{profile.full_name}</h1>
        <p className="hero-headline">{profile.headline}</p>
        <p className="hero-statement">{profile.hero_statement}</p>

        <nav className="hero-nav" aria-label="Navigasi bagian">
          <ul>
            {NAV_ITEMS.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>
                  <span className="nav-line" aria-hidden="true" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {profile.social_links.length > 0 && (
        <ul className="social">
          {profile.social_links.map((link) => (
            <li key={link.id}>
              <a href={link.url}>{link.label}</a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
