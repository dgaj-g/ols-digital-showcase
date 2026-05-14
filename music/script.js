// Music — Irish Musical Traditions (Tone.js)
// Synthesised tin whistle, fiddle and bodhrán play sequences in jig, reel
// and hornpipe rhythms. Identify-the-dance quiz tests pupils' ear.

let toneReady = false;
let synths = {};
let bodran;

async function ensureTone() {
  if (toneReady) return;
  await Tone.start();
  // Tin whistle — triangle, light reverb
  const verb = new Tone.Reverb({ decay: 1.4, wet: 0.25 }).toDestination();
  synths.tinWhistle = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.6, release: 0.4 }
  }).connect(verb);
  synths.tinWhistle.volume.value = -8;
  // Fiddle — sawtooth/AM with vibrato
  const fdlVerb = new Tone.Reverb({ decay: 1.2, wet: 0.2 }).toDestination();
  synths.fiddle = new Tone.AMSynth({
    harmonicity: 2,
    detune: 5,
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.04, decay: 0.2, sustain: 0.5, release: 0.5 }
  }).connect(fdlVerb);
  synths.fiddle.volume.value = -12;
  // Bodhrán — noise burst with envelope (Tone.NoiseSynth)
  bodran = new Tone.NoiseSynth({
    noise: { type: "brown" },
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.05 }
  }).toDestination();
  bodran.volume.value = -10;
  toneReady = true;
}

// ---- Audio fallback feedback for non-Tone moments
let ac;
function tone2(f, ms, type="sine", g=0.05) {
  try { ac = ac || new (window.AudioContext||window.webkitAudioContext)();
    const o = ac.createOscillator(); const gn = ac.createGain();
    o.type=type; o.frequency.value=f; gn.gain.value=g;
    o.connect(gn); gn.connect(ac.destination); o.start();
    gn.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + ms/1000);
    o.stop(ac.currentTime + ms/1000 + 0.02);
  } catch {}
}
function ding() { tone2(660,80,"triangle",0.05); setTimeout(()=>tone2(990,100,"triangle",0.05),70); }
function buzz() { tone2(180,200,"sawtooth",0.05); }
function fanfare() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone2(f,200,"triangle",0.05),i*110)); }

// ---- Instruments definitions ----
const INSTRUMENTS = [
  {
    id: "tinWhistle", name: "Tin Whistle",
    desc: "High-pitched 6-hole flute. Plays the melody.",
    icon: `<svg viewBox="0 0 40 40" fill="none" stroke="#D9A24A" stroke-width="2"><rect x="6" y="14" width="28" height="6" rx="2"/><circle cx="12" cy="17" r="1.5"/><circle cx="18" cy="17" r="1.5"/><circle cx="24" cy="17" r="1.5"/><circle cx="30" cy="17" r="1.5"/></svg>`,
    sample: { notes: ["D5","E5","F#5","G5","A5","G5","F#5","E5"], dur: "8n" }
  },
  {
    id: "fiddle", name: "Fiddle",
    desc: "Violin played 'Irish style'. Drives the rhythm and melody.",
    icon: `<svg viewBox="0 0 40 40" fill="none" stroke="#D9A24A" stroke-width="2"><ellipse cx="20" cy="22" rx="8" ry="11"/><line x1="20" y1="2" x2="20" y2="13"/><circle cx="20" cy="22" r="1.5" fill="#D9A24A"/><line x1="14" y1="14" x2="26" y2="14"/></svg>`,
    sample: { notes: ["D4","A4","D5","A4","B4","A4","G4","F#4"], dur: "8n" }
  },
  {
    id: "bodhrán", name: "Bodhrán",
    desc: "Hand-held frame drum. Keeps the pulse of the dance.",
    icon: `<svg viewBox="0 0 40 40" fill="none" stroke="#D9A24A" stroke-width="2"><circle cx="20" cy="20" r="14"/><line x1="8" y1="20" x2="32" y2="20"/><line x1="20" y1="8" x2="20" y2="32"/></svg>`,
    sample: null
  },
];

// dance form definitions
// Each dance now uses a distinct tempo AND a distinctively shaped melody +
// bodhrán pattern, so even a non-musician can hear the difference.
// Notes are now {note, dur} pairs so we can give the hornpipe its dotted swing.
const DANCES = {
  jig: {
    name: "Jig",
    time: "6/8",
    bpm: 96,
    desc: "<strong>Six-eight time</strong> — two groups of three quavers per bar (ONE-two-three, ONE-two-three). A skipping, lilting feel. The melody and bodhrán both lean strongly on beats 1 and 4 of each bar.",
    // 4 bars, each bar = 6 eighth-notes. Melody emphasises beat 1 and 4 (group starts).
    melody: {
      tinWhistle: [
        // bar 1: G-E-D F-A-G        ONE-two-three FOUR-five-six
        "G5","E5","D5","F5","A5","G5",
        // bar 2:
        "G5","F5","E5","D5","E5","F5",
        // bar 3:
        "G5","E5","D5","F5","A5","G5",
        // bar 4 (cadence):
        "G5","A5","F5","D5","E5","D5",
      ],
      fiddle: [
        "D4","D4","D4","A4","A4","A4",
        "G4","G4","G4","D4","D4","D4",
        "D4","D4","D4","A4","A4","A4",
        "G4","A4","D4","D4","D4","D4",
      ],
      noteDur: "8n",
    },
    // drum pattern is 6 sixteenth slots — BOOM on 1, light tap on 4 only.
    // The "x" is hard, the "." is silence, "h" is a light hand-stroke.
    drumPattern: ["X",".",".","x",".","."],
    subdivisions: 24,
  },
  reel: {
    name: "Reel",
    time: "4/4",
    bpm: 124,
    desc: "<strong>Four-four time</strong> — even quavers, ONE-two-three-four with eight quavers per bar. Driving, level pulse. The bodhrán hits every beat. The most common Irish trad form.",
    melody: {
      tinWhistle: [
        // bar 1: rising scalar passage typical of a reel
        "D5","E5","F#5","G5","A5","G5","F#5","E5",
        // bar 2:
        "D5","F#5","A5","F#5","D5","F#5","A5","F#5",
        // bar 3:
        "G5","A5","B5","A5","G5","F#5","E5","D5",
        // bar 4:
        "D5","F#5","A5","F#5","D5","E5","F#5","D5",
      ],
      fiddle: [
        "D4","A4","D4","A4","D4","A4","D4","A4",
        "D4","A4","D4","A4","D4","A4","D4","A4",
        "G4","D5","G4","D5","G4","D5","G4","D5",
        "D4","A4","D4","A4","D4","A4","D4","A4",
      ],
      noteDur: "8n",
    },
    // BOOM on every beat (1,3,5,7 in 8-eighth-note bar) — steady driving pulse
    drumPattern: ["X",".","x",".","X",".","x","."],
    subdivisions: 32,
  },
  hornpipe: {
    name: "Hornpipe",
    time: "4/4 swung",
    bpm: 92,
    desc: "<strong>Four-four with a heavily dotted swing</strong> — LOOOONG-short, LOOOONG-short. Slower than a reel, with each pair of quavers played as a dotted-eighth + sixteenth. Often performed in hard shoes — you can almost hear the heel.",
    // Hornpipe melody — pairs of notes per beat, swung
    melody: {
      tinWhistle: [
        // each "LONG-short" pair = 8n. + 16n
        "D5","F#5","A5","F#5","D5","F#5","A5","F#5",
        "G5","B5","D5","B5","G5","B5","D5","B5",
        "F#5","A5","D5","A5","F#5","A5","D5","A5",
        "D5","F#5","G5","A5","F#5","D5","A4","D5",
      ],
      fiddle: [
        "D4","D4","A4","A4","D4","D4","A4","A4",
        "G4","G4","D5","D5","G4","G4","D5","D5",
        "D4","D4","A4","A4","D4","D4","A4","A4",
        "G4","G4","D4","D4","A4","A4","D4","D4",
      ],
      // alternating long-short
      durs: ["8n.","16n","8n.","16n","8n.","16n","8n.","16n",
             "8n.","16n","8n.","16n","8n.","16n","8n.","16n",
             "8n.","16n","8n.","16n","8n.","16n","8n.","16n",
             "8n.","16n","8n.","16n","8n.","16n","8n.","16n"],
    },
    // BOOM on beats 1 and 3 (the down-beats of the swung pairs)
    drumPattern: ["X",".",".",".","x",".",".","."],
    subdivisions: 32,
  },
};

let activeDance = null;
let muted = { tinWhistle: false, fiddle: false, "bodhrán": false };
let part = null;

// ---- DOM
const instrumentRow = document.getElementById("instrumentRow");
const sessionFb = document.getElementById("sessionFb");
const danceDesc = document.getElementById("danceDesc");
const danceButtons = document.querySelectorAll(".dance-btn");
const btnPlayDance = document.getElementById("btnPlayDance");
const btnStop = document.getElementById("btnStop");
const tempo = document.getElementById("tempo");
const tempoVal = document.getElementById("tempoVal");

// Render instruments
INSTRUMENTS.forEach(ins => {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "instrument";
  el.dataset.id = ins.id;
  el.innerHTML = `${ins.icon}<div><div class="ins-name">${ins.name}</div><div class="ins-desc">${ins.desc}</div></div>`;
  el.addEventListener("click", async () => {
    await ensureTone();
    if (ins.id === "bodhrán") {
      // play a short rhythm
      const now = Tone.now();
      for (let i = 0; i < 6; i++) bodran.triggerAttack(now + i * 0.18);
    } else if (ins.sample) {
      const s = synths[ins.id];
      const start = Tone.now();
      ins.sample.notes.forEach((n, i) => {
        s.triggerAttackRelease(n, ins.sample.dur, start + i * 0.18);
      });
    }
    sessionFb.innerHTML = `Playing <strong>${ins.name}</strong>. Try mixing — Shift-click an instrument to toggle mute when an ensemble is playing.`;
    sessionFb.className = "mus-feedback ok";
    el.classList.add("playing");
    setTimeout(() => el.classList.remove("playing"), 1600);
  });
  // mute toggle with shift-click during playback
  el.addEventListener("contextmenu", e => {
    e.preventDefault();
    muted[ins.id] = !muted[ins.id];
    el.classList.toggle("muted", muted[ins.id]);
  });
  instrumentRow.appendChild(el);
});

// Dance form buttons — selecting one snaps the tempo slider to the dance's
// intrinsic bpm (user can still drag the slider afterwards to change it).
danceButtons.forEach(b => {
  b.addEventListener("click", () => {
    danceButtons.forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    activeDance = b.dataset.dance;
    const d = DANCES[activeDance];
    danceDesc.innerHTML = d.desc;
    tempo.value = d.bpm;
    tempoVal.textContent = d.bpm;
    if (toneReady) Tone.Transport.bpm.value = d.bpm;
  });
});

tempo.addEventListener("input", () => { tempoVal.textContent = tempo.value; if (toneReady) Tone.Transport.bpm.value = parseInt(tempo.value, 10); });

btnPlayDance.addEventListener("click", async () => {
  if (!activeDance) { sessionFb.innerHTML = "Pick a dance form first."; sessionFb.className = "mus-feedback bad"; return; }
  await ensureTone();
  playDance(activeDance);
});
btnStop.addEventListener("click", () => { stopAll(); });

function stopAll() {
  if (!toneReady) return;
  if (part) { part.stop(); part.dispose(); part = null; }
  Tone.Transport.stop();
  Tone.Transport.cancel(0);
  document.querySelectorAll(".instrument.playing").forEach(x => x.classList.remove("playing"));
}

function playDance(danceId) {
  stopAll();
  const d = DANCES[danceId];
  // Each dance has its own intrinsic tempo — the slider acts as an override
  // but defaults to the dance's bpm.
  Tone.Transport.bpm.value = parseInt(tempo.value, 10);

  const events = [];
  const drumLen  = d.drumPattern.length;       // 8th-notes per bar (6 for jig, 8 for reel/hornpipe)
  const ticksPerBar = drumLen * 2;             // 16th-notes per bar
  const bars = Math.floor(d.melody.tinWhistle.length / drumLen);

  // Place each melody note at its 16th-note tick offset within the loop.
  // For the hornpipe, alternate dotted-8th + 16th to give the swung feel.
  function tickAt(step) {
    if (danceId !== "hornpipe") return step * 2; // straight 8ths
    const bar = Math.floor(step / 8);
    const within = step % 8;
    // 3+1 swing pattern over each beat: long-short long-short long-short long-short
    const swing = [0, 3, 4, 7, 8, 11, 12, 15];
    return bar * 16 + swing[within];
  }
  function noteDur(step) {
    if (danceId !== "hornpipe") return d.melody.noteDur || "8n";
    return step % 2 === 0 ? "8n." : "16n";
  }

  if (!muted.tinWhistle) {
    d.melody.tinWhistle.forEach((n, i) => {
      events.push({ time: `0:0:${tickAt(i)}`, note: n, instr: "tinWhistle", dur: noteDur(i) });
    });
  }
  if (!muted.fiddle) {
    d.melody.fiddle.forEach((n, i) => {
      events.push({ time: `0:0:${tickAt(i)}`, note: n, instr: "fiddle", dur: noteDur(i) });
    });
  }
  // Bodhrán loops the drum pattern across every bar.
  // "X" = hard accented hit, "x" = light hit.
  if (!muted["bodhrán"]) {
    for (let bar = 0; bar < bars; bar++) {
      for (let i = 0; i < drumLen; i++) {
        const c = d.drumPattern[i];
        if (c === ".") continue;
        const tick = bar * ticksPerBar + i * 2;
        events.push({ time: `0:0:${tick}`, drum: c });
      }
    }
  }

  const totalTicks = bars * ticksPerBar;
  part = new Tone.Part((time, ev) => {
    if (ev.instr === "tinWhistle") synths.tinWhistle.triggerAttackRelease(ev.note, ev.dur || "8n", time);
    if (ev.instr === "fiddle")     synths.fiddle.triggerAttackRelease(ev.note, ev.dur || "8n", time);
    if (ev.drum) {
      // Hard "X" hit is louder than light "x" hit so the meter accent is audible.
      bodran.volume.value = ev.drum === "X" ? -6 : -16;
      bodran.triggerAttack(time);
    }
  }, events);
  part.loop = true;
  part.loopEnd = `0:0:${totalTicks}`;
  part.start(0);
  Tone.Transport.start();
  sessionFb.innerHTML = `Playing a <strong>${d.name}</strong> at ${parseInt(tempo.value, 10)} bpm in ${d.time}. ${d.desc.replace(/<[^>]+>/g, "")}`;
  sessionFb.className = "mus-feedback ok";
}

// ---- Tabs ----
const tabSession = document.getElementById("tabSession");
const tabQuiz = document.getElementById("tabQuiz");
const paneSession = document.getElementById("paneSession");
const paneQuiz = document.getElementById("paneQuiz");
tabSession.addEventListener("click", () => { tabSession.classList.add("active"); tabQuiz.classList.remove("active"); paneSession.hidden = false; paneQuiz.hidden = true; stopAll(); });
tabQuiz.addEventListener("click",    () => { tabQuiz.classList.add("active"); tabSession.classList.remove("active"); paneSession.hidden = true; paneQuiz.hidden = false; stopAll(); startQuiz(); });

// ---- Quiz ----
const qIdx = document.getElementById("qIdx");
const qTotalEl = document.getElementById("qTotal");
const qScore = document.getElementById("qScore");
const qFeedback = document.getElementById("qFeedback");
const qListen = document.getElementById("qListen");
const quizOptions = document.getElementById("quizOptions");
const musResult = document.getElementById("musResult");
const resultTitle = document.getElementById("resultTitle");
const resultMsg = document.getElementById("resultMsg");

const QUIZ_LEN = 8;
let qi = 0, qs = 0, qAnswer = null;
const danceIds = Object.keys(DANCES);

function startQuiz() {
  qi = 0; qs = 0;
  qScore.textContent = "0";
  qTotalEl.textContent = QUIZ_LEN;
  musResult.hidden = true;
  nextQuestion();
}
function nextQuestion() {
  if (qi >= QUIZ_LEN) { finishQuiz(); return; }
  qi++;
  qIdx.textContent = qi;
  qAnswer = danceIds[Math.floor(Math.random() * danceIds.length)];
  quizOptions.innerHTML = "";
  danceIds.forEach(id => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "quiz-opt";
    b.textContent = `${DANCES[id].name} (${DANCES[id].time})`;
    b.addEventListener("click", () => handleAnswer(id, b));
    quizOptions.appendChild(b);
  });
  qFeedback.innerHTML = "Press <strong>Listen</strong>, then pick the dance form.";
  qFeedback.className = "mus-feedback";
}

qListen.addEventListener("click", async () => {
  await ensureTone();
  // play the answer dance briefly
  playDance(qAnswer);
});

function handleAnswer(picked, btn) {
  document.querySelectorAll(".quiz-opt").forEach(x => x.disabled = true);
  if (picked === qAnswer) {
    btn.classList.add("correct");
    qs++; qScore.textContent = qs;
    qFeedback.innerHTML = `<strong>Right — that's a ${DANCES[qAnswer].name}.</strong> ${DANCES[qAnswer].desc}`;
    qFeedback.className = "mus-feedback ok";
    ding();
  } else {
    btn.classList.add("wrong");
    quizOptions.querySelectorAll(".quiz-opt").forEach(o => {
      if (o.textContent.includes(DANCES[qAnswer].name)) o.classList.add("correct");
    });
    qFeedback.innerHTML = `<strong>Actually a ${DANCES[qAnswer].name}.</strong> ${DANCES[qAnswer].desc}`;
    qFeedback.className = "mus-feedback bad";
    buzz();
  }
  stopAll();
  setTimeout(nextQuestion, 2400);
}

function finishQuiz() {
  musResult.hidden = false;
  let t, m;
  if (qs === QUIZ_LEN) { t = "Trad ear."; m = `${qs} / ${QUIZ_LEN}. You'd hold your own at a session.`; fanfare(); }
  else if (qs >= 5) { t = "Solid."; m = `${qs} / ${QUIZ_LEN}. Worth re-listening to the patterns in Play mode.`; fanfare(); }
  else { t = "Set finished."; m = `${qs} / ${QUIZ_LEN}. Hop back to Play the session — listening to each dance a few times trains the ear.`; }
  resultTitle.textContent = t;
  resultMsg.textContent = m;
}

document.getElementById("qReset").addEventListener("click", startQuiz);
document.getElementById("qAgain").addEventListener("click", startQuiz);
