import { formatRange } from './dateRange.js';

export default function Experience({ experiences }) {
  return (
    <section className="experience">
      <h2>Experience</h2>

      {experiences.length === 0 && <p>Belum ada experience.</p>}

      {experiences.map((experience) => (
        <article className="entry" key={experience.id}>
          <p className="entry-dates">
            {formatRange(experience.start_date, experience.end_date)}
          </p>

          <h3>{experience.position}</h3>

          <p className="entry-org">
            {experience.org}
            {experience.location && ` · ${experience.location}`}
          </p>

          {experience.summary && <p className="entry-summary">{experience.summary}</p>}

          {experience.highlights.length > 0 && (
            <ul>
              {experience.highlights.map((highlight) => (
                <li key={highlight.id}>{highlight.body}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </section>
  );
}
