import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ---------------------------------------------------------------------------
// Renderer / scene / camera
// ---------------------------------------------------------------------------
const bg = document.getElementById('bg');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070d, 0.055);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 6.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
bg.appendChild(renderer.domElement);

// ---------------------------------------------------------------------------
// Hero core (icosahedron + wireframe overlay)
// ---------------------------------------------------------------------------
const core = new THREE.Group();
scene.add(core);

const coreMesh = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.35, 0),
  new THREE.MeshStandardMaterial({
    color: 0x0b0e14, metalness: 0.9, roughness: 0.15,
    emissive: 0x4f9dff, emissiveIntensity: 0.28
  })
);
core.add(coreMesh);

const wire = new THREE.Mesh(
  coreMesh.geometry,
  new THREE.MeshBasicMaterial({ color: 0x7af6ff, wireframe: true, transparent: true, opacity: 0.22 })
);
wire.scale.setScalar(1.03);
core.add(wire);

// ---------------------------------------------------------------------------
// Web filaments (Spidey motif) — tubes arcing from core to halo, flex on loop
// ---------------------------------------------------------------------------
const filaments = [];
const FILAMENT_COUNT = 12;
const haloRadius = 2.6;
for (let i = 0; i < FILAMENT_COUNT; i++) {
  const a = (i / FILAMENT_COUNT) * Math.PI * 2;
  const group = new THREE.Group();
  group.rotation.y = a;
  const anchor = new THREE.Vector3(0, haloRadius * Math.sin(a), haloRadius * Math.cos(a) * 0.4);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.6, haloRadius * 0.5, 0),
    anchor
  ]);
  const geo = new THREE.TubeGeometry(curve, 40, 0.012, 6, false);
  const mat = new THREE.MeshBasicMaterial({ color: 0x7af6ff, transparent: true, opacity: 0.5 });
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);
  core.add(group);
  filaments.push({ group, mat, phase: i * 0.5 });
}

// ---------------------------------------------------------------------------
// Golden halo (Prabhas motif) — torus ring, slow rotation
// ---------------------------------------------------------------------------
const halo = new THREE.Mesh(
  new THREE.TorusGeometry(haloRadius, 0.06, 16, 120),
  new THREE.MeshStandardMaterial({ color: 0xffb86b, metalness: 1, roughness: 0.3, emissive: 0x6b3b00, emissiveIntensity: 0.4 })
);
halo.rotation.x = Math.PI / 2.3;
core.add(halo);

// ---------------------------------------------------------------------------
// Particle dust field (cyan + gold mix, additive)
// ---------------------------------------------------------------------------
const N = 3000;
const pos = new Float32Array(N * 3);
const col = new Float32Array(N * 3);
const cA = new THREE.Color(0x7af6ff), cB = new THREE.Color(0xffb86b);
for (let i = 0; i < N; i++) {
  pos[i*3]   = (Math.random() - 0.5) * 30;
  pos[i*3+1] = (Math.random() - 0.5) * 30;
  pos[i*3+2] = (Math.random() - 0.5) * 30;
  const c = Math.random() > 0.5 ? cA : cB;
  col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
}
const pg = new THREE.BufferGeometry();
pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
const particles = new THREE.Points(pg, new THREE.PointsMaterial({
  size: 0.035, vertexColors: true, transparent: true, opacity: 0.6,
  blending: THREE.AdditiveBlending, depthWrite: false
}));
scene.add(particles);

// ---------------------------------------------------------------------------
// Lighting (cinematic key + cyan rim + gold fill)
// ---------------------------------------------------------------------------
scene.add(new THREE.AmbientLight(0x223044, 0.6));
const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(-3, 4, 3); scene.add(key);
const rim = new THREE.PointLight(0x7af6ff, 2.2, 22); rim.position.set(0, 0, -3); scene.add(rim);
const gold = new THREE.PointLight(0xffb86b, 1.4, 22); gold.position.set(3, -2, 2); scene.add(gold);

// ---------------------------------------------------------------------------
// Post-processing: bloom = the cinematic glow
// ---------------------------------------------------------------------------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.85, 0.45, 0.82));

// ---------------------------------------------------------------------------
// Scroll progress (camera dolly + reveal = pure function of scroll)
// ---------------------------------------------------------------------------
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let target = 0, cur = 0;
function computeScroll() {
  const h = document.body.scrollHeight - innerHeight;
  target = h > 0 ? Math.min(Math.max(scrollY / h, 0), 1) : 0;
}
addEventListener('scroll', computeScroll, { passive: true });
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
  computeScroll();
});
computeScroll();

// ---------------------------------------------------------------------------
// Chapter text highlights + reveal cards
// ---------------------------------------------------------------------------
const chapters = ['home', 'about', 'work', 'craft', 'owner'];
const navLinks = [...document.querySelectorAll('#nav a[data-target]')];
const revealEls = [...document.querySelectorAll('.reveal')];
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.25 });
revealEls.forEach(el => io.observe(el));

function updateNav() {
  const mid = scrollY + innerHeight / 2;
  let active = chapters[0];
  for (const id of chapters) {
    const sec = document.getElementById(id);
    if (sec && sec.offsetTop <= mid) active = id;
  }
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.target === active));
}
addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ---------------------------------------------------------------------------
// Animation loop
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();
function tick() {
  const t = clock.getElapsedTime();
  cur += (target - cur) * 0.08; // weighted ease

  if (!reduce) {
    coreMesh.rotation.y += 0.0025; coreMesh.rotation.x += 0.0009;
    halo.rotation.z += 0.003;
    particles.rotation.y += 0.0003;
    // filament flex (swing like cables)
    filaments.forEach((f, i) => {
      f.group.rotation.x = Math.sin(t * 0.8 + f.phase) * 0.12;
      f.mat.opacity = 0.4 + Math.sin(t * 1.5 + f.phase) * 0.15;
    });
  }

  // Scroll-driven: push camera into core, brighten wireframe, face the halo
  camera.position.z = 6.5 - cur * 4.8;
  camera.position.y = cur * 0.6;
  wire.material.opacity = 0.22 + cur * 0.45;
  halo.rotation.x = Math.PI / 2.3 - cur * 0.6;
  core.rotation.y = cur * 1.2;

  composer.render();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
