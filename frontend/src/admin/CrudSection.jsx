import { useState } from 'react';

import { apiDelete, apiGet } from '../api/client.js';

/**
 * Satu bagian admin: judul, tombol tambah, form, dan daftar record yang bisa
 * diedit atau dihapus.
 *
 * Lahir saat bagian Education dan Skills masuk, karena tiga bagian dengan pola
 * yang sama persis akan mendorong `Dashboard.jsx` lewat batas ±150 baris
 * (aturan 6) sambil menyalin alur yang identik tiga kali.
 *
 * Yang berbeda antar-bagian cuma props: dari endpoint mana datanya diambil,
 * bagaimana satu baris ditulis, kalimat konfirmasi hapusnya apa, dan form mana
 * yang dipakai. Sisanya — state sedang mengedit, muat ulang setelah simpan,
 * konfirmasi sebelum hapus — sama untuk semuanya.
 *
 * `writePath` ada karena Skills membaca di `/skills` tapi menulis di
 * `/skill-groups` — kontrak memang memakai dua nama untuk modul yang sama.
 * Dua bagian lain memakai path yang sama untuk keduanya, jadi defaultnya `path`.
 */
export default function CrudSection({
  title,
  path,
  writePath = path,
  items,
  setItems,
  onError,
  addLabel,
  renderLabel,
  confirmText,
  renderForm,
}) {
  // null = tidak sedang mengedit. { item: null } = sedang menambah baru.
  const [editing, setEditing] = useState(null);

  const reload = async () => setItems(await apiGet(path));

  async function handleDelete(item) {
    if (!window.confirm(confirmText(item))) return;

    try {
      await apiDelete(`${writePath}/${item.id}`);
      await reload();
    } catch (err) {
      onError(err);
    }
  }

  return (
    <section>
      <h2>{title}</h2>

      {editing === null ? (
        <button type="button" onClick={() => setEditing({ item: null })}>
          {addLabel}
        </button>
      ) : (
        // `key` memaksa form dibuat ulang saat berpindah antar-record. Tanpa
        // itu, state form yang lama ikut terbawa ke record berikutnya.
        <div key={editing.item?.id ?? 'baru'}>
          {renderForm({
            item: editing.item,
            onSaved: async () => {
              setEditing(null);
              await reload();
            },
            onCancel: () => setEditing(null),
          })}
        </div>
      )}

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {renderLabel(item)}{' '}
            <button type="button" onClick={() => setEditing({ item })}>
              Edit
            </button>{' '}
            <button type="button" onClick={() => handleDelete(item)}>
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
