importScripts('../firebase-config.js');
importScripts('https://www.gstatic.com/firebasejs/13.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/13.0.0/firebase-messaging-compat.js');
if(globalThis.SG_FIREBASE_CONFIG?.apiKey){firebase.initializeApp(globalThis.SG_FIREBASE_CONFIG);firebase.messaging();}
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
