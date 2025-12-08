// /reflections/assets/reflections-header.js

function loadReflectionsHeader() {
  const placeholder = document.getElementById('ref-header-placeholder');
  if (!placeholder) return;

  fetch('/reflections/reflections-header.html')
    .then(res => res.text())
    .then(html => {
      placeholder.innerHTML = html;
      initReflectionsHeader();
    })
    .catch(err => console.error('Failed to load reflections header:', err));
}

function initReflectionsHeader() {
  const header = document.querySelector('.ref-header');
  if (!header) return;

  const toggle = header.querySelector('.nav-toggle');
  const overlay = document.querySelector('.ref-menu-overlay');
  const menuPanel = header.querySelector('.ref-menu-panel');
  const menuLinks = header.querySelectorAll('.ref-menu-link');
  const badgeLabel = header.querySelector('#current-page-label');
  const badgeIcon = header.querySelector('#current-page-icon');

  const currentPath = window.location.pathname;

  // -----------------------------
  // Hamburger open / close
  // -----------------------------
  if (toggle && menuPanel) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = header.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Close when clicking overlay
  if (overlay) {
    overlay.addEventListener('click', () => {
      header.classList.remove('menu-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  // Close when clicking outside header/menu
  document.addEventListener('click', (e) => {
    if (!header.classList.contains('menu-open')) return;
    if (header.contains(e.target)) return;
    header.classList.remove('menu-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  });

  // -----------------------------
  // Active link + badge content
  // -----------------------------
  let matched = null;

  menuLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Exact path match
    if (currentPath === href) {
      matched = link;
    }

    // Also treat "/reflections/" as index page
    if (!matched &&
        (currentPath === '/reflections/' || currentPath === '/reflections') &&
        href === '/reflections/index.html') {
      matched = link;
    }
  });

  if (matched) {
    matched.classList.add('active');
    if (badgeLabel) {
      badgeLabel.textContent = matched.textContent.trim();
    }
    if (badgeIcon) {
      const icon = matched.getAttribute('data-icon');
      if (icon) badgeIcon.textContent = icon;
    }
  }

  // -----------------------------
  // Local header buttons
  // -----------------------------
  const btnBack = document.getElementById('btnBack');
  const btnShare = document.getElementById('btnShare');
  const btnAudio = document.getElementById('btnAudio');

  if (btnBack) {
    btnBack.addEventListener('click', () => {
      history.back();
    });
  }

  if (btnShare) {
    btnShare.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: document.title || 'Solitude Reflection',
          url: window.location.href
        });
      } else {
        alert('Sharing is not supported on this device.');
      }
    });
  }

  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      const audio = document.getElementById('reflectionAudio');
      if (audio) {
        audio.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // -----------------------------
  // Audio playlist (generic)
  // -----------------------------
  const audioPlayer = document.getElementById('reflectionAudio');
  const audioSource = document.getElementById('audioSource');
  const rows = document.querySelectorAll('.playlist-row');

  if (audioPlayer && audioSource && rows.length > 0) {
    // Default track = first row
    const firstSrc = rows[0].dataset.src;
    if (firstSrc) {
      audioSource.src = firstSrc;
      audioPlayer.load();
    }

    // Click to switch tracks
    rows.forEach(row => {
      row.addEventListener('click', () => {
        rows.forEach(r => r.classList.remove('active'));
        row.classList.add('active');

        const src = row.dataset.src;
        if (src) {
          audioSource.src = src;
          audioPlayer.load();
          audioPlayer.play();
        }
      });
    });

    // Fill durations
    rows.forEach(row => {
      const src = row.dataset.src;
      if (!src) return;

      const tempAudio = new Audio(src);
      tempAudio.addEventListener('loadedmetadata', () => {
        const dur = tempAudio.duration;
        if (isNaN(dur)) return;

        const total = Math.floor(dur);
        const min = String(Math.floor(total / 60)).padStart(2, '0');
        const sec = String(total % 60).padStart(2, '0');
        const durEl = row.querySelector('.playlist-duration');
        if (durEl) durEl.textContent = `${min}:${sec}`;
      });
    });
  }
}

// Auto-run on every reflections page
document.addEventListener('DOMContentLoaded', loadReflectionsHeader);
