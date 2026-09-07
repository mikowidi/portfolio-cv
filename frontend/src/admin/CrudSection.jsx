import { useState } from 'react';

import { apiDelete, apiGet } from '../api/client.js';
import { PencilIcon, PlusIcon, TrashIcon } from './icons.jsx';

/**
 * Satu bagian admin: judul, daftar record, lalu tombol tambah.
 *
 * Lahir saat bagian Education dan Skills masuk, karena tiga bagian dengan pola
 * yang sama persis akan mendorong `Dashboard.jsx` lewat batas ±150 baris
 * (aturan 6) sambil menyalin alur yang identik tiga kali.
 *
 * Yang berbeda antar-bagian cuma props: dari endpoint mana datanya diambil,
 * bagaimana satu baris ditulis, kalimat konfirmasi hapusnya apa, dan form mana
 * yang dipakai.
 *
 * `writePath` ada karena Skills membaca di `/skills` tapi menulis di
 * `/skill-groups` — kontrak memang memakai dua nama untuk modul yang sama.
 *
 * Aksi baris disembunyikan sampai barisnya dipilih. Polanya "disclosure":
 * label jadi tombol ber-`aria-expanded`, dan aksinya muncul di bawahnya. Itu
 * membuat daftar tenang saat dibaca, dan tetap bisa dijalankan keyboard —
 * kalau barisnya cuma `<div onClick>`, tidak ada satu pun yang bisa ditab.
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
  // id baris yang sedang terbuka aksinya. Satu saja: daftar yang separuh
  // barisnya terbuka lebih berantakan daripada yang menutup sendiri.
  const [dipilih, setDipilih] = useState(null);

  const reload = async () => setItems(await apiGet(path));

  async function handleDelete(item) {
    // Konfirmasi tetap ada. Aksi yang tersembunyi sampai diklik justru lebih
    // gampang terpencet tanpa sengaja, bukan lebih sulit.
    if (!window.confirm(confirmText(item))) return;

    try {
      await apiDelete(`${writePath}/${item.id}`);
      setDipilih(null);
      await reload();
    } catch (err) {
      onError(err);
    }
  }

  return (
    <section>
      <h1>{title}</h1>

      <ul className="daftar">
        {items.map((item) => {
          const label = renderLabel(item);
          const terbuka = dipilih === item.id;

          return (
            <li key={item.id} className={terbuka ? 'baris baris-terbuka' : 'baris'}>
              <button
                type="button"
                className="baris-label"
                aria-expanded={terbuka}
                onClick={() => setDipilih(terbuka ? null : item.id)}
              >
                {label}
              </button>

              {/* `hidden` dan bukan sekadar disembunyikan lewat CSS: aksinya
                  ikut keluar dari urutan tab saat barisnya tertutup. */}
              <div className="baris-aksi" hidden={!terbuka}>
                <button
                  type="button"
                  className="aksi"
                  aria-label={`Edit ${label}`}
                  title={`Edit ${label}`}
                  onClick={() => setEditing({ item })}
                >
                  <PencilIcon />
                </button>
                <button
                  type="button"
                  className="aksi aksi-danger"
                  aria-label={`Hapus ${label}`}
                  title={`Hapus ${label}`}
                  onClick={() => handleDelete(item)}
                >
                  <TrashIcon />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Tombol tambah di BAWAH daftar supaya riwayat terbaca lebih dulu.
          Form yang terbuka menggantikannya di posisi yang sama. */}
      {editing === null ? (
        // Teksnya seragam "Add new" di ketiga bagian; nama yang dibaca pembaca
        // layar tetap menyebut bagiannya. `addLabel` sengaja MEMUAT "Add new"
        // supaya nama aksesibelnya mengandung label yang terlihat — kalau tidak,
        // perintah suara "klik Add new" tidak menemukan tombolnya.
        <button
          type="button"
          className="tambah"
          aria-label={addLabel}
          title={addLabel}
          onClick={() => setEditing({ item: null })}
        >
          <PlusIcon />
          <span>Add new</span>
        </button>
      ) : (
        // `key` memaksa form dibuat ulang saat berpindah antar-record. Tanpa
        // itu, state form yang lama ikut terbawa ke record berikutnya.
        <div key={editing.item?.id ?? 'baru'}>
          {renderForm({
            item: editing.item,
            onSaved: async () => {
              setEditing(null);
              setDipilih(null);
              await reload();
            },
            onCancel: () => setEditing(null),
          })}
        </div>
      )}
    </section>
  );
}
