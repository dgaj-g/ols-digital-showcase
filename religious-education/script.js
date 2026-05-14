// RE — Sacraments and Ordinances
// Two modes: side-by-side Catholic vs Protestant comparison for 7 sacraments,
// and a 10-question quiz matching statements to the right tradition.

const SACRAMENTS = [
  {
    id: "baptism", num: 1, name: "Baptism",
    note: "Both traditions baptise — but they disagree on when, how and what it does.",
    cath: {
      title: "A sacrament of initiation",
      body: "<p>Catholic teaching holds that <strong>baptism washes away original sin</strong> and marks entry into the Church. Most Catholic children are baptised as infants, by pouring water on the forehead in the name of the Father, Son and Holy Spirit.</p><p>Baptism is one of seven sacraments and is seen as conveying actual grace — not just a symbolic act.</p>"
    },
    prot: {
      title: "Either an ordinance of obedience or believer's baptism",
      body: "<p>Most Protestant traditions practise baptism, but views differ. Many <strong>infant-baptise</strong> (Church of Ireland, Presbyterian, Methodist). Baptists practise <strong>believer's baptism by full immersion</strong> — only those old enough to confess faith.</p><p>Most Protestants see baptism as an <em>outward sign of inward faith</em> — not a means of grace in itself.</p>"
    }
  },
  {
    id: "eucharist", num: 2, name: "Eucharist / Lord's Supper",
    note: "Bread and wine — but how and what they become divides the traditions sharply.",
    cath: {
      title: "Transubstantiation — bread and wine become Christ's body and blood",
      body: "<p>Catholic teaching is that during the Mass, the bread and wine <strong>are literally transformed</strong> into the Body and Blood of Christ, though they retain the outward appearances of bread and wine. This belief is called <em>transubstantiation</em>.</p><p>The Eucharist is the source and summit of Catholic life — Mass is celebrated daily; receiving communion is central.</p>"
    },
    prot: {
      title: "A memorial — or a spiritual presence",
      body: "<p>Most Protestant traditions reject transubstantiation. Many Reformed/Presbyterian churches see the Lord's Supper as a <strong>memorial</strong> — a remembrance of Christ's sacrifice (1 Cor 11:24).</p><p>Lutherans and some Anglicans hold a <em>real presence</em> view but not transubstantiation. Baptists and many evangelicals see it as primarily symbolic.</p>"
    }
  },
  {
    id: "confirmation", num: 3, name: "Confirmation",
    note: "A 'sealing' of baptism — practised in different ways or rejected entirely.",
    cath: {
      title: "A sacrament — the seal of the Holy Spirit",
      body: "<p>Confirmation is one of the seven Catholic sacraments. Through anointing with chrism by a bishop, the candidate is <strong>strengthened by the Holy Spirit</strong> and confirmed in the faith they were baptised into as a baby.</p><p>It marks a deeper personal commitment to the Church.</p>"
    },
    prot: {
      title: "Practised in some churches, absent in others",
      body: "<p>The Church of Ireland and Methodist Church practise confirmation as a <strong>public profession of faith</strong> — not as a sacrament that conveys grace, but as a rite where a person takes their baptismal promises for themselves.</p><p>Baptist and Pentecostal traditions usually do not practise confirmation at all — believer's baptism takes the place of that public profession.</p>"
    }
  },
  {
    id: "reconciliation", num: 4, name: "Reconciliation",
    note: "Catholic confession. Most Protestant traditions reject the need for a priest.",
    cath: {
      title: "Confession to a priest, absolution from God",
      body: "<p>Catholic teaching is that one can confess sins <strong>directly to God</strong>, but for serious sin the sacrament of reconciliation is required — confession to a priest, who, acting <em>in persona Christi</em>, gives absolution.</p><p>The priest is bound by the seal of confession not to disclose anything heard.</p>"
    },
    prot: {
      title: "Direct confession to God",
      body: "<p>The Reformation principle of the <strong>priesthood of all believers</strong> means most Protestants believe a Christian can confess sin <em>directly to God</em>, without needing a human intermediary.</p><p>Many Protestant churches still encourage confession to one another (James 5:16) but not as a sacrament.</p>"
    }
  },
  {
    id: "anointing", num: 5, name: "Anointing of the Sick",
    note: "Caring for the seriously ill — sacramental in Catholicism, pastoral in Protestantism.",
    cath: {
      title: "A sacrament — the anointing of the sick",
      body: "<p>A Catholic priest anoints the seriously ill, the dying or the elderly with oil, praying for healing and forgiveness. It was once called <em>Extreme Unction</em> or 'last rites' — but the modern emphasis is on healing and comfort, not only the moment of death.</p>"
    },
    prot: {
      title: "Prayer and visiting — not a sacrament",
      body: "<p>Protestant ministers visit and pray with the sick and dying, but generally do not see this as a sacrament. Some Anglicans practise a form of anointing, but for most Protestant traditions <strong>prayer and pastoral care</strong> are the response.</p>"
    }
  },
  {
    id: "marriage", num: 6, name: "Marriage",
    note: "Both traditions celebrate marriage — but only Catholics view it as a sacrament.",
    cath: {
      title: "A sacrament reflecting the love of Christ for the Church",
      body: "<p>Catholic marriage is a sacrament — a lifelong, indissoluble covenant between a man and a woman, mirroring the love of Christ for the Church. <strong>Divorce is not recognised</strong>; annulment is the only way a Catholic marriage can end while both parties live.</p>"
    },
    prot: {
      title: "A solemn covenant — but not a sacrament",
      body: "<p>Protestant traditions hold marriage in high regard but do <strong>not</strong> see it as a sacrament in the same sense as baptism or communion.</p><p>Most Protestant churches permit divorce in serious cases and allow remarriage in church afterwards.</p>"
    }
  },
  {
    id: "orders", num: 7, name: "Holy Orders",
    note: "The sacrament of ordination — and the question of who can be ordained.",
    cath: {
      title: "Ordination of priests, only men, celibate",
      body: "<p>Holy Orders is the sacrament by which men are ordained as deacons, priests or bishops. The Catholic priesthood is restricted to <strong>men</strong>, and in the Latin Rite priests are required to be <strong>celibate</strong>.</p><p>The bishop, through laying on of hands, conveys the sacrament.</p>"
    },
    prot: {
      title: "Ordination — open to women in most traditions, no celibacy",
      body: "<p>Most Protestant churches ordain ministers but do <strong>not</strong> see ordination as a sacrament. Most permit <strong>women to be ordained</strong> (Methodist, Presbyterian, Church of Ireland), and ministers may marry.</p>"
    }
  },
];

// quiz questions — statement + answer (catholic / protestant / both)
const QUESTIONS = [
  { stmt: "This ceremony is performed by a bishop anointing a young person with chrism, sealing them with the Holy Spirit.",          ans: "catholic" },
  { stmt: "Baptism is viewed primarily as an outward sign of an inward faith, not as a means of grace.",                             ans: "protestant" },
  { stmt: "During the Mass, the bread and wine are believed to become the actual Body and Blood of Christ.",                        ans: "catholic" },
  { stmt: "Baptism may be performed on infants by pouring water on the forehead.",                                                   ans: "both" },
  { stmt: "Marriage is regarded as a lifelong, indissoluble covenant — divorce is not recognised.",                                  ans: "catholic" },
  { stmt: "Believers confess their sins directly to God; no human intermediary is required.",                                        ans: "protestant" },
  { stmt: "The Lord's Supper / Eucharist commemorates Christ's death and is celebrated by the Christian community.",                 ans: "both" },
  { stmt: "Ministers may be married, and women may be ordained.",                                                                    ans: "protestant" },
  { stmt: "Anointing of the seriously ill or dying with oil is recognised as a sacrament.",                                          ans: "catholic" },
  { stmt: "Believers are expected to be baptised as a sign of faith and obedience — but the act itself doesn't confer salvation.",   ans: "protestant" },
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

// ---- Compare mode ----
const strip = document.getElementById("sacramentStrip");
const cathBody = document.getElementById("cathBody");
const protBody = document.getElementById("protBody");
const compareNote = document.getElementById("compareNote");

SACRAMENTS.forEach(s => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "sac-btn";
  b.dataset.id = s.id;
  b.innerHTML = `<span class="sac-num">${s.num}</span>${s.name}`;
  b.addEventListener("click", () => showSacrament(s, b));
  strip.appendChild(b);
});

function showSacrament(s, btn) {
  document.querySelectorAll(".sac-btn.active").forEach(x => x.classList.remove("active"));
  btn.classList.add("active");
  cathBody.innerHTML = `<h3>${s.cath.title}</h3>${s.cath.body}`;
  protBody.innerHTML = `<h3>${s.prot.title}</h3>${s.prot.body}`;
  compareNote.innerHTML = `<strong>Worth noting:</strong> ${s.note}`;
  tone(540, 50, "triangle", 0.03);
}
// open first by default
showSacrament(SACRAMENTS[0], strip.children[0]);

// ---- Tabs ----
const tabCompare = document.getElementById("tabCompare");
const tabQuiz = document.getElementById("tabQuiz");
const paneCompare = document.getElementById("paneCompare");
const paneQuiz = document.getElementById("paneQuiz");
tabCompare.addEventListener("click", () => { tabCompare.classList.add("active"); tabQuiz.classList.remove("active"); paneCompare.hidden = false; paneQuiz.hidden = true; });
tabQuiz.addEventListener("click",    () => { tabQuiz.classList.add("active"); tabCompare.classList.remove("active"); paneCompare.hidden = true; paneQuiz.hidden = false; startQuiz(); });

// ---- Quiz ----
const qIdx = document.getElementById("qIdx");
const qTotal = document.getElementById("qTotal");
const qScore = document.getElementById("qScore");
const qFeedback = document.getElementById("qFeedback");
const qStatement = document.getElementById("qStatement");
const qOpts = document.querySelectorAll(".q-opt");
const reResult = document.getElementById("reResult");
const resultTitle = document.getElementById("resultTitle");
const resultMsg = document.getElementById("resultMsg");

let queue = [];
let qi = 0, qs = 0;

function startQuiz() {
  queue = [...QUESTIONS].sort(() => Math.random() - 0.5);
  qi = 0; qs = 0;
  qScore.textContent = "0";
  qTotal.textContent = queue.length;
  reResult.hidden = true;
  nextQ();
}

function nextQ() {
  if (qi >= queue.length) { finish(); return; }
  qIdx.textContent = qi + 1;
  qStatement.innerHTML = `"${queue[qi].stmt}"`;
  qOpts.forEach(o => { o.classList.remove("correct","wrong"); o.disabled = false; });
  qFeedback.innerHTML = "Read the statement, then pick which tradition it best describes.";
  qFeedback.className = "re-feedback";
}

qOpts.forEach(btn => {
  btn.addEventListener("click", () => {
    qOpts.forEach(o => o.disabled = true);
    const correct = queue[qi].ans;
    if (btn.dataset.id === correct) {
      btn.classList.add("correct");
      qs++; qScore.textContent = qs;
      qFeedback.innerHTML = `<strong>Correct.</strong>`;
      qFeedback.className = "re-feedback ok";
      ding();
      setTimeout(() => { qi++; nextQ(); }, 1500);
    } else {
      btn.classList.add("wrong");
      document.querySelector(`.q-opt[data-id="${correct}"]`).classList.add("correct");
      qFeedback.innerHTML = `<strong>Not quite.</strong> The statement is ${correct === "both" ? "true of both traditions" : `more characteristic of ${correct} teaching`}. <button class="qfb-next" type="button">Next question &rarr;</button>`;
      qFeedback.className = "re-feedback bad";
      buzz();
      qFeedback.querySelector(".qfb-next")?.addEventListener("click", () => { qi++; nextQ(); });
    }
  });
});

function finish() {
  reResult.hidden = false;
  let t, m;
  if (qs === queue.length) { t = "Across the divide."; m = `${qs} / ${queue.length}. Catholic, Protestant and shared teachings — all sorted.`; fanfare(); }
  else if (qs >= 7) { t = "Strong reading."; m = `${qs} / ${queue.length}. A confident grasp of the differences.`; fanfare(); }
  else { t = "Round complete."; m = `${qs} / ${queue.length}. The compare-mode panels are the revision.`; }
  resultTitle.textContent = t;
  resultMsg.textContent = m;
}

document.getElementById("qReset").addEventListener("click", startQuiz);
document.getElementById("qAgain").addEventListener("click", startQuiz);
