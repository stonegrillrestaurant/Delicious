
import {auth,a,f,db,esc,api,syncProfile,loginMarkup,wireLogin} from '../customer-auth.js?v=localpersist1';
const $=id=>document.getElementById(id),money=n=>'₱'+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2});
const history=new URLSearchParams(location.search).has('history');
let stop,stopProfile,stopRole,stopLatest,lastOrder=null,ordersLoaded=false,live=[],older=[],cursor=null,revision=0;
const notice=s=>{$('notice').textContent=s;$('notice').hidden=!s;};
const submittedId=new URLSearchParams(location.search).get('submitted');
function confirmSubmission(rows,fromCache){if(!fromCache&&submittedId&&rows.some(o=>o.id===submittedId&&o.customerUid===auth.currentUser?.uid)){const u=new URL(location.href);u.searchParams.delete('submitted');window.history.replaceState(null,'',u);}}
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
  {title:'Finished cooking',done:cooked,detail:cooked?(o.orderType==='Take-out'?'Ready for pickup':'Ready to serve'):o.status==='preparing'?'Kitchen is cooking your order':paid?(tablePending?'Waiting for table confirmation':'Waiting for the kitchen to prepare your food'):'Starts after payment confirmation'},
  {title:o.orderType==='Take-out'?'Ready for pickup':'Ready to serve',done:finished,detail:finished?'Transaction finished':o.status==='ready'?(o.orderType==='Take-out'?'Please collect your order at Stone Grill':'Your food is ready to serve'):'Waiting for pickup or serving'}
 ];
 const current=cancelled||finished?-1:!paid?1:!cooked?2:3;
 return '<div class="order-progress"><h4>Order progress</h4><ol class="progress-list" aria-label="Order process">'+steps.map((step,i)=>{const state=step.done?'done':current===i?'current':'pending';return '<li class="progress-step '+state+'"'+(state==='current'?' aria-current="step"':'')+'><span class="progress-mark" aria-hidden="true">'+(step.done?'✓':i+1)+'</span><div><strong>'+esc(step.title)+'</strong><span class="progress-state">'+(step.done?(i===1?'PAID · verified':'Completed'):state==='current'?'Current step':cancelled?'Not completed':'Upcoming')+'</span><p class="sr-only">'+esc(step.detail)+'</p></div></li>';}).join('')+'</ol>'+(cancelled?'<p class="progress-stopped">Order cancelled · progress stopped. Contact us about any payment already sent.</p>':'<p class="progress-key">'+(current>=0?'Checks show completed steps. '+esc(steps[current].detail):'All steps completed. Thank you for choosing Stone Grill.')+'</p>')+'</div>';
}
function orderCard(o,archived=false){return `<article class="order ${archived?'archived-order':''}"><div class="order-head"><div><small>${esc(o.orderType==='Take-out'?'TAKEOUT / PICKUP':o.orderType==='Reservation'?'ADVANCE RESERVATION':'DINE IN')}</small><h3>${archived?'Your last order':'Your food order'}</h3><div class="ref">${esc(o.orderId)}</div></div><div><span class="amount-label">ORDER TOTAL</span><strong class="order-amount">${money(o.subtotal)}</strong></div></div><div class="order-status ${['ready','preparing'].includes(o.status)?o.status:['completed','cancelled'].includes(o.status)?'closed':''}"><small>${archived?'PAST ORDER STATUS':'CURRENT ORDER STATUS'}</small><strong>${esc(status(o))}</strong><p>${esc(statusHelp(o))}</p></div><div class="order-body">${progress(o)}<details class="order-details"${o.id===submittedId?" open":""}><summary>Order details · ${esc((o.items||[]).reduce((n,i)=>n+Number(i.qty||0),0))} items</summary><div class="order-details-content"><div class="status-facts"><div class="fact"><span>Payment status</span><strong>${o.paymentStatus==='verified'?'Paid · verified':o.submittedPaymentReference?'Reference received · verification pending':'Waiting for payment'}</strong></div><div class="fact"><span>Requested ${o.orderType==='Take-out'?'pickup':'visit'}</span><strong>${esc(o.date)} · ${esc(o.time)}</strong><span>Philippine time · subject to confirmation</span></div></div><p>${o.paymentMethod==='qr'?'QR payment · authorized payment reviewer verifies':o.paymentMethod==='number'?'GCash number · owner verifies':'Payment method not recorded'}${o.submittedPaymentReference?' · Reference: <strong class="wrap">'+esc(o.submittedPaymentReference)+'</strong>':''}</p>${['Dine-in','Reservation'].includes(o.orderType)?'<p>Table: <strong>'+(o.reservationStatus==='confirmed'?'Confirmed':'Awaiting availability confirmation')+'</strong> · '+esc(o.persons)+' guests</p>':''}${o.seenAt||o.acknowledgedAt?'<p class="seen-note">Seen by Stone Grill · '+esc(time(o.seenAt||o.acknowledgedAt))+'. This only means staff opened your order.</p>':''}<div class="order-items"><strong>Your items</strong><ul>${o.items.map(i=>`<li>${esc(i.qty)} × ${esc(i.name)} — ${money(i.price*i.qty)}</li>`).join('')}</ul>${o.requests?'<p>Requests: '+esc(o.requests)+'</p>':''}</div>${o.cancelReason?'<p>Reason: '+esc(o.cancelReason)+'. Contact Stone Grill about any funds already sent.</p>':''}${!['completed','cancelled'].includes(o.status)&&o.paymentStatus!=='verified'&&!o.submittedPaymentReference?'<a class="button" href="../?pay='+esc(o.id)+'">Pay this order</a>':''}</div></details></div></article>`;}
function render(){
 const rows=[...new Map([...older,...live].map(o=>[o.id,o])).values()].sort((a,b)=>(b.createdAt?.toMillis?.()||0)-(a.createdAt?.toMillis?.()||0));
 $('orders').innerHTML=rows.map(o=>orderCard(o)).join('')||(history?'<div class="empty-state"><h3>No past orders yet</h3><p>Completed orders will be saved here.</p></div>':'<div class="empty-state"><h3>No active orders</h3><p>Your latest finished order is shown below when available.</p><a class="button" href="../?new=1">Browse menu & order</a></div>');
 const showLast=!history&&ordersLoaded&&!rows.length&&lastOrder;
 if(!ordersLoaded)$('orders').innerHTML='<p class="empty-note" role="status">Loading your orders…</p>';
 if(showLast)$('orders').innerHTML='<p class="empty-note">No active orders. Your last order is kept below.</p>';
 $('latestOrder').hidden=!showLast;$('latestOrder').innerHTML=showLast?orderCard(lastOrder,true):'';
 if(ordersLoaded&&!history&&!rows.length&&!lastOrder)$('orders').querySelector('.empty-state p').textContent='Place an order to start tracking it here. Past orders are in Order history.';
}
$('ordersTitle').textContent=history?'Order history':'Your order';
$('historyLink').textContent=history?'Back to current orders →':'View order history →';$('historyLink').href=history?'./':'?history=1';
function query(uid){
 return f.query(f.collection(db,'sgOrders'),f.where('customerUid','==',uid));
}
a.onAuthStateChanged(auth,async user=>{
 const rev=++revision;stop?.();stopProfile?.();stopRole?.();stopLatest?.();lastOrder=null;ordersLoaded=false;live=[];older=[];cursor=null;previous=new Map();initial=true;
 $('latestOrder').hidden=true;$('latestOrder').innerHTML='';$('profileDetails').open=false;$('orders').innerHTML='';$('name').value='';$('mobile').value='';$('customerName').textContent='My profile';$('savedMobile').textContent='';$('email').textContent='';notice('');
 $('more').hidden=true;$('signedIn').hidden=!user;$('login').hidden=!!user;$('staffLink').hidden=true;
 if(!user){$('login').innerHTML=loginMarkup();wireLogin(notice);return;}
 $('email').textContent=user.email||'';
 try{await syncProfile();if(rev!==revision)return;
 stopProfile=f.onSnapshot(f.doc(db,'sgCustomers',user.uid),s=>{if(rev!==revision)return;const p=s.data();if(p){$('name').value=p.name||'';$('mobile').value=p.mobile||'';$('customerName').textContent=p.name||'My profile';$('savedMobile').textContent=p.mobile||'';}},e=>notice(e.message));
 stopRole=f.onSnapshot(f.doc(db,'sgStaff',user.uid),s=>{if(rev!==revision)return;$('staffLink').hidden=!(s.data()?.active&&['owner','admin','cashier','staff'].includes(s.data()?.role));});
 stop=f.onSnapshot(query(user.uid),{includeMetadataChanges:true},s=>{
  if(rev!==revision)return;$('connection').textContent=s.metadata.fromCache?'Reconnecting — cached status':'Updated live';
  const all=s.docs.map(x=>({id:x.id,...x.data()}));
  const active=all.filter(o=>['new','acknowledged','preparing','ready'].includes(o.status));
  const closed=all.filter(o=>['completed','cancelled'].includes(o.status)).sort((a,b)=>(b.createdAt?.toMillis?.()||0)-(a.createdAt?.toMillis?.()||0));
  ordersLoaded=true;confirmSubmission(all,s.metadata.fromCache);live=(history?closed:active).sort((a,b)=>(b.createdAt?.toMillis?.()||0)-(a.createdAt?.toMillis?.()||0));lastOrder=history?null:closed[0]||null;older=[];cursor=null;$('more').hidden=true;render();
 },e=>notice('Could not update orders: '+e.message));

 }catch(e){notice(e.message);}
});
$('profile').onsubmit=async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;try{await api(globalThis.SG_CUSTOMER_API,{action:'saveProfile',name:$('name').value,mobile:$('mobile').value});notice('Profile saved.');}catch(e){notice(e.message);}finally{b.disabled=false;}};
$('signOut').onclick=()=>a.signOut(auth);
$('more').onclick=async()=>{if(!cursor||!auth.currentUser)return;const rev=revision;$('more').disabled=true;try{const s=await f.getDocs(query(auth.currentUser.uid,cursor));if(rev!==revision)return;older.push(...s.docs.map(d=>({id:d.id,...d.data()})));cursor=s.docs.at(-1)||cursor;$('more').hidden=s.size<30;render();}catch(e){notice(e.message);}finally{$('more').disabled=false;}};
