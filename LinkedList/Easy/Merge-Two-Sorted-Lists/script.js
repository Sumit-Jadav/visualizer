const CODE_SNIPPETS = {
  js: [
    "function mergeTwoLists(l1, l2) {",
    "  let dummy = new ListNode(0);",
    "  let tail = dummy;",
    "  while (l1 !== null && l2 !== null) {",
    "    if (l1.val <= l2.val) {",
    "      tail.next = l1; l1 = l1.next;   // Attach l1 & advance",
    "    } else {",
    "      tail.next = l2; l2 = l2.next;   // Attach l2 & advance",
    "    }",
    "    tail = tail.next;",
    "  }",
    "  tail.next = (l1 !== null) ? l1 : l2;",
    "  return dummy.next;",
    "}"
  ],
  py: [
    "def mergeTwoLists(l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:",
    "    dummy = ListNode(0)",
    "    tail = dummy",
    "    while l1 and l2:",
    "        if l1.val <= l2.val:",
    "            tail.next = l1; l1 = l1.next",
    "        else:",
    "            tail.next = l2; l2 = l2.next",
    "        tail = tail.next",
    "    tail.next = l1 if l1 else l2",
    "    return dummy.next"
  ],
  java: [
    "public ListNode mergeTwoLists(ListNode l1, ListNode l2) {",
    "    ListNode dummy = new ListNode(0);",
    "    ListNode tail = dummy;",
    "    while (l1 != null && l2 != null) {",
    "        if (l1.val <= l2.val) {",
    "            tail.next = l1; l1 = l1.next;",
    "        } else {",
    "            tail.next = l2; l2 = l2.next;",
    "        }",
    "        tail = tail.next;",
    "    }",
    "    tail.next = (l1 != null) ? l1 : l2;",
    "    return dummy.next;",
    "}"
  ],
  cpp: [
    "ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {",
    "    ListNode dummy(0);",
    "    ListNode* tail = &dummy;",
    "    while (l1 && l2) {",
    "        if (l1->val <= l2->val) {",
    "            tail->next = l1; l1 = l1->next;",
    "        } else {",
    "            tail->next = l2; l2 = l2->next;",
    "        }",
    "        tail = tail->next;",
    "    }",
    "    tail->next = l1 ? l1 : l2;",
    "    return dummy.next;",
    "}"
  ]
};

const PTR_COLORS = {
  l1: "var(--mint)",
  l2: "var(--amber)",
  tail: "var(--coral)",
  dummy: "var(--violet)"
};

let SIM = null;
let stepIdx = 0;
let playTimer = null;
let currentLang = 'js';

function simulate(v1, v2) {
  let idc = 0;
  const nodes1 = v1.map(v => ({ id: "l1_" + (idc++), val: v, mem: "L1:" + v, list: 1 }));
  const nodes2 = v2.map(v => ({ id: "l2_" + (idc++), val: v, mem: "L2:" + v, list: 2 }));
  const dummy = { id: "dummy", val: "D", mem: "0x00", list: 0 };

  const steps = [];
  const currentLinks = { dummy: null };
  nodes1.forEach((n, i) => currentLinks[n.id] = i < nodes1.length - 1 ? nodes1[i+1].id : null);
  nodes2.forEach((n, i) => currentLinks[n.id] = i < nodes2.length - 1 ? nodes2[i+1].id : null);

  function snap(desc, ptrs, line) {
    steps.push({ desc, ptrs: { ...ptrs }, line, links: { ...currentLinks } });
  }

  let p1 = nodes1[0] ? nodes1[0].id : null;
  let p2 = nodes2[0] ? nodes2[0].id : null;
  let tail = dummy.id;

  snap("Initialize dummy node and tail pointer. l1 at List 1 head, l2 at List 2 head.", { dummy: dummy.id, tail, l1: p1, l2: p2 }, 1);

  while (p1 !== null && p2 !== null) {
    const val1 = getNodeVal(nodes1, p1);
    const val2 = getNodeVal(nodes2, p2);

    snap(`Compare l1.val (${val1}) vs l2.val (${val2}).`, { dummy: dummy.id, tail, l1: p1, l2: p2 }, 3);

    if (val1 <= val2) {
      currentLinks[tail] = p1;
      const nextP1 = currentLinks[p1];
      snap(`l1.val (${val1}) <= l2.val (${val2}). Attach l1 node [${val1}] to tail.next and advance l1.`, { dummy: dummy.id, tail, l1: p1, l2: p2 }, 5);
      p1 = nextP1;
    } else {
      currentLinks[tail] = p2;
      const nextP2 = currentLinks[p2];
      snap(`l1.val (${val1}) > l2.val (${val2}). Attach l2 node [${val2}] to tail.next and advance l2.`, { dummy: dummy.id, tail, l1: p1, l2: p2 }, 7);
      p2 = nextP2;
    }
    tail = currentLinks[tail];
    snap(`Advance tail forward to node [${getNodeVal([...nodes1, ...nodes2], tail)}].`, { dummy: dummy.id, tail, l1: p1, l2: p2 }, 9);
  }

  const remaining = p1 !== null ? p1 : p2;
  currentLinks[tail] = remaining;
  snap(`One list is exhausted. Attach remaining elements starting from ${remaining ? "node [" + getNodeVal([...nodes1, ...nodes2], remaining) + "]" : "null"}.`, { dummy: dummy.id, tail, l1: p1, l2: p2 }, 11);

  snap("Merge finished! Return dummy.next as the head of merged list.", { dummy: dummy.id, head: currentLinks[dummy.id] }, 12);

  return { nodes1, nodes2, dummy, steps };
}

function getNodeVal(allNodes, id) {
  if (!id) return "null";
  const n = allNodes.find(x => x.id === id);
  return n ? n.val : "null";
}

function render() {
  const s = SIM.steps[stepIdx];
  const allNodes = [...SIM.nodes1, ...SIM.nodes2];
  const idxMap = {};
  SIM.nodes1.forEach((nd, i) => idxMap[nd.id] = { row: 0, col: i });
  SIM.nodes2.forEach((nd, i) => idxMap[nd.id] = { row: 1, col: i });
  idxMap["dummy"] = { row: 2, col: 0 };

  const bw = 56, bh = 40;
  const rowY = [40, 110, 180];
  const colX = (col) => 120 + col * 90;

  let svg = `<defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>`;

  // Draw Dummy Node
  svg += `<g>
    <rect x="${colX(0)}" y="${rowY[2]}" width="${bw}" height="${bh}" rx="6" fill="var(--surface-raised)" stroke="var(--violet)" stroke-width="1.5"/>
    <text x="${colX(0) + bw/2}" y="${rowY[2] + bh/2}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700" fill="var(--violet)">D</text>
    <text x="${colX(0) + bw/2}" y="${rowY[2] - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--text-muted)">dummy</text>
  </g>`;

  // Draw List 1 Nodes
  SIM.nodes1.forEach((nd, i) => {
    const x = colX(i); const y = rowY[0];
    svg += `<g>
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="var(--surface-raised)" stroke="var(--border-strong)" stroke-width="1.2"/>
      <text x="${x + bw/2}" y="${y + bh/2}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700" fill="var(--text-primary)">${nd.val}</text>
      <text x="${x + bw/2}" y="${y - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--mint)">L1[${i}]</text>
    </g>`;
  });

  // Draw List 2 Nodes
  SIM.nodes2.forEach((nd, i) => {
    const x = colX(i); const y = rowY[1];
    svg += `<g>
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="var(--surface-raised)" stroke="var(--border-strong)" stroke-width="1.2"/>
      <text x="${x + bw/2}" y="${y + bh/2}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700" fill="var(--text-primary)">${nd.val}</text>
      <text x="${x + bw/2}" y="${y - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--amber)">L2[${i}]</text>
    </g>`;
  });

  // Draw Links
  Object.entries(s.links).forEach(([srcId, tgtId]) => {
    if (!tgtId || !idxMap[srcId] || !idxMap[tgtId]) return;
    const src = idxMap[srcId];
    const tgt = idxMap[tgtId];

    const x1 = colX(src.col) + bw;
    const y1 = rowY[src.row] + bh / 2;
    const x2 = colX(tgt.col);
    const y2 = rowY[tgt.row] + bh / 2;

    if (src.row === tgt.row) {
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2 - 4}" y2="${y2}" stroke="var(--text-secondary)" stroke-width="1.4" marker-end="url(#arrow)"/>`;
    } else {
      svg += `<path d="M ${x1} ${y1} C ${x1 + 30} ${y1}, ${x2 - 30} ${y2}, ${x2 - 4} ${y2}" fill="none" stroke="var(--coral)" stroke-width="1.6" marker-end="url(#arrow)"/>`;
    }
  });

  // Draw Pointers
  const ptrsByNode = {};
  Object.entries(s.ptrs).forEach(([pName, tgtId]) => {
    const key = tgtId === null ? "null" : tgtId;
    (ptrsByNode[key] = ptrsByNode[key] || []).push(pName);
  });

  let labelSvg = "";
  Object.entries(ptrsByNode).forEach(([tgtId, names]) => {
    if (tgtId === "null" || !idxMap[tgtId]) return;
    const pos = idxMap[tgtId];
    const bx = colX(pos.col) + bw / 2;

    names.forEach((nm, j) => {
      const ly = rowY[pos.row] + bh + 18 + j * 20;
      const color = PTR_COLORS[nm] || "var(--text-muted)";
      const pw = Math.max(48, nm.length * 8 + 14);
      labelSvg += `<rect x="${bx - pw / 2}" y="${ly - 10}" width="${pw}" height="18" rx="9" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1"/>`;
      labelSvg += `<text x="${bx}" y="${ly}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600" fill="${color}">${nm}</text>`;
    });
  });

  const svgEl = document.getElementById("listSvg");
  const maxCols = Math.max(SIM.nodes1.length, SIM.nodes2.length, 1);
  svgEl.setAttribute("viewBox", `0 0 ${Math.max(880, colX(maxCols) + 80)} 260`);
  svgEl.innerHTML = svg + labelSvg;

  // Controls & Descriptions
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
  ["l1", "l2", "tail", "dummy"].forEach(p => {
    if (!(p in s.ptrs)) return;
    const tid = s.ptrs[p];
    const valText = tid === null ? "null" : tid === "dummy" ? "dummy" : `val: ${getNodeVal(allNodes, tid)}`;
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
  const r1 = document.getElementById("l1Input").value;
  const r2 = document.getElementById("l2Input").value;
  const v1 = r1.split(",").map(x => parseInt(x.trim(), 10)).filter(n => !isNaN(n));
  const v2 = r2.split(",").map(x => parseInt(x.trim(), 10)).filter(n => !isNaN(n));
  stopPlay();
  SIM = simulate(v1, v2);
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
    document.getElementById("l1Input").value = btn.dataset.l1;
    document.getElementById("l2Input").value = btn.dataset.l2;
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
