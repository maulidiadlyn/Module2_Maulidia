// Catatan: compare.mjs menghitung MSE dan PSNR sederhana untuk PPM P3.
export function psnr(mse, peak = 255) {
  return mse === 0 ? Infinity : 10 * Math.log10((peak * peak) / mse);
}
