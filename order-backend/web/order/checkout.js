'use strict';
(()=> {
 const el=id=>document.getElementById(id),pop=el('paymentPopup');let method='qr',busy=false;
 window.closeCheckout=()=>{pop.classList.add('hidden');pop.classList.remove('show');pop.setAttribute('aria-hidden','true');};
 function choose(value){method=value;const radio=document.querySelector('input[name="paymentMethod"][value="'+value+'"]');if(radio)radio.checked=true;}
 async function copy(){choose('number');try{await navigator.clipboard.writeText('09178366126');el('copyPaymentNumber').textContent='Number copied';}catch{el('receiptStatus').textContent='Copy the displayed number: 09178366126';}}
 window.openCheckout=draft=>{
  const p=draft.payload;el('payTotal').textContent='₱'+Number(p.subtotal).toLocaleString('en-PH',{minimumFractionDigits:2});
  el('checkoutSummary').textContent=p.orderType+' · '+p.date+' '+p.time+' · '+p.name;
  method=draft.paymentMethod||'qr';choose(method);
  el('paymentReference').value=draft.submittedPaymentReference||'';el('paymentReference').readOnly=!!draft.submitted;
  el('receiptStatus').textContent='';el('discardCheckout').hidden=!!draft.submitted||!!draft.legacy;
  el('resumeNotice').textContent=draft.submitted?'A submission was attempted. Check My Orders before paying again. If it is not there, retry using the same reference.':'After transferring money, enter the reference from your GCash confirmation and submit once.';
  document.querySelectorAll('input[name="paymentMethod"]').forEach(r=>{r.disabled=!!draft.submitted;});
  el('copyPaymentNumber').textContent='Copy number';
  pop.classList.remove('hidden');pop.classList.add('show');pop.setAttribute('aria-hidden','false');pop.querySelector('.popup').scrollTop=0;
 };
 el('copyPaymentNumber').onclick=copy;
 pop.querySelector('.popup-close').onclick=()=>{if(!busy)window.closeCheckout();};
 el('combinedCheckout').onsubmit=()=>{const draft=window.pendingCheckout;if(!draft||draft.submitted)return;sessionStorage.removeItem('sgPrepaidAttempt:'+draft.uid);window.pendingCheckout=null;window.closeCheckout();};
 el('combinedCheckout').onsubmit=async e=>{e.preventDefault();if(busy)return;method=document.querySelector('input[name="paymentMethod"]:checked')?.value||'qr';const ref=el('paymentReference').value.trim().replace(/[ -]/g,'').toUpperCase();if(!/^[A-Z0-9]{3,80}$/.test(ref)){el('receiptStatus').textContent='Enter the transaction reference from your payment confirmation.';el('paymentReference').focus();return;}busy=true;el('submitCombined').disabled=true;el('receiptStatus').textContent='Submitting order and payment…';try{await window.submitPrepaidOrder(method,el('paymentReference').value.trim());}catch(error){el('receiptStatus').textContent=error.message+' Do not send another payment. Use Messenger or call for help.';el('paymentReference').readOnly=true;el('discardCheckout').hidden=true;document.querySelectorAll('[data-method]').forEach(b=>b.disabled=true);}finally{busy=false;el('submitCombined').disabled=false;}};
})();
