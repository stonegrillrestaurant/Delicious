'use strict';
const {onRequest}=require('firebase-functions/v2/https');
const {onDocumentCreated}=require('firebase-functions/v2/firestore');
const {defineString}=require('firebase-functions/params');
const {initializeApp}=require('firebase-admin/app');
const {getFirestore,Timestamp}=require('firebase-admin/firestore');
const {getAuth}=require('firebase-admin/auth');
const {getStorage}=require('firebase-admin/storage');
const {getMessaging}=require('firebase-admin/messaging');
const {createHash,randomUUID}=require('node:crypto');
const d=require('./domain'),menu=require('./menu.json');
const OWNER_UID='qhf2nu7zlOXcj6t5mU7e9gjWyRz2';
const INITIAL_ADMIN_UID='dYqA7rVgDNRP7nRY9ghoUtVfcHj1';
initializeApp();const db=getFirestore(),bucketName=defineString('ORDER_STORAGE_BUCKET');
const hash=s=>createHash('sha256').update(s).digest('hex');
const origins=['https://stone-grill-orders-test.web.app','https://stonegrillresto.net'];
const options={region:'asia-southeast1',cors:origins,maxInstances:3,timeoutSeconds:60,memory:'256MiB',invoker:'public'};
const bucket=()=>getStorage().bucket(bucketName.value());
function endpoint(fn,max=7100000){return async(req,res)=>{
 res.set('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).json({ok:false,error:'POST required'});
 if(!origins.includes(req.get('origin')))return res.status(403).json({ok:false,error:'Origin not allowed'});
 try{d.check(req.is('application/json')&&req.body&&typeof req.body==='object'&&(req.rawBody?.length||0)<=max,'Invalid request');await fn(req,res);}
 catch(e){res.status(e.status||500).json({ok:false,error:e.status?e.message:'Service unavailable. Retry using the same order reference.'});}
};}
async function throttle(ip,kind){const r=db.collection('sgOrderRateLimits').doc(hash(ip+':'+kind+':'+Math.floor(Date.now()/600000)));await db.runTransaction(async t=>{const s=await t.get(r),count=s.exists?s.data().count:0;if(count>=(kind==='order'?15:20))throw d.error(429,'Too many attempts. Contact Stone Grill or try later.');t.set(r,{count:count+1,expiresAt:Timestamp.fromMillis(Date.now()+86400000)});});}
exports.orderApi=onRequest(options,endpoint(async(req,res)=>{
 const user=await signedUser(req),b=req.body;d.identity(b);
 const setup=await db.collection('sgSystem').doc('prepaid-v1').get();if(!setup.exists||setup.data().ready!==true)throw d.error(503,'Checkout update in progress. Please return shortly; do not send payment yet.');d.check(['quote','order','payment','receipt'].includes(b.action),'Invalid action');await throttle(req.ip||'unknown',b.action);
 if(b.action==='quote'){const order=d.order(b,menu);if(new Date(order.date+'T'+order.time+':00+08:00').getTime()<Date.now()-5*60000)throw d.error(400,'Choose a future date and time');return res.json({ok:true,order});}
 const ref=db.collection('sgOrders').doc(b.requestId),cap=db.collection('sgOrderCapabilities').doc(b.requestId),keyHash=hash(b.receiptKey);
 if(b.action==='order'){
  const order={...d.order(b,menu),...d.payment({...b,paymentMobile:b.paymentMobile||b.mobile})},fingerprint=hash(JSON.stringify(order)),orderId='SG-'+b.requestId;
  const claim=db.collection('sgPaymentReferences').doc(hash(order.submittedPaymentReference));
  await db.runTransaction(async t=>{const [s,c]=await Promise.all([t.get(ref),t.get(cap)]);if(s.exists){if(s.data().customerUid!==user.uid||!c.exists||c.data().keyHash!==keyHash||c.data().fingerprint!==fingerprint)throw d.error(409,'Reference already used. Contact Stone Grill.');return;}
   const used=await t.get(claim);if(used.exists)throw d.error(409,'This payment reference has already been submitted. Check My Orders or contact Stone Grill; do not pay again.');
   if(new Date(order.date+'T'+order.time+':00+08:00').getTime()<Date.now()-5*60000)throw d.error(400,'Choose a future date and time');
   const now=Timestamp.now();t.create(claim,{requestId:b.requestId,customerUid:user.uid,createdAt:now});t.set(db.collection('sgCustomers').doc(user.uid),{name:order.name,mobile:order.mobile},{merge:true});t.create(ref,{...order,customerUid:user.uid,customerEmail:user.email||'',reservationStatus:['Dine-in','Reservation'].includes(order.orderType)?'pending':'not_required',orderId,status:'new',paymentStatus:'pending_verification',paymentDetailsAt:now,receiptCount:0,createdAt:now,updatedAt:now});t.create(cap,{keyHash,fingerprint});t.create(db.collection('sgStaffAlerts').doc('order-'+b.requestId),{kind:'order',requestId:b.requestId,createdAt:now,notificationStatus:'pending'});
  });return res.json({ok:true,orderId,total:order.subtotal});
 }

 if(b.action==='receipt')throw d.error(410,'Receipt uploads are no longer required.');
 const details=d.payment(b),claim=db.collection('sgPaymentReferences').doc(hash(details.submittedPaymentReference));
 await db.runTransaction(async t=>{
  const [s,used]=await Promise.all([t.get(ref),t.get(claim)]);
  if(!s.exists||s.data().customerUid!==user.uid)throw d.error(403,'This order does not belong to your account');
  const o=s.data();
  if(o.submittedPaymentReference===details.submittedPaymentReference&&o.paymentMethod===details.paymentMethod)return;
  if(o.submittedPaymentReference||o.paymentStatus==='verified'||['completed','cancelled'].includes(o.status))throw d.error(409,'Payment already submitted. Contact Stone Grill for corrections; do not pay again.');
  if(used.exists)throw d.error(409,'This payment reference has already been submitted.');
  const now=Timestamp.now();t.create(claim,{requestId:b.requestId,customerUid:user.uid,createdAt:now});
  t.update(ref,{...details,paymentStatus:'pending_verification',paymentDetailsAt:now,updatedAt:now});
  t.create(db.collection('sgStaffAlerts').doc('payment-'+b.requestId),{kind:'payment',requestId:b.requestId,createdAt:now,notificationStatus:'pending'});
 });res.json({ok:true});
}));

async function signedUser(req){
 const bearer=req.get('authorization')||'';
 if(!bearer.startsWith('Bearer '))throw d.error(401,'Please sign in');
 try{const u=await getAuth().verifyIdToken(bearer.slice(7),true);if(u.firebase?.sign_in_provider==='anonymous')throw Error();return u;}
 catch{throw d.error(401,'Please sign in again with your account');}
}
async function operator(req){
 const user=await signedUser(req);
 const s=await db.collection('sgStaff').doc(user.uid).get();
 if(!s.exists||!d.isStaff(s.data()))throw d.error(403,'Staff access not assigned');
 return {uid:user.uid,email:user.email||'',role:s.data().role};
}
exports.customerApi=onRequest(options,endpoint(async(req,res)=>{
 const user=await signedUser(req),b=req.body,ref=db.collection('sgCustomers').doc(user.uid),staffRef=db.collection('sgStaff').doc(user.uid);
 if(!['syncProfile','saveProfile'].includes(b.action))throw d.error(400,'Invalid action');
 let fields={};
 if(b.action==='saveProfile'){
  fields.name=d.text(b.name,100);fields.mobile=d.text(b.mobile,30).replace(/[\s-]/g,'');
  d.check(/^\+639\d{9}$/.test(fields.mobile),'Enter a valid Philippine mobile number');
 }
 await db.runTransaction(async t=>{
  const [s,staff]=await Promise.all([t.get(ref),t.get(staffRef)]),now=Timestamp.now();
  const seededRole=user.uid===OWNER_UID?'owner':user.uid===INITIAL_ADMIN_UID?'cashier':'customer';
  const role=user.uid===OWNER_UID?'owner':staff.exists?(staff.data().active?staff.data().role:'customer'):seededRole;
  if(!staff.exists||user.uid===OWNER_UID)t.set(staffRef,{role,active:role!=='customer',updatedAt:now});
  const authTime=Number(user.auth_time)||0,changed=!s.exists||s.data().lastAuthTime!==authTime;
  const updates={...fields,email:user.email||'',role,updatedAt:now};
  if(!s.exists)Object.assign(updates,{name:(user.name||user.email||'Customer').slice(0,100),mobile:'',createdAt:now,...fields});
  if(changed)Object.assign(updates,{lastSignInAt:now,lastAuthTime:authTime});
  t.set(ref,updates,{merge:true});
  if(changed)t.set(ref.collection('signIns').doc(String(authTime)),{at:now,provider:user.firebase?.sign_in_provider||'unknown'});
 });res.json({ok:true});
},20000));
exports.staffApi=onRequest(options,endpoint(async(req,res)=>{
 const user=await operator(req),b=req.body;
 if(b.action==='setRole'){
  const patch=d.roleChange(user.uid,b.uid,b.role,OWNER_UID);
  const target=db.collection('sgCustomers').doc(b.uid);
  await db.runTransaction(async t=>{const s=await t.get(target);if(!s.exists)throw d.error(404,'The user must sign in once first');const now=Timestamp.now();
   t.set(db.collection('sgStaff').doc(b.uid),{...patch,updatedAt:now,assignedBy:user.uid});
   t.update(target,{role:b.role,updatedAt:now});
   t.create(db.collection('sgRoleAudit').doc(randomUUID()),{targetUid:b.uid,fromRole:s.data().role||'customer',toRole:b.role,actorUid:user.uid,at:now});
  });return res.json({ok:true});
 }

 if(['registerDevice','removeDevice'].includes(b.action)){
  d.check(typeof b.token==='string'&&b.token.length>=20&&b.token.length<=4096,'Invalid device');const ref=db.collection('sgPushDevices').doc(hash(b.token));
  if(b.action==='registerDevice')await ref.set({uid:user.uid,token:b.token,updatedAt:Timestamp.now()});
  else await db.runTransaction(async t=>{const s=await t.get(ref);if(s.exists&&s.data().uid===user.uid)t.delete(ref);});return res.json({ok:true});
 }
 d.check(/^[a-f0-9]{32}$/.test(b.requestId||''),'Invalid order reference');const ref=db.collection('sgOrders').doc(b.requestId);
 if(b.action==='receiptFile'){
  d.check(/^[a-f0-9]{64}$/.test(b.receiptId||''),'Invalid receipt');if(!['owner','cashier'].includes(user.role))throw d.error(403,'Payment reviewers only');const s=await ref.collection('receipts').doc(b.receiptId).get();if(!s.exists)throw d.error(404,'Receipt not found');
  const [bytes]=await bucket().file(s.data().storagePath).download();res.set('Content-Type',s.data().contentType);res.set('X-Content-Type-Options','nosniff');return res.send(bytes);
 }
 await db.runTransaction(async t=>{const [s,staff]=await Promise.all([t.get(ref),t.get(db.collection('sgStaff').doc(user.uid))]);if(!staff.exists||!d.isStaff(staff.data()))throw d.error(403,'Staff access revoked');if(!s.exists)throw d.error(404,'Order not found');const now=Timestamp.now();
  
if(['classifyQR','classifyNumber'].includes(b.action)){
 if(user.uid!==OWNER_UID)throw d.error(403,'Only owner may classify legacy payments');
 if(s.data().paymentMethod||!s.data().submittedPaymentReference)throw d.error(409,'Only legacy payments without a method may be classified');
 t.update(ref,{paymentMethod:b.action==='classifyQR'?'qr':'number',updatedAt:now});
 t.create(ref.collection('audit').doc(randomUUID()),{action:b.action,actorUid:user.uid,at:now});return;
}
if(b.action==='seen'||b.action==='acknowledge'){
   if(s.data().seenAt||s.data().acknowledgedAt)return;
   t.update(ref,{seenAt:now,seenBy:user.uid,updatedAt:now});
   t.create(ref.collection('audit').doc(randomUUID()),{action:'seen',actorUid:user.uid,actorEmail:user.email,at:now});return;
  }
  if(b.action==='printIntent'){
   if(s.data().paymentStatus!=='verified'||['cancelled','completed'].includes(s.data().status))throw d.error(409,'Only active paid orders may be printed for the kitchen');
   if(['Dine-in','Reservation'].includes(s.data().orderType)&&s.data().reservationStatus!=='confirmed')throw d.error(409,'Confirm the reservation first');
   const count=(s.data().printCount||0)+1;
   t.update(ref,{printCount:count,lastPrintRequestedAt:now,lastPrintRequestedBy:user.uid});
   t.create(ref.collection('audit').doc(randomUUID()),{action:'print_requested',actorUid:user.uid,actorEmail:user.email,at:now,copy:count});
   req.printResult={...s.data(),id:ref.id,printCount:count};return;
  }
  const role=staff.data().role,original=s.data();let current={...original},extra={};
  if(b.action==='verifyPayment'&&!current.paymentMethod&&b.paymentMethod){
   if(user.uid!==OWNER_UID)throw d.error(403,'Only owner can identify the payment method of an older order');
   d.check(['qr','number'].includes(b.paymentMethod),'Choose QR or GCash number');
   current.paymentMethod=b.paymentMethod;extra.paymentMethod=b.paymentMethod;
  }
  if(b.confirmReservation===true&&['verifyPayment','prepare','ready'].includes(b.action)&&['Dine-in','Reservation'].includes(current.orderType)&&current.reservationStatus!=='confirmed'){
   const acceptance=d.transition(current,'confirmReservation',role);
   Object.assign(current,acceptance);Object.assign(extra,acceptance,{reservationConfirmedBy:user.uid,reservationConfirmedAt:now});
  }
  const patch={...extra,...d.transition(current,b.action,role,b.action==='verifyPayment'?(b.reason||current.submittedPaymentReference):b.reason||'')};
  if(b.action==='acknowledge')Object.assign(patch,{acknowledgedBy:user.uid,acknowledgedAt:now});if(b.action==='verifyPayment')Object.assign(patch,{verifiedBy:user.uid,verifiedAt:now});
  t.update(ref,{...patch,updatedAt:now});t.create(ref.collection('audit').doc(randomUUID()),{action:b.action,actorUid:user.uid,actorEmail:user.email,at:now,fromStatus:s.data().status,toStatus:patch.status||s.data().status,reason:typeof b.reason==='string'?b.reason.slice(0,300):b.action==='verifyPayment'?(original.submittedPaymentReference||''):'',...(extra.reservationStatus?{tableAccepted:true}:{}),...(extra.paymentMethod?{paymentMethod:extra.paymentMethod}:{})});
 });res.json({ok:true,...(req.printResult?{order:req.printResult}:{})});
},20000));
exports.notifyStaff=onDocumentCreated({document:'sgStaffAlerts/{alertId}',region:'asia-southeast1',retry:true,maxInstances:3},require('./notifications').createNotifier({db,getMessaging,Timestamp,isStaff:d.isStaff}));
