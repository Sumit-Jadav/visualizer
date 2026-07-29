const CODE_SNIPPETS = {
  js: [
    "function removeNthFromEnd(head, n) {",
    "  let dummy = new ListNode(0);",
    "  dummy.next = head;",
    "  let slow = dummy, fast = dummy;",
    "  for (let i = 0; i <= n; i++) {   // 1. Advance fast by n+1 steps",
    "    fast = fast.next;",
    "  }",
    "  while (fast !== null) {          // 2. Advance slow and fast together",
    "    slow = slow.next;",
    "    fast = fast.next;",
    "  }",
    "  slow.next = slow.next.next;      // 3. Skip/remove target node",
    "  return dummy.next;",
    "}"
  ],
  py: [
    "def removeNthFromEnd(head: Optional[ListNode], n: int) -> Optional[ListNode]:",
    "    dummy = ListNode(0, head)",
    "    slow = fast = dummy",
    "    for _ in range(n + 1):",
    "        fast = fast.next",
    "    while fast:",
    "        slow = slow.next; fast = fast.next",
    "    slow.next = slow.next.next",
    "    return dummy.next"
  ],
  java: [
    "public ListNode removeNthFromEnd(ListNode head, int n) {",
    "    ListNode dummy = new ListNode(0);",
    "    dummy.next = head;",
    "    ListNode slow = dummy, fast = dummy;",
    "    for (int i = 0; i <= n; i++) { fast = fast.next; }",
    "    while (fast != null) {",
    "        slow = slow.next; fast = fast.next;",
    "    }",
    "    slow.next = slow.next.next;",
    "    return dummy.next;",
    "}"
  ],
  cpp: [
    "ListNode* removeNthFromEnd(ListNode* head, int n) {",
    "    ListNode dummy(0); dummy.next = head;",
    "    ListNode *slow = &dummy, *fast = &dummy;",
    "    for (int i = 0; i <= n; i++) fast = fast->next;",
    "    while (fast != nullptr) {",
    "        slow = slow->next; fast = fast->next;",
    "    }",
    "    slow->next = slow->next->next;",
    "    return dummy.next;",
    "}"
  ]
};

const PTR_COLORS = {
  dummy: "var(--violet)",
  slow: "var(--amber)",
  fast: "var(--coral)",
  head: "var(--mint)"
};

let SIM = null;
let stepIdx = 0;
let playTimer = null;
let currentLang = 'js';

function simulate(vals, n) {
  let idc = 0;
  const nodes = vals.map(v => ({ id: "n" + (idc++), val: v, mem: "0x" + (140 + idc * 4).toString(16) }));
  const dummy = { id: "dummy", val: "D", mem: "dummy" };

  const currentLinks = { dummy: nodes[0] ? nodes[0].id : null };
  for (let i = 0; i < nodes.length - 1; i++) currentLinks[nodes[i].id] = nodes[i+1].id;
  if (nodes.length > 0) currentLinks[nodes[nodes.length - 1].id] = null;

  const steps = [];
  function snap(desc, ptrs, line, removedId = null) {
    steps.push({ desc, ptrs: { ...ptrs }, line, links: { ...currentLinks }, removedId });
  }

  let slow = dummy.id;
  let fast = dummy.id;

  snap(`Initialize dummy node ahead of head. Set slow and fast to dummy.`, { dummy: dummy.id, slow, fast, head: nodes[0] ? nodes[0].id : null }, 3);

  // Advance fast by n+1 steps
  for (let i = 0; i <= n; i++) {
    if (fast !== null) {
      fast = currentLinks[fast];
      snap(`Step ${i + 1}/${n + 1}: Advance fast ahead to ${fast ? "node [" + getNodeVal(nodes, fast) + "]" : "null"}.`, { dummy: dummy.id, slow, fast, head: nodes[0] ? nodes[0].id : null }, 5);
    }
  }

  // Slide both until fast reaches null
  while (fast !== null) {
    slow = currentLinks[slow];
    fast = currentLinks[fast];
    snap(`Slide both: slow at node [${getNodeVal(nodes, slow)}], fast at ${fast ? "node [" + getNodeVal(nodes, fast) + "]" : "null"}.`, { dummy: dummy.id, slow, fast, head: nodes[0] ? nodes[0].id : null }, 9);
  }

  // Target node to remove
  const targetId = currentLinks[slow];
  const targetVal = getNodeVal(nodes, targetId);
  snap(`fast reached end! slow is right before target node [${targetVal}].`, { dummy: dummy.id, slow, fast: null, head: nodes[0] ? nodes[0].id : null }, 10);

  // Skip target node
  const afterTarget = currentLinks[targetId];
  currentLinks[slow] = afterTarget;
  snap(`Unlink: set slow.next = slow.next.next (bypassing node [${targetVal}]). Node [${targetVal}] removed!`, { dummy: dummy.id, slow, head: currentLinks[dummy.id] }, 11, targetId);

  snap(`Complete! Return dummy.next as new head.`, { dummy: dummy.id, head: currentLinks[dummy.id] }, 12);

  return { nodes, dummy, steps };
}

function getNodeVal(nodes, id) {
  if (!id) return "null";
  if (id === "dummy") return "D";
  const nd = nodes.find(n => n.id === id);
  return nd ? nd.val : "null";
}

function boxX(i) { return 130 + i * 100; }

function render() {
  const s = SIM.steps[stepIdx];
  const allNodes = [SIM.dummy, ...SIM.nodes];
  const idxOf = {};
  allNodes.forEach((nd, i) => (idxOf[nd.id] = i));

  const y = 70, bw = 60, bh = 42;
  let svg = `<defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>`;

  // Nodes
  allNodes.forEach((nd, i) => {
    const x = boxX(i);
    const isDummy = nd.id === "dummy";
    const isRemoved = s.removedId === nd.id;
    const stroke = isDummy ? "var(--violet)" : isRemoved ? "var(--danger)" : "var(--border-strong)";
    const fill = isRemoved ? "rgba(239, 68, 68, 0.15)" : "var(--surface-raised)";

    svg += `<g>
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${isDummy || isRemoved ? 1.8 : 1}" ${isRemoved ? 'stroke-dasharray="4,2"' : ''}/>
      <text x="${x + bw / 2}" y="${y + bh / 2}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="${isDummy ? 13 : 15}" font-weight="700" fill="${isRemoved ? "var(--danger)" : "var(--text-primary)"}">${nd.val}</text>
      <text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--text-muted)">${nd.mem}</text>
    </g>`;
  });

  // Arrows
  Object.entries(s.links).forEach(([srcId, tgtId]) => {
    if (!tgtId) return;
    const srcIdx = idxOf[srcId];
    const tgtIdx = idxOf[tgtId];
    if (srcIdx === undefined || tgtIdx === undefined) return;

    const x1 = boxX(srcIdx) + bw;
    const x2 = boxX(tgtIdx);

    if (tgtIdx === srcIdx + 1) {
      svg += `<line x1="${x1}" y1="${y + bh / 2}" x2="${x2 - 4}" y2="${y + bh / 2}" stroke="var(--text-secondary)" stroke-width="1.4" marker-end="url(#arrow)"/>`;
    } else {
      // Skipped node curved jump arrow
      const midY = y - 28;
      svg += `<path d="M ${x1} ${y + 10} Q ${(boxX(srcIdx) + boxX(tgtIdx)) / 2} ${midY} ${x2} ${y + 10}" fill="none" stroke="var(--mint)" stroke-width="1.8" marker-end="url(#arrow)"/>`;
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
      const ly = y + bh + 24 + j * 22;
      const color = PTR_COLORS[name] || "var(--text-muted)";
      const pw = Math.max(52, name.length * 8 + 14);
      labelSvg += `<rect x="${bx - pw / 2}" y="${ly - 10}" width="${pw}" height="18" rx="9" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.2"/>`;
      labelSvg += `<text x="${bx}" y="${ly}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600" fill="${color}">${name}</text>`;
    });
  });

  const maxStack = Math.max(1, ...Object.values(ptrsByNode).map(a => a.length));
  const svgHeight = y + bh + 24 + maxStack * 22 + 16;
  const svgWidth = Math.max(880, boxX(allNodes.length) + 60);

  const svgEl = document.getElementById("listSvg");
  svgEl.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  svgEl.innerHTML = svg + labelSvg;

  // Description & Controls
  document.getElementById("descBox").textContent = s.desc;
  document.getElementById("stepCounter").textContent = `Step ${stepIdx + 1} / ${SIM.steps.length}`;
  const stepSlider = document.getElementById("stepSlider");
  stepSlider.max = SIM.steps.length - 1;
  stepSlider.value = stepIdx;

  document.getElementById("prevBtn").disabled = stepIdx === 0;
  document.getElementById("nextBtn").disabled = stepIdx === SIM.steps.length - 1;

  // Variable cards
  const varsGrid = document.getElementById("varsGrid");
  varsGrid.innerHTML = "";
  ["dummy", "head", "slow", "fast"].forEach(p => {
    if (!(p in s.ptrs)) return;
    const tid = s.ptrs[p];
    const valText = tid === null ? "null" : tid === "dummy" ? "dummy" : `val: ${getNodeVal(SIM.nodes, tid)}`;
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
  const n = parseInt(document.getElementById("nInput").value, 10);
  const vals = raw.split(",").map(x => parseInt(x.trim(), 10)).filter(n => !isNaN(n));
  if (!vals.length) return;
  stopPlay();
  SIM = simulate(vals, isNaN(n) ? 1 : Math.max(1, n));
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
    document.getElementById("nInput").value = btn.dataset.n;
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
