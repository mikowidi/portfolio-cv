import { marked } from 'marked';

export default function About({ profile }) {
  return (
    <section>
      <h2>About Me</h2>

      {/*
        `dangerouslySetInnerHTML` di sini disengaja, dan aman dalam model
        kepercayaan Phase 1: `about_md` hanya bisa ditulis oleh satu admin
        lewat sesi yang sudah login — tidak ada jalur input dari publik.
        Kalau nanti ada teks dari pengunjung yang ikut dirender, HTML hasil
        `marked` WAJIB disanitasi dulu.
      */}
      <div dangerouslySetInnerHTML={{ __html: marked.parse(profile.about_md) }} />

      <p>
        {profile.location}
        {profile.location && profile.email && ' · '}
        {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
      </p>
    </section>
  );
}
