const CODE_SNIPPETS = {
  js: [
    "function isPalindrome(head) {",
    "  let slow = head, fast = head;",
    "  while (fast && fast.next) {      // 1. Find middle",
    "    slow = slow.next;",
    "    fast = fast.next.next;",
    "  }",
    "  let prev = null, curr = slow;    // 2. Reverse 2nd half",
    "  while (curr) {",
    "    let nxt = curr.next; curr.next = prev; prev = curr; curr = nxt;",
    "  }",
    "  let p1 = head, p2 = prev;       // 3. Compare values",
    "  while (p2) {",
    "    if (p1.val !== p2.val) return false;",
    "    p1 = p1.next; p2 = p2.next;",
    "  }",
    "  return true;",
    "}"
  ],
  py: [
    "def isPalindrome(head: Optional[ListNode]) -> bool:",
    "    slow = fast = head",
    "    while fast and fast.next:",
    "        slow = slow.next; fast = fast.next.next",
    "    prev, curr = None, slow",
    "    while curr:",
    "        nxt = curr.next; curr.next = prev; prev = curr; curr = nxt",
    "    p1, p2 = head, prev",
    "    while p2:",
    "        if p1.val != p2.val: return False",
    "        p1, p2 = p1.next, p2.next",
    "    return True"
  ],
  java: [
    "public boolean isPalindrome(ListNode head) {",
    "    ListNode slow = head, fast = head;",
    "    while (fast != null && fast.next != null) {",
    "        slow = slow.next; fast = fast.next.next;",
    "    }",
    "    ListNode prev = null, curr = slow;",
    "    while (curr != null) {",
    "        ListNode nxt = curr.next; curr.next = prev; prev = curr; curr = nxt;",
    "    }",
    "    ListNode p1 = head, p2 = prev;",
    "    while (p2 != null) {",
    "        if (p1.val != p2.val) return false;",
    "        p1 = p1.next; p2 = p2.next;",
    "    }",
    "    return true;",
    "}"
  ],
  cpp: [
    "bool isPalindrome(ListNode* head) {",
    "    ListNode *slow = head, *fast = head;",
    "    while (fast && fast->next) {",
    "        slow = slow->next; fast = fast->next->next;",
    "    }",
    "    ListNode *prev = nullptr, *curr = slow;",
    "    while (curr) {",
    "        ListNode *nxt = curr->next; curr->next = prev; prev = curr; curr = nxt;",
    "    }",
    "    ListNode *p1 = head, *p2 = prev;",
    "    while (p2) {",
    "        if (p1->val != p2->val) return false;",
    "        p1 = p1->next; p2 = p2->next;",
    "    }",
    "    return true;",
    "}"
  ]
};

const PTR_COLORS = {
  slow: "var(--amber)",
  fast: "var(--coral)",
  prev: "var(--violet)",
  p1: "var(--mint)",
  p2: "var(--pink)",
  head: "var(--blue)"
};

let SIM = null;
let stepIdx = 0;
let playTimer = null;
let currentLang = 'js';

function simulate(vals) {
  let idc = 0;
  const nodes = vals.map(v => ({ id: "n" + (idc++), val: v, mem: "0x" + (130 + idc * 4).toString(16) }));

  const currentLinks = {};
  for (let i = 0; i < nodes.length - 1; i++) currentLinks[nodes[i].id] = nodes[i+1].id;
  currentLinks[nodes[nodes.length-1].id] = null;

  const steps = [];
  function snap(desc, ptrs, line) {
    steps.push({ desc, ptrs: { ...ptrs }, line, links: { ...currentLinks } });
  }

  if (nodes.length <= 1) {
    snap("List has 0 or 1 node — automatically a palindrome!", { head: nodes[0] ? nodes[0].id : null }, 15);
    return { nodes, steps };
  }

  // Phase 1: Find middle
  let slow = nodes[0].id;
  let fast = nodes[0].id;
  snap("PHASE 1: Find middle using slow (1x) and fast (2x) pointers.", { head: nodes[0].id, slow, fast }, 2);

  while (fast && currentLinks[fast]) {
    slow = currentLinks[slow];
    fast = currentLinks[currentLinks[fast]];
    snap(`Move slow to [${getNodeVal(nodes, slow)}], fast to ${fast ? "node [" + getNodeVal(nodes, fast) + "]" : "null"}.`, { head: nodes[0].id, slow, fast }, 3);
  }

  // Phase 2: Reverse 2nd half
  snap(`PHASE 2: Reverse second half of list starting from middle node [${getNodeVal(nodes, slow)}].`, { head: nodes[0].id, slow, prev: null }, 6);

  let prev = null;
  let curr = slow;
  while (curr) {
    let nxt = currentLinks[curr];
    currentLinks[curr] = prev;
    prev = curr;
    curr = nxt;
    snap(`Reversed link at node [${getNodeVal(nodes, prev)}]. Advance prev.`, { head: nodes[0].id, prev, curr }, 8);
  }

  // Phase 3: Compare halves
  let p1 = nodes[0].id;
  let p2 = prev;
  snap(`PHASE 3: Compare left half (p1 from head) vs reversed right half (p2 from new end).`, { head: nodes[0].id, p1, p2 }, 10);

  let isPal = true;
  while (p2) {
    const v1 = getNodeVal(nodes, p1);
    const v2 = getNodeVal(nodes, p2);

    if (v1 !== v2) {
      snap(`MISMATCH! p1.val (${v1}) != p2.val (${v2}). Not a palindrome!`, { head: nodes[0].id, p1, p2 }, 12);
      isPal = false;
      break;
    }

    snap(`MATCH! p1.val (${v1}) === p2.val (${v2}). Advance both pointers.`, { head: nodes[0].id, p1, p2 }, 13);
    p1 = currentLinks[p1];
    p2 = currentLinks[p2];
  }

  if (isPal) {
    snap(`Success! All paired elements match. The list IS a palindrome!`, { head: nodes[0].id }, 15);
  }

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

    if (tgtIdx > srcIdx) {
      const x1 = boxX(srcIdx) + bw;
      const x2 = boxX(tgtIdx);
      svg += `<line x1="${x1}" y1="${y + bh / 2}" x2="${x2 - 4}" y2="${y + bh / 2}" stroke="var(--text-secondary)" stroke-width="1.5" marker-end="url(#arrow)"/>`;
    } else {
      const x1 = boxX(srcIdx) + bw / 2;
      const x2 = boxX(tgtIdx) + bw / 2;
      const midY = y - 30;
      svg += `<path d="M ${boxX(srcIdx) + 12} ${y} Q ${(x1 + x2) / 2} ${midY} ${boxX(tgtIdx) + bw - 12} ${y - 2}" fill="none" stroke="var(--pink)" stroke-width="1.8" marker-end="url(#arrow)"/>`;
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
  const svgWidth = Math.max(880, boxX(SIM.nodes.length) + 60);

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

  // Variables Grid
  const varsGrid = document.getElementById("varsGrid");
  varsGrid.innerHTML = "";
  ["head", "slow", "fast", "prev", "p1", "p2"].forEach(p => {
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
