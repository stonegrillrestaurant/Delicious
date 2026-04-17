document.addEventListener("DOMContentLoaded", () => {
  const app = createReflectionApp();
  app.init();
});

function createReflectionApp() {
  const state = {
    data: {},
    keysByCategory: {
      spirituality: [],
      human: [],
      religion: []
    },
    currentCategory: "religion",
    currentKey: "",
    currentReflection: null,
    activeReflectionUrl: window.location.href
  };

  const els = {
    body: document.body,
    heroImage: document.getElementById("heroImage"),
    heroCategoryLabel: document.getElementById("heroCategoryLabel"),
    reflectionTitle: document.getElementById("reflectionTitle"),
    reflectionSubtitle: document.getElementById("reflectionSubtitle"),
    readSectionTitle: document.getElementById("readSectionTitle"),
    readContent: document.getElementById("readContent"),

    themeToggle: document.getElementById("themeToggle"),

    audioCard: document.getElementById("audioPlayerCard"),
    mainAudio: document.getElementById("mainAudio"),
    nowPlayingTitle: document.getElementById("nowPlayingTitle"),
    trackPrimary: document.getElementById("trackPrimary"),
    trackSecondary: document.getElementById("trackSecondary"),
    trackPrimaryLabel: document.getElementById("trackPrimaryLabel"),
    trackSecondaryLabel: document.getElementById("trackSecondaryLabel"),

    categoryButtons: Array.from(document.querySelectorAll(".explore-cat-btn")),
    exploreListGrid: document.getElementById("exploreListGrid"),

    shareFacebookBtn: document.getElementById("shareFacebookBtn"),
    shareXBtn: document.getElementById("shareXBtn"),
    shareMessengerBtn: document.getElementById("shareMessengerBtn"),
    copyLinkBtn: document.getElementById("copyLinkBtn")
  };

  function init() {
    setupThemeToggle();
    setupAudioPlayer();
    setupCopyLink();

    state.data = getReflectionData();
    state.keysByCategory = groupKeysByCategory(state.data);

    bindCategoryButtons();

    const requestedKey = getRequestedInitialKey();
    const safeKey = requestedKey && state.data[requestedKey]
      ? requestedKey
      : getFirstAvailableKey(state.keysByCategory);

    if (!safeKey) {
      renderEmptyState();
      return;
    }

    const initialReflection = state.data[safeKey];
    const initialCategory = normalizeCategory(initialReflection.category);

    setActiveCategory(initialCategory);
    renderTopicList(initialCategory, safeKey);
    renderReflection(safeKey);
  }

  function getReflectionData() {
    const raw =
      window.REFLECTION_DATA ||
      window.reflectionData ||
      window.REFLECTIONS ||
      window.reflections ||
      {};

    const normalized = {};

    Object.keys(raw).forEach((key) => {
      normalized[key] = normalizeReflection(key, raw[key]);
    });

    return normalized;
  }

  function normalizeReflection(key, item) {
    const category = normalizeCategory(item.category);

    return {
      key,
      title: item.title || "Untitled Reflection",
      subtitle: item.subtitle || item.description || "",
      category,
      read: item.read || item.canonical || "",
      canonical: item.canonical || item.read || "",
      cover: item.cover || item.coverLandscape || "/reflections/assets/placeholder.jpg",
      coverLandscape: item.coverLandscape || item.cover || "/reflections/assets/placeholder.jpg",
      audio1Label: item.audio1Label || "Reflection",
      audio1: item.audio1 || "",
      audio2Label: item.audio2Label || "Podcast",
      audio2: item.audio2 || "",
      description: item.description || "",
      articleHtml: item.articleHtml || "<p>No article content available.</p>"
    };
  }

  function normalizeCategory(value) {
    const raw = String(value || "").trim().toLowerCase();

    if (raw === "spirituality") return "spirituality";
    if (raw === "religion") return "religion";
    if (raw === "human" || raw === "human nature" || raw === "human-nature") return "human";

    return "spirituality";
  }

  function groupKeysByCategory(data) {
    const grouped = {
      spirituality: [],
      human: [],
      religion: []
    };

    Object.keys(data).forEach((key) => {
      const item = data[key];
      const category = normalizeCategory(item.category);
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(key);
    });

    return grouped;
  }

  function getRequestedInitialKey() {
    const url = new URL(window.location.href);
    const queryKey = url.searchParams.get("topic");
    const bodyKey = document.body.dataset.initialKey;

    if (queryKey) return queryKey;
    if (bodyKey) return bodyKey;

    return "";
  }

  function getFirstAvailableKey(grouped) {
    return grouped.religion[0] || grouped.spirituality[0] || grouped.human[0] || "";
  }

  function bindCategoryButtons() {
    els.categoryButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const category = normalizeCategory(btn.dataset.category);

        setActiveCategory(category);

        const firstKeyInCategory =
          state.currentReflection && normalizeCategory(state.currentReflection.category) === category
            ? state.currentKey
            : (state.keysByCategory[category][0] || "");

        renderTopicList(category, firstKeyInCategory);

        if (firstKeyInCategory && firstKeyInCategory !== state.currentKey) {
          renderReflection(firstKeyInCategory);
        }
      });
    });
  }

  function setActiveCategory(category) {
    state.currentCategory = category;

    els.categoryButtons.forEach((btn) => {
      const btnCategory = normalizeCategory(btn.dataset.category);
      btn.classList.toggle("active-cat", btnCategory === category);
    });

    els.body.classList.remove("theme-spirituality", "theme-human", "theme-religion");
    els.body.classList.add(`theme-${category}`);
  }

  function renderTopicList(category, activeKey) {
    const keys = state.keysByCategory[category] || [];

    els.exploreListGrid.innerHTML = "";

    keys.forEach((key) => {
      const reflection = state.data[key];
      const button = document.createElement("button");

      button.type = "button";
      button.className = "glass-control explore-reflection-link";
      if (key === activeKey) {
        button.classList.add("active-topic");
      }

      button.dataset.key = key;
      button.innerHTML = `
        <span class="explore-link-title">${escapeHtml(reflection.title)}</span>
        <span class="explore-link-subtitle">${escapeHtml(reflection.subtitle || reflection.description || "")}</span>
      `;

      button.addEventListener("click", () => {
        renderReflection(key);
        markActiveTopic(key);
      });

      els.exploreListGrid.appendChild(button);
    });
  }

  function markActiveTopic(activeKey) {
    const topicButtons = Array.from(document.querySelectorAll(".explore-reflection-link"));
    topicButtons.forEach((btn) => {
      btn.classList.toggle("active-topic", btn.dataset.key === activeKey);
    });
  }

  function renderReflection(key) {
    const reflection = state.data[key];
    if (!reflection) return;

    state.currentKey = key;
    state.currentReflection = reflection;
    state.activeReflectionUrl = reflection.read || reflection.canonical || window.location.href;

    setActiveCategory(reflection.category);
    renderTopicList(reflection.category, key);

    els.readContent.classList.add("is-switching");

    setTimeout(() => {
      updateMeta(reflection);
      updateHero(reflection);
      updateRead(reflection);
      updateAudio(reflection);
      updateShare(reflection);

      els.readContent.classList.remove("is-switching");
    }, 140);
  }

  function updateMeta(reflection) {
    const pageTitle = `${reflection.title} — Solitude Reflections · Ninox Antolihao`;
    document.title = pageTitle;

    setMeta('meta[name="description"]', reflection.description || reflection.subtitle || "");
    setMeta('meta[name="theme-color"]', getThemeColor(reflection.category));

    setLinkRel("canonical", reflection.canonical || reflection.read || window.location.href);

    setMeta('meta[property="og:title"]', `${reflection.title} — Solitude Reflections`);
    setMeta('meta[property="og:description"]', reflection.description || reflection.subtitle || "");
    setMeta('meta[property="og:url"]', reflection.canonical || reflection.read || window.location.href);
    setMeta('meta[property="og:image"]', absoluteUrl(reflection.coverLandscape || reflection.cover));

    setMeta('meta[name="twitter:title"]', `${reflection.title} — Solitude Reflections`);
    setMeta('meta[name="twitter:description"]', reflection.description || reflection.subtitle || "");
    setMeta('meta[name="twitter:image"]', absoluteUrl(reflection.coverLandscape || reflection.cover));
  }

  function updateHero(reflection) {
    const cover = reflection.coverLandscape || reflection.cover || "/reflections/assets/placeholder.jpg";

    els.heroImage.src = cover;
    els.heroImage.alt = reflection.title;
    els.heroCategoryLabel.textContent = formatCategoryLabel(reflection.category);
    els.reflectionTitle.textContent = reflection.title;
    els.reflectionSubtitle.textContent = reflection.subtitle || reflection.description || "";
    els.readSectionTitle.textContent = reflection.title;
  }

  function updateRead(reflection) {
    els.readContent.innerHTML = reflection.articleHtml || "<p>No article content available.</p>";
  }

  function updateAudio(reflection) {
    const primaryLabel = reflection.audio1Label || "Reflection";
    const secondaryLabel = reflection.audio2Label || "Podcast";
    const primarySrc = reflection.audio1 || "";
    const secondarySrc = reflection.audio2 || "";

    els.trackPrimary.dataset.trackTitle = primaryLabel;
    els.trackPrimary.dataset.trackSrc = primarySrc;
    els.trackPrimaryLabel.textContent = primaryLabel;

    els.trackSecondary.dataset.trackTitle = secondaryLabel;
    els.trackSecondary.dataset.trackSrc = secondarySrc;
    els.trackSecondaryLabel.textContent = secondaryLabel;

    els.trackPrimary.classList.add("active-track");
    els.trackSecondary.classList.remove("active-track");

    els.trackSecondary.style.display = secondarySrc ? "inline-flex" : "none";

    els.nowPlayingTitle.textContent = primaryLabel;

    if (primarySrc) {
      els.mainAudio.src = primarySrc;
    } else {
      els.mainAudio.removeAttribute("src");
      els.mainAudio.load();
    }

    els.audioCard.classList.remove("is-playing");
  }

  function updateShare(reflection) {
    const url = reflection.read || reflection.canonical || window.location.href;
    const title = reflection.title || document.title;
    const safeUrl = encodeURIComponent(url);
    const safeTitle = encodeURIComponent(title);

    if (els.shareFacebookBtn) {
      els.shareFacebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${safeUrl}`;
      els.shareFacebookBtn.target = "_blank";
      els.shareFacebookBtn.rel = "noopener noreferrer";
    }

    if (els.shareXBtn) {
      els.shareXBtn.href = `https://twitter.com/intent/tweet?url=${safeUrl}&text=${safeTitle}`;
      els.shareXBtn.target = "_blank";
      els.shareXBtn.rel = "noopener noreferrer";
    }

    if (els.shareMessengerBtn) {
      els.shareMessengerBtn.href = `fb-messenger://share/?link=${safeUrl}`;
    }
  }

  function setupThemeToggle() {
    if (!els.themeToggle) return;

    const syncLabel = () => {
      const mode = document.documentElement.getAttribute("data-theme") || "dark";
      els.themeToggle.textContent = mode === "dark" ? "Light Mode" : "Dark Mode";
    };

    syncLabel();

    els.themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      syncLabel();
    });
  }

  function setupAudioPlayer() {
    if (!els.mainAudio || !els.trackPrimary || !els.trackSecondary) return;

    [els.trackPrimary, els.trackSecondary].forEach((btn) => {
      btn.addEventListener("click", () => {
        const src = btn.dataset.trackSrc || "";
        const title = btn.dataset.trackTitle || "Track";

        if (!src) return;

        [els.trackPrimary, els.trackSecondary].forEach((item) => {
          item.classList.remove("active-track");
        });

        btn.classList.add("active-track");
        els.nowPlayingTitle.textContent = title;
        els.mainAudio.src = src;
        els.mainAudio.play().catch(() => {});
      });
    });

    els.mainAudio.addEventListener("play", () => {
      els.audioCard.classList.add("is-playing");
    });

    els.mainAudio.addEventListener("pause", () => {
      els.audioCard.classList.remove("is-playing");
    });

    els.mainAudio.addEventListener("ended", () => {
      els.audioCard.classList.remove("is-playing");
    });
  }

  function setupCopyLink() {
    if (!els.copyLinkBtn) return;

    els.copyLinkBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(state.activeReflectionUrl || window.location.href);
        const original = els.copyLinkBtn.textContent;
        els.copyLinkBtn.textContent = "✓";
        setTimeout(() => {
          els.copyLinkBtn.textContent = original;
        }, 1200);
      } catch (error) {
        console.log("Copy failed:", error);
      }
    });
  }

  function renderEmptyState() {
    els.reflectionTitle.textContent = "No reflections found";
    els.reflectionSubtitle.textContent = "reflection-data.js is missing or empty.";
    els.readSectionTitle.textContent = "No reflections found";
    els.readContent.innerHTML = "<p>Please make sure your reflection-data.js is loaded correctly.</p>";
    els.exploreListGrid.innerHTML = "";
  }

  function setMeta(selector, value) {
    const el = document.querySelector(selector);
    if (el && value) {
      el.setAttribute("content", value);
    }
  }

  function setLinkRel(rel, href) {
    const link = document.querySelector(`link[rel="${rel}"]`);
    if (link && href) {
      link.setAttribute("href", href);
    }
  }

  function getThemeColor(category) {
    if (category === "human") return "#4c88ff";
    if (category === "religion") return "#cf5f84";
    return "#cf9f38";
  }

  function formatCategoryLabel(category) {
    if (category === "human") return "Human Nature";
    if (category === "religion") return "Religion";
    return "Spirituality";
  }

  function absoluteUrl(path) {
    try {
      return new URL(path, window.location.origin).href;
    } catch {
      return path;
    }
  }

  function escapeHtml(text) {
    return String(text || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  return { init };
}