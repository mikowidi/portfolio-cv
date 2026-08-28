/**
 * Membungkus satu skema zod jadi middleware Express.
 *
 * Dipasang di routes, sebelum controller. Kalau body tidak lolos, controller
 * tidak pernah dipanggil sama sekali — jadi controller boleh menganggap
 * `req.body` sudah bersih dan tidak perlu memeriksa apa pun lagi.
 */

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const err = new Error('Data yang dikirim tidak valid.');
      err.status = 400;
      err.code = 'VALIDATION_FAILED';
      err.fields = collectFields(result.error);
      return next(err);
    }

    // Body diganti hasil parse, bukan sekadar divalidasi: nilainya sudah
    // dipangkas dan bertipe benar, dan field yang tidak ada di skema ikut
    // terbuang — jadi field liar tidak bisa menyelinap ke query di bawahnya.
    req.body = result.data;
    next();
  };
}

/** Mengubah issue zod jadi { namaField: pesan } sesuai bentuk error bagian 4. */
function collectFields(error) {
  const fields = {};

  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';

    // Satu pesan per field: yang pertama sudah cukup untuk ditampilkan di form.
    if (!(key in fields)) fields[key] = issue.message;
  }

  return fields;
}
