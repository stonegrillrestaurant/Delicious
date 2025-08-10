/* =========================================================================
   Stone Grill — main.js (v10)
   - Categories → Items → Cart → Subtotal
   - Clear Cart
   - Dine-in pax toggle
   - Mobile number +63 formatting
   - Telegram send (REQUIRED)
   - Google Sheets log (OPTIONAL, non-blocking)
   - Toast messages
   - GCash popup intentionally NOT triggered per request
   ========================================================================= */

/* ---- Config compatibility layer --------------------------------------- */
(function attachConfig() {
  const sources = [window.CFG, window.APP_CONFIG, window.app_config, window.config, window].filter(Boolean);
  function pick(...keys) {
    for (const src of sources) { for (const k of keys) { if (src && src[k] != null) return src[k]; } }
    return undefined;
  }
  window.APP = {
    TELEGRAM_BOT_TOKEN: pick('TELEGRAM_BOT_TOKEN', 'telegramBotToken'),
    TELEGRAM_CHAT_ID: pick('TELEGRAM_CHAT_ID', 'telegramChatId'),
    GOOGLE_APPS_SCRIPT_URL: pick('GOOGLE_APPS_SCRIPT_URL', 'appsScriptUrl', 'GOOGLE_SHEETS_WEBAPP_URL'),
  };
})();

/* ---- Toast ------------------------------------------------------------- */
function showToast(msg, ms = 2200) {
  const el = document.getElementById('toast');
  if (!el) return alert(msg);
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), ms);
}

/* === MENU START (Edit this block only if you need to update items/prices) === */
/* === MENU (updated from your board; unreadable items skipped) === */
var MENU = {
  /* ---------- SET MEAL (restored) ---------- */
  setMeals: [
    { name: "Set A", price: 1100 },
    { name: "Set B", price: 1000 },
    { name: "Set C", price: 1980 },
    { name: "Boodle", price: 2300 },
    { name: "Mix Seafood Inferno (Hot)", price: 850 },
    { name: "Mix Seafood Heaven (Reg)", price: 850 }
  ],

  /* ---------- SOUP ---------- */
  soup: [
    { name: "Crab & Corn Soup", price: 190 },
    { name: "Cream of Mushroom", price: 190 },
    { name: "Egg Drop Soup", price: 180 },
    { name: "Vegetable Soup", price: 230 },
    { name: "Pork Sinigang", price: 280 },
    { name: "Mix Seafood Tinola", price: 350 }
  ],

  /* ---------- RICE ---------- */
  rice: [
    { name: "Cup Rice", price: 25 },
    { name: "Platter Rice", price: 100 },
    { name: "Garlic Fried Rice", price: 180 },
    { name: "Black Rice", price: 180 },
    { name: "Stone Grill Fried Rice", price: 200 },
    { name: "Shrimp Fried Rice", price: 195 }
  ],

  /* ---------- VEGETABLES ---------- */
  vegetables: [
    { name: "Pinakbet", price: 235 },
    { name: "Chopsuey", price: 210 },
    { name: "Chopsuey (Seafood)", price: 230 },
    { name: "Beef with Ampalaya", price: 300 },
    { name: "Beef with Broccoli", price: 320 }
  ],

  /* ---------- NOODLES / PASTA ---------- */
  noodles: [
    { name: "Lomi", price: 180 },
    { name: "Lomi (Seafood)", price: 200 },
    { name: "Canton", price: 200 },
    { name: "Canton (Seafood)", price: 220 },
    { name: "Bihon", price: 240 },
    { name: "Bihon (Seafood)", price: 270 },
    { name: "Bam-i", price: 220 },
    { name: "Bam-i (Seafood)", price: 240 },
    { name: "Sotanghon Guisado (Reg)", price: 280 },
    { name: "Sotanghon Guisado (Large)", price: 300 }
  ],

  /* ---------- CHICKEN ---------- */
  chicken: [
    { name: "Naked Fried Chicken", price: 220 },
    { name: "Fried Chicken", price: 200 },
    { name: "Buttered Chicken", price: 230 },
    { name: "Buffalo Chicken or Curry", price: 240 },
    { name: "Chicken Teriyaki", price: 250 }
  ],

  /* ---------- BEEF ---------- */
  beef: [
    { name: "Beef Steak", price: 300 },
    { name: "Beef w/ Mushroom", price: 310 },
    { name: "Beef Caldereta", price: 320 },
    { name: "Beef Nilaga", price: 320 }
  ],

  /* ---------- FISH ---------- */
  fish: [
    { name: "Fish Fillet in Mayo Dip", price: 310 },
    { name: "Grilled Fish", price: 300 },
    { name: "Fried Fish", price: 320 },
    { name: "Fish Kinilaw", price: 310 },
    { name: "Fish Tinola", price: 340 },
    { name: "Fish Sinigang", price: 340 },
    { name: "Sweet & Sour Fish", price: 300 },
    { name: "Fish with Tausi", price: 340 },
    { name: "Fish Eskabetche", price: 330 }
  ],

  /* ---------- SHRIMP ---------- */
  shrimp: [
    { name: "Crispy Fried Shrimp", price: 240 },
    { name: "Garlic Buttered Shrimp", price: 250 },
    { name: "Sizzling Gambas", price: 260 },
    { name: "Camaron Rebusado", price: 260 },
    { name: "Shrimp Sinigang / Tinola", price: 280 },
    { name: "Sweet Chili Shrimp", price: 260 }
  ],

  /* ---------- SQUID ---------- */
  squid: [
    { name: "Crispy Fried Squid", price: 280 },
    { name: "Adobo Spicy Squid", price: 300 },
    { name: "Calamari", price: 300 },
    { name: "Sizzling Squid", price: 300 }
    // "Grilled Squid (per 100g)" not added—no clear price on board.
  ],

  /* ---------- CRABS ---------- */
  crabs: [
    { name: "Boiled Crabs", price: 310 },
    { name: "Sweet Chili Crabs", price: 320 },
    { name: "Salt & Pepper Crabs", price: 300 },
    { name: "Crab Curry", price: 340 },
    { name: "Adobo sa Gata Crab", price: 340 }
  ],

  /* ---------- GRILLED / BBQ ---------- */
  bbq: [
    // Board items had unreadable prices; keeping your existing defaults.
    { name: "Pork BBQ (3 sticks)", price: 99 },
    { name: "Chicken BBQ", price: 119 },
    { name: "Liempo", price: 219 },
    { name: "Grilled Tuna Belly", price: 269 }
  ],

  /* ---------- DRINKS (board) ---------- */
  drinks: [
    { name: "Softdrinks", price: 20 },
    { name: "Wilkins 500 ml", price: 20 },
    { name: "Wilkins 1 L", price: 30 },
    { name: "San Mig Light", price: 70 },
    { name: "San Mig Apple", price: 70 },
    { name: "San Mig Pale Pilsen", price: 70 },
    { name: "Red Horse Stallion", price: 80 },
    { name: "Red Horse 1 L", price: 150 },
    { name: "San Mig Grande", price: 130 }
  ],

  /* ---------- SPECIALS / REFRESHMENTS (kept) ---------- */
  specials: [
    { name: "Sizzling Sisig Platter", price: 399 },
    { name: "Seafood Platter", price: 799 },
    { name: "Family Platter", price: 799 },
    { name: "StoneGrill Special", price: 499 }
  ],
  refreshments: [
    { name: "Halo-Halo", price: 129 },
    { name: "Mais con Yelo", price: 109 },
    { name: "Buko Pandan", price: 109 }
  ],

  /* ---------- PORK (kept) ---------- */
  pork: [
    { name: "Pork Sisig", price: 199 },
    { name: "Lechon Kawali", price: 229 },
    { name: "Crispy Pata", price: 499 },
    { name: "Pork Adobo", price: 189 },
    { name: "Sweet & Sour Pork", price: 209 }
  ]
};
/* === MENU END === */

/* ---- State & helpers --------------------------------------------------- */
let currentCategory = 'pork';
let cart = [];
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const money = (n) => '₱' + Number(n).toFixed(2);

/* ---- Category display -------------------------------------------------- */
function showCategory(cat) { currentCategory = cat; renderMenu(); }
function renderMenu() {
  const list = $('#menuList'); if (!list) return;
  const items = MENU[currentCategory] || [];
  list.innerHTML = items.map((item, idx) => `
    <div class="item" data-idx="${idx}">
      <div class="item-title" title="${item.name}">${item.name}</div>
      <div class="item-actions">
        <span class="item-price">${money(item.price)}</span>
        <button class="add-btn" data-idx="${idx}" aria-label="Add ${item.name}">Add</button>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
      const item = MENU[currentCategory][i];
      addToCart(item);
    });
  });
}

/* ---- Cart -------------------------------------------------------------- */
function addToCart(item) {
  const found = cart.find(c => c.name === item.name);
  if (found) found.qty += 1; else cart.push({ name: item.name, price: item.price, qty: 1 });
  renderCart(true);
}
function changeQty(name, delta) {
  const it = cart.find(c => c.name === name); if (!it) return;
  it.qty += delta; if (it.qty <= 0) cart = cart.filter(c => c.name !== name);
  renderCart();
}
function removeItem(name) { cart = cart.filter(c => c.name !== name); renderCart(); }
function cartSubtotal() { return cart.reduce((s, it) => s + it.price * it.qty, 0); }

function renderCart(nudge = false) {
  const wrap = $('#cartItems'); if (!wrap) return;
  wrap.innerHTML = cart.map(it => `
    <div class="cart-row">
      <div class="cart-name" title="${it.name}">${it.name}</div>
      <div class="qty-wrap">
        <button class="qty-btn" data-name="${it.name}" data-delta="-1">−</button>
        <span>${it.qty}</span>
        <button class="qty-btn" data-name="${it.name}" data-delta="1">+</button>
      </div>
      <div class="cart-price">${money(it.price * it.qty)}</div>
      <button class="remove-btn" data-name="${it.name}">Remove</button>
    </div>
  `).join('');

  $('#cartSubtotal') && ($('#cartSubtotal').textContent = money(cartSubtotal()));
  $('#cartTotal') && ($('#cartTotal').textContent = money(cartSubtotal()));

  wrap.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = e.currentTarget.getAttribute('data-name');
      const d = parseInt(e.currentTarget.getAttribute('data-delta'), 10);
      changeQty(name, d);
    });
  });
  wrap.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => removeItem(e.currentTarget.getAttribute('data-name')));
  });

  const card = document.querySelector('.card.highlight');
  if (nudge && card) { card.classList.remove('nudge'); void card.offsetWidth; card.classList.add('nudge'); }
}
function clearCart() { cart = []; renderCart(); }

/* ---- Dine-in pax toggle ----------------------------------------------- */
function updatePersonsVisibility() {
  const selected = document.querySelector('input[name="orderType"]:checked');
  const wrap = $('#personsWrap'); if (!wrap) return;
  const isDineIn = selected && /dine[\s-]*in/i.test(String(selected.value || ''));
  wrap.classList.toggle('hidden', !isDineIn);
}

/* ---- Mobile number formatting (+63) ----------------------------------- */
function normalizeMobile(inputEl) {
  let val = inputEl.value.replace(/[^\d+]/g, '');
  if (val.startsWith('0')) val = '+63' + val.slice(1);
  if (!val.startsWith('+63')) val = '+63' + val.replace(/^\+?/, '').replace(/^63/, '');
  val = val.replace(/^\+63(\d{3})(\d{3})(\d{0,4}).*/, '+63 $1 $2 $3').trim();
  inputEl.value = val;
}

/* ---- Telegram + Sheets submission ------------------------------------- */
async function sendToTelegram(text) {
  const token = (APP && APP.TELEGRAM_BOT_TOKEN) || '';
  const chatId = (APP && APP.TELEGRAM_CHAT_ID) || '';
  if (!token || !chatId) throw new Error('Missing Telegram token or chat id in config.js');

  const url = `https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error('Telegram error: ' + (t || res.status));
  }
  return res.json();
}

async function logToSheets(payload) {
  const endpoint = (APP && APP.GOOGLE_APPS_SCRIPT_URL) || '';
  if (!endpoint) return { ok: false, skipped: true };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => null);
  if (!res || !res.ok) return { ok: false };
  return { ok: true };
}

/* ---- Order form handling ---------------------------------------------- */
function buildOrderMessage(form) {
  const name = $('#fullName')?.value?.trim() || '';
  const mobile = $('#mobileNumber')?.value?.trim() || '';
  const orderType = (form.querySelector('input[name="orderType"]:checked')?.value) || '';
  const persons = $('#persons')?.value || '';
  const date = $('#orderDate')?.value || '';
  const time = $('#orderTime')?.value || '';
  const notes = $('#specialRequests')?.value?.trim() || '';
  const items = cart.map(it => `• ${it.name} x${it.qty} — ${money(it.qty * it.price)}`).join('\n') || '—';

  let msg = `<b>Stone Grill — New Order</b>\n`;
  msg += `\n<b>Customer:</b> ${name}`;
  msg += `\n<b>Mobile:</b> ${mobile}`;
  msg += `\n<b>Type:</b> ${orderType}`;
  if (/dine/i.test(orderType)) msg += `\n<b>Persons:</b> ${persons || 1}`;
  msg += `\n<b>Date/Time:</b> ${date || '—'} ${time || ''}`;
  msg += `\n<b>Items:</b>\n${items}`;
  msg += `\n<b>Subtotal:</b> ${money(cartSubtotal())}`;
  if (notes) msg += `\n<b>Requests:</b> ${notes}`;
  msg += `\n\n(Automated message)`;
  return msg;
}

async function handleSubmit(e) {
  e.preventDefault();
  if (cart.length === 0) { showToast('Add at least 1 item to your order.'); return; }

  const mobileEl = $('#mobileNumber');
  if (mobileEl) normalizeMobile(mobileEl);

  const form = e.currentTarget;
  const message = buildOrderMessage(form);

  const payload = {
    name: $('#fullName')?.value?.trim() || '',
    mobile: $('#mobileNumber')?.value?.trim() || '',
    orderType: form.querySelector('input[name="orderType"]:checked')?.value || '',
    persons: $('#persons')?.value || '',
    date: $('#orderDate')?.value || '',
    time: $('#orderTime')?.value || '',
    requests: $('#specialRequests')?.value?.trim() || '',
    items: cart.map(it => ({ name: it.name, qty: it.qty, price: it.price })),
    subtotal: cartSubtotal(),
    createdAt: new Date().toISOString()
  };

  // Required: Telegram
  try { await sendToTelegram(message); }
  catch (err) { console.error(err); showToast('Failed to send to Telegram. Please try again.'); return; }

  // Optional: Sheets (non-blocking)
  logToSheets(payload).then(r => { if (!r.ok && !r.skipped) console.warn('Sheets logging failed'); }).catch(() => {});

  // Success flow (GCash not shown)
  showToast('Order sent! We’ll message you shortly.');
  clearCart();
  form.reset();
  updatePersonsVisibility();
}

/* ---- Clear cart button ------------------------------------------------- */
function initClearButton() {
  const btn = $('#clearCartBtn');
  if (btn) btn.addEventListener('click', () => {
    if (cart.length === 0) return;
    clearCart();
    showToast('Cart cleared.');
  });
}

/* ---- Init -------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  renderCart();

  // Pax toggle
  $$('input[name="orderType"]').forEach(r => r.addEventListener('change', updatePersonsVisibility));
  updatePersonsVisibility();

  // Mobile number formatting
  const m = $('#mobileNumber');
  if (m) {
    m.addEventListener('blur', () => normalizeMobile(m));
    m.addEventListener('input', () => { if (!m.value.startsWith('+63')) m.value = '+63 '; });
  }

  // Form submit
  const form = $('#orderForm');
  if (form) form.addEventListener('submit', handleSubmit);

  // Clear button
  initClearButton();

  // Checkout scroll-to form
  const checkout = $('#checkoutBtn');
  if (checkout) checkout.addEventListener('click', () => {
    const formEl = $('#orderForm');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
// --- How to Order popup wiring (non-destructive) ---
(function () {
  var link = document.getElementById('howToOrderLink');
  var popup = document.getElementById('howToOrderPopup');
  if (!link || !popup) return;

  var closeBtn = popup.querySelector('.popup-close');

  function openHowto(e) {
    if (e) e.preventDefault();
    popup.classList.remove('hidden');
    popup.setAttribute('aria-hidden', 'false');
  }

  function closeHowto() {
    popup.classList.add('hidden');
    popup.setAttribute('aria-hidden', 'true');
  }

  // Open/close handlers
  link.addEventListener('click', openHowto);
  if (closeBtn) closeBtn.addEventListener('click', closeHowto);

  // Close when clicking outside the dialog
  popup.addEventListener('click', function (e) {
    if (e.target === popup) closeHowto();
  });

  // Close on ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !popup.classList.contains('hidden')) {
      closeHowto();
    }
  });
})();
});