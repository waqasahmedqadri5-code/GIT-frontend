/* ===========================
   GIT – Homepage JS v2.0
   =========================== */

// ── Courses Data ─────────────────────────────────────────────────
const COURSES = [
  { id:'gcp',  abbr:'GCP',  name:'Green Certified Programmer',          duration:'6 Months', category:'programming', icon:'💻', color:'#059669', desc:'Master modern programming fundamentals, data structures, algorithms, and software development practices used in the industry.', skills:['Python','Java','Algorithms','OOP','Problem Solving'] },
  { id:'cit',  abbr:'CIT',  name:'Certificate in Information Technology',duration:'6 Months', category:'general',     icon:'🖥️', color:'#0891b2', desc:'A comprehensive introduction to IT covering hardware, software, networking, and essential IT skills.', skills:['Hardware','OS','Networking','Office Suite','IT Support'] },
  { id:'ccna', abbr:'CCNA', name:'Cisco Certified Network Associate',    duration:'2 Years',  category:'networking',  icon:'🌐', color:'#7c3aed', desc:'Industry-leading Cisco networking certification covering routing, switching, security, and network administration.', skills:['Routing','Switching','Security','Protocols','Troubleshooting'] },
  { id:'adse', abbr:'ADSE', name:'Advanced Diploma in Software Eng.',    duration:'3 Years',  category:'programming', icon:'⚙️', color:'#dc2626', desc:'A comprehensive software engineering program covering full-stack development, system design, databases, and DevOps.', skills:['Full-Stack','Databases','System Design','Testing','DevOps'] },
  { id:'dita', abbr:'DITA', name:'Diploma in IT Applications',           duration:'1 Year',   category:'general',     icon:'📊', color:'#d97706', desc:'Practical IT applications training covering databases, office productivity, cloud computing, and enterprise software.', skills:['MS Office','Database','Cloud Basics','ERP','Productivity'] },
  { id:'gd',   abbr:'GD',   name:'Graphic Designing',                    duration:'3 Months', category:'design',      icon:'🎨', color:'#e11d48', desc:'Master visual design principles, brand identity, print and digital media using Photoshop and Illustrator.', skills:['Photoshop','Illustrator','Branding','Typography','UI Design'] },
  { id:'seo',  abbr:'SEO',  name:'Search Engine Optimization',           duration:'2 Months', category:'digital',     icon:'🔍', color:'#0284c7', desc:'Learn to rank websites on Google, conduct keyword research, build backlinks, and master technical SEO.', skills:['On-Page SEO','Off-Page','Analytics','Keywords','Technical SEO'] },
  { id:'ai',   abbr:'AI',   name:'Artificial Intelligence',              duration:'1 Year',   category:'ai',          icon:'🤖', color:'#7c3aed', desc:'Explore AI fundamentals, neural networks, NLP, computer vision, and real-world AI applications.', skills:['Neural Networks','NLP','Computer Vision','AI Ethics','Deep Learning'] },
  { id:'ml',   abbr:'ML',   name:'Machine Learning',                     duration:'1 Year',   category:'ai',          icon:'📈', color:'#059669', desc:'Master supervised and unsupervised learning, data preprocessing, model evaluation, and ML deployment.', skills:['Supervised Learning','Clustering','Feature Eng.','Scikit-learn','TensorFlow'] },
];
window.COURSES = COURSES;

// ── UPDATE #1: Course Click — Auth Check + Save Redirect ──────────
function handleCourseClick(courseId) {
  const session = Auth.getSession();
  if (!session) {
    // Save which course user clicked
    Auth.saveCourseRedirect(courseId);
    GIT.Toast.info('Please sign in to access this course. 🔐');
    setTimeout(() => GIT.Modal.openModal('modal-student-auth'), 400);
    return;
  }
  window.location.href = `courses/course-detail.html?id=${courseId}`;
}

// ── Render Courses Grid ───────────────────────────────────────────
function renderCourses(filter = 'all') {
  const grid = document.getElementById('courses-grid');
  if (!grid) return;
  const filtered = filter === 'all' ? COURSES : COURSES.filter(c => c.category === filter);

  grid.innerHTML = filtered.map((course, i) => `
    <div class="course-card reveal" onclick="handleCourseClick('${course.id}')"
      style="cursor:pointer;animation-delay:${i * 60}ms">
      <div class="course-card-header"
        style="background:linear-gradient(135deg,${course.color}ee,${course.color}99)">
        <span class="course-card-icon">${course.icon}</span>
        <div class="course-card-abbr">${course.abbr}</div>
      </div>
      <div class="course-card-body">
        <div class="course-card-title">${course.name}</div>
        <p class="course-card-desc">${course.desc}</p>
        <div class="course-card-meta">
          <span class="course-duration"><span>🕒</span> ${course.duration}</span>
          <span class="badge badge-green">${course.category}</span>
        </div>
      </div>
    </div>`).join('');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }});
  }, { threshold: 0.08 });
  grid.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ── Course Filters ────────────────────────────────────────────────
function initCourseFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderCourses(this.getAttribute('data-filter'));
    });
  });
}

// ── UPDATE #5: Advanced Search ────────────────────────────────────
function initSearch() {
  const input   = document.getElementById('hero-search');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  const searchable = COURSES.map(c => ({
    ...c, type: 'Course',
    keywords: `${c.name} ${c.abbr} ${c.desc} ${c.skills.join(' ')}`.toLowerCase()
  }));

  let timer;
  input.addEventListener('input', function() {
    clearTimeout(timer);
    const q = this.value.trim().toLowerCase();

    if (q.length < 2) { results.classList.remove('show'); return; }

    // Loading state
    results.innerHTML = `<div style="padding:var(--space-4);text-align:center;color:var(--text-tertiary);font-size:var(--text-sm)">
      <span class="spinner" style="width:16px;height:16px;display:inline-block"></span> Searching...</div>`;
    results.classList.add('show');

    timer = setTimeout(() => {
      const matches = searchable.filter(item => item.keywords.includes(q));

      if (!matches.length) {
        results.innerHTML = `
          <div class="search-empty">
            <span class="search-empty-icon">🔍</span>
            No results for "<strong>${q}</strong>"<br>
            <span style="font-size:11px;color:var(--text-tertiary)">Try: Python, AI, SEO, CCNA…</span>
          </div>`;
      } else {
        // Highlight matching text
        const highlight = (text) => {
          const r = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
          return text.replace(r, '<mark style="background:var(--accent-light);color:var(--accent-primary);border-radius:2px;padding:0 2px">$1</mark>');
        };
        results.innerHTML = matches.slice(0, 6).map(item => `
          <div class="search-result-item" onclick="handleCourseClick('${item.id}')">
            <div class="search-result-icon">${item.icon}</div>
            <div>
              <div class="search-result-name">${highlight(item.name)}</div>
              <div class="search-result-type">${item.type} · ${item.duration}</div>
            </div>
            <span style="margin-left:auto;font-size:12px;color:var(--text-tertiary)">→</span>
          </div>`).join('');
      }
    }, 200);
  });

  // Keyboard navigation
  input.addEventListener('keydown', e => {
    const items = results.querySelectorAll('.search-result-item');
    const focused = results.querySelector('.search-result-item:focus');
    const idx = [...items].indexOf(focused);
    if (e.key === 'ArrowDown') { e.preventDefault(); (items[idx+1] || items[0])?.focus(); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); (items[idx-1] || items[items.length-1])?.focus(); }
    if (e.key === 'Escape')    { results.classList.remove('show'); input.blur(); }
  });

  results.querySelectorAll?.('.search-result-item')?.forEach(el => {
    el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', e => { if (e.key === 'Enter') el.click(); });
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.classList.remove('show');
    }
  });
}

// ── Testimonials ──────────────────────────────────────────────────
const Testimonials = {
  TESTIMONIALS: [
    { name:'Muhammad Usman', role:'Software Developer at TechCorp', course:'ADSE Graduate', avatar:'MU', text:'GIT completely transformed my career. The ADSE program gave me real hands-on projects and the mentorship I needed to land my first job as a developer within 3 months of graduating.' },
    { name:'Ayesha Raza',    role:'Network Engineer at Telenor',    course:'CCNA Graduate', avatar:'AR', text:'The CCNA program at GIT is outstanding. Our instructors had real industry experience and the lab simulations were incredible. I passed my Cisco certification exam on the first attempt!' },
    { name:'Hassan Malik',   role:'Freelance AI Developer',         course:'AI/ML Graduate',avatar:'HM', text:'The AI and ML courses gave me cutting-edge skills. The curriculum is always updated with the latest technologies. I now earn double what I made before joining GIT.' },
    { name:'Fatima Noor',    role:'UX Designer at Creative Agency', course:'GD Graduate',   avatar:'FN', text:'The Graphic Design course was amazing. The teachers push you creatively and give individual attention. My portfolio got me 3 job offers before I even graduated!' },
    { name:'Bilal Ahmed',    role:'SEO Specialist',                 course:'SEO Graduate',  avatar:'BA', text:'In just 2 months, I went from knowing nothing about SEO to ranking multiple client websites on the first page of Google. The GIT SEO course is incredibly practical.' },
  ],
  current: 0, timer: null,

  init() {
    const track = document.getElementById('testimonials-track');
    const dots  = document.getElementById('testimonials-dots');
    if (!track || !dots) return;
    track.innerHTML = this.TESTIMONIALS.map(t => `
      <div class="testimonial-slide">
        <div class="testimonial-card card-glass">
          <p class="testimonial-quote">${t.text}</p>
          <div class="testimonial-author">
            <div class="testimonial-avatar">${t.avatar}</div>
            <div>
              <div class="testimonial-name">${t.name}</div>
              <div class="testimonial-role">${t.role} · ${t.course}</div>
            </div>
          </div>
        </div>
      </div>`).join('');
    dots.innerHTML = this.TESTIMONIALS.map((_,i) =>
      `<div class="testimonials-dot ${i===0?'active':''}" data-index="${i}"></div>`).join('');
    dots.querySelectorAll('.testimonials-dot').forEach(d =>
      d.addEventListener('click', () => this.goTo(+d.getAttribute('data-index'))));
    document.getElementById('testimonial-prev')?.addEventListener('click', () => this.prev());
    document.getElementById('testimonial-next')?.addEventListener('click', () => this.next());
    this.startAuto();
    let sx = 0;
    track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, {passive:true});
    track.addEventListener('touchend',   e => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d)>50) d<0?this.next():this.prev(); });
  },
  goTo(i) {
    this.current = (i + this.TESTIMONIALS.length) % this.TESTIMONIALS.length;
    const t = document.getElementById('testimonials-track');
    if (t) t.style.transform = `translateX(-${this.current*100}%)`;
    document.querySelectorAll('.testimonials-dot').forEach((d,j) => d.classList.toggle('active', j===this.current));
    this.restartAuto();
  },
  next() { this.goTo(this.current+1); },
  prev() { this.goTo(this.current-1); },
  startAuto()   { this.timer = setInterval(()=>this.next(), 4500); },
  restartAuto() { clearInterval(this.timer); this.startAuto(); }
};

// ── Timeline ──────────────────────────────────────────────────────
function initTimeline() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
  }, { threshold: 0.5 });
  document.querySelectorAll('.timeline-step').forEach(s => obs.observe(s));
}

// ── INIT ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCourses();
  initCourseFilters();
  Testimonials.init();
  initTimeline();
  initSearch();
});