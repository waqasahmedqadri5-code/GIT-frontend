/* ===========================
   GIT – Core App Utilities
   =========================== */

// ── Theme Manager ──────────────────────────────────────────────
const ThemeManager = {
  STORAGE_KEY: 'git-theme',
  
  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    this.apply(theme, false);
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.apply(e.matches ? 'dark' : 'light', true);
      }
    });
  },

  get current() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },

  apply(theme, transition = true) {
    if (!transition) {
      document.documentElement.style.transition = 'none';
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    if (!transition) {
      requestAnimationFrame(() => {
        document.documentElement.style.transition = '';
      });
    }
  },

  toggle() {
    this.apply(this.current === 'dark' ? 'light' : 'dark');
  }
};

// ── Splash Loader ──────────────────────────────────────────────
const Loader = {
  init() {
    const splash = document.getElementById('splash-loader');
    if (!splash) return;

    const minTime = 2200;
    const start = Date.now();

    window.addEventListener('load', () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minTime - elapsed);
      setTimeout(() => this.hide(splash), remaining);
    });

    // Fallback
    setTimeout(() => this.hide(splash), minTime + 1000);
  },

  hide(splash) {
    splash.classList.add('hidden');
    setTimeout(() => {
      splash.style.display = 'none';
      document.body.classList.remove('overflow-hidden');
    }, 700);
  }
};

// ── Navbar ──────────────────────────────────────────────────────
const Navbar = {
  init() {
    const navbar = document.getElementById('navbar');
    const menuBtn = document.querySelector('.nav-menu-btn');
    const drawer = document.querySelector('.nav-mobile-drawer');
    const themeToggle = document.querySelectorAll('.theme-toggle');

    if (!navbar) return;

    // Scroll shrink
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      navbar.classList.toggle('scrolled', y > 20);
      lastY = y;
    }, { passive: true });

    // Mobile menu toggle
    if (menuBtn && drawer) {
      menuBtn.addEventListener('click', () => {
        const isOpen = drawer.classList.toggle('open');
        menuBtn.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
      });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        drawer?.classList.remove('open');
        menuBtn?.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });

    // Theme toggles
    themeToggle.forEach(btn => {
      btn.addEventListener('click', () => ThemeManager.toggle());
    });

    // Active nav link
    this.updateActive();
  },

  updateActive() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      link.classList.toggle('active', href === path || href.includes(path));
    });
  }
};

// ── Scroll Reveal ────────────────────────────────────────────────
const ScrollReveal = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      observer.observe(el);
    });
  }
};

// ── Toast Notifications ──────────────────────────────────────────
const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 3500) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span>${message}</span>
    `;

    this.container.appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error'); },
  info(msg)    { this.show(msg, 'info'); }
};

// ── Modal Manager ────────────────────────────────────────────────
const Modal = {
  openModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.classList.add('modal-open');
    
    // Focus first input
    setTimeout(() => {
      const first = overlay.querySelector('input, select, textarea');
      first?.focus();
    }, 300);
  },

  closeModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.classList.remove('modal-open');
  },

  closeAll() {
    document.querySelectorAll('.modal-overlay.open').forEach(o => {
      o.classList.remove('open');
    });
    document.body.classList.remove('modal-open');
  },

  init() {
    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) this.closeAll();
      });
    });

    // Close buttons
    document.querySelectorAll('.modal-close, [data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => this.closeAll());
    });

    // Open triggers
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-modal-open');
        this.openModal(target);
      });
    });

    // ESC key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeAll();
    });
  }
};

// ── Counter Animation ────────────────────────────────────────────
const Counter = {
  animate(el, target, duration = 1600) {
    const start = performance.now();
    const startVal = 0;
    const isDecimal = target % 1 !== 0;

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (target - startVal) * eased;
      el.textContent = isDecimal ? current.toFixed(1) : Math.round(current).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  },

  init() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-count'));
        if (!isNaN(target)) this.animate(el, target);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
  }
};

// ── Ripple Effect ────────────────────────────────────────────────
function initRipple() {
  document.querySelectorAll('.btn-primary, .btn-secondary, .role-card').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute;width:${size}px;height:${size}px;
        border-radius:50%;background:rgba(255,255,255,0.25);
        pointer-events:none;transform:scale(0);
        left:${e.clientX - rect.left - size / 2}px;
        top:${e.clientY - rect.top - size / 2}px;
        animation:rippleAnim 0.5s linear;
      `;
      if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = '@keyframes rippleAnim{to{transform:scale(2.5);opacity:0}}';
        document.head.appendChild(style);
      }
      if (getComputedStyle(this).position === 'static') this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// ── Form Validation ──────────────────────────────────────────────
const Validator = {
  rules: {
    required: (v) => v.trim().length > 0 || 'This field is required',
    email:    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email',
    phone:    (v) => /^[\d\s\+\-]{10,}$/.test(v) || 'Enter a valid phone number',
    minLen:   (n) => (v) => v.length >= n || `Minimum ${n} characters`,
    match:    (id) => (v) => v === document.getElementById(id)?.value || 'Passwords do not match',
  },

  validate(field, ruleNames) {
    const rules = Array.isArray(ruleNames) ? ruleNames : [ruleNames];
    for (const rule of rules) {
      const fn = typeof rule === 'function' ? rule : this.rules[rule];
      if (!fn) continue;
      const result = fn(field.value);
      if (result !== true) {
        this.setError(field, result);
        return false;
      }
    }
    this.clearError(field);
    return true;
  },

  setError(field, msg) {
    field.classList.add('error');
    let errEl = field.parentElement.querySelector('.input-error-msg');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'input-error-msg';
      field.parentElement.appendChild(errEl);
    }
    errEl.textContent = '⚠ ' + msg;
  },

  clearError(field) {
    field.classList.remove('error');
    field.parentElement.querySelector('.input-error-msg')?.remove();
  },

  validateForm(formEl) {
    const fields = formEl.querySelectorAll('[data-validate]');
    let valid = true;
    fields.forEach(field => {
      const rules = field.getAttribute('data-validate').split(',');
      if (!this.validate(field, rules)) valid = false;
    });
    return valid;
  }
};

// ── Smooth Anchor Scroll ─────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ── Tab Switcher ─────────────────────────────────────────────────
function initTabs(containerEl) {
  const container = containerEl || document;
  container.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      const tabGroup = this.closest('.modal-tabs');
      tabGroup.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      const target = this.getAttribute('data-tab');
      const contentContainer = tabGroup.closest('.modal')?.querySelector('.modal-body')
        || tabGroup.nextElementSibling;
      if (contentContainer) {
        contentContainer.querySelectorAll('.form-tab-content').forEach(c => c.classList.remove('active'));
        contentContainer.querySelector(`[data-tab-content="${target}"]`)?.classList.add('active');
      }
    });
  });
}

// ── App Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  Loader.init();
  Navbar.init();
  ScrollReveal.init();
  Toast.init();
  Modal.init();
  Counter.init();
  initRipple();
  initSmoothScroll();
  initTabs();
});

// Export for use in other files
window.GIT = { ThemeManager, Loader, Toast, Modal, Validator };