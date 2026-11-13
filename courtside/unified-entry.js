/* Unified "New entry" card for the Venue Desk.
   Replaces the Quick Open Play card, the Quick sale card and the booking / late-entry popups
   with ONE card whose fields change with the selected type (Open play is the default).
   It reuses the app's own save logic (saveSession, saveLateOpen, quickOpenSave, quickSale),
   so rates, conflict checks, night pricing, payments and the Sheet/Supabase sync are unchanged. */
(function () {
  "use strict";
  if (typeof VIEWS === "undefined" || typeof saveSession !== "function" || typeof quickOpenSave !== "function") {
    console.warn("unified-entry: Venue Desk not found, nothing changed");
    return;
  }
  const isSale = v => Object.prototype.hasOwnProperty.call(QUICK, v);
  const kind = v => (isSale(v) ? "sale" : v);
  const BTN = { open: "Add player to Open Play", openstart: "Start Open Play session", rent: "Save court booking", event: "Save special event", late: "Save late entries", sale: "Record sale" };
  const val = (f, n) => { const e = f.elements.namedItem(n); return e ? e.value : ""; };
  const setv = (f, n, v) => { const e = f.elements.namedItem(n); if (e) { e.value = v; noteDraft({ target: e }); } };
  const L = (id, s) => { const e = document.getElementById(id); if (e) e.textContent = s; };

  function entryCard() {
    const sales = Object.keys(QUICK).map(k => `<option value="${esc(k)}">${esc(k)}</option>`).join("");
    return `<div class="card" id="quick-open-card"><b>New entry</b> <span class="note">pick a type, only the fields you need appear</span>
 <form id="entry" data-d="entry" onsubmit="event.preventDefault();entrySubmit(this)">
 <label>Type</label><select name="service" onchange="entryUp(true)">
  <optgroup label="Open play"><option value="open" selected>Open play (add a player)</option><option value="openstart">Open play – start a session</option><option value="late">Open play – late entry</option></optgroup>
  <optgroup label="Courts"><option value="rent">Court rental / reservation</option><option value="event">Special event</option></optgroup>
  <optgroup label="Sales">${sales}</optgroup></select>
 <div data-t="late"><label>Open Play session</label><select name="lsid" onchange="entryUp()"></select></div>
 <div class="grid" data-t="openstart rent event"><div><label>Court</label><select name="court" onchange="entryUp(true)">${[1, 2, 3, 4, 5, 6].map(c => `<option>${c}</option>`).join("")}</select></div>
  <div><label>Date</label><input type="date" name="date" value="${sdate}" min="${day(Date.now())}"></div></div>
 <div data-t="openstart rent event"><label>Start</label><select name="start">${slotOpts(null)}</select></div>
 <div data-t="open sale"><label id="e_pnlbl"></label><input name="pname" autocomplete="off"></div>
 <div data-t="openstart rent event late"><label id="e_nmlbl"></label><textarea name="names" rows="3"></textarea></div>
 <div data-t="rent"><label>Renter phone (optional)</label><input name="phone" type="tel"></div>
 <div class="grid" data-t="openstart rent event"><div data-t="rent event"><label>Hours</label><input name="hours" type="number" min="0.5" step="0.5" value="1" oninput="entryUp()"></div>
  <div><label>Max players</label><input name="max" type="number" min="1" max="50" value="12"></div></div>
 <div data-t="rent event"><label id="e_ratelbl"></label><input name="rate" type="number" min="0" step="1" oninput="entryUp()"></div>
 <div data-t="openstart"><div class="grid"><div><label>Daytime ₱ / player</label><input name="dayRate" type="number" min="0" step="1" value="${OPEN_RATE}" oninput="entryUp()"></div>
  <div><label>Nighttime ₱ / player</label><input name="nightRate" type="number" min="0" step="1" value="${OPEN_NIGHT_RATE}" oninput="entryUp()"></div></div>
  <label>Night starts at</label><input name="nightStart" type="time" value="${NIGHT_START}" oninput="entryUp()"></div>
 <div class="grid" data-t="open"><div><label>Time in</label><input name="intime" type="time" value="${quickOpenTime()}" oninput="entryRate(true)"></div>
  <div><label>Amount (₱)</label><input name="amount" type="number" min="0" step="1" oninput="this.form.dataset.auto='0'"></div></div>
 <div class="grid" data-t="sale"><div><label>Qty</label><input name="qty" type="number" min="1" value="1" oninput="entrySale()"></div>
  <div><label>Amount (₱)</label><input name="fee" type="number" min="0" step="1" value="50"></div></div>
 <div class="grid"><div data-t="open openstart rent event late"><label>Payment</label><select name="paid"><option value="yes">Paid now</option><option value="no">Pay later</option></select></div>
  <div><label>Mode of payment</label><select name="method">${METHODS.map(m => `<option>${m}</option>`).join("")}</select></div></div>
 <label>GCash ref # (optional)</label><input name="ref" autocomplete="off">
 <div class="note" id="e_info" style="margin-top:8px"></div><div class="note" id="e_hint"></div>
 <p><button class="btn" id="e_btn" style="width:100%"></button></p></form><div class="note" id="e_res"></div></div>`;
  }

  function lateOpts(force) {
    const f = document.getElementById("entry"), sel = f && f.elements.namedItem("lsid");
    if (!sel) return;
    const now = Date.now(), cut = now - 30 * 86400000;
    const opts = sessions.filter(s => s.mode === "open" && s.start <= now && s.start >= cut).sort((a, b) => b.start - a.start);
    const sig = opts.map(s => s.id).join(",");
    if (sel.dataset.sig === sig && !force) return;
    const keep = sel.value; sel.dataset.sig = sig;
    sel.innerHTML = opts.length
      ? opts.map(s => `<option value="${s.id}">${esc(new Date(s.start).toLocaleDateString())} · Court ${s.court} · ${tm(s.start)}–${openLive(s) ? "Open" : tm(s.until)}${s.closed ? " (ended)" : ""}</option>`).join("")
      : '<option value="">No Open Play sessions in the past 30 days</option>';
    if (keep && [...sel.options].some(o => o.value === keep)) sel.value = keep;
  }

  function entryRate(force) {
    const f = document.getElementById("entry"); if (!f) return;
    const hint = document.getElementById("e_hint");
    if (f.service.value !== "open") { if (hint) hint.textContent = ""; return; }
    const s = quickOpenCourts()[0];
    if (!s) { if (hint) hint.textContent = ""; return; }
    const p = (f.intime.value || quickOpenTime()).split(":").map(Number), n = new Date(); n.setHours(p[0], p[1], 0, 0);
    const fee = openRate(s, n.getTime());
    if (hint) hint.textContent = "Automatic rate on Court " + s.court + ": " + openPeriod(s, n.getTime()) + " " + money(fee) + " · the amount can be edited.";
    if (force || !f.amount.value || f.dataset.auto === "1") { f.amount.value = fee; f.dataset.auto = "1"; noteDraft({ target: f.amount }); }
  }

  function entrySale() {
    const f = document.getElementById("entry"); if (!f || !isSale(f.service.value)) return;
    setv(f, "fee", (QUICK[f.service.value] || 0) * (+f.qty.value || 1));
  }

  function entryUp(reset) {
    const f = document.getElementById("entry"); if (!f) return;
    const t = f.service.value, k = kind(t);
    f.querySelectorAll("[data-t]").forEach(el => { el.style.display = el.dataset.t.split(" ").includes(k) ? "" : "none"; });
    L("e_pnlbl", k === "sale" ? "Customer name (optional)" : "Player name");
    L("e_nmlbl", t === "rent" ? "Player names, one per line (first one is the renter who pays)" : t === "late" ? "Player names missed at check-in (one per line)" : "Players joining now, one per line (optional)");
    L("e_ratelbl", t === "rent" ? "Rate (₱ per hour, whole court)" : "Event fee (₱ per player)");
    L("e_btn", BTN[k]);
    if (reset) {
      if (t === "rent") setv(f, "rate", RENT_RATE(+f.court.value));
      else if (t === "event") setv(f, "rate", 0);
      if (k === "sale") entrySale();
      if (t === "open") f.dataset.auto = "1";
    } else if (f.rate.value === "") setv(f, "rate", t === "event" ? 0 : RENT_RATE(+f.court.value));
    if (t === "late") lateOpts(reset);
    let info = "";
    if (t === "open") {
      const av = quickOpenCourts();
      info = av.length ? "Automatic assignment: " + av.map(s => "Court " + s.court + " (" + sessPlayers(s.id).length + "/" + s.max + ")").join(" · ")
        : "No Open Play session is running with space. Choose “Open play – start a session”.";
      entryRate(false);
    } else {
      const h = document.getElementById("e_hint"); if (h) h.textContent = "";
      if (t === "openstart") info = "Ends at 12:00 midnight · Day " + money(+val(f, "dayRate")) + " · Night " + money(+val(f, "nightRate")) + " (starts " + val(f, "nightStart") + ")";
      else if (t === "rent") info = "Court fee: " + money((+val(f, "rate") || 0) * (+val(f, "hours") || 0));
      else if (t === "event") info = "Each player pays: " + money(+val(f, "rate") || 0) + " per session";
      else if (t === "late") {
        const s = sessions.find(x => x.id === val(f, "lsid"));
        if (s) info = "Court " + s.court + " · " + players.filter(p => p.sid === s.id && p.role !== "extension").length + "/" + s.max + " registered · Day " + money(s.dayRate ?? s.rate ?? OPEN_RATE) + " / Night " + money(s.nightRate ?? s.rate ?? OPEN_NIGHT_RATE) + " per player" + (s.closed ? " · Session closed" : "");
      }
    }
    L("e_info", info);
  }

  // The app's own save functions read a form by id; give them a hidden one with the same field names.
  function mk(id, vals) {
    const fm = document.createElement("form"); fm.id = id; fm.style.display = "none";
    Object.keys(vals).forEach(k => { const i = document.createElement(k === "names" ? "textarea" : "input"); i.name = k; i.value = vals[k]; fm.appendChild(i); });
    document.body.appendChild(fm); return fm;
  }
  const box = v => ({ value: v });

  function entrySubmit(f) {
    const t = f.service.value, k = kind(t), before = outbox.length, label = f.service.selectedOptions[0].text, who = val(f, "pname") || val(f, "names").split("\n")[0].trim();
    if (t === "open" && !quickOpenCourts().length) {
      if (confirm("No Open Play session is running with space. Start one now?")) {
        const nm = val(f, "pname"); setv(f, "service", "openstart"); if (nm) setv(f, "names", nm); entryUp(true);
      }
      return;
    }
    let tmp = null;
    try {
      if (t === "open") {
        quickOpenSave({ pname: box(val(f, "pname")), amount: box(val(f, "amount")), intime: box(val(f, "intime")), paid: box(val(f, "paid")), method: box(val(f, "method")), ref: box(val(f, "ref")), dataset: {}, reset() {} });
      } else if (t === "late") {
        tmp = mk("latepf", { sid: val(f, "lsid"), names: val(f, "names"), paid: val(f, "paid"), method: val(f, "method"), ref: val(f, "ref") });
        saveLateOpen();
      } else if (k === "sale") {
        quickSale({ service: box(t), cust: box(val(f, "pname")), qty: box(val(f, "qty")), fee: box(val(f, "fee")), method: box(val(f, "method")), ref: box(val(f, "ref")), reset() {} });
      } else {
        const v = { mode: t === "openstart" ? "open" : t };
        ["court", "date", "start", "hours", "max", "rate", "dayRate", "nightRate", "nightStart", "names", "phone", "paid", "method", "ref"].forEach(n => { v[n] = val(f, n); });
        tmp = mk("sf", v);
        saveSession();
      }
    } finally { if (tmp) tmp.remove(); }
    if (outbox.length > before) {            // saved (the app's own checks alert and stop otherwise)
      const keep = k === "sale" ? t : "open";
      delete draft.entry; f.reset();
      f.service.value = keep; f.intime.value = quickOpenTime(); f.date.value = sdate;
      f.dataset.auto = "1"; entryUp(true);
      L("e_res", "✓ Saved · " + label + (who ? " · " + who : ""));
    }
  }

  function entryFocus(type, pre) {
    if (tab !== "desk") go("desk");
    const f = document.getElementById("entry"); if (!f) return;
    setv(f, "service", type);
    if (pre) {
      if (pre.court) setv(f, "court", pre.court);
      const date = pre.date || (pre.start ? sdate : day(Date.now()));
      setv(f, "date", date);
      const m = pre.start ? String(Math.round((pre.start - dstart(date)) / 60000)) : "now";
      setv(f, "start", [...f.start.options].some(o => o.value === m) ? m : "now");
    }
    entryUp(true);
    const c = document.getElementById("quick-open-card");
    if (c && c.scrollIntoView) c.scrollIntoView({ behavior: "smooth", block: "start" });
    const first = [...f.querySelectorAll("input[name=pname],textarea[name=names]")].find(e => e.offsetParent !== null);
    if (first) first.focus({ preventScroll: true });
  }

  function entryPost() { placeQuickOpen(); entryUp(false); }

  Object.assign(window, { entryUp, entryRate, entrySale, entrySubmit, entryFocus });
  window.setupModal = pre => entryFocus("rent", pre);   // free-court tap and free schedule slots
  window.lateOpenModal = () => entryFocus("late");

  const oShell = VIEWS.desk.shell;
  VIEWS.desk.shell = () => oShell()
    .split(formOpenQuick).join(entryCard())
    .split(formQS).join("")
    .split('<button class="btn" onclick="setupModal({})">+ New court booking</button><button class="btn g" onclick="lateOpenModal()">+ Late Open Play Entry</button>')
    .join('<button class="btn" onclick="entryFocus(\'rent\')">+ New court booking</button><button class="btn g" onclick="entryFocus(\'late\')">+ Late Open Play entry</button>');
  VIEWS.desk.post = entryPost;

  if (tab === "desk" && document.getElementById("stats")) go("desk");   // already drawn: redraw with the new card
})();
