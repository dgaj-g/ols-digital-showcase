// OLS Digital Showcase — hub interactivity
// Departments source-of-truth. Each demo page also imports this file
// to render its top strip and "back to showcase" link.

const DEPARTMENTS = [
  { slug: "art",                          name: "Art and Design",            level: "GCSE",    board: "CCEA", topic: "Watercolour techniques",                        activity: "Brush simulator" },
  { slug: "biology",                      name: "Biology",                   level: "A-Level", board: "CCEA", topic: "Gene technology",                               activity: "Interactive lab" },
  { slug: "business-studies",             name: "Business Studies",          level: "GCSE",    board: "CCEA", topic: "Public vs private sector",                      activity: "Drag-and-drop sorter" },
  { slug: "careers",                      name: "Careers",                   level: "KS3",     board: "—",    topic: "Workplace and employability",                   activity: "Decision tree" },
  { slug: "chemistry",                    name: "Chemistry",                 level: "GCSE",    board: "CCEA", topic: "The Periodic Table",                            activity: "Interactive table" },
  { slug: "digital-technology",           name: "Digital Technology",        level: "GCSE",    board: "CCEA", topic: "Representing images in binary",                 activity: "Pixel visualiser" },
  { slug: "drama-and-theatre-studies",    name: "Drama and Theatre Studies", level: "A-Level", board: "WJEC", topic: "Stage lighting design",                         activity: "Lighting designer" },
  { slug: "english",                      name: "English",                   level: "GCSE",    board: "CCEA", topic: "Rhetorical devices in speech",                  activity: "Text highlighter" },
  { slug: "environmental-technology",     name: "Environmental Technology",  level: "A-Level", board: "CCEA", topic: "Energy from the Sun — solar PV &amp; passive design",  activity: "Solar designer" },
  { slug: "french",                       name: "French",                    level: "KS3",     board: "—",    topic: "Au café — ordering food and drink",             activity: "Café simulator" },
  { slug: "geography",                    name: "Geography",                 level: "GCSE",    board: "CCEA", topic: "Rivers — source to mouth",                      activity: "Cross-section explorer" },
  { slug: "government-and-politics",      name: "Government and Politics",   level: "A-Level", board: "CCEA", topic: "Evolution of the US Presidency",                activity: "Interactive timeline" },
  { slug: "health-and-social-care",       name: "Health and Social Care",    level: "A-Level", board: "CCEA", topic: "Human nutrition and dietary intake",            activity: "Dietary analyser" },
  { slug: "history",                      name: "History",                   level: "GCSE",    board: "CCEA", topic: "New tensions emerge 1991–2003",                 activity: "Interactive timeline" },
  { slug: "home-economics",               name: "Home Economics",            level: "GCSE",    board: "CCEA", topic: "Food safety in the kitchen",                    activity: "Hazard hunter" },
  { slug: "irish",                        name: "Irish / Gaeilge",           level: "KS3",     board: "—",    topic: "Introductions, personal info, family",          activity: "Vocab + grammar game" },
  { slug: "junior-science",               name: "Junior Science",            level: "KS3",     board: "—",    topic: "Cells, organisation and specialised cells",     activity: "Cell explorer" },
  { slug: "leisure-travel-and-tourism",   name: "Leisure, Travel &amp; Tourism", level: "GCSE",  board: "CCEA", topic: "Technology &amp; change in the industry",          activity: "Customer journey builder" },
  { slug: "mathematics",                  name: "Mathematics",               level: "KS3",     board: "—",    topic: "Fractions, decimals and percentages",           activity: "Live converter" },
  { slug: "music",                        name: "Music",                     level: "GCSE",    board: "CCEA", topic: "Musical traditions in Ireland",                 activity: "Audio explorer" },
  { slug: "physical-education",           name: "Physical Education",        level: "GCSE",    board: "CCEA", topic: "Developing muscular fitness",                   activity: "Training builder" },
  { slug: "physics",                      name: "Physics",                   level: "A-Level", board: "CCEA", topic: "Astronomy and the universe",                    activity: "3D scene" },
  { slug: "psychology",                   name: "Psychology",                level: "A-Level", board: "WJEC", topic: "The Stroop Effect",                             activity: "Live experiment" },
  { slug: "religious-education",          name: "Religious Education",       level: "GCSE",    board: "CCEA", topic: "Sacraments and ordinances",                     activity: "Comparison tool" },
  { slug: "sociology",                    name: "Sociology",                 level: "A-Level", board: "WJEC", topic: "Differential educational achievement",          activity: "Data explorer" },
  { slug: "spanish",                      name: "Spanish",                   level: "GCSE",    board: "CCEA", topic: "Myself, family and relationships",              activity: "Vocab dialogue" },
  { slug: "sports-science",               name: "Sports Science",            level: "A-Level", board: "CCEA", topic: "Nutrition for health and exercise",             activity: "Performance calculator" },
  { slug: "technology-and-design",        name: "Technology and Design",     level: "GCSE",    board: "CCEA", topic: "Robotics — sensors and actuators",              activity: "Mechanism simulator" },
];

// ---- Hub-only code below. Demo pages import this file for the data
// only, and tolerate the absence of hub DOM elements.

function levelClass(level) {
  return {
    "KS3":     "level-ks3",
    "GCSE":    "level-gcse",
    "A-Level": "level-alevel",
  }[level] || "";
}

function renderHub() {
  const grid = document.getElementById("dept-grid");
  if (!grid) return; // not on hub page

  const search = document.getElementById("search");
  const levelFilters = document.querySelectorAll(".filter-level");
  const boardFilters = document.querySelectorAll(".filter-board");

  let activeLevel = "all";
  let activeBoard = "all";
  let activeQuery = "";

  function draw() {
    const q = activeQuery.trim().toLowerCase();
    grid.innerHTML = "";
    let shown = 0;
    DEPARTMENTS.forEach(d => {
      if (activeLevel !== "all" && d.level !== activeLevel) return;
      if (activeBoard !== "all" && d.board !== activeBoard) return;
      if (q && !(d.name.toLowerCase().includes(q) || d.topic.toLowerCase().includes(q) || d.activity.toLowerCase().includes(q))) return;
      shown++;

      const a = document.createElement("a");
      a.className = "card";
      a.href = `${d.slug}/`;
      a.innerHTML = `
        <div class="card-head">
          <span class="chip ${levelClass(d.level)}">${d.level}</span>
          <span class="chip chip-board">${d.board}</span>
        </div>
        <h3 class="card-title">${d.name}</h3>
        <p class="card-topic">${d.topic}</p>
        <p class="card-activity">${d.activity}</p>
        <span class="card-arrow" aria-hidden="true">→</span>
      `;
      grid.appendChild(a);
    });

    const countEl = document.getElementById("result-count");
    if (countEl) countEl.textContent = `${shown} of ${DEPARTMENTS.length}`;

    const emptyEl = document.getElementById("empty-state");
    if (emptyEl) emptyEl.hidden = shown !== 0;
  }

  if (search) search.addEventListener("input", e => { activeQuery = e.target.value; draw(); });

  levelFilters.forEach(b => b.addEventListener("click", () => {
    levelFilters.forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    activeLevel = b.dataset.value;
    draw();
  }));

  boardFilters.forEach(b => b.addEventListener("click", () => {
    boardFilters.forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    activeBoard = b.dataset.value;
    draw();
  }));

  draw();
}

document.addEventListener("DOMContentLoaded", renderHub);
