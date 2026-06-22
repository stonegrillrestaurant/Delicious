document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.getElementById('refDropdown');
  const reflectionsMenu = document.getElementById('reflectionsMenu');

  if (reflectionsMenu && Array.isArray(window.REFLECTION_LINKS)) {
    reflectionsMenu.innerHTML = '';

    window.REFLECTION_LINKS.forEach(item => {
      const link = document.createElement('a');
      link.href = item.url;
      link.textContent = item.title;

      if (window.location.pathname === item.url) {
        link.classList.add('current');
      }

      reflectionsMenu.appendChild(link);
    });
  }

  if (dropdown) {
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('active');
    });
  }
});