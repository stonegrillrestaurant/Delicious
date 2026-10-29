'use strict';

/* ---- Helpers ---- */
function $(sel){ return document.querySelector(sel); }
function $$(sel){ return document.querySelectorAll(sel); }
function money(n){ return '₱' + Math.round(Number(n)); } // no decimals
function escapeHtml(value){
  return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function showToast(msg){
  var status = document.getElementById('orderFormStatus');
  if(status) status.textContent = msg == null ? '' : String(msg);
  else console.warn(msg);
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
    var liveUrl = window.SG_MENU_API;
    if (liveUrl) { var live = await fetch(liveUrl, {cache:'no-store'}); if (live.ok) { var liveData = await live.json(); if (liveData.ok && liveData.menu && liveData.menu.categories && liveData.menu.data) return liveData.menu; } }
  } catch(e) {}

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
    var emo = c.emoji ? '<span class="cat-emoji">'+escapeHtml(c.emoji)+'</span>' : '';
    var active = (c.id === currentCategory) ? ' active' : '';
    var id = escapeHtml(c.id);
    return '<button type="button" class="'+active+'" data-category="'+id+'">'+ emo + '<span>' + escapeHtml(c.label || c.id) + '</span></button>';
  }).join('');
  bar.querySelectorAll('[data-category]').forEach(function(button){
    button.addEventListener('click',function(){ showCategory(button.dataset.category); });
  });
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
        '<div class="item-title" title="'+escapeHtml(it.name)+'">'+escapeHtml(it.name)+'</div>' +
        '<div class="item-actions">' +
          '<span class="item-price">'+money(it.price)+'</span>' +
          '<button class="add-btn" data-idx="'+i+'" aria-label="Add '+escapeHtml(it.name)+'">Add</button>' +
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
        '<button class="qty-btn" data-name="'+escapeHtml(it.name)+'" data-delta="-1">−</button>'+
        '<span>'+it.qty+'</span>'+
        '<button class="qty-btn" data-name="'+escapeHtml(it.name)+'" data-delta="1">+</button>'+
      '</div>'+
      '<div class="cart-name" title="'+escapeHtml(it.name)+'">'+escapeHtml(it.name)+'</div>'+
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
  var isDineIn = selected && (/dine[\s-]*in/i.test(String(selected.value||''))||selected.value==='Reservation');  
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

/* Durable order reference, kept for safe retries in this browser tab. */
function randomHex(n){return Array.from(crypto.getRandomValues(new Uint8Array(n)),v=>v.toString(16).padStart(2,'0')).join('');}
async function orderApi(body){
 if(!window.APP?.ORDER_API_URL)throw Error('Online ordering is not configured. Please contact Stone Grill.');
 if(!window.SG_AUTH)throw Error('Sign-in is still loading. Please try again.');
 const token=await window.SG_AUTH.getToken();
 const r=await fetch(window.APP.ORDER_API_URL,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body)});
 const data=await r.json();if(!r.ok||!data.ok)throw Object.assign(Error(data.error||'Unable to confirm. Retry with the same order details.'),{status:r.status});return data;
}
window.backendOrder=null;

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


function checkoutPayload(){
 normalizeMobile($('#mobileNumber'));
 const form=$('#orderForm');
 return {name:$('#fullName').value,mobile:$('#mobileNumber').value,orderType:form.querySelector('input[name="orderType"]:checked')?.value,persons:$('#persons').value,date:$('#orderDate').value,time:$('#orderTime').value,requests:$('#specialRequests').value,items:cart.map(i=>({name:i.name,qty:i.qty,price:i.price})),subtotal:cartSubtotal()};
}
function saveCheckoutIntent(){
 const form=$('#orderForm');if(!form)return;
 const data={name:$('#fullName').value,mobile:$('#mobileNumber').value,orderType:form.querySelector('input[name="orderType"]:checked')?.value||'',persons:$('#persons').value,date:$('#orderDate').value,time:$('#orderTime').value,requests:$('#specialRequests').value};
 try{sessionStorage.setItem('sgCheckoutIntent',JSON.stringify(data));}catch{}
}

function queueCheckoutAfterSignIn(){
 saveCheckoutIntent();
 try{sessionStorage.setItem('sgContinueAfterLogin','1');}catch{}
 const signIn=document.getElementById('googleSignIn');
 if(signIn){signIn.click();return;}
 showToast('Sign-in is still loading. Please try again.');
}
window.resumeCheckoutAfterSignIn=()=>{
 if(!window.SG_AUTH?.auth?.currentUser){showToast('Please sign in to continue.');return;}
 document.getElementById('orderForm')?.requestSubmit();
};
async function handleSubmit(e){
 e.preventDefault();
 if(!window.SG_AUTH?.auth?.currentUser){queueCheckoutAfterSignIn();return;}
 const btn=e.currentTarget.querySelector('button[type="submit"]');
 if(!cart.length){
  showToast('Add a menu item before continuing.');
  document.getElementById('menuList')?.scrollIntoView({behavior:'smooth',block:'start'});
  document.querySelector('#menuList button')?.focus({preventScroll:true});
  return;
 }
 btn.disabled=true;btn.textContent='Preparing payment…';
 try{
  await window.SG_AUTH.getToken();const uid=window.SG_AUTH.auth.currentUser.uid;
  const saved=JSON.parse(sessionStorage.getItem('sgPrepaidAttempt:'+uid)||'null');
  if(saved&&!saved.confirmed){window.pendingCheckout=saved;window.openCheckout(saved);return;}
  const payload=checkoutPayload(),draft={uid,payload,requestId:randomHex(16),receiptKey:randomHex(32)};
  const quote=await orderApi({action:'quote',...payload,requestId:draft.requestId,receiptKey:draft.receiptKey});
  draft.payload=quote.order;
  if(window.SG_AUTH.auth.currentUser?.uid!==uid)throw Error('Account changed. Please try again.');
  sessionStorage.setItem('sgPrepaidAttempt:'+uid,JSON.stringify(draft));
  window.pendingCheckout=draft;window.openCheckout(draft);
 }catch(err){showToast(err.message);}
 finally{btn.disabled=false;btn.textContent='Review order & pay';}
}
window.submitPrepaidOrder=async function(method,reference){
 const draft=window.pendingCheckout;
 if(!draft||draft.uid!==window.SG_AUTH.auth.currentUser?.uid)throw Error('Sign in with the account that started this order.');
 if(!draft.submitted){draft.paymentMethod=method;draft.submittedPaymentReference=reference;draft.submitted=true;
  sessionStorage.setItem('sgPrepaidAttempt:'+draft.uid,JSON.stringify(draft));}
 const result=await orderApi({...draft.payload,action:draft.legacy?'payment':'order',paymentMethod:draft.paymentMethod,submittedPaymentReference:draft.submittedPaymentReference,paymentMobile:draft.payload.mobile,requestId:draft.requestId,receiptKey:draft.receiptKey});
 if(window.SG_AUTH.auth.currentUser?.uid!==draft.uid)throw Error('Account changed. Sign back in to see the saved order.');
 draft.confirmed=true;sessionStorage.setItem('sgPrepaidAttempt:'+draft.uid,JSON.stringify(draft));
 window.closeCheckout();clearCart();location.assign('account/?submitted='+encodeURIComponent(draft.requestId));
 return result;
};

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

function populateOrderTimeSuggestions(){
  var list=$('#orderTimeOptions');if(!list)return;
  var options=document.createDocumentFragment();
  for(var minute=10*60;minute<21*60;minute+=15){
    var option=document.createElement('option');
    option.value=String(Math.floor(minute/60)).padStart(2,'0')+':'+String(minute%60).padStart(2,'0');
    options.appendChild(option);
  }
  list.replaceChildren(options);
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
    for (var i = 0; i < radios.length; i++){ radios[i].addEventListener('change', updatePersonsVisibility); }
    updatePersonsVisibility();
    populateOrderTimeSuggestions();
    var m = $('#mobileNumber');
    if(m){ m.addEventListener('blur', ()=>normalizeMobile(m)); m.addEventListener('input', ()=>{ if(m.value.indexOf('+63')!==0) m.value = '+63 '; }); }
    var form = $('#orderForm'); if(form) form.addEventListener('submit', handleSubmit);
    initClearButton();
    wireHowToPopup();
  } catch(e) {
    console.error('Init error:', e);
    showToast('The order form could not finish loading. Refresh the page and try again.');
  }
});

/* ========= Hotfix pack ========= */
function initClearButton(){
  var btn = document.getElementById('clearCartBtn');
  if (!btn) return;
  btn.addEventListener('click', function(){ clearCart(); showToast('Cart cleared.'); });
}
