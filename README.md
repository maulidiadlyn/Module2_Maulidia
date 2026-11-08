# Modul 2 – Rendering Pipeline & Primitif 2D

Proyek praktikum Grafika Komputer. Implementasi inti dibuat dengan JavaScript (Node.js), sedangkan visualisasi pustaka menggunakan Three.js.

## Persiapan
1. Instal Node.js versi LTS.
2. Ekstrak ZIP.
3. Buka folder `Module2_Maulidia` di VS Code.
4. Buka terminal dan jalankan:

```bash
npm install
npm test
```

## Menjalankan proyek
```bash
npm run render       # menghasilkan out/plan_scratch.ppm
npm run square       # menghasilkan out/square_fill.ppm
npm run benchmark    # mengukur pendekatan forward dan backward
npm run serve        # membuka viewer Three.js di browser
```

Setelah `npm run serve`, buka URL lokal yang ditampilkan terminal. Viewer memerlukan koneksi internet untuk memuat Three.js dari CDN.

## Isi proyek
- `raster.mjs`: framebuffer, DDA, Bresenham, edge function, barycentric, top-left triangle fill.
- `tests.mjs`: pengujian otomatis.
- `myplan.json`: sketsa denah 2D ilustratif untuk proyek ini.
- `plan.mjs` dan `draw_plan.mjs`: konversi dan render denah.
- `web/`: viewer Three.js dan legenda.
- `docs/`: catatan awal untuk laporan praktikum.

## Catatan akademik
Denah di `myplan.json` adalah sketsa ilustratif untuk latihan grafika, bukan gambar arsitektur hasil pengukuran resmi Candi Prambanan. Sesuaikan/validasi geometri berdasarkan referensi yang benar-benar Anda gunakan. Angka benchmark harus diambil dari komputer sendiri; jangan menyalin angka contoh dari perangkat lain.
