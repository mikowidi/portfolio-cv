export default function Hero({ profile }) {
  return (
    <section className="hero">
      <h1>{profile.full_name}</h1>
      <p className="hero-headline">{profile.headline}</p>
      <p className="hero-statement">{profile.hero_statement}</p>

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
