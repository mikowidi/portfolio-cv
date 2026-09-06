import { useState } from 'react';

import { apiPost, apiPut } from '../api/client.js';

// Kolom NULL-able dikirim sebagai string kosong dari form; backend yang
// menerjemahkannya kembali jadi NULL.
const EMPTY = {
  qualification: '',
  org: '',
  location: '',
  start_date: '',
  end_date: '',
  note: '',
};

const toFormValue = (education) =>
  education === null
    ? EMPTY
    : {
        qualification: education.qualification,
        org: education.org,
        location: education.location ?? '',
        start_date: education.start_date,
        end_date: education.end_date ?? '',
        note: education.note ?? '',
      };

export default function EducationForm({ education, onSaved, onCancel }) {
  const [values, setValues] = useState(() => toFormValue(education));
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
      onSaved(
        education === null
          ? await apiPost('/education', values)
          : await apiPut(`/education/${education.id}`, values),
      );
    } catch (err) {
      setFieldErrors(err.fields ?? {});
      setMessage(err.message);
      setSubmitting(false);
    }
  }

  const field = (name, label, { type = 'text' } = {}) => (
    <div>
      <label htmlFor={`edu-${name}`}>{label}</label>
      <input
        id={`edu-${name}`}
        type={type}
        value={values[name]}
        onChange={change(name)}
      />
      {fieldErrors[name] !== undefined && <span role="alert"> {fieldErrors[name]}</span>}
    </div>
  );

  return (
    <section>
      <h2>
        {education === null ? 'Education baru' : `Edit: ${education.qualification}`}
      </h2>

      <form onSubmit={handleSubmit}>
        {field('qualification', 'Jenjang / jurusan')}
        {field('org', 'Institusi')}
        {field('location', 'Lokasi')}
        {field('start_date', 'Mulai', { type: 'date' })}
        {field('end_date', 'Selesai (kosongkan kalau masih berjalan)', { type: 'date' })}
        {field('note', 'Catatan (mis. "tidak dilanjutkan")')}

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
