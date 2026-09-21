import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
// tokens.css lebih dulu: dua file di bawahnya membaca custom property dari
// sana, dan sebuah property harus sudah terdefinisi sebelum aturan yang
// memakainya diurai.
import './tokens.css';
import './base.css';
import './public.css';
import './public-frame.css';
import './admin-layout.css';
import './admin-nav.css';
import './admin.css';
import './admin-list.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
