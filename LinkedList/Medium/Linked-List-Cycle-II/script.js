const CODE_SNIPPETS = {
  js: [
    "function detectCycle(head) {",
    "  if (!head || !head.next) return null;",
    "  let slow = head, fast = head;",
    "  while (fast && fast.next) {       // Phase 1: Detect cycle",
    "    slow = slow.next;",
    "    fast = fast.next.next;",
    "    if (slow === fast) {",
    "      let entry = head;             // Phase 2: Find cycle entry",
    "      while (entry !== slow) {",
    "        entry = entry.next;",
    "        slow = slow.next;",
    "      }",
    "      return entry;                 // Cycle entry node found!",
    "    }",
    "  }",
    "  return null;",
    "}"
  ],
  py: [
    "def detectCycle(head: Optional[ListNode]) -> Optional[ListNode]:",
    "    if not head or not head.next: return None",
    "    slow = fast = head",
    "    while fast and fast.next:",
    "        slow = slow.next; fast = fast.next.next",
    "        if slow == fast:",
    "            entry = head",
    "            while entry != slow:",
    "                entry = entry.next; slow = slow.next",
    "            return entry",
    "    return None"
  ],
  java: [
    "public ListNode detectCycle(ListNode head) {",
    "    if (head == null || head.next == null) return null;",
    "    ListNode slow = head, fast = head;",
    "    while (fast != null && fast.next != null) {",
    "        slow = slow.next; fast = fast.next.next;",
    "        if (slow == fast) {",
    "            ListNode entry = head;",
    "            while (entry != slow) {",
    "                entry = entry.next; slow = slow.next;",
    "            }",
    "            return entry;",
    "        }",
    "    }",
    "    return null;",
    "}"
  ],
  cpp: [
    "ListNode *detectCycle(ListNode *head) {",
    "    if (!head || !head.next) return nullptr;",
    "    ListNode *slow = head, *fast = head;",
    "    while (fast && fast->next) {",
    "        slow = slow->next; fast = fast->next->next;",
    "        if (slow == fast) {",
    "            ListNode *entry = head;",
    "            while (entry != slow) {",
    "                entry = entry->next; slow = slow->next;",
    "            }",
    "            return entry;",
    "        }",
    "    }",
    "    return nullptr;",
    "}"
  ]
};

const PTR_COLORS = {
  slow: "var(--amber)",
  fast: "var(--coral)",
  entry: "var(--mint)",
  head: "var(--blue)"
};

let SIM = null;
let stepIdx = 0;
let playTimer = null;
let currentLang = 'js';

function simulate(vals, pos) {
  let idc = 0;
  const nodes = vals.map(v => ({ id: "n" + (idc++), val: v, mem: "0x" + (150 + idc * 4).toString(16) }));

  const currentLinks = {};
  for (let i = 0; i < nodes.length; i++) {
    if (i < nodes.length - 1) {
      currentLinks[nodes[i].id] = nodes[i + 1].id;
    } else {
      currentLinks[nodes[i].id] = (pos >= 0 && pos < nodes.length) ? nodes[pos].id : null;
    }
  }

  const steps = [];
  function snap(desc, ptrs, line, cycleEntryId = null) {
    steps.push({ desc, ptrs: { ...ptrs }, line, links: { ...currentLinks }, cycleEntryId });
  }

  if (nodes.length === 0) {
    snap("Empty list — no cycle.", { head: null }, 1);
    return { nodes, steps, pos };
  }

  let slow = nodes[0].id;
  let fast = nodes[0].id;

  snap("PHASE 1: Initialize slow and fast at head to detect if a cycle exists.", { head: nodes[0].id, slow, fast }, 2);

  let hasCycle = false;
  let iter = 0;
  while (fast && currentLinks[fast] && iter < 20) {
    iter++;
    slow = currentLinks[slow];
    fast = currentLinks[currentLinks[fast]];

    const sVal = getNodeVal(nodes, slow);
    const fVal = getNodeVal(nodes, fast);
    snap(`Phase 1 (Iter ${iter}): slow -> [${sVal}], fast -> [${fVal}].`, { head: nodes[0].id, slow, fast }, 5);

    if (slow === fast) {
      hasCycle = true;
      snap(`PHASE 1 COMPLETE: Intersection found at node [${sVal}]!`, { head: nodes[0].id, slow, fast }, 6);
      break;
    }
  }

  if (!hasCycle) {
    snap("Fast reached null! No cycle in this list. Return null.", { head: nodes[0].id, slow, fast }, 15);
    return { nodes, steps, pos };
  }

  // Phase 2
  let entry = nodes[0].id;
  snap(`PHASE 2: Reset entry pointer to head node [${getNodeVal(nodes, entry)}]. Advance entry and slow at equal 1x speed.`, { head: nodes[0].id, entry, slow }, 8);

  while (entry !== slow) {
    entry = currentLinks[entry];
    slow = currentLinks[slow];
    snap(`Step entry & slow 1 step: entry -> [${getNodeVal(nodes, entry)}], slow -> [${getNodeVal(nodes, slow)}].`, { head: nodes[0].id, entry, slow }, 10);
  }

  snap(`CYCLES ENTRY FOUND! Both entry and slow met at node [${getNodeVal(nodes, entry)}] (pos = ${pos}).`, { head: nodes[0].id, entry, slow }, 12, entry);

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
    const isEntry = s.cycleEntryId === nd.id;
    const stroke = isEntry ? "var(--mint)" : i === SIM.pos ? "var(--coral)" : "var(--border-strong)";
    const fill = isEntry ? "rgba(79, 216, 184, 0.2)" : "var(--surface-raised)";

    svg += `<g>
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="${isEntry ? 2.5 : 1.2}"/>
      <text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--text-muted)">${nd.mem}</text>
      <text x="${x + bw / 2}" y="${y + bh / 2}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="16" font-weight="700" fill="${isEntry ? "var(--mint)" : "var(--text-primary)"}">${nd.val}</text>
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
      const midY = y + bh + 45;
      svg += `<path d="M ${x1} ${y + bh} Q ${(x1 + x2) / 2} ${midY} ${x2} ${y + bh + 2}" fill="none" stroke="var(--coral)" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrow)"/>`;
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
  ["head", "slow", "fast", "entry"].forEach(p => {
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
