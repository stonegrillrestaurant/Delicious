'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {phoneIsValid,paymentWasJustVerified,confirmationMessage,safeProviderMessage,createPaymentSmsNotifier}=require('./payment-sms');

function fakeDb(){
 const data=new Map();
 const ref=(path)=>({path});
 const db={data,collection:name=>({doc:id=>ref(`${name}/${id}`)}),runTransaction:async fn=>fn({
  get:async r=>({exists:data.has(r.path),data:()=>data.get(r.path)}),
  create:(r,value)=>{if(data.has(r.path))throw Error('already exists');data.set(r.path,{...value});},
  update:(r,value)=>{if(!data.has(r.path))data.set(r.path,{});data.set(r.path,{...data.get(r.path),...value});}
 })};
 return db;
}
function event(db,before,after){
 const requestId='a'.repeat(32),path=`sgOrders/${requestId}`;
 db.data.set(path,{...after});
 return {params:{requestId},data:{before:{data:()=>before},after:{data:()=>after,ref:{path}}}};
}

test('accepts Philippines E.164 customer mobiles only',()=>{
 assert.equal(phoneIsValid('+639178366126'),true);
 assert.equal(phoneIsValid('09178366126'),false);
 assert.equal(phoneIsValid('+639123'),false);
});
test('only a transition into verified payment triggers the confirmation',()=>{
 assert.equal(paymentWasJustVerified({paymentStatus:'pending_verification'},{paymentStatus:'verified'}),true);
 assert.equal(paymentWasJustVerified({paymentStatus:'verified'},{paymentStatus:'verified'}),false);
 assert.equal(paymentWasJustVerified({paymentStatus:'pending_verification'},{paymentStatus:'pending_verification'}),false);
});
test('message greets the customer by name and omits internal order references',()=>{
 const message=confirmationMessage({name:'Jamie Santos',orderId:'SG-123',status:'preparing'},'private-request-123');
 assert.match(message,/^Hi Jamie,/);
 assert.match(message,/payment/i);
 assert.match(message,/getting your order ready now/i);
 assert.match(message,/My Orders/);
 assert.doesNotMatch(message,/SG-123|private-request-123/);
 assert.match(confirmationMessage({status:'preparing'},'private-request-456'),/^Hi there,/);
});
test('message waits for table confirmation before promising cooking',()=>{
 const message=confirmationMessage({name:'Jamie Santos',orderId:'SG-124',status:'acknowledged',orderType:'Reservation'},'private-request-124');
 assert.match(message,/^Hi Jamie,/);
 assert.match(message,/confirming your table before we start cooking/i);
 assert.doesNotMatch(message,/SG-124|private-request-124/);
});
test('provider diagnostics are bounded and remove control characters',()=>{
 assert.equal(safeProviderMessage({error:'Gateway is offline\nretry later'}),'Gateway is offline retry later');
 assert.equal(safeProviderMessage({message:'x'.repeat(300)}).length,220);
});
test('queues one SMS to the saved customer mobile and records TextBee batch ID',async()=>{
 const db=fakeDb(),before={paymentStatus:'pending_verification'},after={paymentStatus:'verified',name:'Sam Cruz',mobile:'+639178366126',orderId:'SG-TEST'};
 const e=event(db,before,after),calls=[];
 const notify=createPaymentSmsNotifier({db,apiKey:()=> 'server-secret',deviceId:'device-id',Timestamp:{now:()=>new Date(0)},fetchImpl:async(url,options)=>{calls.push({url,options});return {ok:true,status:200,json:async()=>({data:{success:true,smsBatchId:'batch-1'}})};}});
 await notify(e);await notify(e);
 assert.equal(calls.length,1);
 assert.deepEqual(JSON.parse(calls[0].options.body).recipients,['+639178366126']);
 const message=JSON.parse(calls[0].options.body).message;assert.match(message,/^Hi Sam,/);assert.doesNotMatch(message,/SG-TEST|aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/);
 assert.equal(calls[0].options.headers['x-api-key'],'server-secret');
 assert.equal(db.data.get(`sgPaymentSms/${e.params.requestId}`).status,'queued');
 assert.equal(db.data.get(`sgOrders/${e.params.requestId}`).smsConfirmationStatus,'queued');
 assert.equal(db.data.get(`sgOrders/${e.params.requestId}`).smsConfirmationBatchId,'batch-1');
});
test('records a failed send without changing the already verified payment',async()=>{
 const db=fakeDb(),before={paymentStatus:'pending_verification'},after={paymentStatus:'verified',mobile:'+639178366126'};
 const e=event(db,before,after),notify=createPaymentSmsNotifier({db,apiKey:()=> 'secret',deviceId:'device-id',Timestamp:{now:()=>new Date(0)},fetchImpl:async()=>({ok:false,status:401,json:async()=>({})})});
 await notify(e);
 assert.equal(db.data.get(`sgPaymentSms/${e.params.requestId}`).status,'failed');
 assert.equal(db.data.get(`sgOrders/${e.params.requestId}`).paymentStatus,'verified');
 assert.equal(db.data.get(`sgOrders/${e.params.requestId}`).smsConfirmationStatus,'failed');
 assert.equal(db.data.get(`sgOrders/${e.params.requestId}`).smsConfirmationError,'TextBee rejected the send request.');
});
