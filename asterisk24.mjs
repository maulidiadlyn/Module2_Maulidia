
import {
  createFramebuffer,
  lineBresenham,
  writePPM
} from "./raster.mjs";

const width = 200;
const height = 200;
const centerX = 100;
const centerY = 100;
const radius = 60;

const fb = createFramebuffer(width, height);
const lengths = [];

for (let angle = 0; angle < 360; angle += 15) {
  const radian = angle * Math.PI / 180;

  const endX = Math.round(
    centerX + radius * Math.cos(radian)
  );

  const endY = Math.round(
    centerY + radius * Math.sin(radian)
  );

  lineBresenham(
    fb,
    centerX,
    centerY,
    endX,
    endY,
    [0, 0, 0]
  );

  const dx = endX - centerX;
  const dy = endY - centerY;
  const length = Math.sqrt(dx * dx + dy * dy);

  lengths.push(length);

  console.log(
    `Sudut ${angle}°: panjang ${length.toFixed(2)} pixel`
  );
}

await writePPM(fb, "out/asterisk24.ppm");

const minLength = Math.min(...lengths);
const maxLength = Math.max(...lengths);

console.log("\nJumlah jari-jari:", lengths.length);
console.log("Panjang minimum:", minLength.toFixed(2));
console.log("Panjang maksimum:", maxLength.toFixed(2));
console.log(
  "Selisih panjang:",
  (maxLength - minLength).toFixed(2)
);
console.log(
  "Hasil:",
  maxLength - minLength <= 1
    ? "LOLOS"
    : "PERLU DIPERIKSA"
);

console.log("Gambar tersimpan di out/asterisk24.ppm");
