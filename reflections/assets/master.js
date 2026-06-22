/* =========================================================
   SOLITUDE REFLECTIONS — MASTER JS
   Hero -> Audio/Explore -> Article
   Keeps hero
   Adds theme toggle
   Adds paged swipe/wheel behavior on larger screens
   ========================================================= */

(function () {
  "use strict";

  const state = {
    slug: null,
    data: null,
    currentPanel: 0,
    totalPanels: 3,
    animatingPanel: false,
    touchStartY: 0,
    touchDeltaY: 0,
    activeCategory: null,
    activeTrackIndex: 0
  };

  function getAllReflections() {
    if (typeof REFLECTION_DATA !== "undefined" && REFLECTION_DATA && typeof REFLECTION_DATA === "object") {
      return REFLECTION_DATA;
    }

    if (typeof REFLECTIONS !== "undefined" && REFLECTIONS && typeof REFLECTIONS === "object") {
      return REFLECTIONS;
    }

    if (typeof window.REFLECTION_DATA !== "undefined" && window.REFLECTION_DATA && typeof window.REFLECTION_DATA === "object") {
      return window.REFLECTION_DATA;
    }

    if (typeof window.REFLECTIONS !== "undefined" && window.REFLECTIONS && typeof window.REFLECTIONS === "object") {
      return window.REFLECTIONS;
    }

    return {};
  }

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getSlugFromPage() {
    const explicit = document.body?.dataset?.reflectionSlug;
    if (explicit) return explicit;

    const match = window.location.pathname.match(/\/pages\/([^/]+)\//);
    return match ? match[1] : null;
  }

  function normalizeCategory(category) {
    const raw = String(category || "").trim().toLowerCase();
    if (raw === "spirituality") return "spirituality";
    if (raw === "human" || raw === "human-nature" || raw === "human nature") return "human";
    if (raw === "religion") return "religion";
    return "religion";
  }

  function themeClassFor(category) {
    const c = normalizeCategory(category);
    if (c === "spirituality") return "spirituality";
    if (c === "human") return "human";
    return "religion";
  }

  function getReflectionData() {
    const all = getAllReflections();
    const slug = getSlugFromPage();
    state.slug = slug;

    if (!slug || !all[slug]) {
      console.warn("Reflection not found for slug:", slug);
      return null;
    }

    return all[slug];
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem("sr-theme", theme);
    } catch (err) {
      console.warn("Theme save failed:", err);
    }
  }

  function loadTheme() {
    try {
      return localStorage.getItem("sr-theme");
    } catch (err) {
      return null;
    }
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function initThemeToggle() {
    const stored = loadTheme();
    if (stored) applyTheme(stored);

    const btn = qs("[data-theme-toggle]");
    if (!btn) return;

    btn.addEventListener("click", function () {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const nextTheme = isLight ? "dark" : "light";
      applyTheme(nextTheme === "light" ? "light" : "dark");
      saveTheme(nextTheme);
    });
  }

  function getTracks(item) {
    const tracks = [];
    if (item.audio1) {
      tracks.push({
        label: item.audio1Label || "Reflection",
        src: item.audio1,
        title: item.title
      });
    }
    if (item.audio2) {
      tracks.push({
        label: item.audio2Label || "Podcast",
        src: item.audio2,
        title: `${item.title} Podcast`
      });
    }
    return tracks;
  }

  function renderHero(item) {
    const heroImage = qs("[data-hero-image]");
    const heroTitle = qs("[data-hero-title]");
    const heroSubtitleTrack = qs("[data-hero-subtitle-track]");
    const heroCategory = qs("[data-hero-category]");
    const heroMeta = qs("[data-hero-meta]");

    if (heroImage) {
      heroImage.src = item.cover || "";
      heroImage.alt = item.title || "Reflection cover";
    }

    if (heroTitle) heroTitle.textContent = item.title || "";

    if (heroSubtitleTrack) {
      const subtitle = escapeHtml(item.subtitle || "");
      heroSubtitleTrack.innerHTML = `
        <span class="hero-subtitle">${subtitle}</span>
        <span class="hero-subtitle">${subtitle}</span>
      `;
    }

    if (heroCategory) {
      heroCategory.textContent = normalizeCategory(item.category);
    }

    if (heroMeta) {
      heroMeta.innerHTML = `
        <span><strong>By:</strong> Ninox Antolihao</span>
        <span><strong>Category:</strong> ${escapeHtml(item.category || "Reflection")}</span>
      `;
    }
  }

  function renderAudio(item) {
    const tracks = getTracks(item);
    const trackGrid = qs("[data-track-grid]");
    const audio = qs("[data-main-audio]");
    const title = qs("#nowPlayingTitle");

    if (!trackGrid || !audio) return;

    trackGrid.innerHTML = tracks.map(function (track, index) {
      return `
        <button class="track-item ${index === 0 ? "active-track" : ""}" type="button" data-track-index="${index}">
          <span class="track-status-dot"></span>
          <span class="track-copy">
            <span class="track-label">${escapeHtml(track.label)}</span>
            <span class="track-title">${escapeHtml(track.title)}</span>
          </span>
          <span class="track-play-icon" aria-hidden="true">▶</span>
        </button>
      `;
    }).join("");

    if (tracks[0]) {
      audio.src = tracks[0].src;
      if (title) title.textContent = tracks[0].title;
      state.activeTrackIndex = 0;
    }

    trackGrid.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-track-index]");
      if (!btn) return;

      const index = Number(btn.getAttribute("data-track-index"));
      const track = tracks[index];
      if (!track) return;

      state.activeTrackIndex = index;
      audio.src = track.src;
      audio.play().catch(function () {});
      if (title) title.textContent = track.title;

      qsa(".track-item", trackGrid).forEach(function (node) {
        node.classList.remove("active-track");
      });
      btn.classList.add("active-track");
    });

    audio.addEventListener("play", function () {
      document.body.classList.add("is-playing");
    });

    audio.addEventListener("pause", function () {
      document.body.classList.remove("is-playing");
    });

    audio.addEventListener("ended", function () {
      document.body.classList.remove("is-playing");
    });
  }

  function buildExploreCard(slug, item) {
    const theme = themeClassFor(item.category);
    return `
      <a class="explore-card-link" href="#" data-open-reflection="${escapeHtml(slug)}">
        <div class="explore-card-topline">
          <span class="explore-topic-dot ${theme}"></span>
          <h3 class="explore-card-title">${escapeHtml(item.title || "")}</h3>
        </div>
        <p class="explore-card-desc">${escapeHtml(item.subtitle || item.description || "")}</p>
      </a>
    `;
  }

  function renderExplore(currentItem) {
    const all = getAllReflections();
    const listGrid = qs("[data-explore-list]");
    const catButtons = qsa("[data-category]");

    if (!listGrid) return;

    const currentCategory = normalizeCategory(currentItem.category);
    state.activeCategory = currentCategory;

    function draw(category) {
      state.activeCategory = category;

      catButtons.forEach(function (btn) {
        btn.classList.toggle("active", btn.getAttribute("data-category") === category);
      });

      const entries = Object.entries(all).filter(function ([slug, item]) {
        if (!item || slug === state.slug) return false;
        return normalizeCategory(item.category) === category;
      });

      listGrid.innerHTML = entries.length
        ? entries.map(function ([slug, item]) { return buildExploreCard(slug, item); }).join("")
        : `<div class="explore-card-link"><p class="explore-card-desc">No reflections found in this category yet.</p></div>`;
    }

    catButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        draw(btn.getAttribute("data-category"));
      });
    });

    listGrid.addEventListener("click", function (e) {
      const link = e.target.closest("[data-open-reflection]");
      if (!link) return;

      e.preventDefault();
      const slug = link.getAttribute("data-open-reflection");
      if (!slug) return;

      const allData = getAllReflections();
      const next = allData[slug];
      if (!next || !next.read) return;

      window.location.href = next.read;
    });

    draw(currentCategory);
  }

  function renderArticle(item) {
    const articleTitle = qs("[data-article-title]");
    const articleSubline = qs("[data-article-subline]");
    const articleBody = qs("[data-article-body]");

    if (articleTitle) articleTitle.textContent = item.title || "";
    if (articleSubline) articleSubline.textContent = item.subtitle || "";
    if (articleBody) articleBody.innerHTML = item.articleHtml || "<p>No article content found.</p>";
  }

  function setPanel(index) {
    const max = state.totalPanels - 1;
    const next = Math.max(0, Math.min(index, max));
    if (next === state.currentPanel || state.animatingPanel) return;

    state.animatingPanel = true;
    state.currentPanel = next;
    document.body.setAttribute("data-panel", String(next));

    window.setTimeout(function () {
      state.animatingPanel = false;
    }, 520);
  }

  function canUsePanelMode() {
    return window.innerWidth > 640;
  }

  function movePanel(direction) {
    if (direction > 0) {
      setPanel(state.currentPanel + 1);
    } else if (direction < 0) {
      setPanel(state.currentPanel - 1);
    }
  }

  function initPanelMode() {
    document.body.setAttribute("data-panel", "0");

    function refreshMode() {
      if (canUsePanelMode()) {
        document.body.classList.remove("sr-mobile-flow");
      } else {
        document.body.classList.add("sr-mobile-flow");
      }
    }

    refreshMode();
    window.addEventListener("resize", refreshMode);

    window.addEventListener("wheel", function (e) {
      if (!canUsePanelMode()) return;

      const articleScroll = qs("[data-article-scroll]");
      if (!articleScroll) return;

      if (state.currentPanel < 2) {
        if (Math.abs(e.deltaY) < 12) return;
        e.preventDefault();
        movePanel(e.deltaY > 0 ? 1 : -1);
        return;
      }

      const atTop = articleScroll.scrollTop <= 0;
      const goingUp = e.deltaY < 0;

      if (atTop && goingUp) {
        e.preventDefault();
        movePanel(-1);
      }
    }, { passive: false });

    window.addEventListener("touchstart", function (e) {
      if (!canUsePanelMode()) return;
      if (!e.touches || !e.touches[0]) return;
      state.touchStartY = e.touches[0].clientY;
      state.touchDeltaY = 0;
    }, { passive: true });

    window.addEventListener("touchmove", function (e) {
      if (!canUsePanelMode()) return;
      if (!e.touches || !e.touches[0]) return;
      state.touchDeltaY = e.touches[0].clientY - state.touchStartY;
    }, { passive: true });

    window.addEventListener("touchend", function () {
      if (!canUsePanelMode()) return;

      const articleScroll = qs("[data-article-scroll]");
      const threshold = 54;

      if (state.currentPanel < 2) {
        if (state.touchDeltaY < -threshold) movePanel(1);
        if (state.touchDeltaY > threshold) movePanel(-1);
        return;
      }

      if (!articleScroll) return;

      const atTop = articleScroll.scrollTop <= 0;
      if (atTop && state.touchDeltaY > threshold) {
        movePanel(-1);
      }
    }, { passive: true });
  }

  function initBackButton() {
    const back = qs("[data-go-back]");
    if (!back) return;

    back.addEventListener("click", function () {
      history.back();
    });
  }

  function initHomeButton() {
    const home = qs("[data-go-home]");
    if (!home) return;

    home.addEventListener("click", function () {
      window.location.href = "/reflections/";
    });
  }

  function initShareButton(item) {
    const btn = qs("[data-share]");
    if (!btn) return;

    btn.addEventListener("click", async function () {
      const url = item.canonical || window.location.href;
      const title = item.title || document.title;
      const text = item.subtitle || item.description || "";

      try {
        if (navigator.share) {
          await navigator.share({ title, text, url });
          return;
        }

        await navigator.clipboard.writeText(url);
        alert("Link copied.");
      } catch (err) {
        console.warn("Share failed:", err);
      }
    });
  }

  function initPanelJumpButtons() {
    qsa("[data-panel-target]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const target = Number(btn.getAttribute("data-panel-target"));
        if (Number.isFinite(target)) setPanel(target);
      });
    });
  }

  function applyCategoryAccent(item) {
    const body = document.body;
    body.classList.remove("theme-spirituality", "theme-human", "theme-religion");

    const category = normalizeCategory(item.category);
    if (category === "spirituality") {
      body.classList.add("theme-spirituality");
    } else if (category === "human") {
      body.classList.add("theme-human");
    } else {
      body.classList.add("theme-religion");
    }
  }

  function init() {
    const item = getReflectionData();
    if (!item) return;

    state.data = item;

    applyCategoryAccent(item);
    initThemeToggle();
    renderHero(item);
    renderAudio(item);
    renderExplore(item);
    renderArticle(item);

    initBackButton();
    initHomeButton();
    initShareButton(item);
    initPanelJumpButtons();
    initPanelMode();
  }

  document.addEventListener("DOMContentLoaded", init);
})();