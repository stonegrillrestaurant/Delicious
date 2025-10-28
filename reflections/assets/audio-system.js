// === Omnibus Audio Embed System (clean) ===
// Usage in HTML: document.write(createAudioPlayer(src, title));
function createAudioPlayer(src, title) {
  return `
  <div class="audio-section">
    <p class="audio-label">🎧 Audio Reflection: <strong>${title}</strong></p>
    <audio controls preload="none" class="audio-player">
      <source src="${src}" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>
  </div>`;
}

// Pause other audios when one plays
document.addEventListener('play', function (e) {
  if (e.target.tagName !== 'AUDIO') return;
  document.querySelectorAll('audio').forEach(a => { if (a !== e.target) a.pause(); });
}, true);

// === Minimal Universal Share (one button only) ===
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".share-group").forEach(group => {
    const url = group.dataset.shareUrl?.trim() || location.href;
    const title = group.dataset.shareTitle || document.title;

    // Render a single Share button
    group.innerHTML = `<button class="btn share-any" type="button">📤 Share</button>`;

    // Native share on mobile; fallback to FB sharer
    group.querySelector(".share-any").addEventListener("click", async () => {
      if (navigator.share) {
        try { await navigator.share({ title, url }); } catch { /* user canceled */ }
      } else {
        window.open(
          "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url),
          "_blank",
          "noopener"
        );
      }
    });
  });
});