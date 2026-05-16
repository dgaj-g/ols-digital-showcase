// Gaeilge — Siopa Bia (Food & Drink Vocabulary)
// Purely visual demo. No TTS, no phonetic respellings.
// Three modes: Identify (picture → Irish word), Basket (drag items from a Gaeilge shopping list),
// and Memory match (flip pairs of picture + Irish word).

// -------- Data: 14 food/drink items, each with an inline SVG illustration --------
const SVG = {
  aran: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="68" rx="40" ry="18" fill="#C68B4B" stroke="#5C3309" stroke-width="2.5"/>
    <path d="M10,68 Q12,32 50,28 Q88,32 90,68 Z" fill="#E8B97A" stroke="#5C3309" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M26,46 Q30,38 36,38" stroke="#7A4A1A" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M44,38 Q49,30 54,38" stroke="#7A4A1A" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M62,40 Q66,32 72,40" stroke="#7A4A1A" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,
  bainne: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M30,28 L50,14 L70,28 L70,90 L30,90 Z" fill="#F8FAFB" stroke="#1F3A5F" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M30,28 L70,28 L50,40 Z" fill="#D5DDE4" stroke="#1F3A5F" stroke-width="2"/>
    <path d="M50,14 L50,40" stroke="#1F3A5F" stroke-width="2"/>
    <ellipse cx="50" cy="64" rx="14" ry="10" fill="#4A8FD4"/>
    <path d="M42,64 Q50,55 58,64" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="46" cy="60" r="1.5" fill="#FFFFFF"/>
  </svg>`,
  cais: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M12,72 L88,72 L72,30 Z" fill="#F5C843" stroke="#6B5108" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M12,72 L72,30" stroke="#6B5108" stroke-width="2"/>
    <circle cx="38" cy="62" r="5" fill="#C99416"/>
    <circle cx="55" cy="54" r="4" fill="#C99416"/>
    <circle cx="60" cy="65" r="3" fill="#C99416"/>
    <circle cx="46" cy="48" r="2.5" fill="#C99416"/>
  </svg>`,
  ubh: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="56" rx="28" ry="36" fill="#FFF8E1" stroke="#7A6438" stroke-width="2.5"/>
    <ellipse cx="40" cy="42" rx="6" ry="9" fill="#FFFFFF" opacity="0.7"/>
  </svg>`,
  iasc: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M22,50 Q35,25 65,30 Q82,35 88,50 Q82,65 65,70 Q35,75 22,50 Z" fill="#5BA6D8" stroke="#0D2A40" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M22,50 L6,30 L11,50 L6,70 Z" fill="#5BA6D8" stroke="#0D2A40" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="72" cy="46" r="3.5" fill="#FFFFFF" stroke="#0D2A40" stroke-width="1.5"/>
    <circle cx="72" cy="46" r="1.5" fill="#0D2A40"/>
    <path d="M55,40 Q60,45 55,50" stroke="#0D2A40" stroke-width="1.5" fill="none"/>
    <path d="M50,52 Q55,57 50,62" stroke="#0D2A40" stroke-width="1.5" fill="none"/>
    <path d="M62,55 Q67,60 62,65" stroke="#0D2A40" stroke-width="1.5" fill="none"/>
  </svg>`,
  sicin: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="62" cy="38" rx="24" ry="20" fill="#D29A65" stroke="#5C3309" stroke-width="2.5" transform="rotate(-22 62 38)"/>
    <rect x="28" y="58" width="38" height="14" rx="7" fill="#F2E5C8" stroke="#7A6438" stroke-width="2.5" transform="rotate(35 47 65)"/>
    <circle cx="22" cy="82" r="7" fill="#F2E5C8" stroke="#7A6438" stroke-width="2.5"/>
    <path d="M55,28 Q62,22 70,26" stroke="#7A4A1A" stroke-width="1.5" fill="none" opacity="0.5"/>
  </svg>`,
  pratai: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="58" rx="20" ry="14" fill="#BD8A56" stroke="#4D3210" stroke-width="2.2" transform="rotate(-12 32 58)"/>
    <ellipse cx="60" cy="42" rx="22" ry="15" fill="#CFA075" stroke="#4D3210" stroke-width="2.2" transform="rotate(20 60 42)"/>
    <ellipse cx="64" cy="70" rx="18" ry="13" fill="#B3784A" stroke="#4D3210" stroke-width="2.2" transform="rotate(-8 64 70)"/>
    <circle cx="30" cy="56" r="1.5" fill="#4D3210"/>
    <circle cx="36" cy="62" r="1" fill="#4D3210"/>
    <circle cx="60" cy="42" r="1.5" fill="#4D3210"/>
    <circle cx="52" cy="38" r="1" fill="#4D3210"/>
    <circle cx="64" cy="72" r="1.2" fill="#4D3210"/>
  </svg>`,
  caireid: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M38,32 L62,32 L54,90 L46,90 Z" fill="#E68C2A" stroke="#7A3F00" stroke-width="2.5" stroke-linejoin="round"/>
    <line x1="42" y1="46" x2="58" y2="46" stroke="#7A3F00" stroke-width="1.4"/>
    <line x1="44" y1="58" x2="56" y2="58" stroke="#7A3F00" stroke-width="1.4"/>
    <line x1="46" y1="70" x2="54" y2="70" stroke="#7A3F00" stroke-width="1.4"/>
    <line x1="47" y1="80" x2="53" y2="80" stroke="#7A3F00" stroke-width="1.4"/>
    <path d="M40,32 Q32,16 24,12 Q32,22 36,30 Z" fill="#3F8B3F" stroke="#1F5A1F" stroke-width="2"/>
    <path d="M50,32 Q50,12 50,8 Q54,18 54,30 Z" fill="#4FA04F" stroke="#1F5A1F" stroke-width="2"/>
    <path d="M60,32 Q68,16 76,12 Q68,22 64,30 Z" fill="#3F8B3F" stroke="#1F5A1F" stroke-width="2"/>
  </svg>`,
  trata: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="58" r="32" fill="#E74C3C" stroke="#5C0000" stroke-width="2.5"/>
    <path d="M50,28 Q42,22 35,24 Q42,28 46,30 Q40,28 36,30 Q42,34 50,30 Q58,34 64,30 Q60,28 54,30 Q58,28 65,24 Q58,22 50,28 Z" fill="#3F8B3F" stroke="#1F5A1F" stroke-width="1.5"/>
    <ellipse cx="40" cy="50" rx="5" ry="8" fill="#FFFFFF" opacity="0.32"/>
  </svg>`,
  ull: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M28,46 Q28,24 44,28 Q50,16 56,28 Q72,24 72,46 Q72,82 50,84 Q28,82 28,46 Z" fill="#D9362B" stroke="#5C0000" stroke-width="2.5"/>
    <path d="M50,28 Q50,18 56,12" stroke="#5A3A1F" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M52,22 Q60,18 68,21 Q62,26 52,25 Z" fill="#3F8B3F" stroke="#1F5A1F" stroke-width="1.5"/>
    <ellipse cx="40" cy="44" rx="5" ry="10" fill="#FFFFFF" opacity="0.35"/>
  </svg>`,
  oraiste: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="55" r="32" fill="#F39C12" stroke="#5C2900" stroke-width="2.5"/>
    <circle cx="50" cy="55" r="32" fill="none" stroke="#7A3F00" stroke-width="0.8" opacity="0.4"/>
    <line x1="50" y1="23" x2="50" y2="87" stroke="#7A3F00" stroke-width="0.8" opacity="0.45"/>
    <line x1="22" y1="40" x2="78" y2="70" stroke="#7A3F00" stroke-width="0.8" opacity="0.45"/>
    <line x1="22" y1="70" x2="78" y2="40" stroke="#7A3F00" stroke-width="0.8" opacity="0.45"/>
    <path d="M48,23 Q52,16 60,17 Q56,24 50,25 Z" fill="#3F8B3F" stroke="#1F5A1F" stroke-width="1.5"/>
    <ellipse cx="38" cy="44" rx="5" ry="9" fill="#FFFFFF" opacity="0.3"/>
  </svg>`,
  bananai: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M14,42 Q18,24 34,22 Q60,20 82,42 Q90,58 80,72 Q72,60 66,56 Q50,50 36,55 Q24,58 14,55 Q8,48 14,42 Z" fill="#F5D247" stroke="#5C4500" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M22,44 Q42,36 62,40" stroke="#A88B14" stroke-width="1.5" fill="none" opacity="0.55"/>
    <path d="M28,50 Q48,44 66,48" stroke="#A88B14" stroke-width="1" fill="none" opacity="0.4"/>
    <ellipse cx="14" cy="42" rx="5" ry="4" fill="#7A5A2E" stroke="#3D2E18" stroke-width="1.8"/>
  </svg>`,
  tae: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M40,30 Q42,22 38,15" stroke="#A0A0A0" stroke-width="2" fill="none" opacity="0.55" stroke-linecap="round"/>
    <path d="M50,28 Q52,18 48,10" stroke="#A0A0A0" stroke-width="2" fill="none" opacity="0.55" stroke-linecap="round"/>
    <path d="M60,30 Q62,22 58,15" stroke="#A0A0A0" stroke-width="2" fill="none" opacity="0.55" stroke-linecap="round"/>
    <path d="M22,40 L78,40 L72,75 L28,75 Z" fill="#F8FAFB" stroke="#1F3A5F" stroke-width="2.5" stroke-linejoin="round"/>
    <ellipse cx="50" cy="40" rx="25" ry="6" fill="#6B3A0E" stroke="#3D2008" stroke-width="2"/>
    <ellipse cx="50" cy="40" rx="25" ry="6" fill="none" stroke="#1F3A5F" stroke-width="2.5"/>
    <path d="M72,50 Q90,52 90,62 Q90,72 72,68" fill="none" stroke="#1F3A5F" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M20,75 L80,75 L84,85 L16,85 Z" fill="#D5DDE4" stroke="#1F3A5F" stroke-width="2.5" stroke-linejoin="round"/>
  </svg>`,
  uisce: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M30,18 L70,18 L66,88 L34,88 Z" fill="#FFFFFF" fill-opacity="0.65" stroke="#1F3A5F" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M32,42 L68,42 L65,88 L35,88 Z" fill="#5BA6D8" fill-opacity="0.55"/>
    <ellipse cx="50" cy="42" rx="18" ry="3" fill="#5BA6D8" fill-opacity="0.85"/>
    <path d="M30,18 L70,18 L66,88 L34,88 Z" fill="none" stroke="#1F3A5F" stroke-width="2.5" stroke-linejoin="round"/>
    <ellipse cx="50" cy="18" rx="20" ry="3.5" fill="none" stroke="#1F3A5F" stroke-width="2"/>
    <ellipse cx="40" cy="55" rx="3" ry="5" fill="#FFFFFF" opacity="0.7"/>
    <ellipse cx="58" cy="65" rx="2" ry="3" fill="#FFFFFF" opacity="0.5"/>
  </svg>`,
};

const FOODS = [
  { id: "aran",     ga: "arán",     en: "bread",       svg: SVG.aran },
  { id: "bainne",   ga: "bainne",   en: "milk",        svg: SVG.bainne },
  { id: "cais",     ga: "cáis",     en: "cheese",      svg: SVG.cais },
  { id: "ubh",      ga: "ubh",      en: "egg",         svg: SVG.ubh },
  { id: "iasc",     ga: "iasc",     en: "fish",        svg: SVG.iasc },
  { id: "sicin",    ga: "sicín",    en: "chicken",     svg: SVG.sicin },
  { id: "pratai",   ga: "prátaí",   en: "potatoes",    svg: SVG.pratai },
  { id: "caireid",  ga: "cairéad",  en: "carrot",      svg: SVG.caireid },
  { id: "trata",    ga: "tráta",    en: "tomato",      svg: SVG.trata },
  { id: "ull",      ga: "úll",      en: "apple",       svg: SVG.ull },
  { id: "oraiste",  ga: "oráiste",  en: "orange",      svg: SVG.oraiste },
  { id: "bananai",  ga: "banana",   en: "banana",      svg: SVG.bananai },
  { id: "tae",      ga: "tae",      en: "tea",         svg: SVG.tae },
  { id: "uisce",    ga: "uisce",    en: "water",       svg: SVG.uisce },
];

const FOOD_BY_ID = Object.fromEntries(FOODS.map(f => [f.id, f]));

// Shopping lists for the basket mode. Each round is 4 items the shopper needs.
const SHOPPING_ROUNDS = [
  ["aran", "bainne", "ull", "cais"],
  ["tae", "trata", "sicin", "pratai"],
  ["iasc", "oraiste", "ubh", "caireid"],
  ["bananai", "uisce", "cais", "aran"],
];

// -------- Audio (subtle feedback only, no speech) --------
let ac;
function tone(f, ms, type = "sine", g = 0.04) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator();
    const gn = ac.createGain();
    o.type = type; o.frequency.value = f; gn.gain.value = g;
    o.connect(gn); gn.connect(ac.destination); o.start();
    gn.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + ms / 1000);
    o.stop(ac.currentTime + ms / 1000 + 0.02);
  } catch {}
}
function ding()    { tone(720, 80, "triangle", 0.04); setTimeout(() => tone(960, 100, "triangle", 0.04), 70); }
function buzz()    { tone(180, 200, "sawtooth", 0.04); }
function fanfare() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 200, "triangle", 0.04), i * 110)); }

// -------- Utilities --------
function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function sample(arr, n, exclude = []) {
  const pool = arr.filter(x => !exclude.includes(x));
  return shuffle(pool).slice(0, n);
}

// =================================================================
// MODE 1 — Aithin an Bia (Identify): picture shown, pick Irish word
// =================================================================
const idState = { queue: [], idx: 0, correct: 0, wrong: 0 };
const idSvgEl     = document.getElementById("idSvg");
const idOptionsEl = document.getElementById("idOptions");
const idFeedback  = document.getElementById("iFeedback");
const idResultEl  = document.getElementById("idResult");
const idTitleEl   = document.getElementById("idTitle");
const idMsgEl     = document.getElementById("idMsg");
const idIdxEl     = document.getElementById("iIdx");
const idTotalEl   = document.getElementById("iTotal");
const idCorrectEl = document.getElementById("iCorrect");
const idWrongEl   = document.getElementById("iWrong");

function idStart() {
  idState.queue = shuffle(FOODS).slice(0, 10);
  idState.idx = 0;
  idState.correct = 0;
  idState.wrong = 0;
  idTotalEl.textContent = idState.queue.length;
  idCorrectEl.textContent = "0";
  idWrongEl.textContent = "0";
  idResultEl.hidden = true;
  idNextQuestion();
}

function idNextQuestion() {
  if (idState.idx >= idState.queue.length) return idFinish();
  const item = idState.queue[idState.idx];
  idIdxEl.textContent = idState.idx + 1;
  idSvgEl.innerHTML = item.svg;

  // 3 distractors from the rest of the FOODS list
  const distractorIds = sample(FOODS.map(f => f.id), 3, [item.id]);
  const distractors = distractorIds.map(id => FOOD_BY_ID[id]);
  const options = shuffle([item, ...distractors]);

  idOptionsEl.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "id-opt";
    btn.dataset.id = opt.id;
    btn.textContent = opt.ga;
    btn.addEventListener("click", () => idChoose(btn, opt, item));
    idOptionsEl.appendChild(btn);
  });

  idFeedback.innerHTML = "Pick the Irish word that matches the picture.";
  idFeedback.className = "ga-feedback";
}

function idChoose(btn, chosen, correct) {
  // Lock all buttons
  idOptionsEl.querySelectorAll(".id-opt").forEach(b => b.disabled = true);

  if (chosen.id === correct.id) {
    btn.classList.add("correct");
    idState.correct++;
    idCorrectEl.textContent = idState.correct;
    idFeedback.innerHTML = `<strong>Tá an ceart agat — correct.</strong> <em>${correct.ga}</em> means "${correct.en}". <button class="qfb-next" type="button">Ar aghaidh — next &rarr;</button>`;
    idFeedback.className = "ga-feedback ok";
    ding();
  } else {
    btn.classList.add("wrong");
    const correctBtn = idOptionsEl.querySelector(`.id-opt[data-id="${correct.id}"]`);
    if (correctBtn) correctBtn.classList.add("reveal");
    idState.wrong++;
    idWrongEl.textContent = idState.wrong;
    idFeedback.innerHTML = `<strong>Ní hea — not quite.</strong> You picked <em>${chosen.ga}</em> ("${chosen.en}"). The right word for this picture is <em>${correct.ga}</em> — "${correct.en}". <button class="qfb-next" type="button">Ar aghaidh — next &rarr;</button>`;
    idFeedback.className = "ga-feedback bad";
    buzz();
  }
  idFeedback.querySelector(".qfb-next")?.addEventListener("click", () => {
    idState.idx++;
    idNextQuestion();
  });
}

function idFinish() {
  idResultEl.hidden = false;
  const total = idState.queue.length;
  let title, msg;
  if (idState.correct === total) {
    title = "Iontach! — Excellent!";
    msg = `${idState.correct} / ${total} — every Irish word in the right place. Go hiontach.`;
    fanfare();
  } else if (idState.correct >= total - 2) {
    title = "Maith thú — Well done.";
    msg = `${idState.correct} / ${total}. Almost perfect — a quick review of the missed words and you're there.`;
    fanfare();
  } else {
    title = "Coinnigh ort — Keep going.";
    msg = `${idState.correct} / ${total}. Each wrong answer told you the right Irish word — try once more.`;
  }
  idTitleEl.textContent = title;
  idMsgEl.textContent = msg;
}

document.getElementById("idReset").addEventListener("click", idStart);
document.getElementById("idAgain").addEventListener("click", idStart);

// =================================================================
// MODE 2 — Líon an Ciseán (Fill the basket)
// Show a shopping list in Irish; drag the matching items from the shelf.
// =================================================================
const bkState = { round: 0, listIds: [], poolIds: [], placed: [], correct: 0, wrong: 0, selectedId: null };
const bkListEl     = document.getElementById("bkList");
const bkBasketDrop = document.getElementById("bkBasketDrop");
const bkPoolEl     = document.getElementById("bkPool");
const bkFeedback   = document.getElementById("bFeedback");
const bkResultEl   = document.getElementById("bkResult");
const bkTitleEl    = document.getElementById("bkTitle");
const bkMsgEl      = document.getElementById("bkMsg");
const bkRoundEl    = document.getElementById("bRound");
const bkTotalEl    = document.getElementById("bTotal");
const bkCorrectEl  = document.getElementById("bCorrect");
const bkWrongEl    = document.getElementById("bWrong");
bkTotalEl.textContent = SHOPPING_ROUNDS.length;

function bkStart() {
  bkState.round = 0;
  bkState.correct = 0;
  bkState.wrong = 0;
  bkCorrectEl.textContent = "0";
  bkWrongEl.textContent = "0";
  bkResultEl.hidden = true;
  bkLoadRound();
}

function bkLoadRound() {
  bkState.placed = [];
  bkState.selectedId = null;
  bkRoundEl.textContent = bkState.round + 1;
  bkState.listIds = SHOPPING_ROUNDS[bkState.round].slice();
  const distractors = sample(FOODS.map(f => f.id), 4, bkState.listIds);
  bkState.poolIds = shuffle([...bkState.listIds, ...distractors]);
  bkRenderList();
  bkRenderPool();
  bkBasketDrop.innerHTML = "";
  bkFeedback.innerHTML = "Drag (or tap an item then tap the basket) each item on your <em>liosta siopadóireachta</em> into the basket. Items <em>not</em> on the list will be sent back.";
  bkFeedback.className = "ga-feedback";
  bkResultEl.hidden = true;
}

function bkRenderList() {
  bkListEl.innerHTML = "";
  bkState.listIds.forEach((id, i) => {
    const f = FOOD_BY_ID[id];
    const li = document.createElement("li");
    li.dataset.id = id;
    if (bkState.placed.includes(id)) li.classList.add("done");
    // List shows the Irish word ONLY — the player must know what it
    // means before they can pick the right picture off the shelf.
    li.innerHTML = `
      <span class="bk-num">${i + 1}</span>
      <span class="bk-word">${f.ga}</span>
      <span class="bk-check">${bkState.placed.includes(id) ? "&#x2713;" : ""}</span>
    `;
    bkListEl.appendChild(li);
  });
}

function bkRenderPool() {
  bkPoolEl.innerHTML = "";
  bkState.poolIds.forEach(id => {
    const f = FOOD_BY_ID[id];
    const card = document.createElement("div");
    card.className = "food-card";
    card.draggable = true;
    card.dataset.id = id;
    // Shelf cards are PICTURE-ONLY — the player must recognise the picture
    // and match it against the Irish word on the shopping list.
    card.innerHTML = `<div class="food-svg">${f.svg}</div>`;
    if (bkState.placed.includes(id)) card.classList.add("used");

    card.addEventListener("dragstart", e => {
      if (bkState.placed.includes(id)) { e.preventDefault(); return; }
      card.classList.add("dragging");
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));

    card.addEventListener("click", () => {
      if (bkState.placed.includes(id)) return;
      bkPoolEl.querySelectorAll(".food-card.selected").forEach(x => x.classList.remove("selected"));
      if (bkState.selectedId === id) {
        bkState.selectedId = null;
        bkFeedback.textContent = "Selection cleared.";
        bkFeedback.className = "ga-feedback";
        return;
      }
      bkState.selectedId = id;
      card.classList.add("selected");
      // Don't reveal the Irish word here — that would defeat the point.
      bkFeedback.innerHTML = `Item selected — now tap the basket to place it.`;
      bkFeedback.className = "ga-feedback";
    });

    bkPoolEl.appendChild(card);
  });
}

bkBasketDrop.addEventListener("dragover", e => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  bkBasketDrop.classList.add("over");
});
bkBasketDrop.addEventListener("dragleave", () => bkBasketDrop.classList.remove("over"));
bkBasketDrop.addEventListener("drop", e => {
  e.preventDefault();
  bkBasketDrop.classList.remove("over");
  const id = e.dataTransfer.getData("text/plain");
  if (id) bkAttempt(id);
});
bkBasketDrop.addEventListener("click", () => {
  if (bkState.selectedId) bkAttempt(bkState.selectedId);
});

function bkAttempt(id) {
  if (bkState.placed.includes(id)) return;
  const f = FOOD_BY_ID[id];
  const onList = bkState.listIds.includes(id);

  if (onList) {
    bkState.placed.push(id);
    bkState.correct++;
    bkCorrectEl.textContent = bkState.correct;
    const card = document.createElement("div");
    card.className = "food-card in-basket";
    card.innerHTML = `<div class="food-svg">${f.svg}</div><div class="food-label">${f.ga}</div>`;
    bkBasketDrop.appendChild(card);
    bkFeedback.innerHTML = `<strong>Maith thú —</strong> <em>${f.ga}</em> ("${f.en}") was on the list.`;
    bkFeedback.className = "ga-feedback ok";
    ding();
    bkRenderList();
    bkRenderPool();
    if (bkState.placed.length === bkState.listIds.length) {
      setTimeout(bkFinishRound, 450);
    }
  } else {
    bkState.wrong++;
    bkWrongEl.textContent = bkState.wrong;
    const card = bkPoolEl.querySelector(`.food-card[data-id="${id}"]`);
    if (card) {
      card.classList.add("flash-bad");
      setTimeout(() => card.classList.remove("flash-bad"), 380);
    }
    bkFeedback.innerHTML = `<strong>Ní hea —</strong> <em>${f.ga}</em> ("${f.en}") isn't on the list. Leave it on the shelf.`;
    bkFeedback.className = "ga-feedback bad";
    buzz();
  }
  bkState.selectedId = null;
  bkPoolEl.querySelectorAll(".food-card.selected").forEach(x => x.classList.remove("selected"));
}

function bkFinishRound() {
  bkResultEl.hidden = false;
  const isLast = bkState.round === SHOPPING_ROUNDS.length - 1;
  bkTitleEl.textContent = isLast ? "Críochnaithe! — Finished!" : "Babhta críochnaithe — Round done.";
  bkMsgEl.textContent = isLast
    ? `All ${SHOPPING_ROUNDS.length} shopping lists complete. ${bkState.correct} correct items, ${bkState.wrong} wrong attempts overall.`
    : `Shopping list ${bkState.round + 1} done. ${bkState.wrong === 0 ? "Perfect this round — no wrong items." : "Keep going."}`;
  document.getElementById("bkAgain").textContent = isLast ? "Tosaigh arís — Start over" : "Babhta nua — Next round";
  if (bkState.wrong === 0) fanfare();
}

document.getElementById("bkReset").addEventListener("click", bkStart);
document.getElementById("bkAgain").addEventListener("click", () => {
  if (bkState.round >= SHOPPING_ROUNDS.length - 1) {
    bkStart();
  } else {
    bkState.round++;
    bkLoadRound();
  }
});

// =================================================================
// MODE 3 — Cluiche Cuimhne (Memory match)
// Flip pairs: picture card matches its Irish word card.
// =================================================================
const memState = { cards: [], flipped: [], matched: 0, tries: 0, locked: false };
const memoryGrid = document.getElementById("memoryGrid");
const mPairsEl   = document.getElementById("mPairs");
const mTotalPairs= document.getElementById("mTotalPairs");
const mTriesEl   = document.getElementById("mTries");
const mFeedback  = document.getElementById("mFeedback");
const memResult  = document.getElementById("memoryResult");
const mTitleEl   = document.getElementById("mTitle");
const mMsgEl     = document.getElementById("mMsg");
const MEMORY_PAIRS = 8;

function memStart() {
  memState.matched = 0;
  memState.tries = 0;
  memState.flipped = [];
  memState.locked = false;
  mPairsEl.textContent = "0";
  mTotalPairs.textContent = MEMORY_PAIRS;
  mTriesEl.textContent = "0";
  memResult.hidden = true;
  mFeedback.innerHTML = "Flip two cards at a time — match each picture with its Irish word.";
  mFeedback.className = "ga-feedback";

  const picks = shuffle(FOODS).slice(0, MEMORY_PAIRS);
  const cards = [];
  picks.forEach(f => {
    cards.push({ pairId: f.id, type: "pic", food: f });
    cards.push({ pairId: f.id, type: "word", food: f });
  });
  memState.cards = shuffle(cards);

  memoryGrid.innerHTML = "";
  memState.cards.forEach((c, i) => {
    const card = document.createElement("div");
    card.className = "mem-card";
    card.dataset.idx = i;
    const frontHtml = c.type === "pic"
      ? `<div class="mem-face mem-front">${c.food.svg}</div>`
      : `<div class="mem-face mem-front word">${c.food.ga}</div>`;
    card.innerHTML = `
      <div class="mem-inner">
        <div class="mem-face mem-back">?</div>
        ${frontHtml}
      </div>
    `;
    card.addEventListener("click", () => memFlip(i, card));
    memoryGrid.appendChild(card);
  });
}

function memFlip(idx, card) {
  if (memState.locked) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;
  card.classList.add("flipped");
  memState.flipped.push({ idx, card });
  if (memState.flipped.length === 2) {
    memState.tries++;
    mTriesEl.textContent = memState.tries;
    const [a, b] = memState.flipped;
    const ca = memState.cards[a.idx];
    const cb = memState.cards[b.idx];
    if (ca.pairId === cb.pairId && ca.type !== cb.type) {
      a.card.classList.add("matched");
      b.card.classList.add("matched");
      memState.matched++;
      mPairsEl.textContent = memState.matched;
      mFeedback.innerHTML = `<strong>Maith thú —</strong> <em>${ca.food.ga}</em> means "${ca.food.en}".`;
      mFeedback.className = "ga-feedback ok";
      ding();
      memState.flipped = [];
      if (memState.matched === MEMORY_PAIRS) setTimeout(memFinish, 450);
    } else {
      memState.locked = true;
      a.card.classList.add("mismatch");
      b.card.classList.add("mismatch");
      mFeedback.innerHTML = `Not a match — try again.`;
      mFeedback.className = "ga-feedback bad";
      buzz();
      setTimeout(() => {
        a.card.classList.remove("flipped", "mismatch");
        b.card.classList.remove("flipped", "mismatch");
        memState.flipped = [];
        memState.locked = false;
      }, 900);
    }
  }
}

function memFinish() {
  memResult.hidden = false;
  mTitleEl.textContent = "Críochnaithe! — Finished!";
  mMsgEl.textContent = `All ${MEMORY_PAIRS} pairs matched in ${memState.tries} tries. ${memState.tries <= MEMORY_PAIRS + 2 ? "Iontach — excellent memory." : "Try again to beat your score."}`;
  fanfare();
}

document.getElementById("mReset").addEventListener("click", memStart);
document.getElementById("mAgain").addEventListener("click", memStart);

// =================================================================
// Tabs
// =================================================================
const tabBtns = {
  identify: document.getElementById("tabIdentify"),
  basket:   document.getElementById("tabBasket"),
  memory:   document.getElementById("tabMemory"),
};
const panes = {
  identify: document.getElementById("paneIdentify"),
  basket:   document.getElementById("paneBasket"),
  memory:   document.getElementById("paneMemory"),
};
Object.entries(tabBtns).forEach(([key, btn]) => {
  btn.addEventListener("click", () => {
    Object.values(tabBtns).forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    Object.entries(panes).forEach(([k, p]) => p.hidden = k !== key);
  });
});

// Boot
idStart();
bkStart();
memStart();
