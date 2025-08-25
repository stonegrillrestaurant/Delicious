/* =========================================================================
   Stone Grill — main.js (v14)
   - Cart now uses − / + buttons (no input, no remove button)
   - Prevents duplicate items (adds qty instead)
   - Keeps Telegram, Sheets, Pixel, GCash features intact
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

/* >>> PIXEL: helper */
(function(){
  function send(evt, params, opts){
    try{ if (typeof fbq === 'function') fbq('track', evt, params || {}, opts || undefined); }
    catch(e){ console.warn('[pixel]', e); }
  }
  function mapItem(x){
    return {
      id: String(x.id || x.name || 'unknown'),
      quantity: Number(x.qty || 1),
      item_price: Number(x.price || 0)
    };
  }
  function buildContents(items){ return Array.isArray(items) ? items.map(mapItem) : [mapItem(items)]; }
  function computeValue(items){
    try{
      var arr = Array.isArray(items) ? items : [items];
      return arr.reduce(function(sum, it){
        var q = Number(it.qty || 1) || 1;
        var p = Number(it.price || 0) || 0;
        return sum + q * p;
      }, 0);
    }catch(_){ return 0; }
  }
  window.sgTrack = {
    addToCart: function(item){
      send('AddToCart', {
        content_type: 'product',
        contents: buildContents(item),
        value: computeValue(item),
        currency: 'PHP'
      });
    },
    purchase: function(orderId, total, items){
      var eventId = 'sg_' + String(orderId || Date.now());
      send('Purchase', {
        content_type: 'product',
        contents: buildContents(items || []),
        value: (typeof total === 'number' ? total : computeValue(items)),
        currency: 'PHP',
        order_id: String(orderId || 'N/A')
      }, { eventID: eventId });
    }
  };
})();
/* <<< PIXEL */

/* ---- State ---- */
var MENU_META = null;
var MENU = {};
var currentCategory = 'pork';
var cart = [];

/* ---- Cart helpers ---- */
function cartSubtotal() {
  return cart.reduce((s, it) => s + it.price * it.qty, 0);
}

function changeQty(name, delta) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].name === name) {
      cart[i].qty += delta;
      if (cart[i].qty <= 0) cart.splice(i, 1);
      break;
    }
  }
  renderCart();
}

function addToCart(item){
  let found = cart.find(c => c.name === item.name);
  if(found) {
    found.qty += 1;
  } else {
    cart.push({ name:item.name, price:item.price, qty:1 });
  }
  renderCart(true);

  /* >>> PIXEL: AddToCart */
  try {
    window.sgTrack && window.sgTrack.addToCart(found || { name:item.name, price:item.price, qty:1 });
  } catch(e){ console.warn('pixel AddToCart error:', e); }
  /* <<< PIXEL */
}

function renderCart(nudge){
  const wrap = document.getElementById("cartItems");
  if (!wrap) return;
  wrap.innerHTML = "";

  if (cart.length === 0) {
    wrap.classList.remove("has-items");
    wrap.innerHTML = "<p class='empty-cart'>Your cart is empty.</p>";
    $("#cartSubtotal").textContent = money(0);
    $("#cartTotal").textContent = money(0);
    return;
  } else {
    wrap.classList.add("has-items");
  }

  cart.forEach(it => {
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="cart-name" title="${it.name}">${it.name}</div>
      <div class="qty-wrap">
        <button class="qty-btn" data-name="${it.name}" data-delta="-1">−</button>
        <span>${it.qty}</span>
        <button class="qty-btn" data-name="${it.name}" data-delta="1">+</button>
      </div>
      <div class="cart-price">${money(it.price * it.qty)}</div>
    `;
    wrap.appendChild(row);
  });

  wrap.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const nm = e.currentTarget.getAttribute("data-name");
      const d  = parseInt(e.currentTarget.getAttribute("data-delta"), 10);
      changeQty(nm, d);
    });
  });

  $("#cartSubtotal").textContent = money(cartSubtotal());
  $("#cartTotal").textContent = money(cartSubtotal());

  if (nudge) {
    const card = document.querySelector(".card.highlight");
    if (card) {
      card.classList.remove("nudge");
      void card.offsetWidth;
      card.classList.add("nudge");
    }
  }
}

function clearCart(){ cart = []; renderCart(); }

/* ---- (rest of your file remains the same: menu loading, rendering, Telegram, Sheets, form, popup, boot...) ---- */
