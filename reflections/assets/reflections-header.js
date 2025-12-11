/* reflections-header.js */
/* Builds the unified header on each read.html page */

(function(){

  const container = document.getElementById('reflectionsHeader');
  if (!container) return;

  const current = container.dataset.current || "";

  // ===== ALL PAGES (UPDATE ANYTIME YOU ADD NEW REFLECTIONS) =====
  const pages = [
    { slug:"the-paradox-of-god", title:"The Paradox of God", cover:"/reflections/pages/the-paradox-of-god/paradoxofgod-cover.jpg" },
    { slug:"the-lost-language-of-metaphor", title:"The Lost Language of Metaphor", cover:"/reflections/pages/the-lost-language-of-metaphor/metaphor-cover.jpg" },
    { slug:"the-prayer", title:"The Prayer — The Inner Listener", cover:"/reflections/pages/the-prayer/theinnerlistener.jpg" },
    // Add ALL your reflections here…
  ];

  const me = pages.find(p => p.slug === current);

  container.innerHTML = `
    <div class="ref-header-shell">
      <div class="ref-header-inner">

        <img class="ref-header-cover"
             src="${me ? me.cover : '/reflections/assets/default-cover.jpg'}"
             alt="cover">

        <div class="ref-header-title-wrap">
          <div class="ref-header-title">${me ? me.title : "Reflection"}</div>
          <div class="ref-header-sub">Stone Grill Reflections</div>
        </div>

        <button class="ref-header-ham" id="refHam">☰</button>
      </div>

      <div class="ref-nav-panel" id="refNavPanel">
        <div class="ref-nav-title">All Reflections</div>
        <ul class="ref-nav-list">
          ${pages.map(p =>
            `<li><a href="/reflections/pages/${p.slug}/read.html"
                   class="${p.slug === current ? 'is-current' : ''}">
                ${p.title}
             </a></li>`).join("")}
        </ul>
      </div>
    </div>
  `;

  // ===== Expand / Collapse Nav =====
  const ham = document.getElementById("refHam");
  const nav = document.getElementById("refNavPanel");

  ham.addEventListener("click", () => {
    nav.classList.toggle("show");
  });

})();
