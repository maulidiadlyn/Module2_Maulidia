// Rasterisasi 2D: koordinat framebuffer dengan origin kiri-atas.
// Sampel setiap pixel berada pada pusat (x + 0.5, y + 0.5).

export function createFramebuffer(width, height, background = [255, 255, 255]) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error("Ukuran framebuffer harus bilangan bulat positif.");
  }
  const data = new Uint8ClampedArray(width * height * 3);
  const fb = { width, height, data };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) setPixel(fb, x, y, background);
  }
  return fb;
}

export function setPixel(fb, x, y, color) {
  if (x < 0 || y < 0 || x >= fb.width || y >= fb.height) return;
  const i = (y * fb.width + x) * 3;
  fb.data[i] = color[0]; fb.data[i + 1] = color[1]; fb.data[i + 2] = color[2];
}

export function lineDDA(fb, x0, y0, x1, y1, color = [0, 0, 0]) {
  const dx = x1 - x0, dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  if (steps === 0) { setPixel(fb, Math.round(x0), Math.round(y0), color); return; }
  const xInc = dx / steps, yInc = dy / steps;
  let x = x0, y = y0;
  for (let i = 0; i <= steps; i++) {
    setPixel(fb, Math.round(x), Math.round(y), color);
    x += xInc; y += yInc;
  }
}

export function lineBresenham(fb, x0, y0, x1, y1, color = [0, 0, 0]) {
  let x = Math.round(x0), y = Math.round(y0);
  const endX = Math.round(x1), endY = Math.round(y1);
  const dx = Math.abs(endX - x), sx = x < endX ? 1 : -1;
  const dy = -Math.abs(endY - y), sy = y < endY ? 1 : -1;
  let err = dx + dy;
  while (true) {
    setPixel(fb, x, y, color);
    if (x === endX && y === endY) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}

export function edgeFunction(ax, ay, bx, by, px, py) {
  return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
}

function isTopLeft(ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  return (dy === 0 && dx < 0) || dy > 0;
}

export function barycentric(A, B, C, P) {
  const total = edgeFunction(A[0], A[1], B[0], B[1], C[0], C[1]);
  if (total === 0) throw new Error("Segitiga degenerat tidak memiliki barycentric unik.");
  return [
    edgeFunction(B[0], B[1], C[0], C[1], P[0], P[1]) / total,
    edgeFunction(C[0], C[1], A[0], A[1], P[0], P[1]) / total,
    edgeFunction(A[0], A[1], B[0], B[1], P[0], P[1]) / total
  ];
}

export function fillTriangle(fb, A, B, C, color = [0, 0, 0], { topLeft = true } = {}) {
  let a = [...A], b = [...B], c = [...C];
  let area = edgeFunction(a[0], a[1], b[0], b[1], c[0], c[1]);
  if (area === 0) return;
  if (area < 0) { [b, c] = [c, b]; area = -area; }

  const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
  const maxX = Math.min(fb.width - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
  const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
  const maxY = Math.min(fb.height - 1, Math.ceil(Math.max(a[1], b[1], c[1])));

  const edges = [
    [b, c], [c, a], [a, b]
  ];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5, py = y + 0.5;
      const values = edges.map(([u, v]) => {
        const e = edgeFunction(u[0], u[1], v[0], v[1], px, py);
        return topLeft ? e + (isTopLeft(u[0], u[1], v[0], v[1]) ? 0 : -1e-9) : e;
      });
      if (values.every(v => v >= 0)) setPixel(fb, x, y, color);
    }
  }
}

export function writePPM(fb, path) {
  const fs = awaitableFS();
  return fs.writeFile(path, `P3\n${fb.width} ${fb.height}\n255\n` +
    Array.from({ length: fb.height }, (_, y) => {
      const row = [];
      for (let x = 0; x < fb.width; x++) {
        const i = (y * fb.width + x) * 3;
        row.push(`${fb.data[i]} ${fb.data[i + 1]} ${fb.data[i + 2]}`);
      }
      return row.join(" ");
    }).join("\n") + "\n");
}
function awaitableFS() {
  // Import statis disediakan melalui createRequire-free dynamic import.
  return { writeFile: async (path, text) => (await import("node:fs/promises")).writeFile(path, text) };
}
