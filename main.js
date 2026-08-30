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

// --- 6. Backdrop Plane (Reference Texture) ---
// Ensure 'reference/arc-ref.jpg' exists relative to this file
const textureLoader = new THREE.TextureLoader();
textureLoader.load('reference/arc-ref.jpg', (texture) => {
  const bgGeo = new THREE.PlaneGeometry(30, 20);
  const bgMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.4,
    depthWrite: false
  });
  const bgPlane = new THREE.Mesh(bgGeo, bgMat);
  bgPlane.position.z = -14;
  scene.add(bgPlane);
});

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

// 4b. Blue Holographic Secondary Accent (per design spec)
const holoGeo = new THREE.TorusGeometry(1.05, 0.015, 16, 120);
const holoMat = new THREE.MeshBasicMaterial({ color: 0x4f9dff, transparent: true, opacity: 0.55 });
const holoRing = new THREE.Mesh(holoGeo, holoMat);
reactorGroup.add(holoRing);

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

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0x220000, 1.5);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1);
keyLight.position.set(2, 2, 5);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0xff3b30, 5, 10);
rimLight.position.set(0, 0, -2);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0xffb86b, 0.3);
fillLight.position.set(-2, -1, 3);
scene.add(fillLight);

// 5b. Blue Holographic rim accent (secondary)
const holoLight = new THREE.PointLight(0x4f9dff, 2.2, 12);
holoLight.position.set(2.5, -1.5, 1);
scene.add(holoLight);

// --- Interaction & Animation ---
let scrollY = window.scrollY;
let mouseX = 0;
let mouseY = 0;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

document.addEventListener('mousemove', (event) => {
  if (prefersReducedMotion) return;
  mouseX = (event.clientX / window.innerWidth) - 0.5;
  mouseY = (event.clientY / window.innerHeight) - 0.5;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Continuous gentle pulse & spin
  if (!prefersReducedMotion) {
    shell.rotation.y += 0.005;
    shell.rotation.x += 0.002;
    ring.rotation.z -= 0.003;
    accentRing.rotation.z += 0.005;
    holoRing.rotation.y -= 0.008;
    holoRing.rotation.z += 0.004;

    // Core Pulse
    const pulse = Math.sin(elapsedTime * 2) * 0.1 + 1;
    core.scale.set(pulse, pulse, pulse);

    // Dust float
    dust.rotation.y = elapsedTime * 0.02;
  }

  // Scroll pushes camera in (z: 7 -> ~3.8) and slowly rotates core
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const scrollRatio = maxScroll > 0 ? scrollY / maxScroll : 0;

  const targetZ = 7 - (scrollRatio * 3.2);
  camera.position.z += (targetZ - camera.position.z) * 0.05;
  reactorGroup.rotation.y = scrollRatio * Math.PI;

  // Pointer move parallax
  if (!prefersReducedMotion) {
    const targetX = mouseX * 2;
    const targetY = -mouseY * 2;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;

    reactorGroup.rotation.x += (-mouseY * 0.5 - reactorGroup.rotation.x) * 0.05;
  }

  composer.render();
}

animate();

// --- DOM Intersection Observer (Reveal & Nav) ---
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-links a');

const observerOptions = {
  root: null,
  threshold: 0.3,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Reveal card
      const card = entry.target.querySelector('.fade-in');
      if (card) card.classList.add('visible');

      // Update Nav
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === entry.target.id) {
          link.classList.add('active');
        }
      });
    }
  });
}, observerOptions);

sections.forEach(section => observer.observe(section));

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
