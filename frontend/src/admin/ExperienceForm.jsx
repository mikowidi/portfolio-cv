import { useState } from 'react';

import { apiPost, apiPut } from '../api/client.js';
import ListEditor from './ListEditor.jsx';

const EMPLOYMENT_TYPES = [
  ['full_time', 'Full time'],
  ['part_time', 'Part time'],
  ['contract', 'Kontrak'],
  ['internship', 'Magang'],
  ['freelance', 'Freelance'],
];

// Kolom NULL-able dikirim sebagai string kosong dari form; backend yang
// menerjemahkannya kembali jadi NULL.
const EMPTY = {
  position: '',
  org: '',
  location: '',
  employment_type: 'full_time',
  start_date: '',
  end_date: '',
  summary: '',
  highlights: [''],
};

const toFormValue = (experience) =>
  experience === null
    ? EMPTY
    : {
        position: experience.position,
        org: experience.org,
        location: experience.location ?? '',
        employment_type: experience.employment_type,
        start_date: experience.start_date,
        end_date: experience.end_date ?? '',
        summary: experience.summary ?? '',
        highlights: experience.highlights.map((highlight) => highlight.body),
      };

export default function ExperienceForm({ experience, onSaved, onCancel }) {
  const [values, setValues] = useState(() => toFormValue(experience));
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

    // Butir kosong dibuang di sini, bukan dijadikan error validasi: baris
    // kosong adalah kotak yang belum diisi, bukan kesalahan pengisi.
    const payload = {
      ...values,
      highlights: values.highlights.map((body) => body.trim()).filter(Boolean),
    };

    try {
      onSaved(
        experience === null
          ? await apiPost('/experiences', payload)
          : await apiPut(`/experiences/${experience.id}`, payload),
      );
    } catch (err) {
      setFieldErrors(err.fields ?? {});
      setMessage(err.message);
      setSubmitting(false);
    }
  }

  const field = (name, label, { type = 'text', textarea = false, rows = 2 } = {}) => (
    <div>
      <label htmlFor={`exp-${name}`}>{label}</label>
      {textarea ? (
        <textarea
          id={`exp-${name}`}
          rows={rows}
          value={values[name]}
          onChange={change(name)}
        />
      ) : (
        <input
          id={`exp-${name}`}
          type={type}
          value={values[name]}
          onChange={change(name)}
        />
      )}
      {fieldErrors[name] !== undefined && <span role="alert"> {fieldErrors[name]}</span>}
    </div>
  );

  return (
    <section>
      <h2>{experience === null ? 'Experience baru' : `Edit: ${experience.position}`}</h2>

      <form onSubmit={handleSubmit}>
        {field('position', 'Posisi')}
        {field('org', 'Organisasi')}
        {field('location', 'Lokasi')}

        <div>
          <label htmlFor="exp-employment_type">Jenis</label>
          <select
            id="exp-employment_type"
            value={values.employment_type}
            onChange={change('employment_type')}
          >
            {EMPLOYMENT_TYPES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {field('start_date', 'Mulai', { type: 'date' })}
        {field('end_date', 'Selesai (kosongkan kalau masih berjalan)', { type: 'date' })}
        {field('summary', 'Ringkasan', { textarea: true })}

        <ListEditor
          legend="Highlights"
          itemLabel="Highlight"
          addLabel="Tambah highlight"
          multiline
          values={values.highlights}
          onChange={(highlights) => setValues((current) => ({ ...current, highlights }))}
          error={fieldErrors.highlights}
        />

        {message !== null && <p role="alert">{message}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Menyimpan…' : 'Simpan'}
        </button>
        <button type="button" onClick={onCancel}>
          Batal
        </button>
      </form>
    </section>
  );
}
