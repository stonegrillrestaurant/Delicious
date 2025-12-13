/* reflections-header.js */
/* Screenshot-style unified header + sliding drawer + iOS scroll friendly */

(function(){
  const mount =
    document.getElementById("reflectionsHeader") ||
    document.getElementById("refHeaderMount");

  if(!mount) return;

  // Current slug: prefer data-current, fallback to URL
  const fromData = (mount.dataset && mount.dataset.current) ? mount.dataset.current.trim() : "";
  const fromUrl  = (location.pathname.match(/\/reflections\/pages\/([^/]+)\/read\.html/i) || [])[1] || "";
  const current  = fromData || fromUrl || "";

  // Your list (kept as-is, including the “fath” slug)
  const pages = [
    { slug:"divine-hiddeness", title:"Divine Premise", sub:"Stone Grill Reflections" },
    { slug:"subconsciousmind", title:"The Subconscious Mind", sub:"Solitude Reflections" },
    { slug:"the-god-we-created", title:"The God We Created", sub:"Solitude Reflections" },
    { slug:"the-paradox-of-god", title:"The Paradox of God", sub:"Solitude Reflections" },
    { slug:"the-inner-listener", title:"The Prayer", sub:"Solitude Reflections" },
    { slug:"transcendence", title:"Transcendence", sub:"Solitude Reflections" },
    { slug:"the-madness-of-fath", title:"The Madness of Faith", sub:"Solitude Reflections" },
    { slug:"the-lost-language-of-metaphor", title:"The Lost Language of Metaphor", sub:"Solitude Reflections" },
    { slug:"belief", title:"BELIEF AND GOODNESS", sub:"Solitude Reflections" },
    { slug:"question-label-sinner", title:"Seeking Asurance is Labeled A Sinner", sub:"Solitude Reflections" },
    { slug:"initial-premise", title:"The initial Premise of a Perfect Loving God", sub:"Solitude Reflections" },
    { slug:"diety", title:"THE DEITY", sub:"Solitude Reflections" },
    { slug:"silent-influence", title:"Silent Influence", sub:"Solitude Reflections" },
    { slug:"oneness-duality", title:"Oneness Duality", sub:"Solitude Reflections" },
    { slug:"mirror-of-worship", title:"The Mirror of Worship", sub:"Solitude Reflections" },
    { slug:"moral-choice", title:"The Moral Choice of Duality", sub:"Solitude Reflections" },
  ];

  const me = pages.find(p => p.slug === current) || null;

  // Title shown in header (use page list > window.REFLECTION_PAGE > fallback)
  const pageTitle =
    (me && me.title) ||
    (window.REFLECTION_PAGE && window.REFLECTION_PAGE.title) ||
    "Reflection";

  const pageSub =
    (me && me.sub) ||
    "Stone Grill Reflections";

  // Your logo (same as your screenshot setup)
  const brandLogo = "/reflections/assets/logo1.PNG";

  const listHTML = [
    // HOME always on top
    `<li>
      <a class="ref-drawer-link" href="/reflections/index.html">
        <div class="t">HOME</div>
        <div class="s">All reflections</div>
      </a>
    </li>`
  ].concat(
    pages.map(p => {
      const active = (p.slug === current) ? " is-active" : "";
      return `
        <li>
          <a class="ref-drawer-link${active}" href="/reflections/pages/${p.slug}/read.html" data-slug="${p.slug}">
            <div class="t">${esc(p.title)}</div>
            <div class="s">${esc(p.sub || "Solitude Reflections")}</div>
          </a>
        </li>
      `.trim();
    })
  ).join("");

  // Build header markup to match screenshot (hamburger + pills on right)
  mount.innerHTML = `
    <header class="ref-header-shell">
      <div class="ref-header-inner">
        <div class="ref-left">
          <a class="ref-brand" href="/reflections/index.html" aria-label="Reflections Home">
            <img class="ref-brand-logo" src="${brandLogo}" alt="Solitude">
            <div class="ref-titlewrap">
              <div class="ref-pagetitle">${esc(pageTitle)}</div>
              <div class="ref-subtitle">${esc(pageSub)}</div>
            </div>
          </a>
        </div>

        <div class="ref-actions">
          <button class="ref-ham" type="button" aria-label="Open menu" aria-expanded="false">≡</button>
          <button class="ref-pill" id="refBack" type="button">Back</button>
          <button class="ref-pill" id="refShare" type="button">Share</button>
          <button class="ref-pill" id="refAudio" type="button">Audio</button>
        </div>
      </div>
    </header>

    <nav class="ref-drawer" aria-hidden="true">
      <div class="ref-drawer-card">
        <div class="ref-drawer-head">
          <div class="ref-drawer-title">REFLECTIONS</div>
          <button class="ref-drawer-close" type="button" aria-label="Close menu">×</button>
        </div>

        <ul class="ref-drawer-list">
          ${listHTML}
        </ul>
      </div>
    </nav>

    <div class="ref-overlay" aria-hidden="true"></div>
  `.trim();

  const header  = mount.querySelector(".ref-header-shell");
  const ham     = mount.querySelector(".ref-ham");
  const drawer  = mount.querySelector(".ref-drawer");
  const overlay = mount.querySelector(".ref-overlay");
  const closeBt = mount.querySelector(".ref-drawer-close");

  const btnBack  = mount.querySelector("#refBack");
  const btnShare = mount.querySelector("#refShare");
  const btnAudio = mount.querySelector("#refAudio");

  function openMenu(){
    header.classList.add("menu-open");
    ham.setAttribute("aria-expanded","true");
    drawer.setAttribute("aria-hidden","false");
    overlay.setAttribute("aria-hidden","false");
    document.body.classList.add("ref-menu-lock");
  }

  function closeMenu(){
    header.classList.remove("menu-open");
    ham.setAttribute("aria-expanded","false");
    drawer.setAttribute("aria-hidden","true");
    overlay.setAttribute("aria-hidden","true");
    document.body.classList.remove("ref-menu-lock");
  }

  ham.addEventListener("click", () => {
    header.classList.contains("menu-open") ? closeMenu() : openMenu();
  });

  overlay.addEventListener("click", closeMenu);
  closeBt.addEventListener("click", closeMenu);

  // ESC closes drawer
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && header.classList.contains("menu-open")) closeMenu();
  });

  // Back
  btnBack.addEventListener("click", () => {
    if(history.length > 1) history.back();
    else location.href = "/reflections/index.html";
  });

  // Share
  btnShare.addEventListener("click", async () => {
    const shareData = {
      title: document.title || pageTitle,
      text: pageTitle,
      url: location.href
    };
    try{
      if(navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied!");
      }
    }catch(_){}
  });

  // Audio (scroll to first audio)
  btnAudio.addEventListener("click", () => {
    const a = document.querySelector("audio");
    if(!a) return;
    a.scrollIntoView({behavior:"smooth", block:"center"});
    try{ a.play(); }catch(_){}
  });

  function esc(str){
    return String(str ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

})();
