// /reflections/assets/reflections-header.js

function loadReflectionsHeader() {
  const placeholder = document.getElementById('ref-header-placeholder');
  if (!placeholder) return;

  fetch('/reflections/reflections-header.html')
    .then(response => response.text())
    .then(html => {
      placeholder.innerHTML = html;

      // After header is injected, wire up behavior
      initReflectionsHeader();
    })
    .catch(err => {
      console.error('Failed to load reflections header:', err);
    });
}

function initReflectionsHeader() {
  const header = document.querySelector('.ref-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.ref-nav');
  const overlay = document.querySelector('.nav-overlay');  // NEW
  const navLinks = nav ? nav.querySelectorAll('a') : [];
  const currentPath = window.location.pathname;

  // -----------------------------
  // HAMBURGER OPEN / CLOSE
  // -----------------------------
  if (header && toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu when a link is clicked (mobile)
    nav.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'a') {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // -----------------------------------------
  // CLOSE MENU WHEN CLICKING OUTSIDE (OVERLAY)
  // -----------------------------------------
  if (overlay) {
    overlay.addEventListener('click', () => {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  // -----------------------------------------
  // AUTO-SET ACTIVE LINK + CURRENT PAGE BADGE
  // -----------------------------------------
  let matchedLink = null;

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Normal match
    if (currentPath === href) {
      matchedLink = link;
    }

    // Handle index page
    if (!matchedLink &&
        (currentPath === '/reflections/' || currentPath === '/reflections') &&
        href === '/reflections/index.html') {
      matchedLink = link;
    }
  });

  // Update label + icon in badge
  if (matchedLink) {
    matchedLink.classList.add('active');

    const currentLabel = document.getElementById('current-page-label');
    const currentIcon = document.getElementById('current-page-icon');

    if (currentLabel) {
      currentLabel.textContent = matchedLink.textContent.trim();
    }

    if (currentIcon) {
      const icon = matchedLink.getAttribute('data-icon');
      if (icon) currentIcon.textContent = icon;
    }
  }
}

// Auto-run
document.addEventListener('DOMContentLoaded', loadReflectionsHeader);