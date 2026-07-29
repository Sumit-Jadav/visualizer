const CODE_SNIPPETS = {
  js: [
    "function reverseList(head) {",
    "  let prev = null;",
    "  let curr = head;",
    "  while (curr !== null) {",
    "    let next = curr.next;   // 1. Save next node",
    "    curr.next = prev;       // 2. Reverse pointer",
    "    prev = curr;            // 3. Advance prev",
    "    curr = next;            // 4. Advance curr",
    "  }",
    "  return prev;",
    "}"
  ],
  py: [
    "def reverseList(head: Optional[ListNode]) -> Optional[ListNode]:",
    "    prev, curr = None, head",
    "    while curr:",
    "        nxt = curr.next     # 1. Save next node",
    "        curr.next = prev    # 2. Reverse pointer",
    "        prev = curr         # 3. Advance prev",
    "        curr = nxt          # 4. Advance curr",
    "    return prev"
  ],
  java: [
    "public ListNode reverseList(ListNode head) {",
    "    ListNode prev = null;",
    "    ListNode curr = head;",
    "    while (curr != null) {",
    "        ListNode next = curr.next; // 1. Save next",
    "        curr.next = prev;          // 2. Reverse link",
    "        prev = curr;               // 3. Advance prev",
    "        curr = next;               // 4. Advance curr",
    "    }",
    "    return prev;",
    "}"
  ],
  cpp: [
    "ListNode* reverseList(ListNode* head) {",
    "    ListNode* prev = nullptr;",
    "    ListNode* curr = head;",
    "    while (curr != nullptr) {",
    "        ListNode* next = curr->next; // 1. Save next",
    "        curr->next = prev;           // 2. Reverse link",
    "        prev = curr;                 // 3. Advance prev",
    "        curr = next;                 // 4. Advance curr",
    "    }",
    "    return prev;",
    "}"
  ]
};

const PTR_COLORS = {
  prev: "var(--amber)",
  curr: "var(--mint)",
  next: "var(--violet)",
  head: "var(--blue)"
};

let SIM = null;
let stepIdx = 0;
let playTimer = null;
let currentLang = 'js';

function simulate(vals) {
  let idCounter = 0;
  const nodes = vals.map(v => ({ id: "n" + (idCounter++), val: v, mem: "0x" + (100 + idCounter * 4).toString(16) }));
  const steps = [];

  function links(nodeLinks) {
    return { ...nodeLinks };
  }

  // Initial state links
  let currentLinks = {};
  for (let i = 0; i < nodes.length; i++) {
    currentLinks[nodes[i].id] = i < nodes.length - 1 ? nodes[i + 1].id : null;
  }

  function snap(desc, ptrs, line) {
    steps.push({ desc, ptrs: { ...ptrs }, line, links: { ...currentLinks } });
  }

  let prev = null;
  let curr = nodes[0] ? nodes[0].id : null;

  snap("Initialize pointers: prev = null, curr = head.", { prev: null, curr, head: nodes[0] ? nodes[0].id : null }, 1);

  while (curr !== null) {
    let nextNode = currentLinks[curr];
    snap(`Iteration start: curr is at node [${getNodeVal(nodes, curr)}]. Save next pointer.`, { prev, curr, next: nextNode, head: nodes[0] ? nodes[0].id : null }, 4);

    // Reverse link
    currentLinks[curr] = prev;
    snap(`Reverse link: set node [${getNodeVal(nodes, curr)}].next = ${prev ? "node [" + getNodeVal(nodes, prev) + "]" : "null"}.`, { prev, curr, next: nextNode, head: nodes[0] ? nodes[0].id : null }, 5);

    // Advance prev
    prev = curr;
    snap(`Advance prev forward to node [${getNodeVal(nodes, prev)}].`, { prev, curr, next: nextNode, head: nodes[0] ? nodes[0].id : null }, 6);

    // Advance curr
    curr = nextNode;
    snap(`Advance curr forward to ${curr ? "node [" + getNodeVal(nodes, curr) + "]" : "null"}.`, { prev, curr, next: nextNode, head: nodes[0] ? nodes[0].id : null }, 7);
  }

  snap(`Traversal complete! curr is null. Return prev as the new head of reversed list.`, { prev, curr: null, head: prev }, 9);

  return { nodes, steps };
}

function getNodeVal(nodes, id) {
  if (!id) return "null";
  const nd = nodes.find(n => n.id === id);
  return nd ? nd.val : "null";
}

function boxX(i) { return 110 + i * 110; }

function render() {
  const s = SIM.steps[stepIdx];
  const idxOf = {};
  SIM.nodes.forEach((nd, i) => (idxOf[nd.id] = i));

  const y = 70, bw = 64, bh = 44;
  let svg = `<defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>`;

  // Render Nodes
  SIM.nodes.forEach((nd, i) => {
    const x = boxX(i);
    svg += `<g class="node-group">
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="8" fill="var(--surface-raised)" stroke="var(--border-strong)" stroke-width="1.2"/>
      <text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--text-muted)">${nd.mem}</text>
      <text x="${x + bw / 2}" y="${y + bh / 2}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="16" font-weight="700" fill="var(--text-primary)">${nd.val}</text>
    </g>`;
  });

  // Render Pointer Links (arrows)
  Object.entries(s.links).forEach(([srcId, tgtId]) => {
    if (!tgtId) return;
    const srcIdx = idxOf[srcId];
    const tgtIdx = idxOf[tgtId];
    if (srcIdx === undefined || tgtIdx === undefined) return;

    const x1 = boxX(srcIdx) + bw / 2;
    const x2 = boxX(tgtIdx) + bw / 2;

    if (tgtIdx > srcIdx) {
      // Normal forward arrow
      const startX = boxX(srcIdx) + bw;
      const endX = boxX(tgtIdx);
      svg += `<line x1="${startX}" y1="${y + bh / 2}" x2="${endX - 4}" y2="${y + bh / 2}" stroke="var(--text-secondary)" stroke-width="1.5" marker-end="url(#arrow)"/>`;
    } else {
      // Reversed arc arrow
      const midY = y - 30;
      svg += `<path d="M ${boxX(srcIdx) + 12} ${y} Q ${(x1 + x2) / 2} ${midY} ${boxX(tgtIdx) + bw - 12} ${y - 2}" fill="none" stroke="var(--mint)" stroke-width="1.8" marker-end="url(#arrow)"/>`;
    }
  });

  // Render Pointer Badges
  const ptrsByNode = {};
  Object.entries(s.ptrs).forEach(([ptrName, targetId]) => {
    const key = targetId === null ? "null" : targetId;
    (ptrsByNode[key] = ptrsByNode[key] || []).push(ptrName);
  });

  let labelSvg = "";
  Object.entries(ptrsByNode).forEach(([targetId, names]) => {
    if (targetId === "null") return;
    const i = idxOf[targetId];
    if (i === undefined) return;
    const bx = boxX(i) + bw / 2;

    names.forEach((name, j) => {
      const ly = y + bh + 24 + j * 22;
      const color = PTR_COLORS[name] || "var(--text-muted)";
      const pw = Math.max(54, name.length * 8 + 16);
      labelSvg += `<rect x="${bx - pw / 2}" y="${ly - 11}" width="${pw}" height="20" rx="10" fill="${color}" opacity="0.18" stroke="${color}" stroke-width="1.2"/>`;
      labelSvg += `<text x="${bx}" y="${ly}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600" fill="${color}">${name}</text>`;
    });
  });

  const maxStack = Math.max(1, ...Object.values(ptrsByNode).map(a => a.length));
  const svgHeight = y + bh + 24 + maxStack * 22 + 16;
  const svgWidth = Math.max(880, boxX(SIM.nodes.length) + 60);

  const svgEl = document.getElementById("listSvg");
  svgEl.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  svgEl.innerHTML = svg + labelSvg;

  // Update Description & Controls
  document.getElementById("descBox").textContent = s.desc;
  document.getElementById("stepCounter").textContent = `Step ${stepIdx + 1} / ${SIM.steps.length}`;
  const stepSlider = document.getElementById("stepSlider");
  stepSlider.max = SIM.steps.length - 1;
  stepSlider.value = stepIdx;

  document.getElementById("prevBtn").disabled = stepIdx === 0;
  document.getElementById("nextBtn").disabled = stepIdx === SIM.steps.length - 1;

  // Update Variable Cards
  const varsGrid = document.getElementById("varsGrid");
  varsGrid.innerHTML = "";
  ["head", "prev", "curr", "next"].forEach(p => {
    if (!(p in s.ptrs)) return;
    const tid = s.ptrs[p];
    const valText = tid === null ? "null" : `val: ${getNodeVal(SIM.nodes, tid)}`;
    const color = PTR_COLORS[p] || "var(--border-strong)";
    varsGrid.innerHTML += `<div class="var-card" style="border-left-color:${color}">
      <div class="var-name">${p}</div>
      <div class="var-val">${valText}</div>
    </div>`;
  });

  // Render Source Code
  renderCode();
}

function renderCode() {
  const s = SIM.steps[stepIdx];
  const codeLines = CODE_SNIPPETS[currentLang] || CODE_SNIPPETS.js;
  const codeBox = document.getElementById("codeBox");
  codeBox.innerHTML = codeLines.map((line, i) => {
    const active = i === s.line ? "active" : "";
    return `<div class="code-line ${active}">${line}</div>`;
  }).join("");
}

function buildSim() {
  const raw = document.getElementById("arrInput").value;
  const vals = raw.split(",").map(x => parseInt(x.trim(), 10)).filter(n => !isNaN(n));
  if (!vals.length) return;
  stopPlay();
  SIM = simulate(vals);
  stepIdx = 0;
  render();
}

function step(d) {
  if (!SIM) return;
  const next = stepIdx + d;
  if (next < 0 || next >= SIM.steps.length) { stopPlay(); return; }
  stepIdx = next;
  render();
}

function stopPlay() {
  if (playTimer) {
    clearInterval(playTimer);
    playTimer = null;
  }
  document.getElementById("playLabel").textContent = "Play";
  document.getElementById("playIcon").innerHTML = `<path d="M4 2.5L13.5 8L4 13.5V2.5Z"/>`;
}

function togglePlay() {
  if (playTimer) { stopPlay(); return; }
  if (stepIdx >= SIM.steps.length - 1) stepIdx = 0;
  document.getElementById("playLabel").textContent = "Pause";
  document.getElementById("playIcon").innerHTML = `<rect x="3" y="2.5" width="4" height="11"/><rect x="9" y="2.5" width="4" height="11"/>`;

  const speed = parseInt(document.getElementById("speedSelect").value, 10) || 800;
  playTimer = setInterval(() => {
    if (stepIdx >= SIM.steps.length - 1) { stopPlay(); return; }
    stepIdx += 1;
    render();
  }, speed);
}

// Event Listeners
document.getElementById("generateBtn").addEventListener("click", buildSim);
document.getElementById("prevBtn").addEventListener("click", () => step(-1));
document.getElementById("nextBtn").addEventListener("click", () => step(1));
document.getElementById("playBtn").addEventListener("click", togglePlay);

document.getElementById("stepSlider").addEventListener("input", (e) => {
  stepIdx = parseInt(e.target.value, 10);
  render();
});

document.querySelectorAll(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById("arrInput").value = btn.dataset.list;
    buildSim();
  });
});

document.querySelectorAll(".lang-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".lang-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentLang = tab.dataset.lang;
    renderCode();
  });
});

document.addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === " ") { e.preventDefault(); togglePlay(); }
});

buildSim();
