// Chemistry — Interactive Periodic Table
// Explore mode: click to inspect, filter by group/period.
// Quiz mode: 10 questions in 60 seconds — find the element matching the prompt.

// Compact element data. Periods 1-7. Lanthanides/actinides placed on rows 8/9.
// Each: [symbol, name, atomicNumber, group(1-18 or null), period, category, mass, state]
// Categories: alkali, alkaline, transition, postmetal, metalloid, nonmetal, halogen, noble, lanthanide, actinide
const ELEMENTS = [
  ["H",  "Hydrogen", 1,  1, 1, "nonmetal", 1.008, "gas"],
  ["He", "Helium",   2, 18, 1, "noble",   4.003, "gas"],
  ["Li", "Lithium",  3,  1, 2, "alkali",  6.94,  "solid"],
  ["Be", "Beryllium",4,  2, 2, "alkaline",9.01,  "solid"],
  ["B",  "Boron",    5, 13, 2, "metalloid",10.81,"solid"],
  ["C",  "Carbon",   6, 14, 2, "nonmetal",12.01, "solid"],
  ["N",  "Nitrogen", 7, 15, 2, "nonmetal",14.01, "gas"],
  ["O",  "Oxygen",   8, 16, 2, "nonmetal",16.00, "gas"],
  ["F",  "Fluorine", 9, 17, 2, "halogen", 19.00, "gas"],
  ["Ne", "Neon",    10, 18, 2, "noble",   20.18, "gas"],
  ["Na", "Sodium",  11,  1, 3, "alkali",  22.99, "solid"],
  ["Mg", "Magnesium",12, 2, 3, "alkaline",24.31, "solid"],
  ["Al", "Aluminium",13,13, 3, "postmetal",26.98,"solid"],
  ["Si", "Silicon", 14, 14, 3, "metalloid",28.09,"solid"],
  ["P",  "Phosphorus",15,15,3, "nonmetal",30.97, "solid"],
  ["S",  "Sulfur",  16, 16, 3, "nonmetal",32.07, "solid"],
  ["Cl", "Chlorine",17, 17, 3, "halogen", 35.45, "gas"],
  ["Ar", "Argon",   18, 18, 3, "noble",   39.95, "gas"],
  ["K",  "Potassium",19, 1, 4, "alkali",  39.10, "solid"],
  ["Ca", "Calcium", 20,  2, 4, "alkaline",40.08, "solid"],
  ["Sc", "Scandium",21,  3, 4, "transition",44.96,"solid"],
  ["Ti", "Titanium",22,  4, 4, "transition",47.87,"solid"],
  ["V",  "Vanadium",23,  5, 4, "transition",50.94,"solid"],
  ["Cr", "Chromium",24,  6, 4, "transition",52.00,"solid"],
  ["Mn", "Manganese",25, 7, 4, "transition",54.94,"solid"],
  ["Fe", "Iron",    26,  8, 4, "transition",55.85,"solid"],
  ["Co", "Cobalt",  27,  9, 4, "transition",58.93,"solid"],
  ["Ni", "Nickel",  28, 10, 4, "transition",58.69,"solid"],
  ["Cu", "Copper",  29, 11, 4, "transition",63.55,"solid"],
  ["Zn", "Zinc",    30, 12, 4, "transition",65.38,"solid"],
  ["Ga", "Gallium", 31, 13, 4, "postmetal",69.72,"solid"],
  ["Ge", "Germanium",32,14, 4, "metalloid",72.63,"solid"],
  ["As", "Arsenic", 33, 15, 4, "metalloid",74.92,"solid"],
  ["Se", "Selenium",34, 16, 4, "nonmetal", 78.96,"solid"],
  ["Br", "Bromine", 35, 17, 4, "halogen",  79.90,"liquid"],
  ["Kr", "Krypton", 36, 18, 4, "noble",    83.80,"gas"],
  ["Rb", "Rubidium",37,  1, 5, "alkali",   85.47,"solid"],
  ["Sr", "Strontium",38, 2, 5, "alkaline", 87.62,"solid"],
  ["Y",  "Yttrium", 39,  3, 5, "transition",88.91,"solid"],
  ["Zr", "Zirconium",40, 4, 5, "transition",91.22,"solid"],
  ["Nb", "Niobium", 41,  5, 5, "transition",92.91,"solid"],
  ["Mo", "Molybdenum",42,6,5, "transition",95.95,"solid"],
  ["Tc", "Technetium",43,7,5, "transition",98.00,"solid"],
  ["Ru", "Ruthenium",44, 8, 5, "transition",101.07,"solid"],
  ["Rh", "Rhodium", 45,  9, 5, "transition",102.91,"solid"],
  ["Pd", "Palladium",46,10, 5, "transition",106.42,"solid"],
  ["Ag", "Silver",  47, 11, 5, "transition",107.87,"solid"],
  ["Cd", "Cadmium", 48, 12, 5, "transition",112.41,"solid"],
  ["In", "Indium",  49, 13, 5, "postmetal",114.82,"solid"],
  ["Sn", "Tin",     50, 14, 5, "postmetal",118.71,"solid"],
  ["Sb", "Antimony",51, 15, 5, "metalloid",121.76,"solid"],
  ["Te", "Tellurium",52,16, 5, "metalloid",127.60,"solid"],
  ["I",  "Iodine",  53, 17, 5, "halogen", 126.90,"solid"],
  ["Xe", "Xenon",   54, 18, 5, "noble",   131.29,"gas"],
  ["Cs", "Caesium", 55,  1, 6, "alkali",  132.91,"solid"],
  ["Ba", "Barium",  56,  2, 6, "alkaline",137.33,"solid"],
  ["La", "Lanthanum",57, null, 6, "lanthanide", 138.91,"solid"],
  ["Ce", "Cerium",  58, null, 6, "lanthanide", 140.12,"solid"],
  ["Pr", "Praseodymium",59,null,6,"lanthanide",140.91,"solid"],
  ["Nd", "Neodymium",60,null,6,"lanthanide", 144.24,"solid"],
  ["Pm", "Promethium",61,null,6,"lanthanide", 145.00,"solid"],
  ["Sm", "Samarium",62, null, 6, "lanthanide",150.36,"solid"],
  ["Eu", "Europium",63, null, 6, "lanthanide",151.96,"solid"],
  ["Gd", "Gadolinium",64,null,6,"lanthanide",157.25,"solid"],
  ["Tb", "Terbium", 65, null, 6, "lanthanide",158.93,"solid"],
  ["Dy", "Dysprosium",66,null,6,"lanthanide",162.50,"solid"],
  ["Ho", "Holmium", 67, null, 6, "lanthanide",164.93,"solid"],
  ["Er", "Erbium",  68, null, 6, "lanthanide",167.26,"solid"],
  ["Tm", "Thulium", 69, null, 6, "lanthanide",168.93,"solid"],
  ["Yb", "Ytterbium",70,null, 6, "lanthanide",173.05,"solid"],
  ["Lu", "Lutetium",71,  3, 6, "lanthanide",174.97,"solid"],
  ["Hf", "Hafnium", 72,  4, 6, "transition",178.49,"solid"],
  ["Ta", "Tantalum",73,  5, 6, "transition",180.95,"solid"],
  ["W",  "Tungsten",74,  6, 6, "transition",183.84,"solid"],
  ["Re", "Rhenium", 75,  7, 6, "transition",186.21,"solid"],
  ["Os", "Osmium",  76,  8, 6, "transition",190.23,"solid"],
  ["Ir", "Iridium", 77,  9, 6, "transition",192.22,"solid"],
  ["Pt", "Platinum",78, 10, 6, "transition",195.08,"solid"],
  ["Au", "Gold",    79, 11, 6, "transition",196.97,"solid"],
  ["Hg", "Mercury", 80, 12, 6, "transition",200.59,"liquid"],
  ["Tl", "Thallium",81, 13, 6, "postmetal",204.38,"solid"],
  ["Pb", "Lead",    82, 14, 6, "postmetal",207.20,"solid"],
  ["Bi", "Bismuth", 83, 15, 6, "postmetal",208.98,"solid"],
  ["Po", "Polonium",84, 16, 6, "postmetal",209.00,"solid"],
  ["At", "Astatine",85, 17, 6, "halogen", 210.00,"solid"],
  ["Rn", "Radon",   86, 18, 6, "noble",   222.00,"gas"],
  ["Fr", "Francium",87,  1, 7, "alkali",  223.00,"solid"],
  ["Ra", "Radium",  88,  2, 7, "alkaline",226.00,"solid"],
  ["Ac", "Actinium",89, null, 7, "actinide",227.00,"solid"],
];

const CATEGORY_NAMES = {
  alkali:    "Alkali metal (Group 1)",
  alkaline:  "Alkaline earth metal (Group 2)",
  transition:"Transition metal",
  postmetal: "Post-transition metal",
  metalloid: "Metalloid",
  nonmetal:  "Non-metal",
  halogen:   "Halogen (Group 7)",
  noble:     "Noble gas (Group 0/18)",
  lanthanide:"Lanthanide",
  actinide:  "Actinide",
};

// audio
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
function click()   { tone(720, 60, "triangle", 0.04); }
function correct() { tone(660, 90, "triangle", 0.06); setTimeout(()=>tone(990, 110, "triangle", 0.06), 80); }
function wrong()   { tone(180, 200, "sawtooth", 0.05); }
function fanfare() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05), i*110)); }

// ---- build grid ----
function elementSpan(e) {
  if (e[3] === null) {
    // lanthanide/actinide: place in rows 8/9 based on atomic number
    if (e[5] === "lanthanide") return { row: 8, col: e[2] - 57 + 3 }; // La (57) -> col 3, fill across
    if (e[5] === "actinide")   return { row: 9, col: e[2] - 89 + 3 };
  }
  return { row: e[4], col: e[3] };
}

function buildGrid(container, withListener) {
  container.innerHTML = "";
  // placeholders for the gap in periods 6/7 (lanthanide/actinide block)
  const ph57 = document.createElement("div");
  ph57.className = "el el-placeholder"; ph57.style.gridRow = "6"; ph57.style.gridColumn = "3";
  ph57.textContent = "57-71"; container.appendChild(ph57);
  const ph89 = document.createElement("div");
  ph89.className = "el el-placeholder"; ph89.style.gridRow = "7"; ph89.style.gridColumn = "3";
  ph89.textContent = "89"; container.appendChild(ph89);

  ELEMENTS.forEach(e => {
    const [sym, name, num, group, period, cat] = e;
    const div = document.createElement("button");
    div.type = "button";
    div.className = `el el-${cat}`;
    div.dataset.sym = sym;
    div.innerHTML = `<span class="el-num">${num}</span><span class="el-sym">${sym}</span>`;
    const pos = elementSpan(e);
    div.style.gridRow = pos.row;
    div.style.gridColumn = pos.col;
    if (withListener) {
      div.addEventListener("click", () => withListener(e, div));
    }
    container.appendChild(div);
  });
}

// ---- Explore mode ----
const detail = document.getElementById("elementDetail");
const grid   = document.getElementById("ptGrid");

let activeEl = null;
function renderDetail(e) {
  const [sym, name, num, group, period, cat, mass, state] = e;
  detail.innerHTML = `
    <div class="detail-head">
      <div>
        <div class="detail-num">Atomic number ${num}</div>
        <div class="detail-sym">${sym}</div>
      </div>
      <div class="detail-cat el-${cat}">${CATEGORY_NAMES[cat]}</div>
    </div>
    <p class="detail-name">${name}</p>
    <div class="detail-rows">
      <div class="detail-cell"><div class="detail-cell-label">Group</div><div class="detail-cell-value">${group ?? "—"}</div></div>
      <div class="detail-cell"><div class="detail-cell-label">Period</div><div class="detail-cell-value">${period}</div></div>
      <div class="detail-cell"><div class="detail-cell-label">Atomic mass</div><div class="detail-cell-value">${mass}</div></div>
      <div class="detail-cell"><div class="detail-cell-label">State at 25°C</div><div class="detail-cell-value">${state}</div></div>
    </div>
  `;
}
buildGrid(grid, (e, div) => {
  grid.querySelectorAll(".el.active").forEach(x => x.classList.remove("active"));
  div.classList.add("active");
  activeEl = e;
  renderDetail(e);
  click();
});

// ---- group / period pills ----
const groupPills = document.getElementById("groupPills");
const periodPills = document.getElementById("periodPills");
for (let g = 1; g <= 18; g++) {
  const b = document.createElement("button");
  b.className = "chem-pill";
  b.type = "button";
  b.textContent = g === 18 ? "0/18" : String(g);
  b.dataset.group = g;
  b.addEventListener("click", () => highlight("group", g, b));
  groupPills.appendChild(b);
}
for (let p = 1; p <= 7; p++) {
  const b = document.createElement("button");
  b.className = "chem-pill";
  b.type = "button";
  b.textContent = String(p);
  b.dataset.period = p;
  b.addEventListener("click", () => highlight("period", p, b));
  periodPills.appendChild(b);
}
function highlight(kind, value, btn) {
  document.querySelectorAll(".chem-pill.active").forEach(x => x.classList.remove("active"));
  btn.classList.add("active");
  grid.querySelectorAll(".el").forEach(el => {
    el.classList.remove("dim", "hl");
    if (el.classList.contains("el-placeholder")) return;
    const sym = el.dataset.sym;
    if (!sym) return;
    const e = ELEMENTS.find(x => x[0] === sym);
    if (!e) return;
    const match = kind === "group" ? (e[3] === value) : (e[4] === value);
    if (match) el.classList.add("hl");
    else el.classList.add("dim");
  });
  click();
}
document.getElementById("btnClear").addEventListener("click", () => {
  document.querySelectorAll(".chem-pill.active").forEach(x => x.classList.remove("active"));
  grid.querySelectorAll(".el").forEach(el => el.classList.remove("dim", "hl"));
  click();
});

// ---- Mode switching: single Launch button in Explore starts the quiz ----
const paneExplore = document.getElementById("paneExplore");
const paneQuiz    = document.getElementById("paneQuiz");
function showExplore() {
  paneExplore.hidden = false;
  paneQuiz.hidden = true;
  click();
}
function showQuiz() {
  paneExplore.hidden = true;
  paneQuiz.hidden = false;
  click();
  startQuiz();
}
document.getElementById("btnLaunchQuiz").addEventListener("click", showQuiz);
document.getElementById("qBack").addEventListener("click", () => {
  clearInterval(qInterval);
  qActive = false;
  showExplore();
});

// ---- Quiz mode ----
const qGrid = document.getElementById("qGrid");
const qPrompt = document.getElementById("qPrompt");
const qFeedback = document.getElementById("qFeedback");
const qNum = document.getElementById("qNum");
const qTotal = document.getElementById("qTotal");
const qScore = document.getElementById("qScore");
const qTime = document.getElementById("qTime");
const qResult = document.getElementById("qResult");
const qResultMsg = document.getElementById("qResultMsg");

const QUIZ_LEN = 10;
const QUIZ_TIME = 60; // seconds
let qIdx = 0;
let qScoreVal = 0;
let qTimeLeft = QUIZ_TIME;
let qInterval = null;
let qActive = false;
let currentTarget = null;

const QUIZ_BANK = [
  () => { const e = pick(ELEMENTS.filter(x=>x[5]==="noble"));  return { e, prompt: `Find a <strong>noble gas</strong>.` }; },
  () => { const e = pick(ELEMENTS.filter(x=>x[5]==="halogen")); return { e, prompt: `Find a <strong>halogen</strong>.` }; },
  () => { const e = pick(ELEMENTS.filter(x=>x[5]==="alkali")); return { e, prompt: `Find an <strong>alkali metal</strong>.` }; },
  () => { const e = pick(ELEMENTS.filter(x=>x[5]==="alkaline")); return { e, prompt: `Find an <strong>alkaline earth metal</strong>.` }; },
  () => { const e = pick(ELEMENTS.filter(x=>x[5]==="transition")); return { e, prompt: `Find a <strong>transition metal</strong>.` }; },
  () => { const e = pick(ELEMENTS.filter(x=>x[4]===2 && x[3])); return { e, prompt: `Find an element in <strong>Period 2</strong>.` }; },
  () => { const e = pick(ELEMENTS.filter(x=>x[4]===3 && x[3])); return { e, prompt: `Find an element in <strong>Period 3</strong>.` }; },
  // specific named elements
  () => { const sym = pick(["Fe","Cu","Au","Ag","Pt","Zn","Sn","Pb","Al","Mg"]); const e = ELEMENTS.find(x=>x[0]===sym); return { e, prompt: `Find <strong>${e[1]}</strong> (${e[0]}).` }; },
  () => { const e = ELEMENTS.find(x=>x[0]==="O"); return { e, prompt: `Find the element used in <strong>respiration</strong>.` }; },
  () => { const e = ELEMENTS.find(x=>x[0]==="C"); return { e, prompt: `Find the element at the heart of <strong>organic chemistry</strong>.` }; },
  () => { const e = ELEMENTS.find(x=>x[0]==="Na"); return { e, prompt: `Find <strong>sodium</strong> — soft, silvery, reacts with water.` }; },
  () => { const e = ELEMENTS.find(x=>x[0]==="Cl"); return { e, prompt: `Find <strong>chlorine</strong> — used to treat drinking water.` }; },
];
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function startQuiz() {
  qActive = true;
  qIdx = 0; qScoreVal = 0; qTimeLeft = QUIZ_TIME;
  qScore.textContent = "0";
  qTotal.textContent = QUIZ_LEN;
  qTime.textContent = `${QUIZ_TIME} s`;
  qFeedback.textContent = "";
  qFeedback.className = "quiz-feedback";
  qResult.hidden = true;
  buildGrid(qGrid, (e, div) => handleQuizPick(e, div));
  nextQuestion();
  clearInterval(qInterval);
  qInterval = setInterval(() => {
    qTimeLeft--;
    qTime.textContent = `${qTimeLeft} s`;
    if (qTimeLeft <= 0) endQuiz();
  }, 1000);
}

function nextQuestion() {
  if (qIdx >= QUIZ_LEN) { endQuiz(); return; }
  qIdx++;
  qNum.textContent = qIdx;
  const generator = pick(QUIZ_BANK);
  const { e, prompt } = generator();
  currentTarget = e;
  qPrompt.innerHTML = `Question ${qIdx}: ${prompt}`;
}

function handleQuizPick(e, div) {
  if (!qActive) return;
  if (e[0] === currentTarget[0] ||
      // also accept any element from the same category for category prompts
      (qPrompt.innerText.includes("noble gas") && e[5] === "noble") ||
      (qPrompt.innerText.includes("halogen") && e[5] === "halogen") ||
      (qPrompt.innerText.includes("alkali metal") && e[5] === "alkali") ||
      (qPrompt.innerText.includes("alkaline earth") && e[5] === "alkaline") ||
      (qPrompt.innerText.includes("transition metal") && e[5] === "transition") ||
      (qPrompt.innerText.includes("Period 2") && e[4] === 2) ||
      (qPrompt.innerText.includes("Period 3") && e[4] === 3)
  ) {
    div.classList.remove("flash-bad"); void div.offsetWidth;
    div.classList.add("flash-ok");
    qScoreVal++;
    qScore.textContent = qScoreVal;
    qFeedback.textContent = `Correct — ${e[1]} (${e[0]}).`;
    qFeedback.className = "quiz-feedback ok";
    correct();
    setTimeout(nextQuestion, 600);
  } else {
    div.classList.remove("flash-ok"); void div.offsetWidth;
    div.classList.add("flash-bad");
    qFeedback.textContent = `${e[1]} is a ${CATEGORY_NAMES[e[5]].toLowerCase()} — keep looking.`;
    qFeedback.className = "quiz-feedback bad";
    wrong();
  }
  setTimeout(() => div.classList.remove("flash-ok", "flash-bad"), 450);
}

function endQuiz() {
  clearInterval(qInterval);
  qActive = false;
  qResult.hidden = false;
  let msg;
  if (qScoreVal === QUIZ_LEN) msg = `Perfect — ${qScoreVal} / ${QUIZ_LEN}. You know your table.`;
  else if (qScoreVal >= 7)    msg = `${qScoreVal} / ${QUIZ_LEN}. Strong performance.`;
  else if (qScoreVal >= 4)    msg = `${qScoreVal} / ${QUIZ_LEN}. Solid attempt — try again to push past 7.`;
  else                         msg = `${qScoreVal} / ${QUIZ_LEN}. Use Explore mode to check group names, then have another go.`;
  qResultMsg.textContent = msg;
  if (qScoreVal >= 7) fanfare();
}

document.getElementById("qPlayAgain").addEventListener("click", startQuiz);
