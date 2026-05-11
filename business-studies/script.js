// Business Studies — Public vs Private sector sorter
// Drag cards into Public / Private columns. Also supports tap-to-pick then tap-column.

const ORGS = [
  { id: "nhs",        name: "NHS",                       logo: "N",  sector: "public",  detail: "National Health Service" },
  { id: "bbc",        name: "BBC",                       logo: "B",  sector: "public",  detail: "Funded by the licence fee" },
  { id: "royal-mail", name: "Royal Mail",                logo: "RM", sector: "private", detail: "Privatised in 2013" },
  { id: "tesco",      name: "Tesco",                     logo: "T",  sector: "private", detail: "PLC, FTSE 100" },
  { id: "psni",       name: "PSNI",                      logo: "P",  sector: "public",  detail: "Police Service of NI" },
  { id: "translink",  name: "Translink",                 logo: "TL", sector: "public",  detail: "NI public transport" },
  { id: "ulster-bank",name: "Ulster Bank",               logo: "UB", sector: "private", detail: "Part of NatWest Group" },
  { id: "henderson",  name: "Henderson Group",           logo: "H",  sector: "private", detail: "Spar / Eurospar wholesaler" },
  { id: "queens",     name: "Queen's University Belfast",logo: "Q",  sector: "public",  detail: "Higher education institution" },
  { id: "primark",    name: "Primark",                   logo: "Pk", sector: "private", detail: "Owned by AB Foods" },
  { id: "armagh-cc",  name: "Armagh City Council",       logo: "A",  sector: "public",  detail: "Local government" },
  { id: "moy-park",   name: "Moy Park",                  logo: "MP", sector: "private", detail: "NI poultry company" },
];

const REASONS = {
  public:  "Funded mainly by taxation and run by central or local government to provide services to citizens.",
  private: "Owned by individuals or shareholders, funded by sales or investment, and aims to make profit.",
};

const poolEl     = document.getElementById("poolCards");
const dropPublic = document.querySelector('[data-drop="public"]');
const dropPriv   = document.querySelector('[data-drop="private"]');
const feedback   = document.getElementById("bizFeedback");
const sortedEl   = document.getElementById("sortedCount");
const correctEl  = document.getElementById("correctCount");
const wrongEl    = document.getElementById("wrongCount");
const scoreEl    = document.getElementById("scoreVal");
const resultEl   = document.getElementById("bizResult");
const resultMsg  = document.getElementById("bizResultMsg");
const resultTitle = document.getElementById("bizResultTitle");
const btnReset   = document.getElementById("btnReset");
const btnAgain   = document.getElementById("btnAgain");

let correct = 0;
let wrong = 0;
let sorted = 0;
let selectedId = null;

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

function makeCard(org) {
  const c = document.createElement("div");
  c.className = "biz-card";
  c.draggable = true;
  c.dataset.id = org.id;
  c.innerHTML = `
    <span class="card-logo">${org.logo}</span>
    <div>
      <div class="card-name">${org.name}</div>
      <div class="card-detail">${org.detail}</div>
    </div>
  `;
  c.addEventListener("dragstart", e => {
    c.classList.add("dragging");
    e.dataTransfer.setData("text/plain", org.id);
    e.dataTransfer.effectAllowed = "move";
  });
  c.addEventListener("dragend", () => c.classList.remove("dragging"));
  c.addEventListener("click", () => selectCard(org.id));
  return c;
}

function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function reset() {
  correct = 0; wrong = 0; sorted = 0; selectedId = null;
  sortedEl.textContent = "0";
  correctEl.textContent = "0";
  wrongEl.textContent = "0";
  scoreEl.textContent = "0 %";
  resultEl.hidden = true;
  dropPublic.innerHTML = "";
  dropPriv.innerHTML = "";
  poolEl.innerHTML = "";
  shuffle(ORGS).forEach(o => poolEl.appendChild(makeCard(o)));
  feedback.innerHTML = "Drag a card into the <strong>Public</strong> or <strong>Private</strong> column — or tap it to choose.";
  feedback.className = "biz-feedback";
}

function selectCard(id) {
  const card = document.querySelector(`.biz-card[data-id="${id}"]`);
  if (!card || card.classList.contains("placed-correct") || card.classList.contains("placed-wrong")) return;
  document.querySelectorAll(".biz-card.selected").forEach(c => c.classList.remove("selected"));
  if (selectedId === id) {
    selectedId = null;
    feedback.innerHTML = "Selection cleared. Tap another card or drag one across.";
    feedback.className = "biz-feedback";
    return;
  }
  selectedId = id;
  card.classList.add("selected");
  const org = ORGS.find(o => o.id === id);
  feedback.innerHTML = `<strong>${org.name}</strong> selected. Tap the Public or Private column to place it.`;
  feedback.className = "biz-feedback";
}

function place(orgId, sector) {
  const org = ORGS.find(o => o.id === orgId);
  if (!org) return;
  const card = document.querySelector(`.biz-card[data-id="${orgId}"]`);
  if (!card) return;
  if (card.classList.contains("placed-correct") || card.classList.contains("placed-wrong")) return;
  card.classList.remove("selected");
  selectedId = null;
  sorted++;
  sortedEl.textContent = sorted;

  // remove from pool, append to destination column
  const drop = sector === "public" ? dropPublic : dropPriv;
  drop.appendChild(card);
  card.draggable = false;

  const isCorrect = org.sector === sector;
  if (isCorrect) {
    correct++;
    correctEl.textContent = correct;
    card.classList.add("placed-correct");
    feedback.innerHTML = `<strong>Correct.</strong> ${org.name} is in the ${sector} sector — ${REASONS[sector]}`;
    feedback.className = "biz-feedback ok";
    ding();
  } else {
    wrong++;
    wrongEl.textContent = wrong;
    card.classList.add("placed-wrong");
    feedback.innerHTML = `<strong>Not quite.</strong> ${org.name} belongs in the <em>${org.sector}</em> sector, not <em>${sector}</em>. ${REASONS[org.sector]}`;
    feedback.className = "biz-feedback bad";
    buzz();
  }
  scoreEl.textContent = `${Math.round((correct / sorted) * 100)} %`;

  if (sorted === ORGS.length) {
    setTimeout(() => {
      resultEl.hidden = false;
      let title, msg;
      if (correct === ORGS.length) {
        title = "Perfect.";
        msg = `${correct} / ${ORGS.length} — every organisation in the right sector.`;
        fanfare();
      } else if (correct >= 10) {
        title = "Strong.";
        msg = `${correct} / ${ORGS.length}. Review the ${wrong} you got wrong, then have another go.`;
        fanfare();
      } else if (correct >= 7) {
        title = "Decent attempt.";
        msg = `${correct} / ${ORGS.length}. Have a second go and aim for 10+.`;
      } else {
        title = "Worth a re-try.";
        msg = `${correct} / ${ORGS.length}. Look at the column descriptions and try again.`;
      }
      resultTitle.textContent = title;
      resultMsg.textContent = msg;
    }, 350);
  }
}

// ---- drag/drop on columns ----
[dropPublic, dropPriv].forEach(drop => {
  drop.addEventListener("dragover", e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    drop.classList.add("over");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", e => {
    e.preventDefault();
    drop.classList.remove("over");
    const id = e.dataTransfer.getData("text/plain");
    place(id, drop.dataset.drop);
  });
});

// ---- tap column when card selected ----
document.querySelectorAll(".biz-col").forEach(col => {
  col.addEventListener("click", () => {
    if (!selectedId) return;
    place(selectedId, col.dataset.sector);
  });
});

btnReset.addEventListener("click", reset);
btnAgain.addEventListener("click", reset);

reset();

// ============================================================================
// Round 2 — characteristic matching
// ============================================================================
const CHARACTERISTICS = [
  { id: "c1", text: "Funded mainly by taxation",                              sector: "public" },
  { id: "c2", text: "Owned by shareholders",                                  sector: "private" },
  { id: "c3", text: "Main aim is to make a profit",                           sector: "private" },
  { id: "c4", text: "Main aim is to provide essential services to citizens",  sector: "public" },
  { id: "c5", text: "Funded by sales revenue and investors",                  sector: "private" },
  { id: "c6", text: "Run by central or local government",                     sector: "public" },
  { id: "c7", text: "Free at the point of use (e.g. healthcare, schools)",    sector: "public" },
  { id: "c8", text: "Responsible to shareholders rather than to taxpayers",   sector: "private" },
];

const round2El   = document.getElementById("round2");
const r2Pool     = document.getElementById("r2PoolCards");
const r2DropPub  = document.querySelector('[data-drop-r2="public"]');
const r2DropPri  = document.querySelector('[data-drop-r2="private"]');
const r2Feedback = document.getElementById("r2Feedback");
const r2Sorted   = document.getElementById("r2Sorted");
const r2Correct  = document.getElementById("r2Correct");
const r2Wrong    = document.getElementById("r2Wrong");
const r2Score    = document.getElementById("r2Score");
const r2Result   = document.getElementById("r2Result");
const r2Title    = document.getElementById("r2Title");
const r2Msg      = document.getElementById("r2Msg");
const btnRound2  = document.getElementById("btnRound2");
const btnR2Reset = document.getElementById("btnR2Reset");
const btnR2Again = document.getElementById("btnR2Again");
const btnBackR1  = document.getElementById("btnBackR1");

let r2CorrectN = 0, r2WrongN = 0, r2SortedN = 0;
let r2SelectedId = null;

function makeCharCard(c) {
  const div = document.createElement("div");
  div.className = "biz-card";
  div.draggable = true;
  div.dataset.id = c.id;
  div.innerHTML = `<div><div class="card-name">${c.text}</div></div>`;
  div.addEventListener("dragstart", e => {
    div.classList.add("dragging");
    e.dataTransfer.setData("text/plain", c.id);
    e.dataTransfer.effectAllowed = "move";
  });
  div.addEventListener("dragend", () => div.classList.remove("dragging"));
  div.addEventListener("click", () => selectChar(c.id));
  return div;
}

function selectChar(id) {
  const card = document.querySelector(`#r2PoolCards .biz-card[data-id="${id}"]`);
  if (!card || card.classList.contains("placed-correct") || card.classList.contains("placed-wrong")) return;
  document.querySelectorAll("#r2PoolCards .biz-card.selected").forEach(c => c.classList.remove("selected"));
  if (r2SelectedId === id) { r2SelectedId = null; r2Feedback.textContent = "Selection cleared."; r2Feedback.className = "biz-feedback"; return; }
  r2SelectedId = id;
  card.classList.add("selected");
  r2Feedback.innerHTML = `Selected. Tap the <strong>Public</strong> or <strong>Private</strong> column to place it.`;
  r2Feedback.className = "biz-feedback";
}

function placeChar(id, sector) {
  const c = CHARACTERISTICS.find(x => x.id === id);
  if (!c) return;
  const card = document.querySelector(`#r2PoolCards .biz-card[data-id="${id}"]`);
  if (!card || card.classList.contains("placed-correct") || card.classList.contains("placed-wrong")) return;
  card.classList.remove("selected");
  r2SelectedId = null;
  r2SortedN++;
  r2Sorted.textContent = r2SortedN;

  const drop = sector === "public" ? r2DropPub : r2DropPri;
  drop.appendChild(card);
  card.draggable = false;

  const isCorrect = c.sector === sector;
  if (isCorrect) {
    r2CorrectN++;
    r2Correct.textContent = r2CorrectN;
    card.classList.add("placed-correct");
    r2Feedback.innerHTML = `<strong>Correct.</strong> "${c.text}" — typical of the ${sector} sector.`;
    r2Feedback.className = "biz-feedback ok";
    ding();
  } else {
    r2WrongN++;
    r2Wrong.textContent = r2WrongN;
    card.classList.add("placed-wrong");
    r2Feedback.innerHTML = `<strong>Not quite.</strong> "${c.text}" describes the <em>${c.sector}</em> sector, not <em>${sector}</em>.`;
    r2Feedback.className = "biz-feedback bad";
    buzz();
  }
  r2Score.textContent = `${Math.round((r2CorrectN / r2SortedN) * 100)} %`;

  if (r2SortedN === CHARACTERISTICS.length) {
    setTimeout(() => {
      r2Result.hidden = false;
      let title, msg;
      if (r2CorrectN === CHARACTERISTICS.length) { title = "Round 2 — perfect."; msg = `${r2CorrectN} / ${CHARACTERISTICS.length}. Strong grasp of the definitions.`; fanfare(); }
      else if (r2CorrectN >= 6) { title = "Round 2 — strong."; msg = `${r2CorrectN} / ${CHARACTERISTICS.length}. Review the ${r2WrongN} you got wrong.`; fanfare(); }
      else { title = "Round 2 complete."; msg = `${r2CorrectN} / ${CHARACTERISTICS.length}. Take another look at the column descriptions and try again.`; }
      r2Title.textContent = title;
      r2Msg.textContent = msg;
    }, 350);
  }
}

function resetRound2() {
  r2CorrectN = 0; r2WrongN = 0; r2SortedN = 0; r2SelectedId = null;
  r2Sorted.textContent = "0"; r2Correct.textContent = "0"; r2Wrong.textContent = "0"; r2Score.textContent = "0 %";
  r2DropPub.innerHTML = "";
  r2DropPri.innerHTML = "";
  r2Result.hidden = true;
  r2Pool.innerHTML = "";
  shuffle(CHARACTERISTICS).forEach(c => r2Pool.appendChild(makeCharCard(c)));
  r2Feedback.innerHTML = "Drag a characteristic into the <strong>Public</strong> or <strong>Private</strong> column — or tap to choose.";
  r2Feedback.className = "biz-feedback";
}

// drag/drop for round 2
[r2DropPub, r2DropPri].forEach(drop => {
  drop.addEventListener("dragover", e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    drop.classList.add("over");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", e => {
    e.preventDefault();
    drop.classList.remove("over");
    const id = e.dataTransfer.getData("text/plain");
    if (!id || !CHARACTERISTICS.find(c => c.id === id)) return;
    placeChar(id, drop.dataset.dropR2);
  });
});

document.querySelectorAll("#round2 .biz-col").forEach(col => {
  col.addEventListener("click", () => {
    if (!r2SelectedId) return;
    placeChar(r2SelectedId, col.dataset.sector);
  });
});

btnRound2.addEventListener("click", () => {
  round2El.hidden = false;
  resetRound2();
  // scroll to round 2
  round2El.scrollIntoView({ behavior: "smooth", block: "start" });
});
btnR2Reset.addEventListener("click", resetRound2);
btnR2Again.addEventListener("click", resetRound2);
btnBackR1.addEventListener("click", () => {
  round2El.hidden = true;
  document.body.scrollIntoView({ behavior: "smooth", block: "start" });
});
