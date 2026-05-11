// HSC — Build a Balanced Day
// Pupils tap a food, then tap a meal to add it. Live chart shows daily totals
// against RDA. A "balance score" reflects how many of the 6 nutrients land
// within a healthy range.

// Foods: name, energy (kcal), protein (g), carbs (g), fat (g), fibre (g), salt (g)
const FOODS = [
  // Breakfast / morning
  { n: "Porridge with milk",       e: 220, p: 8,  c: 35, f: 5,  fi: 4, s: 0.3 },
  { n: "Wholegrain toast (2)",     e: 180, p: 6,  c: 30, f: 3,  fi: 5, s: 0.6 },
  { n: "Cornflakes & milk",        e: 210, p: 7,  c: 42, f: 3,  fi: 1, s: 0.7 },
  { n: "Scrambled eggs (2)",       e: 200, p: 14, c: 1,  f: 14, fi: 0, s: 0.4 },
  { n: "Bacon & sausage roll",     e: 480, p: 18, c: 32, f: 28, fi: 1, s: 2.3 },
  { n: "Banana",                   e: 90,  p: 1,  c: 23, f: 0,  fi: 3, s: 0.0 },
  { n: "Greek yogurt & berries",   e: 160, p: 12, c: 18, f: 4,  fi: 2, s: 0.1 },

  // Lunch
  { n: "Chicken salad sandwich",   e: 380, p: 22, c: 38, f: 14, fi: 4, s: 1.8 },
  { n: "Tuna pasta salad",         e: 420, p: 24, c: 48, f: 12, fi: 5, s: 1.2 },
  { n: "Jacket potato & beans",    e: 410, p: 14, c: 76, f: 4,  fi: 11, s: 1.5 },
  { n: "Vegetable soup & bread",   e: 290, p: 8,  c: 42, f: 8,  fi: 6, s: 1.6 },
  { n: "Cheese pizza slice",       e: 320, p: 13, c: 36, f: 12, fi: 2, s: 1.4 },
  { n: "Mixed leaf side salad",    e: 60,  p: 2,  c: 6,  f: 3,  fi: 3, s: 0.2 },

  // Dinner
  { n: "Grilled chicken & veg",    e: 460, p: 38, c: 30, f: 16, fi: 7, s: 1.0 },
  { n: "Salmon, potato & broccoli",e: 520, p: 36, c: 38, f: 22, fi: 6, s: 0.9 },
  { n: "Chicken curry & rice",     e: 680, p: 30, c: 72, f: 26, fi: 4, s: 2.4 },
  { n: "Fish & chips",             e: 820, p: 26, c: 78, f: 42, fi: 5, s: 2.6 },
  { n: "Spaghetti bolognese",      e: 620, p: 30, c: 70, f: 22, fi: 6, s: 1.8 },
  { n: "Vegetable stir-fry",       e: 380, p: 12, c: 48, f: 14, fi: 8, s: 1.2 },

  // Snacks & drinks
  { n: "Apple",                    e: 60,  p: 0,  c: 14, f: 0,  fi: 3, s: 0.0 },
  { n: "Crisps (small)",           e: 180, p: 2,  c: 18, f: 10, fi: 1, s: 0.6 },
  { n: "Chocolate bar",            e: 240, p: 3,  c: 28, f: 13, fi: 1, s: 0.1 },
  { n: "Handful of nuts",          e: 180, p: 6,  c: 6,  f: 16, fi: 2, s: 0.0 },
  { n: "Fizzy drink (330ml)",      e: 140, p: 0,  c: 35, f: 0,  fi: 0, s: 0.0 },
  { n: "Glass of milk",            e: 120, p: 8,  c: 12, f: 5,  fi: 0, s: 0.1 },
];
// RDA — female 14-18 (NHS Eatwell-ish)
const RDA = {
  e:  { name: "Energy",  unit: "kcal", target: 2000, band: [1800, 2200], cap: 3000 },
  p:  { name: "Protein", unit: "g",    target: 45,   band: [40, 70],    cap: 120 },
  c:  { name: "Carbs",   unit: "g",    target: 250,  band: [220, 290],  cap: 400 },
  f:  { name: "Fat",     unit: "g",    target: 70,   band: [40, 70],    cap: 100, ceiling: true },
  fi: { name: "Fibre",   unit: "g",    target: 30,   band: [25, 35],    cap: 50  },
  s:  { name: "Salt",    unit: "g",    target: 6,    band: [3, 6],      cap: 10,  ceiling: true },
};
const NUTRIENTS = ["e", "p", "c", "f", "fi", "s"];

// ---- DOM
const slots = {
  breakfast: document.getElementById("slot-breakfast"),
  lunch:     document.getElementById("slot-lunch"),
  dinner:    document.getElementById("slot-dinner"),
  snack:     document.getElementById("slot-snack"),
};
const foodGrid = document.getElementById("foodGrid");
const itemCount = document.getElementById("itemCount");
const energyVal = document.getElementById("energyVal");
const balanceVal = document.getElementById("balanceVal");
const chartRows = document.getElementById("chartRows");
const chartAdvice = document.getElementById("chartAdvice");

let plan = []; // {food, meal}
let selectedFoodIdx = null;

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
function tick() { tone(720, 40, "triangle", 0.04); }
function ding() { tone(660, 80, "triangle", 0.05); setTimeout(()=>tone(990,100,"triangle",0.05),70); }

function renderFoodBank() {
  foodGrid.innerHTML = "";
  FOODS.forEach((f, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "food-card" + (selectedFoodIdx === i ? " selected" : "");
    b.innerHTML = `
      <div class="food-name">${f.n}</div>
      <div class="food-macros">${f.e} kcal · P${f.p} C${f.c} F${f.f} Fi${f.fi} S${f.s}g</div>
    `;
    b.addEventListener("click", () => {
      selectedFoodIdx = (selectedFoodIdx === i ? null : i);
      renderFoodBank();
      tick();
    });
    foodGrid.appendChild(b);
  });
}

function renderPlan() {
  ["breakfast","lunch","dinner","snack"].forEach(meal => {
    const slot = slots[meal];
    slot.innerHTML = "";
    const items = plan.filter(p => p.meal === meal);
    if (items.length === 0) {
      slot.innerHTML = `<span class="meal-empty">Empty — tap a food card then tap here.</span>`;
    } else {
      items.forEach((it, j) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "placed";
        chip.textContent = it.food.n;
        chip.title = "Remove from plan";
        chip.addEventListener("click", () => {
          const globalIdx = plan.indexOf(it);
          if (globalIdx >= 0) { plan.splice(globalIdx, 1); refresh(); tick(); }
        });
        slot.appendChild(chip);
      });
    }
  });
}

Object.entries(slots).forEach(([meal, slot]) => {
  slot.parentElement.addEventListener("click", e => {
    if (selectedFoodIdx === null) return;
    if (e.target.closest(".placed")) return;
    plan.push({ food: FOODS[selectedFoodIdx], meal });
    selectedFoodIdx = null;
    renderFoodBank();
    refresh();
    ding();
  });
});

function renderChart() {
  // sums
  const totals = {};
  NUTRIENTS.forEach(k => totals[k] = 0);
  plan.forEach(p => NUTRIENTS.forEach(k => totals[k] += p.food[k]));
  itemCount.textContent = plan.length;
  energyVal.textContent = `${totals.e} kcal`;

  chartRows.innerHTML = "";
  let inBand = 0;
  NUTRIENTS.forEach(k => {
    const v = totals[k];
    const r = RDA[k];
    const pct = Math.min(100, (v / r.cap) * 100);
    const bandLeft = (r.band[0] / r.cap) * 100;
    const bandWidth = ((r.band[1] - r.band[0]) / r.cap) * 100;
    const within = v >= r.band[0] && v <= r.band[1];
    const overCeiling = r.ceiling && v > r.band[1];
    if (within && plan.length > 0) inBand++;
    const row = document.createElement("div");
    row.className = "chart-row";
    row.innerHTML = `
      <div class="chart-row-head"><span class="chart-row-name">${r.name}</span><span class="chart-row-val">${v.toFixed(k==="s"?1:0)} ${r.unit} <span style="color:#94a3b8">/ target ${r.target}</span></span></div>
      <div class="chart-track">
        <div class="chart-band" style="left:${bandLeft}%; width:${bandWidth}%"></div>
        <div class="chart-fill ${within ? "ok" : (overCeiling ? "high" : "")}" style="width:${pct}%"></div>
      </div>
    `;
    chartRows.appendChild(row);
  });
  balanceVal.textContent = plan.length === 0 ? "— / 6" : `${inBand} / 6`;

  // Advice
  if (plan.length === 0) {
    chartAdvice.textContent = "Start adding food to see your daily totals build up.";
    chartAdvice.className = "chart-advice";
    return;
  }
  const issues = [];
  if (totals.e < RDA.e.band[0]) issues.push("low energy — risk of fatigue and poor concentration");
  if (totals.e > RDA.e.band[1]) issues.push("high energy intake — could lead to weight gain over time");
  if (totals.fi < RDA.fi.band[0]) issues.push("low fibre — try wholegrains, fruit, beans or vegetables");
  if (totals.f > RDA.f.band[1]) issues.push("high in fat — particularly an issue if much of it is saturated");
  if (totals.s > RDA.s.band[1]) issues.push("over the salt ceiling — raises blood pressure long term");
  if (totals.p < RDA.p.band[0]) issues.push("low protein — important for growth, repair and immune function");
  if (issues.length === 0) {
    chartAdvice.innerHTML = `<strong>Well balanced day.</strong> All six nutrients are sitting in the recommended range. A plan you could realistically stick to.`;
    chartAdvice.className = "chart-advice balanced";
  } else {
    chartAdvice.innerHTML = `<strong>Things to address:</strong> this plan is ${issues.join("; ")}.`;
    chartAdvice.className = "chart-advice " + (issues.length >= 3 ? "warn" : "");
  }
}

function refresh() {
  renderPlan();
  renderChart();
}

document.getElementById("btnClear").addEventListener("click", () => {
  plan = []; refresh(); tick();
});

renderFoodBank();
refresh();
