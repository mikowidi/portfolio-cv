import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from './icons.jsx';

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
          {/* Ikon menggantikan kata Naik/Turun/Hapus. Nama tetap ada lewat
              `aria-label` DAN `title`, dan menyebut butir keberapa — "Naik"
              yang berulang lima kali tidak memberitahu naik yang mana. */}
          <div className="baris-aksi">
            <button
              type="button"
              className="aksi"
              aria-label={`Naikkan ${itemLabel} ${index + 1}`}
              title="Naikkan"
              onClick={() => move(index, -1)}
              disabled={index === 0}
            >
              <ArrowUpIcon />
            </button>
            <button
              type="button"
              className="aksi"
              aria-label={`Turunkan ${itemLabel} ${index + 1}`}
              title="Turunkan"
              onClick={() => move(index, 1)}
              disabled={index === values.length - 1}
            >
              <ArrowDownIcon />
            </button>
            <button
              type="button"
              className="aksi aksi-danger"
              aria-label={`Hapus ${itemLabel} ${index + 1}`}
              title="Hapus"
              onClick={() => removeAt(index)}
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="tambah"
        aria-label={addLabel}
        title={addLabel}
        onClick={() => onChange([...values, ''])}
      >
        <PlusIcon />
        <span>Add new</span>
      </button>

      {error !== undefined && <span role="alert"> {error}</span>}
    </fieldset>
  );
}
