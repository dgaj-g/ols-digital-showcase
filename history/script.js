// History — New Tensions Emerge 1991–2003
// Click-to-reveal timeline. Content drawn from CCEA GCSE History Unit 2 factfile.

const EVENTS = [
  {
    year: "1991",
    theme: "europe",
    themeLabel: "Post-Cold War Europe",
    headline: "The Soviet Union Dissolves",
    strap: "Fifteen republics step out of a seventy-year experiment.",
    body: `In December 1991, the Soviet Union was formally dissolved. Mikhail Gorbachev resigned as President; the red flag came down over the Kremlin. Fifteen independent republics emerged in its place, with Russia under Boris Yeltsin as its largest successor state.<br><br>The Cold War — which had organised world politics for nearly half a century — was over. But the certainties it provided were gone too.`,
    impact: "The bipolar world of US-versus-USSR ended, opening the way for new — and often more local — conflicts.",
  },
  {
    year: "1991",
    theme: "middleeast",
    themeLabel: "Middle East",
    headline: "The Gulf War",
    strap: "A US-led coalition expels Iraqi forces from Kuwait.",
    body: `In August 1990, Iraqi forces under Saddam Hussein invaded and annexed neighbouring Kuwait. A coalition of 35 nations, authorised by the United Nations and led by the United States, launched <em>Operation Desert Storm</em> in January 1991.<br><br>After a 100-hour ground war in February 1991, Kuwait was liberated. Saddam remained in power in Iraq, and a long period of UN sanctions and weapons inspections began.`,
    impact: "The first major post-Cold War conflict — and the first major use of the United Nations as a coalition-builder rather than a Cold War spectator.",
  },
  {
    year: "1992",
    theme: "europe",
    themeLabel: "Post-Cold War Europe",
    headline: "War in Bosnia Begins",
    strap: "Yugoslavia fractures along ethnic lines.",
    body: `Following declarations of independence by Slovenia, Croatia and then Bosnia-Herzegovina, the Federal Republic of Yugoslavia broke apart. War erupted in Bosnia between Bosniak, Croat and Serb communities.<br><br>The conflict was marked by ethnic cleansing, mass displacement, and the longest siege of a capital city in modern history — Sarajevo, besieged for almost four years.`,
    impact: "Europe's worst conflict since 1945. International institutions — UN, EU, NATO — struggled visibly to respond.",
  },
  {
    year: "1994",
    theme: "humanitarian",
    themeLabel: "Humanitarian crises",
    headline: "Genocide in Rwanda",
    strap: "Roughly 800,000 killed in 100 days.",
    body: `From April to July 1994, an estimated 800,000 Tutsi and moderate Hutu were killed in Rwanda. The genocide was organised, planned, and largely carried out using simple weapons; international peacekeepers were withdrawn rather than reinforced.<br><br>The international community was widely condemned afterwards for its failure to intervene.`,
    impact: `Bill Clinton later called the US response his greatest regret as President. The phrase "never again" was again proven hollow.`,
  },
  {
    year: "1995",
    theme: "humanitarian",
    themeLabel: "Humanitarian crises",
    headline: "Srebrenica",
    strap: "More than 8,000 men and boys killed at a 'UN safe area'.",
    body: `In July 1995, Bosnian Serb forces overran the town of Srebrenica — a designated UN "safe area" — and killed more than 8,000 Bosniak men and boys. The events were later recognised as genocide by international courts.<br><br>The massacre helped force a shift in international policy. NATO airstrikes followed; the Dayton Accords ended the Bosnian War later the same year.`,
    impact: "Established that ethnic cleansing in Europe was not just a 1940s memory — and that 'safe areas' without enforcement are not safe.",
  },
  {
    year: "1999",
    theme: "europe",
    themeLabel: "Post-Cold War Europe",
    headline: "The Kosovo War",
    strap: "NATO launches a 78-day air campaign against Serbia.",
    body: `Fighting between Kosovo Albanians and Serbian forces, and reports of large-scale ethnic cleansing, prompted NATO to launch airstrikes against the Federal Republic of Yugoslavia in March 1999 — without UN Security Council authorisation.<br><br>The campaign lasted 78 days and ended with Serbian withdrawal from Kosovo. The legality of the intervention is still debated.`,
    impact: `A test case for "humanitarian intervention" — and a sign that NATO would act without UN authority when it chose to.`,
  },
  {
    year: "2001",
    theme: "terror",
    themeLabel: "Terror & response",
    headline: "9/11",
    strap: "Coordinated attacks on the United States kill nearly 3,000.",
    body: `On 11 September 2001, nineteen al-Qaeda hijackers seized four passenger aircraft. Two were flown into the World Trade Center in New York; one struck the Pentagon; the fourth crashed in a Pennsylvania field after passengers fought back. Nearly 3,000 people were killed.<br><br>President George W. Bush declared a "war on terror". Within a month, the United States and allies invaded Afghanistan to remove the Taliban government and pursue al-Qaeda.`,
    impact: "Reset US foreign policy for a generation. Began the longest war in American history.",
  },
  {
    year: "2003",
    theme: "middleeast",
    themeLabel: "Middle East",
    headline: "The Iraq War Begins",
    strap: "A US-British coalition invades without UN authorisation.",
    body: `In March 2003, a coalition led by the United States and the United Kingdom invaded Iraq, citing alleged weapons of mass destruction and links to terrorism. Saddam Hussein's regime fell within weeks; the WMD case did not stand up.<br><br>The invasion was deeply controversial — both for its legal basis and for its long-term consequences, including a prolonged insurgency, civilian deaths, and the eventual rise of new militant groups.`,
    impact: "Strained the UN, divided NATO, polarised public opinion across the West, and shaped global politics for the next decade.",
  },
];

const rail = document.getElementById("timelineRail");
const spot = document.getElementById("spotlight");
let activeIdx = null;
let activeTheme = "all";

// click sounds
let actx;
function click() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(); const g = actx.createGain();
    o.type = "square"; o.frequency.value = 380;
    g.gain.value = 0.04; o.connect(g); g.connect(actx.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.07);
    o.stop(actx.currentTime + 0.1);
  } catch {}
}

function renderTimeline() {
  rail.innerHTML = "";
  EVENTS.forEach((e, i) => {
    const btn = document.createElement("button");
    btn.className = "tl-event";
    btn.type = "button";
    btn.dataset.theme = e.theme;
    if (activeTheme !== "all" && e.theme !== activeTheme) btn.classList.add("hidden");
    if (activeIdx === i) btn.classList.add("active");
    btn.innerHTML = `
      <div class="tl-year">${e.year}</div>
      <div class="tl-dot" aria-hidden="true"></div>
      <div class="tl-card">
        <h3 class="tl-headline">${e.headline}</h3>
        <p class="tl-strap">${e.strap}</p>
        <p class="tl-theme">${e.themeLabel}</p>
      </div>
    `;
    btn.addEventListener("click", () => {
      activeIdx = i;
      click();
      renderTimeline();
      renderSpot(e);
    });
    rail.appendChild(btn);
  });
}

function renderSpot(e) {
  spot.innerHTML = `
    <div class="spot-meta">
      <span>${e.themeLabel}</span>
      <span>${e.year}</span>
    </div>
    <h2 class="spot-headline">${e.headline}</h2>
    <p class="spot-strap">${e.strap}</p>
    <div class="spot-body">
      <p>${e.body}</p>
      <div class="spot-impact">
        <strong>Why it matters</strong>
        ${e.impact}
      </div>
    </div>
  `;
}

document.querySelectorAll(".news-pill").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".news-pill").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    activeTheme = b.dataset.theme;
    renderTimeline();
    click();
  });
});

renderTimeline();
