// =========================================
// SOLITUDE REFLECTIONS — READ PAGE JS
// - Loads shared header
// - Handles hamburger + overlay + links
// - Handles Back / Share / Audio buttons
// - Handles simple audio playlist
// =========================================

// Load shared header into #ref-header-placeholder
document.addEventListener('DOMContentLoaded', () => {
  const placeholder = document.getElementById('ref-header-placeholder');
  if (placeholder) {
    fetch('/reflections/reflections-header.html')
      .then(res => res.text())
      .then(html => {
        placeholder.innerHTML = html;
        initRefHeader(placeholder);
      })
      .catch(err => console.warn('Reflections header load failed:', err));
  }

  initPlaylist(); // audio playlist for this page
});

// -----------------------------------------
// HEADER + HAMBURGER LOGIC
// -----------------------------------------
function initRefHeader(root) {
  const header   = root.querySelector('.ref-header');
  if (!header) return;

  const toggle   = header.querySelector('.nav-toggle');
  const panel    = header.querySelector('.ref-menu-panel');
  const overlay  = document.querySelector('.ref-menu-overlay'); // sibling after header
  const links    = header.querySelectorAll('.ref-menu-link');

  const btnBack  = header.querySelector('#btnBack');
  const btnShare = header.querySelector('#btnShare');
  const btnAudio = header.querySelector('#btnAudio');

  function openMenu() {
    header.classList.add('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    header.classList.remove('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  // ☰ toggle
  if (toggle) {
    toggle.addEventListener('click', () => {
      if (header.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  // Click overlay closes menu
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeMenu();
    });
  }

  // Menu links: close menu then navigate normally
  links.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
      // let browser follow href
    });
  });

  // Back button
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/reflections/index.html';
      }
    });
  }

  // Share button — uses global sharePage() if provided, else native share
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      if (typeof sharePage === 'function') {
        sharePage();
        return;
      }
      if (navigator.share) {
        navigator.share({
          title: document.title,
          text: 'Read this reflection by Ninox Antolihao.',
          url: window.location.href
        }).catch(() => {});
      } else {
        alert('Sharing not supported on this device.');
      }
    });
  }

  // Audio button — scroll to audio section
  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      const audioSection = document.querySelector('.audio-wrap');
      if (audioSection) {
        audioSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

// -----------------------------------------
// SIMPLE AUDIO PLAYLIST FOR READ PAGE
// -----------------------------------------
function initPlaylist() {
  const audio = document.getElementById('reflectionAudio');
  const srcEl = document.getElementById('audioSource');
  const rows  = document.querySelectorAll('.playlist-row');

  if (!audio || !srcEl || !rows.length) return;

  // Initialize with first active row or first row
  let currentRow = document.querySelector('.playlist-row.active') || rows[0];
  if (currentRow) {
    const firstSrc = currentRow.getAttribute('data-src');
    if (firstSrc) {
      srcEl.src = firstSrc;
      audio.load();
    }
  }

  rows.forEach(row => {
    row.addEventListener('click', () => {
      rows.forEach(r => r.classList.remove('active'));
      row.classList.add('active');

      const src = row.getAttribute('data-src');
      if (src) {
        srcEl.src = src;
        audio.load();
        audio.play().catch(() => {
          // autoplay might be blocked; ignore
        });
      }
    });
  });
}