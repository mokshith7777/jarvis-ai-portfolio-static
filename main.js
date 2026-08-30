window.addEventListener('scroll', () => {
scrollY = window.scrollY;
});
document.addEventListener('mousemove', (event) => {
if (prefersReducedMotion) return;
mouseX = (event.clientX / window.innerWidth) - 0.5;
mouseY = (event.clientY / window.innerHeight) - 0.5;
});

// Three.js initialization
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 7;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: document.getElementById('webgl-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lights
const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Main reactor group
const reactorGroup = new THREE.Group();
scene.add(reactorGroup);

// --- TRIANGULAR ARC REACTOR (User Requested Format) ---

// 1. TRIANGULAR PLASMA CORE (replacing spherical core)
const coreGeometry = new THREE.TetrahedronGeometry(0.6, 0); // Tetrahedron = triangular base
const coreMaterial = new THREE.MeshStandardMaterial({
color: 0xff0000,           // Pure neon red
emissive: 0xff4500,        // Orange-red emissive
emissiveIntensity: 1.8,
roughness: 0.05,
metalness: 0.0,
});
const plasmaCore = new THREE.Mesh(coreGeometry, coreMaterial);
plasmaCore.rotation.y = Math.PI / 4; // Orient for better triangular visibility
reactorGroup.add(plasmaCore);

// 2. DARK BLACK TRIANGULAR FRAME (complementing neon red)
const frameGeometry = new THREE.OctahedronGeometry(0.8, 0); // More complex triangular shape
const frameMaterial = new THREE.MeshStandardMaterial({
color: 0x0a0a0a,           // Dark black
roughness: 0.3,
metalness: 0.1,
emissive: 0x000000,
});
const darkFrame = new THREE.Mesh(frameGeometry, frameMaterial);
darkFrame.rotation.x = Math.PI * 0.3;
darkFrame.rotation.y = Math.PI * 0.2;
reactorGroup.add(darkFrame);

// 3. TRIANGULAR ENERGY FIELD (replaced icosahedron with triangular alternative)
const energyFieldGeometry = new THREE.OctahedronGeometry(1.2, 0); // Triangular-based energy field
const energyFieldMaterial = new THREE.MeshStandardMaterial({
color: 0xff0000,           // Pure neon red
emissive: 0xff4500,        // Orange-red emissive
emissiveIntensity: 2.5,
roughness: 0.05,
metalness: 0.0,
transparent: true,
opacity: 0.8
});
const energyField = new THREE.Mesh(energyFieldGeometry, energyFieldMaterial);
energyField.scale.set(1.3, 1.3, 1.3);
// Slow pulse animation for cinematic feel
energyField.userData = { pulseOffset: Math.random() * Math.PI * 2 };
reactorGroup.add(energyField);

// 4. NEON BLUE HOLOGRAPHIC RINGS (secondary color)
const ringGeometry = new THREE.RingGeometry(0.9, 1.0, 64);
const ringMaterial = new THREE.MeshBasicMaterial({
color: 0x00ffff,           // Neon blue
side: THREE.DoubleSide,
transparent: true,
opacity: 0.6
});
const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
ring1.rotation.x = Math.PI / 2;
reactorGroup.add(ring1);

const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
ring2.rotation.y = Math.PI / 2;
ring2.rotation.z = Math.PI / 4;
reactorGroup.add(ring2);

const ring3 = new THREE.Mesh(ringGeometry, ringMaterial);
ring3.rotation.x = Math.PI / 4;
ring3.rotation.z = Math.PI / 2;
reactorGroup.add(ring3);

// 5. ORGANIC PATTERN DISK (nature-inspired fractal pattern)
const natureDiskGeometry = new THREE.RingGeometry(0.3, 0.7, 64, 8);
const natureDiskMaterial = new THREE.MeshStandardMaterial({
color: 0x228b22,           // Forest green base (nature)
roughness: 0.4,
metalness: 0.0,
emissive: 0x006400,
emissiveIntensity: 0.5
});
const natureDisk = new THREE.Mesh(natureDiskGeometry, natureDiskMaterial);
natureDisk.rotation.x = Math.PI / 2;
reactorGroup.add(natureDisk);

// 6. LEAF-LIKE PARTICLE FIELD (nature elements)
const leafCount = 200;
const leafPositions = new Float32Array(leafCount * 3);
const leafColors = new Float32Array(leafCount * 3);

for (let i = 0; i < leafCount; i++) {
const phi = Math.acos(2 * Math.random() - 1);
const theta = 2 * Math.PI * Math.random();
const radius = 1.5 + Math.random() * 0.5;

leafPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
leafPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
leafPositions[i * 3 + 2] = radius * Math.cos(phi);

// Nature-inspired colors: greens and browns
leafColors[i * 3] = 0.3 + Math.random() * 0.4;   // R
leafColors[i * 3 + 1] = 0.6 + Math.random() * 0.3; // G
leafColors[i * 3 + 2] = 0.2 + Math.random() * 0.3; // B
}

const leafGeometry = new THREE.BufferAttribute(leafPositions, 3);
const leafGeometryObj = new THREE.BufferGeometry();
leafGeometryObj.setAttribute('position', leafGeometry);
leafGeometryObj.setAttribute('color', new THREE.BufferAttribute(leafColors, 3));

const leafMaterial = new THREE.PointsMaterial({
size: 0.02,
vertexColors: true,
transparent: true,
opacity: 0.8
});
const leafField = new THREE.Points(leafGeometryObj, leafMaterial);
scene.add(leafField);

// Additional lighting for nature elements
const natureLight = new THREE.PointLight(0x228b22, 1.2, 8);
natureLight.position.set(-2, 1, 3);
scene.add(natureLight);

// Animation variables
let elapsedTime = 0;

// Animation function
function animate() {
requestAnimationFrame(animate);

elapsedTime += 0.016; // ~60fps

// Core animations
plasmaCore.rotation.y += 0.008;
plasmaCore.rotation.x += 0.003;
plasmaCore.scale.set(
1 + Math.sin(elapsedTime * 0.3) * 0.05,
1 + Math.sin(elapsedTime * 0.3 + Math.PI/2) * 0.05,
1 + Math.sin(elapsedTime * 0.3 + Math.PI) * 0.05
);

// Frame animations (counter-rotation)
darkFrame.rotation.y -= 0.005;
darkFrame.rotation.x += 0.002;

// Energy field pulsing animation
if (energyField.userData) {
const pulseSpeed = 0.5;
const pulseAmount = 0.15;
const scale = 1.3 + Math.sin(elapsedTime * pulseSpeed + energyField.userData.pulseOffset) * pulseAmount;
energyField.scale.set(scale, scale, scale);
} else {
energyField.scale.set(1.3, 1.3, 1.3);
}

// Ring animations (different speeds for depth)
ring1.rotation.z += 0.002;
ring2.rotation.x -= 0.0015;
ring3.rotation.y += 0.001;

// Nature elements animation
natureDisk.rotation.z = elapsedTime * 0.3;
natureDisk.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2;

// Leaf field gentle drift
if (leafGeometryObj.attributes.position) {
const positions = leafGeometryObj.attributes.position.array;
for (let i = 0; i < leafCount; i++) {
const timeOffset = i * 0.1;
positions[i * 3] += Math.sin(elapsedTime * 0.3 + timeOffset) * 0.001;
positions[i * 3 + 1] += Math.cos(elapsedTime * 0.2 + timeOffset) * 0.001;
positions[i * 3 + 2] += Math.sin(elapsedTime * 0.4 + timeOffset) * 0.001;
}
leafGeometryObj.attributes.position.needsUpdate = true;
}

// Camera position based on scroll (cinematic feel)
const maxScroll = document.body.scrollHeight - window.innerHeight;
const scrollRatio = window.scrollY / maxScroll;
camera.position.z = 7 - (scrollRatio * 3.2); // Scroll pushes camera in (z: 7 -> ~3.8)

// Subtle camera movement based on mouse
camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;

camera.lookAt(0, 0, 0);
renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();

// --- DOM INTERSECTION OBSERVER (Reveal & Nav) ---
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-links a');

const observerOptions = {
root: null,
threshold: 0.1,
rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('visible');
const id = entry.target.getAttribute('id');
const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
if (activeLink) {
navLinks.forEach(link => link.classList.remove('active'));
activeLink.classList.add('active');
}
}
});
}, observerOptions);

sections.forEach(section => {
observer.observe(section);
});

// --- CONTACT FORM (Web3Forms) - PRESERVED FROM ORIGINAL ---
const form = document.getElementById('contact-form');
const note = document.getElementById('form-note');
if (form) {
form.addEventListener('submit', async (e) => {
e.preventDefault();
const data = new FormData(form);
note.textContent = 'Sending…';
try {
const response = await fetch('https://api.web3forms.com/submit', {
method: 'POST',
body: data
});
const result = await response.json();
if (result.success) {
note.textContent = 'Message sent!';
note.style.color = '#4ade80';
form.reset();
} else {
note.textContent = 'Error sending message';
note.style.color = '#f87171';
}
} catch (error) {
note.textContent = 'Failed to send';
note.style.color = '#f87171';
}
});
}