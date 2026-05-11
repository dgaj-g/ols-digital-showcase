// Physics — Hubble's Law and the Doppler / Red Shift
// Slider sets distance to a galaxy. Recession velocity is calculated using
// Hubble's law (v = H0 × d). The spectrum panel shows the Hα absorption
// line shifted from its rest wavelength. A Doppler "audio" demonstrates
// the same effect with a pitch drop.

const H0 = 70;        // km/s/Mpc
const C  = 300000;    // km/s
const H_REST = 656.3; // nm, Hα

const distSlider = document.getElementById("dist");
const distVal = document.getElementById("distVal");
const velVal = document.getElementById("velVal");
const zVal = document.getElementById("zVal");
const skyCanvas = document.getElementById("skyCanvas");
const specSvg = document.getElementById("specSvg");
const btnDoppler = document.getElementById("btnDoppler");

const skyCtx = skyCanvas.getContext("2d");

// random starfield positions
const stars = [];
for (let i = 0; i < 250; i++) stars.push({
  x: Math.random() * skyCanvas.width,
  y: Math.random() * skyCanvas.height,
  r: 0.4 + Math.random() * 1.4,
  a: 0.4 + Math.random() * 0.6,
});

function distMpc() { return parseInt(distSlider.value, 10); }
function velocity(d) { return H0 * d; }
function zFromV(v) { return v / C; }
function shiftedWavelength(d) { const v = velocity(d); return H_REST * (1 + v / C); }

function drawSky() {
  const d = distMpc();
  const v = velocity(d);
  const z = zFromV(v);

  skyCtx.fillStyle = "#020512";
  skyCtx.fillRect(0, 0, skyCanvas.width, skyCanvas.height);

  // distant background haze tinted by red shift (the further, redder)
  const shiftHue = Math.min(40, z * 1000); // up to ~40 degrees of red bias
  skyCtx.fillStyle = `rgba(255,${Math.max(160, 200 - shiftHue*2)},${Math.max(140, 200 - shiftHue*3)},0.04)`;
  skyCtx.fillRect(0, 0, skyCanvas.width, skyCanvas.height);

  // stars (background)
  stars.forEach(s => {
    skyCtx.fillStyle = `rgba(255,255,255,${s.a})`;
    skyCtx.beginPath();
    skyCtx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    skyCtx.fill();
  });

  // Galaxy — position scales with distance (further = smaller, more shifted right)
  const gx = 80 + (d / 500) * (skyCanvas.width - 160);
  const gy = skyCanvas.height / 2;
  // galaxy size shrinks with distance (apparent)
  const gr = Math.max(18, 90 - (d / 500) * 70);
  // galaxy colour tinted toward red as z increases
  const galRedMix = Math.min(0.85, z * 30);
  const baseCol = (alpha) => {
    // rgb base #C9B4FF (violet-pink) -> blends to red-pink
    const r = Math.round(201 + (250 - 201) * galRedMix);
    const g = Math.round(180 + (90 - 180) * galRedMix);
    const b = Math.round(255 + (110 - 255) * galRedMix);
    return `rgba(${r},${g},${b},${alpha})`;
  };
  // glow halo
  for (let i = 0; i < 5; i++) {
    skyCtx.beginPath();
    skyCtx.arc(gx, gy, gr * (1 + i * 0.4), 0, Math.PI*2);
    skyCtx.fillStyle = baseCol(0.08 - i * 0.012);
    skyCtx.fill();
  }
  // core
  skyCtx.beginPath();
  skyCtx.arc(gx, gy, gr * 0.55, 0, Math.PI*2);
  skyCtx.fillStyle = baseCol(0.65);
  skyCtx.fill();
  // bright nucleus
  skyCtx.beginPath();
  skyCtx.arc(gx, gy, gr * 0.18, 0, Math.PI*2);
  skyCtx.fillStyle = "rgba(255,250,240,0.95)";
  skyCtx.fill();
  // spiral arms (rotated)
  skyCtx.save();
  skyCtx.translate(gx, gy);
  skyCtx.rotate(0.4);
  for (let a = 0; a < 2; a++) {
    skyCtx.beginPath();
    for (let t = 0; t < Math.PI * 2; t += 0.08) {
      const rr = gr * (0.2 + t / (Math.PI * 4));
      const xx = Math.cos(t + a * Math.PI) * rr;
      const yy = Math.sin(t + a * Math.PI) * rr * 0.6;
      if (t === 0) skyCtx.moveTo(xx, yy);
      else skyCtx.lineTo(xx, yy);
    }
    skyCtx.strokeStyle = baseCol(0.45);
    skyCtx.lineWidth = 1.6;
    skyCtx.stroke();
  }
  skyCtx.restore();

  // distance scale at the bottom
  skyCtx.fillStyle = "rgba(220,234,242,0.5)";
  skyCtx.font = "11px 'SF Mono', monospace";
  skyCtx.fillText(`d = ${d} Mpc`, 16, skyCanvas.height - 14);
  skyCtx.fillText(`v = H₀ × d = ${v} km/s`, 16, skyCanvas.height - 2);
}

function drawSpectrum() {
  const d = distMpc();
  const shifted = shiftedWavelength(d);
  // Map wavelengths to x-position. Show range 600 to 800 nm (well into red).
  const W = 700, H = 100;
  const xFor = nm => ((nm - 600) / (800 - 600)) * (W - 60) + 30;
  let svg = `
    <defs>
      <linearGradient id="spec" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="#FFB300"/>
        <stop offset="50%" stop-color="#FF5630"/>
        <stop offset="100%" stop-color="#8E1A14"/>
      </linearGradient>
    </defs>
    <rect x="30" y="20" width="${W-60}" height="50" fill="url(#spec)" stroke="#1F2A45" stroke-width="1.5"/>
    <!-- x axis ticks -->
    ${[600,650,700,750,800].map(w => `<text x="${xFor(w)}" y="84" text-anchor="middle" fill="#6E84A8" font-family="SF Mono, monospace" font-size="10">${w}</text>`).join("")}
    <text x="${W/2}" y="98" text-anchor="middle" fill="#6E84A8" font-family="SF Mono, monospace" font-size="10">wavelength (nm)</text>

    <!-- Rest line at 656.3 -->
    <line x1="${xFor(H_REST)}" y1="14" x2="${xFor(H_REST)}" y2="70" stroke="#4FD0E0" stroke-width="3"/>
    <text x="${xFor(H_REST)}" y="12" text-anchor="middle" fill="#4FD0E0" font-family="SF Mono, monospace" font-size="10" font-weight="800">${H_REST}</text>

    <!-- Shifted line -->
    <line x1="${xFor(shifted)}" y1="14" x2="${xFor(shifted)}" y2="70" stroke="#E26AC8" stroke-width="3" stroke-dasharray="2 2"/>
    <text x="${xFor(shifted)}" y="12" text-anchor="middle" fill="#E26AC8" font-family="SF Mono, monospace" font-size="10" font-weight="800">${shifted.toFixed(1)}</text>
  `;
  specSvg.innerHTML = svg;
}

function update() {
  const d = distMpc();
  const v = velocity(d);
  const z = zFromV(v);
  distVal.textContent = d;
  velVal.textContent = v.toLocaleString();
  zVal.textContent = z.toFixed(4);
  drawSky();
  drawSpectrum();
}

distSlider.addEventListener("input", update);

// ---- Doppler audio: play a base tone, then shift down to demonstrate
let ac;
function doppler() {
  try {
    ac = ac || new (window.AudioContext||window.webkitAudioContext)();
    const v = velocity(distMpc()); // km/s
    // map velocity to pitch shift: c=300000 -> 0Hz; smaller v -> small shift
    const baseFreq = 880;
    const shifted = baseFreq * (1 - v / C);
    // play base first
    play(baseFreq, 0.5);
    setTimeout(() => play(shifted, 0.7), 600);
  } catch {}
}
function play(freq, dur) {
  const o = ac.createOscillator(); const g = ac.createGain();
  o.type = "sine"; o.frequency.value = freq;
  g.gain.value = 0.05; o.connect(g); g.connect(ac.destination);
  o.start(); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
  o.stop(ac.currentTime + dur + 0.02);
}
btnDoppler.addEventListener("click", doppler);

update();

// ---- Tabs ----
const tabExplore = document.getElementById("tabExplore");
const tabQuiz = document.getElementById("tabQuiz");
const paneExplore = document.getElementById("paneExplore");
const paneQuiz = document.getElementById("paneQuiz");
tabExplore.addEventListener("click", () => { tabExplore.classList.add("active"); tabQuiz.classList.remove("active"); paneExplore.hidden = false; paneQuiz.hidden = true; });
tabQuiz.addEventListener("click", () => { tabQuiz.classList.add("active"); tabExplore.classList.remove("active"); paneExplore.hidden = true; paneQuiz.hidden = false; startQuiz(); });

// ---- Quiz: "Rank by red shift" — show 4 galaxies, each with a shifted line, pick the most red-shifted ----
const quizRow = document.getElementById("quizRow");
const qFeedback = document.getElementById("qFeedback");
const qIdx = document.getElementById("qIdx");
const qTotal = document.getElementById("qTotal");
const qScore = document.getElementById("qScore");
const physResult = document.getElementById("physResult");
const resultTitle = document.getElementById("resultTitle");
const resultMsg = document.getElementById("resultMsg");

const QUIZ_LEN = 6;
let qIndex = 0, qScoreN = 0;

function startQuiz() {
  qIndex = 0; qScoreN = 0;
  qScore.textContent = "0";
  qTotal.textContent = QUIZ_LEN;
  physResult.hidden = true;
  nextRound();
}
function nextRound() {
  if (qIndex >= QUIZ_LEN) { finishQuiz(); return; }
  qIndex++;
  qIdx.textContent = qIndex;
  // generate 4 galaxies with random distances (50-500 Mpc), guarantee distinct shifts
  const distances = [];
  while (distances.length < 4) {
    const d = Math.round(50 + Math.random() * 450);
    if (distances.every(x => Math.abs(x - d) > 40)) distances.push(d);
  }
  // randomly decide: ask for "fastest receding" or "closest"
  const askFastest = Math.random() < 0.7;
  // sort to find correct answer
  const correctD = askFastest ? Math.max(...distances) : Math.min(...distances);
  qFeedback.innerHTML = `${askFastest ? "Four galaxies. Pick the one moving away from us <strong>fastest</strong>." : "Four galaxies. Pick the one <strong>closest</strong> to us (smallest red shift)."}`;
  qFeedback.className = "phys-feedback";
  quizRow.innerHTML = "";
  distances.forEach((d, i) => {
    const c = document.createElement("button");
    c.type = "button"; c.className = "q-galaxy"; c.dataset.d = d;
    const shifted = H_REST * (1 + (H0 * d) / C);
    const xFor = nm => ((nm - 600) / (800 - 600)) * 130 + 10;
    c.innerHTML = `
      <svg viewBox="0 0 150 60">
        <rect x="10" y="20" width="130" height="22" fill="url(#qspec${i})"/>
        <defs>
          <linearGradient id="qspec${i}" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stop-color="#FFB300"/>
            <stop offset="100%" stop-color="#8E1A14"/>
          </linearGradient>
        </defs>
        <line x1="${xFor(H_REST)}" y1="14" x2="${xFor(H_REST)}" y2="48" stroke="#4FD0E0" stroke-width="2"/>
        <line x1="${xFor(shifted)}" y1="14" x2="${xFor(shifted)}" y2="48" stroke="#E26AC8" stroke-width="2" stroke-dasharray="2 2"/>
      </svg>
      <div class="q-name">Galaxy ${String.fromCharCode(65 + i)}</div>
    `;
    c.addEventListener("click", () => answer(d, c, correctD, askFastest));
    quizRow.appendChild(c);
  });
}

function answer(picked, btn, correct, askFastest) {
  document.querySelectorAll(".q-galaxy").forEach(x => x.disabled = true);
  const correctNode = [...quizRow.children].find(n => parseInt(n.dataset.d) === correct);
  if (picked === correct) {
    btn.classList.add("correct");
    qScoreN++; qScore.textContent = qScoreN;
    const v = H0 * picked;
    qFeedback.innerHTML = `<strong>Correct.</strong> That galaxy is ${picked} Mpc away — recession velocity ${v.toLocaleString()} km/s. Its red shift is the ${askFastest ? "largest" : "smallest"}.`;
    qFeedback.className = "phys-feedback ok";
  } else {
    btn.classList.add("wrong");
    correctNode.classList.add("correct");
    const v = H0 * correct;
    qFeedback.innerHTML = `<strong>The right answer was that one.</strong> ${correct} Mpc, v = ${v.toLocaleString()} km/s — its Hα line is shifted ${askFastest ? "the most" : "the least"} from the rest position.`;
    qFeedback.className = "phys-feedback bad";
  }
  setTimeout(nextRound, 1900);
}

function finishQuiz() {
  physResult.hidden = false;
  let t, m;
  if (qScoreN === QUIZ_LEN) { t = "Hubble's apprentice."; m = `${qScoreN} / ${QUIZ_LEN}. You read red shift fluently.`; }
  else if (qScoreN >= 4) { t = "Sharp eye."; m = `${qScoreN} / ${QUIZ_LEN}. Strong intuition for spectral shift.`; }
  else { t = "Set complete."; m = `${qScoreN} / ${QUIZ_LEN}. Play with the slider in Explore mode — watch how the line moves.`; }
  resultTitle.textContent = t;
  resultMsg.textContent = m;
}

document.getElementById("qReset").addEventListener("click", startQuiz);
document.getElementById("qAgain").addEventListener("click", startQuiz);
