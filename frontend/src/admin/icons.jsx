/**
 * Ikon admin panel, ditulis sebagai SVG inline.
 *
 * Bukan dari icon library: aturan 5 melarang dependensi semacam itu, dan
 * `lucide-react` disebut eksplisit di handoff redesign bagian 0. Dua ikon
 * sebaris SVG jauh lebih murah daripada satu paket npm.
 *
 * Dipisah dari `CrudSection.jsx` karena file itu tepat menyentuh 150 baris
 * setelah ikonnya masuk — batas aturan 6, tanpa sisa untuk perubahan
 * berikutnya. Seam-nya bersih: ikon tidak tahu apa pun soal record maupun CRUD.
 *
 * `stroke="currentColor"` membuat warnanya ikut CSS, jadi keadaan hover dan
 * fokus cukup diatur dari stylesheet tanpa prop warna.
 *
 * `aria-hidden` karena nama tombolnya sudah dibawa `aria-label` di tombol
 * pembungkusnya. Tanpa itu pembaca layar menyebut dua hal untuk satu kontrol.
 */
const ICON = {
  viewBox: '0 0 24 24',
  width: 16,
  height: 16,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
};

export const PencilIcon = () => (
  <svg {...ICON}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const TrashIcon = () => (
  <svg {...ICON}>
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);
