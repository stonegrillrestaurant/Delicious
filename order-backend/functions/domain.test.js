const {test}=require('node:test'),assert=require('node:assert/strict'),d=require('./domain'),menu=require('./menu.json');
const item=Object.values(menu.data).flat()[0];
const valid=()=>({requestId:'a'.repeat(32),receiptKey:'b'.repeat(64),name:'Test',mobile:'+639171234567',orderType:'Take-out',date:'2026-10-12',time:'12:30',items:[{...item,qty:2}],subtotal:item.price*2});
test('server catalog validates total',()=>{assert.equal(d.order(valid(),menu).subtotal,item.price*2);assert.throws(()=>d.order({...valid(),subtotal:1},menu));});
test('tampered price and duplicate menu lines rejected',()=>{assert.throws(()=>d.order({...valid(),items:[{...item,price:1,qty:2}]},menu));assert.throws(()=>d.order({...valid(),items:[{...item,qty:1},{...item,qty:1}]},menu));});
test('invalid dates and capability rejected',()=>{assert.throws(()=>d.order({...valid(),date:'2026-02-30'},menu));assert.throws(()=>d.order({...valid(),receiptKey:'guess'},menu));});
test('receipts require supported content',()=>{assert.throws(()=>d.receipt({...valid(),data:Buffer.from('<html>bad</html>').toString('base64')}));assert.equal(d.receipt({...valid(),data:Buffer.from('%PDF-1.4 sample').toString('base64')}).ext,'pdf');});
test('inactive or unrecognized profiles denied',()=>{assert.equal(d.isStaff({active:true,role:'intruder'}),false);assert.equal(d.isStaff({active:false,role:'admin'}),false);assert.equal(d.isStaff({active:true,role:'staff'}),true);});
test('staff cannot verify or cancel',()=>{for(const action of ['verifyPayment','cancel'])assert.throws(()=>d.transition({status:'new'},action,'staff','reference'),e=>e.status===403);});
test('payment gate and status sequence',()=>{let o={status:'new',paymentStatus:'pending_verification',paymentMethod:'qr',submittedPaymentReference:'TEST001'};assert.throws(()=>d.transition(o,'prepare','staff'));Object.assign(o,d.transition(o,'verifyPayment','cashier','GCash verified'));for(const action of ['acknowledge','prepare','ready','complete'])Object.assign(o,d.transition(o,action,'staff'));assert.equal(o.status,'completed');assert.throws(()=>d.transition(o,'cancel','admin','test'));});

test('payment reference rejects markup and invalid mobile',()=>{assert.throws(()=>d.payment({paymentMobile:'123',submittedPaymentReference:'abc'}));assert.throws(()=>d.payment({paymentMobile:'09171234567',submittedPaymentReference:'<script>'}));});
