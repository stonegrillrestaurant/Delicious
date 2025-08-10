/* =========================================================================
   Stone Grill — main.js
   - Categories → Items → Cart
   - Subtotal, Clear Cart
   - Dine-in pax toggle
   - Mobile number auto-format to +63
   - Telegram send (REQUIRED)
   - Google Sheets log (OPTIONAL; non-blocking)
   - Toast messages
   NOTE: GCash popup intentionally not triggered per request.
   ========================================================================= */

/* ---- Config compatibility layer --------------------------------------- */
(function attachConfig() {
  const sources = [
    window.CFG,
    window.APP_CONFIG,
    window.app_config,
    window.config,
    window
  ].filter(Boolean);

  function pick(...keys) {
    for (const src of sources) {
      for (const k of keys) {
        if (src && src[k] != null) return src[k];
      }
    }
    return undefined;
  }

  window.APP = {
    TELEGRAM_BOT_TOKEN: pick('TELEGRAM_BOT_TOKEN', 'telegramBotToken'),
    TELEGRAM_CHAT_ID: pick('TELEGRAM_CHAT_ID', 'telegramChatId'),
    GOOGLE_APPS_SCRIPT_URL: pick('GOOGLE_APPS_SCRIPT_URL', 'appsScriptUrl', 'GOOGLE_SHEETS_WEBAPP_URL'),
  };
})();

/* ---- Simple toast ------------------------------------------------------ */
function showToast(msg, ms = 2200) {
  const el = document.getElementById('toast');
  if (!el) return alert(msg);
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), ms);
}

/* ---- Menu data (you can swap to your full menu later) ------------------ */
const MENU = {
  pork: [
    { name: "Pork Sisig", price: 199 },
    { name: "Lechon Kawali", price: 229 },
    { name: "Crispy Pata", price: 499 }
  ],
  chicken: [
    { name: "Chicken Inasal", price: 199 },
    { name: "Fried Chicken", price: 189 }
  ],
  beef: [
    { name: "Beef Caldereta", price: 239 },
    { name: "Beef Steak", price: 259 }
  ],
  seafood: [
    { name: "Grilled Bangus", price: 229 },
    { name: "Garlic Shrimp", price: 299 }
  ],
  vegetables: [
    { name: "Chopsuey", price: 169 },
    { name: "Pinakbet", price: 159 }
  ],
  noodles: [
    { name: "Pancit Canton", price: 159 },
    { name: "Spaghetti", price: 149 }
  ],
  bbq: [
    { name: "Pork BBQ (3 sticks)", price: 99 },
    { name: "Chicken BBQ", price: 119 }
  ],
  soup: [
    { name: "Sinigang na Baboy", price: 229 },
    { name: "Nilagang Baka", price: 249 }
  ],
  specials: [
    { name: "Sizzling Sisig Platter", price: 399 },
    { name: "Family Platter", price: 799 }
  ],
  drinks: [
    { name: "Iced Tea", price: 39 },
    { name: "Bottled Water", price: 25 }
  ],
};

/* ---- State ------------------------------------------------------------- */
let currentCategory = 'pork';
let cart = [];

/* ---- DOM helpers ------------------------------------------------------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ---- Render Category Items -------------------------------------------- */
function money(n) {
  return '₱' + Number(n).toFixed(2);
}

function showCategory(cat) {
  currentCategory = cat;
  renderMenu();
}

function renderMenu() {
  const list = $('#menuList');
  if (!list) return;
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

  // attach add handlers
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
  if (found) {
    found.qty += 1;
  } else {
    cart.push({ name: item.name, price: item.price, qty: 1 });
  }
  renderCart(true);
}

function changeQty(name, delta) {
  const it = cart.find(c => c.name === name);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0) {
    cart = cart.filter(c => c.name !== name);
  }
  renderCart();
}

function removeItem(name) {
  cart = cart.filter(c => c.name !== name);
  renderCart();
}

function cartSubtotal() {
  return cart.reduce((sum, it) => sum + it.price * it.qty, 0);
}

function renderCart(nudge = false) {
  const wrap = $('#cartItems');
  if (!wrap) return;

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

  // totals
  $('#cartSubtotal') && ($('#cartSubtotal').textContent = money(cartSubtotal()));
  $('#cartTotal') && ($('#cartTotal').textContent = money(cartSubtotal()));

  // events
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

  // subtle nudge animation on add
  const card = document.querySelector('.card.highlight');
  if (nudge && card) {
    card.classList.remove('nudge');
    void card.offsetWidth; // reflow to restart animation
    card.classList.add('nudge');
  }
}

function clearCart() {
  cart = [];
  renderCart();
}

/* ---- Dine-in pax toggle ----------------------------------------------- */
function updatePersonsVisibility() {
  const selected = document.querySelector('input[name="orderType"]:checked');
  const wrap = $('#personsWrap');
  if (!wrap) return;
  const isDineIn = selected && /dine[\s-]*in/i.test(String(selected.value || ''));
  wrap.classList.toggle('hidden', !isDineIn);
}

/* ---- Mobile number formatting (+63) ----------------------------------- */
function normalizeMobile(inputEl) {
  let val = inputEl.value.replace(/[^\d+]/g, '');
  // Force +63
  if (val.startsWith('0')) val = '+63' + val.slice(1);
  if (!val.startsWith('+63')) val = '+63' + val.replace(/^\+?/, '').replace(/^63/, '');
  // Optional spacing (keeps numbers compact but readable)
  val = val.replace(/^\+63\s?(\d{3})\s?(\d{3})\s?(\d{4}).*/, '+63 $1 $2 $3')
           .replace(/^\+63(\d{3})(\d{3})(\d{0,4})$/, '+63 $1 $2 $3').trim();
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

  if (cart.length === 0) {
    showToast('Add at least 1 item to your order.');
    return;
  }

  const mobileEl = $('#mobileNumber');
  if (mobileEl) normalizeMobile(mobileEl);

  const form = e.currentTarget;
  const message = buildOrderMessage(form);

  // Build payload for Sheets (non-blocking)
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

  // Send to Telegram (required)
  try {
    await sendToTelegram(message);
  } catch (err) {
    console.error(err);
    showToast('Failed to send to Telegram. Please try again.');
    return; // do not proceed if telegram fails
  }

  // Log to Sheets (optional, silent failure)
  logToSheets(payload).then(r => {
    if (!r.ok && !r.skipped) console.warn('Sheets logging failed');
  }).catch(() => {});

  // Success flow (no GCash popup per request)
  showToast('Order sent! We’ll message you shortly.');
  clearCart();
  form.reset();
  updatePersonsVisibility(); // hide pax if needed
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

/* ---- Initialization ---------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Category buttons already call showCategory('cat') inline, just render first
  renderMenu();
  renderCart();

  // Dine-in pax toggle
  $$('input[name="orderType"]').forEach(r => r.addEventListener('change', updatePersonsVisibility));
  updatePersonsVisibility();

  // Mobile number formatting
  const m = $('#mobileNumber');
  if (m) {
    m.addEventListener('blur', () => normalizeMobile(m));
    m.addEventListener('input', () => {
      // Keep +63 prefix; allow typing naturally
      if (!m.value.startsWith('+63')) m.value = '+63 ';
    });
  }

  // Form submit
  const form = $('#orderForm');
  if (form) form.addEventListener('submit', handleSubmit);

  // Clear button
  initClearButton();

  // Checkout button (optional shortcut: focus form)
  const checkout = $('#checkoutBtn');
  if (checkout) checkout.addEventListener('click', () => {
    const formEl = $('#orderForm');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});