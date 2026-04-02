/* ===== BLOCK: DRAWER ===== */
function openDrawer(){
  const drawer = document.querySelector('.app-drawer');
  const overlay = document.querySelector('.drawer-overlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('show');
}

function closeDrawer(){
  const drawer = document.querySelector('.app-drawer');
  const overlay = document.querySelector('.drawer-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
}

/* ===== BLOCK: SCROLL HELPERS ===== */
function scrollToAudio(){
  const el = document.getElementById('audioSection');
  if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
}

function scrollToComments(){
  const el = document.getElementById('commentsSection');
  if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
  closeDrawer();
}

/* ===== BLOCK: SHARE ===== */
async function sharePage(){
  const data = {
    title: document.title,
    text: document.title,
    url: location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(data);
    } catch(e) {}
  } else {
    copyPageLink();
  }
  closeDrawer();
}

async function copyPageLink(){
  try{
    await navigator.clipboard.writeText(location.href);
    alert('Link copied.');
  }catch(e){
    prompt('Copy this link:', location.href);
  }
  closeDrawer();
}

/* ===== BLOCK: CUSDIS PAGE DATA ===== */
(function setCusdisPage(){
  const el = document.getElementById('cusdis_thread');
  if (!el) return;
  el.setAttribute('data-page-id', location.pathname);
  el.setAttribute('data-page-url', location.href);
  el.setAttribute('data-page-title', document.title);
})();

/* ===== BLOCK: REFLECTION NAV ===== */
(function buildReflectionNav(){
  const navList = document.getElementById('reflectionNavList');
  const currentSlug = document.body.dataset.reflectionSlug || '';
  if (!navList) return;

  const existingHome = navList.innerHTML;

  if (!Array.isArray(window.reflections) || !window.reflections.length) return;

  navList.innerHTML = existingHome;

  window.reflections.forEach(item => {
    if (!item || !item.slug || !item.title) return;

    const a = document.createElement('a');
    a.href = `/reflections/pages/${item.slug}/read.html`;
    a.textContent = item.title;
    a.className = 'drawer-link';

    if (item.slug === currentSlug) {
      a.classList.add('active');
    }

    navList.appendChild(a);
  });
})();

/* ===== BLOCK: AUDIO PLAYER ===== */
document.addEventListener('DOMContentLoaded', () => {
  const audioPlayer = document.getElementById('reflectionAudio');
  const audioSource = document.getElementById('audioSource');
  const rows = Array.from(document.querySelectorAll('.playlist-row'));
  const playPauseBtn = document.getElementById('playPauseBtn');
  const prevTrackBtn = document.getElementById('prevTrackBtn');
  const nextTrackBtn = document.getElementById('nextTrackBtn');

  let currentIndex = 0;

  function loadTrack(index, autoPlay = false){
    if (!rows.length || !audioSource || !audioPlayer) return;

    currentIndex = (index + rows.length) % rows.length;
    rows.forEach(r => r.classList.remove('active'));

    const row = rows[currentIndex];
    row.classList.add('active');

    const src = row.dataset.src;
    if (!src) return;

    audioSource.src = src;
    audioPlayer.load();

    if (autoPlay) {
      audioPlayer.play().catch(() => {});
    }
  }

  rows.forEach((row, index) => {
    row.addEventListener('click', () => {
      loadTrack(index, true);
    });
  });

  if (playPauseBtn && audioPlayer) {
    playPauseBtn.addEventListener('click', () => {
      if (audioPlayer.paused) {
        audioPlayer.play().catch(() => {});
      } else {
        audioPlayer.pause();
      }
    });
  }

  if (prevTrackBtn) {
    prevTrackBtn.addEventListener('click', () => {
      loadTrack(currentIndex - 1, true);
    });
  }

  if (nextTrackBtn) {
    nextTrackBtn.addEventListener('click', () => {
      loadTrack(currentIndex + 1, true);
    });
  }

  if (audioPlayer) {
    audioPlayer.addEventListener('ended', () => {
      loadTrack(currentIndex + 1, true);
    });
  }

  loadTrack(0, false);
});