/* === Stone Grill Privacy/Data Widget (v3) === */
(function(){
  if (document.getElementById('sg-privacy-mounted')) return; // prevent duplicates
  var marker = document.createElement('meta'); marker.id='sg-privacy-mounted';
  document.head.appendChild(marker);

  // --- Inject CSS ---
  var css = `
#sg-privacy-fab{
  position:fixed; right:12px; bottom:12px; z-index:2147483647;
  padding:10px 12px; border:1px solid #ddd; background:#ffffff; color:#333;
  border-radius:999px; font-size:.9rem; box-shadow:0 2px 10px rgba(0,0,0,.08);
}
#sg-privacy-fab:hover{ background:#f7f7f7; }
#sg-privacy-modal[hidden]{ display:none; }
#sg-privacy-modal{ position:fixed; inset:0; z-index:2147483646; }
#sg-privacy-modal .sg-privacy-modal__backdrop{ position:absolute; inset:0; background:rgba(0,0,0,.45); }
#sg-privacy-modal .sg-privacy-modal__panel{
  position:absolute; right:12px; bottom:64px; width:min(95vw, 360px);
  background:#fff; border:1px solid #e6e6e6; border-radius:14px;
  box-shadow:0 10px 30px rgba(0,0,0,.18); overflow:hidden;
}
.sg-privacy-modal__hdr{ display:flex; align-items:center; justify-content:space-between;
  padding:10px 12px; background:#f8f8f8; border-bottom:1px solid #eee; }
.sg-privacy-modal__hdr h3{ margin:0; font-size:1rem; }
.sg-privacy-modal__close{ border:0; background:transparent; font-size:1.2rem; line-height:1;
  cursor:pointer; color:#555; }
.sg-privacy-modal__content{ padding:12px; font-size:.95rem; line-height:1.5; }
.sg-privacy-modal__content a{ color:#333; text-decoration:underline; }
#sg-privacy-toast[hidden]{ display:none; }
#sg-privacy-toast{ position:fixed; left:50%; transform:translateX(-50%); bottom:80px;
  z-index:2147483645; max-width:min(92vw, 520px); }
.sg-privacy-toast__card{ display:flex; gap:6px; align-items:center; padding:10px 12px;
  background:#111; color:#fff; border-radius:10px; box-shadow:0 6px 20px rgba(0,0,0,.3);
  font-size:.9rem; }
.sg-privacy-toast__card a{ color:#fff; text-decoration:underline; }
.sg-privacy-toast__close{ margin-left:auto; border:0; background:transparent; color:#fff;
  font-size:1.1rem; cursor:pointer; }
@media (max-width:480px){
  #sg-privacy-fab{ bottom:56px; }
  #sg-privacy-toast{ bottom:120px; }
}`;
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // --- Inject HTML ---
  var html = `
<button id="sg-privacy-fab" aria-haspopup="dialog" aria-controls="sg-privacy-modal" aria-label="Privacy & Data">
  Privacy • Data
</button>
<div id="sg-privacy-modal" role="dialog" aria-modal="true" aria-labelledby="sg-privacy-title" hidden>
  <div class="sg-privacy-modal__panel">
    <header class="sg-privacy-modal__hdr">
      <h3 id="sg-privacy-title">Your privacy matters</h3>
      <button class="sg-privacy-modal__close" aria-label="Close">×</button>
    </header>
    <div class="sg-privacy-modal__content">
      <p>Review how we handle your info:</p>
      <p>
        <a href="/privacy-policy.html" target="_blank" rel="noopener">Privacy Policy</a> •
        <a href="/data-deletion.html" target="_blank" rel="noopener">Data Deletion</a>
      </p>
    </div>
  </div>
  <div class="sg-privacy-modal__backdrop" aria-hidden="true"></div>
</div>
<div id="sg-privacy-toast" hidden role="status" aria-live="polite">
  <div class="sg-privacy-toast__card">
    <span>We value your privacy. Read our</span>
    <a href="/privacy-policy.html" target="_blank" rel="noopener">Policy</a>
    <span>and</span>
    <a href="/data-deletion.html" target="_blank" rel="noopener">Deletion</a>.
    <button class="sg-privacy-toast__close" aria-label="Dismiss">×</button>
  </div>
</div>`;
  var wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap);

  // --- Behavior wiring ---
  var fab = document.getElementById('sg-privacy-fab');
  var modal = document.getElementById('sg-privacy-modal');
  var backdrop = modal.querySelector('.sg-privacy-modal__backdrop');
  var btnClose = modal.querySelector('.sg-privacy-modal__close');
  var toast = document.getElementById('sg-privacy-toast');
  var toastClose = toast.querySelector('.sg-privacy-toast__close');
  var LS_KEY = 'sg_privacy_toast_dismissed_v1';

  function openModal(){ modal.hidden=false; document.body.style.overflow='hidden'; fab.setAttribute('aria-expanded','true'); }
  function closeModal(){ modal.hidden=true; document.body.style.overflow=''; fab.setAttribute('aria-expanded','false'); }

  fab.addEventListener('click', openModal);
  backdrop.addEventListener('click', closeModal);
  btnClose.addEventListener('click', closeModal);
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

  // Toast once per browser
  try{
    if(localStorage.getItem(LS_KEY)!=='1'){
      toast.hidden=false;
      setTimeout(()=>toast.hidden=true,6000);
    }
  }catch(e){}
  toastClose.addEventListener('click', ()=>{ toast.hidden=true; try{localStorage.setItem(LS_KEY,'1');}catch(e){} });
})();
