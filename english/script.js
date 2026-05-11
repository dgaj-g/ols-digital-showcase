// English — Rhetorical Devices Identifier
// 3 famous speeches. Each has underlined zones. Click a zone → choose which
// device it uses from a multi-choice list. Score per zone.

const DEVICES = [
  { id: "anaphora",    name: "Anaphora",            gloss: "Repeating the same word or phrase at the start of successive clauses or sentences. Builds rhythm and emphasis." },
  { id: "tricolon",    name: "Rule of three",       gloss: "Three parallel ideas grouped together. Memorable and persuasive (e.g. \"life, liberty and the pursuit of happiness\")." },
  { id: "alliteration",name: "Alliteration",        gloss: "Repetition of the same initial consonant sound across nearby words. Adds musical force." },
  { id: "metaphor",    name: "Metaphor",            gloss: "Describing one thing as if it were another, without using \"like\" or \"as\"." },
  { id: "rhetorical",  name: "Rhetorical question", gloss: "A question asked for effect, not to invite an answer. Engages the listener." },
  { id: "antithesis",  name: "Antithesis",          gloss: "Placing opposites in parallel structure to highlight contrast." },
  { id: "parallelism", name: "Parallelism",         gloss: "Repeating grammatical structure across phrases or clauses for balance and clarity." },
  { id: "repetition",  name: "Repetition",          gloss: "Repeating a word or phrase for emphasis (not necessarily at the start of clauses)." },
];

function deviceById(id) { return DEVICES.find(d => d.id === id); }

// Speeches with "zones" — phrases that are clickable and tagged with a device.
// Body is plain HTML; zones are <span data-d="deviceId">text</span> markers
// inserted directly into the body. The script renders zone IDs and tracks
// them.
const SPEECHES = [
  {
    tag: "United States · 28 August 1963",
    title: "I Have a Dream",
    speaker: "Martin Luther King Jr., Washington D.C.",
    body: `<p>Five score years ago, a great American, in whose symbolic shadow we stand, signed the Emancipation Proclamation. But one hundred years later, the Negro still is not free. <span class="device-zone" data-d="metaphor" data-zid="m1">One hundred years later, the life of the Negro is still sadly crippled by the manacles of segregation and the chains of discrimination.</span></p>
<p><span class="device-zone" data-d="anaphora" data-zid="m2">I have a dream that one day this nation will rise up and live out the true meaning of its creed. I have a dream that one day on the red hills of Georgia the sons of former slaves and the sons of former slave owners will be able to sit down together at the table of brotherhood. I have a dream that one day even the state of Mississippi, a state sweltering with the heat of injustice, will be transformed into an oasis of freedom and justice.</span></p>
<p>And so let freedom ring. <span class="device-zone" data-d="tricolon" data-zid="m3">Let freedom ring from the prodigious hilltops of New Hampshire. Let freedom ring from the mighty mountains of New York. Let freedom ring from the heightening Alleghenies of Pennsylvania.</span></p>
<p><span class="device-zone" data-d="alliteration" data-zid="m4">From every mountainside, let freedom ring.</span></p>`,
  },
  {
    tag: "United Kingdom · 4 June 1940",
    title: "We Shall Fight on the Beaches",
    speaker: "Winston Churchill, House of Commons",
    body: `<p>Even though large tracts of Europe and many old and famous states have fallen, we shall not flag or fail. <span class="device-zone" data-d="anaphora" data-zid="c1">We shall go on to the end. We shall fight in France. We shall fight on the seas and oceans. We shall fight with growing confidence and growing strength in the air. We shall defend our island, whatever the cost may be.</span></p>
<p><span class="device-zone" data-d="tricolon" data-zid="c2">We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields and in the streets.</span></p>
<p>We shall <span class="device-zone" data-d="repetition" data-zid="c3">never surrender</span>. And if, which I do not for a moment believe, this island or a large part of it were subjugated and starving, then our Empire beyond the seas, armed and guarded by the British Fleet, would carry on the struggle.</p>`,
  },
  {
    tag: "United States · 20 January 1961",
    title: "Inaugural Address",
    speaker: "John F. Kennedy, Washington D.C.",
    body: `<p>We observe today not a victory of party but a celebration of freedom — symbolising an end as well as a beginning, signifying renewal as well as change. <span class="device-zone" data-d="antithesis" data-zid="k1">And so, my fellow Americans: ask not what your country can do for you — ask what you can do for your country.</span></p>
<p><span class="device-zone" data-d="rhetorical" data-zid="k2">Will you join in that historic effort?</span> In the long history of the world, only a few generations have been granted the role of defending freedom in its hour of maximum danger.</p>
<p>Let every nation know, whether it wishes us well or ill, that <span class="device-zone" data-d="tricolon" data-zid="k3">we shall pay any price, bear any burden, meet any hardship</span> in the defence of liberty.</p>
<p><span class="device-zone" data-d="alliteration" data-zid="k4">Let us go forth to lead the land we love.</span></p>`,
  },
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
function click() { tone(700, 50, "triangle", 0.04); }
function ding()  { tone(660, 80, "triangle", 0.05); setTimeout(()=>tone(990,100,"triangle",0.05), 70); }
function buzz()  { tone(180, 200, "sawtooth", 0.05); }
function fanfare() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05),i*110)); }

// ---- Glossary
const glossGrid = document.getElementById("glossGrid");
DEVICES.forEach(d => {
  const div = document.createElement("div");
  div.innerHTML = `<strong>${d.name}</strong>${d.gloss}`;
  glossGrid.appendChild(div);
});

// ---- DOM
const speechMeta = document.getElementById("speechMeta");
const speechTitle = document.getElementById("speechTitle");
const speechSpeaker = document.getElementById("speechSpeaker");
const speechBody = document.getElementById("speechBody");
const sIdxEl = document.getElementById("sIdx");
const sTotal = document.getElementById("sTotal");
const foundN = document.getElementById("foundN");
const totalN = document.getElementById("totalN");
const scoreN = document.getElementById("scoreN");
const askCard = document.getElementById("askCard");
const askPrompt = document.getElementById("askPrompt");
const askOptions = document.getElementById("askOptions");
const rhetFeedback = document.getElementById("rhetFeedback");
const btnNext = document.getElementById("btnNextSpeech");
const btnAgain = document.getElementById("btnAgain");
const rhetResult = document.getElementById("rhetResult");
const resultTitle = document.getElementById("resultTitle");
const resultMsg = document.getElementById("resultMsg");
const btnGlossary = document.getElementById("btnGlossary");

let speechIdx = 0;
let totalScore = 0;
let foundThisSpeech = 0;
let zonesThisSpeech = 0;

sTotal.textContent = SPEECHES.length;

function renderSpeech() {
  const s = SPEECHES[speechIdx];
  speechMeta.textContent = s.tag;
  speechTitle.textContent = s.title;
  speechSpeaker.textContent = s.speaker;
  speechBody.innerHTML = s.body;
  sIdxEl.textContent = speechIdx + 1;
  foundThisSpeech = 0;
  foundN.textContent = "0";
  // count zones
  const zones = speechBody.querySelectorAll(".device-zone");
  zonesThisSpeech = zones.length;
  totalN.textContent = zones.length;
  askCard.hidden = true;
  rhetFeedback.innerHTML = "Tap any underlined phrase in the speech above to identify its device.";
  rhetFeedback.className = "rhet-feedback";
  btnNext.hidden = true;
  zones.forEach(z => z.addEventListener("click", () => openAsk(z)));
}

function openAsk(z) {
  if (z.classList.contains("done")) return;
  askCard.hidden = false;
  // make 4 options: correct + 3 random distractors
  const correct = z.dataset.d;
  const others = DEVICES.filter(d => d.id !== correct).sort(() => Math.random() - 0.5).slice(0, 3);
  const opts = [correct, ...others.map(d => d.id)].sort(() => Math.random() - 0.5);
  const phrase = z.innerText.slice(0, 80) + (z.innerText.length > 80 ? "…" : "");
  askPrompt.innerHTML = `Which device is being used in "<em>${phrase}</em>"?`;
  askOptions.innerHTML = "";
  opts.forEach(id => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ask-opt";
    b.textContent = deviceById(id).name;
    b.addEventListener("click", () => answerAsk(z, id, b, correct));
    askOptions.appendChild(b);
  });
  // scroll to ask card so it's visible
  askCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function answerAsk(zone, picked, btn, correctId) {
  document.querySelectorAll(".ask-opt").forEach(x => x.disabled = true);
  if (picked === correctId) {
    btn.classList.add("correct");
    zone.classList.add("done");
    foundThisSpeech++;
    totalScore++;
    foundN.textContent = foundThisSpeech;
    scoreN.textContent = totalScore;
    rhetFeedback.innerHTML = `<strong>Correct.</strong> ${deviceById(correctId).name} — ${deviceById(correctId).gloss}`;
    rhetFeedback.className = "rhet-feedback ok";
    ding();
    setTimeout(() => { askCard.hidden = true; }, 1200);
    if (foundThisSpeech === zonesThisSpeech) {
      if (speechIdx < SPEECHES.length - 1) btnNext.hidden = false;
      else showResults();
    }
  } else {
    btn.classList.add("wrong");
    zone.classList.add("wrong");
    rhetFeedback.innerHTML = `<strong>Not quite.</strong> That's not ${deviceById(picked).name}. Look again — the correct device is highlighted in green when you find it.`;
    rhetFeedback.className = "rhet-feedback bad";
    buzz();
    // allow retry after a beat
    setTimeout(() => {
      document.querySelectorAll(".ask-opt").forEach(x => x.disabled = false);
      btn.classList.remove("wrong");
      zone.classList.remove("wrong");
    }, 1500);
  }
}

function showResults() {
  rhetResult.hidden = false;
  const total = SPEECHES.reduce((s, sp) => s + (sp.body.match(/device-zone/g) || []).length, 0);
  let title, msg;
  if (totalScore === total) { title = "Every device identified."; msg = `${totalScore} / ${total}. A clean run through three legendary speeches.`; fanfare(); }
  else if (totalScore >= total - 2) { title = "Strong reading."; msg = `${totalScore} / ${total}. Revisit the glossary, then have another go.`; fanfare(); }
  else { title = "Round complete."; msg = `${totalScore} / ${total}. Try the glossary panel above and play again to push the score up.`; }
  resultTitle.textContent = title;
  resultMsg.textContent = msg;
}

btnNext.addEventListener("click", () => {
  speechIdx++;
  renderSpeech();
});
btnAgain.addEventListener("click", () => {
  speechIdx = 0;
  totalScore = 0;
  scoreN.textContent = "0";
  rhetResult.hidden = true;
  renderSpeech();
});
btnGlossary.addEventListener("click", () => {
  const g = document.getElementById("glossaryPanel");
  g.open = !g.open;
});

renderSpeech();
