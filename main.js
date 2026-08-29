import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ---------------------------------------------------------------------------
// Renderer / scene / camera
// ---------------------------------------------------------------------------
const bg = document.getElementById('bg');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x02060c, 0.04);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
bg.appendChild(renderer.domElement);

// ---------------------------------------------------------------------------
// Procedural emblem textures (stylized homage sigils — swap for real images)
// ---------------------------------------------------------------------------
function makeSpiderTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d'); const cx = 256, cy = 256;
  x.clearRect(0, 0, 512, 512);
  // eight jointed legs (Spidey red)
  x.strokeStyle = '#ff3b4e'; x.lineWidth = 11; x.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const midA = a + 0.22;
    x.beginPath();
    x.moveTo(cx + Math.cos(a) * 42, cy + Math.sin(a) * 42);
    x.lineTo(cx + Math.cos(midA) * 120, cy + Math.sin(midA) * 120);
    x.lineTo(cx + Math.cos(a) * 215, cy + Math.sin(a) * 215);
    x.stroke();
  }
  // web strands (cyan)
  x.strokeStyle = 'rgba(122,246,255,0.55)'; x.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * 235, cy + Math.sin(a) * 235); x.stroke();
  }
  // core body
  x.fillStyle = '#0b0e14'; x.beginPath(); x.arc(cx, cy, 48, 0, 7); x.fill();
  x.strokeStyle = '#7af6ff'; x.lineWidth = 4; x.stroke();
  return new THREE.CanvasTexture(c);
}
function makeWarriorTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d'); const cx = 256, cy = 256;
  x.clearRect(0, 0, 512, 512);
  const g = x.createRadialGradient(cx, cy, 10, cx, cy, 250);
  g.addColorStop(0, 'rgba(255,184,107,0.95)'); g.addColorStop(1, 'rgba(255,184,107,0)');
  x.fillStyle = g; x.beginPath(); x.arc(cx, cy, 250, 0, 7); x.fill();
  x.strokeStyle = '#ffb86b'; x.lineWidth = 5;
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * 245, cy + Math.sin(a) * 245); x.stroke();
  }
  // crown / triangle core (Prabhas gold)
  x.fillStyle = '#1a1208'; x.strokeStyle = '#ffd9a0'; x.lineWidth = 9;
  x.beginPath(); x.moveTo(cx, cy - 78); x.lineTo(cx + 78, cy + 56); x.lineTo(cx - 78, cy + 56); x.closePath(); x.fill(); x.stroke();
  return new THREE.CanvasTexture(c);
}

// ---------------------------------------------------------------------------
// ARC REACTOR hero (JARVIS) — central core + assembled metallic ring segments
// ---------------------------------------------------------------------------
const core = new THREE.Group();
scene.add(core);

const coreMesh = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.0, 1),
  new THREE.MeshStandardMaterial({ color: 0x0b0e14, metalness: 0.95, roughness: 0.1, emissive: 0x7af6ff, emissiveIntensity: 0.6 })
);
core.add(coreMesh);

const plasma = new THREE.Mesh(
  new THREE.SphereGeometry(0.62, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xaef6ff })
);
core.add(plasma);

const shell = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.05, 1),
  new THREE.MeshBasicMaterial({ color: 0x7af6ff, wireframe: true, transparent: true, opacity: 0.3 })
);
core.add(shell);

const HALO_R = 2.6;
const SEGMENTS = 24;
const ring = new THREE.Group();
core.add(ring);
const segGeo = new THREE.BoxGeometry(0.5, 0.12, 0.16);
const segMat = new THREE.MeshStandardMaterial({ color: 0xb9c6e0, metalness: 1, roughness: 0.25, emissive: 0x123a55, emissiveIntensity: 0.3 });
const segTargets = [], segStarts = [];
for (let i = 0; i < SEGMENTS; i++) {
  const a = (i / SEGMENTS) * Math.PI * 2;
  const m = new THREE.Mesh(segGeo, segMat);
  segTargets.push({ pos: new THREE.Vector3(Math.cos(a) * HALO_R, Math.sin(a) * HALO_R * 0.35, 0), rot: new THREE.Euler(0, 0, a + Math.PI / 2) });
  const r = 5 + Math.random() * 3;
  segStarts.push({ pos: new THREE.Vector3(Math.cos(a) * r, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6), rot: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6) });
  ring.add(m);
}

// Web filaments (Spidey motif) — red+blue energy strands from core
const filaments = [];
const FILAMENT_COUNT = 14;
for (let i = 0; i < FILAMENT_COUNT; i++) {
  const a = (i / FILAMENT_COUNT) * Math.PI * 2;
  const group = new THREE.Group(); group.rotation.y = a;
  const anchor = new THREE.Vector3(0, HALO_R * Math.sin(a), HALO_R * Math.cos(a) * 0.45);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.7, HALO_R * 0.5, 0), anchor]);
  const geo = new THREE.TubeGeometry(curve, 40, 0.01, 6, false);
  const col = i % 2 === 0 ? 0x7af6ff : 0xff3b4e;
  const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.45 });
  group.add(new THREE.Mesh(geo, mat));
  core.add(group);
  filaments.push({ group, mat, phase: i * 0.45 });
}

// Golden halo (Prabhas motif)
const halo = new THREE.Mesh(
  new THREE.TorusGeometry(HALO_R + 0.4, 0.05, 16, 140),
  new THREE.MeshStandardMaterial({ color: 0xffb86b, metalness: 1, roughness: 0.3, emissive: 0x6b3b00, emissiveIntensity: 0.6 })
);
halo.rotation.x = Math.PI / 2.3;
core.add(halo);

// ---------------------------------------------------------------------------
// Flanking emblems (Spidey left, Prabhas right) — animated, parallaxing planes
// ---------------------------------------------------------------------------
function makeEmblem(tex, color) {
  const g = new THREE.Group();
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 3.4),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
  );
  g.add(plane);
  return g;
}
const spiderEmblem = makeEmblem(makeSpiderTexture());
spiderEmblem.position.set(-4.8, 0.4, -3.2);
scene.add(spiderEmblem);

const warriorEmblem = makeEmblem(makeWarriorTexture());
warriorEmblem.position.set(4.8, -0.3, -3.2);
scene.add(warriorEmblem);

// ---------------------------------------------------------------------------
// Particle dust field
// ---------------------------------------------------------------------------
const N = 3000;
const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
const cA = new THREE.Color(0x7af6ff), cB = new THREE.Color(0xffb86b);
for (let i = 0; i < N; i++) {
  pos[i*3] = (Math.random() - 0.5) * 30; pos[i*3+1] = (Math.random() - 0.5) * 30; pos[i*3+2] = (Math.random() - 0.5) * 30;
  const c = Math.random() > 0.5 ? cA : cB; col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
}
const pg = new THREE.BufferGeometry();
pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
const particles = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
scene.add(particles);

// ---------------------------------------------------------------------------
// Lighting
// ---------------------------------------------------------------------------
scene.add(new THREE.AmbientLight(0x223044, 0.6));
const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(-3, 4, 3); scene.add(key);
const rim = new THREE.PointLight(0x7af6ff, 2.4, 24); rim.position.set(0, 0, -3); scene.add(rim);
const gold = new THREE.PointLight(0xffb86b, 1.6, 24); gold.position.set(3, -2, 2); scene.add(gold);

// ---------------------------------------------------------------------------
// Post-processing: bloom = cinematic glow
// ---------------------------------------------------------------------------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.85, 0.5, 0.72);

// ---------------------------------------------------------------------------
// Scroll + pointer
// ---------------------------------------------------------------------------
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let target = 0, cur = 0, tmx = 0, tmy = 0, mx = 0, my = 0;
function computeScroll() {
  const h = document.body.scrollHeight - innerHeight;
  target = h > 0 ? Math.min(Math.max(scrollY / h, 0), 1) : 0;
}
addEventListener('scroll', computeScroll, { passive: true });
addEventListener('pointermove', (e) => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; });
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
  computeScroll();
});
computeScroll();

// ---------------------------------------------------------------------------
// Nav highlight + reveal
// ---------------------------------------------------------------------------
const chapters = ['home', 'why', 'work', 'owner', 'contact'];
const navLinks = [...document.querySelectorAll('#nav a[data-target]')];
const revealEls = [...document.querySelectorAll('.reveal')];
const io = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }); }, { threshold: 0.25 });
revealEls.forEach(el => io.observe(el));
function updateNav() {
  const mid = scrollY + innerHeight / 2; let active = chapters[0];
  for (const id of chapters) { const s = document.getElementById(id); if (s && s.offsetTop <= mid) active = id; }
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.target === active));
}
addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ---------------------------------------------------------------------------
// Loop
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();
function tick() {
  const t = clock.getElapsedTime();
  cur += (target - cur) * 0.08;
  mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;

  if (!reduce) {
    coreMesh.rotation.y += 0.0025; coreMesh.rotation.x += 0.0009;
    plasma.scale.setScalar(1 + Math.sin(t * 2.2) * 0.06);
    halo.rotation.z += 0.003;
    particles.rotation.y += 0.0003;
    filaments.forEach((f) => { f.group.rotation.x = Math.sin(t * 0.8 + f.phase) * 0.12; f.mat.opacity = 0.4 + Math.sin(t * 1.5 + f.phase) * 0.15; });
    // emblems spin + breathe
    spiderEmblem.children[0].rotation.z = Math.sin(t * 0.4) * 0.15;
    warriorEmblem.children[0].rotation.z = Math.cos(t * 0.35) * 0.15;
  }

  // Arc Reactor assemble on scroll
  ring.children.forEach((m, i) => {
    const s = segStarts[i], d = segTargets[i];
    m.position.lerpVectors(s.pos, d.pos, cur);
    m.rotation.x = s.rot.x + (d.rot.x - s.rot.x) * cur;
    m.rotation.y = s.rot.y + (d.rot.y - s.rot.y) * cur;
    m.rotation.z = s.rot.z + (d.rot.z - s.rot.z) * cur;
  });
  shell.material.opacity = 0.3 + cur * 0.5;

  // Camera + parallax
  camera.position.z = 7 - cur * 4.8;
  camera.position.y = cur * 0.6 + my * 0.6;
  camera.position.x = mx * 0.8;
  camera.lookAt(0, 0, 0);
  halo.rotation.x = Math.PI / 2.3 - cur * 0.6;
  core.rotation.y = cur * 1.2;

  // emblem parallax depth
  spiderEmblem.position.x = -4.8 + mx * 1.4; spiderEmblem.position.y = 0.4 - my * 0.8;
  warriorEmblem.position.x = 4.8 - mx * 1.4; warriorEmblem.position.y = -0.3 + my * 0.8;

  composer.render();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---------------------------------------------------------------------------
// Contact form (Web3Forms)
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
      note.textContent = res.ok ? 'Thanks — message sent.' : 'Something went wrong. Try again.';
      if (res.ok) form.reset();
    } catch { note.textContent = 'Network error. Try again.'; }
  });
}
