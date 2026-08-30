/**
 * Editor daftar teks: tambah, hapus, dan urutkan naik-turun.
 *
 * Awalnya `HighlightsEditor`, dipakai hanya oleh ExperienceForm. Digeneralisasi
 * saat SkillGroupForm butuh perilaku yang sama persis — satu induk plus daftar
 * anak yang bisa diurutkan. Isinya memang tidak pernah tahu apa pun soal
 * experience: yang dikelola cuma satu array string, dan hasilnya dilaporkan
 * lewat `onChange`. Jadi yang berubah hanya labelnya, lewat props.
 *
 * Urutan array inilah yang jadi `sort_order` di database — tidak ada nomor urut
 * yang disimpan terpisah, jadi memindahkan butir memang berarti memindahkan
 * elemennya.
 *
 * `multiline` memilih textarea atau input. Highlight berupa kalimat (VARCHAR
 * 400), nama skill berupa satu frasa pendek (VARCHAR 80) yang tidak boleh
 * mengandung baris baru — textarea di sana justru mengundang isian yang
 * bentuknya tidak muat di kolomnya.
 */
export default function ListEditor({
  values,
  onChange,
  error,
  legend,
  itemLabel,
  addLabel,
  multiline = false,
}) {
  const replaceAt = (index, text) =>
    onChange(values.map((item, position) => (position === index ? text : item)));

  const removeAt = (index) =>
    onChange(values.filter((_, position) => position !== index));

  const move = (index, offset) => {
    const target = index + offset;
    if (target < 0 || target >= values.length) return;

    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <fieldset>
      <legend>{legend}</legend>

      {values.map((text, index) => (
        // Indeks dipakai sebagai key karena butir tidak punya identitas sendiri
        // di form ini: isinya boleh sama persis, dan posisinya memang bagian
        // dari datanya, bukan sekadar urutan tampilan.
        // eslint-disable-next-line react/no-array-index-key
        <div key={index}>
          {multiline ? (
            <textarea
              rows={2}
              aria-label={`${itemLabel} ${index + 1}`}
              value={text}
              onChange={(event) => replaceAt(index, event.target.value)}
            />
          ) : (
            <input
              type="text"
              aria-label={`${itemLabel} ${index + 1}`}
              value={text}
              onChange={(event) => replaceAt(index, event.target.value)}
            />
          )}
          <button type="button" onClick={() => move(index, -1)} disabled={index === 0}>
            Naik
          </button>
          <button
            type="button"
            onClick={() => move(index, 1)}
            disabled={index === values.length - 1}
          >
            Turun
          </button>
          <button type="button" onClick={() => removeAt(index)}>
            Hapus
          </button>
        </div>
      ))}

      <button type="button" onClick={() => onChange([...values, ''])}>
        {addLabel}
      </button>

      {error !== undefined && <span role="alert"> {error}</span>}
    </fieldset>
  );
}
