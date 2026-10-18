importScripts('./firebase-config.js');
importScripts('https://www.gstatic.com/firebasejs/13.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/13.0.0/firebase-messaging-compat.js');
if(self.SG_FIREBASE_CONFIG?.apiKey){firebase.initializeApp(self.SG_FIREBASE_CONFIG);firebase.messaging();}
