'use strict';
const $=id=>document.getElementById(id), canvas=$('field'), ctx=canvas.getContext('2d');
const W=400; let H=720, scale=1, state='menu', best=0, sound=false, audio, last=0, camera=0, peak=0, points=0, platforms=[], items=[], particles=[], player, nextY, lastX, time=0, pointer=null, keys=new Set();
try{best=Number(localStorage.getItem('higher-best'))||0}catch{} $('best').textContent=best+' m';
const images={}, groups={};
const paths = [
 "assets/hero/idle/00.png",
 "assets/hero/idle/01.png",
 "assets/hero/idle/02.png",
 "assets/hero/idle/03.png",
 "assets/hero/idle/04.png",
 "assets/hero/idle/05.png",
 "assets/hero/idle/06.png",
 "assets/hero/idle/07.png",
 "assets/hero/jump/00.png",
 "assets/hero/jump/01.png",
 "assets/hero/jump/02.png",
 "assets/hero/jump/03.png",
 "assets/hero/jump/04.png",
 "assets/hero/jump/05.png",
 "assets/hero/jump/06.png",
 "assets/hero/jump/07.png",
 "assets/hero/fall/00.png",
 "assets/hero/fall/01.png",
 "assets/hero/fall/02.png",
 "assets/hero/fall/03.png",
 "assets/hero/fall/04.png",
 "assets/hero/fall/05.png",
 "assets/hero/fall/06.png",
 "assets/hero/fall/07.png",
 "assets/hero/boost/00.png",
 "assets/hero/boost/01.png",
 "assets/hero/boost/02.png",
 "assets/hero/boost/03.png",
 "assets/hero/boost/04.png",
 "assets/hero/boost/05.png",
 "assets/hero/boost/06.png",
 "assets/hero/boost/07.png",
 "assets/platforms/normal/00.png",
 "assets/platforms/normal/01.png",
 "assets/platforms/normal/02.png",
 "assets/platforms/normal/03.png",
 "assets/platforms/moving/00.png",
 "assets/platforms/moving/01.png",
 "assets/platforms/moving/02.png",
 "assets/platforms/moving/03.png",
 "assets/platforms/breakable/00.png",
 "assets/platforms/breakable/01.png",
 "assets/platforms/breakable/02.png",
 "assets/platforms/breakable/03.png",
 "assets/platforms/boost/00.png",
 "assets/platforms/boost/01.png",
 "assets/platforms/boost/02.png",
 "assets/platforms/boost/03.png",
 "assets/collectibles/coin/00.png",
 "assets/collectibles/coin/01.png",
 "assets/collectibles/coin/02.png",
 "assets/collectibles/coin/03.png",
 "assets/collectibles/coin/04.png",
 "assets/collectibles/star/00.png",
 "assets/collectibles/star/01.png",
 "assets/collectibles/star/02.png",
 "assets/collectibles/star/03.png",
 "assets/collectibles/spring/00.png",
 "assets/collectibles/spring/01.png",
 "assets/collectibles/spring/02.png",
 "assets/collectibles/spring/03.png",
 "assets/collectibles/rocket/00.png",
 "assets/collectibles/rocket/01.png",
 "assets/collectibles/rocket/02.png",
 "assets/collectibles/rocket/03.png",
 "assets/environment/lounge/sofa.png",
 "assets/environment/lounge/window.png",
 "assets/environment/lounge/counter.png",
 "assets/environment/lounge/lamp.png",
 "assets/environment/lounge/table.png",
 "assets/environment/composed/cloud-bank.webp",
 "assets/environment/composed/cloud-high.webp",
 "assets/environment/composed/cloud-low.webp",
 "assets/environment/composed/islands.webp",
 "assets/environment/composed/moon.webp",
 "assets/environment/composed/night.webp",
 "assets/environment/composed/planet.webp",
 "assets/environment/composed/roofs.webp",
 "assets/environment/composed/street.webp",
 "assets/environment/composed/twilight.webp",
];
for(const path of paths){const key=path.replace(/^assets\//,'').replace(/\.(png|webp)$/,'');const i=new Image();i.src=path;images[key]=i;const group=key.replace(/\/\d+$/,'');(groups[group] ||= []).push(i);}
function sprite(group,frame=0){const a=groups[group]||[];return a[frame%a.length]||a[0]}
function ready(i){return i&&i.complete&&i.naturalWidth>0}
function paint(i,x,y,w,h){if(ready(i))ctx.drawImage(i,x,y,w,h)}
function resize(){const r=canvas.getBoundingClientRect(); H=W*r.height/r.width;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);scale=canvas.width/W;ctx.setTransform(scale,0,0,scale,0,0)}
new ResizeObserver(resize).observe(canvas);resize();
function beep(f=440){if(!sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(f*1.5,audio.currentTime+.09);g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.14);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.15)}catch{}}
function reset(){camera=0;peak=0;points=0;time=0;pointer=null;keys.clear();platforms=[{x:200,y:0,w:140,type:'normal',base:200}];items=[];particles=[];player={x:200,y:0,vx:0,vy:650,boost:0};nextY=0;lastX=200;generate();$('height').textContent='0 m';$('zone').textContent='THE LOUNGE';}
function generate(){while(nextY<camera+H+240){const difficulty=Math.min(1,nextY/11000);nextY+=70+Math.random()*35+difficulty*28;let x=Math.max(45,Math.min(W-45,lastX+(Math.random()-.5)*(175+difficulty*40)));let w=112-difficulty*35;const r=Math.random();let type=nextY<450?'normal':r<.12?'boost':r<.22?'breakable':r<.42?'moving':'normal';if(type==='breakable'&&platforms.at(-1)?.type==='breakable')type='normal';const p={x,y:nextY,w,type,base:x,phase:Math.random()*6};platforms.push(p);lastX=x;if(Math.random()<.30){const r=Math.random();items.push({x,y:nextY+45,type:r<.57?'coin':r<.77?'star':r<.93?'spring':'rocket'});}}}
function start(){if(state!=='pause')reset();state='play';$('overlay').hidden=true;$('hint').style.opacity=peak>20?'0':'1';last=performance.now();beep(330)}
function overlay(mode){state=mode;pointer=null;keys.clear();$('overlay').hidden=false;$('hero').src='assets/hero/'+(mode==='over'?'fall':'idle')+'/00.png';$('start').textContent=mode==='pause'?'RESUME ↑':mode==='over'?'PLAY AGAIN ↑':'TAP TO START ↑';$('message').textContent=mode==='pause'?'Paused':mode==='over'?`You reached ${peak} m · Best ${best} m · ${points} bonus points`:'How high can you go?';$('share').hidden=mode!=='over'}
function finish(){if(peak>best){best=peak;try{localStorage.setItem('higher-best',best)}catch{}$('best').textContent=best+' m'}overlay('over');beep(130)}
$('start').onclick=start;$('pause').onclick=()=>{if(state==='play')overlay('pause');else if(state==='pause')start()};$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♫':'♩';$('sound').setAttribute('aria-pressed',String(sound));beep()};$('sound').setAttribute('aria-pressed','false');$('sound').textContent='♩';$('share').onclick=async()=>{const text=`I reached ${peak} m in Higher & Higher!`;try{if(navigator.share)await navigator.share({title:'Higher & Higher',text,url:location.href});else if(navigator.clipboard){await navigator.clipboard.writeText(text+' '+location.href);$('share').textContent='COPIED!'}else $('message').textContent=text}catch{}};
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','a','d','A','D'].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.key==='Escape'){if(state==='play')overlay('pause');else if(state==='pause')start()}if(e.key===' '&&state!=='play')start()});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();pointer=null;if(state==='play')overlay('pause')});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')overlay('pause')});
function px(e){return (e.clientX-canvas.getBoundingClientRect().left)*W/canvas.getBoundingClientRect().width}canvas.addEventListener('pointerdown',e=>{if(state==='play'){canvas.setPointerCapture(e.pointerId);pointer={id:e.pointerId,x:px(e),target:player.x}}});canvas.addEventListener('pointermove',e=>{if(pointer?.id===e.pointerId){const x=px(e);pointer.target+=x-pointer.x;pointer.x=x}});for(const n of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(n,e=>{if(pointer?.id===e.pointerId)pointer=null});
function spark(x,y,color='#63d7ff',n=9){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*180,vy:Math.random()*170,life:.45,color})}
function update(dt){time+=dt;const p=player;let dir=(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('a')?1:0);let target=dir*285;if(pointer){let diff=pointer.target-p.x;while(diff>W/2)diff-=W;while(diff<-W/2)diff+=W;target=Math.max(-340,Math.min(340,diff*14))}p.vx+=(target-p.vx)*Math.min(1,dt*15);p.x+=p.vx*dt;if(p.x<0)p.x+=W;if(p.x>=W)p.x-=W;if(pointer){while(pointer.target<0)pointer.target+=W;while(pointer.target>=W)pointer.target-=W;}const prev=p.y;p.vy-=1500*dt;p.y+=p.vy*dt;p.boost=Math.max(0,p.boost-dt);for(const q of platforms){if(q.type==='moving')q.x=Math.max(q.w/2,Math.min(W-q.w/2,q.base+Math.sin(time*1.65+q.phase)*37));if(!q.dead&&p.vy<0&&prev>=q.y&&p.y<=q.y&&Math.min(Math.abs(p.x-q.x),W-Math.abs(p.x-q.x))<q.w/2+12){p.y=q.y;p.vy=q.type==='boost'?940:650;if(q.type==='boost')p.boost=.65;if(q.type==='breakable'){q.dead=true;particles.push({x:q.x,y:q.y,vx:0,vy:0,life:.45,color:'#69dfff',broken:true,w:q.w})}spark(p.x,p.y,q.type==='boost'?'#ffde8a':'#5acfff');beep(q.type==='boost'?690:330);break;}}
for(const i of items){if(!i.dead&&Math.abs(p.y+25-i.y)<32&&Math.min(Math.abs(p.x-i.x),W-Math.abs(p.x-i.x))<26){i.dead=true;points+=i.type==='star'?50:10;if(i.type==='spring'||i.type==='rocket'){p.vy=i.type==='rocket'?1100:900;p.boost=.75}spark(i.x,i.y,'#ffdb85',14);beep(760)}}
peak=Math.max(peak,Math.floor(p.y/10));camera=Math.max(camera,p.y-H*.43);generate();platforms=platforms.filter(q=>q.y>camera-180&&!q.dead);items=items.filter(i=>i.y>camera-180&&!i.dead);for(const s of particles){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy-=250*dt;s.life-=dt}particles=particles.filter(s=>s.life>0);$('height').textContent=peak+' m';const zone=zoneAt(peak).label;if($('zone').textContent!==zone)$('zone').textContent=zone;if(peak>20)$('hint').style.opacity='0';if(p.y<camera-100)finish();}
function drawImg(name,x,y,w,h){let group=name.startsWith('hero-')?'hero/'+name.slice(5):name.startsWith('platform-')?'platforms/'+name.slice(9):'collectibles/'+name;let frame=Math.floor(time*8);if(group==='platforms/breakable')frame=0;if(group==='hero/jump')frame=Math.max(1,Math.min(5,Math.floor((650-player.vy)/140)+1));if(group==='hero/fall')frame=Math.min(5,Math.floor(Math.abs(player.vy)/150));const i=sprite(group,frame);if(ready(i)){const ratio=i.naturalWidth/i.naturalHeight;let dw=w,dh=w/ratio;if(group.startsWith('hero/')){dh=h;dw=dh*ratio;paint(i,x+(w-dw)/2,y,dw,dh)}else if(group.startsWith('platforms/')){paint(i,x,y,dw,dh)}else{dh=Math.min(h,w/ratio);dw=dh*ratio;paint(i,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}}else{ctx.fillStyle=group.startsWith('hero/')?'#69dfff':group.startsWith('platforms/')?'#258aff':'#f9d874';ctx.fillRect(x,y,w,h)}}
const zones = [
 {label:'THE LOUNGE', center:0, top:[8,14,34], bottom:[23,28,54]},
 {label:'DUTCH STREETS', center:80, top:[9,18,47], bottom:[31,44,80]},
 {label:'ROOFTOPS', center:225, top:[12,18,52], bottom:[54,49,99]},
 {label:'CLOUD CITY', center:505, top:[12,23,61], bottom:[52,69,117]},
 {label:'DEEP SPACE', center:920, top:[4,6,26], bottom:[24,20,62]},
 {label:'ANOTHER DIMENSION', center:1450, top:[15,6,37], bottom:[51,24,84]},
];

function smooth(from,to,value){
 const t=Math.max(0,Math.min(1,(value-from)/(to-from)));
 return t*t*(3-2*t);
}
function zoneAt(altitude){
 let i=0;
 while(i<zones.length-1&&altitude>=(zones[i].center+zones[i+1].center)/2)i++;
 return zones[i];
}
function hash(n){const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function scenery(name,x,y,w,alpha=1){
 const image=images['environment/'+name];
 if(!ready(image)||alpha<.004)return;
 ctx.globalAlpha=alpha;
 ctx.drawImage(image,x,y,w,w*image.naturalHeight/image.naturalWidth);
 ctx.globalAlpha=1;
}
function wash(top,bottom,y=0,height=H){
 if(height<=0)return;
 const gradient=ctx.createLinearGradient(0,y,0,y+height);
 gradient.addColorStop(0,top);
 gradient.addColorStop(1,bottom);
 ctx.fillStyle=gradient;
 ctx.fillRect(0,y,W,height);
}
function skyline(name,width,base,alpha){
 const image=images['environment/composed/'+name];
 if(!ready(image)||alpha<.004)return;
 const height=width*image.naturalHeight/image.naturalWidth;
 scenery('composed/'+name,(W-width)/2,base-height,width,alpha);
 // Extend the dark ground plane if the architecture is fully inside the viewport.
 if(base<H){
  ctx.globalAlpha=alpha;
  wash('#0b1025','#080d21',base,H-base);
  ctx.globalAlpha=1;
 }
}
function drifting(group,sizes,speed,alpha,seed){
 if(alpha<.004)return;
 const padding=300;
 const span=H+padding*2;
 for(let i=0;i<group.length;i++){
  const w=sizes[i];
  const x=(i%2 ? W-w*.8 : -w*.22)+(hash(seed+i)-.5)*60;
  const y=(span*(i+.28)/group.length+camera*speed)%span-padding;
  scenery('composed/'+group[i],x,y,w,alpha);
 }
}
function lounge(alpha){
 if(alpha<.004)return;
 const floor=H-66+camera*.2;
 const ceiling=floor-324;
 ctx.globalAlpha=alpha;
 wash('#131e3d','#0c132b',0,Math.min(H,floor));
 wash('#181e39','#080f25',floor,Math.max(0,H-floor));
 ctx.fillStyle='#202e4b';
 ctx.fillRect(0,ceiling,W,2);
 ctx.fillRect(0,floor-2,W,2);
 ctx.globalAlpha=1;
 scenery('lounge/sofa',234,floor-177,218,alpha*.83);
 scenery('lounge/window',37,floor-228,121,alpha*.74);
 scenery('lounge/counter',-33,floor-122,305,alpha*.87);
 scenery('lounge/lamp',92,ceiling,52,alpha*.74);
 scenery('lounge/table',277,floor-62,99,alpha*.82);
}

function bg(){
 const altitude=peak;
 let i=0;
 while(i<zones.length-2&&altitude>zones[i+1].center)i++;
 const a=zones[i],b=zones[i+1],blend=smooth(a.center,b.center,altitude);
 const color=key=>'rgb('+a[key].map((v,j)=>Math.round(v+(b[key][j]-v)*blend)).join(',')+')';
 wash(color('top'),color('bottom'));

 const stars=smooth(185,840,altitude);
 if(stars>0){
  for(let j=0;j<65;j++){
   const y=(hash(j+300)*H+camera*.023)%H;
   ctx.globalAlpha=stars*(.19+hash(j+85)*.64);
   ctx.fillStyle='#cde1ff';
   const size=.65+hash(j+160)*1.35;
   ctx.fillRect(hash(j)*W,y,size,size);
  }
  ctx.globalAlpha=1;
 }
 const cloudCity=smooth(250,440,altitude)*(1-smooth(570,800,altitude));
 const space=smooth(585,845,altitude)*(1-smooth(1130,1370,altitude));
 const dimension=smooth(1110,1430,altitude);
 const celestialY=H*.04+90*(1-Math.exp(-camera/8200));
 scenery('composed/moon',-173,celestialY-28,710,cloudCity*.74);
 scenery('composed/planet',-146,celestialY-38,710,space*.95);
 // Colorize the existing illustrated planet for the final zone.
 if(dimension>.004){
  ctx.filter='hue-rotate(54deg)';
  scenery('composed/planet',-248,0,870,dimension*.89);
  ctx.filter='none';
 }

 const city=smooth(13,67,altitude)*(1-smooth(255,415,altitude));
 const streetShift=Math.min(150,camera*.11);
 skyline('night',W*1.48,H-126+streetShift*.43,city*.83);
 skyline('twilight',W*1.42,H-73+streetShift*.9,city*.77*smooth(63,157,altitude));
 const street=city*(1-smooth(107,226,altitude));
 const roofs=city*smooth(92,197,altitude);
 skyline('street',W*1.15,H+37+streetShift*.43,street*.86);
 skyline('roofs',W*1.16,H+24+streetShift*.5,roofs*.80);

 const clouds=smooth(122,365,altitude)*(1-smooth(595,835,altitude));
 drifting(['cloud-high','cloud-low','cloud-bank','cloud-high'],[270,260,390,310],.048,clouds*.39,130);
 drifting(['islands','islands'],[233,285],.076,cloudCity*.82*smooth(363,455,altitude),210);
 drifting(['cloud-bank','cloud-low','cloud-high'],[290,225,260],.15,clouds*.32,330);
 drifting(['islands','islands'],[188,240],.044,dimension*.48*smooth(1185,1425,altitude),420);

 lounge(1-smooth(13,73,altitude));
 wash('rgba(4,9,26,.28)','rgba(6,10,26,.16)');
}
function draw(){ctx.setTransform(scale,0,0,scale,0,0);bg();const sy=y=>H-100-(y-camera);for(const q of platforms){const y=sy(q.y);if(y<-40||y>H+40)continue;drawImg('platform-'+q.type,q.x-q.w/2,y-2,q.w,24)}for(const i of items){const y=sy(i.y);drawImg(i.type,i.x-13,y-13,26,26)}for(const s of particles){ctx.globalAlpha=s.life/.45;ctx.fillStyle=s.color;if(s.broken){const i=sprite('platforms/breakable',Math.min(3,1+Math.floor((.45-s.life)*7)));paint(i,s.x-s.w/2,sy(s.y),s.w,s.w*.34)}else ctx.fillRect(s.x,sy(s.y),3,3)}ctx.globalAlpha=1;if(player){let p=player,y=sy(p.y),name=p.boost>0?'boost':p.vy>0?'jump':'fall';for(const x of [p.x,p.x-W,p.x+W]){if(x<-40||x>W+40)continue;ctx.save();ctx.translate(x,y);if(p.vx<-15)ctx.scale(-1,1);drawImg('hero-'+name,-35,-83.5,70,87.5);ctx.restore()}}}
function frame(t){let dt=Math.min(.04,Math.max(0,(t-last)/1000));last=t;if(state==='play'){for(let n=0;n<3;n++)if(state==='play')update(dt/3)}draw();requestAnimationFrame(frame)}reset();overlay('menu');requestAnimationFrame(frame);
