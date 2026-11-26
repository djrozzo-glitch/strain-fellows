'use strict';

const gameAudio = (() => {
 const preference = 'higher-sound';
 let enabled = true;
 try { enabled = localStorage.getItem(preference) !== 'off'; } catch {}

 // Each tone describes its wave, start and end pitches, duration, level and delay.
 // Noise layers use their pitches to sweep a low-pass filter.
 const cues = {
  start: [['triangle',330,330,.17,.11,0],['triangle',440,440,.19,.095,.075],['sine',660,660,.24,.10,.16]],
  resume: [['sine',440,587,.12,.11,0],['triangle',659,659,.16,.07,.06]],
  pause: [['sine',490,260,.13,.09,0]],
  jump: [['sine',245,410,.106,.075,0],['triangle',108,65,.055,.055,0]],
  moving: [['sine',275,500,.11,.075,0],['triangle',540,590,.085,.04,.033]],
  breakable: [['noise',3300,620,.14,.11,0],['triangle',185,94,.105,.085,0]],
  boost: [['triangle',175,600,.23,.11,0],['sine',410,1110,.19,.08,.055]],
  coin: [['triangle',850,850,.085,.095,0],['sine',1275,1275,.135,.10,.049]],
  star: [['sine',660,660,.14,.095,0],['sine',988,988,.18,.085,.042],['triangle',1320,1320,.22,.055,.086]],
  spring: [['triangle',153,585,.24,.12,0],['sine',640,360,.13,.07,.16]],
  rocket: [['noise',320,3400,.34,.082,0],['sine',108,440,.31,.13,0],['triangle',360,880,.19,.055,.14]],
  cookie: [['triangle',540,162,.14,.09,0],['triangle',260,780,.085,.075,.11],['square',500,710,.075,.025,.18],['sine',1046,523,.27,.09,.24]],
  'green-cloud': [['noise',440,1800,.36,.125,0],['noise',2100,360,.46,.078,.17],['sine',90,335,.29,.105,.052]],
  espresso: [['noise',2800,1100,.12,.065,0],['triangle',466,466,.11,.09,.03],['triangle',698,698,.17,.08,.11]],
  'combo-1': [['triangle',440,550,.15,.09,0],['sine',660,660,.14,.08,.055]],
  'combo-2': [['triangle',554,690,.15,.09,0],['sine',830,830,.15,.08,.055]],
  'combo-3': [['triangle',660,660,.15,.10,0],['sine',988,988,.16,.085,.055],['triangle',1320,1320,.25,.065,.11]],
  zone: [['sine',349,349,.34,.085,0],['triangle',523,523,.34,.054,.09],['sine',784,784,.4,.08,.18]],
  over: [['triangle',392,392,.16,.099,0],['triangle',311,311,.16,.088,.12],['sine',196,117,.27,.105,.23]],
  record: [['triangle',392,392,.17,.1,0],['triangle',494,494,.17,.09,.075],['triangle',587,587,.18,.085,.15],['sine',784,784,.4,.115,.235]]
 };

 let context, master, noise;
 let unlockPending = false;
 let requestedCue;
 const lastPlayed = new Map();

 function schedule(name) {
  const now = context.currentTime;
  if (now - (lastPlayed.get(name) ?? -1) < .045) return;
  lastPlayed.set(name, now);

  for (const [wave,from,to,duration,level,delay] of cues[name]) {
   const start = now + delay;
   const end = start + duration;
   let source;
   let filter;
   if (wave === 'noise') {
    source = context.createBufferSource();
    source.buffer = noise;
    filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(from,start);
    filter.frequency.exponentialRampToValueAtTime(to,end);
    source.connect(filter);
   } else {
    source = context.createOscillator();
    source.type = wave;
    source.frequency.setValueAtTime(from,start);
    source.frequency.exponentialRampToValueAtTime(to,end);
   }
   const envelope = context.createGain();
   envelope.gain.setValueAtTime(.0001,start);
   envelope.gain.exponentialRampToValueAtTime(level,start+.007);
   envelope.gain.exponentialRampToValueAtTime(.0001,end);
   (filter || source).connect(envelope);
   envelope.connect(master);
   source.onended = () => {
    source.disconnect();
    filter?.disconnect();
    envelope.disconnect();
   };
   source.start(start);
   source.stop(end);
  }
 }

 function unlock(name) {
  if (!enabled) return;
  try {
   if (!context) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    context = new Audio();
    master = context.createGain();
    master.gain.value = .75;
    master.connect(context.destination);
    noise = context.createBuffer(1,Math.ceil(context.sampleRate*.5),context.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i=0;i<samples.length;i++) samples[i] = Math.random()*2-1;
   }
   if (context.state === 'running') {
    if (name) schedule(name);
    return;
   }
   if (name) requestedCue = name;
   if (unlockPending) return;
   unlockPending = true;
   context.resume().then(() => {
    if (enabled && context.state === 'running' && requestedCue) schedule(requestedCue);
   }).catch(() => {}).finally(() => {
    requestedCue = undefined;
    unlockPending = false;
   });
  } catch {
   // Sound can be unavailable while the game remains playable.
  }
 }

 function play(name) {
  if (enabled && context?.state === 'running') schedule(name);
 }

 function toggle() {
  enabled = !enabled;
  try { localStorage.setItem(preference,enabled?'on':'off'); } catch {}
  if (master) {
   master.gain.cancelScheduledValues(context.currentTime);
   master.gain.setTargetAtTime(enabled?.75:0,context.currentTime,.012);
  }
  if (enabled) unlock('resume');
  else requestedCue = undefined;
  return enabled;
 }

 return {unlock,play,toggle,isEnabled:()=>enabled};
})();
