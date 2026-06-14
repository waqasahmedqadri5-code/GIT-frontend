/* ===========================
   GIT – Course Detail JS
   =========================== */

const CourseDetail = {
  course: null,
  courseId: null,

  COURSE_DATA: {
    gcp: {
      id: 'gcp', abbr: 'GCP', name: 'Green Certified Programmer', duration: '6 Months',
      icon: '💻', color: '#059669', category: 'Programming',
      desc: 'Master modern programming fundamentals, data structures, algorithms, and software development practices. This course prepares you for a professional career in software development with hands-on projects and real-world applications.',
      skills: ['Python Programming', 'Java Fundamentals', 'Data Structures', 'Algorithms', 'OOP Principles', 'Problem Solving', 'Version Control', 'Debugging'],
      outcomes: [
        'Write clean, efficient code in Python and Java',
        'Implement common data structures from scratch',
        'Solve algorithmic problems confidently',
        'Apply object-oriented design patterns',
        'Build real-world software applications',
        'Work with databases and APIs',
        'Use Git for version control',
        'Write unit tests and debug code effectively'
      ],
      curriculum: [
        { title: 'Programming Fundamentals', lessons: ['Introduction to Programming', 'Variables & Data Types', 'Control Flow', 'Functions & Scope'] },
        { title: 'Object-Oriented Programming', lessons: ['Classes & Objects', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Abstract Classes'] },
        { title: 'Data Structures', lessons: ['Arrays & Linked Lists', 'Stacks & Queues', 'Trees & Graphs', 'Hash Tables'] },
        { title: 'Algorithms', lessons: ['Sorting Algorithms', 'Searching Algorithms', 'Recursion', 'Dynamic Programming'] },
        { title: 'Final Project', lessons: ['Project Planning', 'Development Sprint', 'Code Review', 'Presentation'] }
      ],
      career: ['Junior Software Developer', 'Python Developer', 'Backend Developer', 'Software Engineer Trainee'],
      tags: ['Programming', 'Python', 'Java', 'Algorithms'],
    },
    cit: {
      id: 'cit', abbr: 'CIT', name: 'Certificate in Information Technology', duration: '6 Months',
      icon: '🖥️', color: '#0891b2', category: 'IT',
      desc: 'A comprehensive introduction to information technology covering hardware, software, networking, and essential IT skills needed in any modern workplace.',
      skills: ['Computer Hardware', 'Operating Systems', 'Networking Basics', 'Microsoft Office', 'IT Support', 'Cybersecurity Basics', 'Cloud Fundamentals', 'Troubleshooting'],
      outcomes: ['Set up and maintain computer systems', 'Install and configure operating systems', 'Troubleshoot common IT issues', 'Configure basic networks', 'Use Microsoft Office Suite proficiently', 'Apply basic cybersecurity practices'],
      curriculum: [
        { title: 'Computer Fundamentals', lessons: ['Hardware Components', 'Input/Output Devices', 'Storage Systems', 'System Assembly'] },
        { title: 'Operating Systems', lessons: ['Windows Administration', 'Linux Basics', 'File System Management', 'User & Group Management'] },
        { title: 'Networking', lessons: ['Network Topologies', 'IP Addressing', 'DNS & DHCP', 'Internet Protocols'] },
        { title: 'Office Productivity', lessons: ['MS Word Advanced', 'Excel Formulas & Charts', 'PowerPoint Presentations', 'Outlook & Teams'] }
      ],
      career: ['IT Support Technician', 'Help Desk Specialist', 'Computer Lab Assistant', 'IT Administrator'],
      tags: ['IT', 'Hardware', 'Networking', 'Office Suite'],
    },
    ccna: {
      id: 'ccna', abbr: 'CCNA', name: 'Cisco Certified Network Associate', duration: '2 Years',
      icon: '🌐', color: '#7c3aed', category: 'Networking',
      desc: 'Industry-leading Cisco networking certification covering routing, switching, security, and advanced network administration. Prepares you for the CCNA 200-301 exam.',
      skills: ['Routing Protocols', 'Switching', 'Network Security', 'TCP/IP', 'VLANs', 'WAN Technologies', 'Network Troubleshooting', 'Cisco IOS'],
      outcomes: ['Configure Cisco routers and switches', 'Implement VLANs and inter-VLAN routing', 'Deploy secure network infrastructure', 'Pass the CCNA 200-301 certification exam', 'Manage enterprise network infrastructure', 'Implement IPv4 and IPv6'],
      curriculum: [
        { title: 'Network Fundamentals', lessons: ['OSI & TCP/IP Models', 'Ethernet & Switching', 'IP Addressing', 'Subnetting'] },
        { title: 'Routing Technologies', lessons: ['Static Routing', 'OSPF', 'EIGRP', 'BGP Basics'] },
        { title: 'Switching & VLANs', lessons: ['STP', 'VLANs & Trunking', 'EtherChannel', 'Port Security'] },
        { title: 'Security & Automation', lessons: ['ACLs', 'NAT/PAT', 'VPN Basics', 'Network Automation'] }
      ],
      career: ['Network Engineer', 'Network Administrator', 'Systems Engineer', 'IT Infrastructure Specialist'],
      tags: ['Networking', 'Cisco', 'CCNA', 'Security'],
    },
    adse: {
      id: 'adse', abbr: 'ADSE', name: 'Advanced Diploma in Software Engineering', duration: '3 Years',
      icon: '⚙️', color: '#dc2626', category: 'Software Engineering',
      desc: 'A comprehensive software engineering program covering full-stack development, system design, databases, DevOps, and professional software practices. Graduate ready for senior engineering roles.',
      skills: ['Full-Stack Web Development', 'System Design', 'Databases', 'DevOps', 'Software Architecture', 'Testing', 'Agile Methodology', 'Cloud Computing'],
      outcomes: ['Build complete full-stack web applications', 'Design scalable system architectures', 'Implement CI/CD pipelines', 'Work with SQL and NoSQL databases', 'Apply Agile and Scrum methodologies', 'Deploy applications to the cloud'],
      curriculum: [
        { title: 'Year 1: Foundations', lessons: ['Programming Fundamentals', 'Web Development Basics', 'Database Design', 'Software Engineering Principles'] },
        { title: 'Year 2: Advanced Development', lessons: ['Full-Stack Frameworks', 'RESTful APIs', 'System Design', 'Testing & QA'] },
        { title: 'Year 3: Professional Practice', lessons: ['DevOps & CI/CD', 'Cloud Architecture', 'Capstone Project', 'Industry Internship'] }
      ],
      career: ['Full-Stack Developer', 'Software Engineer', 'Backend Developer', 'DevOps Engineer', 'Tech Lead'],
      tags: ['Full-Stack', 'Web Dev', 'DevOps', 'Architecture'],
    },
    dita: {
      id: 'dita', abbr: 'DITA', name: 'Diploma in IT Applications', duration: '1 Year',
      icon: '📊', color: '#d97706', category: 'IT Applications',
      desc: 'Practical IT applications training covering databases, office productivity, cloud computing, and enterprise software systems used in modern businesses.',
      skills: ['Database Management', 'MS Office Advanced', 'Cloud Computing', 'ERP Systems', 'Data Analysis', 'Business Intelligence', 'Project Management', 'E-commerce'],
      outcomes: ['Manage business databases efficiently', 'Use advanced Excel for data analysis', 'Work with cloud platforms', 'Implement ERP solutions', 'Create business intelligence reports', 'Manage digital projects'],
      curriculum: [
        { title: 'Database Applications', lessons: ['MS Access', 'SQL Server', 'Database Design', 'Data Entry & Reporting'] },
        { title: 'Cloud & Productivity', lessons: ['Google Workspace', 'Microsoft 365', 'Cloud Storage', 'Collaboration Tools'] },
        { title: 'Business Applications', lessons: ['Accounting Software', 'ERP Basics', 'E-commerce Platforms', 'Digital Marketing Tools'] }
      ],
      career: ['IT Applications Specialist', 'Database Administrator', 'Business Analyst', 'ERP Consultant'],
      tags: ['IT', 'Database', 'Cloud', 'Business'],
    },
    gd: {
      id: 'gd', abbr: 'GD', name: 'Graphic Designing', duration: '3 Months',
      icon: '🎨', color: '#e11d48', category: 'Design',
      desc: 'Master visual design principles, brand identity, print and digital media using industry-standard tools. Build a professional portfolio ready for freelancing or agency work.',
      skills: ['Adobe Photoshop', 'Adobe Illustrator', 'Brand Identity', 'Typography', 'Color Theory', 'UI Design', 'Print Design', 'Social Media Graphics'],
      outcomes: ['Create professional logos and brand identities', 'Design print materials (flyers, brochures)', 'Create social media graphics', 'Master Adobe Creative Suite', 'Build a professional design portfolio', 'Understand design principles deeply'],
      curriculum: [
        { title: 'Design Fundamentals', lessons: ['Design Principles', 'Color Theory', 'Typography', 'Composition'] },
        { title: 'Adobe Photoshop', lessons: ['Photo Editing', 'Digital Illustration', 'Photo Manipulation', 'Mockups'] },
        { title: 'Adobe Illustrator', lessons: ['Vector Graphics', 'Logo Design', 'Icon Design', 'Brand Guidelines'] },
        { title: 'Portfolio Projects', lessons: ['Brand Identity Project', 'Print Campaign', 'Social Media Pack', 'Portfolio Presentation'] }
      ],
      career: ['Graphic Designer', 'Brand Designer', 'Social Media Designer', 'Freelance Designer'],
      tags: ['Design', 'Photoshop', 'Illustrator', 'Branding'],
    },
    seo: {
      id: 'seo', abbr: 'SEO', name: 'Search Engine Optimization', duration: '2 Months',
      icon: '🔍', color: '#0284c7', category: 'Digital Marketing',
      desc: 'Learn to rank websites on Google, conduct keyword research, build backlinks, and master technical SEO strategies for clients or your own business.',
      skills: ['Keyword Research', 'On-Page SEO', 'Off-Page SEO', 'Technical SEO', 'Google Analytics', 'Link Building', 'Content Strategy', 'Local SEO'],
      outcomes: ['Rank websites on Google first page', 'Conduct comprehensive keyword research', 'Perform technical SEO audits', 'Build quality backlinks', 'Track and improve organic traffic', 'Create SEO content strategies'],
      curriculum: [
        { title: 'SEO Fundamentals', lessons: ['How Search Engines Work', 'Keyword Research', 'Competitor Analysis', 'SEO Tools Overview'] },
        { title: 'On-Page SEO', lessons: ['Title Tags & Meta Descriptions', 'Content Optimization', 'Internal Linking', 'Schema Markup'] },
        { title: 'Off-Page & Technical', lessons: ['Link Building Strategies', 'Technical Audit', 'Site Speed Optimization', 'Mobile SEO'] }
      ],
      career: ['SEO Specialist', 'Digital Marketing Manager', 'Content Strategist', 'Freelance SEO Consultant'],
      tags: ['SEO', 'Digital Marketing', 'Google', 'Analytics'],
    },
    ai: {
      id: 'ai', abbr: 'AI', name: 'Artificial Intelligence', duration: '1 Year',
      icon: '🤖', color: '#7c3aed', category: 'AI & ML',
      desc: 'Explore AI fundamentals, neural networks, natural language processing, computer vision, and real-world AI applications. Build intelligent systems from scratch.',
      skills: ['Neural Networks', 'Deep Learning', 'NLP', 'Computer Vision', 'Reinforcement Learning', 'AI Ethics', 'TensorFlow', 'PyTorch'],
      outcomes: ['Build and train neural networks', 'Implement NLP applications', 'Create computer vision systems', 'Work with LLMs and generative AI', 'Apply AI to real-world problems', 'Understand AI ethics and safety'],
      curriculum: [
        { title: 'AI Foundations', lessons: ['History of AI', 'Math for AI', 'Python for AI', 'ML Basics'] },
        { title: 'Deep Learning', lessons: ['Neural Networks', 'CNNs', 'RNNs & LSTMs', 'Transformers'] },
        { title: 'AI Applications', lessons: ['NLP Projects', 'Computer Vision', 'Generative AI', 'AI System Design'] }
      ],
      career: ['AI Engineer', 'Machine Learning Engineer', 'Research Scientist', 'AI Product Manager'],
      tags: ['AI', 'Deep Learning', 'NLP', 'Computer Vision'],
    },
    ml: {
      id: 'ml', abbr: 'ML', name: 'Machine Learning', duration: '1 Year',
      icon: '📈', color: '#059669', category: 'AI & ML',
      desc: 'Master supervised and unsupervised learning, data preprocessing, model evaluation, and deployment of ML systems at scale.',
      skills: ['Supervised Learning', 'Unsupervised Learning', 'Feature Engineering', 'Model Evaluation', 'Scikit-learn', 'TensorFlow', 'Data Preprocessing', 'MLOps'],
      outcomes: ['Build predictive ML models', 'Perform feature engineering effectively', 'Evaluate and tune model performance', 'Deploy ML models to production', 'Work with real-world datasets', 'Apply statistical analysis'],
      curriculum: [
        { title: 'ML Foundations', lessons: ['Statistics & Probability', 'Data Preprocessing', 'Exploratory Data Analysis', 'Scikit-learn Basics'] },
        { title: 'Supervised Learning', lessons: ['Linear Regression', 'Classification Models', 'Ensemble Methods', 'Neural Networks'] },
        { title: 'Advanced ML', lessons: ['Clustering Algorithms', 'Dimensionality Reduction', 'Model Deployment', 'MLOps Basics'] }
      ],
      career: ['ML Engineer', 'Data Scientist', 'AI Researcher', 'Data Analyst'],
      tags: ['Machine Learning', 'Data Science', 'Python', 'Statistics'],
    }
  },

  init() {
    const params  = new URLSearchParams(window.location.search);
    this.courseId = params.get('id') || 'gcp';
    this.course   = this.COURSE_DATA[this.courseId];

    if (!this.course) {
      window.location.href = '../index.html#courses';
      return;
    }

    this.renderPage();
    this.initCurriculum();
    this.initEnroll();
  },

  renderPage() {
    const c = this.course;

    document.title = `${c.name} – GIT`;

    // Breadcrumb
    const crumb = document.getElementById('course-breadcrumb-name');
    if (crumb) crumb.textContent = c.abbr;

    // Hero
    const heroTitle = document.getElementById('course-hero-title');
    if (heroTitle) heroTitle.textContent = c.name;

    const heroDesc = document.getElementById('course-hero-desc');
    if (heroDesc) heroDesc.textContent = c.desc;

    // Tags
    const tagsEl = document.getElementById('course-tags');
    if (tagsEl) tagsEl.innerHTML = c.tags.map(t => `<span class="course-hero-tag">${t}</span>`).join('');

    // Meta
    document.getElementById('course-duration-meta')?.querySelector('strong') &&
      (document.getElementById('course-duration-meta').innerHTML = `<span class="course-hero-meta-item">🕒 Duration: <strong>${c.duration}</strong></span>`);

    // Card hero
    const cardIcon = document.getElementById('course-card-icon');
    if (cardIcon) cardIcon.textContent = c.icon;

    const cardDuration = document.getElementById('course-card-duration');
    if (cardDuration) cardDuration.innerHTML = `${c.duration} <span>program</span>`;

    // Color
    document.querySelectorAll('.course-hero, .course-card-preview').forEach(el => {
      el.style.background = `linear-gradient(135deg, ${c.color}ee, ${c.color}99)`;
    });

    // Skills
    const skillsEl = document.getElementById('course-skills');
    if (skillsEl) {
      skillsEl.innerHTML = c.skills.map(s => `<span class="skill-tag">✓ ${s}</span>`).join('');
    }

    // Outcomes
    const outcomesEl = document.getElementById('course-outcomes');
    if (outcomesEl) {
      outcomesEl.innerHTML = c.outcomes.map(o => `
        <div class="outcome-item">
          <div class="outcome-check">✓</div>
          <span>${o}</span>
        </div>`).join('');
    }

    // Curriculum
    const currEl = document.getElementById('course-curriculum');
    if (currEl) {
      currEl.innerHTML = c.curriculum.map((mod, i) => `
        <div class="curriculum-module ${i === 0 ? 'open' : ''}" id="mod-${i}">
          <div class="curriculum-module-header" onclick="CourseDetail.toggleModule(${i})">
            <span>📚 ${mod.title}</span>
            <span class="curriculum-module-meta">${mod.lessons.length} lessons</span>
            <span class="curriculum-module-toggle">▼</span>
          </div>
          <div class="curriculum-module-body">
            ${mod.lessons.map((l, j) => `
              <div class="curriculum-lesson">
                <span class="curriculum-lesson-icon">▶</span>
                <span class="curriculum-lesson-title">${l}</span>
                <span class="curriculum-lesson-duration">${Math.floor(Math.random() * 20 + 10)} min</span>
              </div>`).join('')}
          </div>
        </div>`).join('');
    }

    // Career
    const careerEl = document.getElementById('course-career');
    if (careerEl) {
      careerEl.innerHTML = c.career.map(r => `<span class="skill-tag">💼 ${r}</span>`).join('');
    }
  },

  toggleModule(i) {
    const mod = document.getElementById(`mod-${i}`);
    mod?.classList.toggle('open');
  },

  initCurriculum() {
    // Already handled in renderPage via onclick
  },

  initEnroll() {
    document.querySelectorAll('#enroll-btn, #enroll-btn-2').forEach(btn => {
      btn?.addEventListener('click', () => {
        const session = Auth.getSession();
        if (!session) {
          // Course ID save karo — login ke baad wapas aayenge
          Auth.saveCourseRedirect(this.courseId);
          GIT.Toast.info('Please sign in to access this course. 🔐');
          setTimeout(() => window.location.href = '../index.html', 900);
          return;
        }
        if (session.role === 'teacher') {
          GIT.Toast.info('Teachers cannot enroll. Use a student account.');
          return;
        }
        const enrolled = JSON.parse(localStorage.getItem('git-enrolled') || '{}');
        if (!enrolled[session.id]) enrolled[session.id] = [];
        const cId = this.courseId.toUpperCase();
        if (!enrolled[session.id].includes(cId)) {
          enrolled[session.id].push(cId);
          localStorage.setItem('git-enrolled', JSON.stringify(enrolled));
          GIT.Toast.success(`Enrolled in ${this.course.name}! 🎉`);
          setTimeout(() => window.location.href = '../student-dashboard/index.html', 1200);
        } else {
          GIT.Toast.info('Already enrolled! Opening your dashboard...');
          setTimeout(() => window.location.href = '../student-dashboard/index.html', 900);
        }
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => CourseDetail.init());