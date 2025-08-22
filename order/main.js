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
  var found = null;
  for (var i=0;i<cart.length;i++){ if(cart[i].name===item.name){ found=cart[i]; break; } }
  if(found) found.qty += 1; else cart.push({ name:item.name, price:item.price, qty:1 });
  renderCart(true);
}
function changeQty(name, delta){
  for (var i=0;i<cart.length;i++){
    if(cart[i].name===name){ cart[i].qty += delta; if(cart[i].qty<=0){ cart.splice(i,1); } break; }
  }
  renderCart();
}
function removeItem(name){ cart = cart.filter(function(c){ return c.name!==name; }); renderCart(); }
function cartSubtotal(){ var s=0; for(var i=0;i<cart.length;i++){ s += cart[i].price*cart[i].qty; } return s; }

function renderCart(nudge){
  var wrap = $('#cartItems'); if(!wrap) return;
  var html = '';
  for (var i=0;i<cart.length;i++){
    var it = cart[i];
    html += '' +
    '<div class="cart-row">'+
      '<div class="cart-name" title="'+it.name+'">'+it.name+'</div>'+
      '<div class="qty-wrap">'+
        '<button class="qty-btn" data-name="'+it.name+'" data-delta="-1">−</button>'+
        '<span>'+it.qty+'</span>'+
        '<button class="qty-btn" data-name="'+it.name+'" data-delta="1">+</button>'+
      '</div>'+
      '<div class="cart-price">'+money(it.price*it.qty)+'</div>'+
      '<button class="remove-btn" data-name="'+it.name+'">Remove</button>'+
    '</div>';
  }
  wrap.innerHTML = html;

  var sub = $('#cartSubtotal'); if(sub) sub.textContent = money(cartSubtotal());
  var tot = $('#cartTotal');    if(tot) tot.textContent = money(cartSubtotal());

  var qbtns = wrap.querySelectorAll('.qty-btn');
  for (var q=0;q<qbtns.length;q++){
    qbtns[q].addEventListener('click', function(e){
      var nm = e.currentTarget.getAttribute('data-name');
      var d  = parseInt(e.currentTarget.getAttribute('data-delta'),10);
      changeQty(nm, d);
    });
  }
  var rbtns = wrap.querySelectorAll('.remove-btn');
  for (var r=0;r<rbtns.length;r++){
    rbtns[r].addEventListener('click', function(e){ removeItem(e.currentTarget.getAttribute('data-name')); });
  }

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
  if(val.indexOf('+63')!==0){ val = '+63' + val; }
  inputEl.value = val;
}

/* ---- Order submit ---- */
async function handleSubmit(e){
  e.preventDefault();
  if(cart.length===0){ showToast("Cart is empty"); return; }

  var name = $('#custName')?.value.trim() || '';
  var mobile = $('#custMobile')?.value.trim() || '';
  var date = $('#custDate')?.value.trim() || '';
  var time = $('#custTime')?.value.trim() || '';
  var reqs = $('#custReq')?.value.trim() || '';
  var type = document.querySelector('input[name="orderType"]:checked')?.value || '';
  var pax  = $('#custPersons')?.value.trim() || '';
  normalizeMobile({value: mobile, set value(v){ mobile=v; }});

  var orderId = 'ORD' + Date.now();
  var total = cartSubtotal();

  var lines = cart.map(function(c){ return c.qty+'x '+c.name; }).join('\n');
  var msg = '*New Order* %0A' +
    'ID: '+orderId+'%0A'+
    'Name: '+name+'%0A'+
    'Mobile: '+mobile+'%0A'+
    'Type: '+type+(type.match(/dine/i)?' ('+pax+' pax)':'')+'%0A'+
    'When: '+date+' '+time+'%0A'+
    'Requests: '+reqs+'%0A'+
    'Items:%0A'+lines+'%0A'+
    'Total: '+money(total);

  try {
    if(APP.TELEGRAM_BOT_TOKEN && APP.TELEGRAM_CHAT_ID){
      var url = 'https://api.telegram.org/bot'+APP.TELEGRAM_BOT_TOKEN+'/sendMessage';
      var body = { chat_id: APP.TELEGRAM_CHAT_ID, text: decodeURIComponent(msg), parse_mode:'Markdown' };
      await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    }
  } catch(err){ console.error('Telegram send failed',err); }

  try {
    if(APP.GOOGLE_APPS_SCRIPT_URL){
      var gbody = { orderId, name, mobile, date, time, type, pax, reqs, items:cart, total };
      await fetch(APP.GOOGLE_APPS_SCRIPT_URL, {
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(gbody)
      });
    }
  } catch(err){ console.error('Google Sheets log failed',err); }

  try {
    sendMetaCAPI({ orderId, amount:total, phone:mobile, email:"", event:"Purchase" });
    if(window.fbq){
      fbq('trackSingle','643206718690040','Purchase',{
        value: total, currency: 'PHP'
      },{eventID: orderId});
    }
  } catch(err){ console.error('Meta tracking failed',err); }

  showToast("✅ Order sent! Please pay to confirm. (GCash QR below)", 6000);
  var qr = $('#gcashPopup'); if(qr){ qr.classList.remove('hidden'); qr.setAttribute('aria-hidden','false'); }
  clearCart();
}

/* ---- How to Order popup ---- */
function wireHowToPopup(){
  var link = document.getElementById('howtoOrder');
  var popup = document.getElementById('howToOrderPopup');
  if(!link || !popup) return;
  var closeBtn = popup.querySelector('.popup-close');

  function openHowto(e){ if(e) e.preventDefault(); popup.classList.remove('hidden'); popup.setAttribute('aria-hidden','false'); }
  function closeHowto(){ popup.classList.add('hidden'); popup.setAttribute('aria-hidden','true'); }

  link.addEventListener('click', openHowto);
  if(closeBtn) closeBtn.addEventListener('click', closeHowto);
  popup.addEventListener('click', function(e){ if(e.target===popup) closeHowto(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !popup.classList.contains('hidden')) closeHowto(); });
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', async function(){
  var meta = await loadMenuData(MENU_FALLBACK);
  MENU_META = meta.categories;
  MENU = meta.data;

  buildCategoryBar(MENU_META);
  showCategory(MENU_META[0].id);

  renderCart();
  updatePersonsVisibility();

  var typeRadios = document.querySelectorAll('input[name="orderType"]');
  for(var i=0;i<typeRadios.length;i++){ typeRadios[i].addEventListener('change', updatePersonsVisibility); }

  var mEl = $('#custMobile'); if(mEl){ mEl.addEventListener('blur', function(){ normalizeMobile(mEl); }); }
  var form = $('#orderForm'); if(form){ form.addEventListener('submit', handleSubmit); }

  wireHowToPopup();
});
