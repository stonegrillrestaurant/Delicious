'use strict';
(()=> {
 const el=id=>document.getElementById(id),pop=el('paymentPopup');let method='',busy=false;
 window.closeCheckout=()=>{pop.classList.add('hidden');pop.classList.remove('show');pop.setAttribute('aria-hidden','true');};
 async function copy(){try{await navigator.clipboard.writeText('09178366126');el('copyPaymentNumber').textContent='Number copied';}catch{el('receiptStatus').textContent='Copy the displayed number: 09178366126';}}
 function choose(value,copyNumber=false){method=value;el('qrPayment').hidden=value!=='qr';el('numberPayment').hidden=value!=='number';el('combinedCheckout').hidden=false;document.querySelectorAll('[data-method]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.method===value));});if(value==='number'&&copyNumber)copy();}
 window.openCheckout=draft=>{
  const p=draft.payload;el('payTotal').textContent='₱'+Number(p.subtotal).toLocaleString('en-PH',{minimumFractionDigits:2});
  el('checkoutSummary').textContent=p.orderType+' · '+p.date+' '+p.time+' · '+p.name;
  method='';el('qrPayment').hidden=el('numberPayment').hidden=el('combinedCheckout').hidden=true;
  el('paymentReference').value=draft.submittedPaymentReference||'';el('paymentReference').readOnly=!!draft.submitted;
  el('receiptStatus').textContent='';el('discardCheckout').hidden=!!draft.submitted||!!draft.legacy;
  el('resumeNotice').textContent=draft.submitted?'A submission was attempted. Retry the same details or check My Orders. Do not pay again.':'After transferring money, keep this order and submit its reference. Do not pay again if a network error occurs.';
  document.querySelectorAll('[data-method]').forEach(b=>{b.disabled=!!draft.submitted;b.setAttribute('aria-pressed','false');});
  if(draft.paymentMethod)choose(draft.paymentMethod);
  pop.classList.remove('hidden');pop.classList.add('show');pop.setAttribute('aria-hidden','false');pop.querySelector('.popup').scrollTop=0;
 };
 document.querySelectorAll('[data-method]').forEach(b=>b.onclick=()=>choose(b.dataset.method,true));
 el('copyPaymentNumber').onclick=copy;
 pop.querySelector('.popup-close').onclick=()=>{if(!busy)window.closeCheckout();};
 el('discardCheckout').onclick=()=>{const draft=window.pendingCheckout;if(!draft||draft.submitted)return;sessionStorage.removeItem('sgPrepaidAttempt:'+draft.uid);window.pendingCheckout=null;window.closeCheckout();};
 el('combinedCheckout').onsubmit=async e=>{e.preventDefault();if(busy||!method)return;const ref=el('paymentReference').value.trim().replace(/[ -]/g,'').toUpperCase();if(!/^[A-Z0-9]{3,80}$/.test(ref)){el('receiptStatus').textContent='Enter the transaction reference from your payment confirmation.';return;}busy=true;el('submitCombined').disabled=true;el('receiptStatus').textContent='Submitting order and payment…';try{await window.submitPrepaidOrder(method,el('paymentReference').value.trim());}catch(error){const correctable=error.status===400||(error.status===409&&error.message.startsWith('This payment reference has already been submitted.'));if(correctable){const draft=window.pendingCheckout;if(draft){draft.submitted=false;sessionStorage.setItem('sgPrepaidAttempt:'+draft.uid,JSON.stringify(draft));}el('paymentReference').readOnly=false;el('discardCheckout').hidden=false;document.querySelectorAll('[data-method]').forEach(b=>b.disabled=false);el('receiptStatus').textContent=error.status===400?'Order not saved: '+error.message+' Correct the details; do not transfer money again.':'That reference is already used. Correct a typo or contact us; do not pay again.';}else{el('receiptStatus').textContent=error.message+' Do not send another payment. Use Messenger or call for help.';el('paymentReference').readOnly=true;el('discardCheckout').hidden=true;document.querySelectorAll('[data-method]').forEach(b=>b.disabled=true);}}finally{busy=false;el('submitCombined').disabled=false;}};
})();
