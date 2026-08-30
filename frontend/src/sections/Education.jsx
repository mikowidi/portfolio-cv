import { formatRange } from './dateRange.js';

/**
 * Nama kelas sengaja dipakai ulang dari Experience — `.entry`, `.entry-dates`,
 * `.entry-org`, `.entry-summary` — bukan bikin sendiri. Handoff Phase 2 bagian
 * 1 memintanya supaya CSS redesign nanti bisa menjangkau kedua section dengan
 * satu set aturan, dan supaya section ini tidak butuh CSS baru sama sekali.
 *
 * `note` ("tidak dilanjutkan") memakai `.entry-summary` karena perannya di
 * halaman sama persis: satu baris keterangan pendek di bawah nama institusi.
 */
export default function Education({ education }) {
  return (
    <section className="education">
      <h2>Education</h2>

      {education.length === 0 && <p>Belum ada education.</p>}

      {education.map((item) => (
        <article className="entry" key={item.id}>
          <p className="entry-dates">{formatRange(item.start_date, item.end_date)}</p>

          <h3>{item.qualification}</h3>

          <p className="entry-org">
            {item.org}
            {item.location && ` · ${item.location}`}
          </p>

          {item.note && <p className="entry-summary">{item.note}</p>}
        </article>
      ))}
    </section>
  );
}
