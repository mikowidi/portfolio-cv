import { useState } from 'react';

import { apiPut } from '../api/client.js';

// Kolom NULL-able di database dikirim sebagai string kosong dari form; backend
// yang menerjemahkannya kembali jadi NULL.
const toFormValue = (profile) => ({
  full_name: profile.full_name,
  headline: profile.headline,
  hero_statement: profile.hero_statement,
  about_md: profile.about_md,
  location: profile.location ?? '',
  email: profile.email ?? '',
  photo_url: profile.photo_url ?? '',
});

export default function ProfileForm({ profile, onSaved }) {
  const [values, setValues] = useState(() => toFormValue(profile));
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const change = (name) => (event) =>
    setValues((current) => ({ ...current, [name]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setMessage(null);

    try {
      const saved = await apiPut('/profile', values);
      setValues(toFormValue(saved));
      onSaved(saved);
      setMessage('Profil tersimpan.');
    } catch (err) {
      setFieldErrors(err.fields ?? {});
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const field = (name, label, { textarea = false, rows = 3 } = {}) => (
    <div>
      <label htmlFor={`profile-${name}`}>{label}</label>
      {textarea ? (
        <textarea
          id={`profile-${name}`}
          rows={rows}
          value={values[name]}
          onChange={change(name)}
        />
      ) : (
        <input id={`profile-${name}`} value={values[name]} onChange={change(name)} />
      )}
      {fieldErrors[name] !== undefined && <span role="alert"> {fieldErrors[name]}</span>}
    </div>
  );

  return (
    <section>
      <h1>Profil</h1>

      <form onSubmit={handleSubmit}>
        {field('full_name', 'Nama lengkap')}
        {field('headline', 'Headline')}
        {field('hero_statement', 'Hero statement', { textarea: true, rows: 2 })}
        {field('about_md', 'About (Markdown)', { textarea: true, rows: 10 })}
        {field('location', 'Lokasi')}
        {field('email', 'Email')}
        {field('photo_url', 'URL foto')}

        {message !== null && <p role="status">{message}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Menyimpan…' : 'Simpan profil'}
        </button>
      </form>
    </section>
  );
}
