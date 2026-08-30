import { useState } from 'react';

import { apiPost, apiPut } from '../api/client.js';
import ListEditor from './ListEditor.jsx';

const EMPTY = { name: '', sort_order: '0', skills: [''] };

const toFormValue = (group) =>
  group === null
    ? EMPTY
    : {
        name: group.name,
        // Disimpan sebagai string karena itu yang dikembalikan <input>; diubah
        // jadi angka sekali saja, saat dikirim.
        sort_order: String(group.sort_order ?? 0),
        skills: group.skills.map((skill) => skill.name),
      };

export default function SkillGroupForm({ group, onSaved, onCancel }) {
  const [values, setValues] = useState(() => toFormValue(group));
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

    const payload = {
      name: values.name,
      // Skema backend meminta angka. `Number('')` menghasilkan 0, yang memang
      // nilai default yang diinginkan kalau kolomnya dikosongkan.
      sort_order: Number(values.sort_order),
      // Butir kosong dibuang di sini, bukan dijadikan error validasi: baris
      // kosong adalah kotak yang belum diisi, bukan kesalahan pengisi.
      skills: values.skills.map((name) => name.trim()).filter(Boolean),
    };

    try {
      onSaved(
        group === null
          ? await apiPost('/skill-groups', payload)
          : await apiPut(`/skill-groups/${group.id}`, payload),
      );
    } catch (err) {
      setFieldErrors(err.fields ?? {});
      setMessage(err.message);
      setSubmitting(false);
    }
  }

  const field = (name, label, { type = 'text' } = {}) => (
    <div>
      <label htmlFor={`grp-${name}`}>{label}</label>
      <input
        id={`grp-${name}`}
        type={type}
        value={values[name]}
        onChange={change(name)}
      />
      {fieldErrors[name] !== undefined && <span role="alert"> {fieldErrors[name]}</span>}
    </div>
  );

  return (
    <section>
      <h3>{group === null ? 'Skill group baru' : `Edit: ${group.name}`}</h3>

      <form onSubmit={handleSubmit}>
        {field('name', 'Nama grup')}
        {field('sort_order', 'Urutan tampil', { type: 'number' })}

        <ListEditor
          legend="Skills"
          itemLabel="Skill"
          addLabel="Tambah skill"
          values={values.skills}
          onChange={(skills) => setValues((current) => ({ ...current, skills }))}
          error={fieldErrors.skills}
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
