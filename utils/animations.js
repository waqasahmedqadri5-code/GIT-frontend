/* ===========================
   GIT – Micro Animations & Interactions
   =========================== */

// ── Parallax on Hero ─────────────────────────────────────────────
const Parallax = {
  init() {
    const orbs = document.querySelectorAll('.hero-orb, .cta-orb');
    if (!orbs.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    window.addEventListener('mousemove', e => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;

        orbs.forEach((orb, i) => {
          const factor = (i % 2 === 0 ? 1 : -1) * (12 + i * 4);
          orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }
};

// ── Card Tilt on Hover ───────────────────────────────────────────
const CardTilt = {
  MAX_TILT: 6,

  init(selector = '.role-card, .feature-card') {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 1024) return; // Disable on mobile

    document.querySelectorAll(selector).forEach(card => {
      card.addEventListener('mousemove', e => this.tilt(e, card));
      card.addEventListener('mouseleave', ()  => this.reset(card));
    });
  },

  tilt(e, card) {
    const rect   = card.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const y      = e.clientY - rect.top;
    const cx     = rect.width  / 2;
    const cy     = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -this.MAX_TILT;
    const rotateY = ((x - cx) / cx) *  this.MAX_TILT;

    card.style.transform    = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
    card.style.transition   = 'transform 0.1s linear';
    card.style.willChange   = 'transform';
  },

  reset(card) {
    card.style.transform  = '';
    card.style.transition = 'transform 0.4s ease';
    setTimeout(() => { card.style.willChange = ''; }, 400);
  }
};

// ── Magnetic Button Effect ───────────────────────────────────────
const MagneticBtn = {
  STRENGTH: 0.35,

  init(selector = '.btn-primary, .btn-secondary') {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 1024) return;

    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('mousemove', e => this.attract(e, btn));
      btn.addEventListener('mouseleave', ()  => this.release(btn));
    });
  },

  attract(e, btn) {
    const rect = btn.getBoundingClientRect();
    const dx   = e.clientX - (rect.left + rect.width  / 2);
    const dy   = e.clientY - (rect.top  + rect.height / 2);
    btn.style.transform  = `translate(${dx * this.STRENGTH}px, ${dy * this.STRENGTH}px)`;
    btn.style.transition = 'transform 0.15s ease';
  },

  release(btn) {
    btn.style.transform  = '';
    btn.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
  }
};

// ── Number Ticker (enhanced) ─────────────────────────────────────
const Ticker = {
  easeOutQuart: t => 1 - Math.pow(1 - t, 4),

  run(el, from, to, duration = 1800, suffix = '') {
    const start = performance.now();
    const isFloat = (to % 1 !== 0) || suffix.includes('.');

    const step = now => {
      const p = Math.min((now - start) / duration, 1);
      const val = from + (to - from) * this.easeOutQuart(p);
      el.textContent = (isFloat ? val.toFixed(1) : Math.round(val)).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  initAll() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el  = entry.target;
        const to  = parseFloat(el.getAttribute('data-count'));
        const sfx = el.getAttribute('data-suffix') || '';
        if (!isNaN(to)) this.run(el, 0, to, 1600, sfx);
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
  }
};

// ── Cursor Glow ──────────────────────────────────────────────────
const CursorGlow = {
  glow: null,

  init() {
    if (window.innerWidth < 1024) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.glow = document.createElement('div');
    this.glow.id = 'cursor-glow';
    Object.assign(this.glow.style, {
      position: 'fixed', pointerEvents: 'none', zIndex: '9998',
      width: '320px', height: '320px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
      transform: 'translate(-50%, -50%)',
      transition: 'opacity 0.3s ease',
      willChange: 'transform'
    });
    document.body.appendChild(this.glow);

    let mx = 0, my = 0, cx = 0, cy = 0;

    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

    const animate = () => {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      this.glow.style.left = cx + 'px';
      this.glow.style.top  = cy + 'px';
      requestAnimationFrame(animate);
    };
    animate();

    // Grow on interactive elements
    document.addEventListener('mouseover', e => {
      if (e.target.closest('button, a, .card, .role-card, .course-card, .feature-card')) {
        this.glow.style.width  = '500px';
        this.glow.style.height = '500px';
        this.glow.style.background = 'radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%)';
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('button, a, .card, .role-card, .course-card, .feature-card')) {
        this.glow.style.width  = '320px';
        this.glow.style.height = '320px';
        this.glow.style.background = 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)';
      }
    });
  }
};

// ── Scroll Progress Bar ──────────────────────────────────────────
const ScrollProgress = {
  bar: null,

  init() {
    this.bar = document.createElement('div');
    this.bar.id = 'scroll-progress';
    Object.assign(this.bar.style, {
      position: 'fixed', top: '0', left: '0', zIndex: '99999',
      height: '2px', width: '0%',
      background: 'linear-gradient(90deg, var(--emerald-600), var(--emerald-400))',
      transition: 'width 0.1s linear',
      pointerEvents: 'none'
    });
    document.body.prepend(this.bar);

    window.addEventListener('scroll', () => {
      const docH  = document.documentElement.scrollHeight - window.innerHeight;
      const pct   = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      this.bar.style.width = pct + '%';
    }, { passive: true });
  }
};

// ── Typing Effect ────────────────────────────────────────────────
const Typewriter = {
  run(el, texts, speed = 80, pause = 2000) {
    let ti = 0, ci = 0, deleting = false;

    const type = () => {
      const text = texts[ti];
      if (!deleting) {
        el.textContent = text.slice(0, ++ci);
        if (ci === text.length) {
          deleting = true;
          setTimeout(type, pause);
          return;
        }
      } else {
        el.textContent = text.slice(0, --ci);
        if (ci === 0) {
          deleting = false;
          ti = (ti + 1) % texts.length;
        }
      }
      setTimeout(type, deleting ? speed / 2 : speed);
    };
    type();
  }
};

// ── Boot ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Parallax.init();
  CardTilt.init();
  Ticker.initAll();
  ScrollProgress.init();
  CursorGlow.init();

  // Typewriter on hero if element exists
  const typeEl = document.getElementById('hero-typewriter');
  if (typeEl) {
    Typewriter.run(typeEl, [
      'Software Engineers',
      'Network Engineers',
      'AI Specialists',
      'Graphic Designers',
      'SEO Experts',
      'Full-Stack Developers'
    ]);
  }
});

// Delay magnetic effect until after page loads
window.addEventListener('load', () => MagneticBtn.init());