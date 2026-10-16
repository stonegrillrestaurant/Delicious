'use strict';
const error=(status,message)=>Object.assign(new Error(message),{status});
function check(condition,message){if(!condition)throw error(400,message);}
function identity(b){check(/^[a-f0-9]{32}$/.test(b.requestId||'')&&/^[a-f0-9]{64}$/.test(b.receiptKey||''),'Invalid order reference');}
function text(s,max,optional=false){check(typeof s==='string'&&s.length<=max&&!/[\x00-\x08\x0b-\x1f]/.test(s)&&(optional||s.trim()),'Invalid customer details');return s.trim();}
function order(b,menu){
 identity(b);const name=text(b.name,100),mobile=text(b.mobile,30).replace(/[\s-]/g,'');
 check(/^\+639\d{9}$/.test(mobile),'Enter a valid Philippine mobile number');
 check(['Dine-in','Take-out','Reservation'].includes(b.orderType),'Invalid service type');
 const date=text(b.date,10),time=text(b.time,5),day=new Date(date+'T00:00:00Z');
 check(/^\d{4}-\d{2}-\d{2}$/.test(date)&&!isNaN(day)&&day.toISOString().slice(0,10)===date&&/^([01]\d|2[0-3]):[0-5]\d$/.test(time),'Invalid date or time');
 const persons=['Dine-in','Reservation'].includes(b.orderType)?Number(b.persons):0;check(Number.isInteger(persons)&&persons>=0&&persons<=200&&(!['Dine-in','Reservation'].includes(b.orderType)||persons>0),'Invalid guest count');
 const prices=new Map(Object.values(menu.data).flat().map(i=>[i.name,Math.round(i.price*100)]));
 check(Array.isArray(b.items)&&b.items.length>0&&b.items.length<=40,'Choose 1–40 menu items');const seen=new Set();
 const items=b.items.map(i=>{check(i&&prices.has(i.name)&&!seen.has(i.name)&&Number.isInteger(i.qty)&&i.qty>0&&i.qty<=100,'Invalid menu item or quantity');seen.add(i.name);const price=prices.get(i.name);check(Number.isFinite(Number(i.price))&&Math.round(Number(i.price)*100)===price,'Menu price changed. Refresh before ordering');return {name:i.name,qty:i.qty,price:price/100};});
 const subtotal=items.reduce((s,i)=>s+Math.round(i.price*100)*i.qty,0)/100;check(Number.isFinite(Number(b.subtotal))&&Math.abs(Number(b.subtotal)-subtotal)<.001,'Order total changed. Refresh before ordering');
 return {name,mobile,orderType:b.orderType,persons,date,time,requests:text(b.requests||'',500,true),items,subtotal};
}
function validateMenu(menu){
 check(menu&&typeof menu==='object'&&Array.isArray(menu.categories)&&menu.categories.length>0&&menu.categories.length<=40&&menu.data&&typeof menu.data==='object'&&!Array.isArray(menu.data),'Invalid menu');
 const ids=new Set(),names=new Set();
 for(const c of menu.categories){check(c&&typeof c.id==='string'&&/^[A-Za-z0-9_-]{1,40}$/.test(c.id)&&!ids.has(c.id),'Invalid or duplicate category');check(typeof c.label==='string'&&c.label.trim().length<=80&&typeof (c.emoji||'')==='string','Invalid category details');ids.add(c.id);}
 check(Object.keys(menu.data).every(id=>ids.has(id)),'Menu data has an unknown category');let count=0;
 for(const id of ids){const items=menu.data[id]||[];check(Array.isArray(items),'Invalid category items');for(const item of items){count++;check(count<=500&&item&&typeof item.name==='string'&&item.name.trim().length>0&&item.name.trim().length<=120&&!names.has(item.name.trim().toLowerCase()),'Invalid or duplicate menu item');check(Number.isSafeInteger(Number(item.price))&&Number(item.price)>=0&&Number(item.price)<=1000000,'Price must be a whole number from 0 to 1,000,000');names.add(item.name.trim().toLowerCase());}}
 return {categories:menu.categories.map(c=>({id:c.id,label:c.label.trim(),emoji:(c.emoji||'').trim()})),data:Object.fromEntries([...ids].map(id=>[id,(menu.data[id]||[]).map(i=>({name:i.name.trim(),price:Number(i.price)}))]))};
}
function receipt(b){identity(b);check(typeof b.data==='string'&&b.data.length<=7000000&&/^[A-Za-z0-9+/]+={0,2}$/.test(b.data),'Invalid receipt');const bytes=Buffer.from(b.data,'base64');check(bytes.length>0&&bytes.length<=5*1024*1024,'Receipt must be under 5 MB');let type,ext;
 if(bytes.subarray(0,5).toString()==='%PDF-'){type='application/pdf';ext='pdf';}
 else if(bytes.subarray(0,3).equals(Buffer.from([255,216,255]))){type='image/jpeg';ext='jpg';}
 else if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){type='image/png';ext='png';}
 else if(bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP'){type='image/webp';ext='webp';}
 else throw error(400,'Use a JPG, PNG, WebP or PDF receipt');return {bytes,type,ext};
}
const isStaff=p=>p?.active===true&&['owner','admin','cashier','staff'].includes(p.role);
function customerReceived(o){if(o.status==='completed')return {status:'completed',alreadyCompleted:true};if(o.status!=='ready')throw error(409,'Order is not ready to confirm as received');return {status:'completed'};}
function transition(o,action,role,reason=''){
 if(!['owner','admin','cashier','staff'].includes(role))throw error(403,'Staff access required');
 if(['completed','cancelled'].includes(o.status))throw error(409,'Order already closed');
 if(action==='confirmReservation'){
  if(!['owner','admin','cashier'].includes(role))throw error(403,'Admin access required');
  if(!['Dine-in','Reservation'].includes(o.orderType)||o.reservationStatus==='confirmed')throw error(409,'Reservation already confirmed or not required');
  return {reservationStatus:'confirmed'};
 }
 if(action==='seen'||action==='acknowledge')return {};
 if(action==='verifyPayment'||action==='cancel'){
  if(!['owner','admin','cashier'].includes(role))throw error(403,'Admin access required');check(typeof reason==='string'&&reason.trim()&&reason.length<=300,'Enter a payment reference or cancellation reason');
  if(action==='cancel'){if(o.status==='ready')throw error(409,'Order already closed');return {status:'cancelled',cancelReason:reason.trim()};}
  if(!canVerify(o,role))throw error(403,'GCash number payments require the owner; QR payments require the owner, admin or cashier');
  if(!o.submittedPaymentReference)throw error(409,'Payment reference required');
  if(o.paymentStatus==='verified')throw error(409,'Payment already verified');
  if(!['new','acknowledged','preparing'].includes(o.status))throw error(409,'Order is not waiting for payment verification');
  if(['Dine-in','Reservation'].includes(o.orderType)&&o.reservationStatus!=='confirmed')throw error(409,'Confirm table availability before preparing');
  return {paymentStatus:'verified',paymentReference:reason.trim(),status:'preparing'};
 }
 if(action==='prepare'&&['new','acknowledged'].includes(o.status)){if(o.paymentStatus!=='verified')throw error(409,'Verify payment before preparation');if(['Dine-in','Reservation'].includes(o.orderType)&&o.reservationStatus!=='confirmed')throw error(409,'Confirm table availability before preparation');return {status:'preparing'};}
 if(action==='ready'&&['new','acknowledged','preparing'].includes(o.status)){if(o.paymentStatus!=='verified')throw error(409,'Verify payment before marking ready');if(['Dine-in','Reservation'].includes(o.orderType)&&o.reservationStatus!=='confirmed')throw error(409,'Confirm table availability before marking ready');return {status:'ready'};}
 throw error(409,'Order changed. Check its current status');
}
function roleChange(actorUid,targetUid,role,ownerUid){
 if(actorUid!==ownerUid)throw error(403,'Only the owner can assign roles');
 if(targetUid===ownerUid)throw error(403,'Owner access is protected');
 check(typeof targetUid==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(targetUid),'Invalid user');
 check(['customer','staff','cashier','admin'].includes(role),'Invalid role');
 return {role,active:role!=='customer'};
}
function payment(b){
 const paymentMobile=text(b.paymentMobile,30).replace(/[\s-]/g,'').replace(/^0/,'+63');
 check(/^\+639\d{9}$/.test(paymentMobile),'Enter the payment mobile number (09… or +639…)');
 const submittedPaymentReference=text(b.submittedPaymentReference,80).replace(/[ -]/g,'').toUpperCase();
 check(['qr','number'].includes(b.paymentMethod),'Choose QR or GCash number');
 check(/^[A-Za-z0-9][A-Za-z0-9 -]{2,79}$/.test(submittedPaymentReference),'Enter a valid payment transaction reference');
 return {paymentMobile,submittedPaymentReference,paymentMethod:b.paymentMethod};
}
const canVerify=(o,role)=>(o.paymentMethod==='number'&&role==='owner')||(o.paymentMethod==='qr'&&['owner','admin','cashier'].includes(role));
module.exports={canVerify,payment,roleChange,text,error,check,identity,order,receipt,isStaff,transition,customerReceived,validateMenu};
