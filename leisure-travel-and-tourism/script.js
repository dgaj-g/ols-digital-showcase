// Leisure, Travel and Tourism — Tech in the Customer Journey
// Mode 1: place 10 technology cards on the right stage of the customer journey
//         (dream → book → travel → experience → share).
// Mode 2: 8-question factors-of-change quiz.

const STAGES = ["dream","book","travel","experience","share"];
const STAGE_NAMES = {
  dream: "Dream & research",
  book: "Plan & book",
  travel: "Travel & check-in",
  experience: "At the destination",
  share: "Reflect & share",
};

const TECH = [
  { id: "tripadvisor", icon: "★", name: "TripAdvisor reviews",      stage: "dream",      reason: "Reviews on TripAdvisor inform research before the booking decision." },
  { id: "instagram",   icon: "📷", name: "Instagram &amp; TikTok feeds", stage: "dream",      reason: "Social media is now the #1 inspiration source for younger travellers." },
  { id: "booking",     icon: "$",  name: "Online booking sites (booking.com)", stage: "book", reason: "Compare prices, secure rooms / flights / tickets all in one place." },
  { id: "paypal",      icon: "£",  name: "Online payment (Apple/Google Pay)", stage: "book", reason: "Frictionless payment at point of booking." },
  { id: "selfcheckin", icon: "✈",  name: "Self check-in kiosks",       stage: "travel",     reason: "Reduces queueing and staff costs at airports / ferry ports." },
  { id: "barcode",     icon: "▦",  name: "Barcode-scanning tickets",   stage: "travel",     reason: "Paperless tickets — boarding pass on the phone." },
  { id: "gmaps",       icon: "→",  name: "Google Maps / Apple Maps",   stage: "experience", reason: "Wayfinding on the ground — restaurants, attractions, public transport." },
  { id: "tourapp",     icon: "ℹ",  name: "Self-guided tour app",       stage: "experience", reason: "Smartphone audio tours replace the printed leaflet at attractions." },
  { id: "reviews",     icon: "✎",  name: "Post-trip review forms",     stage: "share",      reason: "Online customer feedback drives quality and ranks businesses." },
  { id: "snapshare",   icon: "↗",  name: "Sharing photos on socials",  stage: "share",      reason: "Sharing the trip on social inspires future customers — a feedback loop." },
];

// Factors-of-change quiz — scenario → which factor is the main driver
const FACTORS = [
  { id: "tech",     name: "Technology" },
  { id: "comm",     name: "Communication" },
  { id: "afflu",    name: "Changing affluence" },
  { id: "expect",   name: "Quality expectations" },
  { id: "health",   name: "Healthy lifestyle awareness" },
  { id: "media",    name: "Media &amp; celebrity influence" },
  { id: "awards",   name: "Industry awards" },
];

const QUESTIONS = [
  { q: "A small B&amp;B in Newcastle, Co. Down sees a 40% spike in bookings the week after a celebrity Instagrams a stay there. <em>What's the main driver?</em>",
    opts: ["Media & celebrity influence","Technology","Industry awards","Changing affluence"],
    ans: "Media & celebrity influence" },
  { q: "An airline replaces all printed boarding passes with QR codes scanned at the gate. <em>What's the main driver?</em>",
    opts: ["Technology","Industry awards","Quality expectations","Healthy lifestyle awareness"],
    ans: "Technology" },
  { q: "A hotel chain reports more guests requesting in-room yoga mats and gluten-free menus. <em>What's the main driver?</em>",
    opts: ["Healthy lifestyle awareness","Industry awards","Communication","Technology"],
    ans: "Healthy lifestyle awareness" },
  { q: "Customers increasingly choose hotels with a four-star rating or higher and complain about anything below. <em>What's the main driver?</em>",
    opts: ["Quality expectations","Changing affluence","Media & celebrity influence","Technology"],
    ans: "Quality expectations" },
  { q: "A travel agency in Newry reports more bookings to long-haul destinations as average household income in the area rises. <em>What's the main driver?</em>",
    opts: ["Changing affluence","Media & celebrity influence","Technology","Industry awards"],
    ans: "Changing affluence" },
  { q: "Belfast wins a major World Travel Award and visitor numbers rise 12% the following year. <em>What's the main driver?</em>",
    opts: ["Industry awards","Communication","Changing affluence","Technology"],
    ans: "Industry awards" },
  { q: "An attraction in Ballycastle relies on WhatsApp and email to confirm bookings within minutes of enquiry. <em>What's the main driver?</em>",
    opts: ["Communication","Technology","Quality expectations","Awards"],
    ans: "Communication" },
  { q: "Bookings shift from Saga Holidays (older travellers) to backpacker hostels in Asia after viral travel-vloggers post their experiences. <em>What's the main driver?</em>",
    opts: ["Media & celebrity influence","Healthy lifestyle awareness","Technology","Communication"],
    ans: "Media & celebrity influence" },
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
function tick(){ tone(720,40,"triangle",0.04); }
function ding(){ tone(660,80,"triangle",0.05); setTimeout(()=>tone(990,100,"triangle",0.05),70); }
function buzz(){ tone(180,200,"sawtooth",0.05); }
function fanfare(){ [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05),i*110)); }

// ---- DOM
const techGrid = document.getElementById("techGrid");
const placedN = document.getElementById("placedN");
const correctN = document.getElementById("correctN");
const jFeedback = document.getElementById("jFeedback");
const lttResult = document.getElementById("lttResult");
const resultTitle = document.getElementById("resultTitle");
const resultMsg = document.getElementById("resultMsg");

let selectedTech = null;
let placed = {}; // tech.id -> stage
let correctCount = 0;

function renderTechBank() {
  techGrid.innerHTML = "";
  TECH.forEach(t => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tech-card";
    b.dataset.id = t.id;
    if (placed[t.id]) b.classList.add("placed");
    if (selectedTech === t.id) b.classList.add("selected");
    b.innerHTML = `<span class="ico">${t.icon}</span><span class="tech-name">${t.name}</span>`;
    b.addEventListener("click", () => {
      if (placed[t.id]) return;
      if (selectedTech === t.id) { selectedTech = null; renderTechBank(); jFeedback.textContent = "Cleared."; jFeedback.className = "ltt-feedback"; return; }
      selectedTech = t.id;
      renderTechBank();
      jFeedback.innerHTML = `<strong>${t.name}</strong> selected — now tap the journey stage where it fits.`;
      jFeedback.className = "ltt-feedback";
    });
    techGrid.appendChild(b);
  });
  placedN.textContent = Object.keys(placed).length;
  correctN.textContent = correctCount;
}

document.querySelectorAll(".stage-card").forEach(card => {
  card.addEventListener("click", () => {
    if (!selectedTech) {
      jFeedback.innerHTML = "Pick a technology card from the toolbox below first.";
      jFeedback.className = "ltt-feedback bad";
      return;
    }
    const t = TECH.find(x => x.id === selectedTech);
    const stage = card.dataset.stage;
    placed[t.id] = stage;
    const list = card.querySelector(".stage-drop");
    const li = document.createElement("li");
    li.dataset.id = t.id;
    li.innerHTML = `<span>${t.icon}</span> ${t.name}`;
    if (stage === t.stage) {
      li.classList.add("correct");
      correctCount++;
      jFeedback.innerHTML = `<strong>Good fit.</strong> ${t.reason}`;
      jFeedback.className = "ltt-feedback ok";
      ding();
    } else {
      li.classList.add("wrong");
      jFeedback.innerHTML = `<strong>Hmm.</strong> "${t.name}" is more typical of the <em>${STAGE_NAMES[t.stage]}</em> stage. ${t.reason}`;
      jFeedback.className = "ltt-feedback bad";
      buzz();
    }
    li.addEventListener("click", () => {
      // remove
      delete placed[t.id];
      if (li.classList.contains("correct")) correctCount--;
      li.remove();
      renderTechBank();
    });
    list.appendChild(li);
    selectedTech = null;
    renderTechBank();
    if (Object.keys(placed).length === TECH.length) {
      setTimeout(() => {
        lttResult.hidden = false;
        let t, m;
        if (correctCount === TECH.length) { t = "Perfect placement."; m = `${correctCount} / ${TECH.length}. Every technology mapped to the right stage.`; fanfare(); }
        else if (correctCount >= 7) { t = "Strong run."; m = `${correctCount} / ${TECH.length}. A confident customer-journey map.`; fanfare(); }
        else { t = "Round complete."; m = `${correctCount} / ${TECH.length}. Tap a tech card on the journey to remove and reposition it.`; }
        resultTitle.textContent = t;
        resultMsg.textContent = m;
      }, 350);
    }
  });
});

function resetJourney() {
  placed = {}; correctCount = 0; selectedTech = null;
  document.querySelectorAll(".stage-drop").forEach(d => d.innerHTML = "");
  lttResult.hidden = true;
  jFeedback.innerHTML = "Pick a technology below, then tap the journey stage where it best fits.";
  jFeedback.className = "ltt-feedback";
  renderTechBank();
}
document.getElementById("journeyReset").addEventListener("click", resetJourney);
document.getElementById("journeyAgain").addEventListener("click", resetJourney);
renderTechBank();

// ---- Tabs
const tabJourney = document.getElementById("tabJourney");
const tabQuiz = document.getElementById("tabQuiz");
const paneJourney = document.getElementById("paneJourney");
const paneQuiz = document.getElementById("paneQuiz");
tabJourney.addEventListener("click", () => { tabJourney.classList.add("active"); tabQuiz.classList.remove("active"); paneJourney.hidden = false; paneQuiz.hidden = true; });
tabQuiz.addEventListener("click",    () => { tabQuiz.classList.add("active"); tabJourney.classList.remove("active"); paneJourney.hidden = true; paneQuiz.hidden = false; startQuiz(); });

// ---- Quiz
const qIdx = document.getElementById("qIdx");
const qTotal = document.getElementById("qTotal");
const qScore = document.getElementById("qScore");
const qFeedback = document.getElementById("qFeedback");
const qPrompt = document.getElementById("qPrompt");
const qOptions = document.getElementById("qOptions");
const quizResult = document.getElementById("quizResult");
const qResultTitle = document.getElementById("qResultTitle");
const qResultMsg = document.getElementById("qResultMsg");

let queue = [], qi = 0, qs = 0;
function startQuiz() {
  queue = [...QUESTIONS].sort(() => Math.random() - 0.5);
  qi = 0; qs = 0;
  qScore.textContent = "0";
  qTotal.textContent = queue.length;
  quizResult.hidden = true;
  nextQ();
}
function nextQ() {
  if (qi >= queue.length) { finish(); return; }
  const q = queue[qi];
  qIdx.textContent = qi + 1;
  qPrompt.innerHTML = q.q;
  qOptions.innerHTML = "";
  q.opts.slice().sort(() => Math.random() - 0.5).forEach(opt => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "q-opt"; b.textContent = opt;
    b.addEventListener("click", () => handle(opt, b, q.ans));
    qOptions.appendChild(b);
  });
  qFeedback.innerHTML = "Pick the factor that best drives the scenario.";
  qFeedback.className = "ltt-feedback";
}
function handle(picked, btn, correct) {
  document.querySelectorAll(".q-opt").forEach(x => x.disabled = true);
  if (picked === correct) {
    btn.classList.add("correct");
    qs++; qScore.textContent = qs;
    qFeedback.innerHTML = `<strong>Correct.</strong> ${correct} is the main driver here.`;
    qFeedback.className = "ltt-feedback ok";
    ding();
  } else {
    btn.classList.add("wrong");
    [...qOptions.children].find(b => b.textContent === correct)?.classList.add("correct");
    qFeedback.innerHTML = `<strong>${correct}</strong> is the closest fit — though others can play a part.`;
    qFeedback.className = "ltt-feedback bad";
    buzz();
  }
  setTimeout(() => { qi++; nextQ(); }, 1700);
}
function finish() {
  quizResult.hidden = false;
  let t, m;
  if (qs === queue.length) { t = "Industry-ready."; m = `${qs} / ${queue.length}. Every scenario diagnosed correctly.`; fanfare(); }
  else if (qs >= 6) { t = "Strong run."; m = `${qs} / ${queue.length}. Confident grasp of the factors.`; fanfare(); }
  else { t = "Quiz complete."; m = `${qs} / ${queue.length}. Worth re-reading the seven factors in the CCEA fact file.`; }
  qResultTitle.textContent = t;
  qResultMsg.textContent = m;
}
document.getElementById("qReset").addEventListener("click", startQuiz);
document.getElementById("quizAgain").addEventListener("click", startQuiz);
