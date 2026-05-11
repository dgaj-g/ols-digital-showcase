// Mathematics — Fractions/Decimals/Percentages explorer
// Live converter, three synced visualisations, real-life problems with audio feedback.

const numInput = document.getElementById("numInput");
const denInput = document.getElementById("denInput");
const readFrac = document.getElementById("readFrac");
const readDec  = document.getElementById("readDec");
const readPct  = document.getElementById("readPct");
const readSimp = document.getElementById("readSimp");
const pizzaSvg = document.getElementById("pizzaSvg");
const barSvg   = document.getElementById("barSvg");
const gridSvg  = document.getElementById("gridSvg");

// ---- audio: short generated tones (Web Audio API) ----
let audioCtx;
function tone(freq, ms, type = "sine", gain = 0.07) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + ms / 1000);
    o.stop(audioCtx.currentTime + ms / 1000 + 0.02);
  } catch (e) { /* silently ignore — no audio context */ }
}
function dingCorrect() { tone(880, 120, "triangle"); setTimeout(() => tone(1320, 160, "triangle"), 110); }
function buzzWrong()   { tone(180, 200, "sawtooth", 0.05); }
function tickClick()   { tone(700, 35, "square", 0.04); }

// ---- maths utils ----
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
function fmtNum(x, dp = 4) {
  const r = Math.round(x * 10**dp) / 10**dp;
  return r.toString();
}

// ---- KaTeX render helpers ----
function frac(n, d) {
  return `\\dfrac{${n}}{${d}}`;
}
function renderKatex(el, tex) {
  if (window.katex) {
    el.innerHTML = "";
    katex.render(tex, el, { throwOnError: false });
  } else {
    el.textContent = tex.replace(/\\dfrac\{(.+?)\}\{(.+?)\}/g, "$1/$2");
  }
}

// ---- visualisations ----
function drawPizza(num, den) {
  const slices = den;
  const filled = Math.min(num, den);
  pizzaSvg.innerHTML = "";
  if (slices === 1) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", 0); circle.setAttribute("cy", 0); circle.setAttribute("r", 100);
    circle.setAttribute("class", filled ? "pie-filled" : "pie-empty");
    circle.setAttribute("stroke", "#595959");
    circle.setAttribute("stroke-width", "1.5");
    pizzaSvg.appendChild(circle);
    return;
  }
  const sliceAngle = (Math.PI * 2) / slices;
  for (let i = 0; i < slices; i++) {
    const a0 = i * sliceAngle - Math.PI / 2;
    const a1 = (i + 1) * sliceAngle - Math.PI / 2;
    const x0 = Math.cos(a0) * 100, y0 = Math.sin(a0) * 100;
    const x1 = Math.cos(a1) * 100, y1 = Math.sin(a1) * 100;
    const large = sliceAngle > Math.PI ? 1 : 0;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M 0 0 L ${x0} ${y0} A 100 100 0 ${large} 1 ${x1} ${y1} Z`);
    path.setAttribute("class", i < filled ? "pie-filled" : "pie-empty");
    path.setAttribute("stroke", "#595959");
    path.setAttribute("stroke-width", "1.5");
    pizzaSvg.appendChild(path);
  }
}

function drawBar(num, den) {
  const ratio = Math.min(num / den, 1);
  barSvg.innerHTML = "";
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("x", 0); bg.setAttribute("y", 5); bg.setAttribute("width", 240); bg.setAttribute("height", 50);
  bg.setAttribute("class", "bar-empty");
  bg.setAttribute("rx", 6);
  barSvg.appendChild(bg);
  const fill = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  fill.setAttribute("x", 0); fill.setAttribute("y", 5);
  fill.setAttribute("width", 240 * ratio);
  fill.setAttribute("height", 50);
  fill.setAttribute("class", "bar-filled");
  fill.setAttribute("rx", 6);
  barSvg.appendChild(fill);
  // tick marks at 25/50/75
  [0.25, 0.5, 0.75].forEach(t => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", 240 * t); line.setAttribute("x2", 240 * t);
    line.setAttribute("y1", 5); line.setAttribute("y2", 55);
    line.setAttribute("stroke", "#595959"); line.setAttribute("stroke-dasharray", "2 3");
    barSvg.appendChild(line);
  });
}

function drawGrid(num, den) {
  const totalPct = (num / den) * 100;
  const fullCells = Math.floor(totalPct);
  const partial = totalPct - fullCells; // fraction of next cell
  gridSvg.innerHTML = "";
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const idx = r * 10 + c;
      const x = 10 + c * 20, y = 10 + r * 20;
      const cell = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      cell.setAttribute("x", x); cell.setAttribute("y", y);
      cell.setAttribute("width", 20); cell.setAttribute("height", 20);
      let cls = "grid-cell";
      if (idx < fullCells) cls = "grid-on";
      else if (idx === fullCells && partial > 0.001) cls = "grid-partial";
      cell.setAttribute("class", cls);
      gridSvg.appendChild(cell);
    }
  }
}

function refresh() {
  let n = parseInt(numInput.value, 10);
  let d = parseInt(denInput.value, 10);
  if (isNaN(n) || n < 0) n = 0;
  if (isNaN(d) || d <= 0) d = 1;
  if (n > 100) n = 100;
  if (d > 100) d = 100;
  numInput.value = n;
  denInput.value = d;

  renderKatex(readFrac, frac(n, d));
  readDec.textContent = fmtNum(n / d, 4);
  const pct = (n / d) * 100;
  readPct.textContent = `${fmtNum(pct, 2)}%`;
  const g = gcd(n, d);
  if (g > 1 && n > 0) {
    renderKatex(readSimp, frac(n / g, d / g));
  } else {
    renderKatex(readSimp, n === 0 ? "0" : frac(n, d));
  }
  drawPizza(n, d);
  drawBar(n, d);
  drawGrid(n, d);
}

numInput.addEventListener("input", () => { tickClick(); refresh(); });
denInput.addEventListener("input", () => { tickClick(); refresh(); });

document.querySelectorAll(".qbtn").forEach(b => {
  b.addEventListener("click", () => {
    numInput.value = b.dataset.num;
    denInput.value = b.dataset.den;
    tickClick();
    refresh();
  });
});

// ---- real-life problems ----
const PROBLEMS = [
  { q: "A jumper costs £40. It's reduced by <strong>25%</strong>. What's the new price (in £)?", a: 30, set: { n: 1, d: 4 } },
  { q: "Eilis scored <strong>18 out of 25</strong> on a test. What percentage is that?", a: 72, set: { n: 18, d: 25 }, unit: "%" },
  { q: "Convert <strong>0.6</strong> to a percentage.", a: 60, set: { n: 6, d: 10 }, unit: "%" },
  { q: "Find <strong>10% of £85</strong> (answer in £).", a: 8.5, set: { n: 1, d: 10 } },
  { q: "A river is 320 km long. <strong>¾</strong> of it is in Northern Ireland. How many km?", a: 240, set: { n: 3, d: 4 } },
  { q: "A class has 30 pupils. <strong>2/5</strong> are left-handed. How many is that?", a: 12, set: { n: 2, d: 5 } },
];

const problemGrid = document.getElementById("problemGrid");
PROBLEMS.forEach((p, i) => {
  const div = document.createElement("div");
  div.className = "problem";
  div.innerHTML = `
    <div class="problem-question">${p.q}</div>
    <div class="problem-controls">
      <input type="number" step="0.01" inputmode="decimal" placeholder="Your answer" aria-label="Answer to problem ${i + 1}">
      <button class="check">Check</button>
    </div>
    <div class="problem-feedback" aria-live="polite"></div>
  `;
  problemGrid.appendChild(div);
  const input = div.querySelector("input");
  const fb = div.querySelector(".problem-feedback");
  const check = () => {
    const v = parseFloat(input.value);
    if (isNaN(v)) { fb.textContent = "Type a number first."; return; }
    div.classList.remove("correct", "wrong");
    if (Math.abs(v - p.a) < 0.01) {
      div.classList.add("correct");
      fb.textContent = `Correct. ${p.unit ? p.a + p.unit : "£" + p.a}.`;
      dingCorrect();
      // sync the explorer to this problem's underlying fraction
      numInput.value = p.set.n; denInput.value = p.set.d; refresh();
    } else {
      div.classList.add("wrong");
      fb.textContent = `Not quite — try again.`;
      buzzWrong();
    }
  };
  div.querySelector(".check").addEventListener("click", check);
  input.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
  // tap problem to load it into the explorer without checking
  div.addEventListener("click", e => {
    if (e.target === input || e.target.tagName === "BUTTON") return;
    numInput.value = p.set.n; denInput.value = p.set.d; refresh();
    tickClick();
  });
});

// initial render — wait a tick for KaTeX CSS to apply
window.addEventListener("load", refresh);
refresh();

// load KaTeX JS dynamically (the CSS is already in head)
const katexScript = document.createElement("script");
katexScript.src = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js";
katexScript.defer = true;
katexScript.onload = refresh;
document.head.appendChild(katexScript);
