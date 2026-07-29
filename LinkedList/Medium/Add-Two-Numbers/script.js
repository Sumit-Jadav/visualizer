const CODE_SNIPPETS = {
  js: [
    "function addTwoNumbers(l1, l2) {",
    "  let dummy = new ListNode(0);",
    "  let curr = dummy, carry = 0;",
    "  while (l1 !== null || l2 !== null || carry > 0) {",
    "    let x = (l1 !== null) ? l1.val : 0;",
    "    let y = (l2 !== null) ? l2.val : 0;",
    "    let sum = x + y + carry;        // 1. Calculate sum",
    "    carry = Math.floor(sum / 10);   // 2. Extract carry",
    "    curr.next = new ListNode(sum % 10); // 3. Create node",
    "    curr = curr.next;",
    "    if (l1) l1 = l1.next; if (l2) l2 = l2.next;",
    "  }",
    "  return dummy.next;",
    "}"
  ],
  py: [
    "def addTwoNumbers(l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:",
    "    dummy = ListNode(0)",
    "    curr, carry = dummy, 0",
    "    while l1 or l2 or carry:",
    "        x = l1.val if l1 else 0",
    "        y = l2.val if l2 else 0",
    "        total = x + y + carry",
    "        carry = total // 10",
    "        curr.next = ListNode(total % 10)",
    "        curr = curr.next",
    "        if l1: l1 = l1.next",
    "        if l2: l2 = l2.next",
    "    return dummy.next"
  ],
  java: [
    "public ListNode addTwoNumbers(ListNode l1, ListNode l2) {",
    "    ListNode dummy = new ListNode(0);",
    "    ListNode curr = dummy; int carry = 0;",
    "    while (l1 != null || l2 != null || carry > 0) {",
    "        int x = (l1 != null) ? l1.val : 0;",
    "        int y = (l2 != null) ? l2.val : 0;",
    "        int sum = x + y + carry;",
    "        carry = sum / 10;",
    "        curr.next = new ListNode(sum % 10);",
    "        curr = curr.next;",
    "        if (l1 != null) l1 = l1.next;",
    "        if (l2 != null) l2 = l2.next;",
    "    }",
    "    return dummy.next;",
    "}"
  ],
  cpp: [
    "ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {",
    "    ListNode dummy(0);",
    "    ListNode* curr = &dummy; int carry = 0;",
    "    while (l1 || l2 || carry) {",
    "        int x = l1 ? l1->val : 0;",
    "        int y = l2 ? l2->val : 0;",
    "        int sum = x + y + carry;",
    "        carry = sum / 10;",
    "        curr->next = new ListNode(sum % 10);",
    "        curr = curr->next;",
    "        if (l1) l1 = l1->next;",
    "        if (l2) l2 = l2->next;",
    "    }",
    "    return dummy.next;",
    "}"
  ]
};

const PTR_COLORS = {
  l1: "var(--mint)",
  l2: "var(--amber)",
  curr: "var(--coral)",
  dummy: "var(--violet)",
  carry: "var(--pink)"
};

let SIM = null;
let stepIdx = 0;
let playTimer = null;
let currentLang = 'js';

function simulate(v1, v2) {
  let idc = 0;
  const nodes1 = v1.map(v => ({ id: "l1_" + (idc++), val: v, mem: "L1:" + v }));
  const nodes2 = v2.map(v => ({ id: "l2_" + (idc++), val: v, mem: "L2:" + v }));
  const dummy = { id: "dummy", val: "D", mem: "dummy" };

  const currentLinks = { dummy: null };
  nodes1.forEach((n, i) => currentLinks[n.id] = i < nodes1.length - 1 ? nodes1[i+1].id : null);
  nodes2.forEach((n, i) => currentLinks[n.id] = i < nodes2.length - 1 ? nodes2[i+1].id : null);

  const resNodes = [];
  const steps = [];

  function snap(desc, ptrs, line, extraVars = {}) {
    steps.push({ desc, ptrs: { ...ptrs }, line, links: { ...currentLinks }, extraVars: { ...extraVars } });
  }

  let p1 = nodes1[0] ? nodes1[0].id : null;
  let p2 = nodes2[0] ? nodes2[0].id : null;
  let curr = dummy.id;
  let carry = 0;

  snap("Initialize dummy node for result list. Set carry = 0.", { dummy: dummy.id, curr, l1: p1, l2: p2 }, 2, { carry, sum: 0 });

  let rIdx = 0;
  while (p1 !== null || p2 !== null || carry > 0) {
    const x = p1 !== null ? getNodeVal(nodes1, p1) : 0;
    const y = p2 !== null ? getNodeVal(nodes2, p2) : 0;
    const sum = x + y + carry;

    snap(`Digit addition: x (${x}) + y (${y}) + carry (${carry}) = sum (${sum}).`, { dummy: dummy.id, curr, l1: p1, l2: p2 }, 6, { carry, sum, digit: sum % 10 });

    carry = Math.floor(sum / 10);
    const newDigit = sum % 10;
    const resNode = { id: "res_" + (rIdx++), val: newDigit, mem: "Ans:" + newDigit };
    resNodes.push(resNode);

    currentLinks[curr] = resNode.id;
    currentLinks[resNode.id] = null;
    snap(`New node [${newDigit}] created (sum % 10). Set carry = ${carry}.`, { dummy: dummy.id, curr, l1: p1, l2: p2 }, 8, { carry, sum, digit: newDigit });

    curr = resNode.id;
    if (p1) p1 = currentLinks[p1];
    if (p2) p2 = currentLinks[p2];

    snap(`Advance pointers to next digits. curr at answer node [${newDigit}].`, { dummy: dummy.id, curr, l1: p1, l2: p2 }, 10, { carry, sum });
  }

  snap("Addition complete! Return dummy.next as head of result list.", { dummy: dummy.id, head: currentLinks[dummy.id] }, 12, { carry: 0 });

  return { nodes1, nodes2, resNodes, dummy, steps };
}

function getNodeVal(allNodes, id) {
  if (!id) return 0;
  const n = allNodes.find(x => x.id === id);
  return n ? n.val : 0;
}

function render() {
  const s = SIM.steps[stepIdx];
  const allNodes = [...SIM.nodes1, ...SIM.nodes2, ...SIM.resNodes];
  const idxMap = {};
  SIM.nodes1.forEach((nd, i) => idxMap[nd.id] = { row: 0, col: i });
  SIM.nodes2.forEach((nd, i) => idxMap[nd.id] = { row: 1, col: i });
  idxMap["dummy"] = { row: 2, col: 0 };
  SIM.resNodes.forEach((nd, i) => idxMap[nd.id] = { row: 2, col: i + 1 });

  const bw = 56, bh = 40;
  const rowY = [40, 110, 180];
  const colX = (col) => 120 + col * 90;

  let svg = `<defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>`;

  // Render Dummy Node
  svg += `<g>
    <rect x="${colX(0)}" y="${rowY[2]}" width="${bw}" height="${bh}" rx="6" fill="var(--surface-raised)" stroke="var(--violet)" stroke-width="1.5"/>
    <text x="${colX(0) + bw/2}" y="${rowY[2] + bh/2}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700" fill="var(--violet)">D</text>
    <text x="${colX(0) + bw/2}" y="${rowY[2] - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--text-muted)">dummy</text>
  </g>`;

  // List 1
  SIM.nodes1.forEach((nd, i) => {
    const x = colX(i); const y = rowY[0];
    svg += `<g>
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="var(--surface-raised)" stroke="var(--border-strong)" stroke-width="1.2"/>
      <text x="${x + bw/2}" y="${y + bh/2}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700" fill="var(--text-primary)">${nd.val}</text>
      <text x="${x + bw/2}" y="${y - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--mint)">L1[${i}]</text>
    </g>`;
  });

  // List 2
  SIM.nodes2.forEach((nd, i) => {
    const x = colX(i); const y = rowY[1];
    svg += `<g>
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="var(--surface-raised)" stroke="var(--border-strong)" stroke-width="1.2"/>
      <text x="${x + bw/2}" y="${y + bh/2}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700" fill="var(--text-primary)">${nd.val}</text>
      <text x="${x + bw/2}" y="${y - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--amber)">L2[${i}]</text>
    </g>`;
  });

  // Result Nodes
  SIM.resNodes.forEach((nd, i) => {
    if (!idxMap[nd.id]) return;
    const x = colX(i + 1); const y = rowY[2];
    svg += `<g>
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="rgba(79, 216, 184, 0.12)" stroke="var(--mint)" stroke-width="1.5"/>
      <text x="${x + bw/2}" y="${y + bh/2}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700" fill="var(--mint)">${nd.val}</text>
      <text x="${x + bw/2}" y="${y - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--text-muted)">Ans[${i}]</text>
    </g>`;
  });

  // Arrows
  Object.entries(s.links).forEach(([srcId, tgtId]) => {
    if (!tgtId || !idxMap[srcId] || !idxMap[tgtId]) return;
    const src = idxMap[srcId];
    const tgt = idxMap[tgtId];

    const x1 = colX(src.col) + bw;
    const y1 = rowY[src.row] + bh / 2;
    const x2 = colX(tgt.col);
    const y2 = rowY[tgt.row] + bh / 2;

    svg += `<line x1="${x1}" y1="${y1}" x2="${x2 - 4}" y2="${y2}" stroke="var(--text-secondary)" stroke-width="1.4" marker-end="url(#arrow)"/>`;
  });

  // Badges
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

  const maxCols = Math.max(SIM.nodes1.length, SIM.nodes2.length, SIM.resNodes.length + 1, 1);
  const svgEl = document.getElementById("listSvg");
  svgEl.setAttribute("viewBox", `0 0 ${Math.max(880, colX(maxCols) + 80)} 260`);
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
  ["l1", "l2", "curr", "dummy"].forEach(p => {
    if (!(p in s.ptrs)) return;
    const tid = s.ptrs[p];
    const valText = tid === null ? "null" : tid === "dummy" ? "dummy" : `val: ${getNodeVal(allNodes, tid)}`;
    const color = PTR_COLORS[p] || "var(--border-strong)";
    varsGrid.innerHTML += `<div class="var-card" style="border-left-color:${color}">
      <div class="var-name">${p}</div>
      <div class="var-val">${valText}</div>
    </div>`;
  });

  if (s.extraVars) {
    if ('carry' in s.extraVars) {
      varsGrid.innerHTML += `<div class="var-card" style="border-left-color:var(--pink)">
        <div class="var-name">carry</div>
        <div class="var-val">${s.extraVars.carry}</div>
      </div>`;
    }
    if ('sum' in s.extraVars) {
      varsGrid.innerHTML += `<div class="var-card" style="border-left-color:var(--cyan)">
        <div class="var-name">sum</div>
        <div class="var-val">${s.extraVars.sum}</div>
      </div>`;
    }
  }

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
