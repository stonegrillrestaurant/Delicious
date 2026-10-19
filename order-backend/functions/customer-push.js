'use strict';
const {createHash}=require('node:crypto');
const invalid=new Set(['messaging/registration-token-not-registered','messaging/invalid-registration-token']);
function createCustomerPushNotifier({db,getMessaging,Timestamp}){
 return async event=>{
  if(!event.data)return;
  const before=event.data.before.data(),after=event.data.after.data();
  if(before?.paymentStatus==='verified'||after?.paymentStatus!=='verified'||!after.customerUid)return;
  const requestId=event.params.requestId,receipt=db.collection('sgCustomerPushNotifications').doc(requestId);
  const devices=await db.collection('sgCustomerPushDevices').where('uid','==',after.customerUid).get();
  if(devices.empty)return;
  const firstName=String(after.name||'').trim().split(/\s+/)[0]||'there';
  const message={notification:{title:'Stone Grill · Payment confirmed',body:'Hi '+firstName+', your payment has been verified. View your order progress.'},webpush:{headers:{TTL:'86400'},notification:{tag:'payment-'+requestId,icon:'https://stonegrillresto.net/order/assets/icons/icon-192.png',badge:'https://stonegrillresto.net/order/assets/icons/favicon-32.png'},fcmOptions:{link:'https://stonegrillresto.net/order/account/'}}};
  for(const device of devices.docs){
   const delivery=receipt.collection('deliveries').doc(device.id);
   const claimed=await db.runTransaction(async tx=>{
    const snap=await tx.get(delivery);
    if(snap.exists&&['sent','invalid'].includes(snap.data().status))return false;
    if(snap.exists&&(snap.data().leaseUntil?.toMillis?.()||0)>Date.now())return false;
    tx.set(delivery,{status:'processing',leaseUntil:Timestamp.fromMillis(Date.now()+120000)}, {merge:true});return true;
   });
   if(!claimed)continue;
   try{
    await getMessaging().send({...message,token:device.data().token});
    await delivery.set({status:'sent',at:Timestamp.now()},{merge:true});
   }catch(e){
    if(invalid.has(e.code)){await delivery.set({status:'invalid',at:Timestamp.now()},{merge:true});await device.ref.delete();}
    else {await delivery.set({status:'retry',leaseUntil:Timestamp.fromMillis(0)},{merge:true});throw e;}
   }
  }
 };
}
module.exports={createCustomerPushNotifier};
