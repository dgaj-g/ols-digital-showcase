// Home Economics — Food Safety hazard hunter
// Click on hazards in the kitchen scene before the timer runs out.

const HAZARDS = [
  {
    id: "fridgeTemp",
    title: "Fridge too warm",
    detail: "The fridge is at 12°C. Food fridges should be below 5°C — above this, harmful bacteria multiply rapidly.",
  },
  {
    id: "fridgeStack",
    title: "Raw next to cooked in the fridge",
    detail: "Raw chicken is stored next to cooked rice — risk of cross-contamination. Raw meat should be below cooked food, in a sealed container.",
  },
  {
    id: "milkExpired",
    title: "Milk past its use-by date",
    detail: "The carton says 'Use by 04 May' — use-by dates are about safety, not quality. After that date, the product should not be consumed.",
  },
  {
    id: "sameBoard",
    title: "Raw meat on the same board as salad",
    detail: "Raw chicken and lettuce share the cutting board. Use separate boards (often colour-coded) for raw meat and ready-to-eat foods to prevent cross-contamination.",
  },
  {
    id: "crackedEgg",
    title: "Cracked egg",
    detail: "A cracked eggshell lets bacteria like Salmonella in. Discard cracked eggs — never use them.",
  },
  {
    id: "chemicalNearFood",
    title: "Cleaning spray near food prep",
    detail: "Cleaning chemicals belong in a separate cupboard — never on the worktop next to food, where droplets could contaminate.",
  },
  {
    id: "knivesInSink",
    title: "Knives hidden in soapy water",
    detail: "Sharp knives submerged in soapy water are a serious cut hazard for anyone reaching in. Wash and put knives away immediately.",
  },
  {
    id: "binOverflow",
    title: "Bin overflowing",
    detail: "An overflowing bin attracts pests and spreads bacteria. Empty bins regularly and keep the lid closed.",
  },
  {
    id: "wetFloor",
    title: "Spill on the floor",
    detail: "An unmarked wet floor is a slip hazard. Clean up spills immediately and use a warning sign if the floor is being mopped.",
  },
  {
    id: "hair",
    title: "Hair not tied back",
    detail: "Loose hair can fall into food and is a hygiene risk. Tie hair back and ideally wear a hat or hairnet.",
  },
  {
    id: "leftOut",
    title: "Cooked food left out at room temperature",
    detail: "Cooked rice left out for more than two hours is a serious risk for Bacillus cereus, which causes food poisoning. Cool quickly and refrigerate.",
  },
];

const TOTAL = HAZARDS.length;
const TIME_LIMIT = 75; // seconds

const svg = document.getElementById("kitchenSvg");
const markers = document.getElementById("hitMarkers");
const checklist = document.getElementById("checklist");
const foundEl = document.getElementById("foundCount");
const totalEl = document.getElementById("totalCount");
const missEl  = document.getElementById("missCount");
const timeEl  = document.getElementById("timeLeft");
const feedback = document.getElementById("hecFeedback");
const btnStart = document.getElementById("btnStart");
const btnReset = document.getElementById("btnReset");
const btnAgain = document.getElementById("btnPlayAgain");
const result = document.getElementById("hecResult");
const resultMsg = document.getElementById("hecResultMsg");
const resultTitle = document.getElementById("hecResultTitle");

let active = false;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let found = new Set();
let misses = 0;

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
function ding()    { tone(720, 80, "triangle", 0.05); setTimeout(()=>tone(1080,100,"triangle",0.05), 70); }
function buzz()    { tone(180, 220, "sawtooth", 0.05); }
function fanfare() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05), i*110)); }

totalEl.textContent = TOTAL;

function renderChecklist() {
  checklist.innerHTML = "";
  HAZARDS.forEach(h => {
    const li = document.createElement("li");
    li.className = "check-item" + (found.has(h.id) ? " done" : "");
    li.innerHTML = `<span class="box"></span><span>${found.has(h.id) ? h.title : "—"}</span>`;
    checklist.appendChild(li);
  });
}

function start() {
  active = true;
  timeLeft = TIME_LIMIT;
  found = new Set();
  misses = 0;
  foundEl.textContent = "0";
  missEl.textContent = "0";
  timeEl.textContent = `${TIME_LIMIT} s`;
  feedback.innerHTML = "Hunt for hazards. Tap on anything in the scene that looks unsafe.";
  feedback.className = "hec-feedback";
  result.hidden = true;
  btnStart.hidden = true;
  document.querySelectorAll(".hz").forEach(g => g.classList.remove("found"));
  markers.innerHTML = "";
  renderChecklist();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = `${timeLeft} s`;
    if (timeLeft <= 0) end();
  }, 1000);
}

function end() {
  active = false;
  clearInterval(timerInterval);
  btnStart.hidden = false;
  btnStart.textContent = "Start again";
  result.hidden = false;

  let title, msg;
  if (found.size === TOTAL && misses <= 1) {
    title = "Perfect.";
    msg = `You found every hazard — ${TOTAL} / ${TOTAL} — with only ${misses} miss${misses === 1 ? "" : "es"}. Kitchen inspector material.`;
    fanfare();
  } else if (found.size === TOTAL) {
    title = "All hazards found.";
    msg = `${TOTAL} / ${TOTAL} — but with ${misses} miss${misses === 1 ? "" : "es"}. Tighten up the guesses next time.`;
    fanfare();
  } else if (found.size >= TOTAL - 2) {
    title = "So close.";
    msg = `You found ${found.size} of ${TOTAL}. Have another go — the checklist shows what you got.`;
  } else if (found.size >= 5) {
    title = "Good progress.";
    msg = `You spotted ${found.size} of ${TOTAL} hazards. Play again to push past 8.`;
  } else {
    title = "Round over.";
    msg = `You spotted ${found.size} of ${TOTAL} hazards. Plenty of risks still in the kitchen — try again.`;
  }
  resultTitle.textContent = title;
  resultMsg.textContent = msg;
}

document.querySelectorAll(".hz").forEach(g => {
  g.addEventListener("click", () => {
    if (!active) {
      feedback.innerHTML = "Press <strong>Start</strong> first.";
      return;
    }
    const id = g.dataset.hz;
    if (found.has(id)) return;
    found.add(id);
    g.classList.add("found");
    const h = HAZARDS.find(x => x.id === id);
    feedback.innerHTML = `<strong>${h.title}.</strong> ${h.detail}`;
    feedback.className = "hec-feedback ok";
    foundEl.textContent = found.size;
    ding();
    addMarker(g, "good");
    renderChecklist();
    if (found.size === TOTAL) end();
  });
});

// click on empty area = miss
svg.addEventListener("click", e => {
  if (!active) return;
  if (e.target.closest(".hz")) return;
  misses++;
  missEl.textContent = misses;
  buzz();
  feedback.innerHTML = `Nothing wrong there. Look more carefully.`;
  feedback.className = "hec-feedback bad";
});

function addMarker(g, type) {
  // get bbox in SVG coords for the hazard group
  const bbox = g.getBBox();
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  const r = Math.max(bbox.width, bbox.height) / 2 + 6;
  const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  ring.setAttribute("cx", cx);
  ring.setAttribute("cy", cy);
  ring.setAttribute("r", r);
  ring.setAttribute("class", "hit-ring" + (type === "miss" ? " miss" : ""));
  markers.appendChild(ring);
}

btnStart.addEventListener("click", start);
btnAgain.addEventListener("click", start);
btnReset.addEventListener("click", () => {
  clearInterval(timerInterval);
  active = false;
  btnStart.hidden = false;
  btnStart.textContent = "Start the timer";
  timeLeft = TIME_LIMIT;
  timeEl.textContent = `${TIME_LIMIT} s`;
  found = new Set();
  misses = 0;
  foundEl.textContent = "0";
  missEl.textContent = "0";
  feedback.innerHTML = "Click <strong>Start</strong> to begin the timer.";
  feedback.className = "hec-feedback";
  document.querySelectorAll(".hz").forEach(g => g.classList.remove("found"));
  markers.innerHTML = "";
  result.hidden = true;
  renderChecklist();
});

renderChecklist();
