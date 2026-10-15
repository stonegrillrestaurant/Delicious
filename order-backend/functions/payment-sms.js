'use strict';

const API_URL='https://api.textbee.dev/api/v1/gateway/send-sms';
const phoneIsValid=phone=>/^\+639\d{9}$/.test(String(phone||''));
const paymentWasJustVerified=(before,after)=>before?.paymentStatus!=='verified'&&after?.paymentStatus==='verified';
function confirmationMessage(order,requestId){
 const id=String(order.orderId||`SG-${requestId}`).slice(0,48);
 return `Stone Grill: Payment received and successfully verified for order ${id}. Check My Orders for updates. Thank you!`;
}

function createPaymentSmsNotifier({db,apiKey,deviceId,Timestamp,fetchImpl=global.fetch}){
 return async event=>{
  const change=event.data;if(!change)return;
  const before=change.before.data(),order=change.after.data(),requestId=event.params.requestId;
  if(!paymentWasJustVerified(before,order))return;

  const receiptRef=db.collection('sgPaymentSms').doc(requestId);
  const claim=await db.runTransaction(async tx=>{
   const existing=await tx.get(receiptRef);
   if(existing.exists)return false;
   tx.create(receiptRef,{requestId,orderId:order.orderId||`SG-${requestId}`,status:'sending',createdAt:Timestamp.now()});
   return true;
  });
  if(!claim)return;

  const finish=async(status,extra={})=>db.runTransaction(async tx=>{
   const saved=await tx.get(receiptRef);if(!saved.exists||saved.data().status!=='sending')return;
   tx.update(receiptRef,{status,updatedAt:Timestamp.now(),...extra});
   tx.update(change.after.ref,{smsConfirmationStatus:status,smsConfirmationUpdatedAt:Timestamp.now(),...(extra.smsBatchId?{smsConfirmationBatchId:extra.smsBatchId}:{})});
  });

  if(!phoneIsValid(order.mobile)){
   await finish('failed',{failureCode:'invalid_mobile'});return;
  }
  try{
   const response=await fetchImpl(API_URL,{method:'POST',headers:{'content-type':'application/json','x-api-key':apiKey()},body:JSON.stringify({deviceId:typeof deviceId==='function'?deviceId():deviceId,recipients:[order.mobile],message:confirmationMessage(order,requestId)})});
   let body={};try{body=await response.json();}catch{}
   if(!response.ok||body?.data?.success!==true){
    await finish('failed',{failureCode:`textbee_${response.status||'error'}`});
    console.error('Payment confirmation SMS was not queued.',{requestId,status:response.status});return;
   }
   await finish('queued',{smsBatchId:String(body.data.smsBatchId||'').slice(0,100)});
  }catch(error){
   await finish('failed',{failureCode:'gateway_unavailable'});
   console.error('Payment confirmation SMS could not be queued.',{requestId,error:String(error?.message||error).slice(0,160)});
  }
 };
}

module.exports={API_URL,phoneIsValid,paymentWasJustVerified,confirmationMessage,createPaymentSmsNotifier};
