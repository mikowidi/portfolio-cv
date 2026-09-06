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

/* Ikon sidebar dan topbar. Ukurannya 18px, bukan 16px seperti ikon baris:
   di sidebar ia berdiri sendiri sebagai penanda menu, bukan menempel pada
   teks di dalam tombol sempit. */
const NAV = { ...ICON, width: 18, height: 18 };

export const UserIcon = () => (
  <svg {...NAV}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const BriefcaseIcon = () => (
  <svg {...NAV}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

export const CapIcon = () => (
  <svg {...NAV}>
    <path d="M22 10L12 5 2 10l10 5 10-5Z" />
    <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
  </svg>
);

export const SparkIcon = () => (
  <svg {...NAV}>
    <path d="M12 3l2.2 5.6L20 10.8l-5.8 2.2L12 19l-2.2-5.9L4 10.8l5.8-2.2L12 3Z" />
  </svg>
);

export const LogoutIcon = () => (
  <svg {...NAV}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const ExternalIcon = () => (
  <svg {...NAV}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6" />
    <path d="M10 14L21 3" />
  </svg>
);

/* Tiga garis untuk tombol buka-tutup sidebar di layar sempit. */
export const MenuIcon = () => (
  <svg {...NAV}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);
