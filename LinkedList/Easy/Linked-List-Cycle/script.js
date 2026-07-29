const CODE_SNIPPETS = {
  js: [
    "function hasCycle(head) {",
    "  if (!head || !head.next) return false;",
    "  let slow = head;",
    "  let fast = head;",
    "  while (fast !== null && fast.next !== null) {",
    "    slow = slow.next;         // 1 step",
    "    fast = fast.next.next;    // 2 steps",
    "    if (slow === fast) {",
    "      return true;            // Cycle detected!",
    "    }",
    "  }",
    "  return false;               // Reached end, no cycle",
    "}"
  ],
  py: [
    "def hasCycle(head: Optional[ListNode]) -> bool:",
    "    if not head or not head.next:",
    "        return False",
    "    slow = fast = head",
    "    while fast and fast.next:",
    "        slow = slow.next",
    "        fast = fast.next.next",
    "        if slow == fast:",
    "            return True",
    "    return False"
  ],
  java: [
    "public boolean hasCycle(ListNode head) {",
    "    if (head == null || head.next == null) return false;",
    "    ListNode slow = head;",
    "    ListNode fast = head;",
    "    while (fast != null && fast.next != null) {",
    "        slow = slow.next;",
    "        fast = fast.next.next;",
    "        if (slow == fast) return true;",
    "    }",
    "    return false;",
    "}"
  ],
  cpp: [
    "bool hasCycle(ListNode *head) {",
    "    if (!head || !head.next) return false;",
    "    ListNode *slow = head;",
    "    ListNode *fast = head;",
    "    while (fast && fast->next) {",
    "        slow = slow->next;",
    "        fast = fast->next->next;",
    "        if (slow == fast) return true;",
    "    }",
    "    return false;",
    "}"
  ]
};

const PTR_COLORS = {
  slow: "var(--amber)",
  fast: "var(--coral)",
  head: "var(--mint)"
};

let SIM = null;
let stepIdx = 0;
let playTimer = null;
let currentLang = 'js';

function simulate(vals, pos) {
  let idc = 0;
  const nodes = vals.map(v => ({ id: "n" + (idc++), val: v, mem: "0x" + (120 + idc * 4).toString(16) }));

  const currentLinks = {};
  for (let i = 0; i < nodes.length; i++) {
    if (i < nodes.length - 1) {
      currentLinks[nodes[i].id] = nodes[i + 1].id;
    } else {
      currentLinks[nodes[i].id] = (pos >= 0 && pos < nodes.length) ? nodes[pos].id : null;
    }
  }

  const steps = [];
  function snap(desc, ptrs, line) {
    steps.push({ desc, ptrs: { ...ptrs }, line, links: { ...currentLinks } });
  }

  if (nodes.length === 0) {
    snap("Empty list — no cycle.", { head: null, slow: null, fast: null }, 1);
    return { nodes, steps, pos };
  }

  let slow = nodes[0].id;
  let fast = nodes[0].id;

  snap("Initialize slow and fast pointers at head node.", { head: nodes[0].id, slow, fast }, 2);

  let iter = 0;
  const maxIter = 25; // prevent infinite loop safeguard

  while (fast && currentLinks[fast] && iter < maxIter) {
    iter++;
    slow = currentLinks[slow];
    fast = currentLinks[currentLinks[fast]];

    const slowVal = getNodeVal(nodes, slow);
    const fastVal = getNodeVal(nodes, fast);

    snap(`Iteration ${iter}: Move slow 1 step to [${slowVal}], fast 2 steps to [${fastVal}].`, { head: nodes[0].id, slow, fast }, 6);

    if (slow === fast) {
      snap(`MATCH! Both slow and fast met at node [${slowVal}]. Cycle detected!`, { head: nodes[0].id, slow, fast }, 8);
      return { nodes, steps, pos };
    }
  }

  snap("Fast pointer reached end (null). List has NO cycle.", { head: nodes[0].id, slow, fast }, 11);
  return { nodes, steps, pos };
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

  // Nodes
  SIM.nodes.forEach((nd, i) => {
    const x = boxX(i);
    const isCycleTarget = i === SIM.pos;
    const stroke = isCycleTarget ? "var(--coral)" : "var(--border-strong)";
    svg += `<g>
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="8" fill="var(--surface-raised)" stroke="${stroke}" stroke-width="${isCycleTarget ? 2 : 1.2}"/>
      <text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--text-muted)">${nd.mem}</text>
      <text x="${x + bw / 2}" y="${y + bh / 2}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="16" font-weight="700" fill="var(--text-primary)">${nd.val}</text>
    </g>`;
  });

  // Pointer Links (arrows)
  Object.entries(s.links).forEach(([srcId, tgtId]) => {
    if (!tgtId) return;
    const srcIdx = idxOf[srcId];
    const tgtIdx = idxOf[tgtId];
    if (srcIdx === undefined || tgtIdx === undefined) return;

    if (tgtIdx > srcIdx) {
      const x1 = boxX(srcIdx) + bw;
      const x2 = boxX(tgtIdx);
      svg += `<line x1="${x1}" y1="${y + bh / 2}" x2="${x2 - 4}" y2="${y + bh / 2}" stroke="var(--text-secondary)" stroke-width="1.5" marker-end="url(#arrow)"/>`;
    } else {
      // Cycle link: loop backward
      const x1 = boxX(srcIdx) + bw / 2;
      const x2 = boxX(tgtIdx) + bw / 2;
      const midY = y + bh + 45;
      svg += `<path d="M ${x1} ${y + bh} Q ${(x1 + x2) / 2} ${midY} ${x2} ${y + bh + 2}" fill="none" stroke="var(--coral)" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrow)"/>`;
    }
  });

  // Pointer Badges
  const ptrsByNode = {};
  Object.entries(s.ptrs).forEach(([pName, tgtId]) => {
    const key = tgtId === null ? "null" : tgtId;
    (ptrsByNode[key] = ptrsByNode[key] || []).push(pName);
  });

  let labelSvg = "";
  Object.entries(ptrsByNode).forEach(([tgtId, names]) => {
    if (tgtId === "null") return;
    const i = idxOf[tgtId];
    if (i === undefined) return;
    const bx = boxX(i) + bw / 2;

    names.forEach((name, j) => {
      const ly = y - 32 - j * 22;
      const color = PTR_COLORS[name] || "var(--text-muted)";
      const pw = Math.max(52, name.length * 8 + 14);
      labelSvg += `<rect x="${bx - pw / 2}" y="${ly - 10}" width="${pw}" height="18" rx="9" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.2"/>`;
      labelSvg += `<text x="${bx}" y="${ly}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600" fill="${color}">${name}</text>`;
    });
  });

  const svgWidth = Math.max(880, boxX(SIM.nodes.length) + 60);
  const svgEl = document.getElementById("listSvg");
  svgEl.setAttribute("viewBox", `0 0 ${svgWidth} 220`);
  svgEl.innerHTML = svg + labelSvg;

  // Description & Controls
  document.getElementById("descBox").textContent = s.desc;
  document.getElementById("stepCounter").textContent = `Step ${stepIdx + 1} / ${SIM.steps.length}`;
  const stepSlider = document.getElementById("stepSlider");
  stepSlider.max = SIM.steps.length - 1;
  stepSlider.value = stepIdx;

  document.getElementById("prevBtn").disabled = stepIdx === 0;
  document.getElementById("nextBtn").disabled = stepIdx === SIM.steps.length - 1;

  // Variables Grid
  const varsGrid = document.getElementById("varsGrid");
  varsGrid.innerHTML = "";
  ["head", "slow", "fast"].forEach(p => {
    if (!(p in s.ptrs)) return;
    const tid = s.ptrs[p];
    const valText = tid === null ? "null" : `val: ${getNodeVal(SIM.nodes, tid)}`;
    const color = PTR_COLORS[p] || "var(--border-strong)";
    varsGrid.innerHTML += `<div class="var-card" style="border-left-color:${color}">
      <div class="var-name">${p}</div>
      <div class="var-val">${valText}</div>
    </div>`;
  });

  renderCode();
}

function renderCode() {
  const s = SIM.steps[stepIdx];
  const codeLines = CODE_SNIPPETS[currentLang] || CODE_SNIPPETS.js;
  document.getElementById("codeBox").innerHTML = codeLines.map((line, i) => {
    const active = i === s.line ? "active" : "";
    return `<div class="code-line ${active}">${line}</div>`;
  }).join("");
}

function buildSim() {
  const raw = document.getElementById("arrInput").value;
  const pos = parseInt(document.getElementById("posInput").value, 10);
  const vals = raw.split(",").map(x => parseInt(x.trim(), 10)).filter(n => !isNaN(n));
  if (!vals.length) return;
  stopPlay();
  SIM = simulate(vals, isNaN(pos) ? -1 : pos);
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
  if (playTimer) { clearInterval(playTimer); playTimer = null; }
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
    document.getElementById("posInput").value = btn.dataset.pos;
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
