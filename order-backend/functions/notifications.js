'use strict';
const {randomUUID}=require('node:crypto');
const terminal=status=>['sent','no_devices'].includes(status);
const invalid=new Set(['messaging/registration-token-not-registered','messaging/invalid-registration-token']);
function createNotifier({db,getMessaging,Timestamp,isStaff,now=()=>Date.now()}){
 return async event=>{
  const snap=event.data;if(!snap)return;const attempt=randomUUID(),ref=snap.ref;
  const claimed=await db.runTransaction(async tx=>{
   const current=await tx.get(ref),data=current.data();if(!current.exists||terminal(data.notificationStatus))return false;
   if((data.deliveryLeaseUntil?.toMillis?.()||0)>now())throw Error('Notification delivery is already in progress');
   tx.update(ref,{notificationStatus:'processing',deliveryAttempt:attempt,deliveryLeaseUntil:Timestamp.fromMillis(now()+120000)});return true;
  });if(!claimed)return;
  try{
   const profiles=await db.collection('sgStaff').where('active','==',true).get(),allowed=new Set(profiles.docs.filter(s=>isStaff(s.data())).map(s=>s.id));
   const devices=await db.collection('sgPushDevices').get(),targets=devices.docs.filter(s=>allowed.has(s.data().uid));
   const deliveries=await ref.collection('deliveries').get(),done=new Set(deliveries.docs.filter(s=>['sent','invalid'].includes(s.data().status)).map(s=>s.id));
   const pending=targets.filter(s=>!done.has(s.id)),alert=snap.data();
   for(let i=0;i<pending.length;i+=500){
    const group=pending.slice(i,i+500),result=await getMessaging().sendEachForMulticast({tokens:group.map(s=>s.data().token),notification:{title:['receipt','payment'].includes(alert.kind)?'Stone Grill · Payment to review':'Stone Grill · New order',body:'Review this order in the Stone Grill staff desk.'},data:{brand:'Stone Grill',requestId:alert.requestId,alertId:event.params.alertId},webpush:{headers:{TTL:'3600'},notification:{tag:event.params.alertId,icon:'https://stonegrillresto.net/order/assets/icons/icon-192.png',badge:'https://stonegrillresto.net/order/assets/icons/favicon-32.png'},fcmOptions:{link:'https://stonegrillresto.net/order/staff/?order='+alert.requestId}}});
    let failed=false;
    await Promise.all(result.responses.map(async(response,j)=>{
     const device=group[j];if(!response.success&&!invalid.has(response.error?.code)){failed=true;return;}
     await ref.collection('deliveries').doc(device.id).set({status:response.success?'sent':'invalid',uid:device.data().uid,at:Timestamp.now()});
     if(!response.success){try{await device.ref.delete();}catch{console.warn('Expired push-device cleanup deferred.');}}
    }));if(failed)throw Error('Notification retry needed');
   }
   await db.runTransaction(async tx=>{const current=await tx.get(ref);if(current.data()?.deliveryAttempt===attempt)tx.update(ref,{notificationStatus:targets.length?'sent':'no_devices',notifiedAt:Timestamp.now(),deliveryLeaseUntil:Timestamp.fromMillis(0)});});
  }catch(error){
   await db.runTransaction(async tx=>{const current=await tx.get(ref);if(current.data()?.deliveryAttempt===attempt)tx.update(ref,{notificationStatus:'pending',deliveryLeaseUntil:Timestamp.fromMillis(0)});});
   throw error;
  }
 };
}
module.exports={createNotifier};
