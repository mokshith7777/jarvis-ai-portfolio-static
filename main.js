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
renderer.setClearColor(0x000000, 0); // transparent so the CSS void gradient shows at edges
bg.appendChild(renderer.domElement);

// Backdrop plane: your reference image, far behind the reactor.
const texLoader = new THREE.TextureLoader();
const backdropTex = texLoader.load('./reference/arc-ref.jpg');
backdropTex.colorSpace = THREE.SRGBColorSpace;
const backdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 24),
  new THREE.MeshBasicMaterial({ map: backdropTex, transparent: true, opacity: 0.4, depthWrite: false })
);
backdrop.position.set(0, 0, -14);
scene.add(backdrop);

// ---------------------------------------------------------------------------
// ARC REACTOR hero (JARVIS) — built to match the dark-red reference palette
//   one glowing red core · polished dark-metal ring · soft bloom · dark grade
// ---------------------------------------------------------------------------
const core = new THREE.Group();
scene.add(core);

// Inner plasma sphere (the glow source) — red
const plasma = new THREE.Mesh(
  new THREE.SphereGeometry(0.85, 48, 48),
  new THREE.MeshBasicMaterial({ color: 0xff5a4a })
);
core.add(plasma);

// Glass core shell — subtle, clean
const shell = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.0, 2),
  new THREE.MeshStandardMaterial({
    color: 0x140a0a, metalness: 0.9, roughness: 0.15,
    emissive: 0xff3b30, emissiveIntensity: 0.5, transparent: true, opacity: 0.9
  })
);
core.add(shell);

// Outer polished metal ring — single clean torus, slowly rotating
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(1.7, 0.10, 24, 220),
  new THREE.MeshStandardMaterial({ color: 0xc9b4b4, metalness: 1.0, roughness: 0.22, emissive: 0x3a0e0e, emissiveIntensity: 0.5 })
);
ring.rotation.x = Math.PI / 2.1;
core.add(ring);

// Thin inner accent ring (red)
const accent = new THREE.Mesh(
  new THREE.TorusGeometry(1.32, 0.025, 16, 200),
  new THREE.MeshBasicMaterial({ color: 0xff5a4a })
);
accent.rotation.x = Math.PI / 2.1;
core.add(accent);

// ---------------------------------------------------------------------------
// Particle dust field (subtle, red-toned)
// ---------------------------------------------------------------------------
const N = 1400;
const pos = new Float32Array(N * 3);
for (let i = 0; i < N; i++) {
  const r = 4 + Math.random() * 12, a = Math.random() * Math.PI * 2, b = (Math.random() - 0.5) * 8;
  pos[i*3] = Math.cos(a) * r; pos[i*3+1] = b; pos[i*3+2] = Math.sin(a) * r - 2;
}
const pg = new THREE.BufferGeometry();
pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const particles = new THREE.Points(pg, new THREE.PointsMaterial({
  size: 0.03, color: 0xff5a4a, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false
}));
scene.add(particles);

// ---------------------------------------------------------------------------
// Lighting — restrained, red rim to match the reference
// ---------------------------------------------------------------------------
scene.add(new THREE.AmbientLight(0x2a1414, 0.7));
const key = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(-3, 4, 3); scene.add(key);
const rim = new THREE.PointLight(0xff3b30, 2.2, 22); rim.position.set(0, 0, -2); scene.add(rim);
const warm = new THREE.PointLight(0xffcaa0, 0.5, 26); warm.position.set(4, -1.5, 1.5); scene.add(warm);

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
    plasma.scale.setScalar(1 + Math.sin(t * 2.0) * 0.05);   // gentle pulse
    shell.rotation.y += 0.0015; shell.rotation.x += 0.0007;
    ring.rotation.z += 0.0022;                               // slow premium spin
    accent.rotation.z -= 0.004;
    particles.rotation.y += 0.0004;
  }

  // Camera + parallax
  camera.position.z = 7 - cur * 3.2;
  camera.position.y = cur * 0.5 + my * 0.6;
  camera.position.x = mx * 0.8;
  camera.lookAt(0, 0, 0);
  core.rotation.y = cur * 0.8 + mx * 0.3;

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
