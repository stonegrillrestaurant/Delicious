import {auth,a,f,db,esc,wireLogin,loginMarkup,syncProfile} from './customer-auth.js?v=localpersist1';
const box=document.getElementById('customerAccount');let stopProfile,stopOrders,revision=0;
function restoreCheckoutIntent(uid){
 let saved;try{saved=JSON.parse(sessionStorage.getItem('sgCheckoutIntent')||'null');}catch{}
 if(!saved)return;
 for(const [id,key] of [['fullName','name'],['mobileNumber','mobile'],['persons','persons'],['orderDate','date'],['orderTime','time'],['specialRequests','requests']]){
  const el=document.getElementById(id);if(el&&saved[key])el.value=saved[key];
 }
 if(saved.orderType){const radio=[...document.querySelectorAll('input[name="orderType"]')].find(x=>x.value===saved.orderType);if(radio){radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));}}
 try{sessionStorage.removeItem('sgCheckoutIntent');}catch{}
 document.getElementById('orderForm')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function notice(text){document.getElementById('accountNotice').textContent=text;}
function orderTime(o){return o.createdAt?.toMillis?.()||o.updatedAt?.toMillis?.()||0;}
function activeStage(o){
 if(o.status==='ready')return 4;
 if(o.status==='preparing'||o.paymentStatus==='verified')return 3;
 if(o.submittedPaymentReference)return 2;
 return 1;
}
function activeLabel(o){
 if(o.status==='ready')return o.orderType==='Take-out'?'Ready for pickup':'Ready to serve';
 if(o.status==='preparing')return 'Kitchen is preparing your order';
 if(o.paymentStatus==='verified')return 'Payment verified';
 if(o.submittedPaymentReference)return 'Payment verification pending';
 return 'Order received';
}
function renderActiveOrder(o){
 let panel=document.getElementById('activeOrderSummary');
 if(!panel){
  panel=document.createElement('section');panel.id='activeOrderSummary';panel.className='active-order-summary';panel.hidden=true;
  const intro=document.querySelector('.order-page-intro');intro?.insertAdjacentElement('afterend',panel);
 }
 if(!o){panel.hidden=true;panel.innerHTML='';return;}
 const stage=activeStage(o),labels=['Order received','Payment confirmed','Cooking','Ready'];
 panel.innerHTML='<div class="active-order-top"><div><small>CURRENT ORDER</small><strong>'+esc(activeLabel(o))+'</strong><span>'+esc(o.orderId||o.id||'')+'</span></div><a href="account/">Open full tracking →</a></div><ol class="active-order-steps" aria-label="Current order progress">'+labels.map((label,i)=>'<li class="'+(i+1<stage?'done':i+1===stage?'current':'pending')+'"'+(i+1===stage?' aria-current="step"':'')+'><span>'+(i+1<stage?'✓':i+1)+'</span><strong>'+esc(label)+'</strong></li>').join('')+'</ol>';
 panel.hidden=false;
}
a.onAuthStateChanged(auth,async user=>{
 const r=++revision;stopProfile?.();stopOrders?.();stopProfile=null;stopOrders=null;renderActiveOrder(null);
 // Do not expose the previous person's receipt reference on a shared device.
 const old=window.backendOrder;
 if(!user||old?.uid!==user.uid){for(const id of ['fullName','mobileNumber']){const el=document.getElementById(id);if(el)el.value='';}}
 if(!user||old?.uid!==user.uid)window.backendOrder=null;
 box.innerHTML=user?`<div class="signed-account"><span class="account-avatar" aria-hidden="true">${esc((user.displayName||user.email||"S").slice(0,1).toUpperCase())}</span><a href="account/">${esc(user.displayName||user.email)}<small>My profile & orders →</small></a><button id="customerSignOut" class="account-signout" type="button">Sign out</button></div><p id="accountNotice" role="status" aria-live="polite"></p>`:`<div class="header-login"><span class="signin-hint">Sign in with Google to continue checkout.</span>${loginMarkup()}</div><p id="accountNotice" role="status" aria-live="polite"></p>`;
 if(!user){wireLogin(notice);return;}
 document.getElementById('customerSignOut').onclick=()=>a.signOut(auth);
 try{await syncProfile();if(r!==revision)return;
  try{const saved=JSON.parse(sessionStorage.getItem('sgConfirmedOrder:'+user.uid)||'null');if(saved?.uid===user.uid)window.backendOrder=saved;}catch{}
  if(new URLSearchParams(location.search).get('new')==='1'){
   const key='sgOrderAttempt:'+user.uid;const attempt=JSON.parse(sessionStorage.getItem(key)||'null');
   if(attempt?.confirmed){sessionStorage.removeItem(key);window.backendOrder=null;}
   else if(attempt)notice('An earlier submission is unconfirmed. Check My Orders or retry the same details before starting another order.');
  }

  const savedDraft=JSON.parse(sessionStorage.getItem('sgPrepaidAttempt:'+user.uid)||'null');
  const paymentId=new URLSearchParams(location.search).get('pay');
  if(paymentId&&/^[a-f0-9]{32}$/.test(paymentId)){
   const snap=await f.getDoc(f.doc(db,'sgOrders',paymentId));if(r!==revision)return;
   const o=snap.data();
   if(o&&o.customerUid===user.uid&&!o.submittedPaymentReference&&!['completed','cancelled'].includes(o.status)){
    window.pendingCheckout={uid:user.uid,legacy:true,payload:o,requestId:paymentId,receiptKey:'0'.repeat(64)};
    window.openCheckout(window.pendingCheckout);
   }else notice('Check My Orders for the latest payment status. Do not pay again.');
  }else if(savedDraft&&!savedDraft.confirmed){window.pendingCheckout=savedDraft;window.openCheckout(savedDraft);}
  stopProfile=f.onSnapshot(f.doc(db,'sgCustomers',user.uid),s=>{if(r!==revision)return;const p=s.data();if(!p)return;for(const [id,value] of [['fullName',p.name],['mobileNumber',p.mobile]]){const el=document.getElementById(id);if(el&&!el.value.trim())el.value=value||'';}restoreCheckoutIntent(user.uid);},e=>notice(e.message));
  stopOrders=f.onSnapshot(f.query(f.collection(db,'sgOrders'),f.where('customerUid','==',user.uid)),s=>{
   if(r!==revision)return;
   const active=s.docs.map(d=>({id:d.id,...d.data()})).filter(o=>['new','acknowledged','preparing','ready'].includes(o.status)).sort((a,b)=>orderTime(b)-orderTime(a));
   renderActiveOrder(active[0]||null);
  },e=>{renderActiveOrder(null);notice('Current order could not be loaded: '+e.message);});
 }catch(e){if(r===revision)notice('Account setup failed: '+e.message);}
});
