import {auth,a,f,db,esc,wireLogin,loginMarkup,syncProfile} from './customer-auth.js';
const box=document.getElementById('customerAccount');let stop,revision=0;
function notice(text){document.getElementById('accountNotice').textContent=text;}
a.onAuthStateChanged(auth,async user=>{
 const r=++revision;stop?.();stop=null;
 // Do not expose the previous person's receipt reference on a shared device.
 const old=window.backendOrder;
 if(!user||old?.uid!==user.uid){for(const id of ['fullName','mobileNumber']){const el=document.getElementById(id);if(el)el.value='';}}
 if(!user||old?.uid!==user.uid)window.backendOrder=null;
 box.innerHTML=user?`<div class="signed-account"><span class="account-avatar" aria-hidden="true">${esc((user.displayName||user.email||"S").slice(0,1).toUpperCase())}</span><a href="account/">${esc(user.displayName||user.email)}<small>My profile & orders →</small></a><button id="customerSignOut" class="account-signout" type="button">Sign out</button></div><p id="accountNotice" role="status" aria-live="polite"></p>`:`<div class="header-login"><span class="signin-hint">Browse freely. Sign in before checkout.</span>${loginMarkup()}</div><p id="accountNotice" role="status" aria-live="polite"></p>`;
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
  stop=f.onSnapshot(f.doc(db,'sgCustomers',user.uid),s=>{if(r!==revision)return;const p=s.data();if(!p)return;for(const [id,value] of [['fullName',p.name],['mobileNumber',p.mobile]]){const el=document.getElementById(id);if(el&&!el.value.trim())el.value=value||'';}},e=>notice(e.message));
 }catch(e){if(r===revision)notice('Account setup failed: '+e.message);}
});
