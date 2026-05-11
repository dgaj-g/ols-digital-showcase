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
