import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// --- Scene Setup ---
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 7;
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0); // Transparent void
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// --- Environment (realistic metal reflections) ---
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// --- Postprocessing (Bloom) for cinematic 8k quality ---
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2,   // increased strength for more cinematic glow
    0.4,   // slightly reduced radius for sharper bloom
    0.08   // lower threshold for more intense bloom
);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// --- TRIANGULAR ARC REACTOR (User Requested Format) ---
const reactorGroup = new THREE.Group();
reactorGroup.rotation.x = -0.25; // Slight tilt for dynamic viewing
scene.add(reactorGroup);

// === PRIMARY ELEMENTS: NEON RED GRADIENT + DARK BLACK ===
// 1. TRIANGULAR PLASMA CORE (replacing spherical core)
const coreGeometry = new THREE.TetrahedronGeometry(0.6, 0); // Tetrahedron = triangular base
const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,           // Neon red base
    emissive: 0xff0000,
    emissiveIntensity: 3.0,
    roughness: 0.2,
    metalness: 0.1
});
const plasmaCore = new THREE.Mesh(coreGeometry, coreMaterial);
plasmaCore.rotation.y = Math.PI / 4; // Orient for better triangular visibility
reactorGroup.add(plasmaCore);

// 2. DARK BLACK TRIANGULAR FRAME (complementing neon red)
const frameGeometry = new THREE.OctahedronGeometry(0.8, 0); // More complex triangular shape
const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,           // Deep dark black
    emissive: 0x1a0000,        // Faint red emissive for depth
    emissiveIntensity: 0.8,
    roughness: 0.3,
    metalness: 0.7
});
const darkFrame = new THREE.Mesh(frameGeometry, frameMaterial);
darkFrame.rotation.x = Math.PI * 0.3;
darkFrame.rotation.y = Math.PI * 0.2;
reactorGroup.add(darkFrame);

// 3. NEON RED ENERGY FIELD (gradient effect)
const energyFieldGeometry = new THREE.IcosahedronGeometry(1.0, 1);
const energyFieldMaterial = new THREE.MeshStandardMaterial({
    color: 0xff1a1a,           // Vibrant neon red
    emissive: 0xff4500,        // Orange-red emissive
    emissiveIntensity: 2.2,
    roughness: 0.1,
    metalness: 0.0,
    transparent: true,
    opacity: 0.7
});
const energyField = new THREE.Mesh(energyFieldGeometry, energyFieldMaterial);
energyField.scale.set(1.1, 1.1, 1.1);
reactorGroup.add(energyField);

// === SECONDARY ELEMENTS: NEON BLUE GRADIENT ===
// 4. NEON BLUE HOLOGRAPHIC RINGS
const holoRingInnerGeometry = new THREE.TorusGeometry(0.9, 0.02, 24, 200);
const holoRingInnerMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffff,           // Neon cyan-blue
    emissive: 0x00bfff,
    emissiveIntensity: 2.5,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.8
});
const holoRingInner = new THREE.Mesh(holoRingInnerGeometry, holoRingInnerMaterial);
holoRingInner.rotation.x = Math.PI * 0.2;
reactorGroup.add(holoRingInner);

const holoRingOuterGeometry = new THREE.TorusGeometry(1.2, 0.015, 20, 160);
const holoRingOuterMaterial = new THREE.MeshStandardMaterial({
    color: 0x00bfff,           // Deep neon blue
    emissive: 0x1e90ff,
    emissiveIntensity: 1.8,
    roughness: 0.1,
    metalness: 0.95,
    transparent: true,
    opacity: 0.6
});
const holoRingOuter = new THREE.Mesh(holoRingOuterGeometry, holoRingOuterMaterial);
holoRingOuter.rotation.x = -Math.PI * 0.15;
reactorGroup.add(holoRingOuter);

// === NATURE ELEMENTS (User Requested) ===
// 5. ORGANIC PATTERN DISK (nature-inspired fractal pattern)
const natureDiskGeometry = new THREE.RingGeometry(0.3, 0.7, 64, 8);
const natureDiskMaterial = new THREE.MeshStandardMaterial({
    color: 0x228b22,           // Forest green base (nature)
    emissive: 0x32cd32,        // Lime green emissive
    emissiveIntensity: 1.5,
    roughness: 0.4,
    metalness: 0.2,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6
});
const natureDisk = new THREE.Mesh(natureDiskGeometry, natureDiskMaterial);
natureDisk.rotation.x = Math.PI / 2;
reactorGroup.add(natureDisk);

// 6. LEAF-LIKE PARTICLE FIELD (nature elements)
const leafCount = 200;
const leafPositions = new Float32Array(leafCount * 3);
const leafColors = new Float32Array(leafCount * 3);

for (let i = 0; i < leafCount; i++) {
    // Distribute in a spherical pattern around reactor
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();
    const radius = 1.3 + (Math.random() - 0.5) * 0.4;
    
    leafPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    leafPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    leafPositions[i * 3 + 2] = radius * Math.cos(phi);
    
    // Nature-inspired colors: greens and browns
    if (Math.random() > 0.5) {
        leafColors[i * 3] = 0.3 + Math.random() * 0.4;   // R
        leafColors[i * 3 + 1] = 0.6 + Math.random() * 0.3; // G
        leafColors[i * 3 + 2] = 0.2 + Math.random() * 0.3; // B
    } else {
        leafColors[i * 3] = 0.4 + Math.random() * 0.3;   // R
        leafColors[i * 3 + 1] = 0.3 + Math.random() * 0.2; // G
        leafColors[i * 3 + 2] = 0.1 + Math.random() * 0.2; // B
    }
}

const leafGeometry = new THREE.BufferAttribute(leafPositions, 3);
const leafGeometryObj = new THREE.BufferGeometry();
leafGeometryObj.setAttribute('position', leafGeometry);
leafGeometryObj.setAttribute('color', new THREE.BufferAttribute(leafColors, 3));

const leafMaterial = new THREE.PointsMaterial({
    size: 0.03,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
});
const leafField = new THREE.Points(leafGeometryObj, leafMaterial);
scene.add(leafField);

// === LIGHTING SYSTEM ===
// Ambient light with nature tint
const ambientLight = new THREE.AmbientLight(0x1a1a1a, 0.5); // Dark base
scene.add(ambientLight);

// Key light with neon red tint
const keyLight = new THREE.DirectionalLight(0xff2a2a, 1.6);
keyLight.position.set(4, 3, 5);
scene.add(keyLight);

// Rim light with neon blue tint
const rimLight = new THREE.PointLight(0x00bfff, 4, 12);
rimLight.position.set(0, 0, -2);
scene.add(rimLight);

// Core plasma light (intense neon red)
const coreLight = new THREE.PointLight(0xff0000, 4, 6);
coreLight.position.set(0, 0, 0.3);
reactorGroup.add(coreLight);

// Nature-inspired fill light
const natureLight = new THREE.PointLight(0x228b22, 1.2, 8);
natureLight.position.set(-2, 1, 3);
scene.add(natureLight);

// --- INTERACTION & ANIMATION ---
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

    if (!prefersReducedMotion) {
        // PRIMARY: Neon red pulsing + dark black elements
        const primaryPulse = Math.sin(elapsedTime * 1.8) * 0.3 + 0.7;
        plasmaCore.scale.set(primaryPulse, primaryPulse, primaryPulse);
        darkFrame.scale.set(primaryPulse * 1.05, primaryPulse * 1.05, primaryPulse * 1.05);
        energyField.scale.set(1.1 + Math.sin(elapsedTime * 1.2) * 0.05, 
                             1.1 + Math.sin(elapsedTime * 1.2) * 0.05,
                             1.1 + Math.sin(elapsedTime * 1.2) * 0.05);
        
        // Rotate elements for dynamic triangular viewing
        plasmaCore.rotation.y = elapsedTime * 0.2;
        darkFrame.rotation.y = elapsedTime * 0.15;
        darkFrame.rotation.z = elapsedTime * 0.1;
        energyField.rotation.y = -elapsedTime * 0.1;
        energyField.rotation.z = elapsedTime * 0.05;
        
        // SECONDARY: Neon blue holographic rings animation
        holoRingInner.rotation.z += 0.004;
        holoRingInner.rotation.x += 0.002;
        holoRingOuter.rotation.z -= 0.003;
        holoRingOuter.rotation.y += 0.004;
        
        // Nature elements animation
        natureDisk.rotation.z = elapsedTime * 0.3;
        natureDisk.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2;
        
        // Leaf field gentle drift
        for (let i = 0; i < leafCount; i++) {
            const timeOffset = i * 0.1;
            leafGeometryObj.attributes.position.array[i * 3] += Math.sin(elapsedTime * 0.3 + timeOffset) * 0.001;
            leafGeometryObj.attributes.position.array[i * 3 + 1] += Math.cos(elapsedTime * 0.2 + timeOffset) * 0.001;
            leafGeometryObj.attributes.position.array[i * 3 + 2] += Math.sin(elapsedTime * 0.4 + timeOffset) * 0.001;
        }
        leafGeometryObj.attributes.position.needsUpdate = true;
        
        // Spin rings for depth
        // (keeping original ring animations if they exist, but we replaced them)
    }

    // Scroll pushes camera in (z: 7 -> ~3.8) - enhanced for cinematic feel
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollRatio = maxScroll > 0 ? scrollY / maxScroll : 0;
    const targetZ = 7 - (scrollRatio * 3.5); // Increased scroll effect
    camera.position.z += (targetZ - camera.position.z) * 0.04;
    reactorGroup.rotation.y = scrollRatio * Math.PI * 0.4; // Slightly reduced rotation
    
    // Pointer parallax (subtle 3D viewing)
    if (!prefersReducedMotion) {
        const targetX = mouseX * 1.8; // Increased parallax for cinematic feel
        const targetY = -mouseY * 1.8;
        camera.position.x += (targetX - camera.position.x) * 0.04;
        camera.position.y += (targetY - camera.position.y) * 0.04;
    }

    composer.render();
}

animate();

// --- DOM INTERSECTION OBSERVER (Reveal & Nav) ---
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const card = entry.target.querySelector('.fade-in');
            if (card) card.classList.add('visible');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').substring(1) === entry.target.id) {
                    link.classList.add('active');
                }
            });
        }
    });
}, { root: null, threshold: 0.3 });

sections.forEach(section => observer.observe(section));

// --- CONTACT FORM (Web3Forms) - PRESERVED FROM ORIGINAL ---
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
