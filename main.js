import * as THREE from 'three';

const canvas=document.getElementById('webgl-canvas');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x030303,.065);
const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,100);camera.position.set(0,0,7.5);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;
scene.add(new THREE.AmbientLight(0xffffff,.22));
const redLight=new THREE.PointLight(0xff1238,7,10);redLight.position.set(0,0,2);scene.add(redLight);
const rim=new THREE.PointLight(0xff4466,3,12);rim.position.set(-3,2,3);scene.add(rim);

const reactor=new THREE.Group();reactor.rotation.z=Math.PI/6;scene.add(reactor);
const glowMat=new THREE.MeshBasicMaterial({color:0xff1238,transparent:true,opacity:.92,side:THREE.DoubleSide});
const darkMat=new THREE.MeshStandardMaterial({color:0x050505,metalness:.9,roughness:.18,emissive:0x160006,emissiveIntensity:.7});
const wireMat=new THREE.MeshBasicMaterial({color:0xff3658,transparent:true,opacity:.8});

const core=new THREE.Mesh(new THREE.TetrahedronGeometry(.58,1),glowMat);reactor.add(core);
const coreGlow=new THREE.Mesh(new THREE.TetrahedronGeometry(.78,2),new THREE.MeshBasicMaterial({color:0xff1238,wireframe:true,transparent:true,opacity:.24}));reactor.add(coreGlow);
const outer=new THREE.Mesh(new THREE.TetrahedronGeometry(1.35,1),darkMat);reactor.add(outer);
const outerWire=new THREE.Mesh(new THREE.TetrahedronGeometry(1.52,2),wireMat);reactor.add(outerWire);

for(let i=0;i<3;i++){
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1.72+i*.24,.018,8,128),new THREE.MeshBasicMaterial({color:0xff1238,transparent:true,opacity:.42-i*.08}));
 ring.rotation.x=Math.PI/2+i*.48;ring.rotation.y=i*.75;reactor.add(ring);
}
const beamGroup=new THREE.Group();reactor.add(beamGroup);
for(let i=0;i<3;i++){
 const g=new THREE.CylinderGeometry(.025,.025,3.9,8);const m=new THREE.MeshBasicMaterial({color:0xff1238,transparent:true,opacity:.28});const beam=new THREE.Mesh(g,m);beam.rotation.z=Math.PI/2;beam.rotation.y=i*Math.PI/3;beamGroup.add(beam);
}

const particles=220;const pos=new Float32Array(particles*3);for(let i=0;i<particles;i++){const r=3+Math.random()*7,a=Math.random()*Math.PI*2,b=(Math.random()-.5)*2;pos[i*3]=Math.cos(a)*r;pos[i*3+1]=Math.sin(a)*r*.55+b;pos[i*3+2]=(Math.random()-.5)*7}
const stars=new THREE.Points(new THREE.BufferGeometry(),new THREE.PointsMaterial({color:0xff4565,size:.025,transparent:true,opacity:.7}));stars.geometry.setAttribute('position',new THREE.BufferAttribute(pos,3));scene.add(stars);

let scrollY=0,mx=0,my=0,t=0;addEventListener('scroll',()=>scrollY=scrollY||window.scrollY);addEventListener('mousemove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
function animate(){requestAnimationFrame(animate);t+=.012;const max=Math.max(1,document.body.scrollHeight-innerHeight);const s=scrollY/max;reactor.rotation.y+=reduced?0:.0025;reactor.rotation.x=Math.sin(t*.45)*.08;outer.rotation.y-=.003;outerWire.rotation.y+=.004;core.scale.setScalar(1+Math.sin(t*2.4)*.07);coreGlow.scale.setScalar(1+Math.sin(t*1.8)*.08);redLight.intensity=6.2+Math.sin(t*2)*1.5;stars.rotation.y+=.0002;camera.position.z=7.5-s*2.2;camera.position.x+=(mx*.45-camera.position.x)*.025;camera.position.y+=(-my*.35-camera.position.y)*.025;camera.lookAt(0,0,0);renderer.render(scene,camera)}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2))});

const reveals=document.querySelectorAll('.reveal');const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});reveals.forEach(e=>obs.observe(e));
const sections=document.querySelectorAll('.section');const links=document.querySelectorAll('.nav-links a');const navObs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id))}}),{threshold:.45});sections.forEach(s=>navObs.observe(s));
const form=document.getElementById('contact-form');const note=document.getElementById('form-note');if(form){form.addEventListener('submit',async e=>{e.preventDefault();note.textContent='TRANSMITTING...';try{const r=await fetch('https://api.web3forms.com/submit',{method:'POST',body:new FormData(form)});const data=await r.json();note.textContent=data.success?'CHANNEL OPEN. MESSAGE TRANSMITTED.':'TRANSMISSION FAILED.';if(data.success)form.reset()}catch{note.textContent='NETWORK ERROR. TRY AGAIN.'}})}