/**
 * Tiap grup dirender sebagai `.entry` yang sama seperti Experience dan
 * Education: nama grup jadi `h3`, skill-nya jadi `<ul>`. Bentuk itu dipilih
 * supaya section ini tidak menambah satu pun aturan CSS baru — lihat komentar
 * di `Education.jsx` untuk alasan lengkapnya.
 *
 * Grup tanpa skill tetap ditampilkan. Backend sengaja memakai LEFT JOIN supaya
 * grup itu ikut terbawa, dan menyembunyikannya di sini akan membatalkan
 * keputusan tersebut — admin yang baru membuat grup lalu belum mengisinya akan
 * mengira simpanannya gagal.
 */
export default function Skills({ skillGroups }) {
  return (
    <section className="skills" id="skills">
      <h2>Skills</h2>

      {skillGroups.length === 0 && <p>Belum ada skill.</p>}

      {skillGroups.map((group) => (
        <article className="entry" key={group.id}>
          <h3>{group.name}</h3>

          {group.skills.length === 0 ? (
            <p className="entry-summary">Belum ada skill di grup ini.</p>
          ) : (
            <ul>
              {group.skills.map((skill) => (
                <li key={skill.id}>{skill.name}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </section>
  );
}
