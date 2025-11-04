// Fixed CodeBeats Studio — melody keys, teach/demo/stop, same neon vibe

// ------------------- UI refs -------------------
const typeBox = document.getElementById('typeBox');
const instrSelect = document.getElementById('instr');
const typingModeEl = document.getElementById('typingMode');
const bpmEl = document.getElementById('bpm');
const keyboardEl = document.getElementById('keyboard');
const teachBtn = document.getElementById('teachBtn');
const demoBtn = document.getElementById('demoBtn');
const stopBtn = document.getElementById('stopBtn');
const songSelect = document.getElementById('songSelect');
const statusEl = document.getElementById('status');
const motivateEl = document.getElementById('motivate');
const lyricsDiv = document.getElementById('lyrics');
const canvas = document.getElementById('vis');
const ctx = canvas.getContext('2d');

// ------------------- Tone instruments -------------------
let pianoSampler, fmSynth, pluckSynth, drumSynth;
let toneReady = false;
async function initTone(){
  try{
    await Tone.start();
  }catch(e){
    console.warn('Tone start failed:', e);
  }
  Tone.Transport.bpm.value = parseInt(bpmEl.value) || 90;

  // Sampler uses a few samples; it will pitch-shift to play other notes reliably.
  pianoSampler = new Tone.Sampler({
    urls: { "A4":"A4.mp3","C4":"C4.mp3","D4":"D4.mp3","E4":"E4.mp3","F4":"F4.mp3","G4":"G4.mp3","B4":"B4.mp3" },
    baseUrl: "https://tonejs.github.io/audio/salamander/"
  }).toDestination();

  fmSynth = new Tone.FMSynth({modulationIndex:8, harmonicity:2}).toDestination();
  pluckSynth = new Tone.PluckSynth().toDestination();
  drumSynth = new Tone.MembraneSynth().toDestination();

  toneReady = true;
  statusEl.innerText = "Audio enabled — ready to play.";
}
document.addEventListener('click', ()=> { if(!toneReady) initTone(); }, {once:true});

// ------------------- keyboard mapping -------------------
const keyMap = {
  'z':'C3','s':'C#3','x':'D3','d':'D#3','c':'E3','v':'F3','g':'F#3','b':'G3','h':'G#3','n':'A3','j':'A#3','m':'B3',
  'q':'C4','2':'C#4','w':'D4','3':'D#4','e':'E4','r':'F4','5':'F#4','t':'G4','6':'G#4','y':'A4','7':'A#4','u':'B4',
  'i':'C5','9':'C#5','o':'D5','0':'D#5','p':'E5','[':'F5',']':'F#5'
};

// build visible keyboard
function buildKeyboard(){
  keyboardEl.innerHTML = '';
  Object.entries(keyMap).forEach(([k,note])=>{
    const el = document.createElement('div');
    el.className = 'key';
    el.dataset.key = k;
    el.dataset.note = note;
    el.innerHTML = `<div class="name">${note}</div><div class="k">${k.toUpperCase()}</div>`;
    el.addEventListener('mousedown', ()=> playNoteFromKey(k));
    keyboardEl.appendChild(el);
  });
}
buildKeyboard();

// ------------------- song library -------------------
const songs = {
  "Twinkle Twinkle": { bpm:80, seq:[
    {note:"C4",dur:"8n",lyric:"Twin"},{note:"C4",dur:"8n",lyric:"kle"},{note:"G4",dur:"8n"},{note:"G4",dur:"8n"},
    {note:"A4",dur:"8n"},{note:"A4",dur:"8n"},{note:"G4",dur:"4n",lyric:"Star"} ] },

  "Why This Kolaveri Di": {
    bpm: 92,
    seq:[
      {note:"E4",dur:"8n"},{note:"E4",dur:"8n"},{note:"F4",dur:"8n"},{note:"G4",dur:"8n"},
      {note:"G4",dur:"8n"},{note:"F4",dur:"8n"},{note:"E4",dur:"8n"},{note:"D4",dur:"8n"},
      {note:"E4",dur:"8n"},{note:"E4",dur:"8n"},{note:"F4",dur:"8n"},{note:"G4",dur:"8n"},
      {note:"A4",dur:"8n"},{note:"A4",dur:"8n"},{note:"G4",dur:"4n"}
    ], info: "Tamil (melody snippet)"
  },

  "Vaseegara": { bpm:72, seq:[
    {note:"C4",dur:"8n"},{note:"D4",dur:"8n"},{note:"E4",dur:"4n"},
    {note:"F4",dur:"8n"},{note:"E4",dur:"8n"},{note:"D4",dur:"4n"},{note:"C4",dur:"2n"} ] },

  "Kanave Kanave": { bpm:74, seq:[
    {note:"A4",dur:"8n"},{note:"G4",dur:"8n"},{note:"F4",dur:"8n"},{note:"E4",dur:"8n"},
    {note:"D4",dur:"8n"},{note:"E4",dur:"4n"} ] },

  "Enjoy Enjaami": { bpm:96, seq:[
    {note:"C4",dur:"8n"},{note:"E4",dur:"8n"},{note:"G4",dur:"8n"},{note:"E4",dur:"8n"},
    {note:"D4",dur:"4n"},{note:"C4",dur:"4n"} ] },

  "Happy Birthday": { bpm:80, seq:[
    {note:"C4",dur:"8n"},{note:"C4",dur:"8n"},{note:"D4",dur:"4n"},{note:"C4",dur:"4n"},{note:"F4",dur:"4n"},{note:"E4",dur:"2n"} ] }
};

function populateSongs(){
  songSelect.innerHTML = '';
  Object.keys(songs).forEach(k=>{
    const opt = document.createElement('option'); opt.value=k; opt.innerText=k;
    songSelect.appendChild(opt);
  });
}
populateSongs();

// ------------------- visual canvas -------------------
function resizeCanvas(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();
let particles = [];
function spawn(x,y,hue){
  for(let i=0;i<6;i++){
    particles.push({x:x + (Math.random()-0.5)*40, y:y + (Math.random()-0.5)*40, vx:(Math.random()-0.5)*2, vy:-Math.random()*2, r:6+Math.random()*6, a:1, hue});
  }
}
function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.a -= 0.02; p.r *= 0.99;
    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue},80%,60%,${Math.max(0,p.a)})`;
    ctx.arc(p.x,p.y, Math.max(0.5,p.r), 0, Math.PI*2);
    ctx.fill();
    if(p.a <= 0.02) particles.splice(i,1);
  }
  requestAnimationFrame(render);
}
render();

// ------------------- helpers -------------------
function noteToHue(note){
  try{ const midi = Tone.Frequency(note).toMidi(); return (midi % 128) / 128 * 360; }
  catch(e){ return Math.random()*360; }
}
function setBackgroundHue(h){
  // smooth transition
  document.body.style.transition = 'background 700ms ease';
  const h1 = h; const h2 = (h+60)%360; const h3 = (h+180)%360;
  document.body.style.background = `linear-gradient(120deg, hsl(${h1} 60% 12%), hsl(${h2} 50% 20%), hsl(${h3} 40% 30%))`;
  document.getElementById('bgFilter').style.background = `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.02), transparent),
    radial-gradient(circle at 80% 80%, rgba(255,255,255,0.01), transparent)`;
}
function centerOfKey(note){
  const el = Array.from(document.querySelectorAll('.key')).find(k => k.dataset.note === note);
  if(!el) return {x: window.innerWidth/2, y: window.innerHeight/2};
  const r = el.getBoundingClientRect();
  return {x: r.left + r.width/2, y: r.top + r.height/3};
}

// ------------------- play note wrapper with safe fallback -------------------
async function playNoteWithInstrument(note, dur='8n'){
  if(!toneReady) await initTone();
  try{
    const mode = instrSelect.value;
    if(mode === 'piano' || mode === 'combo'){
      if(pianoSampler && pianoSampler.triggerAttackRelease) pianoSampler.triggerAttackRelease(note, dur);
      else fmSynth.triggerAttackRelease(note,dur);
    } else if(mode === 'synth'){
      fmSynth.triggerAttackRelease(note, dur);
    } else if(mode === 'pluck'){
      pluckSynth.triggerAttackRelease(note, dur);
    } else if(mode === 'drum'){
      drumSynth.triggerAttackRelease('C2','8n');
    }
    if(mode === 'combo'){ // extra drum flair
      drumSynth.triggerAttackRelease('C2','8n');
    }
  } catch(err){
    console.warn('playNote error, falling back to synth:', err);
    try { fmSynth.triggerAttackRelease(note,dur); } catch(e){ /* ignore */ }
  }
}

// ------------------- UI highlight -------------------
function highlightNoteUI(note){
  const keyEl = Array.from(document.querySelectorAll('.key')).find(k => k.dataset.note === note);
  if(keyEl){
    keyEl.classList.add('play','glow');
    setTimeout(()=> keyEl.classList.remove('play'), 160);
    setTimeout(()=> keyEl.classList.remove('glow'), 600);
  }
}

// ------------------- keyboard click handling -------------------
async function playNoteFromKey(k){
  if(!toneReady) await initTone();
  const note = keyMap[k];
  if(!note) return;
  const mode = typingModeEl.value;
  if(mode === 'melody' || mode === 'both') await playNoteWithInstrument(note,'8n');
  if(mode === 'drum' || mode === 'both') drumSynth.triggerAttackRelease('C2','8n');
  highlightNoteUI(note);
  const hue = noteToHue(note);
  setBackgroundHue(hue);
  spawn(centerOfKey(note).x, centerOfKey(note).y, hue);
  statusEl.innerText = `Played ${note}`;
}

// physical keyboard for keyboard area (not typing area)
window.addEventListener('keydown', (e)=>{
  const active = document.activeElement;
  if(active && active === typeBox) return; // when typing, typeBox handles sound
  const k = e.key.toLowerCase();
  if(keyMap[k]){ e.preventDefault(); playNoteFromKey(k); }
  if(e.code === 'Space'){ e.preventDefault(); demoBtn.click(); }
  if(e.key === 'Escape'){ stopBtn.click(); }
});

// add click listeners to built keys
document.querySelectorAll('.key').forEach(el=>{
  const k = el.dataset.key;
  el.addEventListener('mousedown', ()=> playNoteFromKey(k));
});

// ------------------- typing -> sound -------------------
let lastPlayTime = 0;
typeBox.addEventListener('keydown', async (e)=>{
  if(!toneReady) await initTone();
  const nowTime = Date.now();
  if(nowTime - lastPlayTime < 35) return; // small throttle
  lastPlayTime = nowTime;

  const mode = typingModeEl.value;
  const char = e.key.toLowerCase();
  let mappedNote = null;
  if(keyMap[char]) mappedNote = keyMap[char];
  else {
    const pent = ['C4','D4','E4','G4','A4','C5'];
    mappedNote = pent[Math.floor(Math.random()*pent.length)];
  }

  if(mode === 'melody'){
    await playNoteWithInstrument(mappedNote,'8n');
  } else if(mode === 'drum'){
    drumSynth.triggerAttackRelease('C2','8n');
  } else { // both
    await playNoteWithInstrument(mappedNote,'8n');
    drumSynth.triggerAttackRelease('C2','8n');
  }

  highlightNoteUI(mappedNote);
  const hue = noteToHue(mappedNote);
  setBackgroundHue(hue);
  spawn(centerOfKey(mappedNote).x, centerOfKey(mappedNote).y, hue);
});

// ------------------- Learn Mode scheduling -------------------
let scheduledIds = [];
function clearScheduled(){
  // clear timeouts
  scheduledIds.forEach(id => clearTimeout(id));
  scheduledIds = [];
  // clear displayed lyrics
  if(lyricsDiv) lyricsDiv.innerText = '';
  // stop transport just in case
  try{ Tone.Transport.stop(); Tone.Transport.cancel(); } catch(e){}
}
async function playSequence(seq, bpmOverride){
  clearScheduled();
  if(!toneReady) await initTone();
  const bpm = bpmOverride || parseInt(bpmEl.value) || 90;
  let timeAcc = 0;
  Tone.Transport.bpm.value = bpm;

  seq.forEach((item, idx)=>{
    const dur = item.dur || '8n';
    const durSec = Tone.Time(dur).toSeconds();
    const id = setTimeout(async ()=>{
      await playNoteWithInstrument(item.note, dur);
      if(instrSelect.value === 'combo' || instrSelect.value === 'drum') drumSynth.triggerAttackRelease('C2','8n');
      highlightNoteUI(item.note);
      const hue = noteToHue(item.note);
      setBackgroundHue(hue);
      const pos = centerOfKey(item.note);
      spawn(pos.x,pos.y,hue);
      if(item.lyric) lyricsDiv.innerText = item.lyric;
      if(idx === seq.length - 1){
        statusEl.innerText = 'Finished playing sequence';
        motivateEl.innerText = 'Nice! Try Practice Mode to play it yourself.';
        setTimeout(()=> motivateEl.innerText = 'Music is practice + patience — keep playing 🎵', 3000);
      }
    }, Math.round(timeAcc * 1000));
    scheduledIds.push(id);
    timeAcc += durSec;
  });
}

// teach & demo & stop handlers
teachBtn.addEventListener('click', ()=>{
  const name = songSelect.value;
  if(!name || !songs[name]) { statusEl.innerText = 'Please pick a valid song.'; return; }
  statusEl.innerText = `Teaching ${name}...`;
  playSequence(songs[name].seq, songs[name].bpm);
});
demoBtn.addEventListener('click', ()=> { teachBtn.click(); });
stopBtn.addEventListener('click', ()=> { clearScheduled(); statusEl.innerText = 'Stopped'; });

// bpm changes
bpmEl.addEventListener('change', ()=> { Tone.Transport.bpm.value = parseInt(bpmEl.value) || 90; });

// instrument UI feedback
instrSelect.addEventListener('change', ()=> {
  statusEl.innerText = `Instrument: ${instrSelect.value}`;
  motivateEl.innerText = `Instrument changed to ${instrSelect.value} — find your vibe!`;
  setTimeout(()=> motivateEl.innerText = 'Music is practice + patience — keep playing 🎵', 3000);
});

// initial UI
songSelect.value = Object.keys(songs)[0];
statusEl.innerText = 'Click anywhere to enable audio, then type to play.';
motivateEl.innerText = 'Try switching instruments — piano feels warm, pluck feels bright.';

// cleanup
window.addEventListener('beforeunload', ()=> clearScheduled());
