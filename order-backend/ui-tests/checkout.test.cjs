const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'../public'),tick=()=>new Promise(r=>setImmediate(r));
function setup(){
 const dom=new JSDOM(fs.readFileSync(root+'/order/index.html','utf8'),{url:'https://stone-grill-orders-test.web.app/order/',runScripts:'outside-only'}),w=dom.window,d=w.document;
 for(const [id,value] of Object.entries({fullName:'Test',mobileNumber:'+639171234567',persons:'1',orderDate:'2030-10-12',orderTime:'12:30'}))d.getElementById(id).value=value;
 d.querySelector('[name=orderType][value="Take-out"]').checked=true;
 const main=fs.readFileSync(root+'/order/main.js','utf8');
 w.eval("const $=s=>document.querySelector(s);let cart=[{name:'Food',qty:1,price:100}];function cartSubtotal(){return 100;}function normalizeMobile(){}function clearCart(){}function showToast(s){window.lastToast=s;}"+main.slice(main.indexOf('function randomHex'),main.indexOf('/* ---- How to Order')));
 w.eval(fs.readFileSync(root+'/order/checkout.js','utf8'));
 w.SG_AUTH={auth:{currentUser:{uid:'u'}},getToken:async()=> 'token'};w.APP={ORDER_API_URL:'https://example.invalid'};
 return {dom,w,d,event:{preventDefault(){},currentTarget:d.getElementById('orderForm')}};
}
test('review only requests a quote; QR/number choices display one method and bold total without upload',async()=>{
 const {dom,w,d,event}=setup(),calls=[];
 assert(d.getElementById('checkoutBtn').closest('.cart-totals'));assert.equal(d.getElementById('submissionSuccess'),null);
 assert.equal(d.querySelector('.order-steps'),null);assert.equal(d.querySelector('.ordering-welcome'),null);assert(d.querySelector('.menu-heading').textContent.includes('Choose your food'));assert(d.querySelector('#payTitle').textContent.includes('Step 3'));assert(d.querySelector('#orderForm button[type=submit]').textContent.includes('Continue to payment'));
 w.fetch=async(_,r)=>{const b=JSON.parse(r.body);calls.push(b);return {ok:true,json:async()=>({ok:true,order:b})};};
 await w.handleSubmit(event);
 assert.deepEqual(calls.map(c=>c.action),['quote']);
 assert(d.getElementById('payTotal').textContent.includes('100'));
 assert.equal(d.getElementById('payTotal').tagName,'STRONG');
 assert.equal(d.getElementById('combinedCheckout').hidden,true);
 d.querySelector('[data-method=qr]').click();assert.equal(d.getElementById('qrPayment').hidden,false);assert.equal(d.getElementById('numberPayment').hidden,true);
 d.querySelector('[data-method=number]').click();assert.equal(d.getElementById('qrPayment').hidden,true);assert.equal(d.getElementById('numberPayment').hidden,false);
 assert.equal(d.querySelectorAll('input[type=file]').length,0);dom.window.close();
});
test('Continue resumes payment after sign-in or focuses the first missing required detail',()=>{const {dom,w,d}=setup();let opens=0,submits=0;const fake=d.createElement('button');fake.id='googleSignIn';fake.onclick=()=>opens++;d.body.append(fake);w.SG_AUTH.auth.currentUser=null;w.continueCheckout();assert.equal(opens,1);assert(w.sessionStorage.getItem('sgCheckoutIntent'));assert.equal(w.sessionStorage.getItem('sgContinueAfterLogin'),'1');const form=d.getElementById('orderForm');form.requestSubmit=()=>submits++;w.SG_AUTH.auth.currentUser={uid:'u'};w.resumeCheckoutAfterSignIn();assert.equal(submits,1);d.getElementById('fullName').value='';w.resumeCheckoutAfterSignIn();assert.equal(submits,1);assert.equal(d.activeElement.id,'fullName');assert.equal(w.lastToast,'Please complete the required details to continue to payment.');dom.window.close();});
test('combined submit blocks double click and retries original reference after uncertain network failure',async()=>{
 const {dom,w,d,event}=setup(),calls=[];let reject;
 w.fetch=async(_,r)=>{const b=JSON.parse(r.body);calls.push(b);if(b.action==='quote')return {ok:true,json:async()=>({ok:true,order:b})};return new Promise((_,no)=>reject=no);};
 await w.handleSubmit(event);d.querySelector('[data-method=qr]').click();d.getElementById('paymentReference').value='ABC123';
 const form=d.getElementById('combinedCheckout');
 form.dispatchEvent(new w.Event('submit',{cancelable:true}));form.dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();
 assert.equal(calls.filter(c=>c.action==='order').length,1);reject(Error('Network lost'));await tick();
 assert(d.getElementById('receiptStatus').textContent.includes('Do not send another payment'));
 assert.equal(d.getElementById('paymentReference').readOnly,true);
 const original=calls.at(-1);let retried;
 w.fetch=async(_,r)=>{retried=JSON.parse(r.body);throw Error('Still offline');};
 d.getElementById('paymentReference').value='CHANGED';
 form.dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();
 assert.equal(retried.requestId,original.requestId);assert.equal(retried.submittedPaymentReference,'ABC123');
 dom.window.close();
});
test('pre-commit payment validation lets customers correct a reference on the same order',async()=>{
 const {dom,w,d,event}=setup(),rejections=[{status:400,error:'Enter a valid payment transaction reference'},{status:409,error:'This payment reference has already been submitted. Check My Orders or contact Stone Grill; do not pay again.'}];
 w.fetch=async(_,r)=>{const body=JSON.parse(r.body);if(body.action==='quote')return {ok:true,json:async()=>({ok:true,order:body})};const result=rejections.shift();return {ok:false,status:result.status,json:async()=>({ok:false,error:result.error})};};
 await w.handleSubmit(event);d.querySelector('[data-method=qr]').click();const input=d.getElementById('paymentReference'),form=d.getElementById('combinedCheckout');
 const attempt=async reference=>{input.value=reference;form.dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();};
 await attempt('ABC123');assert.equal(input.readOnly,false);assert.equal(d.getElementById('discardCheckout').hidden,false);assert.equal(d.querySelector('[data-method=qr]').disabled,false);assert(d.getElementById('receiptStatus').textContent.includes('Order not saved'));
 const draft=JSON.parse(w.sessionStorage.getItem('sgPrepaidAttempt:u'));assert.equal(draft.submitted,false);
 await attempt('ABC123');assert.equal(input.readOnly,false);assert.equal(d.getElementById('discardCheckout').hidden,false);assert(d.getElementById('receiptStatus').textContent.includes('That reference is already used'));assert.equal(JSON.parse(w.sessionStorage.getItem('sgPrepaidAttempt:u')).submitted,false);
 dom.window.close();
});
test('auth account changes cannot submit another customer saved checkout',async()=>{
 const {dom,w,event}=setup();w.fetch=async(_,r)=>({ok:true,json:async()=>({ok:true,order:JSON.parse(r.body)})});
 await w.handleSubmit(event);w.SG_AUTH.auth.currentUser={uid:'different'};
 await assert.rejects(w.submitPrepaidOrder('qr','ABC123'),/account/);dom.window.close();
});
