/* ===========================
   GIT – Utility Functions
   =========================== */

// ── Date & Time Helpers ───────────────────────────────────────────
const DateUtils = {
  format(dateStr, opts = {}) {
    const date = new Date(dateStr);
    const defaults = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-PK', { ...defaults, ...opts });
  },

  timeAgo(dateStr) {
    const now   = Date.now();
    const then  = new Date(dateStr).getTime();
    const delta = Math.floor((now - then) / 1000);

    if (delta < 60)    return 'just now';
    if (delta < 3600)  return `${Math.floor(delta / 60)}m ago`;
    if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
    if (delta < 604800)return `${Math.floor(delta / 86400)}d ago`;
    return this.format(dateStr, { year: 'numeric', month: 'short', day: 'numeric' });
  },

  today() {
    return new Date().toISOString().split('T')[0];
  }
};

// ── String Helpers ───────────────────────────────────────────────
const StringUtils = {
  truncate(str, max = 120) {
    if (!str || str.length <= max) return str;
    return str.slice(0, max).replace(/\s+\S*$/, '') + '…';
  },

  initials(firstName = '', lastName = '') {
    return ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || '?';
  },

  slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  },

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};

// ── Storage Helpers ──────────────────────────────────────────────
const Store = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch { return false; }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  update(key, updater, fallback = {}) {
    const current = this.get(key, fallback);
    const updated = updater(current);
    return this.set(key, updated);
  }
};

// ── DOM Helpers ──────────────────────────────────────────────────
const DOM = {
  qs(selector, context = document)    { return context.querySelector(selector); },
  qsa(selector, context = document)   { return [...context.querySelectorAll(selector)]; },
  on(el, event, handler, opts = {})   { el?.addEventListener(event, handler, opts); },
  off(el, event, handler)             { el?.removeEventListener(event, handler); },
  create(tag, attrs = {}, text = '')  {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (text) el.textContent = text;
    return el;
  },
  empty(el) { if (el) el.innerHTML = ''; },
  show(el, display = 'block') { if (el) el.style.display = display; },
  hide(el) { if (el) el.style.display = 'none'; },
  toggle(el, display = 'block') {
    if (!el) return;
    el.style.display = el.style.display === 'none' ? display : 'none';
  },
  addClass(el, ...cls)    { el?.classList.add(...cls); },
  removeClass(el, ...cls) { el?.classList.remove(...cls); },
  toggleClass(el, cls)    { el?.classList.toggle(cls); }
};

// ── Debounce ─────────────────────────────────────────────────────
function debounce(fn, delay = 250) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ── Throttle ─────────────────────────────────────────────────────
function throttle(fn, limit = 100) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ── URL Helpers ──────────────────────────────────────────────────
const URLUtils = {
  getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  },
  setParam(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
  }
};

// ── Simple Event Bus ─────────────────────────────────────────────
const EventBus = {
  listeners: {},
  on(event, fn) {
    (this.listeners[event] ||= []).push(fn);
  },
  off(event, fn) {
    this.listeners[event] = (this.listeners[event] || []).filter(f => f !== fn);
  },
  emit(event, data) {
    (this.listeners[event] || []).forEach(fn => fn(data));
  }
};

// ── API Fetch Wrapper (ready for backend) ─────────────────────────
const API = {
  BASE_URL: 'http://localhost:5000/api', // Change when backend is ready

  async request(method, endpoint, body = null) {
    const session = JSON.parse(localStorage.getItem('git-user') || 'null');
    const headers = { 'Content-Type': 'application/json' };
    if (session?.token) headers['Authorization'] = `Bearer ${session.token}`;

    try {
      const res = await fetch(`${this.BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  get(endpoint)           { return this.request('GET',    endpoint); },
  post(endpoint, body)    { return this.request('POST',   endpoint, body); },
  put(endpoint, body)     { return this.request('PUT',    endpoint, body); },
  patch(endpoint, body)   { return this.request('PATCH',  endpoint, body); },
  delete(endpoint)        { return this.request('DELETE', endpoint); },

  // Specific endpoints (stubbed for future backend)
  auth: {
    login: (data)         => API.post('/auth/login',    data),
    register: (data)      => API.post('/auth/register', data),
    logout: ()            => API.post('/auth/logout'),
    refresh: ()           => API.post('/auth/refresh'),
  },
  courses: {
    list: ()              => API.get('/courses'),
    get: (id)             => API.get(`/courses/${id}`),
  },
  lectures: {
    list: (courseId)      => API.get(`/courses/${courseId}/lectures`),
    create: (data)        => API.post('/lectures', data),
    update: (id, data)    => API.put(`/lectures/${id}`, data),
    delete: (id)          => API.delete(`/lectures/${id}`),
  },
  students: {
    progress: (lecId, pct) => API.post('/progress', { lectureId: lecId, percent: pct }),
    enrolled: ()           => API.get('/student/courses'),
  }
};

// ── Export all ──────────────────────────────────────────────────
window.GIT_UTILS = { DateUtils, StringUtils, Store, DOM, debounce, throttle, URLUtils, EventBus, API };