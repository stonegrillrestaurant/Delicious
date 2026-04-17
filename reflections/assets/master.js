/* =========================================================
   SOLITUDE REFLECTIONS - MASTER JS
   Works with:
   - /reflections/assets/reflection-data.js
   - /reflections/assets/master.css?v=7
   - read-style app-like switching on the same page
   ========================================================= */

(function () {
  "use strict";

  /* =========================
     SAFE HELPERS
     ========================= */
  const $ = (id) => document.getElementById(id);

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeCategory(category) {
    const value = String(category || "").toLowerCase().trim();

    if (value === "human" || value === "human-nature") return "human";
    if (value === "spirituality") return "spirituality";
    return "religion";
  }

  function themeClassFromCategory(category) {
    const normalized = normalizeCategory(category);
    if (normalized === "spirituality") return "theme-spirituality";
    if (normalized === "human") return "theme-human";
    return "theme-religion";
  }

  function categoryLabelFromCategory(category) {
    const normalized = normalizeCategory(category);
    if (normalized === "spirituality") return "Spirituality";
    if (normalized === "human") return "Human Nature";
    return "Religion";
  }

  function buildAbsoluteUrl(path) {
    try {
      return new URL(path, window.location.origin).toString();
    } catch (_) {
      return window.location.origin;
    }
  }

  function getAllReflections() {
    if (typeof window.REFLECTION_DATA === "object" && window.REFLECTION_DATA) {
      return window.REFLECTION_DATA;
    }
    if (typeof window.REFLECTIONS === "object" && window.REFLECTIONS) {
      return window.REFLECTIONS;
    }
    return {};
  }

  function getReflectionByKey(key) {
    const all = getAllReflections();
    return all[key] || null;
  }

  function getFirstKeyByCategory(category) {
    const all = getAllReflections();
    const keys = Object.keys(all);

    for (const key of keys) {
      const item = all[key];
      if (normalizeCategory(item.category) === normalizeCategory(category)) {
        return key;
      }
    }

    return keys[0] || null;
  }

  function getInitialKey() {
    const fromBody = document.body.dataset.initialKey || "";
    const fromUrl = new URLSearchParams(window.location.search).get("key") || "";
    const candidate = fromUrl || fromBody;

    if (candidate && getReflectionByKey(candidate)) return candidate;

    const allKeys = Object.keys(getAllReflections());
    return allKeys[0] || null;
  }

  function supportsNativeShare() {
    return typeof navigator.share === "function";
  }

  /* =========================
     DOM REFERENCES
     ========================= */
  const body = document.body;

  const heroImage = $("heroImage");
  const heroCategoryLabel = $("heroCategoryLabel");
  const reflectionTitle = $("reflectionTitle");
  const reflectionSubtitle = $("reflectionSubtitle");
  const heroIdentity = $("heroIdentity");

  const readSectionTitle = $("readSectionTitle");
  const readContent = $("readContent");

  const audioSection = $("audioSection");
  const mainAudio = $("mainAudio");
  const nowPlayingTitle = $("nowPlayingTitle");
  const playerVisual = $("playerVisual");

  const trackPrimary = $("trackPrimary");
  const trackSecondary = $("trackSecondary");
  const trackPrimaryLabel = $("trackPrimaryLabel");
  const trackSecondaryLabel = $("trackSecondaryLabel");

  const exploreListGrid = $("exploreListGrid");
  const exploreCategoryButtons = Array.from(document.querySelectorAll(".explore-cat-btn"));

  const shareFacebookBtn = $("shareFacebookBtn");
  const shareXBtn = $("shareXBtn");
  const shareMessengerBtn = $("shareMessengerBtn");
  const copyLinkBtn = $("copyLinkBtn");

  const themeToggle = $("themeToggle");

  /* =========================
     APP STATE
     ========================= */
  const state = {
    currentKey: null,
    currentCategory: "religion",
    currentTrackButton: null
  };

  /* =========================
     THEME
     ========================= */
  function applySavedTheme() {
    const saved = localStorage.getItem("sr-theme");
    const theme = saved === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeButtonLabel();
  }

  function updateThemeButtonLabel() {
    if (!themeToggle) return;
    const current = document.documentElement.getAttribute("data-theme");
    themeToggle.textContent = current === "light" ? "Dark Mode" : "Light Mode";
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("sr-theme", next);
    updateThemeButtonLabel();
  }

  /* =========================
     TRACK / AUDIO
     ========================= */
  function stopPlayingState() {
    body.classList.remove("is-playing");
  }

  function startPlayingState() {
    body.classList.add("is-playing");
  }

  function setActiveTrackButton(button) {
    [trackPrimary, trackSecondary].forEach((btn) => {
      if (btn) btn.classList.remove("active-track");
    });

    if (button) {
      button.classList.add("active-track");
      state.currentTrackButton = button;
    }
  }

  function setAudioSource(src, title) {
    if (!mainAudio) return;

    if (!src) {
      mainAudio.pause();
      mainAudio.removeAttribute("src");
      mainAudio.load();
      nowPlayingTitle.textContent = title || "No audio available";
      stopPlayingState();
      return;
    }

    const wasPlaying = !mainAudio.paused;

    mainAudio.pause();
    mainAudio.src = src;
    mainAudio.load();
    nowPlayingTitle.textContent = title || "Reflection";

    if (wasPlaying) {
      mainAudio.play().catch(() => {});
    }
  }

  function configureTrackButton(button, labelEl, label, src, fallbackTitle) {
    if (!button || !labelEl) return;

    const cleanLabel = label || fallbackTitle || "Audio";
    labelEl.textContent = cleanLabel;
    button.dataset.trackTitle = cleanLabel;
    button.dataset.trackSrc = src || "";

    if (src) {
      button.style.display = "";
      button.disabled = false;
      button.setAttribute("aria-hidden", "false");
    } else {
      button.style.display = "none";
      button.disabled = true;
      button.setAttribute("aria-hidden", "true");
    }
  }

  function bindTrackButton(button) {
    if (!button) return;

    button.addEventListener("click", function () {
      const src = this.dataset.trackSrc || "";
      const title = this.dataset.trackTitle || "Audio";

      if (!src) return;

      setActiveTrackButton(this);
      setAudioSource(src, title);
      mainAudio.play().catch(() => {});
    });
  }

  /* =========================
     SHARE
     ========================= */
  function getCurrentReflectionUrl(item) {
    return item && item.canonical ? item.canonical : window.location.href;
  }

  function getCurrentShareTitle(item) {
    return item && item.title ? item.title : document.title;
  }

  function updateShareLinks(item) {
    const url = encodeURIComponent(getCurrentReflectionUrl(item));
    const title = encodeURIComponent(getCurrentShareTitle(item));

    if (shareFacebookBtn) {
      shareFacebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      shareFacebookBtn.target = "_blank";
      shareFacebookBtn.rel = "noopener";
    }

    if (shareXBtn) {
      shareXBtn.href = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
      shareXBtn.target = "_blank";
      shareXBtn.rel = "noopener";
    }

    if (shareMessengerBtn) {
      shareMessengerBtn.href = `https://www.facebook.com/dialog/send?link=${url}&app_id=2895055444086567&redirect_uri=${url}`;
      shareMessengerBtn.target = "_blank";
      shareMessengerBtn.rel = "noopener";
    }
  }

  async function copyCurrentLink() {
    const item = getReflectionByKey(state.currentKey);
    const url = getCurrentReflectionUrl(item);

    try {
      await navigator.clipboard.writeText(url);
      const oldText = copyLinkBtn.textContent;
      copyLinkBtn.textContent = "✓";
      setTimeout(() => {
        copyLinkBtn.textContent = oldText;
      }, 1200);
    } catch (_) {
      window.prompt("Copy this link:", url);
    }
  }

  /* =========================
     RENDER READ / HERO
     ========================= */
  function renderHero(item) {
    if (!item) return;

    const coverSrc = item.coverLandscape || item.cover || "/reflections/assets/placeholder.jpg";

    if (heroImage) {
      heroImage.src = coverSrc;
      heroImage.alt = item.title ? `${item.title} cover image` : "Reflection cover image";
    }

    if (heroCategoryLabel) {
      heroCategoryLabel.textContent = categoryLabelFromCategory(item.category);
    }

    if (reflectionTitle) {
      reflectionTitle.textContent = item.title || "Reflection Title";
    }

    if (reflectionSubtitle) {
      reflectionSubtitle.textContent = item.subtitle || item.description || "";
      reflectionSubtitle.style.display = (item.subtitle || item.description) ? "" : "none";
    }

    if (heroIdentity) {
      heroIdentity.textContent = "Stone Grill Press · Ninox Antolihao";
    }
  }

  function renderReadSection(item) {
    if (!item) return;

    if (readSectionTitle) {
      readSectionTitle.textContent = item.title || "Read the Reflection";
    }

    if (readContent) {
      if (item.articleHtml && String(item.articleHtml).trim()) {
        readContent.innerHTML = item.articleHtml;
      } else {
        readContent.innerHTML = `
          <h2>${escapeHtml(item.title || "Reflection")}</h2>
          <p>${escapeHtml(item.description || "Reflection content is not yet available.")}</p>
        `;
      }
    }
  }

  function updateDocumentMeta(item) {
    if (!item) return;

    document.title = `${item.title || "Solitude Reflections"} · Ninox Antolihao`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && item.description) {
      metaDescription.setAttribute("content", item.description);
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && item.canonical) {
      canonical.setAttribute("href", item.canonical);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogImage = document.querySelector('meta[property="og:image"]');

    if (ogTitle) ogTitle.setAttribute("content", `${item.title || "Solitude Reflections"} · Ninox Antolihao`);
    if (ogDescription && item.description) ogDescription.setAttribute("content", item.description);
    if (ogUrl && item.canonical) ogUrl.setAttribute("content", item.canonical);
    if (ogImage) ogImage.setAttribute("content", buildAbsoluteUrl(item.coverLandscape || item.cover || "/reflections/assets/reflections-icon-512.png"));

    const twTitle = document.querySelector('meta[name="twitter:title"]');
    const twDescription = document.querySelector('meta[name="twitter:description"]');
    const twImage = document.querySelector('meta[name="twitter:image"]');

    if (twTitle) twTitle.setAttribute("content", `${item.title || "Solitude Reflections"} · Ninox Antolihao`);
    if (twDescription && item.description) twDescription.setAttribute("content", item.description);
    if (twImage) twImage.setAttribute("content", buildAbsoluteUrl(item.coverLandscape || item.cover || "/reflections/assets/reflections-icon-512.png"));
  }

  function applyBodyThemeClass(category) {
    body.classList.remove("theme-spirituality", "theme-human", "theme-human-nature", "theme-religion");
    body.classList.add(themeClassFromCategory(category));
  }

  /* =========================
     EXPLORE MORE
     ========================= */
  function getReflectionEntriesByCategory(category) {
    const all = getAllReflections();

    return Object.entries(all)
      .filter(([, item]) => normalizeCategory(item.category) === normalizeCategory(category));
  }

  function renderExploreList(category, activeKey) {
    if (!exploreListGrid) return;

    const entries = getReflectionEntriesByCategory(category);

    if (!entries.length) {
      exploreListGrid.innerHTML = `
        <div class="explore-card-link">
          <h3 class="explore-card-title">No reflections found</h3>
          <p class="explore-card-desc">No reflection is available in this category yet.</p>
        </div>
      `;
      return;
    }

    exploreListGrid.innerHTML = entries.map(([key, item]) => {
      const isActive = key === activeKey;
      return `
        <a
          href="?key=${encodeURIComponent(key)}"
          class="explore-card-link${isActive ? " active-reflection-card" : ""}"
          data-reflection-key="${escapeHtml(key)}"
          aria-current="${isActive ? "true" : "false"}"
        >
          <h3 class="explore-card-title">${escapeHtml(item.title || "Untitled Reflection")}</h3>
          <p class="explore-card-desc">${escapeHtml(item.description || "")}</p>
        </a>
      `;
    }).join("");
  }

  function setActiveCategoryButton(category) {
    exploreCategoryButtons.forEach((button) => {
      const btnCategory = normalizeCategory(button.dataset.category || "");
      const isActive = btnCategory === normalizeCategory(category);
      button.classList.toggle("active-track", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function bindExploreCategoryButtons() {
    exploreCategoryButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const category = normalizeCategory(this.dataset.category || "religion");
        const nextKey = getFirstKeyByCategory(category);

        state.currentCategory = category;
        setActiveCategoryButton(category);
        renderExploreList(category, nextKey);

        if (nextKey) {
          renderReflection(nextKey, true);
          scrollReadIntoViewOnMobile();
        }
      });
    });
  }

  function bindExploreCardClicks() {
    if (!exploreListGrid) return;

    exploreListGrid.addEventListener("click", function (event) {
      const link = event.target.closest("[data-reflection-key]");
      if (!link) return;

      event.preventDefault();
      const key = link.dataset.reflectionKey;
      if (!key) return;

      renderReflection(key, true);
      scrollReadIntoViewOnMobile();
    });
  }

  function scrollReadIntoViewOnMobile() {
    if (window.innerWidth <= 768) {
      const section = $("readSectionWrap");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  /* =========================
     URL / HISTORY
     ========================= */
  function updateUrlForKey(key, replaceOnly) {
    const url = new URL(window.location.href);
    url.searchParams.set("key", key);

    if (replaceOnly) {
      window.history.replaceState({ key }, "", url.toString());
    } else {
      window.history.pushState({ key }, "", url.toString());
    }
  }

  /* =========================
     MAIN RENDER
     ========================= */
  function renderReflection(key, pushHistory) {
    const item = getReflectionByKey(key);
    if (!item) return;

    state.currentKey = key;
    state.currentCategory = normalizeCategory(item.category);

    applyBodyThemeClass(item.category);
    renderHero(item);
    renderReadSection(item);
    updateDocumentMeta(item);
    updateShareLinks(item);

    configureTrackButton(trackPrimary, trackPrimaryLabel, item.audio1Label || "Reflection", item.audio1 || "", "Reflection");
    configureTrackButton(trackSecondary, trackSecondaryLabel, item.audio2Label || "Podcast", item.audio2 || "", "Podcast");

    if (item.audio1) {
      setActiveTrackButton(trackPrimary);
      setAudioSource(item.audio1, item.audio1Label || "Reflection");
      if (audioSection) audioSection.style.display = "";
    } else if (item.audio2) {
      setActiveTrackButton(trackSecondary);
      setAudioSource(item.audio2, item.audio2Label || "Podcast");
      if (audioSection) audioSection.style.display = "";
    } else {
      if (audioSection) audioSection.style.display = "none";
      setAudioSource("", "No audio available");
    }

    setActiveCategoryButton(state.currentCategory);
    renderExploreList(state.currentCategory, key);

    updateUrlForKey(key, !pushHistory);
  }

  /* =========================
     POPSTATE SUPPORT
     ========================= */
  window.addEventListener("popstate", function () {
    const key = new URLSearchParams(window.location.search).get("key") || getInitialKey();
    if (key && getReflectionByKey(key)) {
      renderReflection(key, false);
    }
  });

  /* =========================
     AUDIO EVENTS
     ========================= */
  if (mainAudio) {
    mainAudio.addEventListener("play", startPlayingState);
    mainAudio.addEventListener("pause", stopPlayingState);
    mainAudio.addEventListener("ended", stopPlayingState);
  }

  /* =========================
     OPTIONAL NATIVE SHARE
     ========================= */
  if (shareMessengerBtn && supportsNativeShare()) {
    shareMessengerBtn.addEventListener("click", function (event) {
      if (window.innerWidth > 680) return;

      event.preventDefault();
      const item = getReflectionByKey(state.currentKey);
      if (!item) return;

      navigator.share({
        title: getCurrentShareTitle(item),
        text: item.description || item.title || "Solitude Reflections",
        url: getCurrentReflectionUrl(item)
      }).catch(() => {});
    });
  }

  /* =========================
     INIT
     ========================= */
  function init() {
    applySavedTheme();

    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }

    if (copyLinkBtn) {
      copyLinkBtn.addEventListener("click", copyCurrentLink);
    }

    bindTrackButton(trackPrimary);
    bindTrackButton(trackSecondary);
    bindExploreCategoryButtons();
    bindExploreCardClicks();

    const initialKey = getInitialKey();
    if (initialKey) {
      renderReflection(initialKey, false);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();