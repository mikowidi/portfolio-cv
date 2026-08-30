/**
 * Melipat hasil LEFT JOIN yang datar menjadi objek bersarang.
 *
 * JOIN induk-ke-anak mengembalikan SATU BARIS PER ANAK, jadi induk dengan 4
 * anak muncul 4 kali dengan kolom induk yang berulang. Fungsi ini menyatukan
 * baris-baris itu kembali jadi satu induk berisi array anak.
 *
 * `Map` dipakai, bukan objek biasa, karena `Map` mempertahankan urutan
 * penyisipan apa adanya — termasuk untuk key berupa angka, yang pada objek
 * biasa akan diurutkan ulang secara numerik oleh JavaScript. Artinya urutan
 * yang sudah ditentukan `ORDER BY` di SQL terjaga tanpa sort ulang di sini.
 *
 * Kenapa file sendiri: `experiences` dan `skills` memakai lipatan yang bentuknya
 * sama persis, dan menyalinnya dua kali berarti dua tempat yang harus diperbaiki
 * kalau ada bug. Menaruhnya di `db/` karena yang dilipat adalah bentuk hasil
 * query, bukan aturan bisnis modul mana pun.
 *
 * Alternatif dari seluruh pendekatan ini: satu query anak per induk. Itu N+1.
 *
 * @param rows   hasil datar dari `pool.execute`
 * @param parent (row) => objek induk, tanpa array anaknya
 * @param child  (row) => objek anak, atau `null` kalau baris ini tidak membawa
 *               anak. LEFT JOIN mengisi kolom anak dengan NULL untuk induk yang
 *               belum punya anak sama sekali, dan baris seperti itu tidak boleh
 *               masuk daftar sebagai anak kosong.
 * @param key    nama properti tempat array anak ditaruh
 */
export function foldRows(rows, { parent, child, key }) {
  const byId = new Map();

  for (const row of rows) {
    if (!byId.has(row.id)) {
      byId.set(row.id, { ...parent(row), [key]: [] });
    }

    const item = child(row);
    if (item !== null) byId.get(row.id)[key].push(item);
  }

  return [...byId.values()];
}
