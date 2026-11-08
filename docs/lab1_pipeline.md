# Lab 1 – Pipeline dan Input

Objek proyek adalah sketsa denah ilustratif kompleks Candi Prambanan di `myplan.json`.

## Alur satu garis dinding
Application membaca data titik dari JSON; vertex processing memetakan koordinat ke ruang layar; primitive assembly menghubungkan titik menjadi segmen garis; rasterisation menentukan pixel yang dilalui; fragment shading menentukan warna; per-fragment operations menangani operasi pixel; framebuffer menyimpan hasil akhir.

## Forward vs backward
Forward memproses segmen/primitif lalu menandai pixel yang dilaluinya. Backward memeriksa pixel layar dan menghitung jaraknya ke setiap segmen. Waktu aktual harus diukur pada komputer sendiri menggunakan `npm run benchmark`.
