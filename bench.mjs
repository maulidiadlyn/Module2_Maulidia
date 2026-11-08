import { performance } from "node:perf_hooks";
const segments = Array.from({length:80},(_,i)=>({x1:20+i*3,y1:30+(i%12)*20,x2:120+i*3,y2:100+(i%12)*20}));
const W=800,H=600;
function forward() {
  let n=0;
  for(const s of segments) {
    const steps=Math.max(Math.abs(s.x2-s.x1),Math.abs(s.y2-s.y1));
    for(let k=0;k<=steps;k++) { const x=s.x1+(s.x2-s.x1)*k/steps; const y=s.y1+(s.y2-s.y1)*k/steps; if(x>=0&&x<W&&y>=0&&y<H)n++; }
  }
  return n;
}
function backward() {
  let n=0;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) for(const s of segments) {
    const dx=s.x2-s.x1,dy=s.y2-s.y1;
    const t=Math.max(0,Math.min(1,((x-s.x1)*dx+(y-s.y1)*dy)/(dx*dx+dy*dy)));
    const px=s.x1+t*dx,py=s.y1+t*dy;
    if((x-px)**2+(y-py)**2<1)n++;
  }
  return n;
}
for(const [name,fn] of [["Forward",forward],["Backward",backward]]) {
  const t=performance.now(); const result=fn(); const ms=performance.now()-t;
  console.log(`${name}: ${ms.toFixed(2)} ms (hit count ${result})`);
}
console.log("Catat hasil pada komputer sendiri; waktu dipengaruhi CPU dan beban sistem.");
