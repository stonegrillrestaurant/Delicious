'use strict';

const API='https://api.loyverse.com/v1.0';
const OAUTH='https://api.loyverse.com/oauth';

async function jsonRequest(url, options={}) {
  const response=await fetch(url,options);
  const body=await response.json().catch(()=>({}));
  if(!response.ok) {
    const error=new Error(body.error_description||body.message||'Loyverse request failed');
    error.status=response.status;
    throw error;
  }
  return body;
}

function authorizeUrl({clientId,redirectUri,state}) {
  const url=new URL(OAUTH+'/authorize');
  url.searchParams.set('client_id',clientId);
  url.searchParams.set('response_type','code');
  url.searchParams.set('scope','RECEIPTS_WRITE ITEMS_READ STORES_READ PAYMENT_TYPES_READ');
  url.searchParams.set('redirect_uri',redirectUri);
  url.searchParams.set('state',state);
  return url.toString();
}

async function exchangeCode({clientId,clientSecret,redirectUri,code}) {
  return jsonRequest(OAUTH+'/token',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({
      client_id:clientId,
      client_secret:clientSecret,
      redirect_uri:redirectUri,
      code,
      grant_type:'authorization_code'
    })
  });
}

async function refreshToken({clientId,clientSecret,refreshToken}) {
  return jsonRequest(OAUTH+'/token',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({
      client_id:clientId,
      client_secret:clientSecret,
      refresh_token:refreshToken,
      grant_type:'refresh_token'
    })
  });
}

async function api(token,path,options={}) {
  return jsonRequest(API+path,{
    ...options,
    headers:{...(options.headers||{}),Authorization:'Bearer '+token,'Content-Type':'application/json'}
  });
}

async function allPages(token,path,key) {
  const rows=[];let cursor;
  do {
    const url=new URL(API+path);
    url.searchParams.set('limit','250');
    if(cursor)url.searchParams.set('cursor',cursor);
    const page=await jsonRequest(url.toString(),{headers:{Authorization:'Bearer '+token}});
    rows.push(...(page[key]||[]));
    cursor=page.cursor||null;
  } while(cursor);
  return rows;
}

function matchByName(rows,name,getName=x=>x.name) {
  const key=String(name||'').trim().toLocaleLowerCase();
  const matches=rows.filter(x=>String(getName(x)||'').trim().toLocaleLowerCase()===key);
  if(matches.length!==1)throw new Error(matches.length?'Ambiguous Loyverse match for '+name:'No Loyverse match for '+name);
  return matches[0];
}

async function createPaidReceipt(token,order) {
  const [stores,items,paymentTypes]=await Promise.all([
    allPages(token,'/stores','stores'),
    allPages(token,'/items','items'),
    allPages(token,'/payment_types','payment_types')
  ]);
  if(stores.length!==1)throw new Error('Select one Loyverse store before receipt sync');
  const candidates=paymentTypes.filter(p=>{const n=String(p.name||'').toLowerCase();return order.paymentMethod==='qr'?/(gcash|qr)/.test(n):/gcash/.test(n)&&!n.includes('qr');});
  if(candidates.length!==1)throw new Error(candidates.length?'Choose the Loyverse GCash payment type':'Create a GCash payment type in Loyverse');
  const payment=candidates[0];
  const line_items=order.items.map(line=>{
    const item=matchByName(items,line.name);
    if(!Array.isArray(item.variants)||item.variants.length!==1)throw new Error('Choose a Loyverse variant for '+line.name);
    return {variant_id:item.variants[0].variant_id||item.variants[0].id,quantity:line.qty,price:Number(line.price)};
  });
  const orderNumber=String(order.orderId||'').slice(0,64);
  if(!orderNumber)throw new Error('Online order is missing its order number');
  const query=new URLSearchParams({order:orderNumber,store_id:stores[0].id,limit:'50'});
  const existing=await api(token,'/receipts?'+query.toString());
  const prior=(existing.receipts||[]).find(r=>r.order===orderNumber&&r.receipt_type==='SALE');
  if(prior)return prior;
  const payload={
    store_id:stores[0].id,
    order:orderNumber,
    source:'Stone Grill Orders',
    note:'Online order '+order.orderId,
    line_items,
    payments:[{payment_type_id:payment.id,paid_at:new Date().toISOString()}]
  };
  return api(token,'/receipts',{method:'POST',body:JSON.stringify(payload)});
}

module.exports={authorizeUrl,exchangeCode,refreshToken,api,allPages,createPaidReceipt};
