
const x0 = 1;
const y0 = 1;
const x1 = 3;
const y1 = 3;

function testCenter() {
  const pixels = [];

  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const px = x + 0.5;
      const py = y + 0.5;

      if (px >= x0 && px < x1 && py >= y0 && py < y1) {
        pixels.push([x, y]);
      }
    }
  }

  return pixels;
}

function testCorner() {
  const pixels = [];

  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
        pixels.push([x, y]);
      }
    }
  }

  return pixels;
}

console.log("Sample-centre:", testCenter());
console.log("Jumlah pixel:", testCenter().length);

console.log("Sample-corner:", testCorner());
console.log("Jumlah pixel:", testCorner().length);
