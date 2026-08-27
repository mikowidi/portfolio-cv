export default function Hero({ profile }) {
  return (
    <section>
      <h1>{profile.full_name}</h1>
      <p>{profile.headline}</p>
      <p>{profile.hero_statement}</p>

      {profile.social_links.length > 0 && (
        <ul>
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
