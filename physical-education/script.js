// PE — Muscular Fitness Builder
// Pick a goal (strength / endurance / power). Add exercises from a bank.
// Adjust sets / reps / intensity. The body diagram lights up the muscle
// groups you're hitting; a match score reflects how well the plan fits
// the chosen goal.

const MUSCLES = ["pecs", "delts", "biceps", "triceps", "abs", "lats", "glutes", "quads", "hams", "calves"];

const EXERCISES = [
  { id: "benchpress", name: "Bench press",      muscles: ["pecs","triceps","delts"], best: "strength" },
  { id: "deadlift",   name: "Deadlift",         muscles: ["lats","hams","glutes","quads"], best: "strength" },
  { id: "squat",      name: "Back squat",       muscles: ["quads","glutes","hams"], best: "strength" },
  { id: "pullup",     name: "Pull-up",          muscles: ["lats","biceps"], best: "strength" },
  { id: "press",      name: "Overhead press",   muscles: ["delts","triceps"], best: "strength" },

  { id: "plank",      name: "Plank",            muscles: ["abs"], best: "endurance" },
  { id: "burpees",    name: "Burpees",          muscles: ["quads","pecs","delts","abs"], best: "endurance" },
  { id: "stepup",     name: "Step-ups",         muscles: ["quads","glutes","calves"], best: "endurance" },
  { id: "row",        name: "Bodyweight row",   muscles: ["lats","biceps"], best: "endurance" },
  { id: "lunge",      name: "Walking lunges",   muscles: ["quads","glutes"], best: "endurance" },

  { id: "boxjump",    name: "Box jumps",        muscles: ["quads","calves","glutes"], best: "power" },
  { id: "med-throw",  name: "Medicine-ball throw", muscles: ["pecs","delts","abs"], best: "power" },
  { id: "clean",      name: "Power clean",      muscles: ["hams","glutes","delts","triceps"], best: "power" },
  { id: "plyopush",   name: "Plyometric push-up", muscles: ["pecs","triceps","delts"], best: "power" },
  { id: "broadjump",  name: "Broad jump",       muscles: ["quads","glutes","calves"], best: "power" },
];

const GOALS = {
  strength:  { name: "Strength",          sets: [3, 5], reps: [3, 6],   intensity: [80, 100] },
  endurance: { name: "Muscular endurance",sets: [2, 3], reps: [15, 25], intensity: [40, 65]  },
  power:     { name: "Power",             sets: [3, 5], reps: [3, 8],   intensity: [60, 80]  },
};

let goal = null;
let chosen = new Set();
const MAX_EX = 6;

// --- DOM
const goalRow = document.getElementById("goalRow");
const exGrid = document.getElementById("exGrid");
const bodySvg = document.getElementById("bodySvg");
const bodyKey = document.getElementById("bodyKey");
const goalName = document.getElementById("goalName");
const exCount = document.getElementById("exCount");
const matchPct = document.getElementById("matchPct");
const scriptCue = document.getElementById("scriptCue");
const scriptRows = document.getElementById("scriptRows");
const peFb = document.getElementById("peFb");
const sets = document.getElementById("sets");
const reps = document.getElementById("reps");
const intensity = document.getElementById("intensity");
const setsVal = document.getElementById("setsVal");
const repsVal = document.getElementById("repsVal");
const intensityVal = document.getElementById("intensityVal");

// --- audio
let ac;
function tone(f, ms, type="sine", g=0.05) {
  try { ac = ac || new (window.AudioContext||window.webkitAudioContext)();
    const o = ac.createOscillator(); const gn = ac.createGain();
    o.type=type; o.frequency.value=f; gn.gain.value=g;
    o.connect(gn); gn.connect(ac.destination); o.start();
    gn.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + ms/1000);
    o.stop(ac.currentTime + ms/1000 + 0.02);
  } catch {}
}
function tick(){ tone(720,40,"triangle",0.04); }
function ding(){ tone(660,80,"triangle",0.05); setTimeout(()=>tone(990,100,"triangle",0.05),70); }

// --- Body diagram
function drawBody() {
  // SVG with named muscle groups (front view, stylised)
  const hits = new Set();
  chosen.forEach(id => EXERCISES.find(e => e.id === id).muscles.forEach(m => hits.add(m)));
  const has = m => hits.has(m) ? "muscle hit" : "muscle";
  bodySvg.innerHTML = `
    <!-- head -->
    <circle cx="100" cy="30" r="20" fill="#E1E7EE" stroke="#595959" stroke-width="1.5"/>
    <!-- neck -->
    <rect x="92" y="48" width="16" height="12" fill="#E1E7EE" stroke="#595959" stroke-width="1.5"/>
    <!-- delts (shoulders) -->
    <circle class="${has('delts')}" cx="64" cy="74" r="14"/>
    <circle class="${has('delts')}" cx="136" cy="74" r="14"/>
    <!-- pecs (chest) -->
    <path class="${has('pecs')}" d="M 80 70 Q 100 80 120 70 L 120 110 Q 100 118 80 110 Z"/>
    <!-- biceps -->
    <ellipse class="${has('biceps')}" cx="60" cy="105" rx="10" ry="18" transform="rotate(-12 60 105)"/>
    <ellipse class="${has('biceps')}" cx="140" cy="105" rx="10" ry="18" transform="rotate(12 140 105)"/>
    <!-- triceps -->
    <ellipse class="${has('triceps')}" cx="50" cy="120" rx="8" ry="16" transform="rotate(-15 50 120)"/>
    <ellipse class="${has('triceps')}" cx="150" cy="120" rx="8" ry="16" transform="rotate(15 150 120)"/>
    <!-- abs -->
    <rect class="${has('abs')}" x="86" y="115" width="28" height="60" rx="6"/>
    <!-- lats (back, sides) -->
    <path class="${has('lats')}" d="M 70 100 L 80 175 L 86 175 L 80 100 Z"/>
    <path class="${has('lats')}" d="M 130 100 L 120 175 L 114 175 L 120 100 Z"/>
    <!-- glutes / hips area -->
    <rect class="${has('glutes')}" x="80" y="175" width="40" height="20" rx="8"/>
    <!-- quads -->
    <ellipse class="${has('quads')}" cx="89" cy="220" rx="11" ry="28"/>
    <ellipse class="${has('quads')}" cx="111" cy="220" rx="11" ry="28"/>
    <!-- hamstrings -->
    <ellipse class="${has('hams')}" cx="89" cy="260" rx="10" ry="20"/>
    <ellipse class="${has('hams')}" cx="111" cy="260" rx="10" ry="20"/>
    <!-- calves -->
    <ellipse class="${has('calves')}" cx="89" cy="290" rx="9" ry="20"/>
    <ellipse class="${has('calves')}" cx="111" cy="290" rx="9" ry="20"/>
    <!-- forearms (decorative, not tracked) -->
    <ellipse cx="45" cy="155" rx="7" ry="16" fill="#E1E7EE" stroke="#595959" stroke-width="1.5"/>
    <ellipse cx="155" cy="155" rx="7" ry="16" fill="#E1E7EE" stroke="#595959" stroke-width="1.5"/>
  `;
  if (hits.size === 0) bodyKey.textContent = "No exercises yet. Add some from the right.";
  else bodyKey.innerHTML = `Hitting: <strong>${[...hits].join(", ")}</strong>.`;
}

drawBody();

// --- Exercise bank
function renderBank() {
  exGrid.innerHTML = "";
  EXERCISES.forEach(e => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `ex-card ex-fit-${e.best}` + (chosen.has(e.id) ? " selected" : "");
    b.dataset.id = e.id;
    b.innerHTML = `<div class="ex-name">${e.name}</div><div class="ex-muscles">${e.muscles.join(" · ")}</div>`;
    b.addEventListener("click", () => {
      if (chosen.has(e.id)) chosen.delete(e.id);
      else if (chosen.size >= MAX_EX) {
        peFb.innerHTML = `Maximum ${MAX_EX} exercises — remove one first.`;
        peFb.className = "pe-feedback bad";
        return;
      }
      else chosen.add(e.id);
      tick();
      renderBank(); drawBody(); updateScore();
    });
    exGrid.appendChild(b);
  });
  exCount.textContent = chosen.size;
}
renderBank();

// --- Goals
goalRow.addEventListener("click", e => {
  const card = e.target.closest(".goal-card");
  if (!card) return;
  document.querySelectorAll(".goal-card.active").forEach(x => x.classList.remove("active"));
  card.classList.add("active");
  goal = card.dataset.goal;
  goalName.textContent = GOALS[goal].name;
  scriptCue.hidden = true;
  scriptRows.hidden = false;
  // pre-fill prescription to within goal range
  sets.value      = Math.round((GOALS[goal].sets[0] + GOALS[goal].sets[1]) / 2);
  reps.value      = Math.round((GOALS[goal].reps[0] + GOALS[goal].reps[1]) / 2);
  intensity.value = Math.round((GOALS[goal].intensity[0] + GOALS[goal].intensity[1]) / 2);
  setsVal.textContent = sets.value;
  repsVal.textContent = reps.value;
  intensityVal.textContent = intensity.value;
  tick();
  updateScore();
});

// --- Prescription sliders
[ ["sets", setsVal], ["reps", repsVal], ["intensity", intensityVal] ].forEach(([id, valEl]) => {
  document.getElementById(id).addEventListener("input", () => {
    valEl.textContent = document.getElementById(id).value;
    updateScore();
  });
});

document.getElementById("btnClear").addEventListener("click", () => {
  chosen.clear();
  renderBank(); drawBody(); updateScore();
});

// --- Match score
function updateScore() {
  if (!goal) {
    matchPct.textContent = "— %";
    peFb.innerHTML = "Pick a goal at the top.";
    peFb.className = "pe-feedback";
    return;
  }
  if (chosen.size === 0) {
    matchPct.textContent = "0 %";
    peFb.innerHTML = "Add exercises to start scoring.";
    peFb.className = "pe-feedback";
    return;
  }
  const g = GOALS[goal];
  // 1. exercise fit — % of chosen exercises whose 'best' matches the goal
  let exFit = 0;
  chosen.forEach(id => {
    const e = EXERCISES.find(x => x.id === id);
    if (e.best === goal) exFit++;
  });
  exFit = (exFit / chosen.size) * 100;
  // 2. sets-in-range, reps-in-range, intensity-in-range
  const inRange = (v, [lo, hi]) => v >= lo && v <= hi ? 100 : (100 - Math.min(80, Math.abs(v < lo ? lo - v : v - hi) * (v < 4 ? 8 : 4)));
  const setsFit = inRange(parseInt(sets.value), g.sets);
  const repsFit = inRange(parseInt(reps.value), g.reps);
  const intFit  = inRange(parseInt(intensity.value), g.intensity);
  // weighted
  const total = Math.round((exFit * 0.4) + (setsFit * 0.2) + (repsFit * 0.2) + (intFit * 0.2));
  matchPct.textContent = `${total} %`;
  // feedback
  const tips = [];
  if (exFit < 60) tips.push(`some exercises better suit a different goal (look for the matching coloured stripe — ${goal === "strength" ? "rust-red" : goal === "endurance" ? "green" : "blue"})`);
  if (setsFit < 80) tips.push(`sets should be ${g.sets[0]}–${g.sets[1]} for ${g.name.toLowerCase()}`);
  if (repsFit < 80) tips.push(`reps should be ${g.reps[0]}–${g.reps[1]}`);
  if (intFit < 80)  tips.push(`intensity should be ${g.intensity[0]}–${g.intensity[1]} % 1RM`);
  if (tips.length === 0) {
    peFb.innerHTML = `<strong>Solid plan.</strong> Exercise selection, sets, reps and intensity all fit the goal of <em>${g.name.toLowerCase()}</em>.`;
    peFb.className = "pe-feedback ok";
    if (total >= 95) ding();
  } else {
    peFb.innerHTML = `<strong>To match the goal:</strong> ${tips.join("; ")}.`;
    peFb.className = "pe-feedback bad";
  }
}

updateScore();
