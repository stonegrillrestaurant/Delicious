
import {auth,a,f,db,esc,api,syncProfile,loginMarkup,wireLogin} from '../customer-auth.js?v=accountchooser1';
const $=id=>document.getElementById(id),money=n=>'₱'+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2});
const history=new URLSearchParams(location.search).has('history');
let stop,stopProfile,ordersLoaded=false,live=[],revision=0;
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
function status(o){
 if(o.status==='cancelled')return 'Cancelled';
 if(o.status==='completed')return 'Completed — claimed / served';
 if(o.status==='ready')return o.orderType==='Take-out'?'Ready for pickup':'Ready to serve';
 if(o.status==='preparing')return 'Preparing — kitchen is cooking';
 if(o.paymentStatus==='verified')return ['Dine-in','Reservation'].includes(o.orderType)&&o.reservationStatus!=='confirmed'?'Paid — table confirmation pending':'Paid — waiting for preparation';
 return o.submittedPaymentReference?'Payment submitted — verification pending':'Waiting for payment';
}
function statusHelp(o){
 if(o.status==='cancelled')return 'This order will not be prepared. Contact us about any payment already sent.';
 if(o.status==='completed')return 'Your order has been claimed or served. Thank you for choosing Stone Grill.';
 if(o.status==='ready')return o.orderType==='Take-out'?'Your food is ready. Please collect it at Stone Grill.':'Your food is ready to be served at Stone Grill.';
 if(o.status==='preparing')return 'Payment is verified and the kitchen is preparing your food. Please wait for the ready status.';
 if(o.paymentStatus==='verified')return ['Dine-in','Reservation'].includes(o.orderType)&&o.reservationStatus!=='confirmed'?'Your payment is verified. We still need to confirm table availability.':'Your payment is verified. Cooking has not started yet.';
 return o.submittedPaymentReference?'We will check that your payment was received. Please do not pay again. Cooking has not started yet.':'Payment details are needed before the order can proceed.';
}
function progress(o){
 const cancelled=o.status==='cancelled',paid=o.paymentStatus==='verified',cooked=['ready','completed'].includes(o.status),finished=o.status==='completed';
 const tablePending=['Dine-in','Reservation'].includes(o.orderType)&&o.reservationStatus!=='confirmed';
 const steps=[
  {title:'Order received',done:true,detail:'Your order is saved with Stone Grill.'},
  {title:'Payment confirmed',done:paid,detail:paid?(o.paymentMethod==='qr'?'QR payment confirmed':o.paymentMethod==='number'?'GCash number payment confirmed':'Payment confirmed'):o.submittedPaymentReference?'Awaiting verification of your payment':'Waiting for payment details'},
  {title:cooked?'Finished cooking':'Processing order',done:cooked,detail:cooked?(o.orderType==='Take-out'?'Ready for pickup':'Ready to serve'):o.status==='preparing'?'Kitchen is cooking your order':paid?(tablePending?'Waiting for table confirmation':'Waiting for the kitchen to prepare your food'):'Starts after payment confirmation'},
  {title:o.orderType==='Take-out'?'Ready for pickup':'Ready to serve',done:finished,detail:finished?'Transaction finished':o.status==='ready'?(o.orderType==='Take-out'?'Please collect your order at Stone Grill':'Your food is ready to serve'):'Waiting for pickup or serving'}
 ];
 const current=cancelled||finished?-1:!paid?1:!cooked?2:3;
 return '<div class="order-progress"><h4>Order progress</h4><ol class="progress-list" aria-label="Order process">'+steps.map((step,i)=>{const state=step.done?'done':current===i?'current':'pending';return '<li class="progress-step '+state+'"'+(state==='current'?' aria-current="step"':'')+'><span class="progress-mark" aria-hidden="true">'+(step.done?'✓':i+1)+'</span><div><strong>'+esc(step.title)+'</strong><span class="progress-state">'+(step.done?(i===1?'PAID · verified':'Completed'):state==='current'?'Current step':cancelled?'Not completed':'Upcoming')+'</span><p class="sr-only">'+esc(step.detail)+'</p></div></li>';}).join('')+'</ol>'+(cancelled?'<p class="progress-stopped">Order cancelled · progress stopped. Contact us about any payment already sent.</p>':'<p class="progress-key">'+(current>=0?'Checks show completed steps. '+esc(steps[current].detail):'All steps completed. Thank you for choosing Stone Grill.')+'</p>')+'</div>';
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
  <section class="order-status ${['ready','preparing'].includes(o.status)?o.status:['completed','cancelled'].includes(o.status)?'closed':''}" aria-label="Order status and progress">
   <div class="status-heading"><div><small>${archived?'FINAL STATUS':'CURRENT STATUS'}</small><strong>${esc(status(o))}</strong><p>${esc(statusHelp(o))}</p></div>${needsPayment?'<a class="button pay-order-button" href="../?pay='+esc(o.id)+'">Continue payment</a>':''}${o.status==='ready'&&!archived?'<button type="button" class="received-button" data-confirm-received="'+esc(o.id)+'">I received my order</button>':''}</div>
   ${progress(o)}
   ${o.status==='ready'&&!archived?'<small class="received-hint">Tap after your food is handed to you.</small>':''}
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
 const rev=++revision;stop?.();stopProfile?.();ordersLoaded=false;live=[];
 $('profileDetails').open=false;$('orders').innerHTML='';$('name').value='';$('mobile').value='';$('customerName').textContent='My profile';$('savedMobile').textContent='';$('email').textContent='';notice('');
 $('signedIn').hidden=!user;$('login').hidden=!!user;
 if(!user){$('login').innerHTML=loginMarkup();wireLogin(notice);return;}
 $('email').textContent=user.email||'';
 try{await syncProfile();if(rev!==revision)return;
 stopProfile=f.onSnapshot(f.doc(db,'sgCustomers',user.uid),s=>{if(rev!==revision)return;const p=s.data();if(p){$('name').value=p.name||'';$('mobile').value=p.mobile||'';$('customerName').textContent=p.name||'My profile';$('savedMobile').textContent=p.mobile||'';}},e=>notice(e.message));
 stop=f.onSnapshot(query(user.uid),{includeMetadataChanges:true},s=>{
  if(rev!==revision)return;$('connection').textContent=s.metadata.fromCache?'Reconnecting — cached status':'Updated live';
  const all=s.docs.map(x=>({id:x.id,...x.data()}));
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
