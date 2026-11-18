/**
 * ATS Resume Checker - Intelligent Client-Side Analysis Engine 2026
 * Supports PDF (via PDF.js), DOCX (via Mammoth), TXT/RTF, and manual paste.
 */

// State
let activeTab = 'upload';
let extractedResumeText = '';
let currentFileName = '';

// Sample Resumes for 1-Click Testing
const SAMPLE_RESUMES = {
  software: `Alex Rivera
San Francisco, CA | (555) 342-8910 | alex.rivera@email.com | linkedin.com/in/alexrivera | github.com/alexrivera

PROFESSIONAL SUMMARY
Results-driven Senior Full Stack Software Engineer with 6+ years of experience designing and scaling high-traffic cloud applications. Spearheaded backend re-architecture reducing latency by 42% for 2M+ active users. Expert in TypeScript, React, Node.js, Python, PostgreSQL, AWS, and Docker.

CORE SKILLS
• Languages: TypeScript, JavaScript (ES6+), Python, SQL, Go
• Frameworks & Tools: React.js, Next.js, Node.js, Express, Redux, Tailwind CSS, GraphQL
• Cloud & DevOps: AWS (EC2, S3, Lambda), Docker, Kubernetes, CI/CD pipelines, Git, Redis
• Architecture & Testing: RESTful APIs, Microservices, System Design, Jest, Cypress, PostgreSQL

PROFESSIONAL EXPERIENCE
Senior Software Engineer | CloudScale Technologies, San Francisco, CA | 2022 - Present
• Spearheaded migration of legacy monolith to microservices using Node.js and Docker, improving system reliability by 99.98% uptime.
• Architected real-time analytics pipeline processing 50M+ daily events with Redis and AWS Kinesis, reducing query latency by 35%.
• Mentored 6 junior engineers through code reviews and bi-weekly design sessions, boosting sprint velocity by 22%.
• Engineered CI/CD pipeline using GitHub Actions, cutting production deployment time from 45 minutes to 7 minutes.

Software Engineer | FinTech Innovations, Austin, TX | 2019 - 2022
• Developed and deployed 14 customer-facing financial dashboards with React and TypeScript, increasing user retention by 28%.
• Optimized complex PostgreSQL database queries and indexing strategies, reducing page load times by 40% across top features.
• Collaborated closely with Product Managers and UX designers to launch Stripe payments integration generating $3.5M in ARR.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | 2015 - 2019
• GPA: 3.8/4.0 | Dean's Honor Roll

CERTIFICATIONS
• AWS Certified Solutions Architect - Associate (2023)`,

  marketing: `Sarah Jenkins
Chicago, IL | (555) 789-2341 | sarah.jenkins@marketingpro.com | linkedin.com/in/sarahjenkins

PROFESSIONAL SUMMARY
Dynamic Growth Marketing Manager with 5+ years of experience building multi-channel customer acquisition funnels and driving brand acceleration. Proven track record of generating $4.2M in pipeline revenue and improving marketing ROI by 65% through data-driven SEO, Google Ads, and content strategies.

CORE COMPETENCIES
• Digital Marketing: Search Engine Optimization (SEO), SEM, Google Ads, Paid Social (Meta, LinkedIn), Content Strategy
• Analytics & CRO: Google Analytics 4, Mixpanel, A/B Testing, Conversion Rate Optimization, HubSpot, Tableau
• Campaign Strategy: Email Automation, Lead Generation, Budget Management ($120K/month), Brand Messaging

EXPERIENCE
Growth Marketing Manager | Apex Growth Labs, Chicago, IL | 2021 - Present
• Spearheaded comprehensive SEO and content revamp, increasing organic inbound traffic by 185% (from 40K to 114K monthly visitors).
• Managed an annual paid acquisition budget of $1.4M across Google Ads and LinkedIn Ads, lowering Customer Acquisition Cost (CAC) by 31%.
• Executed 45+ landing page A/B tests with Optimizely, improving average conversion rate from 2.8% to 5.4%.
• Authored weekly analytics reports for C-suite executives analyzing campaign CAC, LTV, and payback periods.

Digital Marketing Specialist | BrightPeak Media, New York, NY | 2018 - 2021
• Launched automated email drip campaigns for 250,000+ subscribers via HubSpot, boosting click-through rate by 42%.
• Collaborated with design and copy teams to produce 60+ targeted marketing campaigns for B2B SaaS clients.
• Conducted competitor keyword research and gap analysis, improving top 10 keyword rankings by 120 positions.

EDUCATION
Bachelor of Arts in Communications & Marketing | Northwestern University | 2014 - 2018`,

  entry: `Jordan Miller
Seattle, WA | (555) 432-1098 | jordan.miller@email.com | linkedin.com/in/jordanmiller

OBJECTIVE
Motivated Computer Science graduate seeking an Associate Software Developer role. Strong foundation in Python, Java, web development, and algorithms, eager to contribute to innovative software products.

TECHNICAL SKILLS
• Programming: Python, Java, JavaScript, HTML5, CSS3, SQL
• Tools & Platforms: Git, GitHub, VS Code, Linux, Docker, MySQL
• Concepts: Object-Oriented Programming (OOP), Data Structures, REST APIs, Agile

PROJECTS
E-Commerce Web Application | Full Stack Project
• Developed a responsive full-stack shopping portal using React, Node.js, and MongoDB with shopping cart and user authentication.
• Implemented Stripe checkout API for secure test transactions with 100% test coverage.

Algorithmic Task Manager | Personal Project
• Built a task prioritization tool in Python utilizing graph algorithms to calculate optimal task sequencing.
• Deployed application to Heroku with 50+ beta testers.

EDUCATION
Bachelor of Science in Information Technology | University of Washington | 2020 - 2024
• Coursework: Data Structures, Database Systems, Web Development, Software Engineering`
};

// Top ATS Action Power Verbs
const ACTION_VERBS = [
  'accelerated', 'achieved', 'administered', 'advised', 'analyzed', 'architected', 'assembled',
  'authored', 'automated', 'boosted', 'budgeted', 'built', 'calculated', 'championed', 'coached',
  'collaborated', 'composed', 'conceptualized', 'conducted', 'configured', 'constructed', 'contracted',
  'controlled', 'converted', 'coordinated', 'created', 'customized', 'debugged', 'decreased',
  'delegated', 'delivered', 'designed', 'developed', 'devised', 'directed', 'distributed',
  'documented', 'doubled', 'drafted', 'earned', 'engineered', 'enhanced', 'established',
  'estimated', 'evaluated', 'examined', 'executed', 'expanded', 'expedited', 'facilitated',
  'formulated', 'founded', 'generated', 'guided', 'handled', 'headed', 'identified',
  'implemented', 'improved', 'increased', 'initiated', 'inspected', 'installed', 'instituted',
  'instructed', 'integrated', 'invented', 'investigated', 'launched', 'led', 'managed',
  'maximized', 'mentored', 'minimized', 'modernized', 'monitored', 'negotiated', 'obtained',
  'operated', 'optimized', 'orchestrated', 'organized', 'overhauled', 'oversaw', 'performed',
  'pioneered', 'planned', 'prepared', 'presented', 'produced', 'programmed', 'promoted',
  'published', 'rebuilt', 'recruited', 'redesigned', 'reduced', 're-engineered', 'regulated',
  'reorganized', 'researched', 'resolved', 'restructured', 'revamped', 'reviewed', 'revitalized',
  'saved', 'scaled', 'scheduled', 'screened', 'secured', 'simplified', 'solved', 'spearheaded',
  'standardized', 'streamlined', 'strengthened', 'supervised', 'surpassed', 'synthesized', 'trained',
  'transformed', 'unified', 'updated', 'upgraded', 'utilized', 'validated', 'verified'
];

// Common Industry Keywords & Skills Taxonomy
const DOMAIN_SKILL_BANK = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'sql', 'nosql', 'react', 'angular',
  'vue', 'node.js', 'django', 'fastapi', 'spring boot', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
  'ci/cd', 'microservices', 'rest api', 'graphql', 'git', 'github', 'linux', 'agile', 'scrum',
  'project management', 'seo', 'sem', 'google analytics', 'crm', 'salesforce', 'hubspot', 'lead generation',
  'a/b testing', 'data analysis', 'excel', 'tableau', 'power bi', 'machine learning', 'figma', 'ui/ux',
  'product management', 'customer retention', 'budgeting', 'cross-functional collaboration',
  'communication', 'leadership', 'problem solving', 'strategic planning', 'quality assurance'
];

// Initialize DOM Listeners
document.addEventListener('DOMContentLoaded', () => {
  initDropZone();
  initMobileMenu();
  setupSampleButtons();
});

// Tab Switcher
function switchTab(tab) {
  activeTab = tab;
  const uploadBtn = document.getElementById('tab-btn-upload');
  const pasteBtn = document.getElementById('tab-btn-paste');
  const uploadPane = document.getElementById('upload-pane');
  const pastePane = document.getElementById('paste-pane');

  if (uploadBtn && pasteBtn) {
    uploadBtn.classList.toggle('active', tab === 'upload');
    pasteBtn.classList.toggle('active', tab === 'paste');
  }
  if (uploadPane && pastePane) {
    uploadPane.classList.toggle('active', tab === 'upload');
    pastePane.classList.toggle('active', tab === 'paste');
  }
}

// Drag & Drop Setup
function initDropZone() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('resume-file');

  if (!dropZone || !fileInput) return;

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-active');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-active');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-active');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });
}

// File Handler: Reads PDF, DOCX, TXT
async function handleFileSelected(file) {
  currentFileName = file.name;
  const statusEl = document.getElementById('file-status-pill');
  const statusTxt = document.getElementById('file-status-text');

  if (statusEl && statusTxt) {
    statusTxt.textContent = `Reading ${file.name}...`;
    statusEl.style.display = 'inline-flex';
  }

  try {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'pdf') {
      extractedResumeText = await parsePdfFile(file);
    } else if (ext === 'docx') {
      extractedResumeText = await parseDocxFile(file);
    } else {
      // Plain text, Markdown, RTF fallback
      extractedResumeText = await parseTextFile(file);
    }

    if (!extractedResumeText || extractedResumeText.trim().length < 50) {
      throw new Error('File text could not be extracted or is too short. Please paste text directly.');
    }

    if (statusTxt) {
      statusTxt.textContent = `✓ ${file.name} ready (${extractedResumeText.trim().split(/\s+/).length} words)`;
    }
  } catch (err) {
    console.error('File parse error:', err);
    alert(`Could not extract text from "${file.name}". You can paste the resume text directly in the "Paste Text" tab!`);
    if (statusEl) statusEl.style.display = 'none';
    extractedResumeText = '';
  }
}

// Parse PDF using PDF.js CDN
async function parsePdfFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  if (typeof pdfjsLib === 'undefined') {
    throw new Error('PDF.js library is not loaded');
  }

  // Set worker if needed
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items.map(item => item.str);
    fullText += pageStrings.join(' ') + '\n';
  }

  return fullText.trim();
}

// Parse DOCX using Mammoth.js CDN
async function parseDocxFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  if (typeof mammoth === 'undefined') {
    throw new Error('Mammoth.js library is not loaded');
  }

  const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
  return (result.value || '').trim();
}

// Parse Plain Text
function parseTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result || '');
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Sample Resume Buttons
function setupSampleButtons() {
  document.querySelectorAll('.sample-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const type = btn.getAttribute('data-sample');
      loadSampleResume(type);
    });
  });
}

function loadSampleResume(type) {
  const sample = SAMPLE_RESUMES[type] || SAMPLE_RESUMES.software;
  extractedResumeText = sample;
  currentFileName = `sample-${type}-resume.txt`;

  // Switch to paste tab so user can see and edit the text
  switchTab('paste');
  const textarea = document.getElementById('resume-text');
  if (textarea) {
    textarea.value = sample;
  }

  // Pre-fill a sample Job Description for high accuracy
  const jdTextarea = document.getElementById('job-desc');
  if (jdTextarea && !jdTextarea.value.trim()) {
    if (type === 'software') {
      jdTextarea.value = `We are seeking an experienced Full Stack Software Engineer to build scalable cloud architectures with React, Node.js, TypeScript, AWS, and Docker. Experience with microservices, CI/CD pipelines, PostgreSQL, and distributed caching (Redis) is highly preferred.`;
    } else if (type === 'marketing') {
      jdTextarea.value = `Looking for a Growth Marketing Manager to oversee multi-channel acquisition, SEO optimization, Google Ads, content marketing, HubSpot automation, and A/B testing with proven CAC reduction experience.`;
    } else {
      jdTextarea.value = `Entry-level Software Developer wanted. Requirements: Python, Java, SQL, REST APIs, Git, problem solving, and object-oriented programming.`;
    }
  }

  showToast(`Loaded ${type} sample resume!`);
}

// Breadcrumb Step Bar Updater
function updateSteps(stepNumber) {
  [1, 2, 3].forEach(n => {
    const stepEl = document.getElementById(`step-item-${n}`);
    const dividerEl = document.getElementById(`step-div-${n}`);
    if (stepEl) {
      stepEl.classList.remove('active', 'done');
      if (n < stepNumber) stepEl.classList.add('done');
      else if (n === stepNumber) stepEl.classList.add('active');
    }
    if (dividerEl) {
      dividerEl.classList.toggle('done', n < stepNumber);
    }
  });
}

// Main Scan Action
async function runAnalysis() {
  const pasteText = (document.getElementById('resume-text') ? document.getElementById('resume-text').value : '').trim();
  const resumeText = activeTab === 'paste' ? pasteText : (extractedResumeText || pasteText);
  const jobDesc = (document.getElementById('job-desc') ? document.getElementById('job-desc').value : '').trim();

  if (!resumeText || resumeText.length < 50) {
    alert('Please upload a resume file or paste your resume content (at least 50 characters) to analyze.');
    return;
  }

  const btn = document.getElementById('scan-submit-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<svg class="spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Scanning Resume...`;
  }

  updateSteps(2);

  // Switch views
  const inputCard = document.getElementById('tool-input-card');
  const resultsCard = document.getElementById('tool-results-card');
  const loaderEl = document.getElementById('scanner-loader');
  const contentEl = document.getElementById('results-content-body');

  if (inputCard) inputCard.style.display = 'none';
  if (resultsCard) {
    resultsCard.style.display = 'block';
    resultsCard.classList.add('show');
  }
  if (loaderEl) loaderEl.style.display = 'block';
  if (contentEl) contentEl.innerHTML = '';

  // Scroll to tool view
  const toolTop = document.getElementById('main-ats-tool');
  if (toolTop) toolTop.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Animate loader checkmarks
  await animateLoaderSteps();

  // Run comprehensive local ATS diagnostic engine
  const analysisResult = analyzeResumeEngine(resumeText, jobDesc);

  // Hide loader and display results
  if (loaderEl) loaderEl.style.display = 'none';
  updateSteps(3);
  renderResultsView(analysisResult);
}

// Animate Loader Checklist
function animateLoaderSteps() {
  return new Promise(resolve => {
    let step = 1;
    const interval = setInterval(() => {
      const stepItem = document.getElementById(`chk-step-${step}`);
      if (stepItem) stepItem.classList.add('done');
      step++;
      if (step > 4) {
        clearInterval(interval);
        setTimeout(resolve, 350);
      }
    }, 450);
  });
}

// ===================================================================
// Comprehensive Local ATS Scoring Algorithm
// ===================================================================
function analyzeResumeEngine(resume, jd) {
  const textLower = resume.toLowerCase();
  const words = resume.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Structure & Section Completeness (Max 20 pts)
  let structureScore = 0;
  const sectionsFound = [];
  const sectionsMissing = [];

  const sectionPatterns = [
    { name: 'Contact Information', regex: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/, points: 4 },
    { name: 'Professional Summary', regex: /(summary|profile|about me|objective|overview)/i, points: 4 },
    { name: 'Work Experience', regex: /(experience|employment|work history|career history|positions held)/i, points: 5 },
    { name: 'Education', regex: /(education|academic|degree|university|college|bachelor|master|phd)/i, points: 4 },
    { name: 'Skills', regex: /(skills|core competencies|technical skills|technologies|tools)/i, points: 3 }
  ];

  sectionPatterns.forEach(s => {
    if (s.regex.test(resume)) {
      structureScore += s.points;
      sectionsFound.push(s.name);
    } else {
      sectionsMissing.push(s.name);
    }
  });

  // Check specific contact details
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resume);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/.test(resume);
  const hasLinkedIn = /(linkedin\.com|github\.com|portfolio|behance)/i.test(resume);

  // 2. Keyword Optimization (Max 25 pts)
  let keywordScore = 0;
  let foundKeywords = [];
  let missingKeywords = [];
  let suggestedKeywords = [];

  if (jd && jd.trim().length > 30) {
    const jdClean = jd.toLowerCase().replace(/[^a-z0-9+#.\s]/g, ' ');
    const jdWords = jdClean.split(/\s+/).filter(w => w.length > 3);
    const stopWords = new Set(['with', 'this', 'that', 'have', 'from', 'they', 'will', 'would', 'there', 'their', 'what', 'about', 'which', 'when', 'make', 'like', 'time', 'just', 'know', 'take', 'person', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'other', 'than', 'then', 'look', 'only', 'come', 'over', 'think', 'also', 'back', 'after', 'work', 'first', 'well', 'even', 'want', 'because', 'any', 'these', 'give', 'most', 'role', 'team', 'company', 'join', 'opportunity', 'seeking', 'candidate', 'position', 'experience', 'responsible', 'skills']);
    
    // Extract unique keywords from JD
    const jdKeywords = [...new Set(jdWords.filter(w => !stopWords.has(w)))].slice(0, 20);
    
    jdKeywords.forEach(kw => {
      if (textLower.includes(kw)) {
        foundKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    const matchRate = jdKeywords.length > 0 ? (foundKeywords.length / jdKeywords.length) : 0.8;
    keywordScore = Math.min(25, Math.round(matchRate * 25));
  } else {
    // General Domain Skill Match
    DOMAIN_SKILL_BANK.forEach(skill => {
      if (textLower.includes(skill)) {
        foundKeywords.push(skill);
      }
    });
    // Pick suggestions
    const missingDomain = DOMAIN_SKILL_BANK.filter(s => !foundKeywords.includes(s));
    suggestedKeywords = missingDomain.slice(0, 6);
    
    const count = foundKeywords.length;
    keywordScore = Math.min(25, Math.round(Math.min(count, 12) * (25 / 12)));
  }

  // Ensure arrays have sample chips if empty
  if (foundKeywords.length === 0) foundKeywords = ['Communication', 'Teamwork', 'Project Management'];
  if (missingKeywords.length === 0 && jd) missingKeywords = ['Strategic Planning', 'Data Analysis'];
  if (suggestedKeywords.length === 0) suggestedKeywords = ['Agile Methodology', 'Cross-functional Collaboration', 'Continuous Improvement', 'Process Optimization'];

  // 3. Formatting & ATS Machine Readability (Max 20 pts)
  let readabilityScore = 14;
  // Word count checks
  if (wordCount >= 400 && wordCount <= 950) {
    readabilityScore += 4;
  } else if (wordCount >= 250 && wordCount <= 1200) {
    readabilityScore += 2;
  }

  // Bullet points presence check
  const bulletCount = (resume.match(/[•\-\*]/g) || []).length;
  if (bulletCount >= 8) readabilityScore += 2;

  readabilityScore = Math.min(20, readabilityScore);

  // 4. Impact, Metrics & Action Verbs (Max 20 pts)
  let impactScore = 0;
  // Quantifiable numbers / percentages / currency
  const metricMatches = (resume.match(/\b\d+(\.\d+)?%|\$\d+(\.\d+)?[kKmMbB]?|\b\d{1,3}(,\d{3})+\b|\b\d+\+\b/g) || []);
  const metricsCount = metricMatches.length;

  if (metricsCount >= 5) impactScore += 10;
  else if (metricsCount >= 2) impactScore += 6;
  else impactScore += 3;

  // Action verbs check
  const usedVerbs = ACTION_VERBS.filter(v => textLower.includes(v));
  if (usedVerbs.length >= 8) impactScore += 10;
  else if (usedVerbs.length >= 4) impactScore += 7;
  else impactScore += 3;

  impactScore = Math.min(20, impactScore);

  // 5. Section Quality & Brevity (Max 15 pts)
  let completenessScore = 10;
  if (hasEmail) completenessScore += 2;
  if (hasPhone) completenessScore += 2;
  if (hasLinkedIn) completenessScore += 1;
  completenessScore = Math.min(15, completenessScore);

  // Calculate Overall Composite Score (0 - 100)
  const overallScore = Math.min(98, Math.max(28, structureScore + keywordScore + readabilityScore + impactScore + completenessScore));

  // Determine Grade
  let grade = 'Fair';
  if (overallScore >= 85) grade = 'Excellent';
  else if (overallScore >= 70) grade = 'Good';
  else if (overallScore >= 50) grade = 'Fair';
  else grade = 'Needs Work';

  // Generate Personalized Recommendations
  const suggestions = [];

  // Critical contact checks
  if (!hasEmail) {
    suggestions.push({
      type: 'error',
      title: 'Missing Contact Email Address',
      detail: 'ATS parsers and hiring managers need a clean, standard email address (e.g. name@email.com) in your header.'
    });
  }
  if (!hasPhone) {
    suggestions.push({
      type: 'error',
      title: 'Missing Phone Number',
      detail: 'Add a standard phone number with country/area code so recruiters can contact you for phone screenings.'
    });
  }

  // Metrics suggestion
  if (metricsCount < 3) {
    suggestions.push({
      type: 'warn',
      title: 'Add Measurable Metrics & Quantifiable Impact',
      detail: 'Recruiters and ATS look for proof of achievements. Add numbers, percentages, dollar values, or team sizes (e.g., "Increased sales by 28%", "Reduced load time by 35%").'
    });
  } else {
    suggestions.push({
      type: 'ok',
      title: 'Strong Quantifiable Achievements Detected',
      detail: `Your resume includes ${metricsCount} metric indicators that show concrete impact and business results.`
    });
  }

  // Missing sections
  if (sectionsMissing.length > 0) {
    suggestions.push({
      type: 'warn',
      title: `Missing Standard Section: ${sectionsMissing.join(', ')}`,
      detail: 'ATS parsers look for standard headings like Professional Summary, Work Experience, Education, and Skills. Ensure these sections are explicitly titled.'
    });
  }

  // Word count suggestions
  if (wordCount < 350) {
    suggestions.push({
      type: 'warn',
      title: 'Resume Length May Be Too Brief',
      detail: `Your resume has ${wordCount} words. Standard single-page ATS resumes typically contain 450–750 words to provide sufficient detail on experience and skills.`
    });
  } else if (wordCount > 1000) {
    suggestions.push({
      type: 'info',
      title: 'Lengthy Resume — Ensure High Relevancy',
      detail: `Your resume has ${wordCount} words. If you have less than 7 years of experience, consider condensing to 1–2 pages for better readability.`
    });
  } else {
    suggestions.push({
      type: 'ok',
      title: 'Optimal Word Count & Length',
      detail: `Your resume length (${wordCount} words) falls right in the sweet spot for modern ATS parsers and human recruiters.`
    });
  }

  // Action verbs suggestion
  if (usedVerbs.length < 5) {
    suggestions.push({
      type: 'warn',
      title: 'Use More Strong Action Verbs',
      detail: 'Replace passive phrases like "Responsible for" or "Assisted with" with powerful verbs like "Spearheaded", "Engineered", "Optimized", "Architected", or "Negotiated".'
    });
  } else {
    suggestions.push({
      type: 'ok',
      title: 'Excellent Active Voice & Action Verbs',
      detail: `Great job! We identified strong action verbs (${usedVerbs.slice(0, 4).join(', ')}...) that highlight your ownership and proactive contributions.`
    });
  }

  // Job description matching suggestion
  if (jd && missingKeywords.length > 0) {
    suggestions.push({
      type: 'info',
      title: 'Incorporate Missing Job Description Keywords',
      detail: `To pass candidate ranking filters, naturally integrate key missing terms like: ${missingKeywords.slice(0, 4).join(', ')}.`
    });
  }

  return {
    overallScore,
    grade,
    summary: `Your resume scored ${overallScore}/100. It demonstrates ${grade.toLowerCase()} ATS compliance with strong fundamentals. Implementing the targeted recommendations below will maximize your chances of getting past initial recruiter filters.`,
    breakdown: {
      formatting: { label: 'Structure & Completeness', score: Math.round((structureScore / 20) * 100) },
      keywords: { label: 'Keyword Optimization', score: Math.round((keywordScore / 25) * 100) },
      readability: { label: 'ATS Readability & Length', score: Math.round((readabilityScore / 20) * 100) },
      impact: { label: 'Impact & Quantified Metrics', score: Math.round((impactScore / 20) * 100) },
      completeness: { label: 'Contact & Section Hygiene', score: Math.round((completenessScore / 15) * 100) }
    },
    foundKeywords: foundKeywords.slice(0, 10),
    missingKeywords: missingKeywords.slice(0, 8),
    suggestedKeywords: suggestedKeywords.slice(0, 6),
    suggestions
  };
}

// Helpers for Colors & Grade Styles
function getScoreColor(s) {
  if (s >= 80) return '#16a34a'; // green
  if (s >= 65) return '#2563eb'; // blue
  if (s >= 45) return '#d97706'; // amber
  return '#dc2626'; // red
}

function getGradeStyles(g) {
  const styles = {
    Excellent: { bg: '#dcfce7', c: '#166534' },
    Good: { bg: '#dbeafe', c: '#1e40af' },
    Fair: { bg: '#fef3c7', c: '#92400e' },
    'Needs Work': { bg: '#fee2e2', c: '#991b1b' }
  };
  return styles[g] || styles.Fair;
}

// Render Results HTML
function renderResultsView(res) {
  const container = document.getElementById('results-content-body');
  if (!container) return;

  const circ = 2 * Math.PI * 42;
  const offset = circ - (res.overallScore / 100) * circ;
  const gradeStyle = getGradeStyles(res.grade);

  // Breakdown Cards
  const breakdownHtml = Object.values(res.breakdown).map(b => {
    const col = getScoreColor(b.score);
    return `
      <div class="category-card">
        <div class="category-card-top">
          <span class="category-name">${b.label}</span>
          <span class="category-value" style="color:${col}">${b.score}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${b.score}%;background:${col}"></div>
        </div>
      </div>
    `;
  }).join('');

  // Keyword Chips
  const foundHtml = res.foundKeywords.map(k => `<span class="kw-chip found">✓ ${k}</span>`).join('');
  const missingHtml = res.missingKeywords.map(k => `<span class="kw-chip missing">✗ ${k}</span>`).join('');
  const suggestedHtml = res.suggestedKeywords.map(k => `<span class="kw-chip suggested">+ ${k}</span>`).join('');

  // Suggestions List
  const suggestionsHtml = res.suggestions.map(s => {
    let iconSvg = '';
    if (s.type === 'error') {
      iconSvg = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    } else if (s.type === 'warn') {
      iconSvg = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    } else if (s.type === 'ok') {
      iconSvg = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
    } else {
      iconSvg = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    }

    return `
      <div class="suggestion-item ${s.type}">
        <div class="suggestion-icon-wrap">
          ${iconSvg}
        </div>
        <div class="suggestion-body">
          <strong>${s.title}</strong>
          <p>${s.detail}</p>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <!-- Overall Score Gauge -->
    <div class="overall-score-banner">
      <div class="score-circular-gauge">
        <svg width="104" height="104" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8"/>
          <circle cx="48" cy="48" r="42" fill="none" stroke="#ffffff" stroke-width="8"
            stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"
            style="transition: stroke-dashoffset 1.2s ease;"/>
        </svg>
        <div class="score-gauge-content">
          <span class="score-big-num" id="anim-score-val">0</span>
          <span class="score-max-denom">out of 100</span>
        </div>
      </div>
      <div class="score-banner-text">
        <span class="grade-tag" style="background:${gradeStyle.bg};color:${gradeStyle.c}">${res.grade} ATS Score</span>
        <h3>ATS Optimization Report</h3>
        <p>${res.summary}</p>
      </div>
    </div>

    <!-- Category Breakdown Grid -->
    <div class="breakdown-section-title">Performance Breakdown</div>
    <div class="category-breakdown-grid">
      ${breakdownHtml}
    </div>

    <!-- Keyword Analysis Matrix -->
    <div class="breakdown-section-title">Keyword &amp; Skills Gap Analysis</div>
    <div class="keyword-box">
      <div class="keyword-legend">
        <span class="kw-legend-item"><span class="kw-legend-dot" style="background:#16a34a"></span> Found in Resume</span>
        <span class="kw-legend-item"><span class="kw-legend-dot" style="background:#dc2626"></span> Missing Target Keywords</span>
        <span class="kw-legend-item"><span class="kw-legend-dot" style="background:#d97706"></span> Recommended Skills</span>
      </div>
      ${foundHtml ? `
        <div class="kw-group-block">
          <div class="kw-group-label">Found Keywords (${res.foundKeywords.length})</div>
          <div class="kw-chips-flex">${foundHtml}</div>
        </div>
      ` : ''}
      ${missingHtml ? `
        <div class="kw-group-block">
          <div class="kw-group-label">Missing Target Keywords (${res.missingKeywords.length})</div>
          <div class="kw-chips-flex">${missingHtml}</div>
        </div>
      ` : ''}
      ${suggestedHtml ? `
        <div class="kw-group-block">
          <div class="kw-group-label">Recommended Additions (${res.suggestedKeywords.length})</div>
          <div class="kw-chips-flex">${suggestedHtml}</div>
        </div>
      ` : ''}
    </div>

    <!-- Actionable Recommendations -->
    <div class="breakdown-section-title">Actionable Recommendations (${res.suggestions.length})</div>
    <div class="suggestions-list">
      ${suggestionsHtml}
    </div>

    <!-- Action Controls -->
    <div class="results-actions-row">
      <button class="results-action-btn secondary" onclick="resetToolView()">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Scan Another Resume
      </button>
      <button class="results-action-btn primary" onclick="window.print()">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
        Print / Save PDF Report
      </button>
    </div>
  `;

  // Animate count-up number
  animateScoreCounter(res.overallScore);
}

// Counter animation
function animateScoreCounter(target) {
  const el = document.getElementById('anim-score-val');
  if (!el) return;
  let current = 0;
  const step = Math.max(1, Math.floor(target / 30));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current;
  }, 25);
}

// Reset Tool to Upload Screen
function resetToolView() {
  const inputCard = document.getElementById('tool-input-card');
  const resultsCard = document.getElementById('tool-results-card');
  const fileStatus = document.getElementById('file-status-pill');
  const fileInput = document.getElementById('resume-file');
  const resumeTextarea = document.getElementById('resume-text');
  const jdTextarea = document.getElementById('job-desc');
  const scanBtn = document.getElementById('scan-submit-btn');

  if (resultsCard) {
    resultsCard.style.display = 'none';
    resultsCard.classList.remove('show');
  }
  if (inputCard) inputCard.style.display = 'block';
  if (fileStatus) fileStatus.style.display = 'none';
  if (fileInput) fileInput.value = '';
  if (resumeTextarea) resumeTextarea.value = '';
  if (jdTextarea) jdTextarea.value = '';

  extractedResumeText = '';
  currentFileName = '';

  // Reset loader checklist
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`chk-step-${i}`);
    if (el) el.classList.remove('done');
  }

  if (scanBtn) {
    scanBtn.disabled = false;
    scanBtn.innerHTML = `
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
        <circle cx="11" cy="11" r="8"></circle>
        <path stroke-linecap="round" d="M21 21l-4.35-4.35"></path>
      </svg>
      Check My Resume Score
    `;
  }

  updateSteps(1);
  const tool = document.getElementById('main-ats-tool');
  if (tool) tool.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// FAQ Accordion Toggle
function toggleFaqAccordion(btn) {
  const isOpen = btn.classList.contains('open');
  document.querySelectorAll('.faq-question-btn').forEach(b => {
    b.classList.remove('open');
    if (b.nextElementSibling) b.nextElementSibling.classList.remove('open');
  });

  if (!isOpen) {
    btn.classList.add('open');
    if (btn.nextElementSibling) {
      btn.nextElementSibling.classList.add('open');
    }
  }
}

// Mobile Menu
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle-btn');
  const navMenu = document.querySelector('.nav-menu');
  const overlay = document.querySelector('.mobile-overlay');

  if (!toggleBtn || !navMenu) return;

  const closeMenu = () => {
    navMenu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    toggleBtn.innerHTML = '&#9776;';
    document.body.style.overflow = '';
  };

  const toggle = () => {
    const isActive = navMenu.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active', isActive);
    toggleBtn.innerHTML = isActive ? '&times;' : '&#9776;';
    document.body.style.overflow = isActive ? 'hidden' : '';
  };

  toggleBtn.addEventListener('click', toggle);
  if (overlay) overlay.addEventListener('click', closeMenu);

  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      if (!link.classList.contains('dropdown-trigger')) {
        closeMenu();
      }
    });
  });
}

// Toast helper
function showToast(msg, isSuccess = true) {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast-notice ${isSuccess ? 'success' : ''} show`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
