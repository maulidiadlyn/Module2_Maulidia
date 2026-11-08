import assert from "node:assert/strict";
import { createFramebuffer, lineDDA, lineBresenham, edgeFunction, barycentric, fillTriangle } from "./raster.mjs";

const expected = [[2,1],[3,2],[4,2],[5,3],[6,3],[7,4],[8,4],[9,5]];
function pixels(fb) {
  const out=[];
  for(let y=0;y<fb.height;y++) for(let x=0;x<fb.width;x++) {
    const i=(y*fb.width+x)*3;
    if(fb.data[i]===0 && fb.data[i+1]===0 && fb.data[i+2]===0) out.push([x,y]);
  }
  return out;
}
for (const fn of [lineDDA,lineBresenham]) {
  const fb=createFramebuffer(12,10,[255,255,255]); fn(fb,2,1,9,5,[0,0,0]);
  assert.deepEqual(pixels(fb),expected);
}
assert.equal(edgeFunction(1,1,6,2,3,7),28);
assert.deepEqual([edgeFunction(1,1,6,2,3,3),edgeFunction(6,2,3,7,3,3),edgeFunction(3,7,1,1,3,3)],[8,12,8]);
assert.deepEqual([edgeFunction(1,1,6,2,5,5),edgeFunction(6,2,3,7,5,5),edgeFunction(3,7,1,1,5,5)],[16,-4,16]);
assert.deepEqual([edgeFunction(1,1,6,2,1,4),edgeFunction(6,2,3,7,1,4),edgeFunction(3,7,1,1,1,4)],[15,19,-6]);
const bc=barycentric([1,1],[6,2],[3,7],[3,3]);
assert.ok(Math.abs(bc[0]-3/7)<1e-9 && Math.abs(bc[1]-2/7)<1e-9 && Math.abs(bc[2]-2/7)<1e-9);
assert.ok(Math.abs(bc.reduce((a,b)=>a+b,0)-1)<1e-9);
const fb=createFramebuffer(12,12,[255,255,255]);
fillTriangle(fb,[2,2],[8,2],[8,8],[0,0,0]);
fillTriangle(fb,[2,2],[8,8],[2,8],[0,0,0]);
let count=0;
for(let i=0;i<fb.data.length;i+=3) if(fb.data[i]===0) count++;
assert.equal(count,36);
const reversed=createFramebuffer(12,12,[255,255,255]);
fillTriangle(reversed,[8,8],[8,2],[2,2],[0,0,0]);
let reversedCount=0; for(let i=0;i<reversed.data.length;i+=3) if(reversed.data[i]===0) reversedCount++;
assert.ok(reversedCount>0);
console.log("ALL CHECKS PASSED (8 kelompok pengujian).");
