const CODE_SNIPPETS = {
  js: [
    "function reorderList(head) {",
    "  if (!head || !head.next) return;",
    "  let slow = head, fast = head;",
    "  while (fast.next && fast.next.next) {  // 1. Find middle",
    "    slow = slow.next; fast = fast.next.next;",
    "  }",
    "  let prev = null, curr = slow.next;      // 2. Reverse 2nd half",
    "  slow.next = null;",
    "  while (curr) {",
    "    let nxt = curr.next; curr.next = prev; prev = curr; curr = nxt;",
    "  }",
    "  let first = head, second = prev;        // 3. Interleave/weave",
    "  while (second) {",
    "    let tmp1 = first.next, tmp2 = second.next;",
    "    first.next = second; second.next = tmp1;",
    "    first = tmp1; second = tmp2;",
    "  }",
    "}"
  ],
  py: [
    "def reorderList(head: Optional[ListNode]) -> None:",
    "    if not head or not head.next: return",
    "    slow, fast = head, head",
    "    while fast.next and fast.next.next:",
    "        slow = slow.next; fast = fast.next.next",
    "    prev, curr = None, slow.next; slow.next = None",
    "    while curr:",
    "        nxt = curr.next; curr.next = prev; prev = curr; curr = nxt",
    "    first, second = head, prev",
    "    while second:",
    "        tmp1, tmp2 = first.next, second.next",
    "        first.next = second; second.next = tmp1",
    "        first, second = tmp1, tmp2"
  ],
  java: [
    "public void reorderList(ListNode head) {",
    "    if (head == null || head.next == null) return;",
    "    ListNode slow = head, fast = head;",
    "    while (fast.next != null && fast.next.next != null) {",
    "        slow = slow.next; fast = fast.next.next;",
    "    }",
    "    ListNode prev = null, curr = slow.next; slow.next = null;",
    "    while (curr != null) {",
    "        ListNode nxt = curr.next; curr.next = prev; prev = curr; curr = nxt;",
    "    }",
    "    ListNode first = head, second = prev;",
    "    while (second != null) {",
    "        ListNode tmp1 = first.next, tmp2 = second.next;",
    "        first.next = second; second.next = tmp1;",
    "        first = tmp1; second = tmp2;",
    "    }",
    "}"
  ],
  cpp: [
    "void reorderList(ListNode* head) {",
    "    if (!head || !head->next) return;",
    "    ListNode *slow = head, *fast = head;",
    "    while (fast->next && fast->next->next) {",
    "        slow = slow->next; fast = fast->next->next;",
    "    }",
    "    ListNode *prev = nullptr, *curr = slow->next; slow->next = nullptr;",
    "    while (curr) {",
    "        ListNode *nxt = curr->next; curr->next = prev; prev = curr; curr = nxt;",
    "    }",
    "    ListNode *first = head, *second = prev;",
    "    while (second) {",
    "        ListNode *tmp1 = first->next, *tmp2 = second->next;",
    "        first->next = second; second->next = tmp1;",
    "        first = tmp1; second = tmp2;",
    "    }",
    "}"
  ]
};

const PTR_COLORS = {
  slow: "var(--amber)",
  fast: "var(--coral)",
  prev: "var(--violet)",
  first: "var(--mint)",
  second: "var(--pink)",
  head: "var(--blue)"
};

let SIM = null;
let stepIdx = 0;
let playTimer = null;
let currentLang = 'js';

function simulate(vals) {
  let idc = 0;
  const nodes = vals.map(v => ({ id: "n" + (idc++), val: v, mem: "0x" + (160 + idc * 4).toString(16) }));

  const currentLinks = {};
  for (let i = 0; i < nodes.length - 1; i++) currentLinks[nodes[i].id] = nodes[i+1].id;
  currentLinks[nodes[nodes.length - 1].id] = null;

  const steps = [];
  function snap(desc, ptrs, line) {
    steps.push({ desc, ptrs: { ...ptrs }, line, links: { ...currentLinks } });
  }

  if (nodes.length <= 2) {
    snap("List has <= 2 nodes — already in reordered state!", { head: nodes[0].id }, 1);
    return { nodes, steps };
  }

  // Step 1: Find middle
  let slow = nodes[0].id;
  let fast = nodes[0].id;
  snap("STEP 1: Find list middle using slow and fast pointers.", { head: nodes[0].id, slow, fast }, 2);

  while (currentLinks[fast] && currentLinks[currentLinks[fast]]) {
    slow = currentLinks[slow];
    fast = currentLinks[currentLinks[fast]];
    snap(`Advance slow to [${getNodeVal(nodes, slow)}], fast to [${getNodeVal(nodes, fast)}].`, { head: nodes[0].id, slow, fast }, 4);
  }

  // Step 2: Split & Reverse 2nd half
  let secondHead = currentLinks[slow];
  currentLinks[slow] = null;
  snap(`Cut list into two halves at slow node [${getNodeVal(nodes, slow)}].`, { head: nodes[0].id, slow, secondHead }, 7);

  let prev = null;
  let curr = secondHead;
  while (curr) {
    let nxt = currentLinks[curr];
    currentLinks[curr] = prev;
    prev = curr;
    curr = nxt;
    snap(`Reversing 2nd half: prev at node [${getNodeVal(nodes, prev)}].`, { head: nodes[0].id, prev, curr }, 9);
  }

  // Step 3: Interleave
  let first = nodes[0].id;
  let second = prev;
  snap("STEP 3: Weave/interleave first half and reversed second half.", { head: nodes[0].id, first, second }, 11);

  while (second) {
    let tmp1 = currentLinks[first];
    let tmp2 = currentLinks[second];

    currentLinks[first] = second;
    snap(`Link first node [${getNodeVal(nodes, first)}] -> second node [${getNodeVal(nodes, second)}].`, { head: nodes[0].id, first, second }, 14);

    currentLinks[second] = tmp1;
    snap(`Link second node [${getNodeVal(nodes, second)}] -> next first node [${getNodeVal(nodes, tmp1)}].`, { head: nodes[0].id, first, second }, 14);

    first = tmp1;
    second = tmp2;
    snap(`Advance first to [${getNodeVal(nodes, first)}], second to ${second ? "node [" + getNodeVal(nodes, second) + "]" : "null"}.`, { head: nodes[0].id, first, second }, 15);
  }

  snap("Reorder complete! List is fully interleaved.", { head: nodes[0].id }, 17);

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

  // Nodes
  SIM.nodes.forEach((nd, i) => {
    const x = boxX(i);
    svg += `<g>
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="8" fill="var(--surface-raised)" stroke="var(--border-strong)" stroke-width="1.2"/>
      <text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--text-muted)">${nd.mem}</text>
      <text x="${x + bw / 2}" y="${y + bh / 2}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="16" font-weight="700" fill="var(--text-primary)">${nd.val}</text>
    </g>`;
  });

  // Arrows
  Object.entries(s.links).forEach(([srcId, tgtId]) => {
    if (!tgtId) return;
    const srcIdx = idxOf[srcId];
    const tgtIdx = idxOf[tgtId];
    if (srcIdx === undefined || tgtIdx === undefined) return;

    if (tgtIdx === srcIdx + 1) {
      const x1 = boxX(srcIdx) + bw;
      const x2 = boxX(tgtIdx);
      svg += `<line x1="${x1}" y1="${y + bh / 2}" x2="${x2 - 4}" y2="${y + bh / 2}" stroke="var(--text-secondary)" stroke-width="1.5" marker-end="url(#arrow)"/>`;
    } else if (tgtIdx > srcIdx) {
      // Forward jump curve
      const x1 = boxX(srcIdx) + bw / 2;
      const x2 = boxX(tgtIdx) + bw / 2;
      const midY = y - 30 - Math.abs(tgtIdx - srcIdx) * 6;
      svg += `<path d="M ${boxX(srcIdx) + bw} ${y + 10} Q ${(x1 + x2) / 2} ${midY} ${boxX(tgtIdx)} ${y + 10}" fill="none" stroke="var(--mint)" stroke-width="1.8" marker-end="url(#arrow)"/>`;
    } else {
      // Backward arc
      const x1 = boxX(srcIdx) + bw / 2;
      const x2 = boxX(tgtIdx) + bw / 2;
      const midY = y + bh + 30 + Math.abs(tgtIdx - srcIdx) * 6;
      svg += `<path d="M ${x1} ${y + bh} Q ${(x1 + x2) / 2} ${midY} ${x2} ${y + bh + 4}" fill="none" stroke="var(--pink)" stroke-width="1.8" marker-end="url(#arrow)"/>`;
    }
  });

  // Badges
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
  const svgWidth = Math.max(880, boxX(SIM.nodes.length) + 60);

  const svgEl = document.getElementById("listSvg");
  svgEl.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
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
  ["head", "slow", "fast", "prev", "first", "second"].forEach(p => {
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
