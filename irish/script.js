// Irish — Vocab + Tá vs Is grammar
// Two modes. Match: tap an Irish phrase, hear it spoken, tap its English meaning.
// Grammar: read an English sentence, choose Tá or Is.

const VOCAB_ROUNDS = [
  // Round 1 — greetings
  [
    { ga: "Dia dhuit",            en: "Hello" },
    { ga: "Dia is Muire dhuit",   en: "Hello (reply)" },
    { ga: "Slán",                 en: "Goodbye" },
    { ga: "Conas atá tú?",        en: "How are you?" },
    { ga: "Tá mé go maith",       en: "I am well" },
    { ga: "Go raibh maith agat",  en: "Thank you" },
  ],
  // Round 2 — personal info
  [
    { ga: "Is mise Áine",         en: "I am Áine" },
    { ga: "Cad is ainm duit?",    en: "What is your name?" },
    { ga: "Tá mé trí déag",       en: "I am thirteen" },
    { ga: "Tá mé i mo chónaí i mBéal Feirste", en: "I live in Belfast" },
    { ga: "Is as Ard Mhacha mé",  en: "I am from Armagh" },
    { ga: "Tá mé tuirseach",      en: "I am tired" },
  ],
  // Round 3 — family
  [
    { ga: "Tá máthair agam",      en: "I have a mother" },
    { ga: "Tá athair agam",       en: "I have a father" },
    { ga: "Tá deartháir agam",    en: "I have a brother" },
    { ga: "Tá deirfiúr agam",     en: "I have a sister" },
    { ga: "Tá madra againn",      en: "We have a dog" },
    { ga: "Is dochtúir í mo mháthair", en: "My mother is a doctor" },
  ],
];

// Grammar questions — each has the English sentence + expected verb
const GRAMMAR_QS = [
  { en: "I am tired.",                 verb: "tá", why: "Tired is a temporary state — use <strong>tá</strong>: <em>Tá mé tuirseach.</em>" },
  { en: "I am Áine (my name).",        verb: "is", why: "Identity — use <strong>is</strong>: <em>Is mise Áine.</em>" },
  { en: "I am a student.",             verb: "is", why: "Saying what you are (identity / occupation) — use <strong>is</strong>: <em>Is mac léinn mé.</em>" },
  { en: "I am from Newry.",            verb: "is", why: "Identity (origin / where you are from) — use <strong>is</strong>: <em>Is as an Iúr mé.</em>" },
  { en: "I am cold.",                  verb: "tá", why: "Feelings / temporary state — use <strong>tá</strong>: <em>Tá mé fuar.</em>" },
  { en: "I am in school.",             verb: "tá", why: "Location — use <strong>tá</strong>: <em>Tá mé ar scoil.</em>" },
  { en: "I am fifteen years old.",     verb: "tá", why: "Age — use <strong>tá</strong>: <em>Tá mé cúig bliana déag d'aois.</em>" },
  { en: "She is a teacher.",           verb: "is", why: "Identity (occupation) — use <strong>is</strong>: <em>Is múinteoir í.</em>" },
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
function ding() { tone(660, 80, "triangle", 0.05); setTimeout(()=>tone(990,100,"triangle",0.05),70); }
function buzz() { tone(180, 200, "sawtooth", 0.05); }
function fanfare() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05),i*110)); }

// ---- TTS
let voices = [];
let voicesReady = false;
function loadVoices() {
  voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  if (voices.length) voicesReady = true;
}
if (window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}
function pickIrishVoice() {
  return voices.find(v => v.lang && v.lang.toLowerCase().startsWith("ga"))
      || voices.find(v => v.name && /irish|gaelic/i.test(v.name))
      || voices.find(v => v.lang && v.lang.toLowerCase().startsWith("en-ie"))
      || null;
}
function speak(text) {
  if (!window.speechSynthesis) return;
  const doSpeak = () => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ga-IE";
    const v = pickIrishVoice();
    if (v) u.voice = v;
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };
  loadVoices();
  if (voicesReady) doSpeak();
  else {
    let done = false;
    const onReady = () => { if (done) return; done = true; loadVoices(); doSpeak(); };
    window.speechSynthesis.addEventListener("voiceschanged", onReady, { once: true });
    setTimeout(onReady, 600);
  }
}

// ---- DOM
const tabVocab = document.getElementById("tabVocab");
const tabGrammar = document.getElementById("tabGrammar");
const paneVocab = document.getElementById("paneVocab");
const paneGrammar = document.getElementById("paneGrammar");
tabVocab.addEventListener("click", () => { tabVocab.classList.add("active"); tabGrammar.classList.remove("active"); paneVocab.hidden = false; paneGrammar.hidden = true; });
tabGrammar.addEventListener("click", () => { tabGrammar.classList.add("active"); tabVocab.classList.remove("active"); paneVocab.hidden = true; paneGrammar.hidden = false; startGrammar(); });

// ---- Vocab match ----
const irishList = document.getElementById("irishList");
const englishList = document.getElementById("englishList");
const rNum = document.getElementById("rNum");
const rTotal = document.getElementById("rTotal");
const matched = document.getElementById("matched");
const mistakes = document.getElementById("mistakes");
const vFeedback = document.getElementById("vFeedback");
const vocabResult = document.getElementById("vocabResult");
const vTitle = document.getElementById("vTitle");
const vMsg = document.getElementById("vMsg");
const vNext = document.getElementById("vNext");

let round = 0;
let pairs = [];
let matchedCount = 0;
let mistakeCount = 0;
let selectedIrish = null;

rTotal.textContent = VOCAB_ROUNDS.length;

function startRound() {
  pairs = [...VOCAB_ROUNDS[round]];
  matchedCount = 0; mistakeCount = 0; selectedIrish = null;
  rNum.textContent = round + 1;
  matched.textContent = `0 / ${pairs.length}`;
  mistakes.textContent = "0";
  vocabResult.hidden = true;
  vFeedback.innerHTML = "Tap an Irish phrase (and hear it), then tap its English meaning.";
  vFeedback.className = "gae-feedback";

  // Render Irish list in original order, English in shuffled order
  irishList.innerHTML = "";
  englishList.innerHTML = "";
  pairs.forEach((p, i) => {
    const t = document.createElement("div");
    t.className = "match-tile";
    t.dataset.idx = i;
    t.innerHTML = `<span class="tile-text">${p.ga}</span><button class="speak-btn" type="button" aria-label="Hear ${p.ga}">▶</button>`;
    t.querySelector(".speak-btn").addEventListener("click", e => { e.stopPropagation(); speak(p.ga); });
    t.addEventListener("click", () => selectIrish(i, t));
    irishList.appendChild(t);
  });
  const shuffled = [...pairs].map((p, i) => ({ ...p, origIdx: i })).sort(() => Math.random() - 0.5);
  shuffled.forEach(p => {
    const t = document.createElement("div");
    t.className = "match-tile";
    t.dataset.idx = p.origIdx;
    t.innerHTML = `<span class="tile-text">${p.en}</span>`;
    t.addEventListener("click", () => selectEnglish(p.origIdx, t));
    englishList.appendChild(t);
  });
}

function selectIrish(idx, tile) {
  if (tile.classList.contains("matched")) return;
  speak(pairs[idx].ga);
  irishList.querySelectorAll(".match-tile.selected").forEach(x => x.classList.remove("selected"));
  if (selectedIrish === idx) { selectedIrish = null; vFeedback.textContent = "Cleared."; vFeedback.className = "gae-feedback"; return; }
  selectedIrish = idx;
  tile.classList.add("selected");
  vFeedback.innerHTML = `Selected <em>${pairs[idx].ga}</em>. Now tap its English meaning.`;
  vFeedback.className = "gae-feedback";
}

function selectEnglish(idx, tile) {
  if (tile.classList.contains("matched")) return;
  if (selectedIrish === null) {
    vFeedback.innerHTML = "Tap an Irish phrase first.";
    vFeedback.className = "gae-feedback bad";
    return;
  }
  if (selectedIrish === idx) {
    // matched
    tile.classList.add("matched");
    irishList.querySelector(`.match-tile[data-idx="${idx}"]`).classList.add("matched");
    irishList.querySelectorAll(".match-tile.selected").forEach(x => x.classList.remove("selected"));
    selectedIrish = null;
    matchedCount++;
    matched.textContent = `${matchedCount} / ${pairs.length}`;
    vFeedback.innerHTML = `<strong>Match.</strong> Well done.`;
    vFeedback.className = "gae-feedback ok";
    ding();
    if (matchedCount === pairs.length) {
      setTimeout(() => {
        vocabResult.hidden = false;
        vTitle.textContent = mistakeCount === 0 ? "Clean round." : `Round ${round + 1} complete.`;
        vMsg.textContent = `${pairs.length} matched with ${mistakeCount} mistake${mistakeCount === 1 ? "" : "s"}.`;
        if (round >= VOCAB_ROUNDS.length - 1) {
          vNext.textContent = "Start over";
          vNext.onclick = () => { round = 0; startRound(); };
          if (mistakeCount === 0) fanfare();
        } else {
          vNext.textContent = "Next round →";
          vNext.onclick = () => { round++; startRound(); };
          fanfare();
        }
      }, 300);
    }
  } else {
    tile.classList.add("wrong-flash");
    setTimeout(() => tile.classList.remove("wrong-flash"), 400);
    mistakeCount++;
    mistakes.textContent = mistakeCount;
    vFeedback.innerHTML = `<strong>Not quite.</strong> Try a different English meaning — listen to the Irish again if it helps.`;
    vFeedback.className = "gae-feedback bad";
    buzz();
  }
}

document.getElementById("vocabReset").addEventListener("click", () => { round = 0; startRound(); });
startRound();

// ---- Grammar (Tá or Is) ----
const gIdx = document.getElementById("gIdx");
const gTotal = document.getElementById("gTotal");
const gScore = document.getElementById("gScore");
const gFeedback = document.getElementById("gFeedback");
const gPrompt = document.getElementById("gPrompt");
const gOptTa = document.getElementById("gOptTa");
const gOptIs = document.getElementById("gOptIs");
const gAnswer = document.getElementById("gAnswer");
const grammarResult = document.getElementById("grammarResult");
const gTitle = document.getElementById("gTitle");
const gMsg = document.getElementById("gMsg");

let gQueue = [], gI = 0, gS = 0;

function startGrammar() {
  gQueue = [...GRAMMAR_QS].sort(() => Math.random() - 0.5);
  gI = 0; gS = 0;
  gScore.textContent = "0";
  gTotal.textContent = gQueue.length;
  grammarResult.hidden = true;
  nextGrammar();
}

function nextGrammar() {
  if (gI >= gQueue.length) { finishGrammar(); return; }
  const q = gQueue[gI];
  gIdx.textContent = gI + 1;
  gPrompt.innerHTML = `In English: <em>"${q.en}"</em> — which verb form would you use?`;
  gAnswer.hidden = true;
  gFeedback.innerHTML = "Read the English sentence, then choose the right verb form.";
  gFeedback.className = "gae-feedback";
  gOptTa.classList.remove("correct", "wrong");
  gOptIs.classList.remove("correct", "wrong");
  gOptTa.disabled = false;
  gOptIs.disabled = false;
}

function answerG(picked) {
  const q = gQueue[gI];
  gOptTa.disabled = true; gOptIs.disabled = true;
  const btn = picked === "tá" ? gOptTa : gOptIs;
  if (picked === q.verb) {
    btn.classList.add("correct");
    gS++; gScore.textContent = gS;
    gFeedback.innerHTML = `<strong>Correct.</strong>`;
    gFeedback.className = "gae-feedback ok";
    ding();
  } else {
    btn.classList.add("wrong");
    (q.verb === "tá" ? gOptTa : gOptIs).classList.add("correct");
    gFeedback.innerHTML = `<strong>Not quite.</strong>`;
    gFeedback.className = "gae-feedback bad";
    buzz();
  }
  gAnswer.hidden = false;
  gAnswer.innerHTML = q.why;
  setTimeout(() => { gI++; nextGrammar(); }, 1800);
}
gOptTa.addEventListener("click", () => answerG("tá"));
gOptIs.addEventListener("click", () => answerG("is"));

function finishGrammar() {
  grammarResult.hidden = false;
  let t, m;
  if (gS === gQueue.length) { t = "Faultless."; m = `${gS} / ${gQueue.length}. Tá and Is sorted.`; fanfare(); }
  else if (gS >= 6) { t = "Strong."; m = `${gS} / ${gQueue.length}. Review the explanations, then go again.`; fanfare(); }
  else { t = "Round complete."; m = `${gS} / ${gQueue.length}. The rules at the top are the revision.`; }
  gTitle.textContent = t;
  gMsg.textContent = m;
}

document.getElementById("grammarReset").addEventListener("click", startGrammar);
document.getElementById("gAgain").addEventListener("click", startGrammar);
