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
// ARC REACTOR hero (JARVIS) — central core + assembled metallic ring segments
// ---------------------------------------------------------------------------
const core = new THREE.Group();
scene.add(core);

// Central glowing core (the reactor heart)
const coreMesh = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.0, 1),
  new THREE.MeshStandardMaterial({
    color: 0x0b0e14, metalness: 0.95, roughness: 0.1,
    emissive: 0x7af6ff, emissiveIntensity: 0.5
  })
);
core.add(coreMesh);

// Inner bright plasma sphere (bloom source)
const plasma = new THREE.Mesh(
  new THREE.SphereGeometry(0.62, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xaef6ff })
);
core.add(plasma);

// Wireframe shell
const shell = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.05, 1),
  new THREE.MeshBasicMaterial({ color: 0x7af6ff, wireframe: true, transparent: true, opacity: 0.3 })
);
core.add(shell);

// Metallic arc-ring segments — start scattered, assemble into a torus on scroll
const HALO_R = 2.6;
const SEGMENTS = 24;
const ring = new THREE.Group();
core.add(ring);
const segGeo = new THREE.BoxGeometry(0.5, 0.12, 0.16);
const segMat = new THREE.MeshStandardMaterial({ color: 0xb9c6e0, metalness: 1, roughness: 0.25, emissive: 0x123a55, emissiveIntensity: 0.3 });
const segTargets = [];   // final assembled transform
const segStarts = [];     // scattered start transform
for (let i = 0; i < SEGMENTS; i++) {
  const a = (i / SEGMENTS) * Math.PI * 2;
  const m = new THREE.Mesh(segGeo, segMat);
  const finalPos = new THREE.Vector3(Math.cos(a) * HALO_R, Math.sin(a) * HALO_R * 0.35, 0);
  const finalRot = new THREE.Euler(0, 0, a + Math.PI / 2);
  segTargets.push({ pos: finalPos, rot: finalRot });
  // scattered start: far out, random tilt
  const r = 5 + Math.random() * 3;
  segStarts.push({
    pos: new THREE.Vector3(Math.cos(a) * r, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6),
    rot: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6)
  });
  ring.add(m);
}

// ---------------------------------------------------------------------------
// Web filaments (Spidey motif) — red+blue energy strands radiating from core
// ---------------------------------------------------------------------------
const filaments = [];
const FILAMENT_COUNT = 14;
for (let i = 0; i < FILAMENT_COUNT; i++) {
  const a = (i / FILAMENT_COUNT) * Math.PI * 2;
  const group = new THREE.Group();
  group.rotation.y = a;
  const anchor = new THREE.Vector3(0, HALO_R * Math.sin(a), HALO_R * Math.cos(a) * 0.45);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.7, HALO_R * 0.5, 0),
    anchor
  ]);
  const geo = new THREE.TubeGeometry(curve, 40, 0.01, 6, false);
  const col = i % 2 === 0 ? 0x7af6ff : 0xff3b4e; // cyan + Spidey red
  const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.45 });
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);
  core.add(group);
  filaments.push({ group, mat, phase: i * 0.45 });
}

// ---------------------------------------------------------------------------
// Golden halo (Prabhas motif) — torus ring, slow rotation, epic glow
// ---------------------------------------------------------------------------
const halo = new THREE.Mesh(
  new THREE.TorusGeometry(HALO_R + 0.4, 0.05, 16, 140),
  new THREE.MeshStandardMaterial({ color: 0xffb86b, metalness: 1, roughness: 0.3, emissive: 0x6b3b00, emissiveIntensity: 0.6 })
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
const chapters = ['home', 'why', 'work', 'owner', 'contact'];
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
    plasma.scale.setScalar(1 + Math.sin(t * 2.2) * 0.06); // reactor pulse
    halo.rotation.z += 0.003;
    particles.rotation.y += 0.0003;
    // filament flex (swing like cables)
    filaments.forEach((f, i) => {
      f.group.rotation.x = Math.sin(t * 0.8 + f.phase) * 0.12;
      f.mat.opacity = 0.4 + Math.sin(t * 1.5 + f.phase) * 0.15;
    });
  }

  // Scroll-driven ARC REACTOR assemble: segments fly from scattered -> torus
  const assemble = cur; // 0..1 with eased scroll
  ring.children.forEach((m, i) => {
    const s = segStarts[i], d = segTargets[i];
    m.position.lerpVectors(s.pos, d.pos, assemble);
    m.rotation.x = s.rot.x + (d.rot.x - s.rot.x) * assemble;
    m.rotation.y = s.rot.y + (d.rot.y - s.rot.y) * assemble;
    m.rotation.z = s.rot.z + (d.rot.z - s.rot.z) * assemble;
  });
  shell.material.opacity = 0.3 + cur * 0.5;

  // Camera pushes toward the reactor as you scroll; halo tilts to face you
  camera.position.z = 6.5 - cur * 4.8;
  camera.position.y = cur * 0.6;
  halo.rotation.x = Math.PI / 2.3 - cur * 0.6;
  core.rotation.y = cur * 1.2;

  composer.render();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---------------------------------------------------------------------------
// Contact form (Web3Forms) — submit in-page, no redirect bounce
// ---------------------------------------------------------------------------
const form = document.getElementById('contact-form');
const note = document.getElementById('form-note');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    note.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (res.ok) {
        note.textContent = 'Thanks — message sent.';
        form.reset();
      } else {
        note.textContent = 'Something went wrong. Try again.';
      }
    } catch {
      note.textContent = 'Network error. Try again.';
    }
  });
}
