
import {auth,a,f,db,esc,api,syncProfile,loginMarkup,wireLogin} from '../customer-auth.js?v=accountchooser1';
const $=id=>document.getElementById(id),money=n=>'₱'+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2});
const history=new URLSearchParams(location.search).has('history');
let stop,stopProfile,ordersLoaded=false,live=[],revision=0,customerPushToken=null;
const notice=s=>{$('notice').textContent=s;$('notice').hidden=!s;};
const submittedId=new URLSearchParams(location.search).get('submitted');
let submissionConfirmed=false;
function confirmSubmission(rows,fromCache){
 if(fromCache||!submittedId)return;
 const saved=rows.find(o=>o.id===submittedId&&o.customerUid===auth.currentUser?.uid);
 if(!saved)return;
 submissionConfirmed=true;
 const u=new URL(location.href);u.searchParams.delete('submitted');window.history.replaceState(null,'',u);
}
const time=t=>t?.toDate?t.toDate().toLocaleString('en-PH',{timeZone:'Asia/Manila'}):'';
function staffHasOpened(o){
 return !!o.seenAt||o.paymentStatus==='verified'||['acknowledged','preparing','ready','completed','cancelled'].includes(o.status);
}
function updatePendingBadge(rows){const n=rows.filter(o=>!['completed','cancelled'].includes(o.status)).length;document.querySelectorAll('[data-pending-count]').forEach(el=>{el.hidden=n===0;el.textContent=n>99?'99+':String(n);});}
function status(o){
 const paid=o.paymentStatus==='verified',staffOpened=staffHasOpened(o),tablePending=['Dine-in','Reservation'].includes(o.orderType)&&o.reservationStatus!=='confirmed';
 if(o.status==='cancelled')return 'Cancelled';
 if(!paid)return o.submittedPaymentReference?(staffOpened?'Payment verification pending':'Payment submitted · awaiting staff review'):(staffOpened?'Awaiting payment':'New order · waiting for restaurant review');
 if(o.status==='completed')return 'Completed — claimed / served';
 if(o.status==='ready')return o.orderType==='Take-out'?'Ready for pickup':'Ready to serve';
 if(o.status==='preparing')return 'Cooking in progress';
 if(tablePending)return 'Payment verified — awaiting table confirmation';
 return 'Payment verified — waiting for preparation';
}
function statusHelp(o){
 const paid=o.paymentStatus==='verified',staffOpened=staffHasOpened(o),tablePending=['Dine-in','Reservation'].includes(o.orderType)&&o.reservationStatus!=='confirmed';
 if(o.status==='cancelled')return 'This order will not be prepared. Contact us about any payment already sent.';
 if(!paid){
  if(o.submittedPaymentReference)return staffOpened?'Staff has opened your order. Your payment reference is awaiting verification. Kitchen preparation has not started.':'Your order is waiting for restaurant review. Payment verification will begin after staff opens it; kitchen preparation has not started.';
  return staffOpened?'Staff has opened your order. Payment details are still needed, and kitchen preparation has not started.':'Your order is waiting for restaurant review. Payment details are still needed; kitchen preparation has not started.';
 }
 if(o.status==='completed')return 'Your order has been claimed or served. Thank you for choosing Stone Grill.';
 if(o.status==='ready')return o.orderType==='Take-out'?'Your food is ready. Please collect it at Stone Grill.':'Your food is ready to be served at Stone Grill.';
 if(o.status==='preparing')return 'The kitchen is preparing your food now.';
 if(tablePending)return 'Your payment is verified. We are confirming your table before the kitchen starts preparing your food.';
 return 'Your payment is verified. The kitchen has not started preparing your food yet.';
}
function progress(o){
 const cancelled=o.status==='cancelled',paid=o.paymentStatus==='verified',paymentSubmitted=!!o.submittedPaymentReference,staffOpened=staffHasOpened(o);
 const tablePending=['Dine-in','Reservation'].includes(o.orderType)&&o.reservationStatus!=='confirmed';
 const cooking=paid&&o.status==='preparing',ready=paid&&o.status==='ready',completed=paid&&o.status==='completed';
 const cooked=paid&&['ready','completed'].includes(o.status);
 const steps=[
  {title:'Order received',done:staffOpened,detail:staffOpened?'A Stone Grill team member has opened your order.':'Your order is waiting for a Stone Grill team member to open it.'},
  {title:paid?'Payment confirmed':paymentSubmitted?'Payment verification':'Payment',done:paid,detail:paid?'Stone Grill has verified your payment.':paymentSubmitted?'Your payment reference was received and is awaiting staff verification.':'Payment details are needed to continue.'},
  {title:cooked?'Finished cooking':cooking?'Cooking in progress':'Kitchen preparation',done:cooked,detail:cooked?'Cooking is finished. Your order is ready for pickup or serving.':cooking?'The kitchen is preparing your food now.':!paid?'Not started. Kitchen preparation begins only after payment is verified.':tablePending?'Not started. Waiting for table confirmation before cooking.':'Not started. Payment is verified; waiting for the kitchen to begin.'},
  {title:o.orderType==='Take-out'?'Ready for pickup':'Ready to serve',done:completed,detail:completed?'Your order has been claimed or served. Thank you.':ready?(o.orderType==='Take-out'?'Your food is ready. Please collect it at Stone Grill.':'Your food is ready to be served at Stone Grill.'):'Available after cooking is finished.'}
 ];
 const current=cancelled||completed?-1:!staffOpened?0:!paid?1:ready?3:2;
 return '<div class="order-progress"><h4>Order progress</h4><ol class="progress-list" aria-label="Order process">'+steps.map((step,i)=>{const state=step.done?'done':current===i?'current':'pending';let label;if(i===0)label=staffOpened?'Seen by staff':'Waiting for staff';else if(i===1)label=paid?'Verified':paymentSubmitted?(staffOpened?'Awaiting verification':'After staff review'):'Payment needed';else if(i===2)label=cooked?'Completed':cooking?'In progress':paid?(tablePending?'Waiting for table':'Waiting to start'):'Not started';else label=completed?'Completed':ready?'Ready now':'Not ready';return '<li class="progress-step '+state+'"'+(state==='current'?' aria-current="step"':'')+'><span class="progress-mark" aria-hidden="true">'+(step.done?'✓':i+1)+'</span><div><strong>'+esc(step.title)+'</strong><span class="progress-state">'+esc(label)+'</span><p class="sr-only">'+esc(step.detail)+'</p></div></li>';}).join('')+'</ol>'+(cancelled?'<p class="progress-stopped">Order cancelled · progress stopped. Contact us about any payment already sent.</p>':completed?'<p class="progress-key">Order completed. It has been claimed or served.</p>':!staffOpened?'<p class="progress-key">'+(paymentSubmitted?'Your order is waiting for restaurant review. Payment verification has not started, and kitchen preparation has not started.':'Your order is waiting for restaurant review. Payment details are needed before kitchen preparation can start.')+'</p>':!paid?'<p class="progress-key">'+(paymentSubmitted?'Staff has opened your order. Payment verification is pending; kitchen preparation has not started.':'Payment details are needed before the kitchen can begin.')+'</p>':ready?'<p class="progress-key">'+esc(steps[3].detail)+'</p>':cooking?'<p class="progress-key">The kitchen is cooking your order now.</p>':tablePending?'<p class="progress-key">Payment is verified. We are confirming your table before kitchen preparation starts.</p>':'<p class="progress-key">Payment is verified. The kitchen has not started preparing your order yet.</p>')+'</div>';
}
function orderCard(o,archived=false){
 const type=o.orderType==='Take-out'?'Take-out':o.orderType==='Reservation'?'Reservation':'Dine-in';
 const items=(o.items||[]).map(i=>'<li><span><b>'+esc(i.qty)+' ×</b> '+esc(i.name)+'</span><strong>'+money(Number(i.price||0)*Number(i.qty||0))+'</strong></li>').join('');
 const table=['Dine-in','Reservation'].includes(o.orderType);
 const needsPayment=!['completed','cancelled'].includes(o.status)&&o.paymentStatus!=='verified'&&!o.submittedPaymentReference;
 const detailRows=[];
 if(table)detailRows.push('<p>Table: <strong>'+(o.reservationStatus==='confirmed'?'Confirmed':'Awaiting confirmation')+'</strong> · '+esc(o.persons)+' guests</p>');
 if(o.submittedPaymentReference)detailRows.push('<p>Payment reference: <strong class="wrap">'+esc(o.submittedPaymentReference)+'</strong></p>');
 if(o.requests)detailRows.push('<p>Special request: '+esc(o.requests)+'</p>');
 if(o.cancelReason)detailRows.push('<p>Cancellation: '+esc(o.cancelReason)+'. Contact Stone Grill about any funds already sent.</p>');
 const details=detailRows.length?'<details class="order-details"><summary>More order details</summary><div class="order-details-content">'+detailRows.join('')+'</div></details>':'';
 return `<article class="order ${archived?'archived-order':''}">
  <header class="order-head"><div class="order-identity"><small>ORDER ${esc(o.orderId||'')}</small><h3>${esc(type)} order</h3><span class="order-date">${esc(o.date)} · ${esc(o.time)}</span></div><div class="order-total"><span class="amount-label">TOTAL</span><strong class="order-amount">${money(o.subtotal)}</strong></div></header>
  <section class="order-menu" aria-label="Menu in this order"><h4>Items in this order</h4><ul>${items||'<li><span>Items unavailable</span></li>'}</ul></section>
  <section class="order-status ${o.status==='cancelled'?'closed':o.paymentStatus==='verified'&&['ready','preparing'].includes(o.status)?o.status:o.paymentStatus==='verified'&&o.status==='completed'?'closed':''}" aria-label="Order status and progress">
   <div class="status-heading"><div><small>${archived?'FINAL STATUS':'CURRENT STATUS'}</small><strong>${esc(status(o))}</strong><p>${esc(statusHelp(o))}</p></div>${needsPayment?'<a class="button pay-order-button" href="../?pay='+esc(o.id)+'">Continue payment</a>':''}${o.status==='ready'&&o.paymentStatus==='verified'&&!archived?'<button type="button" class="received-button" data-confirm-received="'+esc(o.id)+'">I received my order</button>':''}</div>
   ${progress(o)}
   ${o.status==='ready'&&o.paymentStatus==='verified'&&!archived?'<small class="received-hint">Tap after your food is handed to you.</small>':''}
  </section>
  <div class="order-footer">${details}</div>
 </article>`;
}
function render(){
 const rows=live.slice().sort((a,b)=>(b.createdAt?.toMillis?.()||0)-(a.createdAt?.toMillis?.()||0));
 const confirmed=submissionConfirmed?rows.find(o=>o.id===submittedId&&o.customerUid===auth.currentUser?.uid):null;
 const success=confirmed?'<section class="success-banner" aria-live="polite"><span class="success-icon" aria-hidden="true">✓</span><div><h2>Order submitted successfully</h2><p>Order '+esc(confirmed.orderId)+' is saved in My Orders below.</p><p>'+(confirmed.paymentStatus==='verified'?'Payment confirmed.':confirmed.submittedPaymentReference?'Payment reference saved · awaiting verification.':'Order received · check the status in this order.')+'</p></div></section>':'';
 const empty=history?'<div class="empty-state"><h3>No past orders yet</h3><p>Finished orders will appear here.</p></div>':'<div class="empty-state"><h3>No active orders</h3><p>Your current orders and their selected items will appear here.</p><a class="button" href="../?new=1">Browse menu & order</a></div>';
 $('orders').innerHTML=success+(rows.length?rows.map(o=>orderCard(o,history)).join(''):empty);
 if(!ordersLoaded)$('orders').innerHTML='<p class="empty-note" role="status">Loading your orders…</p>';
}
document.title=history?'Order history · Stone Grill':'My Orders · Stone Grill';
$('pageTitle').textContent=history?'Order history':'My Orders';
$('pageDescription').textContent=history?'Past orders, their items, and final status.':'Each order shows its selected items and its own live progress.';
$('ordersTitle').textContent=history?'Past orders':'Current orders';
$('historyLink').textContent=history?'Back to My Orders →':'Order history →';$('historyLink').href=history?'./':'?history=1';
function query(uid){
 return f.query(f.collection(db,'sgOrders'),f.where('customerUid','==',uid));
}
a.onAuthStateChanged(auth,async user=>{
 const rev=++revision;stop?.();stopProfile?.();ordersLoaded=false;live=[];updatePendingBadge([]);
 $('profileDetails').open=false;$('orders').innerHTML='';$('name').value='';$('mobile').value='';$('customerName').textContent='My profile';$('savedMobile').textContent='';$('email').textContent='';notice('');
 $('signedIn').hidden=!user;$('login').hidden=!!user;customerPushToken=null;pushButton.textContent='Enable payment alerts';
 if(!user){$('login').innerHTML=loginMarkup();wireLogin(notice);return;}
 $('email').textContent=user.email||'';
 try{await syncProfile();if(rev!==revision)return;
 stopProfile=f.onSnapshot(f.doc(db,'sgCustomers',user.uid),s=>{if(rev!==revision)return;const p=s.data();if(p){$('name').value=p.name||'';$('mobile').value=p.mobile||'';$('customerName').textContent=p.name||'My profile';$('savedMobile').textContent=p.mobile||'';}},e=>notice(e.message));
 stop=f.onSnapshot(query(user.uid),{includeMetadataChanges:true},s=>{
  if(rev!==revision)return;$('connection').textContent=s.metadata.fromCache?'Reconnecting — cached status':'Updated live';
  const all=s.docs.map(x=>({id:x.id,...x.data()}));updatePendingBadge(all);
  const active=all.filter(o=>['new','acknowledged','preparing','ready'].includes(o.status));
  const closed=all.filter(o=>['completed','cancelled'].includes(o.status)).sort((a,b)=>(b.createdAt?.toMillis?.()||0)-(a.createdAt?.toMillis?.()||0));
  ordersLoaded=true;confirmSubmission(all,s.metadata.fromCache);live=(history?closed:active).sort((a,b)=>(b.createdAt?.toMillis?.()||0)-(a.createdAt?.toMillis?.()||0));render();
 },e=>notice('Could not update orders: '+e.message));

 }catch(e){notice(e.message);}
});
$('profile').onsubmit=async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;try{await api(globalThis.SG_CUSTOMER_API,{action:'saveProfile',name:$('name').value,mobile:$('mobile').value});notice('Profile saved.');}catch(e){notice(e.message);}finally{b.disabled=false;}};
$('signOut').onclick=()=>a.signOut(auth);

$('orders').addEventListener('click',async e=>{
 const button=e.target.closest('[data-confirm-received]');if(!button||button.disabled)return;
 const order=live.find(o=>o.id===button.dataset.confirmReceived);
 if(!order||order.status!=='ready'){notice('Your order must be marked ready before you can confirm receipt.');return;}
 button.disabled=true;
 try{await api(globalThis.SG_CUSTOMER_API,{action:'confirmReceived',requestId:order.id});notice('Thank you. Your order is now in Order history.');}
 catch(error){notice(error.message||'Could not update this order. Please try again.');}
 finally{button.disabled=false;}
});

const pushButton=$('customerPush'),pushHint=$('pushHint');
async function enableCustomerPush(){
 if(!auth.currentUser)throw Error('Sign in to enable payment alerts.');
 if(!('Notification'in window)||!('serviceWorker'in navigator))throw Error('Phone alerts are not supported in this browser.');
 if(/iPhone|iPad|iPod/.test(navigator.userAgent)&&!(navigator.standalone||matchMedia('(display-mode: standalone)').matches))throw Error('On iPhone, add Stone Grill to the Home Screen and open it from there to enable alerts.');
 const permission=await Notification.requestPermission();
 if(permission!=='granted')throw Error('Allow notifications in your phone settings to receive payment alerts.');
 const {getMessaging,getToken,isSupported}=await import('https://www.gstatic.com/firebasejs/13.0.0/firebase-messaging.js');
 if(!await isSupported())throw Error('Firebase notifications are unavailable on this device.');
 const reg=await navigator.serviceWorker.register('../customer-messaging-sw.js',{scope:'./'});
 await navigator.serviceWorker.ready;
 const messaging=getMessaging(auth.app);
 const token=await getToken(messaging,{vapidKey:globalThis.SG_STAFF_CONFIG.vapidKey,serviceWorkerRegistration:reg});
 if(!token)throw Error('This device could not be registered for alerts.');
 await api(globalThis.SG_CUSTOMER_API,{action:'registerCustomerDevice',token});
 customerPushToken=token;
 pushButton.textContent='Payment alerts enabled';
 pushHint.textContent='You will receive a phone alert when Stone Grill verifies your payment.';
}
pushButton.onclick=async()=>{
 pushButton.disabled=true;
 try{await enableCustomerPush();}catch(e){pushHint.textContent=e.message;}finally{pushButton.disabled=false;}
};
