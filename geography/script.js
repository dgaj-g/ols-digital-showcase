// Geography — Rivers: Source to Mouth
// Hand-drawn SVG cross-section showing the upper, middle and lower course
// landforms. Click landforms in Explore to learn. Drag-style label challenge.

const LANDFORMS = [
  {
    id: "source",  num: 1, x: 90,  y: 90,
    title: "Source",
    course: "Upper course",
    body: "The <strong>source</strong> is where a river begins, often in upland or mountainous areas. It can be a spring, a melting glacier, or a marshy hillside. From here, gravity pulls water downhill, gathering into a small stream."
  },
  {
    id: "vvalley", num: 2, x: 175, y: 195,
    title: "V-shaped valley",
    course: "Upper course",
    body: "In the upper course, the river has lots of energy but little volume. Vertical <strong>erosion</strong> cuts down into the rock, while weathering loosens the valley sides — together they carve a steep, narrow <strong>V-shape</strong> with interlocking spurs."
  },
  {
    id: "waterfall", num: 3, x: 270, y: 210,
    title: "Waterfall",
    course: "Upper course",
    body: "A <strong>waterfall</strong> forms where the river flows over a band of resistant rock (e.g. granite) sitting on top of less resistant rock (e.g. shale). The softer rock is eroded faster, creating an undercut. Eventually the overhang collapses — and the waterfall <em>retreats</em> upstream, leaving a steep-sided <strong>gorge</strong>."
  },
  {
    id: "meander", num: 4, x: 480, y: 235,
    title: "Meander",
    course: "Middle course",
    body: "As the river flows downhill it gains volume and energy. It begins to swing from side to side. On the outside of each bend the water moves fastest — <strong>lateral erosion</strong> cuts a steep <em>river cliff</em>. On the inside, slower water deposits sediment, forming a gentle <em>slip-off slope</em>. These broad bends are <strong>meanders</strong>."
  },
  {
    id: "oxbow",   num: 5, x: 605, y: 260,
    title: "Oxbow lake",
    course: "Middle course",
    body: "Continued erosion on the outside of a meander makes the bend ever more pronounced. The narrow neck of land between two bends gets thinner and thinner, until — usually in a flood — the river cuts straight across. Deposition seals the abandoned bend off as an <strong>oxbow lake</strong>."
  },
  {
    id: "floodplain", num: 6, x: 720, y: 320,
    title: "Floodplain",
    course: "Lower course",
    body: "In the lower course the river is wide, slow and carries a heavy load. When it overtops its banks during floods, the velocity drops sharply and the load is deposited. Year after year, this builds a flat, fertile <strong>floodplain</strong> of alluvium either side of the river."
  },
  {
    id: "levee",   num: 7, x: 800, y: 310,
    title: "Levée",
    course: "Lower course",
    body: "The coarsest sediment is dropped first when the river floods — right at the channel edge. Over many floods these deposits build up into natural raised banks called <strong>levées</strong>, which actually contain the river at higher levels than the surrounding plain."
  },
  {
    id: "delta",   num: 8, x: 930, y: 345,
    title: "Delta",
    course: "Mouth",
    body: "At the <strong>mouth</strong>, where the river meets the sea (or a lake), the current is suddenly checked. The river drops its entire remaining load — silt and clay — building a fan-shaped, low-lying area of new land split by many channels: a <strong>delta</strong>."
  },
];

// ---- River SVG drawing ----
function drawRiver(targetSvg, withNumbers, hotspotHandler, idsToPlace = null) {
  // Background sky → ground gradient
  targetSvg.innerHTML = `
    <defs>
      <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#D6EDFB"/>
        <stop offset="1" stop-color="#FBF5DA"/>
      </linearGradient>
      <linearGradient id="grass" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#9EC580"/>
        <stop offset="1" stop-color="#5E8744"/>
      </linearGradient>
      <linearGradient id="rock" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#A29280"/>
        <stop offset="1" stop-color="#5C4F3F"/>
      </linearGradient>
      <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#7EC2E8"/>
        <stop offset="1" stop-color="#2C6E9A"/>
      </linearGradient>
      <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#6FB3D9"/>
        <stop offset="1" stop-color="#2A5A7E"/>
      </linearGradient>
    </defs>
    <!-- sky -->
    <rect x="0" y="0" width="1000" height="180" fill="url(#sky)"/>
    <!-- distant mountains (back layer) -->
    <path d="M0,160 L60,80 L120,130 L200,60 L280,140 L360,90 L440,150 L520,100 L600,160 L680,130 L760,170 L840,140 L1000,170 L1000,200 L0,200 Z"
          fill="#9AB1A5" opacity="0.55"/>
    <!-- mountain (foreground left) -->
    <path d="M0,200 L70,80 L150,40 L240,140 L320,200 Z" fill="url(#rock)" stroke="#3D3325" stroke-width="2"/>
    <path d="M70,80 L150,40 L130,90 Z" fill="#FFFFFF"/>
    <path d="M150,40 L240,140 L200,100 Z" fill="#FFFFFF" opacity="0.6"/>
    <!-- hills (middle and lower) -->
    <path d="M280,200 L380,150 L480,200 Z" fill="url(#grass)" opacity="0.95"/>
    <path d="M420,210 L520,180 L620,210 Z" fill="url(#grass)" opacity="0.9"/>
    <!-- ground -->
    <path d="M0,200 Q200,210 320,215 Q500,228 700,240 Q900,260 1000,265 L1000,460 L0,460 Z"
          fill="url(#grass)"/>
    <!-- floodplain (lighter band in lower course) -->
    <path d="M600,260 Q780,280 1000,290 L1000,360 Q780,365 600,355 Z"
          fill="#C8D89B" opacity="0.85"/>
    <!-- sea -->
    <path d="M880,340 Q930,360 1000,350 L1000,460 L860,460 Q870,400 880,340 Z"
          fill="url(#sea)"/>
    <!-- river path -->
    <!-- Upper course: from source through V-valley, waterfall, into middle -->
    <path d="
      M90,90
      Q130,140 175,195
      Q220,220 260,205
      L280,220
      Q330,235 370,225
      Q430,215 480,235
      Q520,260 560,255
      Q610,250 640,275
      Q680,300 720,320
      Q780,330 870,345
      L930,345
    " stroke="url(#water)" stroke-width="14" fill="none" stroke-linecap="round"/>
    <!-- waterfall splash zone -->
    <path d="M255,205 L285,235 L265,245 L275,255 Z" fill="#FFF" opacity="0.8"/>
    <circle cx="280" cy="240" r="3" fill="#FFF"/>
    <circle cx="287" cy="248" r="2" fill="#FFF"/>
    <circle cx="270" cy="252" r="2.5" fill="#FFF"/>
    <!-- oxbow lake -->
    <ellipse cx="605" cy="280" rx="34" ry="11" fill="#7EC2E8" stroke="#2C6E9A" stroke-width="2"/>
    <ellipse cx="605" cy="278" rx="32" ry="9" fill="#A5D7EF"/>
    <!-- levée hint -->
    <path d="M770,330 Q800,310 830,332 L830,340 Q800,322 770,338 Z" fill="#C2A776" stroke="#7B6855" stroke-width="1"/>
    <!-- delta fan -->
    <path d="M870,345 L940,335 L970,355 L955,370 L945,385 L920,378 L905,365 Z" fill="#D8B173" stroke="#7B6855" stroke-width="1.5"/>
    <path d="M895,355 Q920,360 945,358 M905,365 Q925,372 950,372 M890,348 Q910,348 935,348" stroke="#2C6E9A" stroke-width="1.5" fill="none"/>
    <!-- some trees -->
    <g opacity="0.85">
      <g transform="translate(420,200)"><polygon points="0,0 -10,18 10,18" fill="#3F6E2E"/><rect x="-2" y="18" width="4" height="6" fill="#5C4F3F"/></g>
      <g transform="translate(540,235)"><polygon points="0,0 -10,18 10,18" fill="#3F6E2E"/><rect x="-2" y="18" width="4" height="6" fill="#5C4F3F"/></g>
      <g transform="translate(680,275)"><polygon points="0,0 -10,18 10,18" fill="#3F6E2E"/><rect x="-2" y="18" width="4" height="6" fill="#5C4F3F"/></g>
      <g transform="translate(380,225)"><polygon points="0,0 -10,18 10,18" fill="#3F6E2E"/><rect x="-2" y="18" width="4" height="6" fill="#5C4F3F"/></g>
    </g>
    <!-- compass / scale chip -->
    <g transform="translate(948,40)">
      <circle cx="0" cy="0" r="20" fill="white" stroke="#595959" stroke-width="1.5"/>
      <polygon points="0,-14 4,0 0,14 -4,0" fill="#2C6E9A"/>
      <text x="0" y="-22" text-anchor="middle" font-size="10" font-weight="700" fill="#2C6E9A">N</text>
    </g>
    <!-- caption strip -->
    <text x="20" y="22" font-family="Georgia, serif" font-size="13" font-weight="700" fill="#2C6E9A">UPLAND · UPPER COURSE</text>
    <text x="380" y="22" font-family="Georgia, serif" font-size="13" font-weight="700" fill="#2C6E9A">MIDDLE COURSE</text>
    <text x="720" y="22" font-family="Georgia, serif" font-size="13" font-weight="700" fill="#2C6E9A">LOWER COURSE · MOUTH</text>
    <line x1="320" y1="36" x2="320" y2="60" stroke="#2C6E9A" stroke-dasharray="3 3"/>
    <line x1="700" y1="36" x2="700" y2="60" stroke="#2C6E9A" stroke-dasharray="3 3"/>
  `;
  // Add hotspot markers
  LANDFORMS.forEach(l => {
    if (idsToPlace && !idsToPlace.has(l.id)) {
      // already placed — skip
      return;
    }
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "hotspot");
    g.dataset.id = l.id;
    g.innerHTML = `
      <circle class="hot-bg" cx="${l.x}" cy="${l.y}" r="15"/>
      ${withNumbers ? `<text class="hot-num" x="${l.x}" y="${l.y}">${l.num}</text>` : `<text class="hot-num" x="${l.x}" y="${l.y}">?</text>`}
    `;
    g.addEventListener("click", () => hotspotHandler(l, g));
    targetSvg.appendChild(g);
  });
}

// ---- Explore mode ----
const explainPanel = document.getElementById("explainPanel");
function explainLandform(l, g) {
  document.querySelectorAll("#riverSvg .hotspot.active").forEach(h => h.classList.remove("active"));
  g.classList.add("active");
  explainPanel.innerHTML = `
    <header class="explain-head">
      <span class="explain-num">${l.num}</span>
      <h2 class="explain-title">${l.title}</h2>
      <span class="explain-course">${l.course}</span>
    </header>
    <p class="explain-body">${l.body}</p>
  `;
  click();
}
drawRiver(document.getElementById("riverSvg"), true, explainLandform);

// ---- Tabs ----
const paneExplore = document.getElementById("paneExplore");
const paneLabel   = document.getElementById("paneLabel");
const tabExplore  = document.getElementById("tabExplore");
const tabLabel    = document.getElementById("tabLabel");

function setTab(t) {
  tabExplore.classList.toggle("active", t === "explore");
  tabLabel.classList.toggle("active",   t === "label");
  paneExplore.hidden = t !== "explore";
  paneLabel.hidden   = t !== "label";
  if (t === "label") resetLabel();
}
tabExplore.addEventListener("click", () => setTab("explore"));
tabLabel.addEventListener("click",   () => setTab("label"));

// ---- Label challenge ----
const labelBank   = document.getElementById("labelBank");
const labelSvg    = document.getElementById("riverSvgLabel");
const labelFb     = document.getElementById("labelFeedback");
const placedN     = document.getElementById("placedN");
const correctN    = document.getElementById("correctN");
const wrongN      = document.getElementById("wrongN");
const totalN      = document.getElementById("totalN");
const labelResult = document.getElementById("labelResult");
const resultTitle = document.getElementById("resultTitle");
const resultMsg   = document.getElementById("resultMsg");

let unplaced = new Set();
let selectedLabel = null;
let placed = 0, right = 0, wrong = 0;

function resetLabel() {
  unplaced = new Set(LANDFORMS.map(l => l.id));
  selectedLabel = null;
  placed = 0; right = 0; wrong = 0;
  placedN.textContent = "0"; correctN.textContent = "0"; wrongN.textContent = "0";
  totalN.textContent = LANDFORMS.length;
  labelResult.hidden = true;
  labelFb.innerHTML = "Pick a label tile below — then tap the matching <strong>?</strong> on the river.";
  labelFb.className = "geo-feedback";
  drawLabelStage();
  drawLabelBank();
}

function drawLabelStage() {
  drawRiver(labelSvg, false, handleHotspotPick, unplaced);
  // also draw placed numbers
  LANDFORMS.forEach(l => {
    if (unplaced.has(l.id)) return;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "hotspot placed");
    g.innerHTML = `<circle class="hot-bg" cx="${l.x}" cy="${l.y}" r="15"/><text class="hot-num" x="${l.x}" y="${l.y}">${l.num}</text>`;
    labelSvg.appendChild(g);
  });
}

function drawLabelBank() {
  labelBank.innerHTML = "";
  // present in shuffled order
  const order = [...LANDFORMS].sort(() => Math.random() - 0.5);
  order.forEach(l => {
    const t = document.createElement("button");
    t.type = "button";
    t.className = "label-tile";
    if (!unplaced.has(l.id)) t.classList.add("done");
    t.dataset.id = l.id;
    t.textContent = l.title;
    t.addEventListener("click", () => selectLabel(l, t));
    labelBank.appendChild(t);
  });
}

function selectLabel(l, t) {
  if (!unplaced.has(l.id)) return;
  document.querySelectorAll(".label-tile.selected").forEach(x => x.classList.remove("selected"));
  if (selectedLabel === l.id) {
    selectedLabel = null;
    labelFb.innerHTML = "Selection cleared. Pick a label.";
    labelFb.className = "geo-feedback";
    return;
  }
  selectedLabel = l.id;
  t.classList.add("selected");
  labelFb.innerHTML = `<strong>${l.title}</strong> selected — now tap the matching point on the river.`;
  labelFb.className = "geo-feedback";
}

function handleHotspotPick(l, g) {
  if (!selectedLabel) {
    labelFb.innerHTML = "Pick a label tile first, then tap a point on the river.";
    labelFb.className = "geo-feedback bad";
    return;
  }
  placed++;
  placedN.textContent = placed;
  if (selectedLabel === l.id) {
    right++; correctN.textContent = right;
    unplaced.delete(l.id);
    labelFb.innerHTML = `<strong>Correct.</strong> ${l.title} — ${l.course.toLowerCase()}.`;
    labelFb.className = "geo-feedback ok";
    ding();
  } else {
    wrong++; wrongN.textContent = wrong;
    const wanted = LANDFORMS.find(x => x.id === selectedLabel);
    labelFb.innerHTML = `<strong>Not quite.</strong> That's the <em>${l.title}</em>. <strong>${wanted.title}</strong> belongs somewhere else — try again.`;
    labelFb.className = "geo-feedback bad";
    buzz();
  }
  selectedLabel = null;
  drawLabelStage();
  drawLabelBank();
  if (unplaced.size === 0) {
    setTimeout(() => {
      labelResult.hidden = false;
      let t, m;
      if (wrong === 0) { t = "Perfect — every landform placed first time."; m = `${right} / ${LANDFORMS.length} correct, no wrong tries.`; fanfare(); }
      else if (right >= 6) { t = "Strong attempt."; m = `${right} of ${LANDFORMS.length} placed correctly on the first try, with ${wrong} misplacements.`; fanfare(); }
      else { t = "Worth another go."; m = `${right} of ${LANDFORMS.length} on the first try. Try Explore mode to revise, then come back.`; }
      resultTitle.textContent = t;
      resultMsg.textContent = m;
    }, 300);
  }
}

document.getElementById("labelReset").addEventListener("click", resetLabel);
document.getElementById("labelAgain").addEventListener("click", resetLabel);

// ---- audio ----
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
function ding()    { tone(660, 90, "triangle", 0.05); setTimeout(()=>tone(990,110,"triangle",0.05), 80); }
function buzz()    { tone(180, 200, "sawtooth", 0.05); }
function fanfare() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05), i*110)); }
