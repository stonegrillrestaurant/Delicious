const CFG = window.APP_CONFIG;

// ====== MENU ======
const menuItems = {
  pork: [
    { name: "Pork Sisig", price: 199 },
    { name: "Lechon Kawali", price: 229 },
    { name: "Crispy Pata", price: 499 }
  ],
  chicken: [
    { name: "Fried Chicken (2pcs)", price: 189 },
    { name: "Chicken Inasal", price: 209 }
  ],
  beef: [
    { name: "Beef Tapa", price: 219 },
    { name: "Beef Caldereta", price: 249 }
  ],
  vegetables: [
    { name: "Chopsuey", price: 169 },
    { name: "Pinakbet", price: 169 }
  ],
  seafood: [
    { name: "Shrimp Garlic Butter", price: 289 },
    { name: "Grilled Bangus", price: 239 }
  ],
  noodles: [
    { name: "Pancit Canton", price: 169 },
    { name: "Spaghetti", price: 159 }
  ],
  bbq: [
    { name: "Pork BBQ (2 sticks)", price: 89 },
    { name: "Isaw (5 pcs)", price: 59 }
  ],
  soup: [
    { name: "Sinigang Baboy", price: 249 },
    { name: "Nilagang Baka", price: 279 }
  ],
  // Optional categories used by your HTML buttons; leave if you'll fill later
  specials: [
    { name: "Sizzling Bulalo", price: 399 }
  ],
  drinks: [
    { name: "Iced Tea (Pitcher)", price: 149 },
    { name: "Bottled Water", price: 25 }
  ]
};

const categories = [
  { id: "pork", label: "Pork", emoji: "🐖" },
  { id: "chicken", label: "Chicken", emoji: "🐓" },
  { id: "beef", label: "Beef", emoji: "🐂" },
  { id: "vegetables", label: "Veggies", emoji: "🥦" },
  { id: "seafood", label: "Seafood", emoji: "🦐" },
  { id: "noodles", label: "Noodles", emoji: "🍜" },
  { id: "bbq", label: "Grilled/BBQ", emoji: "🔥" },
  { id: "soup", label: "Soup", emoji: "🍲" },
];

// ====== STATE ======
let cart = [];
let activeCategory = categories[0].id;
let longPressTimer = null;
// ✅ Guard so QR popup NEVER shows on load
let paymentDialogAllowed = false;

// Expose for your HTML buttons like onclick="showCategory('pork')"
window.showCategory = function(id) {
  activeCategory = id;
  renderMenu();
};

// ====== HELPERS ======
const el = (sel) => document.querySelector(sel);
const els = (sel) => Array.from(document.querySelectorAll(sel));
const peso = (n) => "₱" + (n || 0).toFixed(2);

// ✅ Toast that auto-hides
const toast = (msg) => {
  const t = el("#toast");
  if (!t) return;

  t.textContent = msg;
  t.classList.remove("hidden");
  t.classList.add("show");

  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.classList.add("hidden"), 300); // allow fade-out
  }, 1800);
};

function setMinDateTime() {
  const d = el("#orderDate");
  const t = el("#orderTime");
  if (!d || !t) return;
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2,'0');
  const dd = String(now.getDate()).padStart(2,'0');
  d.min = `${yyyy}-${mm}-${dd}`;
  d.value = `${yyyy}-${mm}-${dd}`;
  const hh = String(now.getHours()).padStart(2,'0');
  const min = String(now.getMinutes()).padStart(2,'0');
  t.value = `${hh}:${min}`;
}

// Mobile auto +63
function formatMobile() {
  const input = el("#mobileNumber");
  if (!input) return;
  let v = input.value.replace(/[^\d+]/g, "");
  if (!v.startsWith("+63")) v = "+63" + v.replace(/^0+/, "");
  input.value = v.slice(0, 14);
}

// ====== RENDER ======
function renderCategories() {
  const bar = el("#categoryBar");
  if (!bar) return;
  bar.innerHTML = "";
  categories.forEach(c => {
    const pill = document.createElement("button");
    pill.className = "cat-pill" + (c.id === activeCategory ? " active" : "");
    pill.innerHTML = `<span class="cat-emoji">${c.emoji}</span><span>${c.label}</span>`;
    pill.onclick = () => { activeCategory = c.id; renderCategories(); renderMenu(); };
    bar.appendChild(pill);
  });

  const pop = el("#popupCategories");
  if (!pop) return;
  pop.innerHTML = "";
  categories.forEach(c => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = `${c.emoji} ${c.label}`;
    btn.onclick = () => {
      activeCategory = c.id;
      renderCategories(); renderMenu();
      togglePopup("#categoryPopup", false);
    };
    pop.appendChild(btn);
  });
}

function renderMenu() {
  const list = el("#menuList");
  if (!list) return;
  list.innerHTML = "";
  (menuItems[activeCategory] || []).forEach((item) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="item-title">${item.name}</div>
      <div class="item-actions">
        <div class="item-price">${peso(item.price)}</div>
        <button class="add-btn" aria-label="Add"></button>
      </div>
    `;
    div.querySelector(".add-btn").onclick = (e) => { e.stopPropagation(); addToCart(item); };
    div.onclick = () => addToCart(item);

    // Long-press for detail popup
    div.addEventListener("touchstart", () => {
      longPressTimer = setTimeout(() => showItemDetail(item), 550);
    });
    div.addEventListener("touchend", () => clearTimeout(longPressTimer));
    div.addEventListener("mousedown", () => {
      longPressTimer = setTimeout(() => showItemDetail(item), 700);
    });
    div.addEventListener("mouseup", () => clearTimeout(longPressTimer));

    list.appendChild(div);
  });
}

function renderCart() {
  const wrap = el("#cartItems");
  const totalEl = el("#cartTotal");
  const subEl = el("#cartSubtotal"); // optional subtotal
  if (!wrap || !totalEl) return;

  wrap.innerHTML = "";
  let total = 0;

  cart.forEach((row, i) => {
    total += row.price * row.qty;
    const div = document.createElement("div");
    div.className = "cart-row";
    div.innerHTML = `
      <div class="cart-name">${row.name}</div>
      <div class="qty-wrap">
        <button class="qty-btn minus">−</button>
        <div>${row.qty}</div>
        <button class="qty-btn plus">＋</button>
      </div>
      <div class="cart-price">₱${(row.price * row.qty).toFixed(2)}</div>
      <button class="remove-btn" aria-label="Remove">×</button>
    `;
    div.querySelector(".minus").onclick = () => updateQty(i, -1);
    div.querySelector(".plus").onclick = () => updateQty(i, +1);
    div.querySelector(".remove-btn").onclick = () => removeItem(i);
    wrap.appendChild(div);
  });

  if (subEl) subEl.textContent = "₱" + total.toFixed(2); // Subtotal under the list
  totalEl.textContent = "₱" + total.toFixed(2);          // Header "Total"
}

function addToCart(item) {
  const existing = cart.find(c => c.name === item.name);
  if (existing) existing.qty++;
  else cart.push({ ...item, qty: 1 });
  renderCart();
  toast(`Added: ${item.name}`);

  // ✅ Auto-close item detail popup if it's open
  const itemPop = el("#itemPopup");
  if (itemPop && !itemPop.classList.contains("hidden")) {
    togglePopup("#itemPopup", false);
  }
}
function updateQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
}
function removeItem(index) { cart.splice(index,1); renderCart(); }
function clearCart() { cart = []; renderCart(); }

// ====== POPUPS ======
function togglePopup(sel, show) {
  const p = el(sel);
  if (!p) return;
  if (show === undefined) p.classList.toggle("hidden");
  else p.classList.toggle("hidden", !show);
}
function showItemDetail(item) {
  const box = el("#itemDetail");
  if (!box) return;
  box.innerHTML = `
    <h3>${item.name}</h3>
    <p class="muted">Price: <strong>${peso(item.price)}</strong></p>
    <div class="inline">
      <button class="btn" id="detailAdd">Add to Cart</button>
      <button class="btn ghost" id="detailClose">Close</button>
    </div>
  `;
  togglePopup("#itemPopup", true);
  el("#detailAdd").onclick = () => { addToCart(item); togglePopup("#itemPopup", false); };
  el("#detailClose").onclick = () => togglePopup("#itemPopup", false);
}

// ====== SUBMIT ======
async function submitOrder(e){
  e.preventDefault();
  if (cart.length === 0) { toast("Your cart is empty."); return; }

  const name = el("#fullName")?.value.trim();
  const mobile = el("#mobileNumber")?.value.trim();
  const orderType = (els("input[name='orderType']:checked")[0] || {}).value || "";
  const personsWrap = el("#personsWrap");
  const persons = personsWrap && !personsWrap.classList.contains("hidden")
    ? (el("#persons").value || "1")
    : "";

  const date = el("#orderDate")?.value;
  const time = el("#orderTime")?.value;
  const requests = el("#specialRequests")?.value.trim();

  if (!name || !mobile || !orderType || !date || !time) {
    toast("Please complete the form.");
    return;
  }

  const itemsText = cart.map(i => `• ${i.name} × ${i.qty} = ${peso(i.price*i.qty)}`).join("\n");
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const msg =
`🧾 *${CFG.SHOP_NAME}* -- Online Order
👤  ${name}
📱  ${mobile}
🗓️ ${date}  ⏰ ${time}
🍽️ ${orderType}${orderType === "Dine-in" ? `  👥 Persons: ${persons}` : ""}
🧺 Items:
${itemsText}
────────────
💵 Total: ${peso(total)}
📝 Note: ${requests || "-"}
📍 ${CFG.ADDRESS}
☎️ ${CFG.PHONE}`;

  const tUrl = `https://api.telegram.org/bot${CFG.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const tPayload = { chat_id: CFG.TELEGRAM_CHAT_ID, text: msg, parse_mode: "Markdown" };
  const sPayload = { name, mobile, orderType, persons, date, time, requests, total, items: cart, source: "order-page" };

  try {
    const [tRes, sRes] = await Promise.all([
      fetch(tUrl, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(tPayload)}),
      fetch(CFG.SHEETS_ENDPOINT, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(sPayload)})
    ]);

    if (!tRes.ok) throw new Error("Telegram error");
    if (!sRes.ok) throw new Error("Sheets error");

    // ✅ allow QR popup only after a real success
    paymentDialogAllowed = true;
    if (paymentDialogAllowed) togglePopup("#successPopup", true);

    toast("Order sent! Please pay via GCash to proceed.");

    clearCart();
    el("#orderForm")?.reset();
    setMinDateTime();
    el("#personsWrap")?.classList.add("hidden");

  } catch (err) {
    console.error(err);
    paymentDialogAllowed = false;   // ✅ never show QR on error
    toast("Failed to submit. Please try again.");
  }
}

// ====== EVENTS ======
function initEvents() {
  el("#categoryBar")?.addEventListener("dblclick", () => togglePopup("#categoryPopup", true));
  els(".popup-close").forEach(b => b.addEventListener("click", () => b.closest(".popup-backdrop").classList.add("hidden")));

  // ✅ Click backdrop to close (not clicks inside)
  document.querySelectorAll(".popup-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.classList.add("hidden");
    });
  });

  els("input[name='orderType']").forEach(r => r.addEventListener("change", () => {
    if (r.value === "Dine-in" && r.checked) el("#personsWrap")?.classList.remove("hidden");
    if (r.value === "Take-out" && r.checked) el("#personsWrap")?.classList.add("hidden");
  }));

  el("#mobileNumber")?.addEventListener("input", formatMobile);
  el("#mobileNumber")?.addEventListener("blur", formatMobile);

  el("#clearCartBtn").onclick = clearCart;
  el("#checkoutBtn").onclick = () => el("#orderForm").requestSubmit();
  el("#orderForm").addEventListener("submit", submitOrder);

  el("#paidBtn").onclick = () => togglePopup("#successPopup", false);
  el("#copyRefBtn").onclick = async () => {
    const text = `Please pay via GCash by scanning the QR. After payment, reply with your reference number and name. Thank you!`;
    try { await navigator.clipboard.writeText(text); toast("Instructions copied."); } catch(e){ toast("Copy failed."); }
  };
}

// ====== BOOT ======
function boot() {
  setMinDateTime();
  renderCategories();
  renderMenu();
  renderCart();
  initEvents();

  // ✅ force-hide ANY popup on first load
  document.querySelectorAll(".popup-backdrop").forEach(p => p.classList.add("hidden"));

  // ✅ set QR image without showing popup
  const qr = document.getElementById("gcashQR");
  if (qr && CFG.GCASH_QR_PATH) qr.src = CFG.GCASH_QR_PATH;
}

document.addEventListener("DOMContentLoaded", boot);