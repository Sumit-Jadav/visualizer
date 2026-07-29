const CODE_SNIPPETS = {
  java: [
    "ListNode dummy = new ListNode(0);",
    "dummy.next = head; prevGroup = dummy;",
    "for (i=0; i<k && kth!=null; i++) kth = kth.next;",
    "if (kth == null) break;",
    "ListNode groupNext = kth.next;",
    "kth.next = null;",
    "ListNode groupHead = prevGroup.next;",
    "ListNode newHead = reverse(groupHead);",
    "  // temp = groupHead, prev = null",
    "  // temp.next = prev; prev = temp; temp = next;",
    "prevGroup.next = newHead;",
    "groupHead.next = groupNext;",
    "prevGroup = groupHead;",
    "return dummy.next;"
  ],
  js: [
    "function reverseKGroup(head, k) {",
    "  let dummy = new ListNode(0); dummy.next = head;",
    "  let prevGroup = dummy;",
    "  while (true) {",
    "    let kth = getKth(prevGroup, k);",
    "    if (!kth) break;",
    "    let groupNext = kth.next; kth.next = null;",
    "    let groupHead = prevGroup.next;",
    "    let newHead = reverse(groupHead);",
    "    prevGroup.next = newHead;",
    "    groupHead.next = groupNext;",
    "    prevGroup = groupHead;",
    "  }",
    "  return dummy.next;",
    "}"
  ],
  py: [
    "def reverseKGroup(head: Optional[ListNode], k: int) -> Optional[ListNode]:",
    "    dummy = ListNode(0, head)",
    "    prevGroup = dummy",
    "    while True:",
    "        kth = getKth(prevGroup, k)",
    "        if not kth: break",
    "        groupNext = kth.next; kth.next = None",
    "        groupHead = prevGroup.next",
    "        newHead = reverse(groupHead)",
    "        prevGroup.next = newHead",
    "        groupHead.next = groupNext",
    "        prevGroup = groupHead",
    "    return dummy.next"
  ],
  cpp: [
    "ListNode* reverseKGroup(ListNode* head, int k) {",
    "    ListNode dummy(0); dummy.next = head;",
    "    ListNode* prevGroup = &dummy;",
    "    while (true) {",
    "        ListNode* kth = getKth(prevGroup, k);",
    "        if (!kth) break;",
    "        ListNode* groupNext = kth->next; kth->next = nullptr;",
    "        ListNode* groupHead = prevGroup->next;",
    "        ListNode* newHead = reverse(groupHead);",
    "        prevGroup->next = newHead;",
    "        groupHead->next = groupNext;",
    "        prevGroup = groupHead;",
    "    }",
    "    return dummy.next;",
    "}"
  ]
};

const PTR_COLOR = {
  prevGroup: "var(--coral)",
  kth: "var(--amber)",
  groupNext: "var(--blue)",
  groupHead: "var(--violet)",
  newHead: "var(--mint)",
  temp: "var(--pink)",
  prev: "var(--sand)",
  head: "var(--mint)"
};

const PTR_ORDER = ["prevGroup", "kth", "groupNext", "groupHead", "temp", "prev", "newHead"];

let SIM = null;
let stepIdx = 0;
let playTimer = null;
let currentLang = 'java';

function simulate(vals, k) {
  let idc = 0;
  const nodes = vals.map(v => ({ id: "n" + (idc++), val: v, mem: "0x" + (170 + idc * 4).toString(16) }));
  const dummy = { id: "dummy", val: "D", mem: "dummy" };

  const currentLinks = { dummy: nodes[0] ? nodes[0].id : null };
  for (let i = 0; i < nodes.length - 1; i++) currentLinks[nodes[i].id] = nodes[i + 1].id;
  if (nodes.length > 0) currentLinks[nodes[nodes.length - 1].id] = null;

  const steps = [];
  function snap(desc, ptrs, line) {
    steps.push({ desc, ptrs: { ...ptrs }, line, links: { ...currentLinks } });
  }

  let prevGroup = dummy.id;
  snap("Initialize dummy node ahead of head. prevGroup starts at dummy.", { prevGroup: dummy.id, head: nodes[0] ? nodes[0].id : null }, 1);

  while (true) {
    let kth = prevGroup;
    for (let i = 0; i < k && kth; i++) {
      kth = currentLinks[kth];
    }
    snap(`Walk k = ${k} steps from prevGroup to locate the kth node of this group.`, { prevGroup, kth: kth ? kth : null }, 2);

    if (!kth) {
      snap("Fewer than k nodes remain — stop here, this tail is left unreversed.", { prevGroup, kth: null }, 3);
      break;
    }

    const groupNext = currentLinks[kth];
    snap("Remember groupNext, the first node after this group.", { prevGroup, kth: kth, groupNext: groupNext ? groupNext : null }, 4);

    currentLinks[kth] = null;
    snap("Cut kth.next so the group becomes an isolated sub-list.", { prevGroup, kth: kth, groupNext: groupNext ? groupNext : null }, 5);

    const groupHead = currentLinks[prevGroup];
    snap("groupHead points at the current first node of the group.", { prevGroup, kth: kth, groupNext: groupNext ? groupNext : null, groupHead: groupHead }, 6);

    let temp = groupHead, prev = null;
    snap("Begin reversing the isolated group in place.", { prevGroup, groupHead, temp: temp ? temp : null, prev: null }, 8);

    while (temp) {
      const nxt = currentLinks[temp];
      currentLinks[temp] = prev;
      prev = temp;
      temp = nxt;
      snap("Flip temp.next backward, then advance prev and temp forward.", { prevGroup, groupHead, temp: temp ? temp : null, prev: prev ? prev : null }, 9);
    }

    const newHead = prev;
    snap("Reversal done — newHead is the group's new first node.", { prevGroup, groupHead, newHead: newHead }, 7);

    currentLinks[prevGroup] = newHead;
    snap("Splice it in: prevGroup.next = newHead.", { prevGroup, groupHead, newHead: newHead }, 10);

    currentLinks[groupHead] = groupNext;
    snap("groupHead — now the group's tail — reconnects to groupNext.", { prevGroup, groupHead, newHead: newHead, groupNext: groupNext ? groupNext : null }, 11);

    prevGroup = groupHead;
    snap("prevGroup advances to groupHead, ready for the next group.", { prevGroup }, 12);
  }

  snap("All full groups reversed. Return dummy.next.", { dummy: dummy.id, head: currentLinks[dummy.id] }, 13);
  return { nodes, dummy, steps };
}

function getNodeVal(allNodes, id) {
  if (!id) return "null";
  if (id === "dummy") return "D";
  const nd = allNodes.find(n => n.id === id);
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

  // Draw Nodes
  allNodes.forEach((nd, i) => {
    const x = boxX(i);
    const isDummy = nd.id === "dummy";
    const stroke = isDummy ? "var(--violet)" : "var(--border-strong)";

    svg += `<g>
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="var(--surface-raised)" stroke="${stroke}" stroke-width="${isDummy ? 1.5 : 1}"/>
      <text x="${x + bw / 2}" y="${y + bh / 2}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="${isDummy ? 13 : 15}" font-weight="700" fill="${isDummy ? "var(--violet)" : "var(--text-primary)"}">${nd.val}</text>
      <text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--text-muted)">${nd.mem}</text>
    </g>`;
  });

  // Draw Links
  Object.entries(s.links).forEach(([srcId, tgtId]) => {
    if (!tgtId) return;
    const srcIdx = idxOf[srcId];
    const tgtIdx = idxOf[tgtId];
    if (srcIdx === undefined || tgtIdx === undefined) return;

    const x1 = boxX(srcIdx) + bw;
    const x2 = boxX(tgtIdx);

    if (tgtIdx > srcIdx) {
      if (tgtIdx === srcIdx + 1) {
        svg += `<line x1="${x1}" y1="${y + bh / 2}" x2="${x2 - 4}" y2="${y + bh / 2}" stroke="var(--text-secondary)" stroke-width="1.4" marker-end="url(#arrow)"/>`;
      } else {
        const midY = y - 28 - (tgtIdx - srcIdx) * 4;
        svg += `<path d="M ${x1} ${y + 10} Q ${(boxX(srcIdx) + boxX(tgtIdx)) / 2} ${midY} ${x2} ${y + 10}" fill="none" stroke="var(--mint)" stroke-width="1.8" marker-end="url(#arrow)"/>`;
      }
    } else {
      const midY = y - 28 - Math.abs(srcIdx - tgtIdx) * 4;
      svg += `<path d="M ${boxX(srcIdx) + bw / 2} ${y} Q ${(boxX(srcIdx) + boxX(tgtIdx)) / 2} ${midY} ${boxX(tgtIdx) + bw / 2} ${y - 2}" fill="none" stroke="var(--coral)" stroke-width="1.8" marker-end="url(#arrow)"/>`;
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
      const color = PTR_COLOR[name] || "var(--text-muted)";
      const pw = Math.max(54, name.length * 8 + 14);
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
  PTR_ORDER.forEach(name => {
    if (!(name in s.ptrs)) return;
    const id = s.ptrs[name];
    const label = id === null ? "null" : id === "dummy" ? "dummy" : `val: ${getNodeVal(allNodes, id)}`;
    const color = PTR_COLOR[name] || "var(--border-strong)";
    varsGrid.innerHTML += `<div class="var-card" style="border-left-color:${color}">
      <div class="var-name">${name}</div>
      <div class="var-val">${label}</div>
    </div>`;
  });

  renderCode();
}

function renderCode() {
  const s = SIM.steps[stepIdx];
  const codeLines = CODE_SNIPPETS[currentLang] || CODE_SNIPPETS.java;
  document.getElementById("codeBox").innerHTML = codeLines.map((line, i) => {
    const active = i === s.line ? "active" : "";
    return `<div class="code-line ${active}">${line}</div>`;
  }).join("");
}

function buildSim() {
  const raw = document.getElementById("arrInput").value;
  const k = parseInt(document.getElementById("kInput").value, 10) || 1;
  const vals = raw.split(",").map(x => parseInt(x.trim(), 10)).filter(n => !isNaN(n));
  if (!vals.length) return;
  stopPlay();
  SIM = simulate(vals, Math.max(1, k));
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
    document.getElementById("kInput").value = btn.dataset.k;
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
