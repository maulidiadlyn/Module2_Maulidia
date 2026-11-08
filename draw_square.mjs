import fs from "node:fs";
import { createFramebuffer, fillTriangle, writePPM } from "./raster.mjs";
const fb = createFramebuffer(12, 12, [255,255,255]);
const A=[2,2], B=[8,2], C=[8,8], D=[2,8];
fillTriangle(fb,A,B,C,[50,120,190]);
fillTriangle(fb,A,C,D,[50,120,190]);
fs.mkdirSync("./out",{recursive:true});
await writePPM(fb,"./out/square_fill.ppm");
console.log("Persegi 6x6 selesai dirender dengan dua segitiga.");
