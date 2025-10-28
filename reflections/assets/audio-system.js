// === Omnibus Audio Embed System v3 ===
// One player plays at a time. Using: createAudioPlayer(src, title)

function createAudioPlayer(src, title) {
  return `
  <div class="audio-section">
    <p class="audio-label">🎧 Listen: <strong>${title}</strong></p>
    <audio controls preload="auto" class="audio-player">
      <source src="${src}" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>
  </div>`;
}

// Global listener: stop others when one plays
document.addEventListener('play', function (e) {
  const audios = document.querySelectorAll('audio');
  audios.forEach(audio => {
    if (audio !== e.target) audio.pause();
  });
}, true);

// === Universal Share System (for all cards and pages) ===
// Ninox — added for global sharing functionality
document.addEventListener("DOMContentLoaded", () => {
  const groups = document.querySelectorAll(".share-group");
  if (!groups.length) return;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isFBApp  = /FBAN|FBAV|FB_IAB/i.test(navigator.userAgent);

  groups.forEach(group => {
    const url = group.dataset.shareUrl?.trim() || location.href;
    const title = group.dataset.shareTitle || document.title;

    // Inject buttons
    group.innerHTML = `
      <button class="btn share-any" type="button">📤 Share</button>
      <a class="btn fb" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener">Facebook</a>
      <a class="btn msg" href="#" target="_blank" rel="noopener">Messenger</a>
      <a class="btn x" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}" target="_blank" rel="noopener">X</a>
      <button class="btn copy" type="button">🔗 Copy Link</button>
    `;

    // Messenger logic
    const msgBtn = group.querySelector(".btn.msg");
    msgBtn.addEventListener("click", e => {
      e.preventDefault();
      const msgMobile = "fb-messenger://share/?link=" + encodeURIComponent(url);
      const msgDesktop = "https://www.messenger.com/t/";
      if (isMobile && !isFBApp) {
        window.location.href = msgMobile;
        setTimeout(() => window.open(msgDesktop, "_blank"), 1000);
      } else {
        window.open(msgDesktop, "_blank", "noopener");
      }
    });

    // Native share if supported
    const shareAny = group.querySelector(".btn.share-any");
    shareAny.addEventListener("click", async () => {
      if (navigator.share) {
        try { await navigator.share({ title, url }); } catch(_) {}
      } else {
        window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url), "_blank");
      }
    });

    // Copy link logic
    const copyBtn = group.querySelector(".btn.copy");
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = "✅ Copied!";
        setTimeout(() => copyBtn.textContent = "🔗 Copy Link", 1400);
      } catch {
        prompt("Copy this link:", url);
      }
    });
  });
});
