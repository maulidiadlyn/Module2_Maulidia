import {
  createFramebuffer,
  fillTriangle
} from "./raster.mjs";

const fb1 = createFramebuffer(10, 10);
const fb2 = createFramebuffer(10, 10);

const A = [2, 2];
const B = [8, 2];
const C = [5, 8];

fillTriangle(fb1, A, B, C, [255, 0, 0]);
fillTriangle(fb2, A, C, B, [255, 0, 0]);

let differences = 0;

for (let i = 0; i < fb1.data.length; i++) {
  if (fb1.data[i] !== fb2.data[i]) {
    differences++;
  }
}

console.log("Perbedaan pixel:", differences);
console.log("Auto-flip winding:", differences === 0 ? "BERHASIL" : "GAGAL");