/* ===== BLOCK: CUSDIS PAGE DATA ===== */
(function setCusdisPage(){
  const el = document.getElementById('cusdis_thread');
  if (!el) return;
  el.setAttribute('data-page-id', location.pathname);
  el.setAttribute('data-page-url', location.href);
  el.setAttribute('data-page-title', document.title);
})();