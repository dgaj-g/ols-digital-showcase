// Sports Science — Match the Plate to the Sport
// Pick an athlete type (endurance / strength / team), build a day's food plan,
// macro % chart compares yours to the recommended split for that athlete.

const ATHLETES = [
  {
    id: "endurance",
    tag: "Endurance",
    name: "Marathon runner",
    need: "Carb 60% · Prot 15% · Fat 25%",
    macroTarget: { carb: 60, prot: 15, fat: 25 },
    energy: 3000,
    why: "Endurance athletes <strong>burn predominantly carbohydrate</strong> during long efforts. High-carb diets maximise glycogen stores."
  },
  {
    id: "strength",
    tag: "Strength",
    name: "Powerlifter",
    need: "Carb 45% · Prot 30% · Fat 25%",
    macroTarget: { carb: 45, prot: 30, fat: 25 },
    energy: 3200,
    why: "Strength athletes need <strong>higher protein</strong> (1.6–2.2 g/kg) for muscle repair and hypertrophy, with carbs to fuel lifts."
  },
  {
    id: "team",
    tag: "Team sport",
    name: "Football player",
    need: "Carb 55% · Prot 18% · Fat 27%",
    macroTarget: { carb: 55, prot: 18, fat: 27 },
    energy: 2800,
    why: "Team-sport athletes do <strong>repeated high-intensity bursts</strong> — they need carbs for fuel but also enough protein for recovery between sessions."
  },
];

// Foods — name, kcal, carb (g), protein (g), fat (g)
const FOODS = [
  // High-carb
  { n: "Porridge (large bowl)",  e: 320, c: 56, p: 12, f: 6 },
  { n: "Wholegrain pasta bowl",  e: 480, c: 88, p: 16, f: 5 },
  { n: "Brown rice bowl",        e: 420, c: 78, p: 10, f: 4 },
  { n: "Banana",                 e: 90,  c: 23, p: 1,  f: 0 },
  { n: "Sweet potato",           e: 200, c: 44, p: 4,  f: 0 },
  { n: "Recovery sports drink",  e: 160, c: 38, p: 2,  f: 0 },
  // High-protein
  { n: "Grilled chicken breast", e: 280, c: 0,  p: 53, f: 6 },
  { n: "Salmon fillet",          e: 320, c: 0,  p: 32, f: 22 },
  { n: "Tofu stir-fry",          e: 360, c: 18, p: 28, f: 18 },
  { n: "Protein shake (whey)",   e: 220, c: 12, p: 36, f: 4 },
  { n: "Greek yogurt (large)",   e: 260, c: 16, p: 22, f: 12 },
  { n: "Eggs × 4 (scrambled)",   e: 280, c: 2,  p: 24, f: 20 },
  // Balanced / mixed
  { n: "Tuna pasta salad",       e: 480, c: 56, p: 30, f: 14 },
  { n: "Chicken &amp; rice bowl",e: 620, c: 70, p: 38, f: 18 },
  { n: "Beef stir-fry",          e: 540, c: 40, p: 32, f: 26 },
  { n: "Bagel &amp; cream cheese", e: 360, c: 50, p: 12, f: 12 },
  // Higher-fat
  { n: "Nut butter (3 tbsp)",    e: 280, c: 12, p: 10, f: 24 },
  { n: "Avocado on toast",       e: 380, c: 36, p: 12, f: 22 },
  { n: "Almond handful",         e: 180, c: 6,  p: 6,  f: 16 },
];

let athlete = null;
let plan = [];

const athleteRow = document.getElementById("athleteRow");
const athleteName = document.getElementById("athleteName");
const totalE = document.getElementById("totalE");
const matchN = document.getElementById("matchN");
const planList = document.getElementById("planList");
const foodGrid = document.getElementById("foodGrid");
const macroRows = document.getElementById("macroRows");
const chartNote = document.getElementById("chartNote");

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

// ---- Athletes
ATHLETES.forEach(a => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "athlete-card";
  b.dataset.id = a.id;
  b.innerHTML = `<span class="athlete-tag">${a.tag}</span><div class="athlete-name">${a.name}</div><div class="athlete-need">${a.need}</div>`;
  b.addEventListener("click", () => {
    document.querySelectorAll(".athlete-card.active").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    athlete = a;
    athleteName.textContent = a.name;
    tick();
    refresh();
  });
  athleteRow.appendChild(b);
});

// ---- Foods
FOODS.forEach((f, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "food-card";
  b.dataset.idx = i;
  b.innerHTML = `<div class="food-name">${f.n}</div><div class="food-macros">${f.e} kcal · C${f.c} P${f.p} F${f.f}</div>`;
  b.addEventListener("click", () => {
    plan.push(i);
    tick();
    refresh();
  });
  foodGrid.appendChild(b);
});

// ---- Plan render
function renderPlan() {
  if (plan.length === 0) {
    planList.innerHTML = `<p class="plan-empty">Empty plan — tap a food card.</p>`;
    return;
  }
  planList.innerHTML = "";
  plan.forEach((fi, j) => {
    const chip = document.createElement("button");
    chip.type = "button"; chip.className = "placed-chip";
    chip.textContent = FOODS[fi].n;
    chip.addEventListener("click", () => { plan.splice(j, 1); refresh(); });
    planList.appendChild(chip);
  });
}

// ---- Macro chart
function renderMacros() {
  let kcal = 0, c = 0, p = 0, f = 0;
  plan.forEach(i => {
    kcal += FOODS[i].e; c += FOODS[i].c; p += FOODS[i].p; f += FOODS[i].f;
  });
  totalE.textContent = `${kcal} kcal`;
  // Convert grams to % of kcal (carb=4 kcal/g, prot=4, fat=9)
  const macroKcal = c*4 + p*4 + f*9;
  const pct = {
    carb: macroKcal ? Math.round((c*4 / macroKcal) * 100) : 0,
    prot: macroKcal ? Math.round((p*4 / macroKcal) * 100) : 0,
    fat:  macroKcal ? Math.round((f*9 / macroKcal) * 100) : 0,
  };
  macroRows.innerHTML = "";
  if (!athlete) { matchN.textContent = "— %"; return; }
  const target = athlete.macroTarget;
  ["carb","prot","fat"].forEach(k => {
    const tp = target[k];
    const myp = pct[k];
    const row = document.createElement("div");
    row.className = "macro-row";
    row.innerHTML = `
      <div class="macro-head">
        <span class="macro-name ${k}">${k === "carb" ? "Carbohydrate" : k === "prot" ? "Protein" : "Fat"}</span>
        <span class="macro-pct">${myp}% <span style="color:#94A3B8">/ target ${tp}%</span></span>
      </div>
      <div class="macro-track">
        <div class="macro-fill ${k}" style="width:${myp}%"></div>
        <div class="macro-target" style="left:${tp}%"></div>
      </div>
    `;
    macroRows.appendChild(row);
  });
  // overall match score: 100 - sum of absolute differences (clamped to 0)
  if (plan.length === 0) {
    matchN.textContent = "— %";
    chartNote.innerHTML = `Pick an athlete and add some food. <strong>${athlete.why}</strong>`;
    chartNote.className = "chart-note";
    return;
  }
  const dC = Math.abs(pct.carb - target.carb);
  const dP = Math.abs(pct.prot - target.prot);
  const dF = Math.abs(pct.fat  - target.fat);
  const totalDelta = dC + dP + dF;
  const score = Math.max(0, 100 - totalDelta * 1.2);
  matchN.textContent = `${Math.round(score)} %`;
  // Advice
  const off = [];
  if (dC > 8) off.push(`carbs ${pct.carb > target.carb ? "high" : "low"} for ${athlete.tag.toLowerCase()}`);
  if (dP > 6) off.push(`protein ${pct.prot > target.prot ? "high" : "low"}`);
  if (dF > 6) off.push(`fat ${pct.fat  > target.fat  ? "high" : "low"}`);
  if (off.length === 0) {
    chartNote.innerHTML = `<strong>Strong plan for a ${athlete.name.toLowerCase()}.</strong> ${athlete.why}`;
    chartNote.className = "chart-note ok";
    if (score > 92) ding();
  } else {
    chartNote.innerHTML = `<strong>Adjust:</strong> ${off.join("; ")}. ${athlete.why}`;
    chartNote.className = "chart-note bad";
  }
}

function refresh() { renderPlan(); renderMacros(); }
document.getElementById("btnClear").addEventListener("click", () => { plan = []; refresh(); tick(); });

refresh();
