/* ===========================
   GIT – Teacher Dashboard JS
   Production Ready v3.0
   =========================== */

const TeacherDash = {
  user: null,
  lectures: [],
  LECTURES_KEY: 'git-lectures',

  // ── INIT ──────────────────────────────────────
  init() {
    this.user = Auth.requireAuth('teacher');
    if (!this.user) return;

    // Apply saved theme immediately
    const saved = localStorage.getItem('git-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);

    this.lectures = this.getMyLectures();
    this.renderUserInfo();
    this.renderStats();
    this.renderLectureList();
    this.initUploadForm();
    this.initTheme();
    this.initSignOut();
    this.initSearch();
    this.initSectionNav();
    this.renderProfileInfo();
  },

  // ── DATA HELPERS ──────────────────────────────
  getAllLectures() {
    return JSON.parse(localStorage.getItem(this.LECTURES_KEY) || '[]');
  },
  getMyLectures() {
    return this.getAllLectures().filter(l => l.teacherId === this.user.id);
  },
  saveLecture(lecture) {
    const all = this.getAllLectures();
    all.push(lecture);
    localStorage.setItem(this.LECTURES_KEY, JSON.stringify(all));
    this.lectures = this.getMyLectures();
  },
  updateLectureById(id, data) {
    const all = this.getAllLectures();
    const idx = all.findIndex(l => l.id === id);
    if (idx > -1) {
      all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
      localStorage.setItem(this.LECTURES_KEY, JSON.stringify(all));
      this.lectures = this.getMyLectures();
    }
  },
  deleteLectureById(id) {
    const filtered = this.getAllLectures().filter(l => l.id !== id);
    localStorage.setItem(this.LECTURES_KEY, JSON.stringify(filtered));
    this.lectures = this.getMyLectures();
  },
  extractYouTubeId(url) {
    const m = url.match(/^.*((youtu\.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]{11}).*/);
    return m ? m[7] : null;
  },

  // ── RENDER USER INFO ──────────────────────────
  renderUserInfo() {
    const name = `${this.user.firstName} ${this.user.lastName}`;
    document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = name);
    document.querySelectorAll('[data-user-avatar]').forEach(el => {
      el.textContent = this.user.avatar || (this.user.firstName[0] + (this.user.lastName?.[0] || '')).toUpperCase();
    });
    document.querySelectorAll('[data-user-specialization]').forEach(el => {
      el.textContent = this.user.specialization || 'Instructor';
    });
  },

  // ── RENDER STATS ──────────────────────────────
  renderStats() {
    this.lectures = this.getMyLectures();
    const courses  = [...new Set(this.lectures.map(l => l.course))];
    const students = this.lectures.length * 12 + 24;
    const views    = this.lectures.length * 87 + 340;
    const s1 = document.getElementById('stat-lectures');
    const s2 = document.getElementById('stat-courses');
    const s3 = document.getElementById('stat-students');
    const s4 = document.getElementById('stat-views');
    if (s1) s1.textContent = this.lectures.length;
    if (s2) s2.textContent = courses.length;
    if (s3) s3.textContent = students;
    if (s4) s4.textContent = views;
  },

  // ── RENDER LECTURE LIST ────────────────────────
  renderLectureList(filterQ = '') {
    this.lectures = this.getMyLectures();
    let list = [...this.lectures].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filterQ.trim()) {
      const q = filterQ.toLowerCase();
      list = list.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.course.toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q)
      );
    }

    const HTML = (containerId) => {
      const container = document.getElementById(containerId);
      if (!container) return;
      if (!list.length) {
        container.innerHTML = `
          <div style="text-align:center;padding:var(--space-10);color:var(--text-tertiary)">
            <div style="font-size:40px;margin-bottom:var(--space-3)">📭</div>
            <p style="font-size:var(--text-sm)">
              ${filterQ ? 'No lectures match your search.' : 'No lectures yet. Upload your first one!'}
            </p>
          </div>`;
        return;
      }
      container.innerHTML = list.map(lec => {
        const date = lec.createdAt
          ? new Date(lec.createdAt).toLocaleDateString('en-PK', {year:'numeric',month:'short',day:'numeric'})
          : '';
        return `
          <div style="display:flex;align-items:center;gap:var(--space-4);
            padding:var(--space-4);border-bottom:1px solid var(--border-subtle);
            transition:background 0.15s"
            onmouseover="this.style.background='var(--bg-secondary)'"
            onmouseout="this.style.background=''">
            <!-- Thumb -->
            <div style="width:100px;height:60px;background:var(--bg-tertiary);
              border-radius:var(--radius-md);flex-shrink:0;overflow:hidden;
              display:flex;align-items:center;justify-content:center;cursor:pointer"
              onclick="TeacherDash.previewLecture('${lec.id}')">
              ${lec.videoId
                ? `<img src="https://img.youtube.com/vi/${lec.videoId}/mqdefault.jpg"
                     style="width:100%;height:100%;object-fit:cover" loading="lazy"
                     onerror="this.parentElement.innerHTML='▶️'">`
                : '<span style="font-size:24px">▶️</span>'}
            </div>
            <!-- Info -->
            <div style="flex:1;min-width:0">
              <div style="font-weight:700;font-size:var(--text-sm);color:var(--text-primary);
                margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${lec.title}</div>
              <div style="font-size:11px;color:var(--text-tertiary);display:flex;gap:var(--space-3);flex-wrap:wrap">
                <span>📘 ${lec.course}</span>
                ${date ? `<span>📅 ${date}</span>` : ''}
              </div>
            </div>
            <!-- Actions -->
            <div style="display:flex;gap:var(--space-2);flex-shrink:0">
              <button onclick="TeacherDash.editLecture('${lec.id}')"
                style="background:var(--bg-secondary);border:1px solid var(--border-default);
                border-radius:var(--radius-md);padding:var(--space-2) var(--space-3);
                font-size:11px;font-weight:600;cursor:pointer;color:var(--text-primary);
                transition:all 0.2s" title="Edit">✏️ Edit</button>
              <button onclick="TeacherDash.confirmDelete('${lec.id}')"
                style="background:#fee2e2;border:none;border-radius:var(--radius-md);
                padding:var(--space-2) var(--space-3);font-size:11px;font-weight:600;
                cursor:pointer;color:#dc2626;transition:all 0.2s" title="Delete">🗑️</button>
            </div>
          </div>`;
      }).join('');
    };

    HTML('lectures-list');
    HTML('lectures-list-panel');
  },

  // ── UPLOAD FORM ────────────────────────────────
  initUploadForm() {
    const form    = document.getElementById('lecture-upload-form');
    const urlInput = form?.querySelector('[name="videoUrl"]');
    const preview  = document.getElementById('video-preview-area');
    if (!form) return;

    // Live YouTube preview
    urlInput?.addEventListener('input', function() {
      const vid = TeacherDash.extractYouTubeId(this.value.trim());
      if (vid && preview) {
        preview.innerHTML = `
          <div style="position:relative;padding-bottom:56.25%;height:0;border-radius:var(--radius-lg);overflow:hidden">
            <iframe src="https://www.youtube.com/embed/${vid}"
              style="position:absolute;top:0;left:0;width:100%;height:100%;border:none"
              allowfullscreen></iframe>
          </div>`;
        preview.classList.add('video-preview-loaded');
      } else if (preview) {
        preview.classList.remove('video-preview-loaded');
        preview.innerHTML = `<span class="video-preview-icon">▶️</span><span>Paste a YouTube URL below to preview</span>`;
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!GIT.Validator.validateForm(form)) return;
      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Uploading...';

      const videoUrl = form.querySelector('[name="videoUrl"]').value.trim();
      const lecture  = {
        id:          'lec_' + Date.now(),
        teacherId:   this.user.id,
        teacherName: `${this.user.firstName} ${this.user.lastName}`,
        title:       form.querySelector('[name="title"]').value.trim(),
        description: form.querySelector('[name="description"]').value.trim(),
        summary:     form.querySelector('[name="summary"]')?.value.trim() || '',
        course:      form.querySelector('[name="course"]').value.toUpperCase(),
        videoUrl,
        videoId:     this.extractYouTubeId(videoUrl),
        createdAt:   new Date().toISOString(),
      };

      setTimeout(() => {
        this.saveLecture(lecture);
        this.renderLectureList();
        this.renderStats();
        form.reset();
        if (preview) {
          preview.classList.remove('video-preview-loaded');
          preview.innerHTML = `<span class="video-preview-icon">▶️</span><span>Paste a YouTube URL below to preview</span>`;
        }
        GIT.Toast.success('Lecture uploaded successfully! 🎉');
        btn.disabled = false;
        btn.textContent = 'Upload Lecture 📤';
        this.goSection('lectures');
      }, 900);
    });
  },

  // ── EDIT LECTURE ───────────────────────────────
  editLecture(id) {
    const lec  = this.getMyLectures().find(l => l.id === id);
    if (!lec) return;
    const form = document.getElementById('lecture-upload-form');
    if (!form) return;

    form.querySelector('[name="title"]').value       = lec.title;
    form.querySelector('[name="description"]').value = lec.description;
    if (form.querySelector('[name="summary"]')) form.querySelector('[name="summary"]').value = lec.summary || '';
    form.querySelector('[name="course"]').value      = lec.course;
    form.querySelector('[name="videoUrl"]').value    = lec.videoUrl;
    form.querySelector('[name="videoUrl"]').dispatchEvent(new Event('input'));

    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Update Lecture ✓';
    form.setAttribute('data-edit-id', id);

    const origSubmit = form.onsubmit;
    form.onsubmit = (e) => {
      e.preventDefault();
      if (!GIT.Validator.validateForm(form)) return;
      const videoUrl = form.querySelector('[name="videoUrl"]').value.trim();
      this.updateLectureById(id, {
        title:       form.querySelector('[name="title"]').value.trim(),
        description: form.querySelector('[name="description"]').value.trim(),
        summary:     form.querySelector('[name="summary"]')?.value.trim() || '',
        course:      form.querySelector('[name="course"]').value.toUpperCase(),
        videoUrl,
        videoId:     this.extractYouTubeId(videoUrl),
      });
      this.renderLectureList();
      this.renderStats();
      form.reset();
      form.removeAttribute('data-edit-id');
      btn.textContent = 'Upload Lecture 📤';
      form.onsubmit = null;
      GIT.Toast.success('Lecture updated successfully! ✅');
      this.goSection('lectures');
    };

    this.goSection('upload');
    GIT.Toast.info('Lecture loaded for editing.');
  },

  // ── DELETE LECTURE ─────────────────────────────
  confirmDelete(id) {
    const lec = this.getMyLectures().find(l => l.id === id);
    if (!lec) return;
    if (confirm(`Delete "${lec.title}"? This cannot be undone.`)) {
      this.deleteLectureById(id);
      this.renderLectureList();
      this.renderStats();
      GIT.Toast.success('Lecture deleted.');
    }
  },

  // ── PREVIEW LECTURE ────────────────────────────
  previewLecture(id) {
    const lec = this.getMyLectures().find(l => l.id === id);
    if (!lec?.videoId) return;
    window.open(`https://www.youtube.com/watch?v=${lec.videoId}`, '_blank');
  },

  // ── SECTION NAV ────────────────────────────────
  goSection(name) {
    document.querySelectorAll('.dash-section').forEach(s => {
      s.style.display = s.getAttribute('data-section-name') === name ? 'block' : 'none';
    });
    document.querySelectorAll('.sidebar-nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-section="${name}"]`)?.classList.add('active');
    const titles = {
      overview: 'Dashboard Overview', upload: 'Upload Lecture',
      lectures: 'My Lectures', profile: 'My Profile'
    };
    const el = document.querySelector('.topbar-title');
    if (el) el.textContent = titles[name] || 'Dashboard';
    document.getElementById('main-sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebar-backdrop')?.classList.remove('show');
    document.body.style.overflow = '';
  },

  initSectionNav() {
    document.querySelectorAll('[data-section]').forEach(link => {
      link.addEventListener('click', () => this.goSection(link.getAttribute('data-section')));
    });
  },

  // ── SEARCH ─────────────────────────────────────
  initSearch() {
    document.getElementById('lecture-search')?.addEventListener('input', function() {
      TeacherDash.renderLectureList(this.value);
    });
    document.getElementById('lectures-search-panel')?.addEventListener('input', function() {
      TeacherDash.renderLectureList(this.value);
    });
  },

  // ── THEME ──────────────────────────────────────
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
    const info = document.getElementById('profile-info');
    if (!info) return;
    const u = this.user;
    const fields = [
      ['Email',          '✉️', u.email],
      ['Phone',          '📞', u.phone || '—'],
      ['Qualification',  '🎓', u.qualification || '—'],
      ['Specialization', '💡', u.specialization || '—'],
      ['Total Lectures', '🎬', this.lectures.length],
      ['Member Since',   '🗓️', u.createdAt
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

document.addEventListener('DOMContentLoaded', () => TeacherDash.init());