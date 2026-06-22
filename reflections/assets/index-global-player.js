(() => {
  const playerWrap = document.getElementById('globalPlayer');
  const audio = document.getElementById('globalAudio');
  const source = document.getElementById('globalSource');

  const nowPlaying = document.getElementById('nowPlaying');

  const btnPrev = document.getElementById('btnPrev');
  const btnPlay = document.getElementById('btnPlay');
  const btnNext = document.getElementById('btnNext');

  const seekBar = document.getElementById('seekBar');
  const timeNow = document.getElementById('timeNow');
  const timeDur = document.getElementById('timeDur');

  if (!playerWrap || !audio || !source) return;

  // Always hidden at start
  playerWrap.classList.remove('is-visible');
  document.body.classList.remove('has-audio-bar');

  let playlist = [];
  let currentIndex = -1;

  function rebuildPlaylist(){
    playlist = Array.from(document.querySelectorAll('.track-link[data-src]'));
  }

  function setActive(btn){
    document.querySelectorAll('.track-link.active').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }

  function showPlayer(){
    playerWrap.classList.add('is-visible');
    document.body.classList.add('has-audio-bar');
  }

  function hidePlayer(){
    playerWrap.classList.remove('is-visible');
    document.body.classList.remove('has-audio-bar');
  }

  function fmt(t){
    if (!isFinite(t) || t < 0) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${String(s).padStart(2,'0')}`;
  }

  function syncPlayIcon(){
    if (!btnPlay) return;
    btnPlay.textContent = audio.paused ? '▶' : '⏸';
  }

  function loadByIndex(i, autoplay=true){
    rebuildPlaylist();
    if (!playlist.length) return;

    if (i < 0) i = playlist.length - 1;
    if (i >= playlist.length) i = 0;

    const btn = playlist[i];
    const src = btn.dataset.src;
    const title = btn.dataset.title || btn.textContent.replace(/^▶\s*/, '').trim() || 'Audio';

    if (!src) return;

    currentIndex = i;
    setActive(btn);

    if (source.getAttribute('src') !== src) {
      source.setAttribute('src', src);
      audio.load();
    }

    if (nowPlaying) nowPlaying.textContent = title;

    if (autoplay) {
      audio.play().then(() => {
        showPlayer();          // ✅ show ONLY when it really starts playing
        syncPlayIcon();
      }).catch(() => {
        // if autoplay blocked, keep hidden
        syncPlayIcon();
      });
    } else {
      syncPlayIcon();
    }
  }

  function playFromButton(btn){
    rebuildPlaylist();
    const i = playlist.indexOf(btn);
    loadByIndex(i, true);
  }

  // Click-to-play from any .track-link button
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.track-link[data-src]');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    btn.blur && btn.blur();
    playFromButton(btn);
  }, true);

  // Auto-next on end (loops)
  audio.addEventListener('ended', () => {
    if (currentIndex < 0) currentIndex = 0;
    loadByIndex(currentIndex + 1, true);
  });

  // Prev / Next buttons
  btnPrev && btnPrev.addEventListener('click', () => {
    if (currentIndex < 0) currentIndex = 0;
    loadByIndex(currentIndex - 1, true);
  });

  btnNext && btnNext.addEventListener('click', () => {
    if (currentIndex < 0) currentIndex = 0;
    loadByIndex(currentIndex + 1, true);
  });

  // Play/Pause button (manual)
  btnPlay && btnPlay.addEventListener('click', () => {
    // if nothing loaded yet, start first track
    if (!source.getAttribute('src')) {
      loadByIndex(0, true);
      return;
    }

    if (audio.paused) {
      audio.play().then(() => {
        showPlayer();          // ✅ show ONLY when playing starts
        syncPlayIcon();
      }).catch(() => {});
    } else {
      audio.pause();
      syncPlayIcon();

      // ✅ hide ONLY if paused at start (acts like stop)
      if (audio.currentTime === 0) hidePlayer();
    }
  });

  // Progress + seeking
  audio.addEventListener('loadedmetadata', () => {
    if (timeDur) timeDur.textContent = fmt(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    if (timeNow) timeNow.textContent = fmt(audio.currentTime);
    if (seekBar && isFinite(audio.duration) && audio.duration > 0) {
      seekBar.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
    }
  });

  seekBar && seekBar.addEventListener('input', () => {
    if (!isFinite(audio.duration) || audio.duration <= 0) return;
    const ratio = Number(seekBar.value) / 1000;
    audio.currentTime = ratio * audio.duration;
  });

  // ✅ the key rule:
  // show ONLY when playing
  audio.addEventListener('play', () => {
    showPlayer();
    syncPlayIcon();
  });

  // don’t hide on pause unless it’s “stopped at 0”
  audio.addEventListener('pause', () => {
    syncPlayIcon();
    if (audio.currentTime === 0 || audio.ended) hidePlayer();
  });
})();
