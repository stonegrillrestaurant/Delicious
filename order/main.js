/* =========================================================================
   Stone Grill — main.js (v13 + CAPI update)
   Menu source: LocalStorage -> assets/menu.json -> fallback.
   Keeps: cart, subtotal/total (no decimals), Dine-in pax toggle,
   How-to popup, Telegram send, readable Date/Time in Telegram.
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
    GOOGLE_APPS_SCRIPT_URL: pick('GOOGLE_APPS_SCRIPT_URL','appsScriptUrl','GOOGLE_SHEETS_WEBAPP_URL','SHEETS_ENDPOINT')
  });
})();

/* ---- Helpers ---- */
function $(sel){ return document.querySelector(sel); }
function $$(sel){ return document.querySelectorAll(sel); }
function money(n){ return '₱' + Math.round(Number(n)); } // no decimals
function showToast(msg, ms){
  ms = ms || 5000;
  var el = document.getElementById('toast');
  if(!el){ alert(msg); return; }
  el.textContent = msg;
  el.classList.remove('hidden');
  el.classList.add('show');
  setTimeout(function(){ el.classList.remove('show'); }, ms);
}

/* ---- Fallback MENU ---- */
var MENU_FALLBACK = { /* ... your full fallback menu ... */ };

/* ---- Load menu ---- */
async function loadMenuData(fallbackMENU) {
  try {
    var ls = localStorage.getItem('stonegrill_menu_v1');
    if (ls) {
      var j = JSON.parse(ls);
      if (j && j.categories && j.data) return j;
    }
  } catch(e) {}

  try {
    var res = await fetch('assets/menu.json?v=' + Date.now(), { cache: 'no-store' });
    if (res.ok) {
      var j2 = await res.json();
      if (j2 && j2.categories && j2.data) return j2;
    }
  } catch(e) {}

  var cats = Object.keys(fallbackMENU || {}).map(function(id){
    var map = {
      setMeals:{label:'Set Meal',emoji:'🍱'}, soup:{label:'Soup',emoji:'🍲'}, rice:{label:'Rice',emoji:'🍚'},
      vegetables:{label:'Veggies',emoji:'🥦'}, noodles:{label:'Noodles/Pasta',emoji:'🍜'},
      chicken:{label:'Chicken',emoji:'🐓'}, beef:{label:'Beef',emoji:'🐄'}, fish:{label:'Fish',emoji:'🐟'},
      shrimp:{label:'Shrimp',emoji:'🦐'}, squid:{label:'Squid',emoji:'🦑'}, crabs:{label:'Crabs',emoji:'🦀'},
      bbq:{label:'Grilled/BBQ',emoji:'🔥'}, specials:{label:'Specialties',emoji:'⭐'},
      refreshments:{label:'Refreshments',emoji:'🧊'}, drinks:{label:'Drinks',emoji:'🥤'}, pork:{label:'Pork',emoji:'🐖'}
    };
    var meta = map[id] || {label:id, emoji:''};
    return { id:id, label:meta.label, emoji:meta.emoji };
  });
  return { categories: cats, data: (fallbackMENU || {}) };
}

/* ---- Build category bar ---- */
function buildCategoryBar(categories) {
  var bar = document.getElementById('categoryBar');
  if (!bar) return;
  bar.innerHTML = categories.map(function(c){
    var emo = c.emoji ? '<span class="cat-emoji">'+c.emoji+'</span>' : '';
    return '<button onclick="showCategory(\''+c.id+'\')">'+ emo + '<span>' + (c.label || c.id) + '</span></button>';
  }).join('');
}

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

/* ---- Mobile number formatting ---- */
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

  sendToTelegram(message).then(function(){
    showToast('✅ Thank you! Please settle your payment via GCash so we can proceed preparing your order.', 5000);

    logToSheets(payload); // optional

    /* --- NEW: Meta Pixel Conversions API event --- */
    if (typeof fbq === 'function') {
      try {
        fbq('track', 'Purchase', {
          value: payload.subtotal,
          currency: 'PHP',
          contents: payload.items.map(it => ({ id: it.name, quantity: it.qty, item_price: it.price })),
          content_type: 'product',
          customer_name: payload.name,
          customer_mobile: payload.mobile
        });
        console.log('[CAPI] Purchase event sent', payload);
      } catch(err){ console.warn('[CAPI] Failed:', err); }
    }
    /* --------------------------------------------- */

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
(function(){ /* hardened showToast unchanged */ })();
(function(){ /* safe bindings unchanged */ })();
