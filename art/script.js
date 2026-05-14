// Art and Design — Watercolour Techniques
// Canvas-based brush simulator. Each technique uses a different blending /
// stamping approach. A separate quiz mode generates random swatches and asks
// pupils to identify which technique produced each one.

const COLOURS = [
  { name: "Rose", hex: "#B85A3F" },
  { name: "Lemon", hex: "#D69C42" },
  { name: "Leaf", hex: "#6FB59E" },
  { name: "Sky", hex: "#7BA9D0" },
  { name: "Plum", hex: "#7E3D7A" },
  { name: "Earth", hex: "#7A4A2A" },
  { name: "Indigo", hex: "#2E4E84" },
  { name: "Ink", hex: "#2A2218" },
];

const TECHNIQUES = {
  "wet-wet":  { title: "Wet-on-wet",  desc: "Apply pigment onto an already-wet area. Colours bleed and blend into soft edges and clouds." },
  "wet-dry":  { title: "Wet-on-dry",  desc: "Apply pigment onto dry paper. Edges stay crisp — good for details, leaves and figures." },
  "dry":      { title: "Dry brush",   desc: "Use very little water. The brush skips across paper texture, leaving broken lines — ideal for grass and fur." },
  "layer":    { title: "Layering",    desc: "Build up depth by adding fresh layers only after the previous layer has dried. Each layer deepens tone." },
};

let currentTech = "wet-wet";
let currentColour = COLOURS[0].hex;
let currentSize = 22;
let painted = []; // list of strokes since last "dry" — for wet-on-wet bleed simulation

const canvas = document.getElementById("paintCanvas");
const ctx = canvas.getContext("2d");

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
function ding() { tone(660, 80, "triangle", 0.05); setTimeout(()=>tone(990,100,"triangle",0.05), 70); }
function buzz() { tone(180, 200, "sawtooth", 0.05); }
function fanfare() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05),i*110)); }

// ---- Render colour swatches ----
const colourRow = document.getElementById("colourRow");
COLOURS.forEach((c, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "col-swatch" + (i === 0 ? " active" : "");
  b.style.background = c.hex;
  b.title = c.name;
  b.addEventListener("click", () => {
    document.querySelectorAll(".col-swatch.active").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    currentColour = c.hex;
  });
  colourRow.appendChild(b);
});

// ---- Technique buttons
const techHelp = document.getElementById("techHelp");
document.querySelectorAll(".tech-btn").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".tech-btn.active").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    currentTech = b.dataset.tech;
    techHelp.textContent = b.dataset.desc;
  });
});

// ---- Brush size
const brushSize = document.getElementById("brushSize");
const brushSizeVal = document.getElementById("brushSizeVal");
brushSize.addEventListener("input", () => {
  currentSize = parseInt(brushSize.value, 10);
  brushSizeVal.textContent = currentSize;
});

// ---- Watercolour brush — pre-renders one "blob" image to stamp
function makeBlobStamp(hex, size, opacity) {
  const off = document.createElement("canvas");
  off.width = off.height = size * 2;
  const c = off.getContext("2d");
  const g = c.createRadialGradient(size, size, 0, size, size, size);
  g.addColorStop(0, hex + Math.floor(255 * opacity).toString(16).padStart(2,'0'));
  g.addColorStop(0.5, hex + Math.floor(128 * opacity).toString(16).padStart(2,'0'));
  g.addColorStop(1, hex + "00");
  c.fillStyle = g;
  c.beginPath();
  // irregular blob
  c.moveTo(size, 8);
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 18) {
    const r = size - 4 + Math.random() * 6;
    c.lineTo(size + Math.cos(a) * r, size + Math.sin(a) * r);
  }
  c.closePath();
  c.fill();
  return off;
}

function paintAt(x, y, opts = {}) {
  ctx.globalCompositeOperation = "multiply";
  const colour = opts.colour || currentColour;
  const size = opts.size || currentSize;
  const tech = opts.tech || currentTech;

  if (tech === "wet-wet") {
    // multiple stamps with jitter — drops bleed outward
    const stamps = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < stamps; i++) {
      const r = size * (0.6 + Math.random() * 0.5);
      const jx = (Math.random() - 0.5) * size * 1.4;
      const jy = (Math.random() - 0.5) * size * 1.4;
      const blob = makeBlobStamp(colour, r, 0.32 + Math.random() * 0.2);
      ctx.drawImage(blob, x + jx - r, y + jy - r);
    }
  } else if (tech === "wet-dry") {
    // single dense stamp — crisp edge
    const blob = makeBlobStamp(colour, size, 0.65);
    ctx.drawImage(blob, x - size, y - size);
  } else if (tech === "dry") {
    // small splattered stamps — texture
    for (let i = 0; i < 14; i++) {
      const jx = (Math.random() - 0.5) * size * 1.7;
      const jy = (Math.random() - 0.5) * size * 1.7;
      if (Math.random() > 0.6) continue; // skip — broken line
      const r = 2 + Math.random() * 4;
      ctx.fillStyle = colour + "C0";
      ctx.beginPath();
      ctx.arc(x + jx, y + jy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (tech === "layer") {
    // medium-density single stamp — building up
    const blob = makeBlobStamp(colour, size * 0.85, 0.42);
    ctx.drawImage(blob, x - size * 0.85, y - size * 0.85);
  }
  ctx.globalCompositeOperation = "source-over";
}

// ---- Drawing handlers
let drawing = false;
let lastX = 0, lastY = 0;
function ptr(e) {
  const r = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
  // canvas internal coords
  return { x: x * (canvas.width / r.width), y: y * (canvas.height / r.height) };
}
function start(e) { drawing = true; const p = ptr(e); lastX = p.x; lastY = p.y; paintAt(p.x, p.y); }
function move(e)  { if (!drawing) return; e.preventDefault(); const p = ptr(e);
  const dist = Math.hypot(p.x - lastX, p.y - lastY);
  const steps = Math.max(1, Math.floor(dist / Math.max(2, currentSize * 0.3)));
  for (let i = 1; i <= steps; i++) {
    const xx = lastX + (p.x - lastX) * (i / steps);
    const yy = lastY + (p.y - lastY) * (i / steps);
    paintAt(xx, yy);
  }
  lastX = p.x; lastY = p.y;
}
function end() { drawing = false; }
canvas.addEventListener("pointerdown", start);
canvas.addEventListener("pointermove", move);
canvas.addEventListener("pointerup", end);
canvas.addEventListener("pointerleave", end);

document.getElementById("btnClear").addEventListener("click", () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
});
document.getElementById("btnDry").addEventListener("click", () => {
  // does nothing visible — just signals to user that next strokes layer cleanly
  ctx.save();
  ctx.fillStyle = "rgba(255,252,236,0.08)";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.restore();
});

// ---- Tabs
const tabPaint = document.getElementById("tabPaint");
const tabQuiz  = document.getElementById("tabQuiz");
const panePaint = document.getElementById("panePaint");
const paneQuiz  = document.getElementById("paneQuiz");
tabPaint.addEventListener("click", () => { tabPaint.classList.add("active"); tabQuiz.classList.remove("active"); panePaint.hidden = false; paneQuiz.hidden = true; });
tabQuiz.addEventListener("click",  () => { tabQuiz.classList.add("active"); tabPaint.classList.remove("active"); panePaint.hidden = true; paneQuiz.hidden = false; resetQuiz(); });

// ---- Spot-the-technique Quiz ----
const quizCanvas = document.getElementById("quizCanvas");
const qctx = quizCanvas.getContext("2d");
const qIdx = document.getElementById("qIdx");
const qTotal = document.getElementById("qTotal");
const qScore = document.getElementById("qScore");
const qFeedback = document.getElementById("qFeedback");
const qOptions = document.getElementById("quizOptions");
const artResult = document.getElementById("artResult");
const resultTitle = document.getElementById("resultTitle");
const resultMsg = document.getElementById("resultMsg");

const QUIZ_LEN = 6;
let qi = 0, qs = 0, qAnswer = "";

function paintSwatch(tech) {
  qctx.clearRect(0, 0, quizCanvas.width, quizCanvas.height);
  // background paper
  qctx.fillStyle = "#FFFCEC";
  qctx.fillRect(0, 0, quizCanvas.width, quizCanvas.height);
  // pick 1-2 colours
  const colour = COLOURS[Math.floor(Math.random()*COLOURS.length)].hex;
  const colour2 = COLOURS[Math.floor(Math.random()*COLOURS.length)].hex;
  // paint with the chosen technique — temporarily redirect paintAt to qctx
  const origCtx = ctx;
  // We use a helper that writes to qctx instead by saving ctx and writing to a temp
  // simpler approach: build the stamp here directly
  const cw = quizCanvas.width, ch = quizCanvas.height;
  qctx.globalCompositeOperation = "multiply";
  if (tech === "wet-wet") {
    // soft bleeding wash
    for (let i = 0; i < 18; i++) {
      const r = 28 + Math.random()*22;
      const x = 40 + Math.random()*(cw-80);
      const y = 30 + Math.random()*(ch-60);
      const blob = makeBlobStamp(Math.random()<0.5?colour:colour2, r, 0.22 + Math.random()*0.15);
      qctx.drawImage(blob, x-r, y-r);
    }
  } else if (tech === "wet-dry") {
    // crisp shapes
    for (let i = 0; i < 4; i++) {
      const r = 32 + Math.random()*14;
      const x = 60 + Math.random()*(cw-120);
      const y = 40 + Math.random()*(ch-80);
      const blob = makeBlobStamp(i%2===0?colour:colour2, r, 0.7);
      qctx.drawImage(blob, x-r, y-r);
    }
  } else if (tech === "dry") {
    // texture / broken lines
    for (let i = 0; i < 200; i++) {
      const x = Math.random()*cw;
      const y = Math.random()*ch;
      if (Math.random() > 0.45) continue;
      qctx.fillStyle = (Math.random()<0.5?colour:colour2) + "C0";
      qctx.beginPath();
      qctx.arc(x, y, 1 + Math.random()*3, 0, Math.PI*2);
      qctx.fill();
    }
    // broken curve
    let lx = 30, ly = ch/2;
    for (let i = 0; i < 60; i++) {
      const t = i/60;
      const x = 30 + t*(cw-60) + Math.sin(t*8)*8;
      const y = ch/2 + Math.sin(t*4)*30 + (Math.random()-0.5)*4;
      if (Math.random() > 0.55) { qctx.fillStyle = colour + "B0"; qctx.beginPath(); qctx.arc(x,y,2.5,0,Math.PI*2); qctx.fill(); }
      lx = x; ly = y;
    }
  } else if (tech === "layer") {
    // 3 cleanly stacked layers, increasing tone
    for (let layer = 0; layer < 3; layer++) {
      const r = 60 - layer*12;
      const x = cw/2 + (Math.random()-0.5)*30;
      const y = ch/2 + (Math.random()-0.5)*20;
      const blob = makeBlobStamp(layer === 0 ? colour : colour2, r, 0.35);
      qctx.drawImage(blob, x-r, y-r);
    }
  }
  qctx.globalCompositeOperation = "source-over";
}

function resetQuiz() {
  qi = 0; qs = 0;
  qIdx.textContent = "1";
  qTotal.textContent = QUIZ_LEN;
  qScore.textContent = "0";
  artResult.hidden = true;
  nextQuestion();
}

function nextQuestion() {
  if (qi >= QUIZ_LEN) { finishQuiz(); return; }
  qi++;
  qIdx.textContent = qi;
  const keys = Object.keys(TECHNIQUES);
  qAnswer = keys[Math.floor(Math.random()*keys.length)];
  paintSwatch(qAnswer);
  // shuffle option order
  const order = [...keys].sort(() => Math.random() - 0.5);
  qOptions.innerHTML = "";
  order.forEach(k => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "quiz-opt";
    b.textContent = TECHNIQUES[k].title;
    b.addEventListener("click", () => handleAnswer(k, b));
    qOptions.appendChild(b);
  });
  qFeedback.innerHTML = "Look at the swatch on the left. Which watercolour technique made it?";
  qFeedback.className = "art-feedback";
}

function handleAnswer(picked, btn) {
  document.querySelectorAll(".quiz-opt").forEach(x => x.disabled = true);
  if (picked === qAnswer) {
    btn.classList.add("correct");
    qs++;
    qScore.textContent = qs;
    qFeedback.innerHTML = `<strong>Correct.</strong> ${TECHNIQUES[qAnswer].title}: ${TECHNIQUES[qAnswer].desc}`;
    qFeedback.className = "art-feedback ok";
    ding();
    setTimeout(nextQuestion, 1500);
  } else {
    btn.classList.add("wrong");
    document.querySelector(`.quiz-opt:nth-child(${[...qOptions.children].findIndex(c => c.textContent === TECHNIQUES[qAnswer].title)+1})`)?.classList.add("correct");
    qFeedback.innerHTML = `<strong>Not quite.</strong> That swatch was made using <em>${TECHNIQUES[qAnswer].title}</em> — ${TECHNIQUES[qAnswer].desc} <button class="qfb-next" type="button">Next swatch &rarr;</button>`;
    qFeedback.className = "art-feedback bad";
    buzz();
    qFeedback.querySelector(".qfb-next")?.addEventListener("click", nextQuestion);
  }
}

function finishQuiz() {
  artResult.hidden = false;
  let t, m;
  if (qs === QUIZ_LEN) { t = "Faultless eye."; m = `${qs} / ${QUIZ_LEN}. You spot a wet-on-wet wash a mile off.`; fanfare(); }
  else if (qs >= 4)   { t = "Sharp."; m = `${qs} / ${QUIZ_LEN}. Strong technique recognition.`; fanfare(); }
  else if (qs >= 2)   { t = "Getting there."; m = `${qs} / ${QUIZ_LEN}. Switch to Paint mode and try each technique yourself.`; }
  else                { t = "Try Paint mode first."; m = `${qs} / ${QUIZ_LEN}. Make a few swatches of your own and the differences will jump out.`; }
  resultTitle.textContent = t;
  resultMsg.textContent = m;
}

document.getElementById("qReset").addEventListener("click", resetQuiz);
document.getElementById("btnAgain").addEventListener("click", resetQuiz);
