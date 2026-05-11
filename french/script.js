// French — Au café simulator
// Uses Web Speech API for French pronunciation. No external files.

// Inline SVG icons — hand-drawn monochrome, burgundy stroke
const ICONS = {
  cup:    `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6F1D2E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h14v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9z"/><path d="M17 11h2a2 2 0 0 1 0 4h-2"/><path d="M7 5c0 1.5 2 1.5 2 3M11 5c0 1.5 2 1.5 2 3"/></svg>`,
  teapot: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6F1D2E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a6 6 0 0 1 12 0v3H4z"/><path d="M16 11l4-2v6l-4-2"/><path d="M10 6V4"/></svg>`,
  cocoa:  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6F1D2E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 10h12v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M17 12h2a2 2 0 0 1 0 4h-2"/><path d="M8 7c0-1 2-1 2-2M12 7c0-1 2-1 2-2"/><path d="M8 14h6"/></svg>`,
  orange: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6F1D2E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="7"/><path d="M12 4l-1 2 1 0 1 0z" fill="#6F1D2E"/><path d="M5 13h14M12 6v14"/></svg>`,
  lemon:  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6F1D2E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8 C 9 5, 15 5, 18 8 C 21 11, 21 15, 18 18 C 15 21, 9 21, 6 18 C 3 15, 3 11, 6 8 Z"/><path d="M8 12h8M12 8v8"/></svg>`,
  water:  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6F1D2E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10l-1 4v11a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V8z"/><path d="M9 12h6"/></svg>`,
  croissant: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6F1D2E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15 C 6 6, 18 6, 21 15 L 17 17 C 16 13, 8 13, 7 17 Z"/><path d="M9 14l1 2M12 13l1 2M15 14l1 2"/></svg>`,
  bread:  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6F1D2E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12 C 3 8, 8 6, 12 6 C 16 6, 21 8, 21 12 L 19 16 H 5 Z"/><path d="M8 10l1 2M12 9v3M16 10l-1 2"/></svg>`,
  crepe:  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6F1D2E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14 C 6 11, 18 11, 21 14"/><path d="M3 16 C 6 13, 18 13, 21 16"/><path d="M4 17 C 7 18, 17 18, 20 17"/><circle cx="10" cy="12" r="0.6" fill="#6F1D2E"/><circle cx="14" cy="13" r="0.6" fill="#6F1D2E"/></svg>`,
  sandwich: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6F1D2E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="16" height="3" rx="1"/><rect x="4" y="14" width="16" height="3" rx="1"/><path d="M6 10c2 2 4 2 6 0s4 2 6 0M6 13c2-2 4-2 6 0s4-2 6 0"/></svg>`,
  pie:    `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6F1D2E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16 L 12 5 L 21 16 Z"/><path d="M7 16 L 12 11 L 17 16"/><path d="M3 16 H 21 V 19 H 3 Z"/></svg>`,
  icecream: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6F1D2E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 11 L 12 21 L 16 11 Z"/><circle cx="12" cy="9" r="4"/><path d="M9 11h6"/></svg>`,
};

const MENU = {
  drinks: [
    { fr: "un café",            en: "a coffee",          price: 2.50, icon: ICONS.cup },
    { fr: "un thé",             en: "a tea",             price: 2.20, icon: ICONS.teapot },
    { fr: "un chocolat chaud",  en: "a hot chocolate",   price: 3.20, icon: ICONS.cocoa },
    { fr: "un jus d'orange",    en: "an orange juice",   price: 3.00, icon: ICONS.orange },
    { fr: "une limonade",       en: "a lemonade",        price: 2.80, icon: ICONS.lemon },
    { fr: "une eau minérale",   en: "a mineral water",   price: 1.80, icon: ICONS.water },
  ],
  food: [
    { fr: "un croissant",          en: "a croissant",          price: 1.80, icon: ICONS.croissant },
    { fr: "un pain au chocolat",   en: "a chocolate pastry",   price: 2.20, icon: ICONS.bread },
    { fr: "une crêpe",             en: "a pancake",            price: 3.50, icon: ICONS.crepe },
    { fr: "un sandwich",           en: "a sandwich",           price: 4.20, icon: ICONS.sandwich },
    { fr: "une part de tarte",     en: "a slice of tart",      price: 3.80, icon: ICONS.pie },
    { fr: "une glace",             en: "an ice cream",         price: 3.00, icon: ICONS.icecream },
  ],
};

const drinksList = document.getElementById("drinksList");
const foodList   = document.getElementById("foodList");
const tray       = document.getElementById("tray");
const orderText  = document.getElementById("orderText");
const totalValue = document.getElementById("totalValue");
const payBtn     = document.getElementById("payBtn");
const phraseTog  = document.getElementById("phrasePolite");
const speakBtn   = document.getElementById("speakOrder");
const barmanBub  = document.getElementById("barmanBubble");

let order = []; // [{fr, en, price, icon, qty}]
let useJeVoudrais = true;

// ---- speech ----
let voices = [];
function loadVoices() {
  voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
}
if (window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}
function pickFrenchVoice() {
  return voices.find(v => v.lang && v.lang.toLowerCase().startsWith("fr"))
      || voices.find(v => v.name && /french/i.test(v.name))
      || null;
}
function speak(text, rate = 0.95) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fr-FR";
  const v = pickFrenchVoice();
  if (v) u.voice = v;
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

// fallback audio cue (small chime)
let actx;
function chime() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(); const g = actx.createGain();
    o.type = "triangle"; o.frequency.value = 880;
    g.gain.value = 0.06; o.connect(g); g.connect(actx.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.18);
    o.stop(actx.currentTime + 0.22);
  } catch {}
}

// ---- menu render ----
function renderMenu(arr, into) {
  into.innerHTML = "";
  arr.forEach(item => {
    const li = document.createElement("li");
    li.className = "menu-item";
    li.innerHTML = `
      <span class="menu-icon" aria-hidden="true">${item.icon}</span>
      <div class="menu-item-text">
        <span class="menu-item-fr">${item.fr}</span>
        <span class="menu-item-en">${item.en}</span>
      </div>
      <span class="menu-item-price">${item.price.toFixed(2).replace('.', ',')} €</span>
      <button class="speak-icon" type="button" aria-label="Hear ${item.fr}">▶</button>
    `;
    li.querySelector(".speak-icon").addEventListener("click", e => {
      e.stopPropagation();
      speak(item.fr);
    });
    li.addEventListener("click", () => addToOrder(item));
    into.appendChild(li);
  });
}

function addToOrder(item) {
  const existing = order.find(o => o.fr === item.fr);
  if (existing) existing.qty++;
  else order.push({ ...item, qty: 1 });
  speak(item.fr);
  redraw();
  setBarman(pickEncouragement(), pickEncouragementEn());
}
function removeFromOrder(fr) {
  order = order.filter(o => o.fr !== fr);
  redraw();
}

function frenchListJoin(items) {
  // ["un café", "un croissant"] -> "un café et un croissant"
  if (items.length === 0) return "…";
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(", ") + " et " + items[items.length - 1];
}

function buildOrderText() {
  const parts = order.flatMap(o => Array.from({ length: o.qty }, () => o.fr));
  if (parts.length === 0) return "…";
  const stem = useJeVoudrais ? "Je voudrais " : "Un ";
  const joined = frenchListJoin(parts);
  return (useJeVoudrais ? "Je voudrais " : "") + joined + ", s'il vous plaît.";
}

function redraw() {
  // tray chips
  if (order.length === 0) {
    tray.innerHTML = `<li class="tray-empty">Your tray is empty. Tap a menu item to start.</li>`;
  } else {
    tray.innerHTML = "";
    order.forEach(o => {
      const chip = document.createElement("li");
      chip.className = "tray-chip";
      chip.innerHTML = `
        <span class="menu-icon" aria-hidden="true">${o.icon}</span>
        <span>${o.fr}</span>
        ${o.qty > 1 ? `<span class="qty">×${o.qty}</span>` : ""}
        <button class="remove" aria-label="Remove ${o.fr}">×</button>
      `;
      chip.querySelector(".remove").addEventListener("click", () => removeFromOrder(o.fr));
      tray.appendChild(chip);
    });
  }
  // running total
  const total = order.reduce((t, o) => t + o.price * o.qty, 0);
  totalValue.textContent = `${total.toFixed(2).replace('.', ',')} €`;
  payBtn.disabled = order.length === 0;
  // phrase
  orderText.textContent = buildOrderText();
}

function setBarman(fr, en, options = {}) {
  barmanBub.classList.remove("shake");
  if (options.shake) {
    void barmanBub.offsetWidth;
    barmanBub.classList.add("shake");
  }
  barmanBub.innerHTML = `<p class="bubble-fr">${fr}</p><p class="bubble-en">${en}</p>`;
}

const greetings = [
  ["Très bien !",          "Very good!"],
  ["Excellent choix.",     "Excellent choice."],
  ["Mmm, délicieux.",      "Mmm, delicious."],
  ["Bien sûr.",            "Of course."],
  ["Avec plaisir.",        "With pleasure."],
];
function pickEncouragement()   { return greetings[Math.floor(Math.random() * greetings.length)][0]; }
function pickEncouragementEn() { return greetings[Math.floor(Math.random() * greetings.length)][1]; }

phraseTog.addEventListener("click", () => {
  useJeVoudrais = !useJeVoudrais;
  phraseTog.dataset.on = useJeVoudrais ? "true" : "false";
  phraseTog.textContent = useJeVoudrais ? "Je voudrais" : "(no opener)";
  redraw();
});

speakBtn.addEventListener("click", () => {
  if (order.length === 0) {
    speak("Bonjour. Que désirez-vous ?");
    return;
  }
  speak(buildOrderText(), 0.92);
});

payBtn.addEventListener("click", () => {
  const total = order.reduce((t, o) => t + o.price * o.qty, 0);
  const totalStr = total.toFixed(2).replace('.', ',');
  const fr = `Voilà ${totalStr} euros. Merci, et bonne journée !`;
  const en = `That's ${totalStr} euros. Thank you, and have a good day!`;
  setBarman(fr, en, { shake: false });
  speak(fr, 0.94);
  chime();
  // reset after a beat
  setTimeout(() => {
    order = [];
    redraw();
    setBarman("Bonjour ! Que désirez-vous ?", "Hello! What would you like?");
  }, 4200);
});

renderMenu(MENU.drinks, drinksList);
renderMenu(MENU.food, foodList);
redraw();
