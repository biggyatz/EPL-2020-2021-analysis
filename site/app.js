// Premier League 2020/21 dashboard. Plain SVG, no chart library.
"use strict";

const POS = [
  { key: "Forward", short: "FWD", color: "var(--fwd)" },
  { key: "Midfielder", short: "MID", color: "var(--mid)" },
  { key: "Defender", short: "DEF", color: "var(--def)" },
  { key: "Goalkeeper", short: "GKP", color: "var(--gkp)" },
];
const POS_COLOR = Object.fromEntries(POS.map(p => [p.key, p.color]));

const METRICS = [
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "ga", label: "Goals + assists" },
  { key: "sot", label: "Shots on target" },
  { key: "bcc", label: "Big chances created" },
  { key: "passes", label: "Passes" },
  { key: "tackles", label: "Tackles" },
  { key: "interceptions", label: "Interceptions" },
  { key: "recoveries", label: "Ball recoveries" },
  { key: "clean_sheets", label: "Clean sheets" },
  { key: "saves", label: "Saves" },
  { key: "yellow", label: "Yellow cards" },
  { key: "fouls", label: "Fouls committed" },
];

// Per-appearance stats used in the profile percentile chart, by position.
const PROFILE_METRICS = {
  Forward: ["goals", "assists", "shots", "sot", "bcc", "headers", "passes", "tackles"],
  Midfielder: ["goals", "assists", "bcc", "passes", "tackles", "interceptions", "recoveries", "duels_won"],
  Defender: ["tackles", "interceptions", "clearances", "recoveries", "duels_won", "passes", "assists", "goals"],
  Goalkeeper: ["saves", "clean_sheets", "conceded", "high_claims", "catches", "passes"],
};
const LOWER_IS_BETTER = new Set(["conceded"]);
const STAT_LABEL = {
  goals: "Goals", assists: "Assists", shots: "Shots", sot: "Shots on target", bcc: "Big chances created",
  passes: "Passes", tackles: "Tackles", interceptions: "Interceptions", recoveries: "Recoveries",
  duels_won: "Duels won", clearances: "Clearances", saves: "Saves", clean_sheets: "Clean sheets",
  conceded: "Goals conceded", headers: "Headed goals", high_claims: "High claims", catches: "Catches", ga: "Goals + assists", yellow: "Yellow cards", fouls: "Fouls",
};

const fmt = n => n == null ? "–" : Number(n).toLocaleString("en-GB", { maximumFractionDigits: 2 });
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const el = id => document.getElementById(id);

// ---------- tooltip ----------
const tip = el("tooltip");
function showTip(evt, title, rows) {
  tip.innerHTML = `<b>${esc(title)}</b>` + rows.map(([k, v]) => `<div class="row"><span>${esc(k)}</span><span>${esc(v)}</span></div>`).join("");
  tip.hidden = false;
  const pad = 14, w = tip.offsetWidth, h = tip.offsetHeight;
  let x = evt.clientX + pad, y = evt.clientY + pad;
  if (x + w > window.innerWidth - 8) x = evt.clientX - w - pad;
  if (y + h > window.innerHeight - 8) y = evt.clientY - h - pad;
  tip.style.left = Math.max(8, x) + "px";
  tip.style.top = Math.max(8, y) + "px";
}
const hideTip = () => { tip.hidden = true; };
function bindTips(svg, lookup) {
  svg.querySelectorAll("[data-tip]").forEach(node => {
    const show = e => { const t = lookup(node.dataset.tip); showTip(e, t.title, t.rows); };
    node.addEventListener("pointermove", show);
    node.addEventListener("pointerleave", hideTip);
    node.addEventListener("focus", e => { const r = node.getBoundingClientRect(); show({ clientX: r.right, clientY: r.top }); });
    node.addEventListener("blur", hideTip);
  });
}

// ---------- helpers ----------
// Clean axis steps: 1, 2 or 5 x 10^k, aiming for about four intervals.
function niceStep(v) {
  const raw = v / 4, p = Math.pow(10, Math.floor(Math.log10(raw)));
  return [1, 2, 5, 10].map(m => m * p).find(s => s >= raw);
}
function niceMax(v) { if (v <= 0) return 1; const s = niceStep(v); return Math.ceil(v / s) * s; }
function ticks(max) { const s = niceStep(max), out = []; for (let t = 0; t <= max + 1e-9; t += s) out.push(+t.toFixed(6)); return out; }
function legendHTML(items) {
  return items.map(i => `<span class="key"><span class="sw" style="background:${i.color}"></span>${esc(i.label)}</span>`).join("");
}
function tableHTML(cols, rows) {
  return `<table><thead><tr>${cols.map(c => `<th class="${c.n ? "n" : ""}">${esc(c.label)}</th>`).join("")}</tr></thead><tbody>` +
    rows.map(r => `<tr>${cols.map(c => `<td class="${c.n ? "n" : ""}">${esc(c.n ? fmt(r[c.key]) : r[c.key] ?? "–")}</td>`).join("")}</tr>`).join("") +
    "</tbody></table>";
}
function pearson(xs, ys) {
  const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  return { r: sxy / Math.sqrt(sxx * syy), slope: sxy / sxx, intercept: my - (sxy / sxx) * mx };
}
const widthOf = node => Math.max(300, Math.floor(node.clientWidth));
// Rounded data-end, square at baseline (horizontal bar growing right).
function hbarPath(x, y, w, h, r = 4) {
  r = Math.min(r, w, h / 2);
  return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
}

// ---------- data ----------
let DATA;
fetch("data.json").then(r => r.json()).then(d => { DATA = d; init(); });

function init() {
  renderKPIs();
  setupLeaders();
  renderFinishing();
  renderWins();
  setupProfile();
  document.querySelectorAll("[data-table-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.tableToggle, t = el(id + "-table");
      t.hidden = !t.hidden;
      btn.textContent = t.hidden ? "Show table" : "Hide table";
    });
  });
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { renderLeaders(); renderFinishing(); renderWins(); renderProfile(); }, 120); });
}

// ---------- KPIs ----------
function renderKPIs() {
  const P = DATA.players, sum = k => P.reduce((a, p) => a + (p[k] || 0), 0);
  const top = k => P.reduce((a, p) => ((p[k] || 0) > (a[k] || 0) ? p : a));
  const scorer = top("goals"), creator = top("assists");
  const gk = P.filter(p => p.pos === "Goalkeeper").reduce((a, p) => ((p.clean_sheets || 0) > (a.clean_sheets || 0) ? p : a));
  const tiles = [
    { label: "Goals scored", value: fmt(sum("goals")), note: `${fmt(sum("assists"))} assists` },
    { label: "Golden Boot", value: scorer.goals, note: scorer.name },
    { label: "Most assists", value: creator.assists, note: creator.name },
    { label: "Most clean sheets", value: gk.clean_sheets, note: gk.name },
    { label: "Players used", value: fmt(P.length), note: "with 1+ appearance" },
  ];
  el("kpis").innerHTML = tiles.map(t => `<div class="kpi"><div class="label">${esc(t.label)}</div><div class="value">${esc(t.value)}</div><div class="note">${esc(t.note)}</div></div>`).join("");
}

// ---------- Leaderboard ----------
const leaderState = { metric: "goals", pos: "All" };
function setupLeaders() {
  el("leader-metric").innerHTML = METRICS.map(m => `<option value="${m.key}">${esc(m.label)}</option>`).join("");
  el("leader-metric").addEventListener("change", e => { leaderState.metric = e.target.value; renderLeaders(); });
  const chips = el("leader-pos");
  chips.innerHTML = ["All", ...POS.map(p => p.key)].map(k => `<button class="chip" role="radio" data-pos="${k}" aria-checked="${k === "All"}">${k === "All" ? "All positions" : k + "s"}</button>`).join("");
  chips.addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    leaderState.pos = b.dataset.pos;
    chips.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-checked", c === b));
    renderLeaders();
  });
  renderLeaders();
}
function renderLeaders() {
  const { metric, pos } = leaderState, label = METRICS.find(m => m.key === metric).label;
  const rows = DATA.players.filter(p => (pos === "All" || p.pos === pos) && p[metric] > 0)
    .sort((a, b) => b[metric] - a[metric] || a.name.localeCompare(b.name)).slice(0, 10);
  el("leaders-sub").textContent = `Top ${rows.length} · ${label}${pos === "All" ? "" : " · " + pos + "s"}`;
  const posInView = POS.filter(p => rows.some(r => r.pos === p.key));
  el("leaders-legend").innerHTML = posInView.length > 1 ? legendHTML(posInView.map(p => ({ label: p.key, color: p.color }))) : "";

  const host = el("leaders-chart"), W = widthOf(host), labelW = Math.min(170, W * 0.36), right = 44;
  const rowH = 32, barH = 18, H = rows.length * rowH + 24;
  if (!rows.length) { host.innerHTML = `<p class="sub">No players with this stat in this position.</p>`; el("leaders-table").innerHTML = ""; return; }
  const max = niceMax(rows[0][metric]), x = v => labelW + (v / max) * (W - labelW - right);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)} leaders">`;
  for (const t of ticks(max)) s += `<line class="gridline" x1="${x(t)}" x2="${x(t)}" y1="0" y2="${H - 22}"/><text class="tick" x="${x(t)}" y="${H - 6}" text-anchor="middle">${fmt(t)}</text>`;
  rows.forEach((p, i) => {
    const y = i * rowH + 6, w = Math.max(2, x(p[metric]) - labelW);
    s += `<text class="${i === 0 ? "lbl-strong" : "lbl"}" x="${labelW - 10}" y="${y + barH / 2 + 4}" text-anchor="end">${esc(trim(p.name, labelW))}</text>`;
    s += `<path d="${hbarPath(labelW, y, w, barH)}" fill="${POS_COLOR[p.pos]}"/>`;
    s += `<text class="val" x="${labelW + w + 6}" y="${y + barH / 2 + 4}">${fmt(p[metric])}</text>`;
    s += `<rect class="hit" data-tip="${i}" tabindex="0" x="0" y="${y - 6}" width="${W}" height="${rowH}"/>`;
  });
  s += `<line class="baseline" x1="${labelW}" x2="${labelW}" y1="0" y2="${H - 22}"/></svg>`;
  host.innerHTML = s;
  bindTips(host.querySelector("svg"), i => {
    const p = rows[i];
    return { title: p.name, rows: [["Position", p.pos], [label, fmt(p[metric])], ["Appearances", fmt(p.apps)], ["Per appearance", fmt(p[metric] / p.apps)]] };
  });
  el("leaders-table").innerHTML = tableHTML(
    [{ key: "rank", label: "#", n: true }, { key: "name", label: "Player" }, { key: "pos", label: "Position" }, { key: "v", label, n: true }, { key: "apps", label: "Apps", n: true }],
    rows.map((p, i) => ({ ...p, rank: i + 1, v: p[metric] })));
}
function trim(name, w) { const max = Math.floor(w / 7); return name.length > max ? name.slice(0, max - 1) + "…" : name; }

// ---------- Finishing scatter ----------
function renderFinishing() {
  const pts = DATA.players.filter(p => p.shots >= 15 && p.pos !== "Goalkeeper");
  const groups = POS.slice(0, 3);
  el("finishing-legend").innerHTML = legendHTML(groups.map(p => ({ label: p.key, color: p.color })));
  const host = el("finishing-chart"), W = widthOf(host), H = Math.round(Math.min(460, Math.max(300, W * 0.55)));
  const m = { l: 40, r: 16, t: 12, b: 38 };
  const xMax = niceMax(Math.max(...pts.map(p => p.shots))), yMax = niceMax(Math.max(...pts.map(p => p.goals)));
  const x = v => m.l + (v / xMax) * (W - m.l - m.r), y = v => H - m.b - (v / yMax) * (H - m.t - m.b);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Shots against goals scatter">`;
  for (const t of ticks(yMax)) s += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}"/><text class="tick" x="${m.l - 8}" y="${y(t) + 4}" text-anchor="end">${fmt(t)}</text>`;
  for (const t of ticks(xMax)) s += `<text class="tick" x="${x(t)}" y="${H - m.b + 16}" text-anchor="middle">${fmt(t)}</text>`;
  s += `<line class="baseline" x1="${m.l}" x2="${W - m.r}" y1="${y(0)}" y2="${y(0)}"/>`;
  s += `<text class="tick" x="${W - m.r}" y="${H - 4}" text-anchor="end">Shots →</text><text class="tick" x="${m.l}" y="${m.t - 2}" text-anchor="start">↑ Goals</text>`;
  for (const rate of [0.1, 0.2]) {
    const xEnd = Math.min(xMax, yMax / rate);
    s += `<line class="guide" x1="${x(0)}" y1="${y(0)}" x2="${x(xEnd)}" y2="${y(xEnd * rate)}"/>`;
    s += `<text class="tick" x="${x(xEnd) - 4}" y="${y(xEnd * rate) - 6}" text-anchor="end">${rate * 100}% conversion</text>`;
  }
  // Draw forwards last so they sit on top.
  const order = [...pts].sort((a, b) => groups.findIndex(g => g.key === b.pos) - groups.findIndex(g => g.key === a.pos));
  order.forEach(p => {
    const i = pts.indexOf(p);
    s += `<circle class="dot" cx="${x(p.shots)}" cy="${y(p.goals)}" r="5" fill="${POS_COLOR[p.pos]}"/>`;
    s += `<circle class="hit" data-tip="${i}" tabindex="-1" cx="${x(p.shots)}" cy="${y(p.goals)}" r="10"/>`;
  });
  // Label the standouts: most goals, and best conversion among 40+ shots.
  const byGoals = [...pts].sort((a, b) => b.goals - a.goals).slice(0, 3);
  const byConv = pts.filter(p => p.shots >= 40).sort((a, b) => b.goals / b.shots - a.goals / a.shots).slice(0, 2);
  const labelled = [...new Set([...byGoals, ...byConv])];
  labelled.forEach(p => {
    const lx = x(p.shots), ly = y(p.goals), left = lx > W * 0.7;
    s += `<text class="lbl-strong" x="${lx + (left ? -10 : 10)}" y="${ly + 4}" text-anchor="${left ? "end" : "start"}">${esc(p.name)}</text>`;
  });
  s += "</svg>";
  host.innerHTML = s;
  bindTips(host.querySelector("svg"), i => {
    const p = pts[i];
    return { title: p.name, rows: [["Position", p.pos], ["Goals", fmt(p.goals)], ["Shots", fmt(p.shots)], ["On target", fmt(p.sot)], ["Conversion", (100 * p.goals / p.shots).toFixed(1) + "%"]] };
  });
  el("finishing-table").innerHTML = tableHTML(
    [{ key: "name", label: "Player" }, { key: "pos", label: "Position" }, { key: "goals", label: "Goals", n: true }, { key: "shots", label: "Shots", n: true }, { key: "conv", label: "Conversion %", n: true }],
    [...pts].sort((a, b) => b.goals - a.goals).map(p => ({ ...p, conv: +(100 * p.goals / p.shots).toFixed(1) })));
}

// ---------- What wins (small multiples) ----------
function renderWins() {
  const C = DATA.clubs, wins = C.map(c => c.wins);
  const stats = [["goals", "Goals scored"], ["shots", "Shots"], ["passes", "Passes"], ["touches", "Touches"], ["tackles", "Tackles"]]
    .map(([k, label]) => ({ k, label, ...pearson(C.map(c => c[k]), wins) }))
    .sort((a, b) => b.r - a.r);
  const strongest = stats[0], weakest = stats[stats.length - 1];
  el("wins-insight").innerHTML = `<strong>${esc(strongest.label)}</strong> tracks wins most closely (r = ${strongest.r.toFixed(2)}). ` +
    (weakest.r < -0.2
      ? `<strong>${esc(weakest.label)}</strong> run the other way (r = ${weakest.r.toFixed(2)}): clubs that tackled more won less, likely because they had the ball less. `
      : `<strong>${esc(weakest.label)}</strong> barely relate to winning (r = ${weakest.r.toFixed(2)}). `) +
    `With only 10 clubs, treat these as patterns, not proof.`;
  const host = el("wins-chart");
  host.innerHTML = stats.map((st, j) => `<div class="panel"><h3>${esc(st.label)}</h3><div class="r"><em>r</em> = <strong>${st.r.toFixed(2)}</strong></div><div id="mult-${j}"></div></div>`).join("");
  stats.forEach((st, j) => {
    const box = el("mult-" + j), W = Math.max(180, box.clientWidth), H = 150, m = { l: 28, r: 10, t: 10, b: 26 };
    const xs = C.map(c => c[st.k]), lo = Math.min(...xs), hi = Math.max(...xs), padX = (hi - lo) * 0.08;
    const x0 = lo - padX, x1 = hi + padX, y0 = 15, y1 = 29;
    const x = v => m.l + ((v - x0) / (x1 - x0)) * (W - m.l - m.r), y = v => H - m.b - ((v - y0) / (y1 - y0)) * (H - m.t - m.b);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Wins against ${esc(st.label)}">`;
    for (const t of [16, 20, 24, 28]) s += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}"/><text class="tick" x="${m.l - 6}" y="${y(t) + 4}" text-anchor="end">${t}</text>`;
    s += `<text class="tick" x="${m.l}" y="${H - 6}">${compact(lo)}</text><text class="tick" x="${W - m.r}" y="${H - 6}" text-anchor="end">${compact(hi)}</text>`;
    s += `<line class="guide" x1="${x(x0)}" y1="${y(st.slope * x0 + st.intercept)}" x2="${x(x1)}" y2="${y(st.slope * x1 + st.intercept)}"/>`;
    C.forEach((c, i) => {
      s += `<circle class="dot" cx="${x(c[st.k])}" cy="${y(c.wins)}" r="5" fill="var(--accent)"/>`;
      s += `<circle class="hit" data-tip="${i}" cx="${x(c[st.k])}" cy="${y(c.wins)}" r="11"/>`;
    });
    s += "</svg>";
    box.innerHTML = s;
    bindTips(box.querySelector("svg"), i => ({ title: C[i].club, rows: [["Wins", C[i].wins], [st.label, fmt(C[i][st.k])]] }));
  });
  el("wins-table").innerHTML = tableHTML(
    [{ key: "club", label: "Club" }, { key: "wins", label: "Wins", n: true }, { key: "goals", label: "Goals", n: true }, { key: "shots", label: "Shots", n: true }, { key: "passes", label: "Passes", n: true }, { key: "touches", label: "Touches", n: true }, { key: "tackles", label: "Tackles", n: true }],
    [...C].sort((a, b) => b.wins - a.wins));
}
const compact = v => v >= 10000 ? (v / 1000).toFixed(0) + "k" : v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v);

// ---------- Player profile ----------
const profileState = { a: "Bruno Fernandes", b: "Kevin De Bruyne" };
function setupProfile() {
  const names = DATA.players.filter(p => p.apps >= 10).map(p => p.name).sort();
  el("player-names").innerHTML = names.map(n => `<option value="${esc(n)}">`).join("");
  el("player-a").value = profileState.a;
  el("player-b").value = profileState.b;
  const update = () => {
    const a = findPlayer(el("player-a").value), b = findPlayer(el("player-b").value);
    if (a) profileState.a = a.name;
    profileState.b = b ? b.name : (el("player-b").value.trim() ? profileState.b : "");
    renderProfile();
  };
  ["change", "input"].forEach(ev => { el("player-a").addEventListener(ev, update); el("player-b").addEventListener(ev, update); });
  renderProfile();
}
function findPlayer(name) {
  const q = name.trim().toLowerCase();
  return q && DATA.players.find(p => p.name.toLowerCase() === q && p.apps >= 10);
}
function percentile(p, stat) {
  const peers = DATA.players.filter(q => q.pos === p.pos && q.apps >= 10);
  const per = q => (q[stat] || 0) / q.apps, v = per(p);
  const below = peers.filter(q => LOWER_IS_BETTER.has(stat) ? per(q) > v : per(q) < v).length;
  const equal = peers.filter(q => per(q) === v).length;
  return Math.round(100 * (below + 0.5 * (equal - 1)) / Math.max(1, peers.length - 1));
}
function renderProfile() {
  const a = DATA.players.find(p => p.name === profileState.a);
  let b = profileState.b && DATA.players.find(p => p.name === profileState.b);
  if (b && b.pos !== a.pos && (a.pos === "Goalkeeper" || b.pos === "Goalkeeper")) b = null; // incomparable stat sets
  const players = [a, b].filter(Boolean), colors = ["var(--a)", "var(--b)"];
  el("profile-cards").innerHTML = players.map((p, i) => `
    <div class="pcard"><div class="who"><span class="sw" style="background:${colors[i]}"></span>${esc(p.name)} <span class="pos">${esc(p.pos)}</span></div>
    <dl><div><dt>Apps</dt><dd>${fmt(p.apps)}</dd></div><div><dt>Goals</dt><dd>${fmt(p.goals)}</dd></div><div><dt>Assists</dt><dd>${fmt(p.assists)}</dd></div>
    <div><dt>${p.pos === "Goalkeeper" ? "Clean sheets" : "Passes"}</dt><dd>${fmt(p.pos === "Goalkeeper" ? p.clean_sheets : p.passes)}</dd></div></dl></div>`).join("");
  el("profile-legend").innerHTML = players.length > 1 ? legendHTML(players.map((p, i) => ({ label: p.name, color: colors[i] }))) : "";

  const stats = PROFILE_METRICS[a.pos];
  const host = el("profile-chart"), W = widthOf(host), labelW = Math.min(170, W * 0.38), right = 40;
  const barH = players.length > 1 ? 10 : 16, gap = 2, groupH = players.length * barH + (players.length - 1) * gap, rowH = groupH + 16, H = stats.length * rowH + 26;
  const x = v => labelW + (v / 100) * (W - labelW - right);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Percentile profile">`;
  for (const t of [0, 25, 50, 75, 100]) s += `<line class="${t === 50 ? "guide" : "gridline"}" x1="${x(t)}" x2="${x(t)}" y1="0" y2="${H - 22}"/><text class="tick" x="${x(t)}" y="${H - 6}" text-anchor="middle">${t}</text>`;
  const cells = [];
  stats.forEach((st, i) => {
    const y = i * rowH + 6;
    s += `<text class="lbl" x="${labelW - 10}" y="${y + groupH / 2 + 4}" text-anchor="end">${esc(STAT_LABEL[st])}${LOWER_IS_BETTER.has(st) ? " (fewer)" : ""}</text>`;
    players.forEach((p, j) => {
      const pct = percentile(p, st), by = y + j * (barH + gap), w = Math.max(2, x(pct) - labelW);
      cells.push({ p, st, pct });
      s += `<path d="${hbarPath(labelW, by, w, barH)}" fill="${colors[j]}"/>`;
      s += `<text class="val" x="${labelW + w + 6}" y="${by + barH / 2 + 4}">${pct}</text>`;
      s += `<rect class="hit" data-tip="${cells.length - 1}" x="${labelW}" y="${by - 1}" width="${W - labelW}" height="${barH + 2}"/>`;
    });
  });
  s += `<line class="baseline" x1="${labelW}" x2="${labelW}" y1="0" y2="${H - 22}"/></svg>`;
  host.innerHTML = s;
  bindTips(host.querySelector("svg"), i => {
    const c = cells[i];
    return { title: c.p.name, rows: [[STAT_LABEL[c.st], fmt(c.p[c.st] || 0)], ["Per appearance", fmt((c.p[c.st] || 0) / c.p.apps)], ["Percentile vs " + c.p.pos.toLowerCase() + "s", c.pct]] };
  });
}
