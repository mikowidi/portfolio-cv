const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

/**
 * "2025-11-01" -> "Nov 2025".
 *
 * String dipotong apa adanya, sengaja TIDAK lewat `new Date()`: konstruktor
 * Date menafsirkan "2025-11-01" sebagai tengah malam UTC, jadi di timezone
 * sebelah barat GMT tanggalnya mundur sehari — dan untuk tanggal 1, bulannya
 * ikut mundur. Tanggal di sini tidak butuh zona waktu sama sekali.
 */
function formatMonth(isoDate) {
  const [year, month] = isoDate.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** Satu-satunya tempat aturan "end_date null berarti masih berjalan" ditulis. */
function formatRange(startDate, endDate) {
  const end = endDate === null ? 'sekarang' : formatMonth(endDate);
  return `${formatMonth(startDate)} - ${end}`;
}

export default function Experience({ experiences }) {
  return (
    <section>
      <h2>Experience</h2>

      {experiences.length === 0 && <p>Belum ada experience.</p>}

      {experiences.map((experience) => (
        <article key={experience.id}>
          <p>{formatRange(experience.start_date, experience.end_date)}</p>

          <h3>{experience.position}</h3>

          <p>
            {experience.org}
            {experience.location && ` · ${experience.location}`}
          </p>

          {experience.summary && <p>{experience.summary}</p>}

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
