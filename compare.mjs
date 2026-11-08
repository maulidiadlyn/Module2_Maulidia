
import fs from "node:fs";
import zlib from "node:zlib";

// Membaca gambar PPM P3
function readPPM(path) {
  const tokens = fs.readFileSync(path, "utf8")
    .replace(/#[^\n]*/g, "")
    .trim()
    .split(/\s+/);

  if (tokens[0] !== "P3") {
    throw new Error("Format PPM harus P3.");
  }

  const width = Number(tokens[1]);
  const height = Number(tokens[2]);
  const max = Number(tokens[3]);

  const values = tokens.slice(4).map(Number);

  if (values.length !== width * height * 3) {
    throw new Error("Data pixel PPM tidak lengkap.");
  }

  const data = new Uint8Array(values.length);

  for (let i = 0; i < values.length; i++) {
    data[i] = Math.round(values[i] * 255 / max);
  }

  return { width, height, data };
}

// Membaca gambar PNG 8-bit non-interlaced
function readPNG(path) {
  const buffer = fs.readFileSync(path);

  const signature = Buffer.from([
    137, 80, 78, 71, 13, 10, 26, 10
  ]);

  if (!buffer.subarray(0, 8).equals(signature)) {
    throw new Error("File bukan PNG yang valid.");
  }

  let width, height, bitDepth, colorType, interlace;
  const compressed = [];

  let offset = 8;

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const chunk = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = chunk.readUInt32BE(0);
      height = chunk.readUInt32BE(4);
      bitDepth = chunk[8];
      colorType = chunk[9];
      interlace = chunk[12];
    }

    if (type === "IDAT") {
      compressed.push(chunk);
    }

    offset += 12 + length;

    if (type === "IEND") break;
  }

  if (bitDepth !== 8 || interlace !== 0) {
    throw new Error("PNG harus 8-bit dan non-interlaced.");
  }

  const channels = {
    0: 1,
    2: 3,
    4: 2,
    6: 4
  }[colorType];

  if (!channels) {
    throw new Error("Jenis warna PNG tidak didukung.");
  }

  const bytesPerPixel = channels;
  const stride = width * channels;

  const raw = zlib.inflateSync(Buffer.concat(compressed));

  const decoded = Buffer.alloc(height * stride);

  let pos = 0;

  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];

    for (let x = 0; x < stride; x++) {
      const value = raw[pos++];

      const left = x >= bytesPerPixel
        ? decoded[y * stride + x - bytesPerPixel]
        : 0;

      const up = y > 0
        ? decoded[(y - 1) * stride + x]
        : 0;

      const upperLeft = y > 0 && x >= bytesPerPixel
        ? decoded[(y - 1) * stride + x - bytesPerPixel]
        : 0;

      let result;

      if (filter === 0) {
        result = value;
      } else if (filter === 1) {
        result = value + left;
      } else if (filter === 2) {
        result = value + up;
      } else if (filter === 3) {
        result = value + Math.floor((left + up) / 2);
      } else if (filter === 4) {
        const p = left + up - upperLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upperLeft);

        const predictor =
          pa <= pb && pa <= pc ? left :
          pb <= pc ? up : upperLeft;

        result = value + predictor;
      } else {
        throw new Error("Filter PNG tidak dikenal.");
      }

      decoded[y * stride + x] = result & 255;
    }
  }

  // Mengubah semua format warna menjadi RGB
  const data = new Uint8Array(width * height * 3);

  for (let i = 0; i < width * height; i++) {
    let r, g, b, alpha = 255;

    if (colorType === 0) {
      r = g = b = decoded[i];
    } else if (colorType === 2) {
      r = decoded[i * 3];
      g = decoded[i * 3 + 1];
      b = decoded[i * 3 + 2];
    } else if (colorType === 4) {
      r = g = b = decoded[i * 2];
      alpha = decoded[i * 2 + 1];
    } else {
      r = decoded[i * 4];
      g = decoded[i * 4 + 1];
      b = decoded[i * 4 + 2];
      alpha = decoded[i * 4 + 3];
    }

    // PNG transparan dikomposisikan ke latar putih
    const j = i * 3;
    data[j] = Math.round((r * alpha + 255 * (255 - alpha)) / 255);
    data[j + 1] = Math.round((g * alpha + 255 * (255 - alpha)) / 255);
    data[j + 2] = Math.round((b * alpha + 255 * (255 - alpha)) / 255);
  }

  return { width, height, data };
}

// Membaca kedua gambar
const a = readPPM("out/plan_scratch.ppm");
const b = readPNG("plan_three.png");

if (a.width !== b.width || a.height !== b.height) {
  throw new Error("Ukuran kedua gambar berbeda.");
}

// Membandingkan pixel
let identical = 0;
let sumSquaredError = 0;

const diffData = new Uint8Array(a.data.length);

for (let i = 0; i < a.data.length; i += 3) {
  let pixelSame = true;

  for (let c = 0; c < 3; c++) {
    const difference = Math.abs(a.data[i + c] - b.data[i + c]);

    if (difference !== 0) pixelSame = false;

    sumSquaredError += difference * difference;
    diffData[i + c] = Math.min(255, difference * 4);
  }

  if (pixelSame) identical++;
}

const totalPixels = a.width * a.height;
const percentage = identical / totalPixels * 100;
const mse = sumSquaredError / a.data.length;

const psnr = mse === 0
  ? Infinity
  : 10 * Math.log10(255 * 255 / mse);

// Menyimpan gambar perbedaan dalam format PPM
const diffRows = [];

for (let y = 0; y < a.height; y++) {
  const row = [];

  for (let x = 0; x < a.width; x++) {
    const i = (y * a.width + x) * 3;

    row.push(
      `${diffData[i]} ${diffData[i + 1]} ${diffData[i + 2]}`
    );
  }

  diffRows.push(row.join(" "));
}

fs.writeFileSync(
  "out/difference.ppm",
  `P3\n${a.width} ${a.height}\n255\n${diffRows.join("\n")}\n`
);

// Menampilkan hasil
console.log("========== HASIL PERBANDINGAN ==========");
console.log(`Resolusi: ${a.width} x ${a.height}`);
console.log(`Total pixel: ${totalPixels}`);
console.log(`Pixel identik: ${identical}`);
console.log(`Persentase identik: ${percentage.toFixed(2)}%`);
console.log(`MSE: ${mse.toFixed(4)}`);
console.log(`PSNR: ${psnr === Infinity ? "Infinity" : psnr.toFixed(2) + " dB"}`);
console.log("Difference image: out/difference.ppm");
console.log("========================================");
