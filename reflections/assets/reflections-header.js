// reflections-header.js
// Builds the fixed header for all reflection pages.
// Hook: <div id="reflectionsHeader" data-current="slug-here"></div>

(function () {
  const host = document.getElementById('reflectionsHeader');
  if (!host) return;

  const currentSlug = host.dataset.current || '';

  // LIST OF REFLECTIONS (edit titles/urls/covers as needed)
  const REFLECTIONS = [
    {
      slug: 'divine-premise',
      title: 'Divine Premise',
      url: '/reflections/pages/divine-premise/read.html',
      cover: '/reflections/pages/divine-premise/divinepremise-cover.jpg'
    },
    {
      slug: 'the-subconscious-mind',
      title: 'The Subconscious Mind',
      url: '/reflections/pages/the-subconscious-mind/read.html',
      cover: '/reflections/pages/the-subconscious-mind/subconscious-cover.jpg'
    },
    {
      slug: 'the-god-we-created',
      title: 'The God We Created',
      url: '/reflections/pages/the-god-we-created/read.html',
      cover: '/reflections/pages/the-god-we-created/godwecreated-cover.jpg'
    },
    {
      slug: 'the-paradox-of-god',
      title: 'The Paradox of God',
      url: '/reflections/pages/the-paradox-of-god/read.html',
      cover: '/reflections/pages/the-paradox-of-god/paradoxofgod-cover.jpg'
    },
    {
      slug: 'the-prayer',
      title: 'The Prayer',
      url: '/reflections/pages/the-prayer/read.html',
      cover: '/reflections/pages/the-prayer/theprayer-cover.jpg'
    },
    {
      slug: 'transcendence',
      title: 'Transcendence',
      url: '/reflections/pages/transcendence/read.html',
      cover: '/reflections/pages/transcendence/transcendence-cover.jpg'
    },
    {
      slug: 'the-madness-of-faith',
      title: 'The Madness of Faith',
      url: '/reflections/pages/the-madness-of-faith/read.html',
      cover: '/reflections/pages/the-madness-of-faith/madness-cover.jpg'
    },
    {
      slug: 'the-lost-language-of-metaphor',
      title: 'The Lost Language of Metaphor',
      url: '/reflections/pages/the-lost-language-of-metaphor/read.html',
      cover: '/reflections/pages/the-lost-language-of-metaphor/metaphor-cover.jpg'
    },
    {
      slug: 'belief-and-goodness',
      title: 'Belief and Goodness',
      url: '/reflections/pages/belief-and-goodness/read.html',
      cover: '/reflections/pages/belief-and-goodness/belief-cover.jpg'
    },
    {
      slug: 'seeking-assurance-is-labeled-a-sinner',
      title: 'Seeking Assurance is Labeled a Sinner',
      url: '/reflections/pages/seeking-assurance-is-labeled-a-sinner/read.html',
      cover: '/reflections/pages/seeking-assurance-is-labeled-a-sinner/seeking-cover.jpg'
    },
    {
      slug: 'the-initial-premise-of-a-perfect-loving-god',
      title: 'The Initial Premise of a Perfect Loving God',
      url: '/reflections/pages/the-initial-premise-of-a-perfect-loving-god/read.html',
      cover: '/reflections/pages/the-initial-premise-of-a-perfect-loving-god/initialpremise-cover.jpg'
    }
  ];

  const current =
    REFLECTIONS.find(r => r.slug === currentSlug) || REFLECTIONS[0];

  // Build header HTML
  const header = document.createElement('header');
  header.className = 'ref-header-shell';

  header.innerHTML = `
    <div class="ref-header-inner">
      <div class="ref-header-main">
        <div class="ref-header-brand">
          <div class="ref-header-series">Moments of Solitude</div>
          <div class="ref-header-sub">Stone Grill Reflections</div>
        </div>

        <div class="ref-header-actions">
          <button class="ref-header-btn" data-action="back">Back</button>
          <button class="ref-header-btn" data-action="share">Share</button>
          <button class="ref-header-btn" data-action="audio">Audio</button>
        </div>
      </div>

      <div class="ref-header-cover-wrap">
        <img src="${current.cover}"
             alt="${current.title} cover"
             class="ref-header-cover">
      </div>
    </div>

    <nav class="ref-header-nav">
      <div class="ref-header-nav-inner">
        ${REFLECTIONS.map(r => `
          <a class="ref-header-link ${r.slug === currentSlug ? 'ref-header-link--active' : ''}"
             href="${r.url}">
             ${r.title}
          </a>
        `).join('')}
      </div>
    </nav>
  `;

  host.appendChild(header);

  // ----- Button behaviours -----
  const backBtn = header.querySelector('[data-action="back"]');
  const shareBtn = header.querySelector('[data-action="share"]');
  const audioBtn = header.querySelector('[data-action="audio"]');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      // Go back to reflections home – change if your index URL is different
      window.location.href = '/reflections/index.html';
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: current.title + ' — Moments of Solitude',
        text: 'A reflection by Ninox Antolihao.',
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          // user cancelled – ignore
        }
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert('Link copied to clipboard.');
        } catch (err) {
          window.open(
            'https://www.facebook.com/sharer/sharer.php?u=' +
              encodeURIComponent(window.location.href),
            '_blank'
          );
        }
      } else {
        window.open(
          'https://www.facebook.com/sharer/sharer.php?u=' +
            encodeURIComponent(window.location.href),
          '_blank'
        );
      }
    });
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const audio = document.getElementById('reflectionAudio');
      if (!audio) return;
      audio.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // try to play, ignore autoplay errors
      audio.play && audio.play().catch(() => {});
    });
  }
})();
