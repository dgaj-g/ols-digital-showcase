// Biology — Gene Technology Lab
// 5-stage interactive walkthrough: find gene → choose enzyme → cut →
// ligate gene into plasmid → transform bacteria. Each correct decision
// scores a point. The visualisation updates after each correct stage.

const stageIdxEl = document.getElementById("stageIdx");
const stageTotalEl = document.getElementById("stageTotal");
const dnaScoreEl = document.getElementById("dnaScore");
const dnaStatus = document.getElementById("dnaStatus");
const stageTitle = document.getElementById("stageTitle");
const stageDesc = document.getElementById("stageDesc");
const stageWork = document.getElementById("stageWork");
const dnaFb = document.getElementById("dnaFb");
const vizSvg = document.getElementById("vizSvg");
const dnaResult = document.getElementById("dnaResult");
const resultTitle = document.getElementById("resultTitle");
const resultMsg = document.getElementById("resultMsg");

let stage = 0;
let score = 0;
let geneFound = false;
let cutWith = null;
let plasmidCut = false;
let recombinant = false;
let transformed = false;

// --- audio
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

stageTotalEl.textContent = "5";

// --- stages
const STAGES = [
  // Stage 1: find the gene (insulin gene flanked by GAATTC sites)
  {
    title: "Stage 1 — Find the gene",
    desc: "The chromosome below contains the human insulin gene flanked by two EcoRI recognition sites (GAATTC). Click anywhere on the highlighted target region to confirm.",
    setup() {
      const seq = "AGCTGTAACGT GAATTC ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCT GAATTC GGCCAATAGCTA".replace(/\s/g,"");
      // mark target = from after first GAATTC to start of second GAATTC
      const i1 = seq.indexOf("GAATTC");
      const i2 = seq.indexOf("GAATTC", i1 + 6);
      const targetStart = i1; // include the cut site
      const targetEnd = i2 + 6;
      stageWork.innerHTML = `<div class="dna-sequence" id="seq"></div>`;
      const seqEl = document.getElementById("seq");
      [...seq].forEach((b, i) => {
        const s = document.createElement("span");
        s.className = `dna-base ${b}`;
        if (i >= targetStart && i < targetEnd) s.classList.add("target");
        if ((i >= i1 && i < i1 + 6) || (i >= i2 && i < i2 + 6)) s.classList.add("highlight");
        s.textContent = b;
        s.addEventListener("click", () => {
          if (i >= targetStart && i < targetEnd) handleStage(true);
          else handleStage(false, "That's outside the target region. The gene is between the two GAATTC sites — they're highlighted in green.");
        });
        seqEl.appendChild(s);
      });
      dnaFb.innerHTML = "Click anywhere on the underlined region to confirm the gene.";
      dnaFb.className = "dna-feedback";
    },
    onSuccess() { geneFound = true; }
  },
  // Stage 2: pick enzyme
  {
    title: "Stage 2 — Choose the right restriction enzyme",
    desc: "The gene is flanked by GAATTC. You need an enzyme that cuts at that exact sequence.",
    setup() {
      stageWork.innerHTML = `<div class="dna-choices" id="choices"></div>`;
      const choices = document.getElementById("choices");
      const opts = [
        { id: "ecori",  name: "EcoRI",   cut: "G^AATTC" },
        { id: "hindiii",name: "HindIII", cut: "A^AGCTT" },
        { id: "bamhi",  name: "BamHI",   cut: "G^GATCC" },
        { id: "noti",   name: "NotI",    cut: "GC^GGCCGC" },
      ];
      opts.forEach(o => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "dna-choice"; b.dataset.id = o.id;
        b.innerHTML = `<span class="ch-name">${o.name}</span><span class="ch-cut">cuts ${o.cut}</span>`;
        b.addEventListener("click", () => {
          if (o.id === "ecori") { cutWith = "EcoRI"; handleStage(true); }
          else handleStage(false, `${o.name} recognises ${o.cut} — that won't cut at GAATTC. You need EcoRI.`);
        });
        choices.appendChild(b);
      });
      dnaFb.innerHTML = "Pick the enzyme whose recognition site matches the flanks (GAATTC).";
      dnaFb.className = "dna-feedback";
    },
    onSuccess() { /* nothing */ }
  },
  // Stage 3: cut plasmid with same enzyme
  {
    title: "Stage 3 — Cut the plasmid with the same enzyme",
    desc: "For sticky ends to match, the plasmid must be cut with the same enzyme as the gene. Confirm which enzyme you'll use.",
    setup() {
      stageWork.innerHTML = `<div class="dna-choices" id="choices"></div>`;
      const choices = document.getElementById("choices");
      const opts = [
        { id: "ecori",  name: "EcoRI again",    desc: "Same enzyme — sticky ends will be complementary." },
        { id: "bamhi",  name: "BamHI",          desc: "Different recognition site — sticky ends won't pair." },
        { id: "blunt",  name: "A blunt cutter", desc: "Blunt ends — won't base-pair with EcoRI sticky ends." },
      ];
      opts.forEach(o => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "dna-choice";
        b.innerHTML = `<span class="ch-name">${o.name}</span><span class="ch-cut">${o.desc}</span>`;
        b.addEventListener("click", () => {
          if (o.id === "ecori") { plasmidCut = true; handleStage(true); }
          else handleStage(false, "Sticky ends only pair when both strands were cut with the same enzyme. Use EcoRI again.");
        });
        choices.appendChild(b);
      });
      dnaFb.innerHTML = "Match the plasmid's cut to the gene's cut.";
      dnaFb.className = "dna-feedback";
    },
    onSuccess() { /* */ }
  },
  // Stage 4: ligate
  {
    title: "Stage 4 — Ligate the gene into the plasmid",
    desc: "The sticky ends will base-pair, but the sugar-phosphate backbone needs joining. Which enzyme does that?",
    setup() {
      stageWork.innerHTML = `<div class="dna-choices" id="choices"></div>`;
      const choices = document.getElementById("choices");
      const opts = [
        { id: "lig", name: "DNA ligase",        desc: "Forms covalent bonds in the sugar-phosphate backbone." },
        { id: "pol", name: "DNA polymerase",    desc: "Builds new strands from a template — needed for PCR, not for joining." },
        { id: "hel", name: "Helicase",          desc: "Unwinds the double helix — doesn't join anything." },
        { id: "res", name: "Another restriction enzyme", desc: "Cuts DNA — opposite of what we need." },
      ];
      opts.forEach(o => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "dna-choice";
        b.innerHTML = `<span class="ch-name">${o.name}</span><span class="ch-cut">${o.desc}</span>`;
        b.addEventListener("click", () => {
          if (o.id === "lig") { recombinant = true; handleStage(true); }
          else handleStage(false, "Only DNA ligase can seal the backbone — the others either cut, copy or unwind DNA.");
        });
        choices.appendChild(b);
      });
      dnaFb.innerHTML = "Pick the enzyme that joins DNA fragments.";
      dnaFb.className = "dna-feedback";
    },
    onSuccess() { /* */ }
  },
  // Stage 5: transform bacteria
  {
    title: "Stage 5 — Transform bacteria",
    desc: "The recombinant plasmid is mixed with E. coli. Three colonies grow on the agar plate. Click the colony that took up the plasmid AND expresses the antibiotic resistance gene (it grows on the antibiotic-laced plate).",
    setup() {
      // visual via SVG — bacteria already drawn; we just enable click on the right ones
      stageWork.innerHTML = `<p style="margin:0 0 0.6rem; color:var(--bio-muted)">The plate contains an antibiotic. Only bacteria carrying the recombinant plasmid (which has an antibiotic-resistance gene) survive. Click the surviving colony in the diagram on the right.</p>`;
      dnaFb.innerHTML = "Click the green-glowing colony in the diagram on the right.";
      dnaFb.className = "dna-feedback";
    },
    onSuccess() { transformed = true; }
  },
];

function startStage(i) {
  stage = i;
  if (i >= STAGES.length) { finishLab(); return; }
  stageIdxEl.textContent = (i + 1);
  stageTitle.textContent = STAGES[i].title;
  stageDesc.textContent = STAGES[i].desc;
  STAGES[i].setup();
  redrawViz();
  dnaStatus.textContent = "Awaiting input";
}

function handleStage(ok, errMsg) {
  if (ok) {
    score++;
    dnaScoreEl.textContent = score;
    dnaStatus.textContent = "Correct";
    dnaFb.innerHTML = "<strong>Correct.</strong> Moving to the next stage…";
    dnaFb.className = "dna-feedback ok";
    ding();
    STAGES[stage].onSuccess();
    setTimeout(() => startStage(stage + 1), 1100);
  } else {
    dnaStatus.textContent = "Try again";
    dnaFb.innerHTML = `<strong>Not quite.</strong> ${errMsg}`;
    dnaFb.className = "dna-feedback bad";
    buzz();
  }
}

function finishLab() {
  dnaResult.hidden = false;
  let title, msg;
  if (score === STAGES.length) { title = "Clean run."; msg = `${score} / ${STAGES.length}. Recombinant insulin plasmid built first time.`; fanfare(); }
  else if (score >= 3) { title = "Good lab."; msg = `${score} / ${STAGES.length}. Have another run at the stages you slipped on.`; fanfare(); }
  else { title = "Run complete."; msg = `${score} / ${STAGES.length}. Try again — the explanations in each stage are the revision.`; }
  resultTitle.textContent = title;
  resultMsg.textContent = msg;
}

document.getElementById("btnRestart").addEventListener("click", () => { score = 0; dnaScoreEl.textContent = "0"; dnaResult.hidden = true; geneFound=false; cutWith=null; plasmidCut=false; recombinant=false; transformed=false; startStage(0); });
document.getElementById("btnAgain").addEventListener("click", () => { score = 0; dnaScoreEl.textContent = "0"; dnaResult.hidden = true; geneFound=false; cutWith=null; plasmidCut=false; recombinant=false; transformed=false; startStage(0); });

// ---- Visualisation that updates per stage ----
function redrawViz() {
  // Build SVG based on state
  let svg = `
    <defs>
      <linearGradient id="dnaG" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#6FE08F"/>
        <stop offset="1" stop-color="#2A8F4F"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="600" height="480" fill="#0E1F2B"/>
    <!-- crosshatch lab tile -->
    <g stroke="#1B3344" stroke-width="1" opacity="0.3">
      ${Array.from({length:10}, (_,i) => `<line x1="0" y1="${i*50}" x2="600" y2="${i*50}"/>`).join("")}
      ${Array.from({length:13}, (_,i) => `<line x1="${i*50}" y1="0" x2="${i*50}" y2="480"/>`).join("")}
    </g>
  `;

  // top section: chromosome (DNA)
  svg += `
    <text x="20" y="30" fill="#5C7E92" font-family="SF Mono, Menlo, monospace" font-size="11" font-weight="700">CHROMOSOME</text>
    <g transform="translate(20,46)">
      <rect x="0" y="0" width="560" height="38" rx="6" fill="url(#dnaG)" stroke="#3F8F5C" stroke-width="2"/>
      <!-- helix marks -->
      ${Array.from({length:18}, (_,i)=>`<line x1="${20+i*30}" y1="6" x2="${30+i*30}" y2="32" stroke="#103D1F" stroke-width="1.5"/>`).join("")}
      <!-- target gene rectangle -->
      ${stage >= 1 ? '<rect x="180" y="-4" width="200" height="46" fill="none" stroke="#E0C46A" stroke-width="2" stroke-dasharray="4 3" rx="3"/><text x="280" y="-8" text-anchor="middle" fill="#E0C46A" font-family="SF Mono, monospace" font-size="11" font-weight="700">INSULIN GENE</text>' : ''}
      ${stage >= 2 ? '<line x1="178" y1="-8" x2="178" y2="42" stroke="#E26A6A" stroke-width="2.5"/><line x1="382" y1="-8" x2="382" y2="42" stroke="#E26A6A" stroke-width="2.5"/><text x="178" y="56" text-anchor="middle" fill="#E26A6A" font-size="11" font-family="SF Mono, monospace">EcoRI cut</text>' : ''}
    </g>
  `;

  // middle section: plasmid (a ring)
  const plasmidY = 250;
  const cx = 200, cy = plasmidY;
  svg += `<text x="20" y="160" fill="#5C7E92" font-family="SF Mono, monospace" font-size="11" font-weight="700">PLASMID VECTOR</text>`;
  // ring (circular DNA) — open if cut
  if (plasmidCut && !recombinant) {
    svg += `<path d="M ${cx-60} ${cy} A 60 60 0 1 1 ${cx+60} ${cy}" stroke="#6FE08F" stroke-width="5" fill="none"/>`;
    svg += `<circle cx="${cx-60}" cy="${cy}" r="4" fill="#E26A6A"/><circle cx="${cx+60}" cy="${cy}" r="4" fill="#E26A6A"/>`;
  } else if (recombinant) {
    // ring with inserted gene segment
    svg += `<circle cx="${cx}" cy="${cy}" r="60" stroke="#6FE08F" stroke-width="5" fill="none"/>`;
    svg += `<path d="M ${cx-60} ${cy} A 60 60 0 0 1 ${cx+60} ${cy}" stroke="#E0C46A" stroke-width="6" fill="none"/>`;
    svg += `<text x="${cx}" y="${cy+90}" text-anchor="middle" fill="#E0C46A" font-family="SF Mono, monospace" font-size="11">+ insulin gene</text>`;
  } else {
    svg += `<circle cx="${cx}" cy="${cy}" r="60" stroke="#6FE08F" stroke-width="5" fill="none"/>`;
  }
  // marker label
  svg += `<text x="${cx}" y="${cy+5}" text-anchor="middle" fill="#4FD0E0" font-family="SF Mono, monospace" font-size="10">amp^R</text>`;

  // gene fragment (after cut)
  if (cutWith && !recombinant) {
    svg += `<g transform="translate(360,${plasmidY - 25})">
      <rect x="0" y="0" width="180" height="40" rx="6" fill="url(#dnaG)" stroke="#3F8F5C" stroke-width="2"/>
      <text x="90" y="56" text-anchor="middle" fill="#E0C46A" font-family="SF Mono, monospace" font-size="11">isolated insulin gene</text>
      <circle cx="0" cy="20" r="4" fill="#E26A6A"/><circle cx="180" cy="20" r="4" fill="#E26A6A"/>
    </g>`;
  }

  // bottom section: bacteria (only at stage 5)
  if (stage === 4) {
    svg += `<text x="20" y="380" fill="#5C7E92" font-family="SF Mono, monospace" font-size="11" font-weight="700">E. COLI ON ANTIBIOTIC PLATE</text>`;
    // 3 bacteria, only one survives (taken up plasmid)
    const positions = [
      { x: 130, y: 430, takes: false, label: "no plasmid" },
      { x: 300, y: 430, takes: true,  label: "recombinant" },
      { x: 470, y: 430, takes: false, label: "no plasmid" },
    ];
    positions.forEach((p, i) => {
      const cls = p.takes ? "bact" : "bact";
      const colour = p.takes ? "#6FE08F" : "#5C7E92";
      const stroke = p.takes ? "#FFF" : "#1B3344";
      svg += `<g class="${cls}" data-correct="${p.takes}" transform="translate(${p.x},${p.y})">
        <ellipse cx="0" cy="0" rx="30" ry="18" fill="${colour}" stroke="${stroke}" stroke-width="2" opacity="${p.takes?1:0.4}"/>
        <ellipse cx="0" cy="-3" rx="10" ry="5" fill="#0E1F2B" opacity="0.3"/>
        ${p.takes ? '<circle cx="-6" cy="-1" r="2" fill="#E0C46A"/><circle cx="6" cy="2" r="2" fill="#E0C46A"/>' : ''}
        <text x="0" y="40" text-anchor="middle" fill="#5C7E92" font-family="SF Mono, monospace" font-size="10">${p.label}</text>
      </g>`;
    });
  } else if (stage > 4 || transformed) {
    svg += `<text x="20" y="380" fill="#5C7E92" font-family="SF Mono, monospace" font-size="11" font-weight="700">SURVIVING COLONY</text>`;
    svg += `<g transform="translate(300,430)"><ellipse cx="0" cy="0" rx="34" ry="20" fill="#6FE08F" stroke="#FFF" stroke-width="2.5" filter="drop-shadow(0 0 8px #6FE08F)"/><text x="0" y="44" text-anchor="middle" fill="#6FE08F" font-family="SF Mono, monospace" font-size="11">recombinant</text></g>`;
  }

  vizSvg.innerHTML = svg;

  if (stage === 4) {
    vizSvg.querySelectorAll(".bact").forEach(g => {
      g.addEventListener("click", () => {
        const ok = g.dataset.correct === "true";
        if (ok) {
          g.classList.add("taken");
          handleStage(true);
        } else {
          handleStage(false, "That colony has no plasmid — so no antibiotic resistance — it shouldn't grow on this plate. Pick the bright green one.");
        }
      });
    });
  }
}

startStage(0);
