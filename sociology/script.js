// Sociology — Differential Educational Achievement
// Bar chart of UK GCSE attainment (% achieving 5+ at grade 5 or above incl.
// English & Maths), filterable by gender, FSM status, ethnicity. Quiz mode
// tests pattern recognition.
//
// Figures are *representative* — they reflect the well-known direction and
// approximate magnitudes documented in DfE statistics, but should not be
// quoted as exact 2024/25 numbers.

const DATA = {
  overall:  [ { label: "All pupils", value: 50, colour: "#7C3AED" } ],
  gender:   [
    { label: "Boys",  value: 44, colour: "#2563EB" },
    { label: "Girls", value: 55, colour: "#DC2A6E" },
  ],
  fsm:      [
    { label: "FSM-eligible",     value: 30, colour: "#D69E2E" },
    { label: "Not FSM-eligible", value: 53, colour: "#2A8F44" },
  ],
  ethnicity: [
    { label: "Chinese",         value: 76, colour: "#DC2A6E" },
    { label: "Indian",          value: 65, colour: "#7C3AED" },
    { label: "Asian (other)",   value: 56, colour: "#2563EB" },
    { label: "White British",   value: 49, colour: "#2A8F44" },
    { label: "Black African",   value: 47, colour: "#D69E2E" },
    { label: "Black Caribbean", value: 36, colour: "#C72E2E" },
    { label: "Gypsy / Roma",    value: 13, colour: "#6B7280" },
  ],
  genderFsm: [
    { label: "Girls, not FSM",  value: 58, colour: "#DC2A6E" },
    { label: "Boys, not FSM",   value: 48, colour: "#2563EB" },
    { label: "Girls, FSM",      value: 34, colour: "#D69E2E" },
    { label: "Boys, FSM",       value: 26, colour: "#C72E2E" },
  ],
};

const NARRATIVE = {
  overall: "Roughly <strong>half</strong> of state-school pupils achieve the headline GCSE measure each year.",
  gender:  "<strong>Girls outperform boys</strong> by around 10 percentage points — a gap that has persisted for decades and is consistently reported in DfE statistics.",
  fsm:     "Pupils eligible for free school meals are <strong>around 23 percentage points behind</strong> their non-FSM peers — one of the most stable attainment gaps in UK education.",
  ethnicity: "Chinese and Indian pupils sit well above the average; Black Caribbean and Gypsy / Roma pupils well below. The pattern reflects complex interactions between class, school setting, prior attainment and structural inequality.",
  genderFsm: "Combining gender and class shows the gap is <strong>cumulative</strong> — girls outperform boys, and non-FSM outperforms FSM, in <em>every</em> combination. The widest gap is between non-FSM girls and FSM boys.",
};

const groupName = document.getElementById("groupName");
const gapVal = document.getElementById("gapVal");
const chartSvg = document.getElementById("chartSvg");
const chartNarrative = document.getElementById("chartNarrative");
const groupBtns = document.querySelectorAll(".group-btn");
const tabExplore = document.getElementById("tabExplore");
const tabQuiz = document.getElementById("tabQuiz");
const paneExplore = document.getElementById("paneExplore");
const paneQuiz = document.getElementById("paneQuiz");
const qIdx = document.getElementById("qIdx");
const qTotal = document.getElementById("qTotal");
const qScore = document.getElementById("qScore");
const qFeedback = document.getElementById("qFeedback");
const qPrompt = document.getElementById("qPrompt");
const qOptions = document.getElementById("qOptions");
const socResult = document.getElementById("socResult");
const resultTitle = document.getElementById("resultTitle");
const resultMsg = document.getElementById("resultMsg");

const groupTitle = {
  overall: "All pupils",
  gender: "By gender",
  fsm: "By free-school-meals status",
  ethnicity: "By ethnicity",
  genderFsm: "By gender × FSM status",
};

let currentGroup = "overall";

function drawChart(groupKey) {
  const rows = DATA[groupKey];
  const W = 720, H = 380;
  const padL = 180, padR = 30, padT = 20, padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const rowH = innerH / rows.length;
  let svg = "";
  // x-axis gridlines + labels
  for (let p = 0; p <= 100; p += 20) {
    const x = padL + (p / 100) * innerW;
    svg += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + innerH}" stroke="#D5DAE3" stroke-width="1"/>`;
    svg += `<text x="${x}" y="${padT + innerH + 18}" text-anchor="middle" fill="#6B7280" font-size="11" font-family="SF Mono, monospace">${p}%</text>`;
  }
  rows.forEach((r, i) => {
    const y = padT + i * rowH + 6;
    const barH = rowH - 14;
    const w = (r.value / 100) * innerW;
    svg += `<text x="${padL - 10}" y="${y + barH/2 + 4}" text-anchor="end" fill="#1A1F2D" font-size="13" font-weight="700">${r.label}</text>`;
    svg += `<rect x="${padL}" y="${y}" width="${innerW}" height="${barH}" fill="#F4F5F8" stroke="#D5DAE3" stroke-width="1"/>`;
    svg += `<rect x="${padL}" y="${y}" width="${w}" height="${barH}" fill="${r.colour}"/>`;
    svg += `<text x="${padL + w + 8}" y="${y + barH/2 + 4}" fill="#1A1F2D" font-size="13" font-weight="800" font-family="SF Mono, monospace">${r.value}%</text>`;
  });
  chartSvg.innerHTML = svg;
  // stats
  const values = rows.map(r => r.value);
  const gap = rows.length > 1 ? Math.max(...values) - Math.min(...values) : 0;
  groupName.textContent = groupTitle[groupKey];
  gapVal.textContent = rows.length > 1 ? `${gap} pp` : "—";
  chartNarrative.innerHTML = NARRATIVE[groupKey];
}

groupBtns.forEach(b => {
  b.addEventListener("click", () => {
    groupBtns.forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    currentGroup = b.dataset.group;
    drawChart(currentGroup);
  });
});

drawChart("overall");

// ---- Tabs ----
tabExplore.addEventListener("click", () => { tabExplore.classList.add("active"); tabQuiz.classList.remove("active"); paneExplore.hidden = false; paneQuiz.hidden = true; });
tabQuiz.addEventListener("click",    () => { tabQuiz.classList.add("active"); tabExplore.classList.remove("active"); paneExplore.hidden = true; paneQuiz.hidden = false; startQuiz(); });

// ---- audio
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
function ding() { tone(660,80,"triangle",0.05); setTimeout(()=>tone(990,100,"triangle",0.05),70); }
function buzz() { tone(180,200,"sawtooth",0.05); }
function fanfare() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05),i*110)); }

// ---- Quiz ----
const QUESTIONS = [
  { q: "Which group has the <em>highest</em> percentage achieving the GCSE measure?",
    options: ["Chinese pupils", "White British pupils", "Black Caribbean pupils", "FSM-eligible pupils"],
    answer: "Chinese pupils" },
  { q: "What is the approximate FSM gap (non-FSM minus FSM eligible) at GCSE, in percentage points?",
    options: ["About 5 pp", "About 12 pp", "About 23 pp", "About 40 pp"],
    answer: "About 23 pp" },
  { q: "In every combination of gender and FSM status, who tends to outperform whom?",
    options: ["Boys outperform girls within each FSM group", "Girls outperform boys within each FSM group", "There is no consistent gender pattern", "FSM girls outperform non-FSM boys"],
    answer: "Girls outperform boys within each FSM group" },
  { q: "Which group has the <em>lowest</em> attainment in the ethnicity breakdown?",
    options: ["Black Caribbean", "Gypsy / Roma", "White British", "Asian (other)"],
    answer: "Gypsy / Roma" },
  { q: "Which statement best describes the gender gap at GCSE?",
    options: ["Boys outperform girls by ~5 pp", "Girls outperform boys by ~10 pp", "There is no measurable gap", "The gap reverses by ethnicity"],
    answer: "Girls outperform boys by ~10 pp" },
  { q: "Which combination performs lowest in the gender × FSM breakdown?",
    options: ["FSM boys", "FSM girls", "Non-FSM boys", "Non-FSM girls"],
    answer: "FSM boys" },
];

let queue = [], qi = 0, qs = 0;
function startQuiz() {
  queue = [...QUESTIONS].sort(() => Math.random() - 0.5);
  qi = 0; qs = 0;
  qScore.textContent = "0";
  qTotal.textContent = queue.length;
  socResult.hidden = true;
  nextQ();
}
function nextQ() {
  if (qi >= queue.length) { finish(); return; }
  qIdx.textContent = qi + 1;
  const q = queue[qi];
  qPrompt.innerHTML = q.q;
  qOptions.innerHTML = "";
  q.options.slice().sort(() => Math.random() - 0.5).forEach(opt => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "q-opt";
    b.textContent = opt;
    b.addEventListener("click", () => answer(opt, b));
    qOptions.appendChild(b);
  });
  qFeedback.innerHTML = "Pick the option that best fits what the data shows.";
  qFeedback.className = "soc-feedback";
}
function answer(picked, btn) {
  const q = queue[qi];
  document.querySelectorAll(".q-opt").forEach(x => x.disabled = true);
  if (picked === q.answer) {
    btn.classList.add("correct");
    qs++; qScore.textContent = qs;
    qFeedback.innerHTML = `<strong>Correct.</strong>`;
    qFeedback.className = "soc-feedback ok";
    ding();
    setTimeout(() => { qi++; nextQ(); }, 1500);
  } else {
    btn.classList.add("wrong");
    [...qOptions.children].find(b => b.textContent === q.answer)?.classList.add("correct");
    qFeedback.innerHTML = `<strong>The answer is: ${q.answer}.</strong> <button class="qfb-next" type="button">Next question &rarr;</button>`;
    qFeedback.className = "soc-feedback bad";
    buzz();
    qFeedback.querySelector(".qfb-next")?.addEventListener("click", () => { qi++; nextQ(); });
  }
}
function finish() {
  socResult.hidden = false;
  let t, m;
  if (qs === queue.length) { t = "Data-literate."; m = `${qs} / ${queue.length}. You read the patterns cleanly.`; fanfare(); }
  else if (qs >= 4) { t = "Strong run."; m = `${qs} / ${queue.length}. Worth checking the chart for the misses.`; fanfare(); }
  else { t = "Round complete."; m = `${qs} / ${queue.length}. Explore mode is the revision — try each grouping.`; }
  resultTitle.textContent = t;
  resultMsg.textContent = m;
}
document.getElementById("qReset").addEventListener("click", startQuiz);
document.getElementById("qAgain").addEventListener("click", startQuiz);
