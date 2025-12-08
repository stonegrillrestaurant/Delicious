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
  const navLinks = nav ? nav.querySelectorAll('a') : [];
  const currentPath = window.location.pathname;

  // -----------------------------------------
  // HAMBURGER OPEN / CLOSE
  // -----------------------------------------
  if (header && toggle && nav) {

    // Toggle menu open/close
    toggle.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent immediate closing from document listener

      const isOpen = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // When clicking a menu item — close menu
    nav.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'a') {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // -----------------------------------------
    // CLOSE MENU WHEN CLICKING ANYWHERE OUTSIDE
    // -----------------------------------------
    document.addEventListener('click', (e) => {

      // Only act if menu is open
      if (!header.classList.contains('nav-open')) return;

      // If click is inside header, ignore
      if (header.contains(e.target)) return;

      // Else close
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  // -----------------------------------------
  // AUTO-HIGHLIGHT ACTIVE LINK + SET BADGE
  // -----------------------------------------
  let matchedLink = null;

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Direct match
    if (currentPath === href) matchedLink = link;

    // Special case for /reflections (no index.html)
    if (!matchedLink &&
        (currentPath === '/reflections/' || currentPath === '/reflections') &&
        href === '/reflections/index.html') {
      matchedLink = link;
    }
  });

  // Update header badge with page title + icon
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