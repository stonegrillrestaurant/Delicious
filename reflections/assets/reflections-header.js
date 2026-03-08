/* reflections-header.js */

(function () {

  const mount =
    document.getElementById("reflectionsHeader") ||
    document.getElementById("refHeaderMount");

  if (!mount) return;

  const fromData = (mount.dataset && mount.dataset.current) ? mount.dataset.current.trim() : "";
  const fromUrl = (location.pathname.match(/\/reflections\/pages\/([^/]+)\/read\.html/i) || [])[1] || "";
  const current = fromData || fromUrl || "";

  const pages = [

    { slug: "divine-hiddeness", title: "Divine Premise", sub: "Stone Grill Reflections" },
    { slug: "subconsciousmind", title: "The Subconscious Mind", sub: "Solitude Reflections" },
    { slug: "the-god-we-created", title: "The God We Created", sub: "Solitude Reflections" },
    { slug: "the-paradox-of-god", title: "The Paradox of God", sub: "Solitude Reflections" },
    { slug: "the-inner-listener", title: "The Prayer", sub: "Solitude Reflections" },
    { slug: "transcendence", title: "Transcendence", sub: "Solitude Reflections" },
    { slug: "the-madness-of-faith", title: "The Madness of Faith", sub: "Solitude Reflections" },
    { slug: "the-lost-language-of-metaphor", title: "The Lost Language of Metaphor", sub: "Solitude Reflections" },
    { slug: "belief", title: "Belief and Goodness", sub: "Solitude Reflections" },
    { slug: "question-label-sinner", title: "Seeking Assurance is Labeled A Sinner", sub: "Solitude Reflections" },
    { slug: "initial-premise", title: "The Initial Premise", sub: "Solitude Reflections" },
    { slug: "diety", title: "The Deity", sub: "Solitude Reflections" },
    { slug: "silent-influence", title: "Silent Influence", sub: "Solitude Reflections" },
    { slug: "oneness-duality", title: "Oneness Duality", sub: "Solitude Reflections" },
    { slug: "mirror-of-worship", title: "The Mirror of Worship", sub: "Solitude Reflections" },
    { slug: "moral-choice", title: "The Moral Choice of Duality", sub: "Solitude Reflections" },

    { slug: "godevil", title: "Good and Evil", sub: "Solitude Reflections" },
    { slug: "kingdom-within", title: "The Kingdom Within", sub: "Solitude Reflections" },
    { slug: "feeding-the-soul", title: "Feeding the Soul", sub: "Solitude Reflections" }

  ];

  const me = pages.find(p => p.slug === current) || null;

  const pageTitle =
    (me && me.title) ||
    (window.REFLECTION_PAGE && window.REFLECTION_PAGE.title) ||
    "Reflection";

  const pageSub =
    (me && me.sub) ||
    "Stone Grill Reflections";

  const brandLogo = "/reflections/assets/logo1.PNG";

  const listHTML = [
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
          <a class="ref-drawer-link${active}" href="/reflections/pages/${p.slug}/read.html">
            <div class="t">${esc(p.title)}</div>
            <div class="s">${esc(p.sub)}</div>
          </a>
        </li>
      `.trim();

    })
  ).join("");

  mount.innerHTML = `
    <header class="ref-header-shell">

      <div class="ref-header-inner">

        <div class="ref-left">

          <a class="ref-brand" href="/reflections/index.html">

            <img class="ref-brand-logo" src="${brandLogo}">

            <div class="ref-titlewrap">
              <div class="ref-pagetitle">${esc(pageTitle)}</div>
              <div class="ref-subtitle">${esc(pageSub)}</div>
            </div>

          </a>

        </div>

        <div class="ref-actions">

          <button class="ref-ham" type="button">≡</button>

          <button class="ref-pill" id="refBack">Back</button>

          <button class="ref-pill" id="refShare">Share</button>

          <button class="ref-pill" id="refAudio">Audio</button>

        </div>

      </div>

    </header>

    <nav class="ref-drawer">

      <div class="ref-drawer-card">

        <div class="ref-drawer-head">
          <div class="ref-drawer-title">REFLECTIONS</div>
          <button class="ref-drawer-close">×</button>
        </div>

        <ul class="ref-drawer-list">

          ${listHTML}

        </ul>

      </div>

    </nav>

    <div class="ref-overlay"></div>

  `;

  const header = mount.querySelector(".ref-header-shell");
  const ham = mount.querySelector(".ref-ham");
  const drawer = mount.querySelector(".ref-drawer");
  const overlay = mount.querySelector(".ref-overlay");
  const closeBt = mount.querySelector(".ref-drawer-close");

  const btnBack = mount.querySelector("#refBack");
  const btnShare = mount.querySelector("#refShare");

  function openMenu() {

    header.classList.add("menu-open");

    drawer.style.display = "block";
    overlay.style.display = "block";

  }

  function closeMenu() {

    header.classList.remove("menu-open");

    drawer.style.display = "none";
    overlay.style.display = "none";

  }

  ham.addEventListener("click", openMenu);

  overlay.addEventListener("click", closeMenu);

  closeBt.addEventListener("click", closeMenu);

  btnBack.addEventListener("click", () => {

    if (history.length > 1) history.back();
    else location.href = "/reflections/index.html";

  });

  btnShare.addEventListener("click", async () => {

    const shareData = {
      title: document.title,
      url: location.href
    };

    try {

      if (navigator.share) await navigator.share(shareData);

      else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied!");
      }

    } catch (e) {}

  });

  function esc(s) {
    return String(s || "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;");
  }

})();