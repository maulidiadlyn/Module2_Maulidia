
import * as THREE from "three";

// =====================================
// 1. MEMBACA DATA DENAH
// =====================================

const response = await fetch("./myplan.json");

if (!response.ok) {
  throw new Error("Gagal membaca file myplan.json");
}

const plan = await response.json();

const host = document.querySelector("#scene");

// =====================================
// 2. MEMBUAT SCENE
// =====================================

const scene = new THREE.Scene();

// Warna latar disamakan dengan plan_scratch.ppm
scene.background = new THREE.Color("rgb(250, 248, 242)");

// =====================================
// 3. MEMBUAT KAMERA
// =====================================

const camera = new THREE.OrthographicCamera(
  0, 800,
  0, 600,
  0.1, 100
);

camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);

// =====================================
// 4. MEMBUAT RENDERER
// =====================================

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true,
  alpha: false
});

renderer.setPixelRatio(1);
renderer.setSize(800, 600);

// Memastikan warna hasil render menggunakan nilai RGB
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

host.appendChild(renderer.domElement);

// =====================================
// 5. MENYIAPKAN WARNA KATEGORI
// =====================================

const colorMap = Object.fromEntries(
  plan.categories.map(category => [
    category.id,
    category.color
  ])
);

// =====================================
// 6. MENGGAMBAR BANGUNAN DAN AREA
// =====================================

for (const shape of plan.filledShapes) {

  const geometryShape = new THREE.Shape();

  shape.points.forEach(([x, y], index) => {

    if (index === 0) {
      geometryShape.moveTo(x, 600 - y);
    } else {
      geometryShape.lineTo(x, 600 - y);
    }

  });

  geometryShape.closePath();

  const geometry = new THREE.ShapeGeometry(
    geometryShape
  );

  const material = new THREE.MeshBasicMaterial({
    color: colorMap[shape.category],
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(
    geometry,
    material
  );

  scene.add(mesh);
}

// =====================================
// 7. MENGGAMBAR GARIS
// =====================================

for (const line of plan.polylines) {

  const points = line.points.map(
    ([x, y]) => new THREE.Vector3(
      x,
      600 - y,
      0.1
    )
  );

  const geometry = new THREE.BufferGeometry()
    .setFromPoints(points);

  const material = new THREE.LineBasicMaterial({
    color: colorMap[line.category],
    linewidth: 2
  });

  const lineObject = new THREE.Line(
    geometry,
    material
  );

  scene.add(lineObject);
}

// =====================================
// 8. MEMBUAT LEGENDA
// =====================================

const legend = document.querySelector("#legend");

for (const category of plan.categories) {

  const item = document.createElement("div");
  item.className = "item";

  const swatch = document.createElement("span");
  swatch.className = "swatch";
  swatch.style.background = category.color;
  swatch.dataset.marker = category.marker;

  const label = document.createElement("span");
  label.textContent = category.label;

  item.append(swatch, label);

  legend.append(item);
}

// =====================================
// 9. FILTER SIMULASI DEUTERANOPIA
// =====================================

const svgFilter = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "svg"
);

svgFilter.setAttribute("aria-hidden", "true");
svgFilter.style.position = "absolute";
svgFilter.style.width = "0";
svgFilter.style.height = "0";

svgFilter.innerHTML = `
  <defs>
    <filter id="deuteranopia">
      <feColorMatrix
        type="matrix"
        values="
          0.367 0.861 -0.228 0 0
          0.280 0.673 0.047 0 0
         -0.012 0.043 0.969 0 0
          0 0 0 1 0
        "
      />
    </filter>
  </defs>
`;

document.body.appendChild(svgFilter);

// Tombol simulasi deuteranopia
document.querySelector("#cvd").addEventListener(
  "click",
  () => {
    document.body.classList.toggle("cvd-sim");
  }
);

// =====================================
// 10. EXPORT HASIL RENDER MENJADI PNG
// =====================================

document.querySelector("#export").addEventListener(
  "click",
  () => {

    renderer.render(scene, camera);

    renderer.domElement.toBlob((blob) => {

      if (!blob) {
        alert("Gagal mengekspor gambar PNG.");
        return;
      }

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "plan_three.png";

      document.body.appendChild(link);

      link.click();

      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

    }, "image/png");

  }
);

// =====================================
// 11. MENAMPILKAN HASIL RENDER
// =====================================

renderer.render(scene, camera);

console.log("Rendering Three.js berhasil.");
console.log("Resolusi: 800 x 600 pixel");
console.log("Warna latar: RGB(250, 248, 242)");
console.log("File siap diekspor: plan_three.png");
