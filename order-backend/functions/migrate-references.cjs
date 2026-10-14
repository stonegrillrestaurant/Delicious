'use strict';
// Run with Cloud Shell's existing Application Default Credentials.
// New backend blocks checkout until this import has completed.
const {initializeApp}=require('firebase-admin/app');
const {getFirestore,FieldValue}=require('firebase-admin/firestore');
const {createHash}=require('node:crypto');
initializeApp({projectId:'stone-grill-app'});
const db=getFirestore(),hash=s=>createHash('sha256').update(s).digest('hex');
(async()=>{
 const records=await db.collection('sgOrders').get(),claims=new Map();
 for(const doc of records.docs){
  const value=doc.data().submittedPaymentReference;
  if(!value)continue;
  const normalized=String(value).trim().replace(/[ -]/g,'').toUpperCase(),key=hash(normalized);
  if(claims.has(key)&&claims.get(key).id!==doc.id)throw Error('Existing duplicate payment references: '+claims.get(key).id+' and '+doc.id+'. Resolve these with the owner before enabling checkout.');
  claims.set(key,{id:doc.id,uid:doc.data().customerUid||''});
 }
 for(const [key,claim] of claims){
  const ref=db.collection('sgPaymentReferences').doc(key);
  await db.runTransaction(async tx=>{
   const saved=await tx.get(ref);
   if(saved.exists){if(saved.data().requestId!==claim.id)throw Error('Reference conflict for order '+claim.id);return;}
   tx.create(ref,{requestId:claim.id,customerUid:claim.uid,importedAt:FieldValue.serverTimestamp()});
  });
 }
 await db.collection('sgSystem').doc('prepaid-v1').set({ready:true,importedCount:claims.size,updatedAt:FieldValue.serverTimestamp()});
 console.log('Reference protection ready. Imported/checked '+claims.size+' existing payment references. No orders or roles deleted.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
