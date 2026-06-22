(function () {
  // ---------- 1) AUTOPLAY BRIDGE ----------
  function addAutoplayAndBackToHref(href) {
    try {
      const u = new URL(href, location.origin);
      if (!u.searchParams.has('autoplay')) u.searchParams.set('autoplay', '1');
      if (!u.searchParams.has('back'))     u.searchParams.set('back', '1');
      return u.pathname + (u.search ? u.search : '') + (u.hash || '');
    } catch (e) { return href; }
  }

  function interceptReadClicks() {
    document.querySelectorAll('a.book-link, a.title-link').forEach(a => {
      try {
        const isInternal = a.href.startsWith(location.origin + '/reflections/');
        if (isInternal) a.removeAttribute('target');
      } catch (e) {}

      a.addEventListener('click', () => {
        try {
          sessionStorage.setItem('autoplayAudio', 'true');
          sessionStorage.setItem('showBack', 'true');
        } catch (e) {}
        try { localStorage.setItem('autoplayOnce', '1'); } catch (e) {}

        a.href = addAutoplayAndBackToHref(a.getAttribute('href') || a.href);
      }, { once:false });
    });
  }

  // ---------- 2) OMNIBUS SHARE ----------
  const enc = encodeURIComponent;

  function buildFallbackLinks(url, title) {
    const fb = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
    const messengerDeep = `fb-messenger://share?link=${enc(url)}&app_id=0`;
    const messengerWeb  = `https://www.facebook.com/dialog/send?link=${enc(url)}&app_id=0&redirect_uri=${enc(url)}`;
    const whatsapp = `https://api.whatsapp.com/send?text=${enc(title + " " + url)}`;
    const xshare   = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`;
    return `
      <a class="btn" href="${fb}" target="_blank" rel="noopener">Facebook</a>
      <a class="btn" href="${messengerDeep}" target="_blank" rel="noopener">Messenger</a>
      <a class="btn" href="${messengerWeb}" target="_blank" rel="noopener" style="display:none">Messenger (web)</a>
      <a class="btn" href="${whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
      <a class="btn" href="${xshare}" target="_blank" rel="noopener">X</a>
      <button class="btn ghost copy-link" type="button" data-url="${url}">Copy Link</button>
    `;
  }

  function attachCopyHandlers(root) {
    root.querySelectorAll('.copy-link').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(btn.getAttribute('data-url'));
          const old = btn.textContent;
          btn.textContent = '✓ Copied';
          setTimeout(() => (btn.textContent = old), 1500);
        } catch {
          alert('Copy failed. Long-press the link to copy.');
        }
      });
    });
  }

  function renderOmniShare(container) {
    const shareUrl   = container.getAttribute('data-share-url');
    const shareTitle = container.getAttribute('data-share-title') || 'Share';

    const mainBtn = document.createElement('button');
    mainBtn.className = 'btn primary';
    mainBtn.type = 'button';
    mainBtn.textContent = 'Share';
    container.appendChild(mainBtn);

    const fallbackWrap = document.createElement('div');
    fallbackWrap.className = 'share-fallback';
    fallbackWrap.innerHTML = buildFallbackLinks(shareUrl, shareTitle);
    fallbackWrap.style.display = 'none';
    container.appendChild(fallbackWrap);

    const canNativeShare = !!navigator.share && (typeof window.ontouchstart !== 'undefined');

    mainBtn.addEventListener('click', async () => {
      if (canNativeShare) {
        try {
          await navigator.share({ title: shareTitle, text: shareTitle, url: shareUrl });
          return;
        } catch (err) {}
      }
      fallbackWrap.style.display = '';
      attachCopyHandlers(fallbackWrap);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    interceptReadClicks();
    document.querySelectorAll('.share-group').forEach(renderOmniShare);
  });
})();
