// Junior Science — Cells, organisation and specialised cells
// Three modes: Explore (click organelles for facts), Label challenge,
// Specialised cells match.

// ---- Organelle data (positions in 0..400 x 0..320 SVG space)
// "where" = "both" or "plant-only"
const ORGANELLES = [
  {
    id: "nucleus", label: "Nucleus", where: "both",
    title: "Nucleus",
    body: "The <strong>control centre</strong> of the cell. Contains the DNA — instructions for everything the cell does. Both animal and plant cells have one.",
    animal: { x: 200, y: 160 },
    plant:  { x: 200, y: 160 },
  },
  {
    id: "cyto", label: "Cytoplasm", where: "both",
    title: "Cytoplasm",
    body: "A jelly-like substance that fills the cell. <strong>Chemical reactions happen here</strong>. Both cells have it.",
    animal: { x: 130, y: 100 },
    plant:  { x: 130, y: 100 },
  },
  {
    id: "membrane", label: "Cell membrane", where: "both",
    title: "Cell membrane",
    body: "A thin, flexible layer that <strong>controls what enters and leaves</strong> the cell. Both animal and plant cells have one.",
    animal: { x: 65, y: 200 },
    plant:  { x: 65, y: 200 },
  },
  {
    id: "mito", label: "Mitochondria", where: "both",
    title: "Mitochondria",
    body: "The <strong>powerhouses</strong> — where energy is released from glucose by respiration. Both animal and plant cells have them.",
    animal: { x: 290, y: 230 },
    plant:  { x: 290, y: 240 },
  },
  {
    id: "wall", label: "Cell wall", where: "plant-only",
    title: "Cell wall",
    body: "A <strong>rigid layer of cellulose</strong> that surrounds the cell membrane. Gives plant cells their boxy shape and strength. <em>Animal cells do not have one.</em>",
    plant: { x: 35, y: 35 },
  },
  {
    id: "chloro", label: "Chloroplast", where: "plant-only",
    title: "Chloroplast",
    body: "Green discs containing <strong>chlorophyll</strong>. They capture light energy and turn it into glucose by photosynthesis. <em>Only in plant cells.</em>",
    plant: { x: 280, y: 90 },
  },
  {
    id: "vacuole", label: "Permanent vacuole", where: "plant-only",
    title: "Permanent vacuole",
    body: "A large bag of <strong>cell sap</strong> in the middle of the cell. Keeps the cell firm (turgid). <em>Only in plant cells.</em>",
    plant: { x: 145, y: 230 },
  },
];

// ---- audio
let ac;
function tone(f, ms, type="sine", g=0.05) {
  try {
    ac = ac || new (window.AudioContext||window.webkitAudioContext)();
    const o = ac.createOscillator(); const gn = ac.createGain();
    o.type=type; o.frequency.value=f; gn.gain.value=g;
    o.connect(gn); gn.connect(ac.destination); o.start();
    gn.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + ms/1000);
    o.stop(ac.currentTime + ms/1000 + 0.02);
  } catch {}
}
function click() { tone(700, 50, "triangle", 0.04); }
function ding()  { tone(660, 80, "triangle", 0.05); setTimeout(()=>tone(990,100,"triangle",0.05),70); }
function buzz()  { tone(180, 200, "sawtooth", 0.05); }
function fanfare() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05),i*110)); }

// ---- SVG drawing
function drawCellShared(svg, isPlant, withPins) {
  svg.innerHTML = "";
  // Cell wall (plant only)
  if (isPlant) {
    svg.innerHTML += `<rect x="15" y="15" width="370" height="290" rx="14" fill="#9CC79C" stroke="#2E6633" stroke-width="3"/>`;
  }
  // Cell membrane
  const mx = isPlant ? 35 : 20;
  const mw = isPlant ? 330 : 360;
  if (isPlant) {
    svg.innerHTML += `<rect x="${mx}" y="${mx}" width="${mw}" height="290 - ${2*(mx-15)}" rx="10" fill="#FFF1D6" stroke="#A88BC7" stroke-width="3"/>`;
  } else {
    svg.innerHTML += `<ellipse cx="200" cy="160" rx="180" ry="140" fill="#FFF1D6" stroke="#A88BC7" stroke-width="3"/>`;
  }
  // For plant cell we use a rounded rect cytoplasm and add vacuole, chloroplasts
  if (isPlant) {
    // re-do background shapes properly to avoid the malformed SVG above
    svg.innerHTML = `
      <rect x="15" y="15" width="370" height="290" rx="14" fill="#9CC79C" stroke="#2E6633" stroke-width="3"/>
      <rect x="35" y="35" width="330" height="250" rx="10" fill="#FFF1D6" stroke="#A88BC7" stroke-width="3"/>
      <!-- Large central vacuole -->
      <ellipse cx="145" cy="230" rx="80" ry="42" fill="#BBE0F4" stroke="#3F8FBA" stroke-width="2.5"/>
      <text x="145" y="234" text-anchor="middle" font-size="11" fill="#2A5F82" font-weight="700">vacuole</text>
      <!-- Chloroplasts (multiple little green ovals) -->
      <g>
        <ellipse cx="280" cy="90"  rx="18" ry="9" fill="#6FBA6F" stroke="#2E6633" stroke-width="1.5"/>
        <ellipse cx="305" cy="115" rx="16" ry="8" fill="#6FBA6F" stroke="#2E6633" stroke-width="1.5"/>
        <ellipse cx="320" cy="80"  rx="14" ry="7" fill="#6FBA6F" stroke="#2E6633" stroke-width="1.5"/>
        <ellipse cx="290" cy="155" rx="15" ry="7" fill="#6FBA6F" stroke="#2E6633" stroke-width="1.5"/>
      </g>
      <!-- Nucleus -->
      <circle cx="200" cy="160" r="30" fill="#A18BC7" stroke="#5E3B85" stroke-width="2.5"/>
      <circle cx="200" cy="160" r="10" fill="#5E3B85"/>
      <!-- Mitochondria -->
      <g>
        <ellipse cx="290" cy="240" rx="18" ry="8" fill="#E26A6A" stroke="#812F2F" stroke-width="1.8"/>
        <path d="M 275 240 Q 280 234 285 240 Q 290 246 295 240 Q 300 234 305 240" fill="none" stroke="#812F2F" stroke-width="1.2"/>
      </g>
      <!-- Some cytoplasm specks for texture -->
      <g fill="#E8B864" opacity="0.7">
        <circle cx="100" cy="80" r="3"/><circle cx="155" cy="105" r="2.5"/>
        <circle cx="120" cy="190" r="2"/><circle cx="245" cy="270" r="3"/>
        <circle cx="335" cy="220" r="3"/><circle cx="80"  cy="270" r="2.5"/>
      </g>
    `;
  } else {
    // ANIMAL cell — rounded blob membrane, all internal organelles, NO wall/chloro/vacuole
    svg.innerHTML = `
      <ellipse cx="200" cy="160" rx="180" ry="140" fill="#FFF1D6" stroke="#A88BC7" stroke-width="3"/>
      <!-- Nucleus -->
      <circle cx="200" cy="160" r="34" fill="#A18BC7" stroke="#5E3B85" stroke-width="2.5"/>
      <circle cx="200" cy="160" r="12" fill="#5E3B85"/>
      <!-- Mitochondria -->
      <g>
        <ellipse cx="290" cy="230" rx="20" ry="9" fill="#E26A6A" stroke="#812F2F" stroke-width="1.8"/>
        <path d="M 273 230 Q 278 224 283 230 Q 288 236 293 230 Q 298 224 303 230" fill="none" stroke="#812F2F" stroke-width="1.2"/>
        <ellipse cx="95" cy="220" rx="16" ry="7" fill="#E26A6A" stroke="#812F2F" stroke-width="1.5"/>
      </g>
      <!-- Cytoplasm specks -->
      <g fill="#E8B864" opacity="0.7">
        <circle cx="130" cy="100" r="3"/><circle cx="155" cy="125" r="2"/>
        <circle cx="120" cy="160" r="2.5"/><circle cx="250" cy="100" r="3"/>
        <circle cx="280" cy="130" r="2"/><circle cx="100" cy="180" r="2.5"/>
        <circle cx="250" cy="245" r="2"/><circle cx="180" cy="260" r="3"/>
      </g>
    `;
  }
  if (withPins) addOrganellePins(svg, isPlant);
}

function addOrganellePins(svg, isPlant) {
  ORGANELLES.forEach((o, i) => {
    if (o.where === "plant-only" && !isPlant) return;
    const pos = isPlant ? (o.plant || o.animal) : o.animal;
    if (!pos) return;
    const pin = document.createElementNS("http://www.w3.org/2000/svg", "g");
    pin.setAttribute("class", "organelle organelle-pin");
    pin.dataset.id = o.id;
    pin.innerHTML = `
      <circle cx="${pos.x}" cy="${pos.y - 36}" r="11"/>
      <text x="${pos.x}" y="${pos.y - 36}">${i + 1}</text>
      <line x1="${pos.x}" y1="${pos.y - 26}" x2="${pos.x}" y2="${pos.y - 10}" stroke="#5E3B85" stroke-width="1.5" stroke-dasharray="2 2"/>
    `;
    pin.addEventListener("click", () => {
      svg.parentElement.parentElement.querySelectorAll(".organelle.active").forEach(x => x.classList.remove("active"));
      pin.classList.add("active");
      explainOrganelle(o);
    });
    svg.appendChild(pin);
  });
}

const detail = document.getElementById("organelleDetail");
function explainOrganelle(o) {
  detail.innerHTML = `
    <header class="detail-head">
      <h2 class="detail-title">${o.title}</h2>
      <span class="detail-where ${o.where === "plant-only" ? "plant-only" : ""}">${o.where === "plant-only" ? "Plant only" : "Both cells"}</span>
    </header>
    <p class="detail-body">${o.body}</p>
  `;
  click();
}

drawCellShared(document.getElementById("animalSvg"), false, true);
drawCellShared(document.getElementById("plantSvg"),  true,  true);

// ---- Tabs ----
const paneExplore = document.getElementById("paneExplore");
const paneLabel   = document.getElementById("paneLabel");
const paneSpec    = document.getElementById("paneSpec");
const tabs = document.querySelectorAll(".bio-tab");
function setTab(t) {
  tabs.forEach(b => b.classList.toggle("active", b.dataset.tab === t));
  paneExplore.hidden = t !== "explore";
  paneLabel.hidden   = t !== "label";
  paneSpec.hidden    = t !== "spec";
  if (t === "label") resetLabel();
  if (t === "spec")  resetSpec();
}
tabs.forEach(b => b.addEventListener("click", () => setTab(b.dataset.tab)));

// ---- Label challenge ----
const animalSvgQ = document.getElementById("animalSvgQ");
const plantSvgQ  = document.getElementById("plantSvgQ");
const labelBank  = document.getElementById("labelBank");
const labelFb    = document.getElementById("labelFb");
const placedN    = document.getElementById("placedN");
const correctN   = document.getElementById("correctN");
const wrongN     = document.getElementById("wrongN");
const totalN     = document.getElementById("totalN");
const labelResult = document.getElementById("labelResult");
let unplaced = new Set();
let selLabel = null;
let placed = 0, right = 0, wrong = 0;

function resetLabel() {
  unplaced = new Set(ORGANELLES.map(o => o.id));
  selLabel = null;
  placed = 0; right = 0; wrong = 0;
  placedN.textContent = "0"; correctN.textContent = "0"; wrongN.textContent = "0";
  totalN.textContent = ORGANELLES.length;
  labelResult.hidden = true;
  labelFb.innerHTML = "Pick a label below, then tap the matching organelle in either cell.";
  labelFb.className = "bio-feedback";
  drawLabelStage();
  drawLabelBank();
}

function drawLabelStage() {
  // Use ? pins by drawing cells then adding pins that respond
  drawCellShared(animalSvgQ, false, false);
  drawCellShared(plantSvgQ,  true,  false);
  ORGANELLES.forEach(o => {
    if (!unplaced.has(o.id)) {
      // already placed — show its actual label
      [["animal", animalSvgQ, false], ["plant", plantSvgQ, true]].forEach(([which, svg, isPlant]) => {
        if (o.where === "plant-only" && !isPlant) return;
        const pos = isPlant ? (o.plant || o.animal) : o.animal;
        if (!pos) return;
        const txt = document.createElementNS("http://www.w3.org/2000/svg","g");
        txt.innerHTML = `<rect x="${pos.x-46}" y="${pos.y-50}" width="92" height="20" rx="4" fill="#2A8F44" stroke="#1F5A26" stroke-width="1.5"/><text x="${pos.x}" y="${pos.y-36}" text-anchor="middle" fill="white" font-weight="800" font-size="10">${o.label}</text><line x1="${pos.x}" y1="${pos.y-30}" x2="${pos.x}" y2="${pos.y-10}" stroke="#1F5A26" stroke-width="1.5" stroke-dasharray="2 2"/>`;
        svg.appendChild(txt);
      });
      return;
    }
    // unplaced — show ? pin
    [["animal", animalSvgQ, false], ["plant", plantSvgQ, true]].forEach(([which, svg, isPlant]) => {
      if (o.where === "plant-only" && !isPlant) return;
      const pos = isPlant ? (o.plant || o.animal) : o.animal;
      if (!pos) return;
      const pin = document.createElementNS("http://www.w3.org/2000/svg","g");
      pin.setAttribute("class", "organelle organelle-pin");
      pin.dataset.id = o.id;
      pin.innerHTML = `
        <circle cx="${pos.x}" cy="${pos.y-36}" r="11"/>
        <text x="${pos.x}" y="${pos.y-36}">?</text>
        <line x1="${pos.x}" y1="${pos.y-26}" x2="${pos.x}" y2="${pos.y-10}" stroke="#5E3B85" stroke-width="1.5" stroke-dasharray="2 2"/>
      `;
      pin.addEventListener("click", () => handleLabelTap(o, pin));
      svg.appendChild(pin);
    });
  });
}

function drawLabelBank() {
  labelBank.innerHTML = "";
  const shuffled = [...ORGANELLES].sort(() => Math.random() - 0.5);
  shuffled.forEach(o => {
    const t = document.createElement("button");
    t.type = "button"; t.className = "label-tile";
    if (!unplaced.has(o.id)) t.classList.add("done");
    t.dataset.id = o.id;
    t.textContent = o.label;
    t.addEventListener("click", () => {
      if (!unplaced.has(o.id)) return;
      document.querySelectorAll(".label-tile.selected").forEach(x => x.classList.remove("selected"));
      if (selLabel === o.id) { selLabel = null; labelFb.textContent = "Cleared."; labelFb.className = "bio-feedback"; return; }
      selLabel = o.id;
      t.classList.add("selected");
      labelFb.innerHTML = `<strong>${o.label}</strong> selected — now tap the matching pin in either cell.`;
      labelFb.className = "bio-feedback";
    });
    labelBank.appendChild(t);
  });
}

function handleLabelTap(o, pin) {
  if (!selLabel) {
    labelFb.innerHTML = "Pick a label tile first.";
    labelFb.className = "bio-feedback bad";
    return;
  }
  placed++;
  placedN.textContent = placed;
  if (selLabel === o.id) {
    right++; correctN.textContent = right;
    unplaced.delete(o.id);
    labelFb.innerHTML = `<strong>Correct.</strong> ${o.title}.`;
    labelFb.className = "bio-feedback ok";
    ding();
  } else {
    wrong++; wrongN.textContent = wrong;
    const wanted = ORGANELLES.find(x => x.id === selLabel);
    labelFb.innerHTML = `<strong>Not quite.</strong> That one is the ${o.label}. <strong>${wanted.label}</strong> is somewhere else.`;
    labelFb.className = "bio-feedback bad";
    buzz();
  }
  selLabel = null;
  drawLabelStage(); drawLabelBank();
  if (unplaced.size === 0) {
    setTimeout(() => {
      labelResult.hidden = false;
      let t, m;
      if (wrong === 0) { t = "Perfect — labelled every organelle first try."; m = `${right} / ${ORGANELLES.length} correct.`; fanfare(); }
      else if (right >= 5) { t = "Strong attempt."; m = `${right} of ${ORGANELLES.length} correct with ${wrong} misplacements.`; fanfare(); }
      else { t = "Worth another go."; m = `${right} of ${ORGANELLES.length}. Explore mode is a good revision check.`; }
      document.getElementById("resultTitle").textContent = t;
      document.getElementById("resultMsg").textContent = m;
    }, 350);
  }
}

document.getElementById("labelReset").addEventListener("click", resetLabel);
document.getElementById("labelAgain").addEventListener("click", resetLabel);

// ---- Specialised cells ----
const SPEC = [
  {
    id: "rbc",
    name: "Red blood cell",
    svg: `<svg viewBox="0 0 100 80"><ellipse cx="50" cy="40" rx="34" ry="24" fill="#E26A6A" stroke="#812F2F" stroke-width="2"/><ellipse cx="50" cy="40" rx="14" ry="10" fill="#FFF1D6"/></svg>`,
    desc: "Has no nucleus (more room for haemoglobin) and a biconcave shape — adapted to carry oxygen around the body.",
  },
  {
    id: "nerve",
    name: "Nerve cell",
    svg: `<svg viewBox="0 0 100 80"><line x1="6" y1="40" x2="94" y2="40" stroke="#5E3B85" stroke-width="3"/><circle cx="22" cy="40" r="10" fill="#A18BC7" stroke="#5E3B85" stroke-width="2"/><path d="M16 32 L8 24 M16 48 L8 56 M22 30 L18 22 M28 32 L34 24" stroke="#5E3B85" stroke-width="2" fill="none"/></svg>`,
    desc: "Long and thin, sometimes a metre or more, to carry electrical signals quickly between brain and body.",
  },
  {
    id: "muscle",
    name: "Muscle cell",
    svg: `<svg viewBox="0 0 100 80"><rect x="10" y="30" width="80" height="20" rx="6" fill="#C76838" stroke="#7C3A1F" stroke-width="2"/><line x1="20" y1="30" x2="20" y2="50" stroke="#7C3A1F" stroke-width="1.5"/><line x1="35" y1="30" x2="35" y2="50" stroke="#7C3A1F" stroke-width="1.5"/><line x1="50" y1="30" x2="50" y2="50" stroke="#7C3A1F" stroke-width="1.5"/><line x1="65" y1="30" x2="65" y2="50" stroke="#7C3A1F" stroke-width="1.5"/><line x1="80" y1="30" x2="80" y2="50" stroke="#7C3A1F" stroke-width="1.5"/></svg>`,
    desc: "Long and packed with many mitochondria to release the energy needed to contract and move body parts.",
  },
  {
    id: "root",
    name: "Root hair cell",
    svg: `<svg viewBox="0 0 100 80"><rect x="20" y="20" width="50" height="40" rx="4" fill="#9CC79C" stroke="#2E6633" stroke-width="2"/><path d="M70 30 L94 24 L70 36 Z" fill="#9CC79C" stroke="#2E6633" stroke-width="2"/><path d="M70 50 L96 56 L70 56 Z" fill="#9CC79C" stroke="#2E6633" stroke-width="2"/><circle cx="40" cy="40" r="8" fill="#5E3B85"/></svg>`,
    desc: "A plant cell with a long hair-like extension giving a huge surface area — perfect for absorbing water and minerals from soil.",
  },
];

const specCellsEl = document.getElementById("specCells");
const specBankEl = document.getElementById("specBank");
const specFb = document.getElementById("specFb");
const specMatched = document.getElementById("specMatched");
const specResult = document.getElementById("specResult");
const specResultMsg = document.getElementById("specResultMsg");

let specPaired = new Set();
let selDesc = null;

function resetSpec() {
  specPaired = new Set();
  selDesc = null;
  specMatched.textContent = "0";
  specResult.hidden = true;
  specFb.innerHTML = "Each card describes a cell adaptation. Tap a description, then tap the right cell.";
  specFb.className = "bio-feedback";
  // cells
  specCellsEl.innerHTML = "";
  SPEC.forEach(s => {
    const div = document.createElement("div");
    div.className = "spec-cell";
    div.dataset.id = s.id;
    div.innerHTML = `${s.svg}<h4>${s.name}</h4>`;
    div.addEventListener("click", () => placeSpec(s, div));
    specCellsEl.appendChild(div);
  });
  // bank (shuffled descs)
  const shuffled = [...SPEC].sort(() => Math.random() - 0.5);
  specBankEl.innerHTML = "";
  shuffled.forEach(s => {
    const t = document.createElement("button");
    t.type = "button";
    t.className = "spec-tile";
    t.dataset.id = s.id;
    t.textContent = s.desc;
    t.addEventListener("click", () => {
      if (specPaired.has(s.id)) return;
      document.querySelectorAll(".spec-tile.selected").forEach(x => x.classList.remove("selected"));
      if (selDesc === s.id) { selDesc = null; specFb.textContent = "Cleared."; return; }
      selDesc = s.id;
      t.classList.add("selected");
      specFb.innerHTML = `Selected — now tap the cell this description belongs to.`;
    });
    specBankEl.appendChild(t);
  });
}

function placeSpec(s, cellDiv) {
  if (!selDesc) {
    specFb.innerHTML = "Pick a description first.";
    specFb.className = "bio-feedback bad";
    return;
  }
  const sel = SPEC.find(x => x.id === selDesc);
  if (selDesc === s.id) {
    specPaired.add(s.id);
    specMatched.textContent = specPaired.size;
    cellDiv.classList.add("done");
    cellDiv.innerHTML += `<div class="placed-desc">${s.desc}</div>`;
    document.querySelector(`.spec-tile[data-id="${s.id}"]`).classList.add("placed");
    document.querySelectorAll(".spec-tile.selected").forEach(x => x.classList.remove("selected"));
    selDesc = null;
    specFb.innerHTML = `<strong>Correct.</strong> ${s.name}.`;
    specFb.className = "bio-feedback ok";
    ding();
    if (specPaired.size === SPEC.length) {
      specResult.hidden = false;
      specResultMsg.textContent = "Every specialisation matched to the right cell.";
      fanfare();
    }
  } else {
    specFb.innerHTML = `<strong>Not quite.</strong> That description belongs to <em>${sel.name}</em>, not <em>${s.name}</em>.`;
    specFb.className = "bio-feedback bad";
    buzz();
  }
}

document.getElementById("specReset").addEventListener("click", resetSpec);
document.getElementById("specAgain").addEventListener("click", resetSpec);
