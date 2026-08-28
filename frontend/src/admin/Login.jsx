import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiPost } from '../api/client.js';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiPost('/auth/login', { username, password });

      // `replace` supaya tombol Back tidak mengembalikan ke form login yang
      // sudah tidak berlaku setelah cookie terpasang.
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <main className="admin login">
      <h1>Login Admin</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error !== null && <p role="alert">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Masuk…' : 'Masuk'}
        </button>
      </form>
    </main>
  );
}
