/**
 * Pemformat rentang tanggal untuk halaman publik.
 *
 * Dipindah keluar dari `Experience.jsx` begitu `Education.jsx` membutuhkan
 * bentuk yang sama persis. Handoff Phase 1 bagian 7 memang meminta aturan
 * "end_date null berarti masih berjalan" ditulis SEKALI — menyalinnya ke
 * section kedua akan langsung melanggar itu.
 */

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
export function formatRange(startDate, endDate) {
  const end = endDate === null ? 'sekarang' : formatMonth(endDate);
  return `${formatMonth(startDate)} - ${end}`;
}
