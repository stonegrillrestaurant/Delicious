/* =========================================================================
   Stone Grill — main.js (v14 with Pixel+CAPI)
   Menu source: LocalStorage -> assets/menu.json -> fallback.
   Keeps: cart, subtotal/total (no decimals), Dine-in pax toggle,
   How-to popup, Telegram send, Google Sheets log, readable Date/Time.
   NEW: Fires Meta Conversions API + Pixel Purchase (deduped).
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
var MENU_FALLBACK = {
  setMeals: [
    { name: "Set A", price: 1100 },
    { name: "Set B", price: 1000 },
    { name: "Set C", price: 1980 },
    { name: "Boodle", price: 2300 },
    { name: "Mix Seafood Inferno (Hot)", price: 850 },
    { name: "Mix Seafood Heaven (Reg)", price: 850 }
  ],
  soup: [
    { name: "Crab & Corn Soup", price: 190 },
    { name: "Cream of Mushroom", price: 190 },
    { name: "Egg Drop Soup", price: 180 },
    { name: "Vegetable Soup", price: 230 },
    { name: "Pork Sinigang", price: 280 },
    { name: "Mix Seafood Tinola", price: 350 }
  ],
  rice: [
    { name: "Cup Rice", price: 25 },
    { name: "Platter Rice", price: 100 },
    { name: "Garlic Fried Rice", price: 180 },
    { name: "Black Rice", price: 180 },
    { name: "Stone Grill Fried Rice", price: 200 },
    { name: "Shrimp Fried Rice", price: 195 }
  ],
  vegetables: [
    { name: "Pinakbet", price: 235 },
    { name: "Chopsuey", price: 210 },
    { name: "Chopsuey (Seafood)", price: 230 },
    { name: "Beef with Ampalaya", price: 300 },
    { name: "Beef with Broccoli", price: 320 }
  ],
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
  chicken: [
    { name: "Naked Fried Chicken", price: 220 },
    { name: "Fried Chicken", price: 200 },
    { name: "Buttered Chicken", price: 230 },
    { name: "Buffalo Chicken or Curry", price: 240 },
    { name: "Chicken Teriyaki", price: 250 }
  ],
  beef: [
    { name: "Beef Steak", price: 300 },
    { name: "Beef w/ Mushroom", price: 310 },
    { name: "Beef Caldereta", price: 320 },
    { name: "Beef Nilaga", price: 320 }
  ],
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
  shrimp: [
    { name: "Crispy Fried Shrimp", price: 240 },
    { name: "Garlic Buttered Shrimp", price: 250 },
    { name: "Sizzling Gambas", price: 260 },
    { name: "Camaron Rebusado", price: 260 },
    { name: "Shrimp Sinigang / Tinola", price: 280 },
    { name: "Sweet Chili Shrimp", price: 260 }
  ],
  squid: [
    { name: "Crispy Fried Squid", price: 280 },
    { name: "Adobo Spicy Squid", price: 300 },
    { name: "Calamari", price: 300 },
    { name: "Sizzling Squid", price: 300 }
  ],
  crabs: [
    { name: "Boiled Crabs", price: 310 },
    { name: "Sweet Chili Crabs", price: 320 },
    { name: "Salt & Pepper Crabs", price: 300 },
    { name: "Crab Curry", price: 340 },
    { name: "Adobo sa Gata Crab", price: 340 }
  ],
  bbq: [
    { name: "Pork BBQ (3 sticks)", price: 99 },
    { name: "Chicken BBQ", price: 119 },
    { name: "Liempo", price: 219 },
    { name: "Grilled Tuna Belly", price: 269 }
  ],
  specials: [
    { name: "Sizzling Sisig Platter", price: 399 },
    { name: "Seafood Platter", price: 799 },
    { name: "Family Platter", price: 799 },
    { name: "StoneGrill Special", price: 499 }
  ],
  refreshments: [
    { name: "Halo-Halo", price: 129 },
    { name: "Mais con Yelo", price: 109 },
    { name: "Buko Pandan", price: 109 },
    { name: "avocado shake", price: 75 },
    { name: "mango shake", price: 75 },
    { name: "caroot shake", price: 75 },
    { name: "banana shake", price: 75 },
    { name: "apple shake", price: 75 },
    { name: "buko shake", price: 75 },
    { name: "pineapple shake", price: 75 }
  ],
  drinks: [
    { name: "Softdrinks", price: 20 },
    { name: "Wilkins 500 ml", price: 20 },
    { name: "Wilkins 1 L", price: 30 },
    { name: "San Mig Light", price: 75 },
    { name: "San Mig Apple", price: 75 },
    { name: "San Mig Pale Pilsen", price: 70 },
    { name: "Red Horse Stallion", price: 80 },
    { name: "Red Horse 1 L", price: 180 },
    { name: "San Mig Grande", price: 150 }
  ],
  pork: [
    { name: "Pork Sisig", price: 199 },
    { name: "Lechon Kawali", price: 229 },
    { name: "Crispy Pata", price: 499 },
    { name: "Pork Adobo", price: 240 },
    { name: "Sweet & Sour Pork", price: 209 },
    { name: "Pork steak", price: 240 },
    { name: "Pork steak solo", price: 125 }
  ]
};

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
  if(cart.length===0){ 
    showToast('Add at least 1 item to your order.'); 
    return; 
  }

  var mobileEl = $('#mobileNumber'); 
  if(mobileEl) normalizeMobile(mobileEl);

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

  // Unique event ID for Pixel + CAPI deduplication
  var orderId = 'SG-' + Date.now();

  // 1. Send to Telegram
  sendToTelegram(message).then(function(){
    // 2. Toast confirmation
    showToast('✅ Thank you! Please settle your payment via GCash so we can proceed preparing your order.', 5000);

    // 3. Log to Google Sheets
    logToSheets(payload);

    // 4. Send to Meta Conversions API (server-side)
    sendMetaCAPI({
      event: "Purchase",
      orderId: orderId,
      email: "", // not collecting email yet
      phone: payload.mobile,
      amount: payload.subtotal
    });

    // 5. Fire Pixel Purchase event with eventID (for deduplication)
    if (typeof fbq === 'function') {
      fbq('track', 'Purchase', {
        value: payload.subtotal,
        currency: 'PHP'
      }, {
        eventID: orderId
      });
    }

    // 6. Cleanup
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
