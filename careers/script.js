// Careers — A Day at the Café
// 6 scenes. Each is a workplace dilemma with 3-4 choices. Choices earn (or
// lose) points across 6 employability skills.

const SKILLS = [
  { id: "punc",   name: "Punctuality" },
  { id: "comm",   name: "Communication" },
  { id: "team",   name: "Teamwork" },
  { id: "init",   name: "Initiative" },
  { id: "safe",   name: "Health & Safety" },
  { id: "cust",   name: "Customer service" },
];
const skillName = id => SKILLS.find(s => s.id === id).name;

const SCENES = [
  {
    clock: "08:55",
    title: "Running late",
    body: "Your bus is stuck in traffic and you'll be 15 minutes late to your 9 a.m. shift. Your phone is in your pocket. What do you do?",
    opts: [
      { letter: "A", text: "Phone the café now to explain and apologise.",   skills: [ ["comm", +1], ["punc", +1] ], outcome: { good: true, title: "Solid call.", body: "You phoned ahead. The manager appreciates the heads-up — they can cover the till until you arrive. Honest communication keeps trust." } },
      { letter: "B", text: "Say nothing — hope they don't notice.",          skills: [ ["punc", -1], ["comm", -1] ], outcome: { good: false, title: "Awkward arrival.", body: "You sneak in but customers were queueing without service. The manager has a quiet word — silence in a tricky moment makes things worse." } },
      { letter: "C", text: "Pretend the bus broke down even though it didn't.", skills: [ ["comm", -1] ], outcome: { good: false, title: "It usually unravels.", body: "Stories that aren't true tend to be checked. Honest communication earns trust; a small lie loses it." } },
    ]
  },
  {
    clock: "09:30",
    title: "An angry customer",
    body: "A customer received the wrong order and is annoyed. They raise their voice at you across the counter. What's the best move?",
    opts: [
      { letter: "A", text: "Apologise calmly, take the order back and offer to remake it.", skills: [ ["cust", +1], ["comm", +1] ], outcome: { good: true, title: "De-escalated.", body: "Acknowledging the problem and offering a fix turns a complaint into a positive interaction. The customer leaves happy." } },
      { letter: "B", text: "Argue back — it wasn't your mistake.",             skills: [ ["cust", -1], ["comm", -1] ], outcome: { good: false, title: "Now it's bigger.", body: "Even if it wasn't your mistake, customers don't want a defensive employee. The complaint escalates to the manager." } },
      { letter: "C", text: "Stand silently and freeze.",                       skills: [ ["comm", -1] ], outcome: { good: false, title: "Missed moment.", body: "Saying nothing leaves the customer feeling ignored. A few calm words go a long way." } },
    ]
  },
  {
    clock: "10:45",
    title: "A spill on the floor",
    body: "A customer drops a coffee. There's a puddle in the middle of the floor and the next customer is heading towards it.",
    opts: [
      { letter: "A", text: "Stop the next customer, grab a wet floor sign and clean the spill straight away.", skills: [ ["safe", +1], ["init", +1] ], outcome: { good: true, title: "Hazard handled.", body: "Wet floors are a slip hazard. Marking the spill and cleaning quickly is exactly the right H&S response." } },
      { letter: "B", text: "Leave it — someone else will get it.",            skills: [ ["safe", -1], ["init", -1] ], outcome: { good: false, title: "Near miss.", body: "A customer slips. Workplaces expect everyone to deal with hazards — not just whoever's job 'cleaning' is on the rota." } },
      { letter: "C", text: "Tell the customer it's their fault and walk away.", skills: [ ["cust", -1], ["safe", -1] ], outcome: { good: false, title: "Two problems now.", body: "The customer is upset AND the floor is still wet. The shop is also liable if anyone is injured." } },
    ]
  },
  {
    clock: "12:15",
    title: "A quiet ten minutes",
    body: "The café has gone quiet. There are no customers in the queue. Your phone is in your pocket and you're tired.",
    opts: [
      { letter: "A", text: "Wipe down the tables and refill the napkin holders.", skills: [ ["init", +1] ], outcome: { good: true, title: "Initiative.", body: "Spotting work that needs doing without being told is the single skill most employers value above all." } },
      { letter: "B", text: "Scroll on your phone behind the counter.",       skills: [ ["init", -1] ], outcome: { good: false, title: "Spotted.", body: "Phones out is the fastest way to lose a Saturday job. Even quiet shifts have work that needs doing." } },
      { letter: "C", text: "Ask the manager if there's anything to do.",     skills: [ ["init", +1], ["comm", +1] ], outcome: { good: true, title: "Asked the right question.", body: "Not as proactive as just doing something useful, but better than waiting. Managers like staff who ask." } },
    ]
  },
  {
    clock: "13:40",
    title: "Disagreement with a coworker",
    body: "You and another team member disagree about who's been on tills the longest and should get the next break first.",
    opts: [
      { letter: "A", text: "Let them go first — your break can wait.",       skills: [ ["team", +1] ], outcome: { good: true, title: "Teamwork.", body: "Small acts of goodwill build a team that covers for each other when it matters. The shift runs smoother." } },
      { letter: "B", text: "Insist loudly that you're first.",               skills: [ ["team", -1], ["comm", -1] ], outcome: { good: false, title: "Friction.", body: "A small disagreement turns into bad atmosphere for the rest of the shift. Picking your battles matters." } },
      { letter: "C", text: "Ask the manager to settle it.",                  skills: [ ["comm", +1] ], outcome: { good: true, title: "Reasonable.", body: "Asking the boss isn't a failure — it's appropriate when something genuinely affects the rota. Half-credit." } },
    ]
  },
  {
    clock: "16:55",
    title: "End of shift",
    body: "Your shift officially ends at 5 p.m. The kitchen is in a mess and the closing team won't arrive until 5.15.",
    opts: [
      { letter: "A", text: "Stack the chairs and stay 10 minutes to help the closing team get started.", skills: [ ["team", +1], ["init", +1] ], outcome: { good: true, title: "Memorable.", body: "Going slightly beyond what's required is what gets you re-hired in the summer. The closing team notices." } },
      { letter: "B", text: "Walk out at 5 p.m. on the dot.",                 skills: [], outcome: { good: true, title: "Within your rights.", body: "Leaving on time is fine — you're not paid past your hours. But the closing team will remember who helps." } },
      { letter: "C", text: "Leave early at 4.55 — the manager won't notice.", skills: [ ["punc", -1] ], outcome: { good: false, title: "They notice.", body: "Punctuality runs in both directions — clocking out early is just as visible as clocking in late." } },
    ]
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
function ding() { tone(660, 80, "triangle", 0.05); setTimeout(()=>tone(990,100,"triangle",0.05),70); }
function buzz() { tone(180, 200, "sawtooth", 0.05); }
function fanfare() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,200,"triangle",0.05),i*110)); }

// ---- DOM
const sceneClock = document.getElementById("sceneClock");
const sceneTitle = document.getElementById("sceneTitle");
const sceneBody = document.getElementById("sceneBody");
const sceneOptions = document.getElementById("sceneOptions");
const sceneOutcome = document.getElementById("sceneOutcome");
const outcomeTitle = document.getElementById("outcomeTitle");
const outcomeBody = document.getElementById("outcomeBody");
const skillsBadges = document.getElementById("skillsBadges");
const btnNext = document.getElementById("btnNext");
const sIdx = document.getElementById("sIdx");
const sTotal = document.getElementById("sTotal");
const skillsEarned = document.getElementById("skillsEarned");
const skillList = document.getElementById("skillList");
const jobResult = document.getElementById("jobResult");
const resultTitle = document.getElementById("resultTitle");
const resultMsg = document.getElementById("resultMsg");
const resultSkills = document.getElementById("resultSkills");

let scene = 0;
let skillScore = {};
SKILLS.forEach(s => skillScore[s.id] = 0);
const MAX_PER_SKILL = 2; // 6 scenes × up to 1 per skill -> realistically 2 visible pips

sTotal.textContent = SCENES.length;

function renderSkillList() {
  skillList.innerHTML = "";
  SKILLS.forEach(s => {
    const v = Math.max(0, skillScore[s.id]);
    const lost = skillScore[s.id] < 0;
    const li = document.createElement("li");
    li.className = "skill-row";
    li.innerHTML = `<span class="skill-name">${s.name}</span><span class="skill-pips" id="pip-${s.id}"></span>`;
    skillList.appendChild(li);
    const pip = li.querySelector(".skill-pips");
    for (let i = 0; i < MAX_PER_SKILL; i++) {
      const p = document.createElement("span");
      p.className = "skill-pip" + (i < v ? " on" : "") + (lost && i === 0 ? " lost" : "");
      pip.appendChild(p);
    }
  });
  // count earned pips total
  const total = SKILLS.reduce((s, sk) => s + Math.max(0, Math.min(MAX_PER_SKILL, skillScore[sk.id])), 0);
  skillsEarned.textContent = `${total} / ${SKILLS.length * MAX_PER_SKILL}`;
}

function renderScene() {
  const s = SCENES[scene];
  sceneClock.textContent = s.clock;
  sceneTitle.textContent = s.title;
  sceneBody.textContent = s.body;
  sIdx.textContent = scene + 1;
  sceneOptions.innerHTML = "";
  sceneOutcome.hidden = true;
  // shuffle for variety
  const shuffled = [...s.opts].sort(() => Math.random() - 0.5).map((o, i) => ({ ...o, letter: String.fromCharCode(65 + i) }));
  shuffled.forEach(o => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "scene-opt";
    b.innerHTML = `<span class="opt-letter">${o.letter}</span><span>${o.text}</span>`;
    b.addEventListener("click", () => choose(o, b));
    sceneOptions.appendChild(b);
  });
}

function choose(opt, btn) {
  document.querySelectorAll(".scene-opt").forEach(x => x.disabled = true);
  btn.classList.add("picked", opt.outcome.good ? "good" : "bad");
  // apply skill changes
  opt.skills.forEach(([id, delta]) => { skillScore[id] += delta; });
  // outcome panel
  sceneOutcome.hidden = false;
  sceneOutcome.className = "scene-outcome" + (opt.outcome.good ? "" : " bad");
  outcomeTitle.textContent = opt.outcome.title;
  outcomeBody.textContent = opt.outcome.body;
  skillsBadges.innerHTML = "";
  opt.skills.forEach(([id, delta]) => {
    const chip = document.createElement("span");
    chip.className = "skill-chip" + (delta < 0 ? " lost" : "");
    chip.textContent = (delta > 0 ? "+ " : "− ") + skillName(id);
    skillsBadges.appendChild(chip);
  });
  if (opt.skills.length === 0) {
    const chip = document.createElement("span");
    chip.className = "skill-chip";
    chip.style.background = "#6E7C8C";
    chip.textContent = "No skill change";
    skillsBadges.appendChild(chip);
  }
  if (opt.outcome.good) ding(); else buzz();
  renderSkillList();
}

btnNext.addEventListener("click", () => {
  scene++;
  if (scene >= SCENES.length) finishShift();
  else renderScene();
});

function finishShift() {
  jobResult.hidden = false;
  document.querySelector(".scene-card").hidden = true;
  // total positive pips earned
  const earned = SKILLS.reduce((s, sk) => s + Math.max(0, Math.min(MAX_PER_SKILL, skillScore[sk.id])), 0);
  let title, msg;
  if (earned >= 10) { title = "Manager wants you on next Saturday."; msg = `${earned} of 12 skill pips earned. They'll definitely call you back.`; fanfare(); }
  else if (earned >= 7) { title = "Solid shift."; msg = `${earned} of 12 skill pips earned. A few areas to sharpen.`; fanfare(); }
  else if (earned >= 4) { title = "Mixed shift."; msg = `${earned} of 12 skill pips earned. Worth re-running and trying different choices.`; }
  else { title = "Rocky day."; msg = `${earned} of 12 skill pips earned. Have another go — the outcome panels explain what each choice signals to an employer.`; }
  resultTitle.textContent = title;
  resultMsg.textContent = msg;
  // skills earned chips
  resultSkills.innerHTML = "";
  SKILLS.forEach(s => {
    const v = Math.max(0, Math.min(MAX_PER_SKILL, skillScore[s.id]));
    if (v === 0) return;
    const chip = document.createElement("span");
    chip.className = "skill-chip";
    chip.textContent = `${s.name} ${"★".repeat(v)}`;
    resultSkills.appendChild(chip);
  });
}

document.getElementById("btnRestart").addEventListener("click", restart);
document.getElementById("btnAgain").addEventListener("click", restart);
function restart() {
  scene = 0;
  SKILLS.forEach(s => skillScore[s.id] = 0);
  jobResult.hidden = true;
  document.querySelector(".scene-card").hidden = false;
  renderScene();
  renderSkillList();
}

renderScene();
renderSkillList();
