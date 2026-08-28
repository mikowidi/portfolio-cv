import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Dashboard from './admin/Dashboard.jsx';
import Login from './admin/Login.jsx';
import { apiGet } from './api/client.js';
import About from './sections/About.jsx';
import Experience from './sections/Experience.jsx';
import Hero from './sections/Hero.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

function PublicPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Penanda ini mencegah setState pada komponen yang sudah dilepas. Bukan
    // kasus teoretis: StrictMode di development sengaja menjalankan effect dua
    // kali, jadi tanpa penanda, respons dari pemanggilan pertama akan menimpa
    // state setelah komponennya dibuang.
    let cancelled = false;

    // Dua endpoint ditembak paralel karena tidak saling bergantung — menunggu
    // berurutan hanya menambah satu round-trip tanpa alasan.
    Promise.all([apiGet('/profile'), apiGet('/experiences')])
      .then(([profile, experiences]) => {
        if (!cancelled) setData({ profile, experiences });
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error !== null) {
    return (
      <main>
        <h1>Gagal memuat halaman</h1>
        <p>{error.message}</p>
        <p>Muat ulang halaman setelah backend jalan.</p>
      </main>
    );
  }

  if (data === null) {
    return (
      <main>
        <p>Memuat…</p>
      </main>
    );
  }

  return (
    <main>
      <Hero profile={data.profile} />
      <About profile={data.profile} />
      <Experience experiences={data.experiences} />
    </main>
  );
}
