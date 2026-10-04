import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas=document.querySelector('#world'), renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x91b9c8);scene.fog=new THREE.Fog(0x91b9c8,34,82);
const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,150);camera.position.set(22,17,26);
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.target.set(0,-1,0);controls.minDistance=15;controls.maxDistance=48;controls.maxPolarAngle=1.48;
scene.add(new THREE.HemisphereLight(0xfff1d0,0x493528,2.2));const sun=new THREE.DirectionalLight(0xffd59b,4);sun.position.set(-12,24,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
const M=c=>new THREE.MeshStandardMaterial({color:c,roughness:.78}), dirt=M(0x70462f),dark=M(0x38251e),groundM=M(0xb78852),skin=M(0xf0b382),shirt=M(0xe7dfc8),denim=M(0x4b7080),yellow=M(0xe8a52f),boot=M(0x33251f),white=M(0xffffff),black=M(0x151515),steel=M(0x8e989b),wood=M(0x6d4127);
function add(g,m,p=scene){const x=new THREE.Mesh(g,m);x.castShadow=x.receiveShadow=true;p.add(x);return x}
const ground=add(new THREE.PlaneGeometry(100,100),groundM);ground.rotation.x=-Math.PI/2;ground.position.y=-2.8;
const rim=add(new THREE.CylinderGeometry(9,6.5,3.5,48,1,true),dirt);rim.position.y=-2.5;
const hole=add(new THREE.CylinderGeometry(6.5,5.8,.9,48),dark);hole.position.y=-4.25;
for(let i=0;i<70;i++){const r=add(new THREE.DodecahedronGeometry(.1+Math.random()*.24,0),Math.random()>.45?dirt:dark),a=Math.random()*6.28,d=9+Math.random()*19;r.position.set(Math.cos(a)*d,-2.58,Math.sin(a)*d);r.rotation.set(Math.random()*3,Math.random()*3,0)}
const site=new THREE.Group();scene.add(site),daves=[];
function dave(i){const g=new THREE.Group(),body=add(new THREE.CapsuleGeometry(.4,.8,4,8),shirt,g);body.position.y=1.03;const pants=add(new THREE.BoxGeometry(.82,.45,.55),denim,g);pants.position.y=.55;
for(const s of [-1,1]){const leg=add(new THREE.CylinderGeometry(.14,.15,.5,8),denim,g);leg.position.set(s*.21,.18,0);const b=add(new THREE.BoxGeometry(.32,.17,.52),boot,g);b.position.set(s*.21,-.12,.08)}
const head=add(new THREE.SphereGeometry(.54,16,12),skin,g);head.scale.set(1.05,.92,1);head.position.y=1.9;
for(const s of [-1,1]){const e=add(new THREE.SphereGeometry(.16,12,8),white,g);e.position.set(s*.23,2.02,.46);const p=add(new THREE.SphereGeometry(.07,8,6),black,g);p.position.set(s*.25,2.02,.59)}
const mouth=add(new THREE.TorusGeometry(.13,.045,7,12,Math.PI),black,g);mouth.position.set(0,1.72,.5);mouth.rotation.z=Math.PI;
const brim=add(new THREE.CylinderGeometry(.62,.62,.08,16),yellow,g);brim.position.y=2.38;const hat=add(new THREE.SphereGeometry(.48,16,8,0,6.28,0,1.57),yellow,g);hat.position.y=2.4;
const arm=new THREE.Group();g.add(arm);arm.position.set(.4,1.2,0);const a=add(new THREE.CylinderGeometry(.1,.1,.82,8),skin,arm);a.rotation.z=-.65;a.position.set(.27,-.22,0);const sh=new THREE.Group();arm.add(sh);sh.position.set(.55,-.5,0);const h=add(new THREE.CylinderGeometry(.035,.035,1.5,8),wood,sh);h.rotation.z=-.42;h.position.set(.3,-.55,0);const blade=add(new THREE.BoxGeometry(.48,.42,.08),steel,sh);blade.position.set(.6,-1.2,0);blade.rotation.z=-.42;
const ang=(i*.93)%6.28,rad=2.1+(i%4)*1.2;g.position.set(Math.cos(ang)*rad,-3.65,Math.sin(ang)*rad);g.rotation.y=-ang+1.57;g.userData={arm,phase:Math.random()*6.28};site.add(g);daves.push(g)}
let s={dirt:0,cash:0,daves:1,shovel:1,depth:0,last:Date.now()};try{s={...s,...JSON.parse(localStorage.getItem('dave3d')||'{}')}}catch{}
const rate=()=>s.daves*(1+(s.shovel-1)*.55),dc=()=>Math.floor(12*1.24**(s.daves-1)),sc=()=>Math.floor(20*1.7**(s.shovel-1));
s.dirt+=rate()*Math.min((Date.now()-s.last)/1000,14400)*.35;
function sync(){while(daves.length<Math.min(s.daves,70))dave(daves.length);while(daves.length>Math.min(s.daves,70))site.remove(daves.pop())}sync();
const $=x=>document.getElementById(x),u={cash:$('cash'),dirt:$('dirt'),crew:$('crew'),depth:$('depth'),rate:$('rate'),sell:$('sell'),sv:$('sellValue'),hire:$('hire'),hc:$('hireCost'),shovel:$('shovel'),sc:$('shovelCost'),mile:$('milestone'),bar:$('bar'),toast:$('toast')};
const fmt=n=>n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':Math.floor(n).toLocaleString();
function ui(){u.cash.textContent='$'+fmt(s.cash);u.dirt.textContent=fmt(s.dirt);u.crew.textContent=s.daves+' DAVE'+(s.daves===1?'':'S');u.depth.textContent=s.depth.toFixed(1)+'m';u.rate.textContent=fmt(rate())+' dirt / sec';u.sv.textContent='+$'+fmt(Math.floor(s.dirt));u.hc.textContent='$'+fmt(dc());u.sc.textContent='$'+fmt(sc());u.hire.disabled=s.cash<dc();u.shovel.disabled=s.cash<sc();const marks=[5,10,25,50,100,250,500],next=marks.find(x=>x>s.daves)||1000,prev=[1,...marks].filter(x=>x<=s.daves).pop();u.mile.textContent=next+' DAVES';u.bar.style.width=Math.min(100,(s.daves-prev)/(next-prev)*100)+'%'}
let tt;function toast(t){u.toast.textContent=t;u.toast.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>u.toast.classList.remove('show'),1200)}
u.sell.onclick=()=>{const v=Math.floor(s.dirt);if(v){s.cash+=v;s.dirt-=v;toast('SOLD '+fmt(v)+' DIRT.');ui()}};
u.hire.onclick=()=>{const c=dc();if(s.cash>=c){s.cash-=c;s.daves++;sync();toast(s.daves===2?'THERE ARE TWO OF THEM.':s.daves+' DAVES. BAD IDEA.');ui()}};
u.shovel.onclick=()=>{const c=sc();if(s.cash>=c){s.cash-=c;s.shovel++;toast('SHOVEL TECH '+s.shovel);ui()}};
$('reset').onclick=()=>{if(confirm('Erase every Dave?')){localStorage.removeItem('dave3d');location.reload()}};
const particles=[];function burst(pos){if(particles.length>120)return;for(let i=0;i<2;i++){const p=add(new THREE.SphereGeometry(.06,5,4),dirt);p.position.copy(pos).add(new THREE.Vector3((Math.random()-.5)*.4,.2,(Math.random()-.5)*.4));p.userData={v:new THREE.Vector3((Math.random()-.5)*1.5,1+Math.random()*1.4,(Math.random()-.5)*1.5),life:.7};particles.push(p)}}
let last=performance.now(),save=0;
function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.05);last=now;s.dirt+=rate()*dt;s.depth+=rate()*dt*.0018;site.position.y=-Math.min(s.depth*.003,1.4);daves.forEach(d=>{const t=now*.004*(1+s.shovel*.025)+d.userData.phase;d.userData.arm.rotation.x=Math.sin(t)*.8;d.rotation.z=Math.sin(t*.5)*.025;if(Math.sin(t)>.985&&Math.random()<.25)burst(d.position.clone().add(site.position))});for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.userData.v.y-=4*dt;p.position.addScaledVector(p.userData.v,dt);p.userData.life-=dt;if(p.userData.life<=0){scene.remove(p);particles.splice(i,1)}}controls.update();renderer.render(scene,camera);ui();save+=dt;if(save>3){s.last=Date.now();localStorage.setItem('dave3d',JSON.stringify(s));save=0}}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false)}addEventListener('resize',resize);resize();ui();requestAnimationFrame(loop);