// Digital Technology — Representing images in binary
// 8x8 grid, click pixels to flip bits, see binary + decimal per row, file
// size update. Challenge mode: match a target image, scored by pixel matches.

const SIZE = 8;

// Targets — each is a SIZE×SIZE matrix of 0/1
const TARGETS = [
  { name: "Heart",  data: [
    [0,1,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
  ]},
  { name: "Smiley face", data: [
    [0,0,1,1,1,1,0,0],
    [0,1,0,0,0,0,1,0],
    [1,0,1,0,0,1,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1],
    [1,0,0,1,1,0,0,1],
    [0,1,0,0,0,0,1,0],
    [0,0,1,1,1,1,0,0],
  ]},
  { name: "Arrow up", data: [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
  ]},
  { name: "Letter S", data: [
    [0,1,1,1,1,1,1,0],
    [1,1,0,0,0,0,0,0],
    [1,1,0,0,0,0,0,0],
    [0,1,1,1,1,1,0,0],
    [0,0,0,0,0,1,1,0],
    [0,0,0,0,0,0,1,1],
    [0,0,0,0,0,0,1,1],
    [0,1,1,1,1,1,1,0],
  ]},
  { name: "Star",   data: [
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,0,0,1,1,0],
    [1,1,0,0,0,0,1,1],
    [1,0,0,0,0,0,0,1],
  ]},
];

let grid = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
let mode = "draw";

// ---- DOM
const binGrid    = document.getElementById("binGrid");
const binTable   = document.getElementById("binTable");
const onCount    = document.getElementById("onCount");
const onPct      = document.getElementById("onPct");
const totalBits  = document.getElementById("totalBits");
const totalBytes = document.getElementById("totalBytes");
const drawToolbar = document.getElementById("drawToolbar");
const challengeBar = document.getElementById("challengeBar");
const targetRow  = document.getElementById("targetRow");
const binTarget  = document.getElementById("binTarget");
const tIdx       = document.getElementById("tIdx");
const tTotal     = document.getElementById("tTotal");
const matchPct   = document.getElementById("matchPct");
const cScore     = document.getElementById("cScore");
const binFeedback = document.getElementById("binFeedback");
const binResult  = document.getElementById("binResult");
const binResultTitle = document.getElementById("binResultTitle");
const binResultMsg = document.getElementById("binResultMsg");

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
function tick() { tone(900, 25, "square", 0.025); }
function ding() { tone(660, 80, "triangle", 0.06); setTimeout(()=>tone(990, 100, "triangle", 0.06), 70); }
function buzz() { tone(180, 200, "sawtooth", 0.05); }
function fanfare() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05),i*110)); }

// ---- Grid render ----
function renderGrid() {
  binGrid.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "bin-cell" + (grid[r][c] ? " on" : "");
      cell.dataset.r = r; cell.dataset.c = c;
      cell.addEventListener("click", () => {
        grid[r][c] = grid[r][c] ? 0 : 1;
        tick();
        renderGrid();
        renderReadout();
        if (mode === "challenge") updateMatch();
      });
      binGrid.appendChild(cell);
    }
  }
}

function renderReadout() {
  let on = 0;
  binTable.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    const bits = grid[r].join("");
    const dec  = parseInt(bits, 2);
    on += grid[r].reduce((s,x)=>s+x,0);
    const row = document.createElement("tr");
    row.innerHTML = `<td>R${r}</td><td>${bits}</td><td>${dec}</td>`;
    binTable.appendChild(row);
  }
  onCount.textContent = on;
  onPct.textContent = `${Math.round((on / (SIZE*SIZE)) * 100)} %`;
  totalBits.textContent = SIZE * SIZE;
  totalBytes.textContent = (SIZE * SIZE) / 8;
}

renderGrid();
renderReadout();

// ---- Tabs ----
const tabDraw      = document.getElementById("tabDraw");
const tabChallenge = document.getElementById("tabChallenge");
function setMode(m) {
  mode = m;
  tabDraw.classList.toggle("active", m === "draw");
  tabChallenge.classList.toggle("active", m === "challenge");
  drawToolbar.hidden  = m !== "draw";
  challengeBar.hidden = m !== "challenge";
  targetRow.hidden    = m !== "challenge";
  binResult.hidden = true;
  if (m === "challenge") startChallenge();
  else {
    binFeedback.innerHTML = "Tap a cell to flip its bit. Every row's binary appears on the right.";
    binFeedback.className = "bin-feedback";
  }
}
tabDraw.addEventListener("click", () => setMode("draw"));
tabChallenge.addEventListener("click", () => setMode("challenge"));

// ---- Draw toolbar ----
document.getElementById("btnClear").addEventListener("click", () => {
  grid = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  renderGrid(); renderReadout(); tick();
});
document.getElementById("btnInvert").addEventListener("click", () => {
  grid = grid.map(row => row.map(v => v ? 0 : 1));
  renderGrid(); renderReadout(); tick();
});

// ---- Challenge ----
let chIdx = 0;
let chScore = 0;
let currentTarget = null;

function renderTargetPreview(target, into) {
  into.innerHTML = "";
  target.data.flat().forEach(v => {
    const pix = document.createElement("div");
    pix.className = "pix" + (v ? " on" : "");
    into.appendChild(pix);
  });
}

function startChallenge() {
  chIdx = 0; chScore = 0; cScore.textContent = "0";
  tTotal.textContent = TARGETS.length;
  binResult.hidden = true;
  nextTarget();
}

function nextTarget() {
  if (chIdx >= TARGETS.length) { finishChallenge(); return; }
  currentTarget = TARGETS[chIdx];
  tIdx.textContent = chIdx + 1;
  renderTargetPreview(currentTarget, binTarget);
  // reset editor
  grid = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  renderGrid(); renderReadout();
  binFeedback.innerHTML = `Recreate the target: <strong>${currentTarget.name}</strong>. Each cell you flip changes one bit.`;
  binFeedback.className = "bin-feedback";
  updateMatch();
}

function pixelMatchPct() {
  let match = 0, total = SIZE*SIZE;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (grid[r][c] === currentTarget.data[r][c]) match++;
  return (match / total) * 100;
}
function updateMatch() {
  const pct = pixelMatchPct();
  matchPct.textContent = `${Math.round(pct)} %`;
}

document.getElementById("btnSubmit").addEventListener("click", () => {
  const pct = pixelMatchPct();
  if (pct === 100) {
    chScore++;
    cScore.textContent = chScore;
    binFeedback.innerHTML = `<strong>Pixel-perfect.</strong> ${currentTarget.name} matched 64 / 64. Moving on…`;
    binFeedback.className = "bin-feedback ok";
    ding();
    setTimeout(() => { chIdx++; nextTarget(); }, 1000);
  } else if (pct >= 90) {
    chScore++;
    cScore.textContent = chScore;
    binFeedback.innerHTML = `<strong>Close enough — ${Math.round(pct)} %.</strong> Awarded the point. Moving on…`;
    binFeedback.className = "bin-feedback ok";
    ding();
    setTimeout(() => { chIdx++; nextTarget(); }, 1100);
  } else {
    // highlight mismatches
    document.querySelectorAll(".bin-cell").forEach(c => c.classList.remove("match-good","match-bad"));
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] !== currentTarget.data[r][c]) {
          const cell = binGrid.children[r*SIZE + c];
          cell.classList.add("match-bad");
        }
      }
    binFeedback.innerHTML = `<strong>${Math.round(pct)} % match.</strong> The pink-outlined cells don't match the target. Fix them and submit again.`;
    binFeedback.className = "bin-feedback bad";
    buzz();
  }
});
document.getElementById("btnSkip").addEventListener("click", () => {
  binFeedback.innerHTML = `Skipped ${currentTarget.name}. No score for that one.`;
  binFeedback.className = "bin-feedback bad";
  setTimeout(() => { chIdx++; nextTarget(); }, 600);
});
function finishChallenge() {
  binResult.hidden = false;
  let title, msg;
  if (chScore === TARGETS.length) { title = "All five matched."; msg = `${chScore} / ${TARGETS.length}. You've drawn five images one bit at a time.`; fanfare(); }
  else if (chScore >= 3) { title = "Strong run."; msg = `${chScore} / ${TARGETS.length}. Try again for the perfect set.`; fanfare(); }
  else { title = "Run complete."; msg = `${chScore} / ${TARGETS.length}. Free-draw mode is a good place to practise.`; }
  binResultTitle.textContent = title;
  binResultMsg.textContent = msg;
}
document.getElementById("btnAgain").addEventListener("click", startChallenge);
