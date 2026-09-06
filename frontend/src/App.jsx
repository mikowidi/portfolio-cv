import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Dashboard from './admin/Dashboard.jsx';
import Login from './admin/Login.jsx';
import { apiGet } from './api/client.js';
import About from './sections/About.jsx';
import Education from './sections/Education.jsx';
import Experience from './sections/Experience.jsx';
import Hero from './sections/Hero.jsx';
import Skills from './sections/Skills.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        {/* `/admin/*` karena Dashboard memasang rute anaknya sendiri, satu per
            item sidebar. `/admin/login` ditulis terpisah dan tetap menang:
            React Router memilih rute paling spesifik, bukan yang paling atas. */}
        <Route path="/admin/*" element={<Dashboard />} />
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

    // Empat endpoint ditembak paralel karena tidak saling bergantung —
    // menunggu berurutan hanya menambah tiga round-trip tanpa alasan.
    // `Promise.all` juga menolak begitu SATU gagal, jadi halaman tidak pernah
    // tampil setengah terisi: entah lengkap, entah status gagal.
    Promise.all([
      apiGet('/profile'),
      apiGet('/experiences'),
      apiGet('/education'),
      apiGet('/skills'),
    ])
      .then(([profile, experiences, education, skillGroups]) => {
        if (!cancelled) setData({ profile, experiences, education, skillGroups });
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
    // `page` menandai halaman publik yang sudah terisi. Tata letak dua kolom
    // dipasang pada kelas ini, BUKAN pada `main` telanjang — /admin juga memakai
    // <main>, dan aturan yang tidak bernama akan ikut merombak admin panel.
    <main className="page">
      {/* Hero tetap anak langsung <main> supaya dia jadi kolom kiri grid dan
          bisa `position: sticky`. Empat section sisanya dibungkus `.pane` agar
          jadi SATU kolom kanan yang bergulir — tanpa pembungkus, keempatnya
          akan jadi empat sel grid terpisah. */}
      <Hero profile={data.profile} />

      <div className="pane">
        <About profile={data.profile} />
        <Experience experiences={data.experiences} />
        <Education education={data.education} />
        <Skills skillGroups={data.skillGroups} />
      </div>
    </main>
  );
}
