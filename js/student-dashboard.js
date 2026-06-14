/* ===========================
   GIT – Student Dashboard JS
   Production Ready v3.0
   =========================== */

const StudentDash = {
  user: null,
  lectures: [],
  LECTURES_KEY: 'git-lectures',
  PROGRESS_KEY: 'git-progress',
  ENROLLED_KEY: 'git-enrolled',

  // ── INIT ──────────────────────────────────────
  init() {
    this.user = Auth.requireAuth('student');
    if (!this.user) return;

    // Apply saved theme immediately
    const saved = localStorage.getItem('git-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);

    this.loadData();
    this.renderUserInfo();
    this.renderStats();
    this.renderEnrolledCourses();
    this.renderRecentLectures();
    this.renderAvailableLectures();
    this.initSidebar();
    this.initTheme();
    this.initSignOut();
    this.initSearch();
    this.initSectionNav();
    this.autoRefreshLectures();
    this.renderProfileInfo();
  },

  // ── LOAD DATA ─────────────────────────────────
  loadData() {
    this.lectures = JSON.parse(localStorage.getItem(this.LECTURES_KEY) || '[]');
    this.progress = JSON.parse(localStorage.getItem(this.PROGRESS_KEY) || '{}');
    this.enrolled = JSON.parse(localStorage.getItem(this.ENROLLED_KEY) || '{}');
    // Auto-enroll in signup course
    if (this.user.course && !this.enrolled[this.user.id]) {
      this.enrolled[this.user.id] = [this.user.course];
      localStorage.setItem(this.ENROLLED_KEY, JSON.stringify(this.enrolled));
    }
  },

  // ── AUTO REFRESH every 8 seconds ──────────────
  autoRefreshLectures() {
    setInterval(() => {
      const fresh = JSON.parse(localStorage.getItem(this.LECTURES_KEY) || '[]');
      if (fresh.length !== this.lectures.length) {
        const isNew = fresh.length > this.lectures.length;
        this.lectures = fresh;
        this.renderStats();
        this.renderAvailableLectures();
        this.renderRecentLectures();
        if (isNew) GIT.Toast.info('New lecture uploaded! 🎬');
      }
    }, 8000);
  },

  // ── HELPERS ───────────────────────────────────
  getEnrolledCourses() {
    return this.enrolled[this.user.id] || (this.user.course ? [this.user.course] : []);
  },
  getProgress(lecId) {
    return this.progress[`${this.user.id}_${lecId}`] || 0;
  },
  setProgress(lecId, pct) {
    this.progress[`${this.user.id}_${lecId}`] = pct;
    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(this.progress));
  },

  // ── RENDER USER INFO ──────────────────────────
  renderUserInfo() {
    const name = `${this.user.firstName} ${this.user.lastName}`;
    document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = name);
    document.querySelectorAll('[data-user-avatar]').forEach(el => {
      el.textContent = this.user.avatar || (this.user.firstName[0] + (this.user.lastName[0] || '')).toUpperCase();
    });
    document.querySelectorAll('[data-user-course]').forEach(el => {
      el.textContent = this.user.course || 'General';
    });
  },

  // ── RENDER STATS ──────────────────────────────
  renderStats() {
    this.lectures = JSON.parse(localStorage.getItem(this.LECTURES_KEY) || '[]');
    const enrolled  = this.getEnrolledCourses();
    const watched   = this.lectures.filter(l => this.getProgress(l.id) > 0).length;
    const completed = this.lectures.filter(l => this.getProgress(l.id) >= 100).length;
    const s1 = document.getElementById('stat-enrolled');
    const s2 = document.getElementById('stat-watched');
    const s3 = document.getElementById('stat-completed');
    const s4 = document.getElementById('stat-available');
    if (s1) s1.textContent = enrolled.length;
    if (s2) s2.textContent = watched;
    if (s3) s3.textContent = completed;
    if (s4) s4.textContent = this.lectures.length;
  },

  // ── COURSE INFO MAP ────────────────────────────
  getCourseInfo(cid) {
    const INFO = {
      'GCP':  { name:'Green Certified Programmer',    icon:'💻', color:'#059669' },
      'CIT':  { name:'Certificate in IT',             icon:'🖥️', color:'#0891b2' },
      'CCNA': { name:'Cisco Network Associate',       icon:'🌐', color:'#7c3aed' },
      'ADSE': { name:'Advanced Diploma in SE',        icon:'⚙️', color:'#dc2626' },
      'DITA': { name:'Diploma in IT Applications',    icon:'📊', color:'#d97706' },
      'GD':   { name:'Graphic Designing',             icon:'🎨', color:'#e11d48' },
      'SEO':  { name:'Search Engine Optimization',    icon:'🔍', color:'#0284c7' },
      'AI':   { name:'Artificial Intelligence',       icon:'🤖', color:'#7c3aed' },
      'ML':   { name:'Machine Learning',              icon:'📈', color:'#059669' },
    };
    return INFO[cid] || { name: cid, icon: '📚', color: '#059669' };
  },

  // ── ENROLLED COURSES ──────────────────────────
  renderEnrolledCourses(targetId = 'enrolled-courses') {
    const container = document.getElementById(targetId);
    if (!container) return;
    const courses = this.getEnrolledCourses();
    if (!courses.length) {
      container.innerHTML = `<p style="color:var(--text-tertiary);font-size:var(--text-sm);padding:var(--space-4)">No courses enrolled yet.</p>`;
      return;
    }
    this.lectures = JSON.parse(localStorage.getItem(this.LECTURES_KEY) || '[]');
    container.innerHTML = courses.map(cid => {
      const cd   = this.getCourseInfo(cid);
      const lecs = this.lectures.filter(l => l.course === cid);
      const done = lecs.filter(l => this.getProgress(l.id) >= 100).length;
      const pct  = lecs.length ? Math.round((done / lecs.length) * 100) : 0;
      return `
        <div onclick="StudentDash.openCourse('${cid}')" style="cursor:pointer;display:flex;
          align-items:center;gap:var(--space-4);padding:var(--space-4);
          background:var(--bg-secondary);border-radius:var(--radius-xl);
          margin-bottom:var(--space-3);transition:all 0.2s;
          border:1.5px solid var(--border-subtle)"
          onmouseover="this.style.borderColor='${cd.color}';this.style.transform='translateY(-1px)'"
          onmouseout="this.style.borderColor='var(--border-subtle)';this.style.transform=''">
          <div style="width:48px;height:48px;
            background:linear-gradient(135deg,${cd.color},${cd.color}88);
            border-radius:var(--radius-lg);display:flex;align-items:center;
            justify-content:center;font-size:22px;flex-shrink:0">${cd.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:var(--text-sm);
              color:var(--text-primary);margin-bottom:2px">${cd.name}</div>
            <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:6px">
              ${lecs.length} lecture${lecs.length !== 1 ? 's' : ''} · ${pct}% complete</div>
            <div style="height:5px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden">
              <div style="height:5px;width:${pct}%;background:${cd.color};
                border-radius:3px;transition:width 0.8s ease"></div>
            </div>
          </div>
          <span style="font-size:16px;color:var(--text-tertiary)">›</span>
        </div>`;
    }).join('');
    // Sync to courses section too
    if (targetId === 'enrolled-courses') {
      const dest = document.getElementById('enrolled-courses-2');
      if (dest) dest.innerHTML = container.innerHTML;
    }
  },

  // ── RECENT LECTURES ────────────────────────────
  renderRecentLectures() {
    const container = document.getElementById('recent-lectures');
    if (!container) return;
    this.lectures = JSON.parse(localStorage.getItem(this.LECTURES_KEY) || '[]');
    const recent = this.lectures
      .filter(l => this.getProgress(l.id) > 0 && this.getProgress(l.id) < 100)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
    if (!recent.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:var(--space-8);color:var(--text-tertiary)">
          <div style="font-size:36px;margin-bottom:var(--space-3)">▶️</div>
          <p style="font-size:var(--text-sm)">Start watching lectures to see progress here.</p>
        </div>`;
      return;
    }
    container.innerHTML = recent.map(l => this.renderLectureCard(l, true)).join('');
  },

  // ── AVAILABLE LECTURES ─────────────────────────
  renderAvailableLectures(filterQ = '') {
    const container = document.getElementById('available-lectures');
    if (!container) return;
    this.lectures = JSON.parse(localStorage.getItem(this.LECTURES_KEY) || '[]');

    let list = [...this.lectures].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filterQ.trim()) {
      const q = filterQ.toLowerCase();
      list = list.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.course.toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q)
      );
    }

    if (!list.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:var(--space-12);color:var(--text-tertiary)">
          <div style="font-size:40px;margin-bottom:var(--space-4)">📭</div>
          <p style="font-size:var(--text-sm);font-weight:600">
            ${filterQ ? 'No lectures match your search.' : 'No lectures available yet. Check back soon!'}
          </p>
        </div>`;
      return;
    }
    container.innerHTML = list.map(l => this.renderLectureCard(l, false)).join('');
  },

  // ── LECTURE CARD ───────────────────────────────
  renderLectureCard(lec, showProgress) {
    const pct  = this.getProgress(lec.id);
    const cd   = this.getCourseInfo(lec.course);
    const date = lec.createdAt
      ? new Date(lec.createdAt).toLocaleDateString('en-PK', { year:'numeric', month:'short', day:'numeric' })
      : '';
    const thumb = lec.videoId
      ? `<img src="https://img.youtube.com/vi/${lec.videoId}/mqdefault.jpg"
           style="width:100%;height:100%;object-fit:cover"
           loading="lazy"
           onerror="this.parentElement.innerHTML='<span style=font-size:24px>▶️</span>'">`
      : `<span style="font-size:24px">▶️</span>`;

    return `
      <div style="display:flex;align-items:center;gap:var(--space-4);
        padding:var(--space-4);border-bottom:1px solid var(--border-subtle);
        transition:background 0.15s"
        onmouseover="this.style.background='var(--bg-secondary)'"
        onmouseout="this.style.background=''">
        <!-- Thumbnail -->
        <div onclick="StudentDash.watchLecture('${lec.id}')"
          style="width:110px;height:64px;background:var(--bg-tertiary);
          border-radius:var(--radius-lg);flex-shrink:0;cursor:pointer;
          overflow:hidden;display:flex;align-items:center;
          justify-content:center;position:relative">
          ${thumb}
          <div style="position:absolute;inset:0;display:flex;align-items:center;
            justify-content:center;background:rgba(0,0,0,0.25);opacity:0;
            transition:opacity 0.2s;border-radius:var(--radius-lg)"
            onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0">
            <div style="width:28px;height:28px;background:white;border-radius:50%;
              display:flex;align-items:center;justify-content:center;font-size:12px">▶</div>
          </div>
        </div>
        <!-- Info -->
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:var(--text-sm);color:var(--text-primary);
            margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${lec.title}</div>
          <div style="font-size:11px;color:var(--text-tertiary);
            display:flex;gap:var(--space-3);flex-wrap:wrap;margin-bottom:4px">
            <span style="background:${cd.color}20;color:${cd.color};
              border-radius:20px;padding:1px 8px;font-weight:600">
              ${lec.course}</span>
            ${date ? `<span>📅 ${date}</span>` : ''}
          </div>
          ${showProgress ? `
            <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;margin-bottom:3px">
              <div style="height:4px;width:${pct}%;background:var(--accent-primary);
                border-radius:2px;transition:width 0.5s"></div>
            </div>
            <div style="font-size:10px;color:var(--accent-primary);font-weight:700">${pct}% watched</div>
          ` : ''}
        </div>
        <!-- Watch Button -->
        <button onclick="StudentDash.watchLecture('${lec.id}')"
          style="background:${pct > 0 ? 'var(--accent-primary)' : 'var(--bg-secondary)'};
          color:${pct > 0 ? 'white' : 'var(--text-primary)'};
          border:${pct > 0 ? 'none' : '1.5px solid var(--border-default)'};
          border-radius:var(--radius-md);padding:var(--space-2) var(--space-4);
          font-size:11px;font-weight:700;cursor:pointer;
          white-space:nowrap;flex-shrink:0;transition:all 0.2s"
          onmouseover="this.style.opacity='0.85'"
          onmouseout="this.style.opacity='1'">
          ${pct > 0 ? '▶ Continue' : '▶ Watch'}
        </button>
      </div>`;
  },

  // ── WATCH LECTURE ──────────────────────────────
  watchLecture(id) {
    this.lectures = JSON.parse(localStorage.getItem(this.LECTURES_KEY) || '[]');
    const lec = this.lectures.find(l => l.id === id);
    if (!lec) { GIT.Toast.error('Lecture not found.'); return; }

    const modal  = document.getElementById('modal-player');
    const titleEl = modal?.querySelector('.modal-title');
    const bodyEl  = modal?.querySelector('#player-body');
    if (!modal || !bodyEl) return;

    if (titleEl) titleEl.textContent = lec.title;

    const related = this.lectures
      .filter(l => l.course === lec.course && l.id !== id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    const cd   = this.getCourseInfo(lec.course);
    const date = lec.createdAt
      ? new Date(lec.createdAt).toLocaleDateString('en-PK', { year:'numeric', month:'long', day:'numeric' })
      : '';

    if (lec.videoId) {
      bodyEl.innerHTML = `
        <!-- Video Player -->
        <div style="position:relative;padding-bottom:56.25%;height:0;
          border-radius:var(--radius-xl);overflow:hidden;background:#000;
          margin-bottom:var(--space-5)">
          <iframe
            src="https://www.youtube.com/embed/${lec.videoId}?autoplay=1&rel=0&modestbranding=1"
            style="position:absolute;top:0;left:0;width:100%;height:100%;border:none"
            allowfullscreen
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen">
          </iframe>
        </div>

        <!-- Lecture Meta -->
        <div style="margin-bottom:var(--space-4)">
          <h3 style="font-size:var(--text-lg);font-weight:800;
            font-family:var(--font-display);color:var(--text-primary);
            margin-bottom:var(--space-2)">${lec.title}</h3>
          <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;
            font-size:11px;color:var(--text-tertiary);margin-bottom:var(--space-3)">
            <span style="background:${cd.color}20;color:${cd.color};
              border-radius:20px;padding:2px 10px;font-weight:700">${lec.course}</span>
            ${date ? `<span>📅 ${date}</span>` : ''}
          </div>
          ${lec.description ? `
            <p style="font-size:var(--text-sm);color:var(--text-secondary);
              line-height:1.65;margin-bottom:var(--space-4)">${lec.description}</p>` : ''}
        </div>

        <!-- Progress Buttons -->
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;
          margin-bottom:var(--space-5);padding-bottom:var(--space-5);
          border-bottom:1px solid var(--border-subtle)">
          <span style="font-size:var(--text-xs);font-weight:700;
            color:var(--text-tertiary);display:flex;align-items:center;
            margin-right:var(--space-2)">Mark progress:</span>
          ${[25,50,75,100].map(p => `
            <button onclick="StudentDash.markProgress('${lec.id}', ${p})"
              style="background:${this.getProgress(id) >= p ? 'var(--accent-primary)' : 'var(--bg-secondary)'};
              color:${this.getProgress(id) >= p ? 'white' : 'var(--text-primary)'};
              border:1px solid ${this.getProgress(id) >= p ? 'transparent' : 'var(--border-default)'};
              border-radius:var(--radius-md);padding:var(--space-2) var(--space-3);
              font-size:11px;font-weight:700;cursor:pointer;transition:all 0.2s">
              ${p === 100 ? '✓ Complete' : `${p}%`}
            </button>`).join('')}
        </div>

        <!-- Related Lectures -->
        ${related.length ? `
          <div>
            <div style="font-size:var(--text-sm);font-weight:700;
              color:var(--text-primary);margin-bottom:var(--space-3)">
              More from ${lec.course}:
            </div>
            <div style="display:flex;flex-direction:column;gap:var(--space-2)">
              ${related.map(r => `
                <div onclick="StudentDash.watchLecture('${r.id}')"
                  style="display:flex;align-items:center;gap:var(--space-3);
                  padding:var(--space-3);background:var(--bg-secondary);
                  border-radius:var(--radius-lg);cursor:pointer;transition:all 0.15s"
                  onmouseover="this.style.background='var(--bg-tertiary)'"
                  onmouseout="this.style.background='var(--bg-secondary)'">
                  <div style="width:60px;height:40px;background:var(--bg-tertiary);
                    border-radius:var(--radius-md);overflow:hidden;flex-shrink:0;
                    display:flex;align-items:center;justify-content:center">
                    ${r.videoId
                      ? `<img src="https://img.youtube.com/vi/${r.videoId}/default.jpg"
                           style="width:100%;height:100%;object-fit:cover" loading="lazy">`
                      : '▶️'}
                  </div>
                  <div>
                    <div style="font-size:var(--text-xs);font-weight:700;
                      color:var(--text-primary)">${r.title}</div>
                    <div style="font-size:10px;color:var(--accent-primary);font-weight:600;margin-top:1px">
                      ${this.getProgress(r.id) > 0 ? `${this.getProgress(r.id)}% watched` : 'Not started'}
                    </div>
                  </div>
                </div>`).join('')}
            </div>
          </div>` : ''}`;
    } else {
      bodyEl.innerHTML = `
        <div style="text-align:center;padding:var(--space-12);color:var(--text-tertiary)">
          <div style="font-size:48px;margin-bottom:var(--space-4)">⚠️</div>
          <p style="font-weight:600;color:var(--text-secondary)">
            No video available for this lecture.</p>
        </div>`;
    }

    GIT.Modal.openModal('modal-player');
    if (this.getProgress(id) === 0) this.setProgress(id, 5);
    this.renderStats();
    this.renderRecentLectures();
  },

  // ── MARK PROGRESS ─────────────────────────────
  markProgress(lecId, pct) {
    this.setProgress(lecId, pct);
    this.renderStats();
    this.renderRecentLectures();
    this.renderAvailableLectures();
    this.renderEnrolledCourses();
    if (pct >= 100) {
      GIT.Toast.success('Lecture completed! 🎉 Great work!');
    } else {
      GIT.Toast.info(`Progress saved: ${pct}%`);
    }
  },

  // ── OPEN COURSE ────────────────────────────────
  openCourse(courseId) {
    this.goSection('lectures');
    this.lectures = JSON.parse(localStorage.getItem(this.LECTURES_KEY) || '[]');
    const list = this.lectures
      .filter(l => l.course === courseId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const container = document.getElementById('available-lectures');
    if (container) {
      if (list.length) {
        container.innerHTML = list.map(l => this.renderLectureCard(l, true)).join('');
      } else {
        container.innerHTML = `
          <div style="text-align:center;padding:var(--space-10);color:var(--text-tertiary)">
            <div style="font-size:36px;margin-bottom:var(--space-3)">📭</div>
            <p style="font-size:var(--text-sm)">
              No lectures uploaded for <strong>${courseId}</strong> yet. Check back soon!</p>
          </div>`;
      }
    }
  },

  // ── SECTION NAV ────────────────────────────────
  goSection(name) {
    document.querySelectorAll('.dash-section').forEach(s => {
      s.style.display = s.getAttribute('data-section-name') === name ? 'block' : 'none';
    });
    document.querySelectorAll('.sidebar-nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-section="${name}"]`)?.classList.add('active');
    const titles = {
      overview: 'My Dashboard', courses: 'My Courses',
      lectures: 'Browse Lectures', profile: 'My Profile'
    };
    const titleEl = document.querySelector('.topbar-title');
    if (titleEl) titleEl.textContent = titles[name] || 'Dashboard';
    // Close sidebar on mobile
    document.getElementById('main-sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebar-backdrop')?.classList.remove('show');
    document.body.style.overflow = '';
  },

  initSectionNav() {
    document.querySelectorAll('[data-section]').forEach(link => {
      link.addEventListener('click', () => {
        this.goSection(link.getAttribute('data-section'));
      });
    });
  },

  // ── THEME TOGGLE ───────────────────────────────
  initTheme() {
    const btn = document.getElementById('theme-btn');
    if (!btn) return;
    const saved = localStorage.getItem('git-theme') || 'light';
    btn.textContent = saved === 'dark' ? '☀️' : '🌙';
    btn.addEventListener('click', () => {
      const cur  = document.documentElement.getAttribute('data-theme') || 'light';
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('git-theme', next);
      btn.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  },

  // ── SIDEBAR ────────────────────────────────────
  initSidebar() {
    const avatarBtn = document.getElementById('avatar-toggle-btn');
    const sidebar   = document.getElementById('main-sidebar');
    const backdrop  = document.getElementById('sidebar-backdrop');

    const open  = () => { sidebar?.classList.add('mobile-open'); backdrop?.classList.add('show'); document.body.style.overflow = 'hidden'; };
    const close = () => { sidebar?.classList.remove('mobile-open'); backdrop?.classList.remove('show'); document.body.style.overflow = ''; };

    avatarBtn?.addEventListener('click', () => sidebar?.classList.contains('mobile-open') ? close() : open());
    backdrop?.addEventListener('click', close);
  },

  // ── SEARCH ─────────────────────────────────────
  initSearch() {
    const doSearch = (q) => {
      if (q.length > 0) this.goSection('lectures');
      this.renderAvailableLectures(q);
    };
    document.getElementById('topbar-search-input')?.addEventListener('input', function() { doSearch(this.value); });
    document.getElementById('lecture-search')?.addEventListener('input', function() { doSearch(this.value); });
  },

  // ── SIGN OUT ───────────────────────────────────
  initSignOut() {
    document.getElementById('signout-btn')?.addEventListener('click', () => {
      Auth.signOut();
      GIT.Toast.info('Signed out. See you soon! 👋');
      setTimeout(() => window.location.href = '../index.html', 700);
    });
  },

  // ── PROFILE INFO ───────────────────────────────
  renderProfileInfo() {
    const info = document.getElementById('student-profile-info');
    if (!info) return;
    const u = this.user;
    const fields = [
      ['Full Name',       '👤', `${u.firstName} ${u.lastName}`],
      ["Father's Name",   '👨', u.fatherName || '—'],
      ['Email',           '✉️', u.email],
      ['Phone',           '📞', u.phone || '—'],
      ['Gender',          '⚧',  u.gender || '—'],
      ['Date of Birth',   '🎂', u.dob || '—'],
      ['Enrolled Course', '📚', u.course || '—'],
      ['Member Since',    '🗓️', u.createdAt
        ? new Date(u.createdAt).toLocaleDateString('en-PK', {year:'numeric', month:'long', day:'numeric'})
        : '—'],
    ];
    info.innerHTML = fields.map(([label, icon, val]) => `
      <div style="display:flex;gap:var(--space-3);padding:var(--space-3) var(--space-4);
        background:var(--bg-secondary);border-radius:var(--radius-lg)">
        <span style="font-size:16px;flex-shrink:0">${icon}</span>
        <div>
          <div style="font-size:10px;color:var(--text-tertiary);font-weight:700;
            text-transform:uppercase;letter-spacing:0.08em">${label}</div>
          <div style="font-weight:600;color:var(--text-primary);
            margin-top:2px;font-size:var(--text-sm)">${val}</div>
        </div>
      </div>`).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => StudentDash.init());