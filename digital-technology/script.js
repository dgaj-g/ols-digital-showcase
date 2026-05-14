// Digital Technology — Cloud Computing (CCEA GCSE Unit 1)
// Mode 1: Sort 10 services into "Local" or "Cloud" buckets.
// Mode 2: Sort 10 statements about cloud computing into Advantage / Disadvantage.

const SERVICES = [
  { id: "word-desktop",    icon: "W",  name: "Microsoft Word (desktop installed)", cat: "local",
    note: "The Word application is installed on the device's hard drive and runs without the internet." },
  { id: "office-365",      icon: "365",name: "Microsoft 365 (online in browser)",  cat: "cloud",
    note: "Documents are stored on Microsoft's servers and edited through a web browser." },
  { id: "google-docs",     icon: "GD", name: "Google Docs",                         cat: "cloud",
    note: "Runs entirely in the browser; documents live on Google's servers." },
  { id: "photoshop",       icon: "Ps", name: "Adobe Photoshop on a school PC",     cat: "local",
    note: "The software runs locally and reads files from the local disk." },
  { id: "spotify",         icon: "♪",  name: "Spotify streaming",                  cat: "cloud",
    note: "Music files live on Spotify's servers and stream over the internet." },
  { id: "usb",             icon: "USB",name: "Files on a USB stick",               cat: "local",
    note: "Physical storage carried with you. No internet involved." },
  { id: "icloud",          icon: "iC", name: "Photos backed up to iCloud",         cat: "cloud",
    note: "Photos are uploaded to Apple's servers and synced across your devices." },
  { id: "dropbox",         icon: "DB", name: "Dropbox folder",                     cat: "cloud",
    note: "Folder appears local but is actually mirrored to Dropbox's servers." },
  { id: "calculator",      icon: "fn", name: "macOS Calculator app",               cat: "local",
    note: "Runs entirely on the device — no server involved." },
  { id: "netflix",         icon: "N",  name: "Watching a film on Netflix",         cat: "cloud",
    note: "Video files live on Netflix's servers and stream to your device." },
];

const STATEMENTS = [
  { id: "anywhere",   text: "Access your files from any device with an internet connection.",                          cat: "pro" },
  { id: "backup",     text: "Files are automatically backed up — if your laptop is stolen, the data is safe.",         cat: "pro" },
  { id: "collab",     text: "Multiple people can edit the same document at the same time.",                            cat: "pro" },
  { id: "scale",      text: "If you need more storage, you can pay for more without buying new hardware.",             cat: "pro" },
  { id: "updates",    text: "Software updates happen automatically — no manual installs needed.",                     cat: "pro" },
  { id: "internet",   text: "If your internet connection drops, you can't access your files.",                         cat: "con" },
  { id: "privacy",    text: "Your data sits on someone else's servers — privacy and security concerns.",               cat: "con" },
  { id: "ongoing",    text: "You pay a monthly fee forever, rather than buying the software once.",                    cat: "con" },
  { id: "lockin",     text: "Migrating away to a different provider can be hard if your data is stuck in one format.", cat: "con" },
  { id: "slow",       text: "Uploading or downloading very large files can be slow over typical broadband.",           cat: "con" },
];

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
function ding(){ tone(720,80,"triangle",0.05); setTimeout(()=>tone(1080,100,"triangle",0.05),70); }
function buzz(){ tone(180,200,"sawtooth",0.05); }
function fanfare(){ [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05),i*110)); }

function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}

// ---- Generic sort-mode controller (used for both Sort and Pros) ----
function makeSortMode(items, valueField, pane, poolListId, feedbackEl, statRefs, resultEls, labels) {
  let sorted = 0, correct = 0, wrong = 0;
  let selectedId = null;
  const drops = pane.querySelectorAll(".sort-drop");
  const poolList = document.getElementById(poolListId);

  function renderPool() {
    poolList.innerHTML = "";
    items.forEach(it => {
      if (it._placed) return; // already placed
      const card = makeCard(it);
      poolList.appendChild(card);
    });
  }
  function makeCard(it) {
    const card = document.createElement("div");
    card.className = "svc-card";
    card.draggable = true;
    card.dataset.id = it.id;
    if (it.icon) {
      card.innerHTML = `<span class="svc-icon">${it.icon}</span><span class="svc-name">${it.text || it.name}</span>`;
    } else {
      card.innerHTML = `<span class="svc-name">${it.text || it.name}</span>`;
    }
    card.addEventListener("click", () => {
      if (it._placed) return;
      pane.querySelectorAll(".svc-card.selected").forEach(x => x.classList.remove("selected"));
      if (selectedId === it.id) { selectedId = null; feedbackEl.textContent = "Selection cleared."; feedbackEl.className = "cloud-feedback"; return; }
      selectedId = it.id;
      card.classList.add("selected");
      feedbackEl.innerHTML = `<strong>${it.text || it.name}</strong> selected — tap a column to place it.`;
      feedbackEl.className = "cloud-feedback";
    });
    card.addEventListener("dragstart", e => {
      card.classList.add("dragging");
      e.dataTransfer.setData("text/plain", it.id);
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
    return card;
  }
  drops.forEach(drop => {
    drop.addEventListener("dragover", e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; drop.classList.add("over"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("over"));
    drop.addEventListener("drop", e => {
      e.preventDefault(); drop.classList.remove("over");
      const id = e.dataTransfer.getData("text/plain");
      place(id, drop.parentElement.dataset.cat);
    });
  });
  pane.querySelectorAll(".sort-col").forEach(col => {
    col.addEventListener("click", () => {
      if (!selectedId) return;
      place(selectedId, col.dataset.cat);
    });
  });

  function place(id, cat) {
    const it = items.find(x => x.id === id);
    if (!it || it._placed) return;
    it._placed = cat;
    sorted++; statRefs.sorted.textContent = sorted;
    const col = pane.querySelector(`.sort-col[data-cat="${cat}"] .sort-drop`);
    const card = makeCard(it);
    card.draggable = false;
    card.style.cursor = "default";
    const isRight = it[valueField] === cat;
    if (isRight) {
      correct++; statRefs.correct.textContent = correct;
      card.classList.add("placed-correct");
      feedbackEl.innerHTML = `<strong>Correct.</strong> ${it.note || ""}`;
      feedbackEl.className = "cloud-feedback ok";
      ding();
    } else {
      wrong++; statRefs.wrong.textContent = wrong;
      card.classList.add("placed-wrong");
      feedbackEl.innerHTML = `<strong>Not quite.</strong> That belongs in <em>${labels[it[valueField]]}</em>. ${it.note || ""}`;
      feedbackEl.className = "cloud-feedback bad";
      buzz();
    }
    col.appendChild(card);
    selectedId = null;
    pane.querySelectorAll(".svc-card.selected").forEach(x => x.classList.remove("selected"));
    renderPool();
    if (sorted === items.length) {
      setTimeout(() => {
        resultEls.wrap.hidden = false;
        let t, m;
        if (correct === items.length) { t = "Perfect."; m = `${correct} / ${items.length}. Every one in the right place.`; fanfare(); }
        else if (correct >= items.length - 2) { t = "Strong run."; m = `${correct} / ${items.length}. Quick review of the ${items.length - correct} mistakes and you've got it.`; fanfare(); }
        else { t = "Worth another go."; m = `${correct} / ${items.length}. The feedback under each placement explains the right answer.`; }
        resultEls.title.textContent = t;
        resultEls.msg.textContent = m;
      }, 350);
    }
  }

  function reset() {
    sorted = 0; correct = 0; wrong = 0; selectedId = null;
    statRefs.sorted.textContent = "0"; statRefs.correct.textContent = "0"; statRefs.wrong.textContent = "0";
    items.forEach(it => { delete it._placed; });
    pane.querySelectorAll(".sort-drop").forEach(d => d.innerHTML = "");
    resultEls.wrap.hidden = true;
    feedbackEl.innerHTML = labels.intro;
    feedbackEl.className = "cloud-feedback";
    renderPool();
  }

  reset();
  return { reset };
}

// ---- Wire up Sort mode (Local vs Cloud) ----
const sortMode = makeSortMode(
  shuffle(SERVICES),
  "cat",
  document.getElementById("paneSort"),
  "sortPoolList",
  document.getElementById("sFeedback"),
  { sorted: document.getElementById("sSorted"), correct: document.getElementById("sCorrect"), wrong: document.getElementById("sWrong") },
  { wrap: document.getElementById("sortResult"), title: document.getElementById("sortTitle"), msg: document.getElementById("sortMsg") },
  { local: "Local", cloud: "Cloud", intro: "Pick a service from the toolbox, then tap a column. <strong>Local</strong> = on the device. <strong>Cloud</strong> = on a remote server reached over the internet." },
);
document.getElementById("sortReset").addEventListener("click", sortMode.reset);
document.getElementById("sortAgain").addEventListener("click", sortMode.reset);

// ---- Wire up Pros/Cons mode ----
const prosMode = makeSortMode(
  shuffle(STATEMENTS.map(s => ({ ...s, text: s.text }))),
  "cat",
  document.getElementById("panePros"),
  "prosPoolList",
  document.getElementById("pFeedback"),
  { sorted: document.getElementById("pSorted"), correct: document.getElementById("pCorrect"), wrong: document.getElementById("pWrong") },
  { wrap: document.getElementById("prosResult"), title: document.getElementById("prosTitle"), msg: document.getElementById("prosMsg") },
  { pro: "Advantage", con: "Disadvantage", intro: "Drag each statement into the right column. Think: is this a <em>reason to use</em> the cloud, or a <em>cost / risk</em>?" },
);
document.getElementById("prosReset").addEventListener("click", prosMode.reset);
document.getElementById("prosAgain").addEventListener("click", prosMode.reset);

// ---- Tabs
const tabSort = document.getElementById("tabSort");
const tabPros = document.getElementById("tabPros");
const paneSort = document.getElementById("paneSort");
const panePros = document.getElementById("panePros");
tabSort.addEventListener("click", () => { tabSort.classList.add("active"); tabPros.classList.remove("active"); paneSort.hidden = false; panePros.hidden = true; });
tabPros.addEventListener("click", () => { tabPros.classList.add("active"); tabSort.classList.remove("active"); paneSort.hidden = true; panePros.hidden = false; });
