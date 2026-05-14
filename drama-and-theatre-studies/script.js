// Drama — Stage Lighting Designer
// Three draggable lamp fixtures throw coloured beams onto a silhouette actor.
// Mood challenges judge the colour palette and intensity of the design.

const GELS = [
  { id: "warm",   name: "Warm amber",  hex: "#F2A340" },
  { id: "blush",  name: "Blush",       hex: "#E96D9D" },
  { id: "red",    name: "Blood red",   hex: "#C3242C" },
  { id: "cool",   name: "Cold steel",  hex: "#6FA8E0" },
  { id: "deep",   name: "Deep blue",   hex: "#22408E" },
  { id: "purple", name: "Royal purple",hex: "#7B3FBE" },
  { id: "green",  name: "Forest green",hex: "#3B8E54" },
  { id: "white",  name: "Open white",  hex: "#F7F1DC" },
];
function gelById(id) { return GELS.find(g => g.id === id); }

// 3 lamps initial state (positions in SVG coords)
const LAMPS = [
  { id: "A", name: "Lamp A — Stage right", x: 240, y: 60,  gel: "warm",  intensity: 0.7 },
  { id: "B", name: "Lamp B — Centre top",  x: 500, y: 40,  gel: "white", intensity: 0.85 },
  { id: "C", name: "Lamp C — Stage left",  x: 760, y: 60,  gel: "deep",  intensity: 0.6 },
];

const stageSvg   = document.getElementById("stageSvg");
const lampList   = document.getElementById("lampList");
const briefTitle = document.getElementById("briefTitle");
const briefBody  = document.getElementById("briefBody");
const stageFeedback = document.getElementById("stageFeedback");
const stageResult   = document.getElementById("stageResult");
const cIdx       = document.getElementById("cIdx");
const cTotal     = document.getElementById("cTotal");
const cScore     = document.getElementById("cScore");
const btnChallenge = document.getElementById("btnChallenge");
const btnFree      = document.getElementById("btnFree");
const btnNext      = document.getElementById("btnNextChallenge");
const btnFinishCh  = document.getElementById("btnFinishChallenges");

// ----- helpers -----
function gelHex(id) { return gelById(id).hex; }
function isWarm(id) { return ["warm","blush","red"].includes(id); }
function isCool(id) { return ["cool","deep","purple"].includes(id); }
function meanIntensity() { return LAMPS.reduce((s,l)=>s+l.intensity,0) / LAMPS.length; }
function gels() { return LAMPS.map(l => l.gel); }

function audCtxTone(freq, ms, type="sine", gain=0.05) {
  try {
    window._ac = window._ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = window._ac.createOscillator(); const g = window._ac.createGain();
    o.type=type; o.frequency.value=freq; g.gain.value=gain;
    o.connect(g); g.connect(window._ac.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, window._ac.currentTime + ms/1000);
    o.stop(window._ac.currentTime + ms/1000 + 0.02);
  } catch {}
}
function clickSound() { audCtxTone(560, 50, "triangle", 0.04); }
function ding()       { audCtxTone(720, 80, "triangle", 0.05); setTimeout(()=>audCtxTone(1080,100,"triangle",0.05),70); }
function buzz()       { audCtxTone(180, 200, "sawtooth", 0.05); }
function fanfare()    { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>audCtxTone(f,200,"triangle",0.05),i*110)); }

// ----- Stage drawing -----
function drawStage() {
  // anchor positions: top wall = light bar @ y=30
  const w = 1000, h = 540;
  const floorY = 380;
  // Backdrop / curtains / floor
  let svg = `
    <defs>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1c1416"/>
        <stop offset="1" stop-color="#3A0F1A"/>
      </linearGradient>
      <linearGradient id="curtain" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3E0E1A"/>
        <stop offset="1" stop-color="#1F0710"/>
      </linearGradient>
      ${LAMPS.map(l => `
        <radialGradient id="beam-${l.id}" cx="50%" cy="0%" r="100%" fx="50%" fy="0%">
          <stop offset="0%"  stop-color="${gelHex(l.gel)}" stop-opacity="${0.85 * l.intensity}"/>
          <stop offset="35%" stop-color="${gelHex(l.gel)}" stop-opacity="${0.4 * l.intensity}"/>
          <stop offset="100%" stop-color="${gelHex(l.gel)}" stop-opacity="0"/>
        </radialGradient>
      `).join("")}
      <radialGradient id="pool" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="white" stop-opacity="0.5"/>
        <stop offset="1" stop-color="white" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- back of stage -->
    <rect x="0" y="0" width="${w}" height="${h}" fill="#000"/>
    <!-- lighting bar at top -->
    <line x1="40" y1="30" x2="${w-40}" y2="30" stroke="#444" stroke-width="3"/>
    <rect x="30" y="20" width="20" height="20" fill="#555"/>
    <rect x="${w-50}" y="20" width="20" height="20" fill="#555"/>
    <!-- curtains side -->
    <path d="M0,0 L0,${h} Q40,${h/2} 0,0 Z" fill="url(#curtain)"/>
    <path d="M${w},0 L${w},${h} Q${w-40},${h/2} ${w},0 Z" fill="url(#curtain)"/>
    <g fill="#1F0710" opacity="0.7">
      <path d="M0,0 L20,0 Q24,${h/2} 20,${h} L0,${h} Z"/>
      <path d="M${w-20},0 L${w},0 L${w},${h} L${w-20},${h} Q${w-24},${h/2} ${w-20},0 Z"/>
    </g>
    <!-- stage floor -->
    <polygon points="0,${floorY} ${w},${floorY} ${w},${h} 0,${h}" fill="url(#floor)"/>
    <line x1="0" y1="${floorY}" x2="${w}" y2="${floorY}" stroke="#5a2A2F" stroke-width="2"/>
  `;

  // beams (one per lamp)
  LAMPS.forEach(l => {
    const targetY = floorY + 20;
    const targetX = l.x; // beam falls straight down for simplicity
    // beam polygon: narrow at lamp head, wide at floor
    const half = 70;
    svg += `<polygon points="${l.x-6},${l.y+8} ${l.x+6},${l.y+8} ${targetX+half},${targetY} ${targetX-half},${targetY}" fill="url(#beam-${l.id})"/>`;
    // pool on floor
    svg += `<ellipse cx="${targetX}" cy="${targetY}" rx="${half*1.05}" ry="${half*0.32}" fill="${gelHex(l.gel)}" opacity="${0.32 * l.intensity}"/>`;
    svg += `<ellipse cx="${targetX}" cy="${targetY}" rx="${half*0.7}" ry="${half*0.18}" fill="${gelHex(l.gel)}" opacity="${0.55 * l.intensity}"/>`;
  });

  // Silhouette actor centre stage
  const cx = 500, cy = 360;
  svg += `
    <g opacity="0.96">
      <ellipse cx="${cx}" cy="${cy-90}" rx="22" ry="26" fill="#0A0A0F"/>
      <path d="M ${cx-44} ${cy-50} Q ${cx} ${cy-90} ${cx+44} ${cy-50} L ${cx+30} ${cy+30} L ${cx-30} ${cy+30} Z" fill="#0A0A0F"/>
      <line x1="${cx-26}" y1="${cy+30}" x2="${cx-18}" y2="${cy+90}" stroke="#0A0A0F" stroke-width="20" stroke-linecap="round"/>
      <line x1="${cx+26}" y1="${cy+30}" x2="${cx+18}" y2="${cy+90}" stroke="#0A0A0F" stroke-width="20" stroke-linecap="round"/>
      <line x1="${cx-44}" y1="${cy-40}" x2="${cx-72}" y2="${cy+10}" stroke="#0A0A0F" stroke-width="14" stroke-linecap="round"/>
      <line x1="${cx+44}" y1="${cy-40}" x2="${cx+72}" y2="${cy+10}" stroke="#0A0A0F" stroke-width="14" stroke-linecap="round"/>
    </g>
    <!-- light bouncing back on silhouette: thin highlight -->
    <path d="M ${cx-44} ${cy-50} Q ${cx-32} ${cy-72} ${cx-20} ${cy-78}" stroke="${gelHex(LAMPS[0].gel)}" stroke-opacity="${0.6 * LAMPS[0].intensity}" stroke-width="3" fill="none"/>
    <path d="M ${cx+44} ${cy-50} Q ${cx+32} ${cy-72} ${cx+20} ${cy-78}" stroke="${gelHex(LAMPS[2].gel)}" stroke-opacity="${0.6 * LAMPS[2].intensity}" stroke-width="3" fill="none"/>
  `;

  // lamps last (so they sit on top)
  LAMPS.forEach(l => {
    svg += `
      <g class="lamp-head" data-id="${l.id}" transform="translate(${l.x},${l.y})">
        <rect x="-22" y="-10" width="44" height="14" fill="#222" stroke="#555" stroke-width="1.5" rx="3"/>
        <line x1="0" y1="-18" x2="0" y2="-30" stroke="#555" stroke-width="2"/>
        <circle class="fixture" cx="0" cy="4" r="9" fill="${gelHex(l.gel)}" stroke="#fff" stroke-width="2"/>
        <text x="0" y="-18" text-anchor="middle" font-size="12" fill="#fff" font-weight="800" font-family="Georgia, serif">${l.id}</text>
      </g>
    `;
  });

  stageSvg.innerHTML = svg;
  bindDrag();
}

// ----- Drag handling -----
// We listen on the stage SVG itself so listeners survive the redraw that
// happens on every pointermove. The dragged lamp is tracked by id.
let _dragLampId = null;
let _dragOffset = { x: 0, y: 0 };
let _dragInited = false;

function svgPoint(e) {
  const pt = stageSvg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  return pt.matrixTransform(stageSvg.getScreenCTM().inverse());
}

function initDragOnce() {
  if (_dragInited) return;
  _dragInited = true;
  // pointerdown: only when on a lamp head
  stageSvg.addEventListener("pointerdown", e => {
    const head = e.target.closest(".lamp-head");
    if (!head) return;
    e.preventDefault();
    _dragLampId = head.dataset.id;
    const lamp = LAMPS.find(l => l.id === _dragLampId);
    const p = svgPoint(e);
    _dragOffset.x = p.x - lamp.x;
    _dragOffset.y = p.y - lamp.y;
    stageSvg.setPointerCapture(e.pointerId);
    stageSvg.classList.add("dragging");
  });
  stageSvg.addEventListener("pointermove", e => {
    if (!_dragLampId) return;
    const lamp = LAMPS.find(l => l.id === _dragLampId);
    if (!lamp) return;
    const p = svgPoint(e);
    lamp.x = Math.max(60, Math.min(940, p.x - _dragOffset.x));
    lamp.y = Math.max(30, Math.min(140, p.y - _dragOffset.y));
    drawStage();
  });
  const stop = e => {
    if (!_dragLampId) return;
    _dragLampId = null;
    stageSvg.classList.remove("dragging");
    try { stageSvg.releasePointerCapture(e.pointerId); } catch {}
  };
  stageSvg.addEventListener("pointerup", stop);
  stageSvg.addEventListener("pointercancel", stop);
  stageSvg.addEventListener("pointerleave", stop);
}

// kept for compatibility — no-op since drag is wired on the SVG itself
function bindDrag() { initDragOnce(); }

// ----- Lamp panel -----
function drawPanel() {
  lampList.innerHTML = "";
  LAMPS.forEach(l => {
    const row = document.createElement("div");
    row.className = "lamp-row";
    row.innerHTML = `
      <div class="lamp-row-head">
        <span class="lamp-pin" style="background:${gelHex(l.gel)}"></span>
        <span class="lamp-name">${l.name}</span>
        <span class="lamp-pos">x:${Math.round(l.x)}</span>
      </div>
      <div class="gel-row">
        ${GELS.map(g => `<button class="gel-swatch ${g.id===l.gel?"active":""}" data-lamp="${l.id}" data-gel="${g.id}" style="background:${g.hex}" title="${g.name}" type="button"></button>`).join("")}
      </div>
      <label class="lamp-intensity">
        Intensity
        <input type="range" min="0" max="1" step="0.05" value="${l.intensity}" data-lamp="${l.id}">
        <span class="val">${Math.round(l.intensity*100)}%</span>
      </label>
    `;
    lampList.appendChild(row);
  });
  lampList.querySelectorAll(".gel-swatch").forEach(b => {
    b.addEventListener("click", () => {
      const lamp = LAMPS.find(l => l.id === b.dataset.lamp);
      lamp.gel = b.dataset.gel;
      clickSound();
      drawStage(); drawPanel();
    });
  });
  lampList.querySelectorAll("input[type=range]").forEach(r => {
    r.addEventListener("input", () => {
      const lamp = LAMPS.find(l => l.id === r.dataset.lamp);
      lamp.intensity = parseFloat(r.value);
      r.nextElementSibling.textContent = `${Math.round(lamp.intensity*100)}%`;
      drawStage();
    });
  });
}

drawStage();
drawPanel();

// ----- Challenges -----
const MOODS = [
  {
    name: "Romance",
    brief: "Warm, intimate, glowing. The scene is a candlelit moment between two characters.",
    judge: () => {
      const warmCount = gels().filter(isWarm).length;
      const coolCount = gels().filter(isCool).length;
      const meanI = meanIntensity();
      const reasons = [];
      let ok = true;
      if (warmCount < 2) { ok = false; reasons.push("at least two warm gels (amber, blush or red)"); }
      if (coolCount > 0) { ok = false; reasons.push("no cool blues — they kill the warmth"); }
      if (meanI > 0.7 || meanI < 0.3) { ok = false; reasons.push("low-to-medium intensity (40–60 %) — candlelight, not floodlight"); }
      return { ok, reasons };
    }
  },
  {
    name: "Tension",
    brief: "A cold, isolated mood. The protagonist is alone — exposed and uneasy.",
    judge: () => {
      const coolCount = gels().filter(isCool).length;
      const warmCount = gels().filter(isWarm).length;
      const reasons = [];
      let ok = true;
      if (coolCount < 2) { ok = false; reasons.push("at least two cool gels (cold steel, deep blue, purple)"); }
      if (warmCount > 1) { ok = false; reasons.push("warm gels should be minimal — tension is cold"); }
      if (gels().filter(g => g === "white").length > 1) { ok = false; reasons.push("open white washes out the chill — use blues"); }
      return { ok, reasons };
    }
  },
  {
    name: "Tragedy",
    brief: "Stark and severe. A character receives devastating news. Single colour family, low intensity.",
    judge: () => {
      const reds = gels().filter(g => ["red","deep","purple"].includes(g)).length;
      const meanI = meanIntensity();
      const reasons = [];
      let ok = true;
      if (reds < 2) { ok = false; reasons.push("at least two gels in red/deep/purple"); }
      if (meanI > 0.55) { ok = false; reasons.push("intensity should be low (under ~55 %) — the moment is heavy, not bright"); }
      return { ok, reasons };
    }
  },
  {
    name: "Joy",
    brief: "Bright, open, celebratory. A wedding or curtain call. Lights at full.",
    judge: () => {
      const meanI = meanIntensity();
      const warm = gels().filter(g => ["warm","white","blush"].includes(g)).length;
      const reasons = [];
      let ok = true;
      if (meanI < 0.75) { ok = false; reasons.push("crank intensity up — 75 %+ for full brightness"); }
      if (warm < 2) { ok = false; reasons.push("at least two warm or open-white gels"); }
      return { ok, reasons };
    }
  },
  {
    name: "Mystery",
    brief: "Unsettled and shadowy. A figure approaches from the dark. Use shadow — keep most lamps low.",
    judge: () => {
      const meanI = meanIntensity();
      const purples = gels().filter(g => ["purple","deep","green"].includes(g)).length;
      const reasons = [];
      let ok = true;
      if (meanI > 0.5) { ok = false; reasons.push("most lamps should be dim — mystery lives in shadow"); }
      if (purples < 2) { ok = false; reasons.push("at least two of purple, deep blue or forest green"); }
      return { ok, reasons };
    }
  },
];

let inChallenge = false;
let chIdx = 0;
let chScore = 0;
let activeMood = null;

function openChallenge() {
  inChallenge = true;
  chIdx = 0; chScore = 0;
  cTotal.textContent = MOODS.length;
  cScore.textContent = "0";
  btnChallenge.hidden = true;
  btnFree.hidden = false;
  stageResult.hidden = true;
  setChallenge();
}

function setChallenge() {
  if (chIdx >= MOODS.length) {
    // finished all
    stageResult.hidden = false;
    document.getElementById("resultTitle").textContent = `Designer's reel: ${chScore} / ${MOODS.length}`;
    let msg = "";
    if (chScore === MOODS.length) { msg = "Pitch-perfect across every mood. Inspector-worthy."; fanfare(); }
    else if (chScore >= 3) { msg = "Strong reel — refine the misses and run it again."; fanfare(); }
    else { msg = "Pop back to free explore, play with the gels, then try again."; }
    document.getElementById("resultMsg").textContent = msg;
    btnNext.hidden = chScore === MOODS.length;
    return;
  }
  activeMood = MOODS[chIdx];
  cIdx.textContent = chIdx + 1;
  briefTitle.textContent = `Mood ${chIdx + 1}: ${activeMood.name}`;
  briefBody.textContent = activeMood.brief;
  stageFeedback.innerHTML = `<div class="fb-card"><strong>Design the look</strong> using the lamp panel on the right, then press <strong>Submit design</strong>.</div>`;
  stageResult.hidden = true;
  // add a Submit button only during challenge
  let submit = document.getElementById("btnSubmit");
  if (!submit) {
    submit = document.createElement("button");
    submit.id = "btnSubmit";
    submit.className = "stage-go";
    submit.textContent = "Submit design";
    submit.style.marginLeft = "0.5rem";
    document.querySelector(".stage-bar").appendChild(submit);
    submit.addEventListener("click", submitChallenge);
  }
  submit.hidden = false;
}

function submitChallenge() {
  if (!inChallenge) return;
  const { ok, reasons } = activeMood.judge();
  if (ok) {
    chScore++;
    cScore.textContent = chScore;
    stageFeedback.innerHTML = `<div class="fb-card ok"><strong>Convincing ${activeMood.name.toLowerCase()}.</strong> The colour palette and intensity match the brief. Press <em>Next mood</em>.</div>`;
    ding();
  } else {
    stageFeedback.innerHTML = `<div class="fb-card bad"><strong>Almost.</strong> To nail "${activeMood.name}" you need: ${reasons.join("; ")}. Tweak the lamps and submit again.</div>`;
    buzz();
    return;
  }
  // move to next mood
  setTimeout(() => {
    chIdx++;
    setChallenge();
  }, 1300);
}

btnChallenge.addEventListener("click", openChallenge);
btnFree.addEventListener("click", () => {
  inChallenge = false;
  btnChallenge.hidden = false;
  btnFree.hidden = true;
  briefTitle.textContent = "Free explore — design any look you want";
  briefBody.textContent = "Each lamp can be repositioned by dragging it. Choose a gel colour and an intensity for each. When you're ready, take a challenge — five mood briefs to recreate.";
  stageFeedback.innerHTML = "";
  stageResult.hidden = true;
  const submit = document.getElementById("btnSubmit");
  if (submit) submit.hidden = true;
});
btnNext.addEventListener("click", () => {
  stageResult.hidden = true;
  chIdx = 0; chScore = 0;
  cScore.textContent = "0";
  setChallenge();
});
btnFinishCh.addEventListener("click", () => {
  inChallenge = false;
  btnChallenge.hidden = false;
  btnFree.hidden = true;
  stageResult.hidden = true;
  briefTitle.textContent = "Free explore — design any look you want";
  briefBody.textContent = "Each lamp can be repositioned by dragging it. Choose a gel colour and an intensity for each. When you're ready, take a challenge — five mood briefs to recreate.";
  stageFeedback.innerHTML = "";
  const submit = document.getElementById("btnSubmit");
  if (submit) submit.hidden = true;
});
