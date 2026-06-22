(function () {
  const safeReflections = Array.isArray(window.REFLECTION_LINKS) ? window.REFLECTION_LINKS : [];
  const currentPath = window.location.pathname.replace(/\/+$/, "");

  function normalize(path) {
    return (path || "").replace(/\/+$/, "");
  }

  function getCurrentIndex() {
    return safeReflections.findIndex(item => normalize(item.url) === normalize(currentPath));
  }

  function buildReflectionMenu() {
    const menu = document.getElementById("reflectionsMenu");
    if (!menu || !safeReflections.length) return;

    menu.innerHTML = safeReflections.map(item => {
      const active = normalize(item.url) === normalize(currentPath) ? "current" : "";
      return `<a href="${item.url}" class="${active}">${item.title}</a>`;
    }).join("");
  }

  function wireDropdown() {
    const dropdown = document.querySelector(".dropdown");
    const btn = document.querySelector(".dropbtn");
    if (!dropdown || !btn) return;

    function closeMenu() {
      dropdown.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }

    function openMenu() {
      dropdown.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdown.classList.contains("open") ? closeMenu() : openMenu();
    });

    document.addEventListener("click", function (e) {
      if (!dropdown.contains(e.target)) closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  function wireShare() {
    const shareBtn = document.getElementById("shareBtn");
    if (!shareBtn) return;

    shareBtn.addEventListener("click", async function () {
      const shareData = {
        title: document.title,
        url: window.location.href
      };

      if (navigator.share) {
        try { await navigator.share(shareData); } catch (_) {}
        return;
      }

      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert("Link copied to clipboard.");
          return;
        } catch (_) {}
      }

      alert(window.location.href);
    });
  }

  function wireAudioJump() {
    const btn = document.getElementById("audioJumpBtn");
    const section = document.getElementById("audioSection");
    if (!btn || !section) return;

    btn.addEventListener("click", function () {
      section.scrollIntoView({ behavior: "smooth" });
    });
  }

  function wireBackButtons() {
    document.querySelectorAll("[data-go-back]").forEach(btn => {
      btn.addEventListener("click", function () {
        if (window.history.length > 1) window.history.back();
        else window.location.href = "/reflections/";
      });
    });
  }

  function setupPrevNext() {
    const idx = getCurrentIndex();
    if (idx === -1) return;

    const prev = safeReflections[idx - 1] || null;
    const next = safeReflections[idx + 1] || null;

    document.querySelectorAll("[data-prev-reflection]").forEach(link => {
      link.href = prev ? prev.url : "/reflections/";
    });

    document.querySelectorAll("[data-next-reflection]").forEach(link => {
      link.href = next ? next.url : "/reflections/";
    });
  }

  function setupCusdis() {
    const el = document.getElementById("cusdis_thread");
    if (!el) return;
    el.setAttribute("data-page-id", window.location.pathname);
    el.setAttribute("data-page-url", window.location.href);
    el.setAttribute("data-page-title", document.title);
  }

  function setupAudioPlaylist() {
    const audioPlayer = document.getElementById("reflectionAudio");
    const audioSource = document.getElementById("audioSource");
    const rows = document.querySelectorAll(".playlist-row");

    if (!audioPlayer || !audioSource || !rows.length) return;

    const firstRow = rows[0];
    const firstSrc = firstRow.dataset.src;
    if (firstSrc) {
      audioSource.src = firstSrc;
      audioSource.type = firstSrc.toLowerCase().endsWith(".m4a") ? "audio/mp4" : "audio/mpeg";
      audioPlayer.load();
      firstRow.classList.add("active");
    }

    rows.forEach(row => {
      row.addEventListener("click", () => {
        rows.forEach(r => r.classList.remove("active"));
        row.classList.add("active");

        const src = row.dataset.src;
        if (!src) return;

        audioSource.src = src;
        audioSource.type = src.toLowerCase().endsWith(".m4a") ? "audio/mp4" : "audio/mpeg";
        audioPlayer.load();
        audioPlayer.play().catch(() => {});
      });

      const src = row.dataset.src;
      if (!src) return;

      const tempAudio = new Audio(src);
      tempAudio.addEventListener("loadedmetadata", () => {
        const dur = tempAudio.duration;
        if (!isNaN(dur)) {
          const total = Math.floor(dur);
          const min = String(Math.floor(total / 60)).padStart(2, "0");
          const sec = String(total % 60).padStart(2, "0");
          const durEl = row.querySelector(".playlist-duration");
          if (durEl) durEl.textContent = `${min}:${sec}`;
        }
      });
    });
  }

  function setupFooterYear() {
    document.querySelectorAll("[data-current-year]").forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildReflectionMenu();
    wireDropdown();
    wireShare();
    wireAudioJump();
    wireBackButtons();
    setupPrevNext();
    setupCusdis();
    setupAudioPlaylist();
    setupFooterYear();
  });
})();