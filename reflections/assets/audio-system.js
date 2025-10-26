// === Omnibus Audio Embed System v3 ===
// One player plays at a time. Using: createAudioPlayer(src, title)

function createAudioPlayer(src, title) {
  return `
  <div class="audio-section">
    <p class="audio-label">🎧 Listen Audio: <strong>${title}</strong></p>
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
