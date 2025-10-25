<script>
// === Omnibus Audio Embed System v2 ===
// One player plays at a time. Using: createAudioPlayer(src, title)

function createAudioPlayer(src, title) {
  return `
  <div class="audio-section">
    <p class="audio-label">🎧 Audio Reflection: <strong>${title}</strong></p>
    <audio controls preload="auto" class="audio-player">
      <source src="${src}" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>
    <button class="audio-stop">⏹ Stop</button>
  </div>`;
}

// Global listener: stop others when one plays
document.addEventListener('play', function(e) {
  const audios = document.querySelectorAll('audio');
  audios.forEach(audio => {
    if (audio !== e.target) audio.pause();
  });
}, true);

// Stop button function (using event delegation)
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('audio-stop')) {
    const audio = e.target.previousElementSibling;
    audio.pause();
    audio.currentTime = 0;
  }
});
</script>