// Home Economics — Kitchen Inspector
// 10 scenarios. Each: a single-subject icon, a scenario description, and four
// multi-choice options drawn from the seven hazard categories.

const CATS = {
  cross:    { label: "Cross-contamination",    colour: "#C72E2E" },
  temp:     { label: "Temperature control",    colour: "#1F6FA8" },
  hygiene:  { label: "Personal hygiene",       colour: "#C76838" },
  chemical: { label: "Chemical contamination", colour: "#7C3F9E" },
  date:     { label: "Out of date",            colour: "#B68515" },
  physical: { label: "Physical hazard",        colour: "#3A4555" },
  safe:     { label: "Safe practice",          colour: "#3F7D34" },
};

// Single-subject line-art icons, drawn cleanly. Each ~76px stroke-only on
// a coloured background circle (set via .round-icon[data-cat=...]).
const ICONS = {
  thermometer: `<svg viewBox="0 0 96 96" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M48 8c-5 0-9 4-9 9v44a14 14 0 1 0 18 0V17c0-5-4-9-9-9z"/>
    <line x1="48" y1="22" x2="48" y2="50"/>
    <circle cx="48" cy="72" r="9" stroke-width="3.5" fill="#fff" fill-opacity="0.15"/>
    <line x1="40" y1="30" x2="44" y2="30"/>
    <line x1="40" y1="42" x2="44" y2="42"/>
  </svg>`,
  fridge: `<svg viewBox="0 0 96 96" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="22" y="10" width="52" height="76" rx="4"/>
    <line x1="22" y1="40" x2="74" y2="40"/>
    <line x1="36" y1="22" x2="36" y2="32"/>
    <line x1="36" y1="52" x2="36" y2="68"/>
    <path d="M52 20h12M52 26h8"/>
  </svg>`,
  chicken: `<svg viewBox="0 0 96 96" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M30 56c0-14 12-26 26-26 12 0 20 8 18 20-1 8-7 14-15 16l-2 12-12 4-4-12c-7-2-11-7-11-14z"/>
    <line x1="22" y1="78" x2="36" y2="68"/>
    <circle cx="56" cy="40" r="2" fill="#fff"/>
  </svg>`,
  egg: `<svg viewBox="0 0 96 96" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M48 12c-14 0-26 18-26 38a26 26 0 1 0 52 0c0-20-12-38-26-38z"/>
    <path d="M40 36l4 4-3 4 4 3-3 4 4 3"/>
  </svg>`,
  board: `<svg viewBox="0 0 96 96" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="12" y="22" width="72" height="58" rx="6"/>
    <circle cx="34" cy="48" r="9"/>
    <circle cx="60" cy="50" r="10"/>
    <path d="M30 42l1 2M34 40l1 2"/>
    <path d="M56 46l2 2M60 44l2 2M64 46l2 2"/>
  </svg>`,
  spray: `<svg viewBox="0 0 96 96" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="36" y="32" width="26" height="46" rx="4"/>
    <path d="M36 42l-12 6 12 6"/>
    <path d="M42 20h14v12H42z"/>
    <line x1="18" y1="38" x2="14" y2="34"/>
    <line x1="18" y1="48" x2="12" y2="48"/>
    <line x1="18" y1="58" x2="14" y2="62"/>
  </svg>`,
  hair: `<svg viewBox="0 0 96 96" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="48" cy="40" r="18"/>
    <path d="M36 32c-4-12 8-22 12-22s16 10 12 22"/>
    <path d="M32 44c-6 6-8 16-4 26M64 44c6 6 8 16 4 26"/>
    <circle cx="42" cy="42" r="1.5" fill="#fff"/>
    <circle cx="54" cy="42" r="1.5" fill="#fff"/>
    <path d="M42 50c2 2 8 2 10 0"/>
  </svg>`,
  calendar: `<svg viewBox="0 0 96 96" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="16" y="22" width="64" height="58" rx="4"/>
    <line x1="16" y1="36" x2="80" y2="36"/>
    <line x1="32" y1="14" x2="32" y2="28"/>
    <line x1="64" y1="14" x2="64" y2="28"/>
    <path d="M34 56l28 14M34 70l28-14"/>
  </svg>`,
  knife: `<svg viewBox="0 0 96 96" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 56l44-32c4-3 10 0 8 5l-12 30z"/>
    <rect x="62" y="58" width="20" height="8" rx="2"/>
    <line x1="68" y1="60" x2="68" y2="64"/>
    <line x1="74" y1="60" x2="74" y2="64"/>
  </svg>`,
  rice: `<svg viewBox="0 0 96 96" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="48" cy="62" rx="32" ry="10"/>
    <path d="M16 62c0 8 14 14 32 14s32-6 32-14"/>
    <path d="M22 56c8-10 22-14 26-14s18 4 26 14"/>
    <path d="M34 36c-2-6 0-12 0-12M48 32c-2-8 0-14 0-14M62 36c2-6 0-12 0-12"/>
  </svg>`,
  hands: `<svg viewBox="0 0 96 96" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M30 64c0-6 4-12 10-14M66 64c0-6-4-12-10-14"/>
    <path d="M30 46c-4 0-8 4-8 10v14a6 6 0 0 0 6 6h40a6 6 0 0 0 6-6V56c0-6-4-10-8-10"/>
    <path d="M30 46v-8a4 4 0 0 1 8 0v8M58 46v-8a4 4 0 0 1 8 0v8M44 36c0-4 2-6 4-6s4 2 4 6v10M40 18l-4 4M56 18l4 4M48 12v6"/>
  </svg>`,
};

const SCENARIOS = [
  {
    icon: "thermometer",
    scenario: "The fridge thermometer reads 12 °C.",
    detail: "A fridge should run below 5 °C. Above that, bacteria like <strong>Listeria</strong> and <strong>E. coli</strong> can multiply quickly on stored food.",
    answer: "temp",
    options: ["temp", "physical", "chemical", "safe"],
  },
  {
    icon: "fridge",
    scenario: "Raw chicken is on the top shelf of the fridge, right above a tray of cooked ham.",
    detail: "Juices from raw meat can drip down onto cooked food and contaminate it. Always store raw meat on the bottom shelf, in a sealed container, below ready-to-eat foods.",
    answer: "cross",
    options: ["cross", "temp", "date", "physical"],
  },
  {
    icon: "egg",
    scenario: "The cook reaches for an egg and notices a fine crack in the shell — they use it anyway.",
    detail: "A cracked shell lets bacteria like <strong>Salmonella</strong> reach the egg contents. Discard cracked eggs — never use them, even in baking.",
    answer: "cross",
    options: ["cross", "physical", "hygiene", "safe"],
  },
  {
    icon: "board",
    scenario: "The same wooden chopping board is used for raw chicken and then, without washing, for chopping salad.",
    detail: "This is textbook cross-contamination. Use separate colour-coded boards for raw meat and ready-to-eat foods, or wash thoroughly with hot soapy water in between.",
    answer: "cross",
    options: ["cross", "hygiene", "physical", "chemical"],
  },
  {
    icon: "spray",
    scenario: "A bottle of bleach spray is on the worktop, right next to an open bag of flour.",
    detail: "Cleaning chemicals must never be stored alongside food — droplets or accidental spray contaminate the food. Keep chemicals in a separate, clearly labelled cupboard.",
    answer: "chemical",
    options: ["chemical", "physical", "cross", "safe"],
  },
  {
    icon: "hair",
    scenario: "A staff member is preparing food with their long hair loose and uncovered.",
    detail: "Hair can fall into food and carries bacteria. Tie hair back and wear a hat or hairnet when preparing food.",
    answer: "hygiene",
    options: ["hygiene", "physical", "cross", "safe"],
  },
  {
    icon: "calendar",
    scenario: "A pint of milk shows a use-by date that passed three days ago.",
    detail: "<strong>Use-by</strong> dates are about safety — after this date, the product should not be consumed even if it looks fine. (Compare with <em>best-before</em>, which is about quality.)",
    answer: "date",
    options: ["date", "temp", "hygiene", "safe"],
  },
  {
    icon: "knife",
    scenario: "Sharp knives have been left in the sink, submerged in soapy water.",
    detail: "Hidden under suds, a sharp blade is a serious cut hazard for anyone reaching into the sink. Wash and put knives away immediately.",
    answer: "physical",
    options: ["physical", "hygiene", "chemical", "safe"],
  },
  {
    icon: "rice",
    scenario: "A pan of cooked rice has been sitting on the counter at room temperature for four hours.",
    detail: "Cooked rice held in the danger zone (5–63 °C) allows <strong>Bacillus cereus</strong> spores to multiply. Cool quickly and refrigerate within an hour.",
    answer: "temp",
    options: ["temp", "date", "physical", "safe"],
  },
  {
    icon: "hands",
    scenario: "The cook washes their hands with soap and warm water for 20 seconds before handling raw meat.",
    detail: "This is a textbook safe practice. Thorough hand-washing before, between and after food tasks is one of the single most important controls.",
    answer: "safe",
    options: ["safe", "hygiene", "physical", "chemical"],
  },
];

// ---- DOM ----
const screenIntro   = document.getElementById("screenIntro");
const screenRound   = document.getElementById("screenRound");
const screenResults = document.getElementById("screenResults");
const btnStart   = document.getElementById("btnStart");
const btnNext    = document.getElementById("btnNext");
const btnAgain   = document.getElementById("btnAgain");
const btnQuit    = document.getElementById("btnQuit");
const rNum       = document.getElementById("rNum");
const rTotal     = document.getElementById("rTotal");
const rScore     = document.getElementById("rScore");
const roundIcon  = document.getElementById("roundIcon");
const roundScenario = document.getElementById("roundScenario");
const roundDetail   = document.getElementById("roundDetail");
const roundOptions  = document.getElementById("roundOptions");
const roundFeedback = document.getElementById("roundFeedback");
const resultTitle   = document.getElementById("resultTitle");
const resultMsg     = document.getElementById("resultMsg");
const catGrid       = document.getElementById("catGrid");

let order = []; // shuffled scenario indices
let idx = 0;
let score = 0;
let catTally = {}; // {catId: {hit: 0, total: 0}}

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
function ding() { tone(720, 80, "triangle", 0.05); setTimeout(()=>tone(1080,100,"triangle",0.05), 70); }
function buzz() { tone(180, 220, "sawtooth", 0.05); }
function fanfare() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05), i*110)); }

function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function start() {
  order = shuffle(SCENARIOS.map((_, i) => i));
  idx = 0; score = 0; catTally = {};
  Object.keys(CATS).forEach(c => catTally[c] = { hit: 0, total: 0 });
  rTotal.textContent = SCENARIOS.length;
  rScore.textContent = "0";
  screenIntro.hidden = true;
  screenResults.hidden = true;
  screenRound.hidden = false;
  renderRound();
}

function renderRound() {
  const s = SCENARIOS[order[idx]];
  rNum.textContent = idx + 1;
  roundIcon.dataset.cat = s.answer;
  roundIcon.innerHTML = ICONS[s.icon];
  roundScenario.textContent = s.scenario;
  roundDetail.innerHTML = "";
  roundFeedback.textContent = "";
  roundFeedback.classList.remove("shown", "ok", "bad");
  btnNext.hidden = true;

  // shuffle options so the correct answer isn't always in the same place
  const opts = shuffle(s.options.slice());
  roundOptions.innerHTML = "";
  opts.forEach(c => {
    const b = document.createElement("button");
    b.className = "opt-btn";
    b.type = "button";
    b.dataset.cat = c;
    b.innerHTML = `<span class="opt-dot" style="background:${CATS[c].colour}"></span>${CATS[c].label}`;
    b.addEventListener("click", () => answer(c, b));
    roundOptions.appendChild(b);
  });
}

function answer(picked, btn) {
  const s = SCENARIOS[order[idx]];
  document.querySelectorAll(".opt-btn").forEach(x => x.disabled = true);
  catTally[s.answer].total++;
  const ok = picked === s.answer;
  if (ok) {
    score++;
    rScore.textContent = score;
    btn.classList.add("correct");
    catTally[s.answer].hit++;
    roundFeedback.innerHTML = `<strong>Correct.</strong> ${s.detail}`;
    roundFeedback.classList.add("shown", "ok");
    ding();
  } else {
    btn.classList.add("wrong");
    // also highlight the right answer
    document.querySelector(`.opt-btn[data-cat="${s.answer}"]`)?.classList.add("correct");
    roundFeedback.innerHTML = `<strong>Not quite.</strong> The category here is <strong>${CATS[s.answer].label}</strong>. ${s.detail}`;
    roundFeedback.classList.add("shown", "bad");
    buzz();
  }
  // show "next" or "finish"
  btnNext.hidden = false;
  btnNext.textContent = (idx === SCENARIOS.length - 1) ? "Finish inspection →" : "Next inspection →";
}

function nextOrFinish() {
  idx++;
  if (idx >= SCENARIOS.length) { finish(); return; }
  renderRound();
}

function finish() {
  screenRound.hidden = true;
  screenResults.hidden = false;
  let title, msg;
  if (score === SCENARIOS.length) {
    title = "Perfect — pass with flying colours.";
    msg = `${score} / ${SCENARIOS.length}. You'd close that kitchen and reopen it the same day.`;
    fanfare();
  } else if (score >= 8) {
    title = "Strong inspection.";
    msg = `${score} / ${SCENARIOS.length}. Sharp eye — a couple of categories to review.`;
    fanfare();
  } else if (score >= 5) {
    title = "Decent attempt.";
    msg = `${score} / ${SCENARIOS.length}. Check the categories below where you struggled, then have another go.`;
  } else {
    title = "Worth another inspection.";
    msg = `${score} / ${SCENARIOS.length}. The category breakdown below shows what to revise.`;
  }
  resultTitle.textContent = title;
  resultMsg.textContent = msg;

  catGrid.innerHTML = "";
  Object.entries(catTally).forEach(([c, t]) => {
    if (t.total === 0) return;
    const row = document.createElement("div");
    row.className = "cat-row " + (t.hit === t.total ? "hit" : "miss");
    row.innerHTML = `
      <span class="cat-dot" style="background:${CATS[c].colour}"></span>
      <span>${CATS[c].label}</span>
      <span class="cat-score">${t.hit} / ${t.total}</span>
    `;
    catGrid.appendChild(row);
  });
}

btnStart.addEventListener("click", start);
btnAgain.addEventListener("click", start);
btnNext.addEventListener("click", nextOrFinish);
btnQuit.addEventListener("click", () => {
  screenRound.hidden = true;
  screenIntro.hidden = false;
});
