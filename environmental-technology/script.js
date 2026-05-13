// Environmental Technology — Energy from the Sun
// Solar PV system designer: pick panel type, orientation, tilt, roof area.
// Live yield estimate vs annual household demand (NI typical ~3500 kWh).
// Plus an 8-question knowledge check on PV types, tracking, passive design.

const PANELS = [
  { id: "mono",  name: "Monocrystalline", eff: 0.20, cost: 250, detail: "Highest efficiency (~20%). Most expensive per panel but smallest area for the same yield. Black, uniform appearance." },
  { id: "poly",  name: "Polycrystalline", eff: 0.16, cost: 180, detail: "Mid-range efficiency (~16%). Cheaper than mono but takes more roof area for the same yield. Blue, speckled look." },
  { id: "thick", name: "Thick-film",      eff: 0.12, cost: 140, detail: "Older technology (~12%). Lower upfront cost but lower yield per m²." },
  { id: "thin",  name: "Thin-film",       eff: 0.10, cost: 110, detail: "Flexible and lightweight, ~10% efficient. Works in lower light and at higher temperatures than crystalline." },
];

const ORIENTS = [
  { id: "N", name: "N", mult: 0.55 },
  { id: "E", name: "E", mult: 0.78 },
  { id: "S", name: "S", mult: 1.00 },
  { id: "W", name: "W", mult: 0.78 },
];

// NI average annual solar irradiation on a horizontal surface ~ 900 kWh/m²
// (Belfast / Newry area, PVGIS-style)
const NI_IRRADIATION = 900; // kWh/m²/yr horizontal
const HOUSEHOLD_DEMAND = 3500; // typical NI household kWh/yr
const CO2_PER_KWH = 0.193; // kg CO2 per kWh saved (UK grid mix)

let panel = PANELS[0];
let orient = ORIENTS[2]; // S
let tilt = 35;
let area = 15;

const houseSvg = document.getElementById("houseSvg");
const yieldVal = document.getElementById("yieldVal");
const metVal = document.getElementById("metVal");
const co2Val = document.getElementById("co2Val");
const costVal = document.getElementById("costVal");
const panelRow = document.getElementById("panelRow");
const panelDetail = document.getElementById("panelDetail");
const orientRow = document.getElementById("orientRow");
const tiltSlider = document.getElementById("tilt");
const tiltVal = document.getElementById("tiltVal");
const areaSlider = document.getElementById("area");
const areaVal = document.getElementById("areaVal");
const solarFb = document.getElementById("solarFb");

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
function tick(){ tone(720,40,"triangle",0.04); }
function ding(){ tone(660,80,"triangle",0.05); setTimeout(()=>tone(990,100,"triangle",0.05),70); }
function buzz(){ tone(180,200,"sawtooth",0.05); }
function fanfare(){ [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05),i*110)); }

// ---- Panel buttons
PANELS.forEach(p => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "panel-btn"; b.dataset.id = p.id;
  if (p.id === "mono") b.classList.add("active");
  b.innerHTML = `<div class="panel-name">${p.name}</div><div class="panel-eff">${Math.round(p.eff*100)}% efficient · £${p.cost}/m²</div>`;
  b.addEventListener("click", () => {
    document.querySelectorAll(".panel-btn.active").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    panel = p;
    panelDetail.textContent = p.detail;
    tick();
    refresh();
  });
  panelRow.appendChild(b);
});
panelDetail.textContent = panel.detail;

// ---- Orientation buttons
ORIENTS.forEach(o => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "orient-btn"; b.dataset.id = o.id;
  if (o.id === "S") b.classList.add("active");
  b.textContent = o.name;
  b.title = o.id === "S" ? "South — best in Northern Hemisphere" : (o.id === "N" ? "North — worst" : `${o.name} — partial`);
  b.addEventListener("click", () => {
    document.querySelectorAll(".orient-btn.active").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    orient = o;
    tick();
    refresh();
  });
  orientRow.appendChild(b);
});

// ---- Sliders
tiltSlider.addEventListener("input", () => { tilt = parseInt(tiltSlider.value); tiltVal.textContent = tilt; refresh(); });
areaSlider.addEventListener("input", () => { area = parseInt(areaSlider.value); areaVal.textContent = area; refresh(); });

// ---- Calculations
function tiltFactor(t) {
  // Roughly: optimum ~35° at NI latitude. Bell curve falling off at 0° or 60°.
  // factor = 0.5 + 0.5 * cos((t - 35) / 35 * π/2)
  const diff = Math.abs(t - 35) / 35;
  return 1 - 0.4 * diff * diff; // 1.0 at 35, ~0.6 at 0 or 70
}

function refresh() {
  // yield = irradiation × area × panel-eff × orientation-mult × tilt-factor
  const yld = NI_IRRADIATION * area * panel.eff * orient.mult * tiltFactor(tilt);
  const met = Math.min(100, Math.round((yld / HOUSEHOLD_DEMAND) * 100));
  const co2 = Math.round(yld * CO2_PER_KWH);
  const cost = Math.round(panel.cost * area);
  yieldVal.textContent = `${Math.round(yld).toLocaleString()} kWh/yr`;
  metVal.textContent = `${met} %`;
  co2Val.textContent = `${co2.toLocaleString()} kg/yr`;
  costVal.textContent = `£${cost.toLocaleString()}`;
  drawHouse();

  // Feedback
  if (yld > HOUSEHOLD_DEMAND * 1.1) {
    solarFb.innerHTML = `<strong>Excellent design.</strong> Estimated annual yield exceeds household demand by over 10%. You could export surplus to the grid through a Smart Export Guarantee.`;
    solarFb.className = "solar-feedback ok";
  } else if (met >= 90) {
    solarFb.innerHTML = `<strong>Strong design.</strong> Covers ~${met}% of a typical NI home's annual electricity demand.`;
    solarFb.className = "solar-feedback ok";
  } else if (met >= 60) {
    solarFb.innerHTML = `<strong>Good design.</strong> ${met}% of demand covered. Bumping up panel area or switching to monocrystalline would push this higher.`;
    solarFb.className = "solar-feedback";
  } else {
    solarFb.innerHTML = `<strong>Limited yield.</strong> Only ${met}% of demand. ${orient.id !== "S" ? "South-facing is the biggest single change. " : ""}${tilt < 25 || tilt > 50 ? "Tilt close to 35° at NI latitude. " : ""}${panel.eff < 0.16 ? "Higher-efficiency panels would help. " : ""}`;
    solarFb.className = "solar-feedback bad";
  }
}

function drawHouse() {
  // Stylised home with a pitched roof + PV panels at the chosen tilt + sun
  const orientLabel = orient.id;
  // Sun position varies by orientation
  const sunX = orientLabel === "E" ? 60 : orientLabel === "W" ? 540 : orientLabel === "N" ? 300 : 300;
  const sunY = orientLabel === "N" ? 320 : 60;
  // panel intensity colour by yield (mono = darker, thin = lighter)
  const panelCol = panel.id === "mono" ? "#0E2240" : panel.id === "poly" ? "#1F4E84" : panel.id === "thick" ? "#3A6E94" : "#5C8FA8";
  // tilt visualisation — use angle on the roof
  const tiltDeg = tilt;
  let svg = `
    <defs>
      <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#C7E0EF"/>
        <stop offset="1" stop-color="#F4F0CC"/>
      </linearGradient>
      <linearGradient id="grass" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#7DB37D"/>
        <stop offset="1" stop-color="#3F7E3F"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="600" height="280" fill="url(#sky)"/>
    <rect x="0" y="280" width="600" height="80" fill="url(#grass)"/>
    <!-- Sun -->
    <circle cx="${sunX}" cy="${sunY}" r="34" fill="#FFE066" stroke="#E8B43A" stroke-width="3"/>
    <g stroke="#E8B43A" stroke-width="3" stroke-linecap="round">
      ${[0,45,90,135,180,225,270,315].map(a => {
        const rad = a * Math.PI / 180;
        const x1 = sunX + Math.cos(rad) * 42;
        const y1 = sunY + Math.sin(rad) * 42;
        const x2 = sunX + Math.cos(rad) * 56;
        const y2 = sunY + Math.sin(rad) * 56;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
      }).join("")}
    </g>
    <!-- House body -->
    <rect x="180" y="200" width="240" height="100" fill="#F5E6C8" stroke="#7C5A30" stroke-width="2"/>
    <rect x="220" y="240" width="40" height="60" fill="#7C5A30"/>
    <rect x="290" y="230" width="40" height="40" fill="#9BD0F4" stroke="#7C5A30" stroke-width="2"/>
    <rect x="350" y="230" width="40" height="40" fill="#9BD0F4" stroke="#7C5A30" stroke-width="2"/>
    <!-- Roof -->
    <polygon points="180,200 300,120 420,200" fill="#7C2A1F" stroke="#4A0E0E" stroke-width="2"/>
    <!-- PV panels on roof -- positioned to reflect tilt -->
    <g transform="translate(220, ${200 - (tiltDeg/60)*40}) rotate(${-(60-tiltDeg)/2})">
      <rect x="0" y="0" width="160" height="60" fill="${panelCol}" stroke="#1A1A1A" stroke-width="2"/>
      <g stroke="#1A1A1A" stroke-width="1">
        ${[1,2,3].map(i => `<line x1="${i*40}" y1="0" x2="${i*40}" y2="60"/>`).join("")}
        <line x1="0" y1="30" x2="160" y2="30"/>
      </g>
      <!-- panel area visualised by alpha overlay -->
      <rect x="0" y="0" width="${(area/30)*160}" height="60" fill="#FFE066" opacity="0.18"/>
    </g>
    <!-- Compass / orientation arrow -->
    <g transform="translate(540, 320)">
      <circle cx="0" cy="0" r="18" fill="white" stroke="#595959" stroke-width="1.5"/>
      <text x="0" y="-22" text-anchor="middle" font-family="SF Mono, monospace" font-size="9" font-weight="800" fill="#225F32">${orient.id}</text>
      <polygon points="0,-12 4,4 0,0 -4,4" fill="#3F8E54"/>
    </g>
  `;
  houseSvg.innerHTML = svg;
}

refresh();

// ---- Tabs
const tabDesign = document.getElementById("tabDesign");
const tabQuiz = document.getElementById("tabQuiz");
const paneDesign = document.getElementById("paneDesign");
const paneQuiz = document.getElementById("paneQuiz");
tabDesign.addEventListener("click", () => { tabDesign.classList.add("active"); tabQuiz.classList.remove("active"); paneDesign.hidden = false; paneQuiz.hidden = true; });
tabQuiz.addEventListener("click",   () => { tabQuiz.classList.add("active"); tabDesign.classList.remove("active"); paneDesign.hidden = true; paneQuiz.hidden = false; startQuiz(); });

// ---- Quiz
const QUESTIONS = [
  { q: "Which PV panel type is typically the most efficient (~20%)?",
    opts: ["Monocrystalline", "Polycrystalline", "Thin-film", "Thick-film"],
    ans: "Monocrystalline" },
  { q: "At UK latitudes, roughly what roof tilt maximises year-round yield from a fixed solar panel?",
    opts: ["10°", "20°", "35°", "60°"],
    ans: "35°" },
  { q: "Which orientation gives the highest annual yield in Northern Ireland?",
    opts: ["North", "East", "South", "West"],
    ans: "South" },
  { q: "What is the role of the semiconductor wafer in a PV cell?",
    opts: ["Stores the electricity produced", "Creates a potential barrier so photons release photoelectrons that flow as current", "Converts electricity into heat", "Reflects unwanted UV"],
    ans: "Creates a potential barrier so photons release photoelectrons that flow as current" },
  { q: "Passive solar design relies on which of these features?",
    opts: ["Photovoltaic panels on the roof", "Battery storage in the loft", "Window placement, thermal mass and insulation", "Parabolic mirrors in the garden"],
    ans: "Window placement, thermal mass and insulation" },
  { q: "Solar thermal collectors (not PV) are used to…",
    opts: ["Generate electricity directly", "Heat water for domestic use", "Power smart meters", "Charge electric vehicles"],
    ans: "Heat water for domestic use" },
  { q: "Why is a water-glycol mix used in the solar thermal loop?",
    opts: ["It absorbs more light than water", "It prevents freezing in winter and tolerates boiling in summer", "It's cheaper than water", "It conducts more heat than steam"],
    ans: "It prevents freezing in winter and tolerates boiling in summer" },
  { q: "An automated tracking system increases solar yield by…",
    opts: ["Cleaning the panel surface", "Following the sun's path so panels stay perpendicular to incoming rays", "Storing energy in batteries", "Cooling the panels with water"],
    ans: "Following the sun's path so panels stay perpendicular to incoming rays" },
];

const qIdx = document.getElementById("qIdx");
const qTotal = document.getElementById("qTotal");
const qScore = document.getElementById("qScore");
const qFeedback = document.getElementById("qFeedback");
const qPrompt = document.getElementById("qPrompt");
const qOptions = document.getElementById("qOptions");
const solarResult = document.getElementById("solarResult");
const resultTitle = document.getElementById("resultTitle");
const resultMsg = document.getElementById("resultMsg");

let queue = [], qi = 0, qs = 0;
function startQuiz() {
  queue = [...QUESTIONS].sort(() => Math.random() - 0.5);
  qi = 0; qs = 0;
  qScore.textContent = "0";
  qTotal.textContent = queue.length;
  solarResult.hidden = true;
  nextQ();
}
function nextQ() {
  if (qi >= queue.length) { finish(); return; }
  qIdx.textContent = qi + 1;
  const q = queue[qi];
  qPrompt.innerHTML = q.q;
  qOptions.innerHTML = "";
  q.opts.slice().sort(() => Math.random() - 0.5).forEach(opt => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "q-opt"; b.textContent = opt;
    b.addEventListener("click", () => handle(opt, b, q.ans));
    qOptions.appendChild(b);
  });
  qFeedback.innerHTML = "Each question is grounded in the CCEA Energy from the Sun fact files.";
  qFeedback.className = "solar-feedback";
}
function handle(picked, btn, correct) {
  document.querySelectorAll(".q-opt").forEach(x => x.disabled = true);
  if (picked === correct) {
    btn.classList.add("correct");
    qs++; qScore.textContent = qs;
    qFeedback.innerHTML = `<strong>Correct.</strong>`;
    qFeedback.className = "solar-feedback ok";
    ding();
  } else {
    btn.classList.add("wrong");
    [...qOptions.children].find(b => b.textContent === correct)?.classList.add("correct");
    qFeedback.innerHTML = `<strong>The answer is: ${correct}.</strong>`;
    qFeedback.className = "solar-feedback bad";
    buzz();
  }
  setTimeout(() => { qi++; nextQ(); }, 1700);
}
function finish() {
  solarResult.hidden = false;
  let t, m;
  if (qs === queue.length) { t = "Energy specialist."; m = `${qs} / ${queue.length}. Across all four fact files.`; fanfare(); }
  else if (qs >= 6) { t = "Strong run."; m = `${qs} / ${queue.length}. Solid grasp of the spec.`; fanfare(); }
  else { t = "Quiz complete."; m = `${qs} / ${queue.length}. Have another go — the designer mode is good revision for orientation and tilt effects.`; }
  resultTitle.textContent = t;
  resultMsg.textContent = m;
}
document.getElementById("qReset").addEventListener("click", startQuiz);
document.getElementById("qAgain").addEventListener("click", startQuiz);
