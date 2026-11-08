import fs from "node:fs";
import { createFramebuffer, lineBresenham, fillTriangle, writePPM } from "./raster.mjs";
import { loadPlan } from "./plan.mjs";

const plan = loadPlan();
const W = plan.canvas.width, H = plan.canvas.height;
const fb = createFramebuffer(W, H, [250, 248, 242]);
const colors = Object.fromEntries(plan.categories.map(c => [c.id, hex(c.color)]));
function hex(s) { return [1,3,5].map(i => parseInt(s.slice(i,i+2),16)); }

for (const shape of plan.filledShapes) {
  const pts = shape.points, color = colors[shape.category];
  for (let i = 1; i < pts.length - 1; i++) fillTriangle(fb, pts[0], pts[i], pts[i+1], color);
}
for (const line of plan.polylines) {
  const color = colors[line.category], pts = line.points;
  for (let i = 0; i < pts.length - 1; i++) lineBresenham(fb, ...pts[i], ...pts[i+1], color);
}
fs.mkdirSync("./out", { recursive: true });
await writePPM(fb, "./out/plan_scratch.ppm");
console.log(`Render selesai: ${W}x${H}, ${plan.polylines.length} polyline -> out/plan_scratch.ppm`);
