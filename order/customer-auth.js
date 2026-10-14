import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import * as authSDK from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import * as firestore from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';
const app=getApps()[0]||initializeApp(globalThis.SG_FIREBASE_CONFIG);
export const auth=authSDK.getAuth(app),db=firestore.getFirestore(app),f=firestore,a=authSDK;
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let resolveReady;export const ready=new Promise(r=>resolveReady=r);
export async function api(url,body){await ready;if(!auth.currentUser)throw Error('Please sign in to continue.');const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await auth.currentUser.getIdToken()},body:JSON.stringify(body)});const j=await r.json();if(!r.ok||!j.ok)throw Object.assign(Error(j.error||'Please try again.'),{status:r.status});return j;}
export async function syncProfile(){return api(globalThis.SG_CUSTOMER_API,{action:'syncProfile'});}
export function loginMarkup(){return `<button type="button" id="googleSignIn" class="google-signin"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.75-5.59-4.1H3.06v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.94A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.94V7.47H3.06A10 10 0 0 0 2 12c0 1.61.38 3.14 1.06 4.53l3.35-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.47l3.35 2.59c.79-2.35 2.99-4.1 5.59-4.1Z"/></svg><span>Continue with Google</span></button><details><summary>Email sign-in or new account</summary><form id="customerLogin"><label>Email<input id="loginEmail" type="email" autocomplete="username" required></label><label>Password<input id="loginPassword" type="password" autocomplete="current-password" minlength="6" required></label><button>Sign in</button><button type="button" id="registerAccount">Create account</button><button type="button" id="resetPassword">Reset password</button></form></details>`;}
export function wireLogin(notice){
 const run=fn=>async()=>{try{await fn();}catch(e){notice(e.code==='auth/popup-blocked'?'Allow the sign-in popup, or use email sign-in.':e.message);}};
 document.getElementById('googleSignIn').onclick=run(()=>authSDK.signInWithPopup(auth,new authSDK.GoogleAuthProvider()));
 const email=()=>document.getElementById('loginEmail').value.trim(),password=()=>document.getElementById('loginPassword').value;
 document.getElementById('customerLogin').onsubmit=e=>{e.preventDefault();run(()=>authSDK.signInWithEmailAndPassword(auth,email(),password()))();};
 document.getElementById('registerAccount').onclick=run(()=>authSDK.createUserWithEmailAndPassword(auth,email(),password()));
 document.getElementById('resetPassword').onclick=run(async()=>{await authSDK.sendPasswordResetEmail(auth,email());notice('If the email has an account, check its password-reset email.');});
}
await authSDK.setPersistence(auth,authSDK.browserSessionPersistence);
authSDK.onAuthStateChanged(auth,user=>{resolveReady(user);});
globalThis.SG_AUTH={auth,ready,getToken:async()=>{await ready;if(!auth.currentUser)throw Error('Sign in above before submitting your order.');return auth.currentUser.getIdToken();}};
