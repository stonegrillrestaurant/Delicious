const audio = document.getElementById("bg-music");
const button = document.getElementById("music-btn");

audio.volume = 0.2;

function toggleMusic() {
  if (audio.paused) {
    audio.play();
    button.innerText = "🔈 Music: On";
  } else {
    audio.pause();
    button.innerText = "🔇 Music: Off";
  }
}

window.addEventListener('load', () => {
  audio.muted = true;
  audio.play().then(() => {
    audio.muted = false;
    audio.volume = 0.2;
  }).catch(() => {
    // autoplay failed (user hasn't interacted yet)
  });
});