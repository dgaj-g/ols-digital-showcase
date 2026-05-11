// Psychology — Stroop Effect experiment
// Pupils complete 20 trials, half congruent and half incongruent. Reaction
// times are recorded per trial and compared at the end.

const COLOURS = [
  { name: "red",    css: "#D03030" },
  { name: "blue",   css: "#2A6CE0" },
  { name: "green",  css: "#2A9F4F" },
  { name: "yellow", css: "#C99A0E" },
  { name: "purple", css: "#8B3FBE" },
];

const TOTAL_TRIALS = 20; // 10 congruent + 10 incongruent

const screenIntro   = document.getElementById("screenIntro");
const screenTrial   = document.getElementById("screenTrial");
const screenResults = document.getElementById("screenResults");

const btnStart   = document.getElementById("btnStart");
const btnRestart = document.getElementById("btnRestart");
const trialNum   = document.getElementById("trialNum");
const trialTotal = document.getElementById("trialTotal");
const trialTimer = document.getElementById("trialTimer");
const trialWord  = document.getElementById("trialWord");
const trialFlash = document.getElementById("trialFlash");

let trials = [];     // pre-generated trial list
let trialIdx = 0;
let trialStart = 0;
let timerRAF = null;

// audio feedback
let actx;
function tone(freq, ms, type="sine", gain=0.05) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(); const g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gain; o.connect(g); g.connect(actx.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + ms/1000);
    o.stop(actx.currentTime + ms/1000 + 0.02);
  } catch {}
}
function clickOk()  { tone(720, 60, "triangle", 0.04); }
function clickBad() { tone(200, 160, "sawtooth", 0.05); }
function complete() { [523, 659, 784, 1047].forEach((f,i)=>setTimeout(()=>tone(f,180,"triangle",0.05), i*100)); }

// ---- trial generation ----
function generateTrials() {
  const list = [];
  // 10 congruent
  for (let i = 0; i < TOTAL_TRIALS / 2; i++) {
    const c = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    list.push({ word: c.name, ink: c.name, type: "congruent" });
  }
  // 10 incongruent (word and ink differ)
  for (let i = 0; i < TOTAL_TRIALS / 2; i++) {
    const w = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    let inkPool = COLOURS.filter(c => c.name !== w.name);
    const inkChoice = inkPool[Math.floor(Math.random() * inkPool.length)];
    list.push({ word: w.name, ink: inkChoice.name, type: "incongruent" });
  }
  // Fisher-Yates shuffle
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function cssFor(name) {
  return COLOURS.find(c => c.name === name).css;
}

function showTrial() {
  if (trialIdx >= trials.length) {
    finishExperiment();
    return;
  }
  const t = trials[trialIdx];
  trialNum.textContent = trialIdx + 1;
  trialWord.textContent = t.word.toUpperCase();
  trialWord.style.color = cssFor(t.ink);
  trialFlash.textContent = "";
  trialFlash.className = "trial-flash";
  trialStart = performance.now();
  // live timer
  cancelAnimationFrame(timerRAF);
  const tick = () => {
    const elapsed = performance.now() - trialStart;
    trialTimer.textContent = `${Math.round(elapsed)} ms`;
    timerRAF = requestAnimationFrame(tick);
  };
  tick();
}

function recordResponse(colour) {
  const t = trials[trialIdx];
  if (!t || !trialStart) return;
  const rt = performance.now() - trialStart;
  cancelAnimationFrame(timerRAF);
  trialStart = 0;
  const correct = colour === t.ink;
  t.rt = rt;
  t.correct = correct;
  t.given = colour;

  trialWord.classList.remove("flash-correct", "flash-wrong");
  // force reflow
  void trialWord.offsetWidth;
  trialWord.classList.add(correct ? "flash-correct" : "flash-wrong");
  if (correct) {
    trialFlash.textContent = `Correct · ${Math.round(rt)} ms`;
    trialFlash.className = "trial-flash ok";
    clickOk();
  } else {
    trialFlash.textContent = `Wrong — ink was ${t.ink}`;
    trialFlash.className = "trial-flash bad";
    clickBad();
  }
  trialIdx++;
  setTimeout(showTrial, 550);
}

document.querySelectorAll(".colour-btn").forEach(b => {
  b.addEventListener("click", () => recordResponse(b.dataset.colour));
});

// keyboard shortcuts: 1-5 map to red/blue/green/yellow/purple
window.addEventListener("keydown", e => {
  if (screenTrial.hidden) return;
  const map = { "1":"red","2":"blue","3":"green","4":"yellow","5":"purple" };
  if (map[e.key]) recordResponse(map[e.key]);
});

// ---- flow ----
function startExperiment() {
  trials = generateTrials();
  trialIdx = 0;
  trialTotal.textContent = TOTAL_TRIALS;
  screenIntro.hidden = true;
  screenResults.hidden = true;
  screenTrial.hidden = false;
  showTrial();
}

function finishExperiment() {
  cancelAnimationFrame(timerRAF);
  screenTrial.hidden = true;
  screenResults.hidden = false;

  // analyse — only count correct trials for RT averages
  const cTrials = trials.filter(t => t.type === "congruent" && t.correct);
  const iTrials = trials.filter(t => t.type === "incongruent" && t.correct);
  const accuracy = trials.filter(t => t.correct).length;

  const mean = arr => arr.length ? arr.reduce((s, t) => s + t.rt, 0) / arr.length : 0;
  const cMean = mean(cTrials);
  const iMean = mean(iTrials);
  const interference = iMean - cMean;

  const maxVal = Math.max(cMean, iMean, 1);
  document.getElementById("rtFillC").style.width = `${(cMean / maxVal) * 100}%`;
  document.getElementById("rtFillI").style.width = `${(iMean / maxVal) * 100}%`;
  document.getElementById("rtValueC").textContent = cTrials.length ? `${Math.round(cMean)} ms` : "no data";
  document.getElementById("rtValueI").textContent = iTrials.length ? `${Math.round(iMean)} ms` : "no data";
  document.getElementById("rtInterf").textContent = (interference >= 0 ? "+" : "") + `${Math.round(interference)} ms`;
  document.getElementById("rtAcc").textContent = `${accuracy} / ${TOTAL_TRIALS}`;

  let verdict, lead;
  if (cTrials.length < 3 || iTrials.length < 3) {
    verdict = "Need more correct trials";
    lead = "You didn't get enough correct responses on each type to compare. Run it again.";
  } else if (interference > 80) {
    verdict = "Strong Stroop effect";
    lead = `On average it took you about <strong>${Math.round(interference)} ms</strong> longer to answer when the word and the ink colour disagreed — a classic Stroop interference.`;
  } else if (interference > 20) {
    verdict = "Moderate effect";
    lead = `Your incongruent responses were about <strong>${Math.round(interference)} ms</strong> slower than your congruent ones — a moderate Stroop effect.`;
  } else if (interference > -20) {
    verdict = "Little difference";
    lead = `Your reaction times were similar in both conditions. Either you're very practised at ignoring the word, or it's worth running the experiment a few more times to get a clearer picture.`;
  } else {
    verdict = "Faster when incongruent";
    lead = `You were actually faster on incongruent trials. That's unusual — small samples can flip the result. Try again.`;
  }
  document.getElementById("rtVerdict").textContent = verdict;
  document.getElementById("resultLead").innerHTML = lead;
  complete();
}

btnStart.addEventListener("click", startExperiment);
btnRestart.addEventListener("click", startExperiment);
