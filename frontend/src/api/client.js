/**
 * Satu-satunya tempat `fetch` dipanggil di seluruh frontend.
 *
 * `credentials: 'include'` sudah dipasang walau task 5 belum punya cookie apa
 * pun. Alasannya bukan menyiapkan masa depan, tapi menghindari lubang: begitu
 * admin panel masuk, satu pemanggilan yang kelupaan opsi ini akan gagal dengan
 * 401 yang membingungkan. Dipasang sekali di sini, tidak bisa terlewat.
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

async function request(path) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
  } catch {
    // `fetch` hanya melempar kalau permintaannya tidak sampai sama sekali —
    // backend mati tanpa perantara, jaringan putus. Respons 4xx/5xx TIDAK masuk
    // cabang ini, dan itu sumber kebingungan yang paling sering di sekitar fetch.
    throw unreachable(0);
  }

  if (GATEWAY_STATUSES.includes(response.status)) {
    throw unreachable(response.status);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    // Bentuk error backend: { error: { code, message, fields? } }
    const err = new Error(
      body?.error?.message ?? `Permintaan gagal (${response.status}).`,
    );
    err.status = response.status;
    throw err;
  }

  return body;
}

export function apiGet(path) {
  return request(path);
}
