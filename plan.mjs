import fs from "node:fs";
export function loadPlan(path = new URL("./myplan.json", import.meta.url)) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}
export function boundsOf(points) {
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}
