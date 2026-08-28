/**
 * Editor daftar highlight: tambah, hapus, dan urutkan naik-turun.
 *
 * Dipisah dari ExperienceForm.jsx karena file itu lewat batas ±150 baris
 * (aturan 6). Seam-nya jelas: komponen ini tidak tahu apa pun soal experience,
 * hanya mengelola satu array string dan melapor lewat `onChange`.
 *
 * Urutan array inilah yang jadi `sort_order` di database — tidak ada nomor urut
 * yang disimpan terpisah, jadi memindahkan butir memang berarti memindahkan
 * elemennya.
 */
export default function HighlightsEditor({ values, onChange, error }) {
  const replaceAt = (index, body) =>
    onChange(values.map((item, position) => (position === index ? body : item)));

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
      <legend>Highlights</legend>

      {values.map((body, index) => (
        // Indeks dipakai sebagai key karena butir tidak punya identitas sendiri
        // di form ini: isinya boleh sama persis, dan posisinya memang bagian
        // dari datanya, bukan sekadar urutan tampilan.
        // eslint-disable-next-line react/no-array-index-key
        <div key={index}>
          <textarea
            rows={2}
            aria-label={`Highlight ${index + 1}`}
            value={body}
            onChange={(event) => replaceAt(index, event.target.value)}
          />
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
        Tambah highlight
      </button>

      {error !== undefined && <span role="alert"> {error}</span>}
    </fieldset>
  );
}
