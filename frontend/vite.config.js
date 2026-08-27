import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Proxy `/api` ke Express di :3000 selama development.
 *
 * Gunanya bukan sekadar kenyamanan: tanpa proxy, browser melihat :5173 dan
 * :3000 sebagai dua origin berbeda, sehingga butuh CORS dan cookie lintas
 * domain (`SameSite=None` + `Secure`). Dengan proxy, browser hanya pernah
 * melihat satu origin — sama persis seperti produksi, di mana Express juga
 * menyajikan hasil build ini. Konsekuensinya cookie cukup `SameSite=Lax`.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
