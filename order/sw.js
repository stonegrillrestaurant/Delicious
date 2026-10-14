// Ordering requires a confirmed server response. Retire old order caches.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith('sg-order-'))await caches.delete(key);
 await self.clients.claim();
})()));
// No fetch handler: orders and customer details are never cached here.
