/* =========================================================================
   Stone Grill — main.js (v14 with Mobile Validation)
   ========================================================================= */
'use strict';

/* ---- Config compatibility layer ---- */
(function attachConfig() {
  var sources = [window.CFG, window.APP_CONFIG, window.app_config, window.config, window].filter(Boolean);
  function pick() {
    for (var i = 0; i < sources.length; i++) {
      var src = sources[i];
      for (var a = 0; a < arguments.length; a++) {
        var k = arguments[a];
        if (src && src[k] != null) return src[k];
      }
    }
    return undefined;
  }
  window.APP = Object.assign(window.APP || {}, {
    TELEGRAM_BOT_TOKEN: pick('TELEGRAM_BOT_TOKEN', 'telegramBotToken'),
    TELEGRAM_CHAT_ID: pick('TELEGRAM_CHAT_ID', 'telegramChatId'),
    GOOGLE_APPS_SCRIPT_URL: pick('SHEETS_ENDPOINT', 'GOOGLE_APPS_SCRIPT_URL'),
    GCASH_QR_URL: pick('GCASH_QR_PATH', 'gcashQrUrl'),
    GCASH_MOBILE: pick('GCASH_MOBILE'),
    GCASH_ACCOUNT_NAME: pick('GCASH_ACCOUNT_NAME')
  });
})();

/* ---- Helpers ---- */
function normalizeMobile(m) {
  if (!m) return ""; // safe fallback
  let digits = m.replace(/\D/g, "");
  if (digits.startsWith("63")) return "+" + digits;
  if (digits.startsWith("0")) return "+63" + digits.substring(1);
  if (!digits.startsWith("+63")) return "+63" + digits;
  return digits;
}

function showToast(msg, type = "info") {
  const el = document.createElement("div");
  el.className = "toast " + type;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("show"), 50);
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 4000);
}

/* ---- Render categories (kept) ---- */
function renderCategories(menuData) {
  const bar = document.getElementById("categoryBar");
  if (!bar) return;
  bar.innerHTML = "";
  Object.keys(menuData).forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.className = "cat-btn";
    btn.onclick = () => renderMenuItems(cat, menuData[cat]);
    bar.appendChild(btn);
  });
}

/* ---- Render menu items (kept) ---- */
function renderMenuItems(cat, items) {
  const list = document.getElementById("menuList");
  if (!list) return;
  list.innerHTML = "";
  items.forEach(it => {
    const div = document.createElement("div");
    div.className = "menu-item";
    div.innerHTML = `
      <span>${it.name}</span>
      <span>₱${it.price}</span>
      <button class="add">Add</button>
    `;
    div.querySelector("button").onclick = () => addToCart(it);
    list.appendChild(div);
  });
}

/* ---- Cart logic (kept) ---- */
let cart = [];
function addToCart(item) {
  const existing = cart.find(i => i.name === item.name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  renderCart();
}
function renderCart() {
  const cartEl = document.getElementById("cartItems");
  if (!cartEl) return;
  cartEl.innerHTML = "";
  let total = 0;
  cart.forEach(it => {
    total += it.qty * it.price;
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <span>${it.qty}× ${it.name}</span>
      <span>₱${it.qty * it.price}</span>
    `;
    cartEl.appendChild(row);
  });
  document.getElementById("cartTotal").textContent = "₱" + total;
}

/* ---- Form submission ---- */
function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const name = form.fullName.value.trim();
  const rawMobile = form.mobileNumber.value.trim();
  const mobile = normalizeMobile(rawMobile);
  const orderType = form.orderType.value;
  const pax = form.numPersons.value;
  const date = form.date.value;
  const time = form.time.value;
  const requests = form.requests.value;

  // VALIDATION FIX: mobile must not be empty
  const mobileInput = document.getElementById("mobileNumber");
  const mobileNotice = mobileInput.nextElementSibling;
  if (!mobile || mobile.length < 11) {
    mobileInput.style.border = "2px solid red";
    if (mobileNotice) mobileNotice.style.color = "red";
    showToast("Please enter a valid contact number", "error");
    return;
  } else {
    mobileInput.style.border = "";
    if (mobileNotice) mobileNotice.style.color = "red"; // keep it red as requested
  }

  if (cart.length === 0) {
    showToast("Your cart is empty", "error");
    return;
  }

  const orderText = cart.map(it => `${it.qty}× ${it.name} — ₱${it.qty * it.price}`).join("\n");

  const msg = `
📌 New Order — ${orderType}
👤 ${name}
📞 ${mobile}
👥 ${pax} persons
🗓 ${date} ${time}

🛒 Order:
${orderText}

💬 ${requests || "(none)"}
  `;

  // ---- Telegram send ----
  fetch(`https://api.telegram.org/bot${APP.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: APP.TELEGRAM_CHAT_ID, text: msg })
  })
  .then(r => r.json())
  .then(() => {
    showToast("Order sent! Please pay via GCash to proceed.", "success");
    showPaymentPopup();
  })
  .catch(() => showToast("Failed to send order to Telegram", "error"));

  // ---- Google Sheets log ----
  if (APP.GOOGLE_APPS_SCRIPT_URL) {
    fetch(APP.GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      body: new FormData(form)
    }).catch(() => {});
  }
}

/* ---- Payment Popup ---- */
function showPaymentPopup() {
  const popup = document.getElementById("paymentPopup");
  if (!popup) return;
  popup.classList.remove("hidden");
  popup.setAttribute("aria-hidden", "false");
  const qr = popup.querySelector("img");
  if (qr && APP.GCASH_QR_URL) qr.src = APP.GCASH_QR_URL;
}

/* ---- Init ---- */
window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("orderForm");
  if (form) form.addEventListener("submit", handleSubmit);

  // Load menu (kept: assuming window.MENU_DATA exists)
  if (window.MENU_DATA) {
    renderCategories(window.MENU_DATA);
    const firstCat = Object.keys(window.MENU_DATA)[0];
    if (firstCat) renderMenuItems(firstCat, window.MENU_DATA[firstCat]);
  }
});
