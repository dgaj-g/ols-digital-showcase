// Government and Politics — The Evolution of the US Presidency
// Timeline view: click any president to read the power they shaped.
// Match mode: read a "moment in time" prompt, pick the right president.

const PRESIDENTS = [
  {
    id: "washington", initials: "GW", name: "Washington",
    years: "1789–1797",
    power: "Setting precedents",
    body: "As the first president, Washington created precedents that have shaped the office ever since. He declined to be addressed as 'Your Majesty', limited himself to two terms (a convention until FDR), assembled a Cabinet, and asserted the right of the President to negotiate treaties — establishing the executive as a separate, equal branch."
  },
  {
    id: "jefferson", initials: "TJ", name: "Jefferson",
    years: "1801–1809",
    power: "Executive deal-making",
    body: "Jefferson doubled the size of the United States with the <strong>Louisiana Purchase</strong> in 1803, buying ~828,000 sq miles from France for $15 million. He acted without express constitutional authority — establishing that presidents can take bold executive actions when opportunity strikes, even where the Constitution is silent."
  },
  {
    id: "jackson", initials: "AJ", name: "Jackson",
    years: "1829–1837",
    power: "The veto as a political weapon",
    body: "Jackson used the veto more than all his predecessors combined and was the first to use it for purely political reasons — most famously to kill the Second Bank of the United States. He framed himself as the people's tribune against Congress and the courts, transforming the presidency from administrator-in-chief into a popularly mandated leader."
  },
  {
    id: "lincoln", initials: "AL", name: "Lincoln",
    years: "1861–1865",
    power: "War powers",
    body: "Lincoln stretched executive power further than any predecessor during the Civil War: he suspended <em>habeas corpus</em>, expanded the army without Congress's prior approval, issued the <strong>Emancipation Proclamation</strong> as an executive war measure, and ran a wartime administration largely from the White House. He set the template for presidents to claim wide latitude in emergencies."
  },
  {
    id: "troosevelt", initials: "TR", name: "T. Roosevelt",
    years: "1901–1909",
    power: "The 'stewardship' theory",
    body: "Theodore Roosevelt argued that the president had a duty to do anything the nation needed unless the Constitution explicitly forbade it. He used this 'stewardship' doctrine to break up trusts, regulate railroads, conserve millions of acres of public land, and intervene in labour disputes — vastly expanding the regulatory state."
  },
  {
    id: "fdr", initials: "FDR", name: "F. D. Roosevelt",
    years: "1933–1945",
    power: "The modern administrative state",
    body: "FDR remade the presidency. The <strong>New Deal</strong> created dozens of federal agencies (SEC, FCC, Social Security) and centralised economic regulation in the executive. He issued more executive orders than any other president (over 3,700) and won an unprecedented four elections, prompting the 22nd Amendment limiting future presidents to two terms."
  },
  {
    id: "nixon", initials: "RN", name: "Nixon",
    years: "1969–1974",
    power: "The 'imperial presidency'",
    body: "Nixon pushed executive secrecy and unilateral foreign-policy action to new highs — the secret bombing of Cambodia, impoundment of Congressionally-appropriated funds, the use of intelligence agencies against political opponents. Watergate ended his presidency and triggered reforms (the 1974 Budget Act, the FISA Act) designed to constrain future executives."
  },
  {
    id: "obama", initials: "BO", name: "Obama",
    years: "2009–2017",
    power: "Executive orders & deferred action",
    body: "Faced with a Congress unwilling to legislate on immigration, Obama used executive action to create <strong>DACA</strong> (Deferred Action for Childhood Arrivals) — protecting around 800,000 undocumented young people from deportation. He also expanded the use of executive orders to enact climate regulation, illustrating how modern presidents legislate-by-pen when Congress is gridlocked."
  },
];

// Match mode questions
const MATCH_QS = [
  { presId: "washington", prompt: "Refused the title 'Your Majesty', kept the office to two terms by convention, and created the Cabinet system — setting the template for every president to follow." },
  { presId: "jefferson",  prompt: "Doubled the size of the United States in <strong>1803</strong> by buying Louisiana from France, even though the Constitution didn't explicitly authorise it." },
  { presId: "jackson",    prompt: "Used the presidential veto more than all his predecessors combined and framed himself as the people's champion against Congress." },
  { presId: "lincoln",    prompt: "Suspended <em>habeas corpus</em>, ran a wartime White House, and issued the Emancipation Proclamation as an executive war measure." },
  { presId: "troosevelt", prompt: "Argued the president must do anything the country needs unless the Constitution explicitly forbids it — used this to break up trusts and conserve federal land." },
  { presId: "fdr",        prompt: "Created the modern administrative state through the New Deal and was elected four times — prompting the 22nd Amendment." },
  { presId: "nixon",      prompt: "Authorised secret foreign-policy actions, impounded congressional funds, and resigned after the Watergate scandal — sparking laws to constrain executive power." },
  { presId: "obama",      prompt: "Used executive action to create <strong>DACA</strong> after Congress refused to legislate on immigration reform." },
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
function ding() { tone(660, 80, "triangle", 0.05); setTimeout(()=>tone(990,100,"triangle",0.05),70); }
function buzz() { tone(180, 200, "sawtooth", 0.05); }
function fanfare() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05),i*110)); }

// ---- Timeline render ----
const timeline = document.getElementById("potusTimeline");
const detail = document.getElementById("potusDetail");
PRESIDENTS.forEach(p => {
  const c = document.createElement("button");
  c.type = "button";
  c.className = "potus-card";
  c.dataset.id = p.id;
  c.innerHTML = `
    <div class="potus-portrait">${p.initials}</div>
    <div class="potus-year">${p.years}</div>
    <div class="potus-name">${p.name}</div>
  `;
  c.addEventListener("click", () => {
    document.querySelectorAll(".potus-card.active").forEach(x => x.classList.remove("active"));
    c.classList.add("active");
    showDetail(p);
  });
  timeline.appendChild(c);
});

function showDetail(p) {
  detail.innerHTML = `
    <header class="detail-head">
      <h2 class="detail-name">${p.name}</h2>
      <p class="detail-meta">${p.years} · ${p.power.toUpperCase()}</p>
    </header>
    <span class="detail-power">${p.power}</span>
    <p class="detail-body">${p.body}</p>
  `;
}

// ---- Tabs ----
const tabTimeline = document.getElementById("tabTimeline");
const tabMatch = document.getElementById("tabMatch");
const paneTimeline = document.getElementById("paneTimeline");
const paneMatch = document.getElementById("paneMatch");
tabTimeline.addEventListener("click", () => { tabTimeline.classList.add("active"); tabMatch.classList.remove("active"); paneTimeline.hidden = false; paneMatch.hidden = true; });
tabMatch.addEventListener("click",    () => { tabMatch.classList.add("active"); tabTimeline.classList.remove("active"); paneTimeline.hidden = true; paneMatch.hidden = false; startMatch(); });

// ---- Match mode ----
const qIdx = document.getElementById("qIdx");
const qTotal = document.getElementById("qTotal");
const qScore = document.getElementById("qScore");
const qFeedback = document.getElementById("qFeedback");
const matchPrompt = document.getElementById("matchPrompt");
const matchPortraits = document.getElementById("matchPortraits");
const potusResult = document.getElementById("potusResult");
const resultTitle = document.getElementById("resultTitle");
const resultMsg = document.getElementById("resultMsg");

let order = [];
let mi = 0, ms = 0;

function startMatch() {
  order = [...Array(MATCH_QS.length).keys()].sort(() => Math.random() - 0.5);
  mi = 0; ms = 0;
  qScore.textContent = "0";
  qTotal.textContent = MATCH_QS.length;
  potusResult.hidden = true;
  nextMatch();
}

function nextMatch() {
  if (mi >= order.length) { finishMatch(); return; }
  const q = MATCH_QS[order[mi]];
  qIdx.textContent = mi + 1;
  matchPrompt.innerHTML = q.prompt;
  matchPortraits.innerHTML = "";
  // shuffle portraits each q
  const shuffled = [...PRESIDENTS].sort(() => Math.random() - 0.5);
  shuffled.forEach(p => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "match-portrait";
    b.dataset.id = p.id;
    b.innerHTML = `<div class="mp-circle">${p.initials}</div><div class="mp-name">${p.name}</div><div class="mp-year">${p.years}</div>`;
    b.addEventListener("click", () => handleMatch(p, q, b));
    matchPortraits.appendChild(b);
  });
  qFeedback.innerHTML = "Read the moment above, then tap the president responsible.";
  qFeedback.className = "potus-feedback";
}

function handleMatch(p, q, btn) {
  document.querySelectorAll(".match-portrait").forEach(x => x.disabled = true);
  if (p.id === q.presId) {
    btn.classList.add("correct");
    ms++;
    qScore.textContent = ms;
    const pres = PRESIDENTS.find(x => x.id === q.presId);
    qFeedback.innerHTML = `<strong>Correct — ${pres.name}.</strong> ${pres.power}.`;
    qFeedback.className = "potus-feedback ok";
    ding();
  } else {
    btn.classList.add("wrong");
    document.querySelector(`.match-portrait[data-id="${q.presId}"]`)?.classList.add("correct");
    const pres = PRESIDENTS.find(x => x.id === q.presId);
    qFeedback.innerHTML = `<strong>${pres.name} was the answer.</strong> ${pres.power}.`;
    qFeedback.className = "potus-feedback bad";
    buzz();
  }
  setTimeout(() => { mi++; nextMatch(); }, 1500);
}

function finishMatch() {
  potusResult.hidden = false;
  let t, m;
  if (ms === MATCH_QS.length) { t = "Constitutional scholar."; m = `${ms} / ${MATCH_QS.length}. Every moment matched correctly.`; fanfare(); }
  else if (ms >= 6) { t = "Strong reading."; m = `${ms} / ${MATCH_QS.length}. Use the timeline view to brush up on the misses.`; fanfare(); }
  else if (ms >= 4) { t = "Mid-range."; m = `${ms} / ${MATCH_QS.length}. Worth re-reading the timeline.`; }
  else { t = "Round complete."; m = `${ms} / ${MATCH_QS.length}. Timeline mode is the revision.`; }
  resultTitle.textContent = t;
  resultMsg.textContent = m;
}

document.getElementById("qReset").addEventListener("click", startMatch);
document.getElementById("qAgain").addEventListener("click", startMatch);
