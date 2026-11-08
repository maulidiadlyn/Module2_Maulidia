// Demonstrasi konseptual shared-edge: tanpa aturan top-left, titik pada diagonal
// dapat diklaim kedua segitiga jika memakai >= 0; dengan > 0 dapat tidak diklaim.
import { edgeFunction } from "./raster.mjs";
const A=[2,2], B=[8,2], C=[8,8], D=[2,8], P=[4.5,4.5];
const t1=[edgeFunction(A[0],A[1],B[0],B[1],...P), edgeFunction(B[0],B[1],C[0],C[1],...P), edgeFunction(C[0],C[1],A[0],A[1],...P)];
const t2=[edgeFunction(A[0],A[1],C[0],C[1],...P), edgeFunction(C[0],C[1],D[0],D[1],...P), edgeFunction(D[0],D[1],A[0],A[1],...P)];
console.log("Sampel pada shared edge:", P);
console.log("Nilai edge segitiga 1:", t1);
console.log("Nilai edge segitiga 2:", t2);
console.log("Edge bersama bernilai 0; aturan top-left menentukan pemilik tunggalnya.");
