/* ===========================
   GIT – Global Search Component
   =========================== */

const GlobalSearch = {
  ALL_ITEMS: [],
  currentResults: [],

  init() {
    this.buildIndex();
    this.bindAll();
  },

  buildIndex() {
    // Courses
    const COURSES = window.COURSES || [];
    COURSES.forEach(c => {
      this.ALL_ITEMS.push({
        id: c.id,
        type: 'Course',
        title: c.name,
        subtitle: `${c.duration} · ${c.category}`,
        icon: c.icon,
        keywords: [c.name, c.abbr, c.desc, ...(c.skills || [])].join(' ').toLowerCase(),
        url: `courses/course-detail.html?id=${c.id}`
      });
    });

    // Pages
    const PAGES = [
      { id: 'home',     title: 'Home',            icon: '🏠', url: 'index.html',          type: 'Page', subtitle: 'GIT Homepage' },
      { id: 'teachers', title: 'Our Teachers',     icon: '👨‍🏫', url: 'pages/teachers.html', type: 'Page', subtitle: 'Meet our faculty' },
      { id: 'about',    title: 'About GIT',        icon: 'ℹ️',  url: 'pages/about.html',    type: 'Page', subtitle: 'Our story and mission' },
      { id: 'contact',  title: 'Contact Us',       icon: '📞', url: 'pages/contact.html',  type: 'Page', subtitle: 'Get in touch' },
    ];
    PAGES.forEach(p => {
      this.ALL_ITEMS.push({ ...p, keywords: (p.title + ' ' + p.subtitle).toLowerCase() });
    });
  },

  search(query) {
    const q = query.toLowerCase().trim();
    if (q.length < 1) return [];

    return this.ALL_ITEMS.filter(item =>
      item.keywords.includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q)
    ).slice(0, 7);
  },

  bindAll() {
    document.querySelectorAll('[data-global-search]').forEach(input => {
      const resultsId = input.getAttribute('data-global-search');
      const resultsEl = document.getElementById(resultsId);
      if (!resultsEl) return;

      input.addEventListener('input', () => {
        const q = input.value.trim();
        if (q.length < 2) { resultsEl.classList.remove('show'); return; }

        const results = this.search(q);
        if (!results.length) {
          resultsEl.innerHTML = `
            <div class="search-empty">
              <span class="search-empty-icon">🔍</span>
              No results for "<strong>${q}</strong>"<br>
              <span style="font-size:11px;margin-top:4px;display:block">Try: GCP, networking, AI, design…</span>
            </div>`;
        } else {
          resultsEl.innerHTML = results.map(r => `
            <div class="search-result-item" onclick="window.location.href='${r.url}'">
              <div class="search-result-icon">${r.icon}</div>
              <div>
                <div class="search-result-name">${this.highlight(r.title, q)}</div>
                <div class="search-result-type">${r.type} · ${r.subtitle}</div>
              </div>
              <span style="margin-left:auto;font-size:12px;color:var(--text-tertiary)">→</span>
            </div>`).join('');
        }
        resultsEl.classList.add('show');
      });

      // Close on outside click
      document.addEventListener('click', e => {
        if (!input.contains(e.target) && !resultsEl.contains(e.target)) {
          resultsEl.classList.remove('show');
        }
      });

      // Keyboard nav
      input.addEventListener('keydown', e => {
        const items = resultsEl.querySelectorAll('.search-result-item');
        const focused = resultsEl.querySelector('.search-result-item:focus');
        const idx = [...items].indexOf(focused);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = items[idx + 1] || items[0];
          next?.focus();
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = items[idx - 1] || items[items.length - 1];
          prev?.focus();
        }
        if (e.key === 'Escape') {
          resultsEl.classList.remove('show');
          input.blur();
        }
        if (e.key === 'Enter' && focused) {
          focused.click();
        }
      });

      // Make result items focusable
      resultsEl.addEventListener('click', e => {
        const item = e.target.closest('.search-result-item');
        if (item) { resultsEl.classList.remove('show'); input.value = ''; }
      });
    });
  },

  highlight(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark style="background:var(--accent-light);color:var(--accent-primary);border-radius:2px;padding:0 2px">$1</mark>');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Wait for COURSES to be populated by home.js
  setTimeout(() => GlobalSearch.init(), 100);
});