'use strict';

const API_URL='https://api.textbee.dev/api/v1/gateway/send-sms';
const phoneIsValid=phone=>/^\+639\d{9}$/.test(String(phone||''));
const paymentWasJustVerified=(before,after)=>before?.paymentStatus!=='verified'&&after?.paymentStatus==='verified';
const safeProviderMessage=body=>String(body?.message||body?.error||body?.data?.message||'TextBee rejected the send request.').replace(/[\x00-\x1f\x7f]/g,' ').replace(/\s+/g,' ').slice(0,220);
function confirmationMessage(order){
 const firstName=String(order?.name||'').trim().split(/\s+/)[0]||'there';
 if(order?.status==='preparing')return `Hi ${firstName}, Stone Grill has confirmed your payment. We’re getting your order ready now. Follow its progress in My Orders. Thank you!`;
 return `Hi ${firstName}, Stone Grill has confirmed your payment. We’re confirming your table before we start cooking. Follow its progress in My Orders. Thank you!`;
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
   tx.update(change.after.ref,{smsConfirmationStatus:status,smsConfirmationUpdatedAt:Timestamp.now(),...(extra.smsBatchId?{smsConfirmationBatchId:extra.smsBatchId}:{}),...(extra.failureCode?{smsConfirmationFailureCode:extra.failureCode}:{}),...(extra.failureMessage?{smsConfirmationError:extra.failureMessage}:{})});
  });

  if(!phoneIsValid(order.mobile)){
   await finish('failed',{failureCode:'invalid_mobile',failureMessage:'Customer mobile must be stored in +639xxxxxxxxx format.'});return;
  }
  try{
   const response=await fetchImpl(API_URL,{method:'POST',headers:{'content-type':'application/json','x-api-key':apiKey()},body:JSON.stringify({deviceId:typeof deviceId==='function'?deviceId():deviceId,recipients:[order.mobile],message:confirmationMessage(order)})});
   let body={};try{body=await response.json();}catch{}
   if(!response.ok||body?.data?.success!==true){
    await finish('failed',{failureCode:`textbee_${response.status||'error'}`,failureMessage:safeProviderMessage(body)});
    console.error('Payment confirmation SMS was not queued.',{requestId,status:response.status});return;
   }
   await finish('queued',{smsBatchId:String(body.data.smsBatchId||'').slice(0,100)});
  }catch(error){
   await finish('failed',{failureCode:'gateway_unavailable',failureMessage:'TextBee could not be reached. Check the TextBee secrets and that the Android gateway is online.'});
   console.error('Payment confirmation SMS could not be queued.',{requestId,error:String(error?.message||error).slice(0,160)});
  }
 };
}

module.exports={API_URL,phoneIsValid,paymentWasJustVerified,confirmationMessage,safeProviderMessage,createPaymentSmsNotifier};
