/* =========================================================================
   Stone Grill — main.js (v16.2)
   - Defer refresh until AFTER GCash receipt upload (keeps name/mobile)
   - How to Order popup binds to #howToOrderLink or #howtoOrder
   - FIX: addToCart increments found.qty correctly
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

/* Generate a compact Order ID like SG202509011230 */
function generateOrderId(){
  var d = new Date();
  function p(n){ return String(n).padStart(2,'0'); }
  return 'SG' + d.getFullYear() + p(d.getMonth()+1) + p(d.getDate()) + p(d.getHours()) + p(d.getMinutes());
}

/* ---- Fallback MENU ---- */
var MENU_FALLBACK = {
  setMeals: [ { name:"Set A", price:1100 }, { name:"Set B", price:1000 }, { name:"Set C", price:1980 },
    { name:"Boodle", price:2300 }, { name:"Mix Seafood Inferno (Hot)", price:850 }, { name:"Mix Seafood Heaven (Reg)", price:850 } ],
  soup: [ { name:"Crab & Corn Soup", price:190 }, { name:"Cream of Mushroom", price:190 },
    { name:"Egg Drop Soup", price:180 }, { name:"Vegetable Soup", price:230 }, { name:"Pork Sinigang", price:280 }, { name:"Mix Seafood Tinola", price:350 } ],
  rice: [ { name:"Cup Rice", price:25 }, { name:"Platter Rice", price:100 }, { name:"Garlic Fried Rice", price:180 },
    { name:"Black Rice", price:180 }, { name:"Stone Grill Fried Rice", price:200 }, { name:"Shrimp Fried Rice", price:195 } ],
  vegetables: [ { name:"Pinakbet", price:235 }, { name:"Chopsuey", price:210 }, { name:"Chopsuey (Seafood)", price:230 },
    { name:"Beef with Ampalaya", price:300 }, { name:"Beef with Broccoli", price:320 } ],
  noodles: [ { name:"Lomi", price:180 }, { name:"Lomi (Seafood)", price:200 }, { name:"Canton", price:200 },
    { name:"Canton (Seafood)", price:220 }, { name:"Bihon", price:240 }, { name:"Bihon (Seafood)", price:270 },
    { name:"Bam-i", price:220 }, { name:"Bam-i (Seafood)", price:240 }, { name:"Sotanghon Guisado (Reg)", price:280 }, { name:"Sotanghon Guisado (Large)", price:300 } ],
  chicken: [ { name:"Naked Fried Chicken", price:220 }, { name:"Fried Chicken", price:200 }, { name:"Buttered Chicken", price:230 },
    { name:"Buffalo Chicken or Curry", price:240 }, { name:"Chicken Teriyaki", price:250 } ],
  beef: [ { name:"Beef Steak", price:300 }, { name:"Beef w/ Mushroom", price:310 }, { name:"Beef Caldereta", price:320 }, { name:"Beef Nilaga", price:320 } ],
  fish: [ { name:"Fish Fillet in Mayo Dip", price:310 }, { name:"Grilled Fish", price:300 }, { name:"Fried Fish", price:320 },
    { name:"Fish Kinilaw", price:310 }, { name:"Fish Tinola", price:340 }, { name:"Fish Sinigang", price:340 }, { name:"Sweet & Sour Fish", price:300 },
    { name:"Fish with Tausi", price:340 }, { name:"Fish Eskabetche", price:330 } ],
  shrimp: [ { name:"Crispy Fried Shrimp", price:240 }, { name:"Garlic Buttered Shrimp", price:250 }, { name:"Sizzling Gambas", price:260 },
    { name:"Camaron Rebusado", price:260 }, { name:"Shrimp Sinigang / Tinola", price:280 }, { name:"Sweet Chili Shrimp", price:260 } ],
  squid: [ { name:"Crispy Fried Squid", price:280 }, { name:"Adobo Spicy Squid", price:300 }, { name:"Calamari", price:300 }, { name:"Sizzling Squid", price:300 } ],
  crabs: [ { name:"Boiled Crabs", price:310 }, { name:"Sweet Chili Crabs", price:320 }, { name:"Salt & Pepper Crabs", price:300 },
    { name:"Crab Curry", price:340 }, { name:"Adobo sa Gata Crab", price:340 } ],
  bbq: [ { name:"Pork BBQ (3 sticks)", price:99 }, { name:"Chicken BBQ", price:119 }, { name:"Liempo", price:219 }, { name:"Grilled Tuna Belly", price:269 } ],
  specials: [ { name:"Sizzling Sisig Platter", price:399 }, { name:"Seafood Platter", price:799 }, { name:"Family Platter", price:799 }, { name:"StoneGrill Special", price:499 } ],
  refreshments: [ { name:"Halo-Halo", price:129 }, { name:"Mais con Yelo", price:109 }, { name:"Buko Pandan", price:109 },
    { name:"avocado shake", price:75 }, { name:"mango shake", price:75 }, { name:"caroot shake", price:75 }, { name:"banana shake", price:75 },
    { name:"apple shake", price:75 }, { name:"buko shake", price:75 }, { name:"pineapple shake", price:75 } ],
  drinks: [ { name:"Softdrinks", price:20 }, { name:"Wilkins 500 ml", price:20 }, { name:"Wilkins 1 L", price:30 },
    { name:"San Mig Light", price:75 }, { name:"San Mig Apple", price:75 }, { name:"San Mig Pale Pilsen", price:70 },
    { name:"Red Horse Stallion", price:80 }, { name:"Red Horse 1 L", price:180 }, { name:"San Mig Grande", price:150 } ],
  pork: [ { name:"Pork Sisig", price:199 }, { name:"Lechon Kawali", price:229 }, { name:"Crispy Pata", price:499 },
    { name:"Pork Adobo", price:240 }, { name:"Sweet & Sour Pork", price:209 }, { name:"Pork steak", price:240 }, { name:"Pork steak solo", price:125 } ]
};

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
    var active = (c.id === currentCategory) ? ' active' : '';
    return '<button class="'+active+'" onclick="showCategory(\''+c.id+'\')">'+ emo + '<span>' + (c.label || c.id) + '</span></button>';
  }).join('');
}

/* ---- State ---- */
var MENU_META = null;
var MENU = {};
var currentCategory = 'pork';
var cart = [];

/* ---- Category render ---- */
function showCategory(cat){
  currentCategory = cat;
  renderMenu();

  // highlight active category
  document.querySelectorAll('#categoryBar button').forEach(btn => btn.classList.remove('active'));
  var categories = MENU_META.categories || [];
  var label = (categories.find(c => c.id === cat) || {}).label;
  document.querySelectorAll('#categoryBar button').forEach(btn => {
    if (btn.textContent.includes(label)) btn.classList.add('active');
  });
}
window.showCategory = showCategory;

/* ---- Menu rendering ---- */
function renderMenu() {
  var list = $('#menuList'); if (!list) return;
  var items = (MENU[currentCategory] || []);
  var html = '';
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    html += '' +
      '<div class="item" data-idx="'+i+'">' +
        '<div class="item-title" title="'+it.name+'">'+it.name+'</div>' +
        '<div class="item-actions">' +
          '<span class="item-price">'+money(it.price)+'</span>' +
          '<button class="add-btn" data-idx="'+i+'" aria-label="Add '+it.name+'">Add</button>' +
        '</div>' +
      '</div>';
  }
  list.innerHTML = html;

  var btns = list.querySelectorAll('.add-btn');
  for (var b = 0; b < btns.length; b++) {
    btns[b].addEventListener('click', function(e){
      var idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
      var item = MENU[currentCategory][idx];
      addToCart(item);
    });
  }
}

/* ---- Cart ---- */
function addToCart(item){
  var found = cart.find(c => c.name === item.name);
  if(found) { found.qty += 1; }
  else { cart.push({ name:item.name, price:item.price, qty:1 }); }
  renderCart(true);
}
function changeQty(name, delta){
  for (var i=0;i<cart.length;i++){
    if(cart[i].name===name){
      cart[i].qty += delta;
      if(cart[i].qty<=0){ cart.splice(i,1); }
      break;
    }
  }
  renderCart();
}
function cartSubtotal(){ return cart.reduce((s,it)=>s+it.price*it.qty,0); }

function renderCart(nudge){
  var wrap = $('#cartItems'); if(!wrap) return;
  if(cart.length===0){
    wrap.classList.remove('has-items');
    wrap.innerHTML = "<p class='empty-cart'>Your cart is empty.</p>";
    $('#cartSubtotal').textContent = money(0);
    $('#cartTotal').textContent = money(0);
    return;
  } else { wrap.classList.add('has-items'); }

  var html = '';
  for (var i=0;i<cart.length;i++){
    var it = cart[i];
    html += '' +
    '<div class="cart-row">'+
      '<div class="qty-wrap">'+
        '<button class="qty-btn" data-name="'+it.name+'" data-delta="-1">−</button>'+
        '<span>'+it.qty+'</span>'+
        '<button class="qty-btn" data-name="'+it.name+'" data-delta="1">+</button>'+
      '</div>'+
      '<div class="cart-name" title="'+it.name+'">'+it.name+'</div>'+
      '<div class="cart-price">'+money(it.price*it.qty)+'</div>'+
    '</div>';
  }
  wrap.innerHTML = html;

  $('#cartSubtotal').textContent = money(cartSubtotal());
  $('#cartTotal').textContent = money(cartSubtotal());

  wrap.querySelectorAll('.qty-btn').forEach(btn=>{
    btn.addEventListener('click', function(e){
      var nm = e.currentTarget.getAttribute('data-name');
      var d = parseInt(e.currentTarget.getAttribute('data-delta'),10);
      changeQty(nm,d);
    });
  });

  if(nudge){
    var card = document.querySelector('.card.highlight');
    if(card){ card.classList.remove('nudge'); void card.offsetWidth; card.classList.add('nudge'); }
  }
}

function clearCart(){ cart = []; renderCart(); }

/* ---- Dine-in pax toggle ---- */
function updatePersonsVisibility(){
  var selected = document.querySelector('input[name="orderType"]:checked');
  var wrap = $('#personsWrap'); if(!wrap) return;
  var isDineIn = selected && /dine[\s-]*in/i.test(String(selected.value||''));  
  if(isDineIn) wrap.classList.remove('hidden'); else wrap.classList.add('hidden');
}

/* ---- Mobile number formatting (+63) ---- */
function normalizeMobile(inputEl){
  var val = inputEl.value.replace(/[^\d+]/g,'');
  if(val.indexOf('0')===0) val = '+63' + val.slice(1);
  if(val.indexOf('+63')!==0){ val = '+63' + val.replace(/^\+?/, '').replace(/^63/,''); }
  var m = /^\+63(\d{3})(\d{3})(\d{0,4})/.exec(val.replace(/\s+/g,''));
  if(m) val = '+63 ' + m[1] + ' ' + m[2] + (m[3] ? ' ' + m[3] : '');
  inputEl.value = val;
}

/* ---- Telegram / Sheets ---- */
function sendToTelegram(text){
  return new Promise(function(resolve, reject){
    var token  = (window.APP && window.APP.TELEGRAM_BOT_TOKEN) || '';
    var chatId = (window.APP && window.APP.TELEGRAM_CHAT_ID)   || '';
    if(!token || !chatId) return reject(new Error('Missing Telegram token or chat id in config.js'));
    var url = 'https://api.telegram.org/bot' + encodeURIComponent(token) + '/sendMessage';
    fetch(url, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ chat_id:chatId, text:text, parse_mode:'HTML' })
    }).then(r=>{ if(!r.ok) return r.text().then(t=>{ throw new Error(t||r.status); }); return r.json(); })
      .then(resolve).catch(reject);
  });
}
function logToSheets(payload){
  return new Promise(function(resolve){
    var endpoint = (window.APP && window.APP.GOOGLE_APPS_SCRIPT_URL) || '';
    if(!endpoint) return resolve({ok:false, skipped:true});
    fetch(endpoint, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    }).then(r=>{ resolve({ok: !!r && r.ok}); })
      .catch(()=>{ resolve({ok:false}); });
  });
}

/* ---- Date/Time formatting ---- */
function formatOrderDateTime(dateStr, timeStr){
  if(!dateStr && !timeStr) return { human:'—', iso:'—' };
  var dt = new Date(dateStr + 'T' + (timeStr || '00:00'));
  if(isNaN(dt.getTime())) return { human:(dateStr+' '+(timeStr||'')).trim(), iso:(dateStr+' '+(timeStr||'')).trim() };
  var human = dt.toLocaleString('en-PH', { weekday:'short', year:'numeric', month:'short', day:'2-digit',
    hour:'numeric', minute:'2-digit', hour12:true });
  var iso = dt.getFullYear() + '-' + String(dt.getMonth()+1).padStart(2,'0') + '-' + String(dt.getDate()).padStart(2,'0') +
            ' ' + String(dt.getHours()).padStart(2,'0') + ':' + String(dt.getMinutes()).padStart(2,'0');
  return { human:human, iso:iso };
}

/* ---- Build Telegram message ---- */
function buildOrderMessage(form, orderId){
  var name = ($('#fullName')||{}).value || '';
  var mobile = ($('#mobileNumber')||{}).value || '';
  var orderType = (form.querySelector('input[name="orderType"]:checked')||{}).value || '';
  var persons = ($('#persons')||{}).value || '';
  var date = ($('#orderDate')||{}).value || '';
  var time = ($('#orderTime')||{}).value || '';
  var notes = ($('#specialRequests')||{}).value || '';
  var items = cart.map(it=> '• '+it.name+' x'+it.qty+' — '+money(it.qty*it.price)).join('\n') || '—';
  var when = formatOrderDateTime(date, time);
  var msg = '<b>Stone Grill — New Order</b>\n';
  if (orderId) msg += '\n<b>Order ID:</b> ' + orderId;
  msg += '\n<b>Customer:</b> ' + name;
  msg += '\n<b>Mobile:</b> ' + mobile;
  msg += '\n<b>Type:</b> ' + orderType;
  if (/dine/i.test(orderType)) msg += '\n<b>Persons:</b> ' + (persons || 1);
  msg += '\n<b>Date/Time:</b> ' + when.human + '  <i>(' + when.iso + ')</i>';
  msg += '\n<b>Items:</b>\n' + items;
  msg += '\n<b>Subtotal:</b> ' + money(cartSubtotal());
  if (notes) msg += '\n<b>Requests:</b> ' + notes;
  msg += '\n\n(Automated message)';
  return msg;
}

/* ---- Submit ---- */
function handleSubmit(e){
  e.preventDefault();
  if(cart.length===0){ showToast('Add at least 1 item to your order.'); return; }
  var mobileEl = $('#mobileNumber'); if(mobileEl) normalizeMobile(mobileEl);
  var form = e.currentTarget;

  // Prepare metadata BEFORE we clear the cart
  var orderId = generateOrderId();
  var totalBefore = cartSubtotal();

  // Persist key info for the upload caption (in case fields change)
  window.pendingOrder = {
    orderId: orderId,
    total: totalBefore,
    name: ($('#fullName')||{}).value || '',
    mobile: ($('#mobileNumber')||{}).value || '',
    formEl: form
  };

  var message = buildOrderMessage(form, orderId);
  var payload = {
    orderId: orderId,
    name: window.pendingOrder.name,
    mobile: window.pendingOrder.mobile,
    orderType: (form.querySelector('input[name="orderType"]:checked')||{}).value || '',
    persons: ($('#persons')||{}).value || '',
    date: ($('#orderDate')||{}).value || '',
    time: ($('#orderTime')||{}).value || '',
    requests: ($('#specialRequests')||{}).value || '',
    items: cart.map(it=>({ name:it.name, qty:it.qty, price:it.price })),
    subtotal: totalBefore,
    createdAt: new Date().toISOString()
  };

  sendToTelegram(message).then(function(){
    // Friendly toast + auto-open GCash popup with Order ID & Total
    showToast('✅ Order received! Please pay via GCash now. Order ID: ' + orderId, 6000);
    if (typeof window.showGcashPopup === 'function') {
      window.showGcashPopup(orderId, totalBefore);
    }

    // IMPORTANT: Do NOT clear/reset here.
    // We wait until the receipt upload succeeds (tgUploadFrame load) to refresh/clear.
    logToSheets(payload);
  }).catch(function(err){
    console.error(err);
    showToast('Failed to send to Telegram. Please try again.');
  });
}

/* ---- How to Order popup ---- */
function wireHowToPopup(){
  // Support either id spelling
  const link = document.getElementById('howToOrderLink') || document.getElementById('howtoOrder');
  const popup = document.getElementById('howToOrderPopup');
  if (!link || !popup) return;
  const closeBtn = popup.querySelector('.popup-close');

  function openHowto(e){
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    popup.classList.remove('hidden');
    popup.classList.add('show');
    popup.setAttribute('aria-hidden','false');
  }
  function closeHowto(){
    popup.classList.remove('show');
    popup.classList.add('hidden');
    popup.setAttribute('aria-hidden','true');
  }
  link.addEventListener('click', openHowto);
  if (closeBtn) closeBtn.addEventListener('click', closeHowto);
  popup.addEventListener('click', (e) => { if (e.target === popup) closeHowto(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !popup.classList.contains('hidden')) closeHowto(); });
}

/* ---- Boot ---- */
document.addEventListener('DOMContentLoaded', async function(){
  try {
    MENU_META = await loadMenuData(MENU_FALLBACK);
    MENU = MENU_META.data;
    var hasPork = MENU_META.categories.some(c=>c.id==='pork');
    currentCategory = hasPork ? 'pork' : (MENU_META.categories[0] ? MENU_META.categories[0].id : 'pork');
    buildCategoryBar(MENU_META.categories);
    renderMenu(); renderCart();
    var radios = document.querySelectorAll('input[name="orderType"]');
    for (var i=0;i<radios.length;i++){ radios[i].addEventListener('change', updatePersonsVisibility); }
    updatePersonsVisibility();
    var m = $('#mobileNumber');
    if(m){ m.addEventListener('blur', ()=>normalizeMobile(m)); m.addEventListener('input', ()=>{ if(m.value.indexOf('+63')!==0) m.value = '+63 '; }); }
    var form = $('#orderForm'); if(form) form.addEventListener('submit', handleSubmit);
    initClearButton();
    var checkout = $('#checkoutBtn'); if(checkout) checkout.addEventListener('click', ()=>{ var formEl = $('#orderForm'); if(formEl) formEl.scrollIntoView({ behavior:'smooth', block:'start' }); });
    wireHowToPopup();
  } catch(e) {
    console.error('Init error:', e);
    showToast('Error initializing page scripts.');
  }
});

/* ========= Hotfix pack ========= */
function initClearButton(){
  var btn = document.getElementById('clearCartBtn');
  if (!btn) return;
  btn.addEventListener('click', function(){ clearCart(); showToast('Cart cleared.',2000); });
}
