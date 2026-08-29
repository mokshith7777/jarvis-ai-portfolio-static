import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- Scene Setup ---
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 7;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0); // Transparent void

// --- Red reference backdrop plane (behind the reactor) ---
const texLoader = new THREE.TextureLoader();
const backdropTex = texLoader.load('./reference/arc-ref.jpg');
backdropTex.colorSpace = THREE.SRGBColorSpace;
const backdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 24),
  new THREE.MeshBasicMaterial({ map: backdropTex, transparent: true, opacity: 0.4, depthWrite: false })
);
backdrop.position.set(0, 0, -14);
scene.add(backdrop);

// --- Postprocessing (Bloom) ---
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.85, // strength (restrained)
  0.4,  // radius
  0.1   // threshold
);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// --- Reactor Geometry ---
const reactorGroup = new THREE.Group();
scene.add(reactorGroup);

// 1. Plasma Sphere (Core)
const coreGeo = new THREE.SphereGeometry(0.5, 32, 32);
const coreMat = new THREE.MeshBasicMaterial({ color: 0xff5a4a });
const core = new THREE.Mesh(coreGeo, coreMat);
reactorGroup.add(core);

// 2. Icosahedron Shell
const shellGeo = new THREE.IcosahedronGeometry(0.8, 0);
const shellMat = new THREE.MeshStandardMaterial({
  color: 0x110000,
  emissive: 0x330000,
  wireframe: true,
  transparent: true,
  opacity: 0.6
});
const shell = new THREE.Mesh(shellGeo, shellMat);
reactorGroup.add(shell);

// 3. Dark Metal Torus Ring
const ringGeo = new THREE.TorusGeometry(1.7, 0.15, 16, 100);
const ringMat = new THREE.MeshStandardMaterial({
  color: 0x222222,
  metalness: 0.9,
  roughness: 0.2
});
const ring = new THREE.Mesh(ringGeo, ringMat);
reactorGroup.add(ring);

// 4. Thin Red Accent Torus
const accentGeo = new THREE.TorusGeometry(1.32, 0.02, 16, 100);
const accentMat = new THREE.MeshBasicMaterial({ color: 0xff3b4e });
const accentRing = new THREE.Mesh(accentGeo, accentMat);
reactorGroup.add(accentRing);

// 5. Particle Dust
const dustGeo = new THREE.BufferGeometry();
const dustCount = 1400;
const posArray = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 15;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const dustMat = new THREE.PointsMaterial({
  size: 0.02,
  color: 0xff5a4a,
  blending: THREE.AdditiveBlending,
  transparent: true,
  opacity: 0.4
});
const dust = new THREE.Points(dustGeo, dustMat);
scene.add(dust);

// --- Lighting (red rim to match reference) ---
scene.add(new THREE.AmbientLight(0x2a1414, 0.7));
const key = new THREE.DirectionalLight(0xffffff, 1.0);
key.position.set(-3, 4, 3);
scene.add(key);
const rim = new THREE.PointLight(0xff3b30, 2.2, 22);
rim.position.set(0, 0, -2);
scene.add(rim);

// --- Scroll + pointer state ---
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let target = 0, cur = 0, tmx = 0, tmy = 0, mx = 0, my = 0;
function computeScroll() {
  const h = document.body.scrollHeight - window.innerHeight;
  target = h > 0 ? Math.min(Math.max(window.scrollY / h, 0), 1) : 0;
}
addEventListener('scroll', computeScroll, { passive: true });
addEventListener('pointermove', (e) => { tmx = e.clientX / window.innerWidth - 0.5; tmy = e.clientY / window.innerHeight - 0.5; });
addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  computeScroll();
});
computeScroll();

// --- Nav highlight + reveal ---
const chapters = ['home', 'why', 'work', 'owner', 'contact'];
const navLinks = [...document.querySelectorAll('#nav a[data-target]')];
const revealEls = [...document.querySelectorAll('.reveal')];
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.25 });
revealEls.forEach(el => io.observe(el));
function updateNav() {
  const mid = window.scrollY + window.innerHeight / 2;
  let active = chapters[0];
  for (const id of chapters) {
    const s = document.getElementById(id);
    if (s && s.offsetTop <= mid) active = id;
  }
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.target === active));
}
addEventListener('scroll', updateNav, { passive: true });
updateNav();

// --- Animation Loop ---
const clock = new THREE.Clock();
function tick() {
  const t = clock.getElapsedTime();
  cur += (target - cur) * 0.08;
  mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;

  if (!reduce) {
    core.scale.setScalar(1 + Math.sin(t * 2.0) * 0.05);
    shell.rotation.y += 0.0015; shell.rotation.x += 0.0007;
    ring.rotation.z += 0.0022;
    accentRing.rotation.z -= 0.004;
    dust.rotation.y += 0.0004;
  }

  // Camera push on scroll + pointer parallax
  camera.position.z = 7 - cur * 3.2;
  camera.position.y = cur * 0.5 + my * 0.6;
  camera.position.x = mx * 0.8;
  camera.lookAt(0, 0, 0);
  reactorGroup.rotation.y = cur * 0.8 + mx * 0.3;

  composer.render();
  requestAnimationFrame(tick);
}
tick();

// --- Contact form (Web3Forms) ---
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
    } catch {
      note.textContent = 'Network error. Try again.';
    }
  });
}
