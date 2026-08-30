import { useState } from 'react';

import { apiDelete, apiGet } from '../api/client.js';
import { PencilIcon, TrashIcon } from './icons.jsx';

/**
 * Satu bagian admin: judul, daftar record yang bisa diedit atau dihapus, lalu
 * tombol tambah.
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
    // Konfirmasi justru makin perlu setelah tombolnya jadi ikon: sasaran yang
    // lebih kecil dan tanpa teks membuat salah klik lebih gampang.
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

      <ul>
        {items.map((item) => {
          // Nama record ikut masuk ke aria-label DAN title. Tanpa itu tombol
          // ikon tidak punya nama sama sekali bagi pembaca layar, dan "Edit"
          // yang berulang tiga belas kali juga tidak memberitahu edit yang mana.
          const label = renderLabel(item);

          return (
            <li key={item.id}>
              <span className="row-label">{label}</span>

              <span className="row-actions">
                <button
                  type="button"
                  className="row-action"
                  aria-label={`Edit ${label}`}
                  title={`Edit ${label}`}
                  onClick={() => setEditing({ item })}
                >
                  <PencilIcon />
                </button>
                <button
                  type="button"
                  className="row-action row-action-danger"
                  aria-label={`Hapus ${label}`}
                  title={`Hapus ${label}`}
                  onClick={() => handleDelete(item)}
                >
                  <TrashIcon />
                </button>
              </span>
            </li>
          );
        })}
      </ul>

      {/* Tombol tambah ada DI BAWAH daftar supaya riwayat yang sudah masuk
          terbaca lebih dulu — kalau di atas, daftarnya ketutup form begitu
          tombolnya ditekan. Form yang terbuka menggantikan tombol di posisi
          yang sama, jadi tidak ada yang melompat. */}
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
    </section>
  );
}
