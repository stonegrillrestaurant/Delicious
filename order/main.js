/* =========================================================================
   Stone Grill — main.js (v13+MetaCAPI)
   Menu source: LocalStorage -> assets/menu.json -> fallback.
   Keeps: cart, subtotal/total (no decimals), Dine-in pax toggle,
   How-to popup, Telegram send, Google Sheets log, readable Date/Time.
   NEW: Fires Meta Conversions API events (Purchase).
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
    GOOGLE_APPS_SCRIPT_URL: pick('GOOGLE_APPS_SCRIPT_URL','appsScriptUrl','GOOGLE_SHEETS_WEBAPP_URL','SHEETS_ENDPOINT'),
    META_DATASET_ID: pick('META_DATASET_ID','metaDatasetId'),
    META_ACCESS_TOKEN: pick('META_ACCESS_TOKEN','metaAccessToken')
  });
})();

/* ---- Helpers ---- */
function $(sel){ return document.querySelector(sel); }
function $$(sel){ return document.querySelectorAll(sel); }
function money(n){ return '₱' + Math.round(Number(n)); } // no decimals
function showToast(msg, ms){
  ms = ms || 5000;  // centered toast shows longer by default
  var el = document.getElementById('toast');
  if(!el){ alert(msg); return; }
  el.textContent = msg;
  el.classList.remove('hidden');
  el.classList.add('show');
  setTimeout(function(){ el.classList.remove('show'); }, ms);
}

/* ---- Meta Conversions API ---- */
function sendMetaCAPI(orderData) {
  if (!APP.META_ACCESS_TOKEN || !APP.META_DATASET_ID) {
    console.warn("Meta CAPI not configured");
    return;
  }
  const url = `https://graph.facebook.com/v19.0/${APP.META_DATASET_ID}/events`;
  const payload = {
    data: [
      {
        event_name: orderData.event || "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: window.location.href,
        event_id: orderData.orderId,
        user_data: {
          em: orderData.email ? CryptoJS.SHA256(orderData.email.trim().toLowerCase()).toString() : "",
          ph: orderData.phone ? CryptoJS.SHA256(orderData.phone.replace(/\D/g,"")).toString() : ""
        },
        custom_data: {
          currency: "PHP",
          value: orderData.amount || 0
        }
      }
    ],
    access_token: APP.META_ACCESS_TOKEN
  };
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(resp => console.log("Meta CAPI response:", resp))
  .catch(err => console.error("Meta CAPI error:", err));
}

/* ---- Fallback MENU ---- */
var MENU_FALLBACK = { /* unchanged menu fallback content here */ };
// (keeping your full MENU_FALLBACK intact; omitted here for brevity in explanation)

/* ---- Load menu ---- */
async function loadMenuData(fallbackMENU) { /* unchanged */ }

/* ---- Build category bar ---- */
function buildCategoryBar(categories) { /* unchanged */ }

/* ---- State ---- */
var MENU_META = null;
var MENU = {};
var currentCategory = 'pork';
var cart = [];

/* ---- Category render (exposed) ---- */
function showCategory(cat){ currentCategory = cat; renderMenu(); }
window.showCategory = showCategory;

/* ---- Menu rendering ---- */
function renderMenu() { /* unchanged */ }

/* ---- Cart ---- */
function addToCart(item){ /* unchanged */ }
function changeQty(name, delta){ /* unchanged */ }
function removeItem(name){ /* unchanged */ }
function cartSubtotal(){ /* unchanged */ }
function renderCart(nudge){ /* unchanged */ }
function clearCart(){ cart = []; renderCart(); }

/* ---- Dine-in pax toggle ---- */
function updatePersonsVisibility(){ /* unchanged */ }

/* ---- Mobile number formatting (+63) ---- */
function normalizeMobile(inputEl){ /* unchanged */ }

/* ---- Telegram / Sheets ---- */
function sendToTelegram(text){ /* unchanged */ }
function logToSheets(payload){ /* unchanged */ }

/* ---- Date/Time formatting ---- */
function formatOrderDateTime(dateStr, timeStr){ /* unchanged */ }

/* ---- Build Telegram message ---- */
function buildOrderMessage(form){ /* unchanged */ }

/* ---- Submit ---- */
function handleSubmit(e){
  e.preventDefault();
  if(cart.length===0){ showToast('Add at least 1 item to your order.'); return; }

  var mobileEl = $('#mobileNumber'); if(mobileEl) normalizeMobile(mobileEl);

  var form = e.currentTarget;
  var message = buildOrderMessage(form);

  var payload = {
    name: ($('#fullName')||{}).value || '',
    mobile: ($('#mobileNumber')||{}).value || '',
    orderType: (form.querySelector('input[name="orderType"]:checked')||{}).value || '',
    persons: ($('#persons')||{}).value || '',
    date: ($('#orderDate')||{}).value || '',
    time: ($('#orderTime')||{}).value || '',
    requests: ($('#specialRequests')||{}).value || '',
    items: cart.map(function(it){ return { name:it.name, qty:it.qty, price:it.price }; }),
    subtotal: cartSubtotal(),
    createdAt: new Date().toISOString()
  };

  var orderId = 'SG-' + Date.now(); // unique event_id

  sendToTelegram(message).then(function(){
    showToast('✅ Thank you! Please settle your payment via GCash so we can proceed preparing your order.', 5000);

    logToSheets(payload); // still logs
    // ---- NEW: Send to Meta CAPI ----
    sendMetaCAPI({
      event: "Purchase",
      orderId: orderId,
      email: payload.name ? payload.name + "@example.com" : "", // if no email collected
      phone: payload.mobile,
      amount: payload.subtotal
    });

    clearCart();
    form.reset();
    updatePersonsVisibility();
  }).catch(function(err){
    console.error(err);
    showToast('Failed to send to Telegram. Please try again.');
  });
}

/* ---- How to Order popup ---- */
function wireHowToPopup(){ /* unchanged */ }

/* ---- Boot ---- */
document.addEventListener('DOMContentLoaded', async function(){
  try {
    MENU_META = await loadMenuData(MENU_FALLBACK);
    MENU = MENU_META.data;
    var hasPork = MENU_META.categories.some(function(c){ return c.id==='pork'; });
    currentCategory = hasPork ? 'pork' : (MENU_META.categories[0] ? MENU_META.categories[0].id : 'pork');
    buildCategoryBar(MENU_META.categories);
    renderMenu();
    renderCart();
    var radios = document.querySelectorAll('input[name="orderType"]');
    for (var i=0;i<radios.length;i++){ radios[i].addEventListener('change', updatePersonsVisibility); }
    updatePersonsVisibility();
    var m = $('#mobileNumber');
    if(m){
      m.addEventListener('blur', function(){ normalizeMobile(m); });
      m.addEventListener('input', function(){ if(m.value.indexOf('+63')!==0) m.value = '+63 '; });
    }
    var form = $('#orderForm');
    if(form) form.addEventListener('submit', handleSubmit);
    initClearButton();
    var checkout = $('#checkoutBtn');
    if(checkout) checkout.addEventListener('click', function(){
      var formEl = $('#orderForm'); if(formEl) formEl.scrollIntoView({ behavior:'smooth', block:'start' });
    });
    wireHowToPopup();
  } catch(e) {
    console.error('Init error:', e);
    showToast('Error initializing page scripts.');
  }
});

/* ========= Stone Grill — main.js hotfix pack ========= */
function initClearButton(){ /* unchanged */ }
(function(){ /* hardened showToast */ })();
(function(){ /* safe popup guards */ })();
