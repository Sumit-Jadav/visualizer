const CODE_LINES = [
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
];

const PTR_COLOR = {
  prevGroup: "var(--coral)",
  kth: "var(--amber)",
  groupNext: "var(--blue)",
  groupHead: "var(--violet)",
  newHead: "var(--mint)",
  temp: "var(--pink)",
  prev: "var(--sand)"
};

const PTR_ORDER = ["prevGroup", "kth", "groupNext", "groupHead", "temp", "prev", "newHead"];

let SIM = null;
let stepIdx = 0;
let playTimer = null;

function simulate(vals, k) {
  let idc = 0;
  const nodes = vals.map(v => ({ id: "n" + (idc++), val: v, next: null }));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  const dummy = { id: "dummy", val: "D", next: nodes[0] || null };
  const steps = [];

  function links() {
    const l = { dummy: dummy.next ? dummy.next.id : null };
    nodes.forEach(n => (l[n.id] = n.next ? n.next.id : null));
    return l;
  }
  function snap(desc, ptrs, line) {
    steps.push({ desc, ptrs: { ...ptrs }, line, links: links() });
  }

  let prevGroup = dummy;
  snap("Initialize dummy node ahead of head. prevGroup starts at dummy.", { prevGroup: "dummy" }, 1);

  while (true) {
    let kth = prevGroup;
    for (let i = 0; i < k && kth; i++) kth = kth.next;
    snap(`Walk k = ${k} steps from prevGroup to locate the kth node of this group.`, { prevGroup: prevGroup.id, kth: kth ? kth.id : null }, 2);

    if (!kth) {
      snap("Fewer than k nodes remain — stop here, this tail is left unreversed.", { prevGroup: prevGroup.id, kth: null }, 3);
      break;
    }

    const groupNext = kth.next;
    snap("Remember groupNext, the first node after this group.", { prevGroup: prevGroup.id, kth: kth.id, groupNext: groupNext ? groupNext.id : null }, 4);

    kth.next = null;
    snap("Cut kth.next so the group becomes an isolated sub-list.", { prevGroup: prevGroup.id, kth: kth.id, groupNext: groupNext ? groupNext.id : null }, 5);

    const groupHead = prevGroup.next;
    snap("groupHead points at the current first node of the group.", { prevGroup: prevGroup.id, kth: kth.id, groupNext: groupNext ? groupNext.id : null, groupHead: groupHead.id }, 6);

    let temp = groupHead, prev = null;
    snap("Begin reversing the isolated group in place.", { prevGroup: prevGroup.id, groupHead: groupHead.id, temp: temp ? temp.id : null, prev: null }, 8);

    while (temp) {
      const nxt = temp.next;
      temp.next = prev;
      prev = temp;
      temp = nxt;
      snap("Flip temp.next backward, then advance prev and temp forward.", { prevGroup: prevGroup.id, groupHead: groupHead.id, temp: temp ? temp.id : null, prev: prev ? prev.id : null }, 9);
    }

    const newHead = prev;
    snap("Reversal done — newHead is the group's new first node.", { prevGroup: prevGroup.id, groupHead: groupHead.id, newHead: newHead.id }, 7);

    prevGroup.next = newHead;
    snap("Splice it in: prevGroup.next = newHead.", { prevGroup: prevGroup.id, groupHead: groupHead.id, newHead: newHead.id }, 10);

    groupHead.next = groupNext;
    snap("groupHead — now the group's tail — reconnects to groupNext.", { prevGroup: prevGroup.id, groupHead: groupHead.id, newHead: newHead.id, groupNext: groupNext ? groupNext.id : null }, 11);

    prevGroup = groupHead;
    snap("prevGroup advances to groupHead, ready for the next group.", { prevGroup: prevGroup.id }, 12);
  }

  snap("All full groups reversed. Return dummy.next.", {}, 13);
  return { nodes, steps };
}

function boxX(i) { return 130 + i * 100; }

function centerOf(idxOf, id, bw) {
  if (id === "dummy") return { x: 55, i: -1 };
  const i = idxOf[id];
  return { x: boxX(i) + bw / 2, i };
}

function render() {
  const s = SIM.steps[stepIdx];
  const idxOf = {};
  SIM.nodes.forEach((nd, i) => (idxOf[nd.id] = i));
  const y = 70, bw = 60, bh = 42;

  let svg = `<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>`;

  svg += `<rect x="20" y="${y}" width="70" height="${bh}" rx="6" fill="var(--surface-raised)" stroke="var(--border-strong)" stroke-width="1"/>`;
  svg += `<text x="55" y="${y + bh / 2}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="12" fill="var(--text-muted)">dummy</text>`;

  SIM.nodes.forEach((nd, i) => {
    svg += `<rect x="${boxX(i)}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="var(--surface-raised)" stroke="var(--border-strong)" stroke-width="1"/>`;
    svg += `<text x="${boxX(i) + bw / 2}" y="${y + bh / 2}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700" fill="var(--text-primary)">${nd.val}</text>`;
  });

  Object.entries(s.links).forEach(([src, tgt]) => {
    if (tgt === null || tgt === undefined) return;
    const a = centerOf(idxOf, src, bw);
    const b = centerOf(idxOf, tgt, bw);
    if (b.i > a.i) {
      const x1 = a.i === -1 ? 90 : boxX(a.i) + bw;
      const x2 = boxX(b.i);
      svg += `<line x1="${x1}" y1="${y + bh / 2}" x2="${x2 - 4}" y2="${y + bh / 2}" stroke="var(--text-secondary)" stroke-width="1.3" marker-end="url(#arrow)"/>`;
    } else {
      const x1 = boxX(a.i) + bw / 2;
      const x2 = boxX(b.i) + bw / 2;
      const midY = y - 26 - Math.abs(a.i - b.i) * 3;
      svg += `<path d="M${x1} ${y} Q ${(x1 + x2) / 2} ${midY} ${x2} ${y - 2}" fill="none" stroke="var(--mint)" stroke-width="1.3" marker-end="url(#arrow)"/>`;
    }
  });

  const byNode = {};
  Object.entries(s.ptrs).forEach(([name, id]) => {
    if (id === undefined) return;
    const key = id === null ? "null" : id;
    (byNode[key] = byNode[key] || []).push(name);
  });

  let labelSvg = "";
  Object.entries(byNode).forEach(([id, names]) => {
    if (id === "null") return;
    const c = centerOf(idxOf, id, bw);
    const bx = c.i === -1 ? 55 : boxX(c.i) + bw / 2;
    names.forEach((nm, j) => {
      const ly = y + bh + 22 + j * 20;
      const color = PTR_COLOR[nm] || "var(--text-muted)";
      const pw = Math.max(58, nm.length * 7 + 16);
      labelSvg += `<rect x="${bx - pw / 2}" y="${ly - 12}" width="${pw}" height="18" rx="9" fill="${color}" opacity="0.16" stroke="${color}" stroke-width="1"/>`;
      labelSvg += `<text x="${bx}" y="${ly - 3}" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="500" fill="${color}">${nm}</text>`;
    });
  });

  const maxLabels = Math.max(1, ...Object.values(byNode).map(a => a.length));
  const svgHeight = y + bh + 22 + maxLabels * 20 + 12;

  const svgEl = document.getElementById("listSvg");
  svgEl.setAttribute("viewBox", `0 0 ${Math.max(900, boxX(SIM.nodes.length) + 40)} ${svgHeight}`);
  svgEl.innerHTML = svg + labelSvg;

  document.getElementById("descBox").textContent = s.desc;
  document.getElementById("stepCounter").textContent = `step ${stepIdx + 1} / ${SIM.steps.length}`;
  document.getElementById("progressFill").style.width = `${((stepIdx + 1) / SIM.steps.length) * 100}%`;
  document.getElementById("prevBtn").disabled = stepIdx === 0;
  document.getElementById("nextBtn").disabled = stepIdx === SIM.steps.length - 1;

  const varsGrid = document.getElementById("varsGrid");
  varsGrid.innerHTML = "";
  PTR_ORDER.forEach(name => {
    if (!(name in s.ptrs)) return;
    const id = s.ptrs[name];
    const label = id === null ? "null" : id === "dummy" ? "dummy" : SIM.nodes[idxOf[id]].val;
    const color = PTR_COLOR[name] || "var(--border-strong)";
    varsGrid.innerHTML += `<div class="var-card" style="border-left-color:${color}"><div class="var-name">${name}</div><div class="var-val">${label}</div></div>`;
  });

  const codeBox = document.getElementById("codeBox");
  codeBox.innerHTML = CODE_LINES.map((line, i) => {
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
  clearInterval(playTimer);
  playTimer = null;
  document.getElementById("playLabel").textContent = "play";
  document.getElementById("playIcon").innerHTML = `<path d="M4 2.5L13.5 8L4 13.5V2.5Z"/>`;
}

function togglePlay() {
  if (playTimer) { stopPlay(); return; }
  if (stepIdx >= SIM.steps.length - 1) stepIdx = 0;
  document.getElementById("playLabel").textContent = "pause";
  document.getElementById("playIcon").innerHTML = `<rect x="3" y="2.5" width="4" height="11"/><rect x="9" y="2.5" width="4" height="11"/>`;
  playTimer = setInterval(() => {
    if (stepIdx >= SIM.steps.length - 1) { stopPlay(); return; }
    stepIdx += 1;
    render();
  }, 900);
}

document.getElementById("generateBtn").addEventListener("click", buildSim);
document.getElementById("prevBtn").addEventListener("click", () => step(-1));
document.getElementById("nextBtn").addEventListener("click", () => step(1));
document.getElementById("playBtn").addEventListener("click", togglePlay);

document.querySelectorAll(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById("arrInput").value = btn.dataset.list;
    document.getElementById("kInput").value = btn.dataset.k;
    buildSim();
  });
});

document.addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT") return;
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === " ") { e.preventDefault(); togglePlay(); }
});

buildSim();
