// Technology and Design — Program the Robot
// 6 missions of increasing complexity. Build a program from blocks:
//   FORWARD, TURN_LEFT, TURN_RIGHT, IF_LIGHT, REPEAT.
// Run it on a 5×5 grid with walls and a goal. Score per mission.

const SIZE = 5;
const DIRECTIONS = ["N","E","S","W"];
const DELTAS = { N: [0,-1], E: [1,0], S: [0,1], W: [-1,0] };

// Mission definitions
// Each mission: grid (walls, light cell), start, dir, goal
const MISSIONS = [
  {
    brief: "Move the robot from <strong>(0,0)</strong> straight to the goal at <strong>(4,0)</strong>. Use FORWARD blocks.",
    start: [0,0], dir: "E", goal: [4,0], walls: [], lights: [],
  },
  {
    brief: "Turn the corner — get from <strong>(0,0)</strong> to <strong>(4,4)</strong>. Use FORWARD and TURN.",
    start: [0,0], dir: "E", goal: [4,4], walls: [], lights: [],
  },
  {
    brief: "There's a wall in the way. Route around it.",
    start: [0,2], dir: "E", goal: [4,2], walls: [ [2,1],[2,2],[2,3] ], lights: [],
  },
  {
    brief: "Use a REPEAT block to keep the program short. Same as before — try to use fewer than 9 blocks.",
    start: [0,2], dir: "E", goal: [4,2], walls: [ [2,1],[2,2],[2,3] ], lights: [], blockLimit: 9,
  },
  {
    brief: "The robot must reach the light source at <strong>(4,2)</strong>. Use an IF-LIGHT block to detect when it's there.",
    start: [0,2], dir: "E", goal: [4,2], walls: [], lights: [[4,2]],
  },
  {
    brief: "Final mission — navigate a small maze. Get from <strong>(0,0)</strong> to <strong>(4,4)</strong> using REPEAT for efficiency.",
    start: [0,0], dir: "E", goal: [4,4],
    walls: [ [1,0],[1,1],[1,2], [3,2],[3,3],[3,4] ], lights: [],
    blockLimit: 14,
  },
];

const BLOCKS = [
  { id: "FORWARD", label: "FORWARD", icon: "↑", className: "forward" },
  { id: "TURN_LEFT", label: "TURN LEFT", icon: "↺", className: "turn" },
  { id: "TURN_RIGHT", label: "TURN RIGHT", icon: "↻", className: "turn" },
  { id: "REPEAT_2", label: "REPEAT × 2 {", icon: "↻²", className: "if" },
  { id: "REPEAT_3", label: "REPEAT × 3 {", icon: "↻³", className: "if" },
  { id: "END_REPEAT", label: "} END REPEAT", icon: "↩", className: "if" },
  { id: "IF_LIGHT", label: "IF LIGHT THEN STOP", icon: "💡", className: "if" },
];

const gridSvg = document.getElementById("gridSvg");
const palette = document.getElementById("palette");
const programList = document.getElementById("programList");
const tdFb = document.getElementById("tdFb");
const missionBrief = document.getElementById("missionBrief");
const mIdx = document.getElementById("mIdx");
const mTotal = document.getElementById("mTotal");
const blockCount = document.getElementById("blockCount");
const missionScore = document.getElementById("missionScore");
const tdResult = document.getElementById("tdResult");
const resultTitle = document.getElementById("resultTitle");
const resultMsg = document.getElementById("resultMsg");

let missionIdx = 0;
let score = 0;
let program = [];
let robot = { x: 0, y: 0, dir: "E", stopped: false };
let runIdx = 0;
let runTimer = null;

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
function step(){ tone(540,30,"square",0.04); }
function bump(){ tone(180,200,"sawtooth",0.05); }
function goal(){ [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,180,"triangle",0.05),i*100)); }

// ---- Init palette
BLOCKS.forEach(b => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `block-btn ${b.className}`;
  btn.innerHTML = `<span class="ico">${b.icon}</span> ${b.label}`;
  btn.addEventListener("click", () => {
    if (program.length >= 12) {
      tdFb.innerHTML = `<strong>Max 12 blocks.</strong> Remove one before adding another.`;
      tdFb.className = "td-feedback bad";
      return;
    }
    program.push(b.id);
    drawProgram();
    blockCount.textContent = program.length;
  });
  palette.appendChild(btn);
});

function drawProgram() {
  programList.innerHTML = "";
  if (program.length === 0) {
    programList.innerHTML = `<p class="program-empty">No blocks yet — tap a block above.</p>`;
    return;
  }
  let indent = 0;
  program.forEach((id, i) => {
    const b = BLOCKS.find(x => x.id === id);
    if (id === "END_REPEAT") indent = Math.max(0, indent - 1);
    const li = document.createElement("li");
    li.style.marginLeft = `${indent * 14}px`;
    li.innerHTML = `<span class="ico">${b.icon}</span> ${b.label}`;
    li.addEventListener("click", () => {
      program.splice(i, 1);
      drawProgram();
      blockCount.textContent = program.length;
    });
    programList.appendChild(li);
    if (id.startsWith("REPEAT_")) indent++;
  });
}

document.getElementById("btnReset").addEventListener("click", () => { program = []; drawProgram(); blockCount.textContent = "0"; });

// ---- Grid render
function drawGrid(highlightCell) {
  const m = MISSIONS[missionIdx];
  const cell = 100, padding = 0;
  let svg = "";
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const isWall = m.walls.some(([wx, wy]) => wx === x && wy === y);
      const isGoal = m.goal[0] === x && m.goal[1] === y;
      const isLight = m.lights.some(([lx, ly]) => lx === x && ly === y);
      const fill = isWall ? "#3A4255" : (isLight ? "#FFD138" : "#1B202A");
      svg += `<rect x="${x*cell}" y="${y*cell}" width="${cell}" height="${cell}" fill="${fill}" stroke="#3A4255" stroke-width="1.5"/>`;
      if (isGoal) {
        // goal flag
        svg += `<g transform="translate(${x*cell + cell/2},${y*cell + cell/2})">
          <line x1="0" y1="-30" x2="0" y2="30" stroke="#3EC9D9" stroke-width="3"/>
          <polygon points="0,-30 25,-22 0,-14" fill="#3EC9D9"/>
        </g>`;
      }
      // coord label
      svg += `<text x="${x*cell + 6}" y="${y*cell + 16}" fill="#3A4255" font-family="SF Mono, monospace" font-size="10">${x},${y}</text>`;
    }
  }
  // robot
  const cx = robot.x*cell + cell/2;
  const cy = robot.y*cell + cell/2;
  const angle = { N:-90, E:0, S:90, W:180 }[robot.dir];
  svg += `<g transform="translate(${cx},${cy}) rotate(${angle})">
    <rect x="-26" y="-22" width="52" height="44" fill="#FFD138" stroke="#1B202A" stroke-width="2.5" rx="6"/>
    <rect x="-20" y="-16" width="40" height="16" fill="#1B202A"/>
    <circle cx="-6" cy="-8" r="2.5" fill="#3EC9D9"/>
    <circle cx="6" cy="-8" r="2.5" fill="#3EC9D9"/>
    <rect x="-30" y="8" width="6" height="16" fill="#1B202A"/>
    <rect x="24" y="8" width="6" height="16" fill="#1B202A"/>
    <polygon points="22,-4 30,0 22,4" fill="#1B202A"/>
  </g>`;
  // viewBox is 500x500, 5x5 grid, each cell 100
  gridSvg.setAttribute("viewBox", `0 0 ${SIZE * cell} ${SIZE * cell}`);
  gridSvg.innerHTML = svg;
}

// ---- Mission setup
function startMission() {
  const m = MISSIONS[missionIdx];
  mIdx.textContent = missionIdx + 1;
  mTotal.textContent = MISSIONS.length;
  missionScore.textContent = score;
  missionBrief.innerHTML = m.brief + (m.blockLimit ? ` <em>Block limit: ${m.blockLimit}.</em>` : "");
  program = []; drawProgram();
  blockCount.textContent = "0";
  robot = { x: m.start[0], y: m.start[1], dir: m.dir, stopped: false };
  drawGrid();
  tdFb.innerHTML = "Add blocks to your program, then press <strong>Run</strong>.";
  tdFb.className = "td-feedback";
  tdResult.hidden = true;
}

// ---- Program execution
function expandProgram() {
  // expand REPEAT_n { ... } END_REPEAT into a flat sequence
  const out = [];
  for (let i = 0; i < program.length; i++) {
    const id = program[i];
    if (id === "REPEAT_2" || id === "REPEAT_3") {
      const times = id === "REPEAT_2" ? 2 : 3;
      // find matching END_REPEAT
      let depth = 1;
      let j = i + 1;
      while (j < program.length && depth > 0) {
        if (program[j] === "REPEAT_2" || program[j] === "REPEAT_3") depth++;
        else if (program[j] === "END_REPEAT") depth--;
        if (depth === 0) break;
        j++;
      }
      const inner = program.slice(i + 1, j);
      for (let k = 0; k < times; k++) out.push(...inner);
      i = j; // skip past END_REPEAT
    } else if (id !== "END_REPEAT") {
      out.push(id);
    }
  }
  return out;
}

function runProgram() {
  clearInterval(runTimer);
  const m = MISSIONS[missionIdx];
  const flat = expandProgram();
  robot = { x: m.start[0], y: m.start[1], dir: m.dir, stopped: false };
  let i = 0;
  let blocked = false;
  drawGrid();
  runTimer = setInterval(() => {
    if (i >= flat.length || robot.stopped) {
      clearInterval(runTimer);
      checkOutcome(blocked);
      return;
    }
    const cmd = flat[i];
    if (cmd === "FORWARD") {
      const [dx, dy] = DELTAS[robot.dir];
      const nx = robot.x + dx, ny = robot.y + dy;
      if (nx < 0 || nx >= SIZE || ny < 0 || ny >= SIZE) {
        bump(); blocked = true;
        tdFb.innerHTML = "<strong>Out of bounds.</strong> The robot tried to leave the grid.";
        tdFb.className = "td-feedback bad";
        robot.stopped = true;
      } else if (m.walls.some(([wx, wy]) => wx === nx && wy === ny)) {
        bump(); blocked = true;
        tdFb.innerHTML = `<strong>Hit a wall</strong> at (${nx},${ny}). Plan a route around.`;
        tdFb.className = "td-feedback bad";
        robot.stopped = true;
      } else {
        robot.x = nx; robot.y = ny;
        step();
      }
    } else if (cmd === "TURN_LEFT") {
      robot.dir = DIRECTIONS[(DIRECTIONS.indexOf(robot.dir) + 3) % 4];
      step();
    } else if (cmd === "TURN_RIGHT") {
      robot.dir = DIRECTIONS[(DIRECTIONS.indexOf(robot.dir) + 1) % 4];
      step();
    } else if (cmd === "IF_LIGHT") {
      // stops if current cell is a light cell
      if (m.lights.some(([lx, ly]) => lx === robot.x && ly === robot.y)) {
        robot.stopped = true;
        step();
      }
    }
    drawGrid();
    i++;
  }, 320);
}

function checkOutcome(blocked) {
  const m = MISSIONS[missionIdx];
  const reached = robot.x === m.goal[0] && robot.y === m.goal[1];
  // also pass if light mission stopped on a light cell that IS the goal
  if (reached && !blocked) {
    let bonus = 0;
    if (m.blockLimit && program.length <= m.blockLimit) bonus = 1;
    score += 1 + bonus;
    missionScore.textContent = score;
    tdFb.innerHTML = `<strong>Mission accomplished.</strong> ${bonus ? "Bonus point for staying within the block limit." : ""}`;
    tdFb.className = "td-feedback ok";
    goal();
    setTimeout(() => {
      tdResult.hidden = false;
      resultTitle.textContent = "Mission complete";
      resultMsg.textContent = (missionIdx === MISSIONS.length - 1)
        ? `All ${MISSIONS.length} missions cleared. Total score: ${score}.`
        : "Ready for the next mission?";
    }, 700);
  } else if (!reached && !blocked) {
    tdFb.innerHTML = `<strong>Program ended</strong> but the robot didn't reach the goal. Currently at (${robot.x},${robot.y}). Add more blocks.`;
    tdFb.className = "td-feedback bad";
  }
}

document.getElementById("btnRun").addEventListener("click", runProgram);
document.getElementById("btnStep").addEventListener("click", () => {
  // step-through: run one block at a time
  if (!program.length) return;
  // For simplicity, just run the whole program at slower speed when Step pressed
  runProgram();
});
document.getElementById("btnNext").addEventListener("click", () => {
  missionIdx++;
  if (missionIdx >= MISSIONS.length) {
    // wrap around to start
    missionIdx = 0;
    score = 0;
  }
  startMission();
});
document.getElementById("btnRetry").addEventListener("click", () => startMission());

startMission();
