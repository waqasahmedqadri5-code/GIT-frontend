/* ===========================
   GIT – Authentication System
   Full Update v2.0
   =========================== */

const Auth = {
  STORAGE_KEY:  'git-user',
  USERS_KEY:    'git-users',
  THEME_KEY:    'git-theme',
  REDIRECT_KEY: 'git-redirect-course', // course redirect save karne ke liye

  getUsers()         { return JSON.parse(localStorage.getItem(this.USERS_KEY)  || '[]');  },
  saveUsers(users)   { localStorage.setItem(this.USERS_KEY, JSON.stringify(users)); },
  getSession()       { return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || 'null'); },

  // ── Sign In ──────────────────────────────────────────────────────
  signIn(email, password, role) {
    const users = this.getUsers();
    const user  = users.find(u => u.email === email && u.role === role);
    if (!user)                          return { success: false, error: 'No account found with this email.' };
    if (user.password !== this.hash(password)) return { success: false, error: 'Incorrect password.' };
    const session = { ...user };
    delete session.password;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    return { success: true, user: session };
  },

  // ── Sign Up ──────────────────────────────────────────────────────
  signUp(data, role) {
    const users  = this.getUsers();
    const exists = users.find(u => u.email === data.email);
    if (exists) return { success: false, error: 'An account with this email already exists.' };
    const user = {
      id: 'usr_' + Date.now(),
      ...data,
      role,
      password:  this.hash(data.password),
      createdAt: new Date().toISOString(),
      avatar:    ((data.firstName?.[0] || 'U') + (data.lastName?.[0] || '')).toUpperCase(),
      notifications: []
    };
    users.push(user);
    this.saveUsers(users);
    const session = { ...user };
    delete session.password;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    return { success: true, user: session };
  },

  // ── Sign Out ─────────────────────────────────────────────────────
  signOut() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  // ── UPDATE SESSION (profile edit ke liye) ────────────────────────
  updateSession(data) {
    const session = this.getSession();
    if (!session) return;
    const updated = { ...session, ...data };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    // Users list mein bhi update karo
    const users = this.getUsers();
    const idx   = users.findIndex(u => u.id === session.id);
    if (idx > -1) {
      users[idx] = { ...users[idx], ...data };
      this.saveUsers(users);
    }
    return updated;
  },

  // ── Demo Accounts ────────────────────────────────────────────────
  demoAccounts: {
    teacher: {
      id: 'demo_teacher', firstName: 'Ahmed', lastName: 'Khan',
      email: 'teacher@git.edu.pk', phone: '+92 300 1234567',
      qualification: 'M.Sc Computer Science', specialization: 'Web Development',
      role: 'teacher', avatar: 'AK', createdAt: new Date().toISOString(), notifications: []
    },
    student: {
      id: 'demo_student', firstName: 'Sara', lastName: 'Ali',
      email: 'student@git.edu.pk', phone: '+92 311 9876543',
      fatherName: 'Ali Hassan', dob: '2002-06-15', gender: 'Female',
      course: 'GCP', role: 'student', avatar: 'SA',
      createdAt: new Date().toISOString(), notifications: []
    }
  },

  loginDemo(role) {
    const user = this.demoAccounts[role];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    return { success: true, user };
  },

  // ── Hash ─────────────────────────────────────────────────────────
  hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  },

  // ── UPDATE #1: Course Redirect Save & Restore ────────────────────
  saveCourseRedirect(courseId) {
    localStorage.setItem(this.REDIRECT_KEY, courseId);
  },
  getCourseRedirect() {
    return localStorage.getItem(this.REDIRECT_KEY);
  },
  clearCourseRedirect() {
    localStorage.removeItem(this.REDIRECT_KEY);
  },

  // ── Guard ────────────────────────────────────────────────────────
  requireAuth(role) {
    const session = this.getSession();
    if (!session) {
      window.location.href = '../index.html';
      return null;
    }
    if (role && session.role !== role) {
      window.location.href = session.role === 'teacher'
        ? '../teacher-dashboard/index.html'
        : '../student-dashboard/index.html';
      return null;
    }
    return session;
  },

  redirectIfLoggedIn() {
    const session = this.getSession();
    if (!session) return;
    window.location.href = session.role === 'teacher'
      ? 'teacher-dashboard/index.html'
      : 'student-dashboard/index.html';
  }
};

// ── Theme System (UPDATE #4) ─────────────────────────────────────
const ThemeSystem = {
  KEY: 'git-theme',

  init() {
    const saved = localStorage.getItem(this.KEY) || 'light';
    this.apply(saved);
    this.bindAll();
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.KEY, theme);
    // All theme buttons update karo
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
    document.querySelectorAll('.icon-dark').forEach(el => {
      el.style.display = theme === 'dark' ? 'none' : 'inline';
    });
    document.querySelectorAll('.icon-light').forEach(el => {
      el.style.display = theme === 'dark' ? 'inline' : 'none';
    });
  },

  toggle() {
    const cur  = document.documentElement.getAttribute('data-theme') || 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    this.apply(next);
    return next;
  },

  bindAll() {
    document.querySelectorAll('[data-theme-btn], .theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => this.toggle());
    });
  }
};

// ── Notification System (BONUS) ──────────────────────────────────
const Notifications = {
  KEY: 'git-notifications',

  getAll() {
    return JSON.parse(localStorage.getItem(this.KEY) || '[]');
  },

  add(msg, type = 'info') {
    const all = this.getAll();
    all.unshift({ id: Date.now(), msg, type, time: new Date().toISOString(), read: false });
    localStorage.setItem(this.KEY, JSON.stringify(all.slice(0, 20)));
    this.updateBadge();
  },

  markAllRead() {
    const all = this.getAll().map(n => ({ ...n, read: true }));
    localStorage.setItem(this.KEY, JSON.stringify(all));
    this.updateBadge();
  },

  getUnreadCount() {
    return this.getAll().filter(n => !n.read).length;
  },

  updateBadge() {
    const count = this.getUnreadCount();
    document.querySelectorAll('.notif-badge').forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};

// ── Auth Forms ───────────────────────────────────────────────────
const AuthForms = {

  initRoleModal() {
    document.getElementById('role-teacher')?.addEventListener('click', () => {
      GIT.Modal.closeAll();
      GIT.Modal.openModal('modal-teacher-auth');
    });
    document.getElementById('role-student')?.addEventListener('click', () => {
      GIT.Modal.closeAll();
      GIT.Modal.openModal('modal-student-auth');
    });
  },

  // ── UPDATE #1: After login, redirect to saved course ─────────────
  handlePostLoginRedirect(role) {
    const courseId = Auth.getCourseRedirect();
    if (courseId && role === 'student') {
      Auth.clearCourseRedirect();
      setTimeout(() => window.location.href = `courses/course-detail.html?id=${courseId}`, 800);
      return true;
    }
    return false;
  },

  initTeacherSignIn() {
    const form = document.getElementById('teacher-signin-form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!GIT.Validator.validateForm(form)) return;
      const email = form.querySelector('[name="email"]').value;
      const pass  = form.querySelector('[name="password"]').value;
      const btn   = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Signing in...';
      setTimeout(() => {
        const result = Auth.signIn(email, pass, 'teacher');
        if (result.success) {
          GIT.Toast.success(`Welcome back, ${result.user.firstName}! 👋`);
          setTimeout(() => window.location.href = 'teacher-dashboard/index.html', 800);
        } else {
          GIT.Toast.error(result.error);
          btn.disabled = false;
          btn.textContent = 'Sign In as Teacher';
        }
      }, 800);
    });
  },

  initTeacherSignUp() {
    const form = document.getElementById('teacher-signup-form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!GIT.Validator.validateForm(form)) return;
      const data = {
        firstName:      form.querySelector('[name="firstName"]').value.trim(),
        lastName:       form.querySelector('[name="lastName"]').value.trim(),
        email:          form.querySelector('[name="email"]').value.trim(),
        phone:          form.querySelector('[name="phone"]').value.trim(),
        qualification:  form.querySelector('[name="qualification"]').value.trim(),
        specialization: form.querySelector('[name="specialization"]').value.trim(),
        password:       form.querySelector('[name="password"]').value,
      };
      const confirmPass = form.querySelector('[name="confirmPassword"]').value;
      if (data.password !== confirmPass) { GIT.Toast.error('Passwords do not match.'); return; }
      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Creating account...';
      setTimeout(() => {
        const result = Auth.signUp(data, 'teacher');
        if (result.success) {
          GIT.Toast.success('Account created! Welcome to GIT! 🎉');
          setTimeout(() => window.location.href = 'teacher-dashboard/index.html', 1000);
        } else {
          GIT.Toast.error(result.error);
          btn.disabled = false;
          btn.textContent = 'Create Teacher Account';
        }
      }, 800);
    });
  },

  initStudentSignIn() {
    const form = document.getElementById('student-signin-form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!GIT.Validator.validateForm(form)) return;
      const email = form.querySelector('[name="email"]').value;
      const pass  = form.querySelector('[name="password"]').value;
      const btn   = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Signing in...';
      setTimeout(() => {
        const result = Auth.signIn(email, pass, 'student');
        if (result.success) {
          GIT.Toast.success(`Welcome back, ${result.user.firstName}! 🎓`);
          if (!this.handlePostLoginRedirect('student')) {
            setTimeout(() => window.location.href = 'student-dashboard/index.html', 800);
          }
        } else {
          GIT.Toast.error(result.error);
          btn.disabled = false;
          btn.textContent = 'Sign In as Student';
        }
      }, 800);
    });
  },

  initStudentSignUp() {
    const form = document.getElementById('student-signup-form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!GIT.Validator.validateForm(form)) return;
      const data = {
        firstName:  form.querySelector('[name="firstName"]').value.trim(),
        lastName:   form.querySelector('[name="lastName"]').value.trim(),
        fatherName: form.querySelector('[name="fatherName"]').value.trim(),
        email:      form.querySelector('[name="email"]').value.trim(),
        phone:      form.querySelector('[name="phone"]').value.trim(),
        dob:        form.querySelector('[name="dob"]').value,
        gender:     form.querySelector('[name="gender"]').value,
        course:     form.querySelector('[name="course"]').value,
        password:   form.querySelector('[name="password"]').value,
      };
      const confirmPass = form.querySelector('[name="confirmPassword"]').value;
      if (data.password !== confirmPass) { GIT.Toast.error('Passwords do not match.'); return; }
      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Creating account...';
      setTimeout(() => {
        const result = Auth.signUp(data, 'student');
        if (result.success) {
          GIT.Toast.success('Welcome to GIT! 🎉');
          if (!this.handlePostLoginRedirect('student')) {
            setTimeout(() => window.location.href = 'student-dashboard/index.html', 1000);
          }
        } else {
          GIT.Toast.error(result.error);
          btn.disabled = false;
          btn.textContent = 'Create Student Account';
        }
      }, 800);
    });
  },

  initDemoLogins() {
    document.getElementById('demo-teacher-btn')?.addEventListener('click', () => {
      Auth.loginDemo('teacher');
      GIT.Toast.success('Entering Teacher Demo... 👨‍🏫');
      setTimeout(() => window.location.href = 'teacher-dashboard/index.html', 800);
    });
    document.getElementById('demo-student-btn')?.addEventListener('click', () => {
      Auth.loginDemo('student');
      GIT.Toast.success('Entering Student Demo... 🎓');
      setTimeout(() => window.location.href = 'student-dashboard/index.html', 800);
    });
  },

  init() {
    this.initRoleModal();
    this.initTeacherSignIn();
    this.initTeacherSignUp();
    this.initStudentSignIn();
    this.initStudentSignUp();
    this.initDemoLogins();
    ThemeSystem.init();

    if (document.body.classList.contains('page-home')) {
      Auth.redirectIfLoggedIn();
    }

    document.getElementById('nav-signin')?.addEventListener('click', () => GIT.Modal.openModal('modal-role-select'));
    document.getElementById('nav-signup')?.addEventListener('click', () => GIT.Modal.openModal('modal-role-select'));
    document.getElementById('mobile-signin')?.addEventListener('click', () => GIT.Modal.openModal('modal-role-select'));

    document.getElementById('hero-explore')?.addEventListener('click', () => {
      document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('hero-start')?.addEventListener('click', () => GIT.Modal.openModal('modal-role-select'));
    document.getElementById('cta-join-student')?.addEventListener('click', () => GIT.Modal.openModal('modal-student-auth'));
    document.getElementById('cta-join-teacher')?.addEventListener('click', () => GIT.Modal.openModal('modal-teacher-auth'));
  }
};

document.addEventListener('DOMContentLoaded', () => AuthForms.init());

window.Auth          = Auth;
window.ThemeSystem   = ThemeSystem;
window.Notifications = Notifications;