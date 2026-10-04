import * as THREE from 'three';

const canvas = document.querySelector('#world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fb7c6);
scene.fog = new THREE.Fog(0x8fb7c6, 28, 65);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(15, 12, 18);
camera.lookAt(0, -1, 0);

scene.add(new THREE.HemisphereLight(0xfff0cf, 0x4b3527, 2.5));
const sun = new THREE.DirectionalLight(0xffd49b, 3.5);
sun.position.set(-10, 18, 8);
sun.castShadow = true;
scene.add(sun);

const material = color => new THREE.MeshStandardMaterial({ color, roughness: 0.82 });
const dirt = material(0x71482f), dark = material(0x2f201b), grass = material(0x8fa45d);
const skin = material(0xefb17f), shirt = material(0xe6dec7), denim = material(0x4c7180);
const yellow = material(0xe5a22b), white = material(0xffffff), black = material(0x171717), wood = material(0x694027), steel = material(0x899499);

function mesh(geometry, mat, parent = scene) {
  const m = new THREE.Mesh(geometry, mat);
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}

const ground = mesh(new THREE.PlaneGeometry(80,80), grass);
ground.rotation.x = -Math.PI/2; ground.position.y = -2.5;
const pitWall = mesh(new THREE.CylinderGeometry(8.5,6.2,3.2,40,1,true), dirt);
pitWall.position.y = -2.25;
const pitBottom = mesh(new THREE.CylinderGeometry(6.25,5.8,0.6,40), dark);
pitBottom.position.y = -4.05;

for(let i=0;i<55;i++){
  const r=mesh(new THREE.DodecahedronGeometry(.12+Math.random()*.22,0),dirt);
  const a=Math.random()*Math.PI*2,d=9+Math.random()*14;
  r.position.set(Math.cos(a)*d,-2.38,Math.sin(a)*d);
}

const crew = new THREE.Group(); scene.add(crew);
const daveModels = [];

function makeDave(i){
  const g=new THREE.Group();
  const body=mesh(new THREE.BoxGeometry(.75,1,.55),shirt,g); body.position.y=.9;
  const pants=mesh(new THREE.BoxGeometry(.78,.42,.57),denim,g); pants.position.y=.32;
  const head=mesh(new THREE.SphereGeometry(.5,16,12),skin,g); head.position.y=1.7;
  const hatBrim=mesh(new THREE.CylinderGeometry(.6,.6,.08,16),yellow,g); hatBrim.position.y=2.12;
  const hat=mesh(new THREE.SphereGeometry(.45,16,8,0,Math.PI*2,0,Math.PI/2),yellow,g); hat.position.y=2.14;
  for(const side of [-1,1]){
    const eye=mesh(new THREE.SphereGeometry(.15,10,8),white,g); eye.position.set(side*.21,1.8,.43);
    const pupil=mesh(new THREE.SphereGeometry(.065,8,6),black,g); pupil.position.set(side*.23,1.8,.55);
    const leg=mesh(new THREE.BoxGeometry(.24,.55,.28),denim,g); leg.position.set(side*.2,-.15,0);
  }
  const arm=new THREE.Group(); arm.position.set(.42,1.05,0); g.add(arm);
  const forearm=mesh(new THREE.BoxGeometry(.18,.8,.18),skin,arm); forearm.position.y=-.3; forearm.rotation.z=-.45;
  const handle=mesh(new THREE.CylinderGeometry(.035,.035,1.5,8),wood,arm); handle.position.set(.55,-.75,0); handle.rotation.z=-.5;
  const blade=mesh(new THREE.BoxGeometry(.5,.38,.08),steel,arm); blade.position.set(.9,-1.32,0); blade.rotation.z=-.5;
  const a=i*.9,r=2+(i%4)*1.1; g.position.set(Math.cos(a)*r,-3.65,Math.sin(a)*r); g.rotation.y=-a+Math.PI/2;
  g.userData={arm,phase:Math.random()*6.28}; crew.add(g); daveModels.push(g);
}

let state={dirt:0,cash:0,daves:1,shovel:1,depth:0,last:Date.now()};
try { const saved=JSON.parse(localStorage.getItem('dave3d')||'null'); if(saved) state={...state,...saved}; } catch(e) {}
const rate=()=>state.daves*(1+(state.shovel-1)*.55);
const daveCost=()=>Math.floor(12*Math.pow(1.24,state.daves-1));
const shovelCost=()=>Math.floor(20*Math.pow(1.7,state.shovel-1));
state.dirt += rate()*Math.min((Date.now()-state.last)/1000,14400)*.35;

function syncCrew(){
  while(daveModels.length<Math.min(state.daves,60)) makeDave(daveModels.length);
}
syncCrew();

const $=id=>document.getElementById(id);
const fmt=n=>n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':Math.floor(n).toLocaleString();
function updateUI(){
  $('cash').textContent='$'+fmt(state.cash); $('dirt').textContent=fmt(state.dirt);
  $('crew').textContent=state.daves+' DAVE'+(state.daves===1?'':'S'); $('depth').textContent=state.depth.toFixed(1)+'m';
  $('rate').textContent=fmt(rate())+' dirt / sec'; $('sellValue').textContent='+$'+fmt(Math.floor(state.dirt));
  $('hireCost').textContent='$'+fmt(daveCost()); $('shovelCost').textContent='$'+fmt(shovelCost());
  $('hire').disabled=state.cash<daveCost(); $('shovel').disabled=state.cash<shovelCost();
}
$('sell').addEventListener('click',()=>{const n=Math.floor(state.dirt);state.cash+=n;state.dirt-=n;updateUI()});
$('hire').addEventListener('click',()=>{const c=daveCost();if(state.cash>=c){state.cash-=c;state.daves++;syncCrew();updateUI()}});
$('shovel').addEventListener('click',()=>{const c=shovelCost();if(state.cash>=c){state.cash-=c;state.shovel++;updateUI()}});
$('reset').addEventListener('click',()=>{localStorage.removeItem('dave3d');location.reload()});

function resize(){const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize); resize();

let last=performance.now(), saveTimer=0;
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min((now-last)/1000,.05); last=now;
  state.dirt+=rate()*dt; state.depth+=rate()*dt*.0015;
  daveModels.forEach(d=>{const t=now*.004+d.userData.phase;d.userData.arm.rotation.x=Math.sin(t)*.7;d.rotation.z=Math.sin(t*.5)*.02;});
  camera.position.x=15+Math.sin(now*.00008)*2;
  camera.lookAt(0,-1,0);
  renderer.render(scene,camera); updateUI();
  saveTimer+=dt;if(saveTimer>3){state.last=Date.now();localStorage.setItem('dave3d',JSON.stringify(state));saveTimer=0;}
}
requestAnimationFrame(animate);
