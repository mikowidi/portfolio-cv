/**
 * Satu-satunya tempat `fetch` dipanggil di seluruh frontend.
 *
 * `credentials: 'include'` dipasang sekali di sini, bukan di tiap pemanggilan.
 * Satu pemanggilan yang kelupaan opsi ini akan gagal 401 dengan sebab yang
 * sulit dilacak — dan itu justru paling mungkin terjadi di admin panel.
 */

const BASE_URL = '/api/v1';

const UNREACHABLE_MESSAGE =
  'Tidak bisa menghubungi server. Pastikan backend jalan di port 3000.';

// Status yang berasal dari perantara — proxy Vite saat development, reverse
// proxy saat produksi — dan artinya backend-nya sendiri tidak menjawab. Beda
// dari 4xx/5xx biasa: yang gagal bukan permintaannya, tapi sambungannya.
const GATEWAY_STATUSES = [502, 503, 504];

function unreachable(status) {
  const err = new Error(UNREACHABLE_MESSAGE);
  err.status = status;
  return err;
}

async function request(path, { method = 'GET', body } = {}) {
  const options = {
    method,
    credentials: 'include',
    headers: { Accept: 'application/json' },
  };

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, options);
  } catch {
    // `fetch` hanya melempar kalau permintaannya tidak sampai sama sekali —
    // backend mati tanpa perantara, jaringan putus. Respons 4xx/5xx TIDAK masuk
    // cabang ini, dan itu sumber kebingungan yang paling sering di sekitar fetch.
    throw unreachable(0);
  }

  if (GATEWAY_STATUSES.includes(response.status)) {
    throw unreachable(response.status);
  }

  // 204 tidak punya body sama sekali; memanggil .json() di sini akan melempar.
  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    // Bentuk error backend: { error: { code, message, fields? } }
    const err = new Error(
      payload?.error?.message ?? `Permintaan gagal (${response.status}).`,
    );
    err.status = response.status;

    // Dipakai form untuk menempelkan pesan di field yang bersangkutan.
    err.fields = payload?.error?.fields ?? null;
    throw err;
  }

  return payload;
}

export function apiGet(path) {
  return request(path);
}

export function apiPost(path, body) {
  return request(path, { method: 'POST', body });
}

export function apiPut(path, body) {
  return request(path, { method: 'PUT', body });
}

export function apiDelete(path) {
  return request(path, { method: 'DELETE' });
}
