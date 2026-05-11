// Spanish — Mi familia
// Two modes. Family tree: click a member to hear Spanish (es-ES TTS) + a
// short example sentence. Build the sentence: assemble Spanish word tiles
// in the right order to translate an English prompt.

const FAMILY = [
  // root grandparents
  { id: "abuelo",  en: "Grandfather",  es: "el abuelo",  initial: "A", row: 0, col: 1, parents: [], example: { es: "Mi abuelo es alto y mayor.", en: "My grandfather is tall and old." } },
  { id: "abuela",  en: "Grandmother",  es: "la abuela",  initial: "A", row: 0, col: 2, parents: [], example: { es: "Mi abuela es simpática.", en: "My grandmother is friendly." } },
  // parents
  { id: "padre",   en: "Father",       es: "el padre",   initial: "P", row: 1, col: 1, parents: ["abuelo","abuela"], example: { es: "Mi padre es delgado.", en: "My father is slim." } },
  { id: "madre",   en: "Mother",       es: "la madre",   initial: "M", row: 1, col: 2, parents: [], example: { es: "Mi madre es muy generosa.", en: "My mother is very generous." } },
  { id: "tio",     en: "Uncle",        es: "el tío",     initial: "T", row: 1, col: 0, parents: [], example: { es: "Mi tío vive en Madrid.", en: "My uncle lives in Madrid." } },
  { id: "tia",     en: "Aunt",         es: "la tía",     initial: "T", row: 1, col: 3, parents: [], example: { es: "Mi tía es divertida.", en: "My aunt is funny." } },
  // me + siblings
  { id: "yo",      en: "Me / I",       es: "yo",         initial: "Yo",row: 2, col: 2, parents: ["padre","madre"], example: { es: "Yo soy estudiante en OLS.", en: "I am a student at OLS." } },
  { id: "hermano", en: "Brother",      es: "el hermano", initial: "H", row: 2, col: 3, parents: ["padre","madre"], example: { es: "Mi hermano juega al fútbol.", en: "My brother plays football." } },
  { id: "hermana", en: "Sister",       es: "la hermana", initial: "H", row: 2, col: 1, parents: ["padre","madre"], example: { es: "Mi hermana es mayor que yo.", en: "My sister is older than me." } },
  { id: "primo",   en: "Cousin (m)",   es: "el primo",   initial: "P", row: 2, col: 0, parents: ["tio"], example: { es: "Mi primo vive cerca.", en: "My cousin lives nearby." } },
];

// Sentences for Build mode — English prompt, Spanish target (correct word order),
// distractor words to challenge
const BUILD = [
  { en: "My mother is tall.", target: ["mi","madre","es","alta"], distractors: ["es","alto"] },
  { en: "My father is slim.", target: ["mi","padre","es","delgado"], distractors: ["delgada","mi","es"] },
  { en: "I have a brother.", target: ["tengo","un","hermano"], distractors: ["una","hermana","es"] },
  { en: "My sister is funny.", target: ["mi","hermana","es","divertida"], distractors: ["divertido","él"] },
  { en: "My uncle lives in Madrid.", target: ["mi","tío","vive","en","Madrid"], distractors: ["es","en","Sevilla"] },
  { en: "I am a student.", target: ["yo","soy","estudiante"], distractors: ["estudio","tengo","es"] },
  { en: "My grandmother is generous.", target: ["mi","abuela","es","generosa"], distractors: ["generoso","mis","son"] },
  { en: "My cousin is younger than me.", target: ["mi","primo","es","menor","que","yo"], distractors: ["mayor","él"] },
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
function ding(){ tone(660,80,"triangle",0.05); setTimeout(()=>tone(990,100,"triangle",0.05),70); }
function buzz(){ tone(180,200,"sawtooth",0.05); }
function fanfare(){ [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05),i*110)); }

// ---- TTS (Spanish)
let voices = [], voicesReady = false;
function loadVoices() { voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : []; if (voices.length) voicesReady = true; }
if (window.speechSynthesis) { loadVoices(); window.speechSynthesis.onvoiceschanged = loadVoices; }
function pickSpanish() {
  return voices.find(v => v.lang && v.lang.toLowerCase().startsWith("es"))
      || voices.find(v => v.name && /spanish|español/i.test(v.name))
      || null;
}
function speakES(text) {
  if (!window.speechSynthesis) return;
  const doSpeak = () => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    const v = pickSpanish();
    if (v) u.voice = v;
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };
  loadVoices();
  if (voicesReady) doSpeak();
  else { let done = false; const onReady = () => { if (done) return; done = true; loadVoices(); doSpeak(); };
    window.speechSynthesis.addEventListener("voiceschanged", onReady, { once: true }); setTimeout(onReady, 600); }
}

// ---- Tree
const treeSvg = document.getElementById("treeSvg");
const wordPanel = document.getElementById("wordPanel");

function drawTree() {
  // Layout: 3 rows × 4 cols on a 900×500 canvas
  const cellW = 220, cellH = 150;
  const offX = 30, offY = 30;
  // lines between parents/children
  let lines = "";
  FAMILY.forEach(f => {
    if (!f.parents.length) return;
    f.parents.forEach(pid => {
      const p = FAMILY.find(x => x.id === pid);
      if (!p) return;
      const x1 = offX + p.col * cellW + cellW/2;
      const y1 = offY + p.row * cellH + 60;
      const x2 = offX + f.col * cellW + cellW/2;
      const y2 = offY + f.row * cellH + 20;
      lines += `<path class="fam-line" d="M ${x1} ${y1} C ${x1} ${(y1+y2)/2}, ${x2} ${(y1+y2)/2}, ${x2} ${y2}"/>`;
    });
  });
  let nodes = "";
  FAMILY.forEach(f => {
    const cx = offX + f.col * cellW + cellW/2;
    const cy = offY + f.row * cellH + 60;
    nodes += `<g class="fam-node" data-id="${f.id}">
      <circle class="bubble" cx="${cx}" cy="${cy}" r="36"/>
      <text class="fam-icon" x="${cx}" y="${cy - 5}">${f.initial}</text>
      <text class="fam-en" x="${cx}" y="${cy + 15}">${f.en}</text>
    </g>`;
  });
  treeSvg.innerHTML = lines + nodes;
  treeSvg.querySelectorAll(".fam-node").forEach(g => {
    g.addEventListener("click", () => onFamilyClick(g.dataset.id, g));
  });
}

function onFamilyClick(id, g) {
  treeSvg.querySelectorAll(".fam-node.active").forEach(x => x.classList.remove("active"));
  g.classList.add("active");
  const f = FAMILY.find(x => x.id === id);
  if (!f) return;
  speakES(f.es);
  wordPanel.innerHTML = `
    <header class="word-head">
      <span class="word-es">${f.es}</span>
      <button class="speak-btn" id="wordSpeak" type="button">▶ Hear it</button>
      <span class="word-en">${f.en}</span>
    </header>
    <p class="word-sentence">For example: <em>${f.example.es}</em><br><small style="color:#8A6D4F">${f.example.en}</small></p>
  `;
  document.getElementById("wordSpeak").addEventListener("click", () => speakES(f.example.es));
}
drawTree();

// ---- Tabs
const tabTree = document.getElementById("tabTree");
const tabBuild = document.getElementById("tabBuild");
const paneTree = document.getElementById("paneTree");
const paneBuild = document.getElementById("paneBuild");
tabTree.addEventListener("click", () => { tabTree.classList.add("active"); tabBuild.classList.remove("active"); paneTree.hidden = false; paneBuild.hidden = true; });
tabBuild.addEventListener("click", () => { tabBuild.classList.add("active"); tabTree.classList.remove("active"); paneTree.hidden = true; paneBuild.hidden = false; startBuild(); });

// ---- Build
const qIdx = document.getElementById("qIdx");
const qTotal = document.getElementById("qTotal");
const qScore = document.getElementById("qScore");
const qFeedback = document.getElementById("qFeedback");
const englishPrompt = document.getElementById("englishPrompt");
const buildLine = document.getElementById("buildLine");
const wordBank = document.getElementById("wordBank");
const btnCheck = document.getElementById("btnCheck");
const btnUndo = document.getElementById("btnUndo");
const btnHear = document.getElementById("btnHear");
const espResult = document.getElementById("espResult");
const resultTitle = document.getElementById("resultTitle");
const resultMsg = document.getElementById("resultMsg");

let queue = [];
let qi = 0, qs = 0;
let placed = [];
let bankWords = [];

function startBuild() {
  queue = [...BUILD].sort(() => Math.random() - 0.5);
  qi = 0; qs = 0;
  qScore.textContent = "0";
  qTotal.textContent = queue.length;
  espResult.hidden = true;
  nextBuild();
}

function nextBuild() {
  if (qi >= queue.length) { finishBuild(); return; }
  const b = queue[qi];
  qIdx.textContent = qi + 1;
  englishPrompt.innerHTML = `<strong>In Spanish:</strong> "${b.en}"`;
  placed = [];
  // bank = target words + distractors, shuffled
  bankWords = [...b.target, ...b.distractors].sort(() => Math.random() - 0.5);
  redrawBuild();
  qFeedback.innerHTML = "Tap the word tiles in the right order. Tap a tile in your sentence to remove it.";
  qFeedback.className = "esp-feedback";
}

function redrawBuild() {
  // line
  buildLine.innerHTML = "";
  if (placed.length === 0) {
    buildLine.innerHTML = `<span class="build-empty">Your sentence will appear here…</span>`;
  } else {
    placed.forEach((w, i) => {
      const span = document.createElement("span");
      span.className = "placed-word";
      span.textContent = w;
      span.addEventListener("click", () => {
        placed.splice(i, 1);
        redrawBuild();
      });
      buildLine.appendChild(span);
    });
  }
  // bank
  wordBank.innerHTML = "";
  // count remaining occurrences of each word
  const used = {};
  placed.forEach(w => used[w] = (used[w] || 0) + 1);
  const bankCounts = {};
  bankWords.forEach(w => bankCounts[w] = (bankCounts[w] || 0) + 1);
  // render words with available counts
  Object.entries(bankCounts).forEach(([w, count]) => {
    const remaining = count - (used[w] || 0);
    for (let i = 0; i < count; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "bank-word";
      b.textContent = w;
      if (i >= remaining) b.classList.add("used");
      b.addEventListener("click", () => {
        if (b.classList.contains("used")) return;
        placed.push(w);
        redrawBuild();
      });
      wordBank.appendChild(b);
    }
  });
}

btnCheck.addEventListener("click", () => {
  const b = queue[qi];
  if (placed.length !== b.target.length) {
    qFeedback.innerHTML = `<strong>Not finished.</strong> The sentence needs ${b.target.length} words — you have ${placed.length}.`;
    qFeedback.className = "esp-feedback bad";
    return;
  }
  const ok = placed.every((w, i) => w === b.target[i]);
  if (ok) {
    qs++; qScore.textContent = qs;
    qFeedback.innerHTML = `<strong>Correct.</strong> Spanish: "${b.target.join(" ")}"`;
    qFeedback.className = "esp-feedback ok";
    ding();
    speakES(b.target.join(" "));
    setTimeout(() => { qi++; nextBuild(); }, 1900);
  } else {
    // find first wrong position
    const wrongIdx = placed.findIndex((w, i) => w !== b.target[i]);
    qFeedback.innerHTML = `<strong>Almost.</strong> The word at position ${wrongIdx + 1} isn't quite right — try a different order.`;
    qFeedback.className = "esp-feedback bad";
    buzz();
  }
});

btnUndo.addEventListener("click", () => { placed.pop(); redrawBuild(); });
btnHear.addEventListener("click", () => { if (placed.length) speakES(placed.join(" ")); });

document.getElementById("qReset").addEventListener("click", startBuild);
document.getElementById("qAgain").addEventListener("click", startBuild);

function finishBuild() {
  espResult.hidden = false;
  let t, m;
  if (qs === queue.length) { t = "Habla con fluidez."; m = `${qs} / ${queue.length}. Every sentence in correct order, first try.`; fanfare(); }
  else if (qs >= 6) { t = "Strong."; m = `${qs} / ${queue.length}. A confident set.`; fanfare(); }
  else if (qs >= 3) { t = "Round complete."; m = `${qs} / ${queue.length}. The family tree above is the vocab anchor — go back and listen.`; }
  else { t = "Set finished."; m = `${qs} / ${queue.length}. Try the tree mode first to lock in the vocabulary, then return.`; }
  resultTitle.textContent = t;
  resultMsg.textContent = m;
}
