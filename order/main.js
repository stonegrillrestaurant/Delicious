/* ============================
   Stone Grill — Order Logic
   - Two-column responsive
   - Tap-to-add items
   - Cart with qty controls
   - Telegram + Google Sheets
   - Floating confirmation & GCash QR AFTER success
   - Mobile number auto +63
   - Category popup & item detail popup (long-press)
   ============================ */

const CFG = window.APP_CONFIG;

// ====== MENU (use your latest IMG_0139.jpeg mapping when ready) ======
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

// ====== HELPERS ======
const el = (sel) => document.querySelector(sel);
const els = (sel) => Array.from(document.querySelectorAll(sel));
const peso = (n) => "₱" + (n || 0).toFixed(2);
const toast = (msg) => {
  const t = el("#toast");
  t.textContent = msg;
  t.classList.add("show");
  t.classList.remove("hidden");
  setTimeout(() => t.classList.remove("show"), 1800);
};

function setMinDateTime() {
  const d = el("#orderDate");
  const t = el("#orderTime");
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
  let v = input.value.replace(/[^\d+]/g, "");
  if (!v.startsWith("+63")) v = "+63" + v.replace(/^0+/, "");
  input.value = v.slice(0, 14);
}

// ====== RENDER ======
function renderCategories() {
  const bar = el("#categoryBar");
  bar.innerHTML = "";
  categories.forEach(c => {
    const pill = document.createElement("button");
    pill.className = "cat-pill" + (c.id === activeCategory ? " active" : "");
    pill.innerHTML = `<span class="cat-emoji">${c.emoji}</span><span>${c.label}</span>`;
    pill.onclick = () => { activeCategory = c.id; renderCategories(); renderMenu(); };
    bar.appendChild(pill);
  });

  // popup pills too
  const pop = el("#popupCategories");
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
  list.innerHTML = "";
  (menuItems[activeCategory] || []).forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="item-title">${item.name}</div>
      <div class="item-actions">
        <div class="item-price">${peso(item.price)}</div>
        <button class="add-btn" aria-label="Add">＋</button>
      </div>
    `;
    // Tap to add
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
      <div class="cart-price">${peso(row.price * row.qty)}</div>
      <button class="remove-btn" aria-label="Remove">×</button>
    `;
    div.querySelector(".minus").onclick = () => updateQty(i, -1);
    div.querySelector(".plus").onclick = () => updateQty(i, +1);
    div.querySelector(".remove-btn").onclick = () => removeItem(i);
    wrap.appendChild(div);
  });

  el("#cartTotal").textContent = peso(total);
}

function addToCart(item) {
  const existing = cart.find(c => c.name === item.name);
  if (existing) existing.qty++;
  else cart.push({ ...item, qty: 1 });
  renderCart();
  toast(`Added: ${item.name}`);
}
function updateQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
}
function removeItem(index) { cart.splice(index,1); renderCart(); }

function clearCart() {
  cart = [];
  renderCart();
}

// ====== POPUPS ======
function togglePopup(sel, show) {
  const p = el(sel);
  if (show === undefined) p.classList.toggle("hidden");
  else p.classList.toggle("hidden", !show);
}
function showItemDetail(item) {
  const box = el("#itemDetail");
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

// ====== FORM / SUBMIT ======
async function submitOrder(e){
  e.preventDefault();
  if (cart.length === 0) { toast("Your cart is empty."); return; }

  const name = el("#fullName").value.trim();
  const mobile = el("#mobileNumber").value.trim();
  const orderType = (els("input[name='orderType']:checked")[0] || {}).value || "";
  const personsWrap = el("#personsWrap");
  const persons = personsWrap.classList.contains("hidden") ? "" : (el("#persons").value || "1");
  const date = el("#orderDate").value;
  const time = el("#orderTime").value;
  const requests = el("#specialRequests").value.trim();

  // Basic validation
  if (!name || !mobile || !orderType || !date || !time) {
    toast("Please complete the form.");
    return;
  }

  // Compose order message
  const itemsText = cart.map(i => `• ${i.name} × ${i.qty} = ${peso(i.price*i.qty)}`).join("\n");
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const msg =
`🧾 *${CFG.SHOP_NAME}* — Online Order
👤  ${name}
📱  ${mobile}
🗓️ ${date}  ⏰ Time: ${time}
🍽️ ${orderType}${orderType === "Dine-in" ? `  👥 Persons: ${persons}` : ""}
🧺 Items:
${itemsText}
────────────
💵 Total: ${peso(total)}
📝 Note: ${requests || "-"}
📍 ${CFG.ADDRESS}
☎️ ${CFG.PHONE}
`;

 const tUrl = `https://api.telegram.org/bot${CFG.TELEGRAM_BOT_TOKEN}/sendMessage`;
const tPayload = {
  chat_id: CFG.TELEGRAM_CHAT_ID,
  text: msg,
  parse_mode: "Markdown"
};


  // 2) Send to Google Sheets
  const sPayload = {
    name, mobile, orderType, persons, date, time, requests,
    total, items: cart, source: "order-page"
  };

  try {
    const [tRes, sRes] = await Promise.all([
      fetch(tUrl, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(tPayload)}),
      fetch(CFG.SHEETS_ENDPOINT, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(sPayload)})
    ]);

    if (!tRes.ok) throw new Error("Telegram error");
    if (!sRes.ok) throw new Error("Sheets error");

    // Success → show QR (does NOT show before submit)
    togglePopup("#successPopup", true);
    toast("Order sent! Please pay via GCash to proceed.");

    // Optional: clear cart after showing QR
    clearCart();
    el("#orderForm").reset();
    setMinDateTime();
    el("#personsWrap").classList.add("hidden");

  } catch (err) {
    console.error(err);
    toast("Failed to submit. Please try again.");
  }
}

// ====== EVENT BINDINGS ======
function initEvents() {
  // Category popup open by tapping the sticky bar (anywhere empty)
  el("#categoryBar").addEventListener("dblclick", () => togglePopup("#categoryPopup", true));
  els(".popup-close").forEach(b => b.addEventListener("click", () => b.closest(".popup-backdrop").classList.add("hidden")));

  // Order type toggles persons
  els("input[name='orderType']").forEach(r => r.addEventListener("change", () => {
    if (r.value === "Dine-in" && r.checked) el("#personsWrap").classList.remove("hidden");
    if (r.value === "Take-out" && r.checked) el("#personsWrap").classList.add("hidden");
  }));

  // Format mobile
  el("#mobileNumber").addEventListener("input", formatMobile);
  el("#mobileNumber").addEventListener("blur", formatMobile);

  // Buttons
  el("#clearCartBtn").onclick = clearCart;
  el("#checkoutBtn").onclick = () => el("#orderForm").requestSubmit();
  el("#orderForm").addEventListener("submit", submitOrder);

  // Success popup buttons
  el("#paidBtn").onclick = () => togglePopup("#successPopup", false);
  el("#copyRefBtn").onclick = async () => {
    const text = `Please pay via GCash by scanning the QR. After payment, reply with your reference number and name. Thank you!`;
    try { await navigator.clipboard.writeText(text); toast("Instructions copied."); } catch(e){ toast("Copy failed."); }
  };
}

// ====== INIT ======
function boot() {
  setMinDateTime();
  renderCategories();
  renderMenu();
  renderCart();
  initEvents();
  // Ensure QR path respects config
  const qr = document.getElementById("gcashQR");
  if (qr && CFG.GCASH_QR_PATH) qr.src = CFG.assets/qr
/gcash.png;
}
document.addEventListener("DOMContentLoaded", boot);
