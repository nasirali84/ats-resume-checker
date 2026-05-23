let activeTab = 'upload', fileText = '';
function switchTab(t) {
    activeTab = t;
    document.querySelectorAll('.tab-btn').forEach((b, i) => b.classList.toggle('active', (t === 'upload' && i === 0) || (t === 'paste' && i === 1)));
    document.getElementById('upload-pane').classList.toggle('active', t === 'upload');
    document.getElementById('paste-pane').classList.toggle('active', t === 'paste');
}

const fi = document.getElementById('resume-file'), dz = document.getElementById('drop-zone');
fi.addEventListener('change', () => { if (fi.files[0]) handleFile(fi.files[0]) });
dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-active') });
dz.addEventListener('dragleave', () => dz.classList.remove('drag-active'));
dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drag-active'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) });

function handleFile(f) {
    document.getElementById('file-ok-txt').textContent = '✓ ' + f.name + ' ready';
    document.getElementById('file-ok').style.display = 'flex';
    const r = new FileReader();
    if (f.type === 'text/plain') { r.onload = e => { fileText = e.target.result }; r.readAsText(f) }
    else { r.onload = e => { fileText = '[FILE:' + f.name + ']\n' + e.target.result }; r.readAsDataURL(f) }
}

function setSteps(a) {
    [1, 2, 3].forEach(n => {
        const el = document.getElementById('sb' + n);
        el.classList.remove('active', 'done');
        if (n < a) el.classList.add('done'); else if (n === a) el.classList.add('active');
        if (n < 3) document.getElementById('sc' + n).classList.toggle('done', n < a);
    });
}

function animSteps() { let i = 1; return setInterval(() => { if (i <= 4) { document.getElementById('ls' + i).classList.add('done'); i++ } }, 900) }
async function runAnalysis() {
    const jd = document.getElementById('job-desc').value.trim();
    const resume = activeTab === 'paste' ? document.getElementById('resume-text').value.trim() : fileText;
    if (!resume) { alert('Please upload a resume or paste your resume text first.'); return }
    const btn = document.getElementById('check-btn');
    btn.disabled = true;
    btn.innerHTML = '<svg class="spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Scanning...';
    setSteps(2);
    document.getElementById('input-area').style.display = 'none';
    const rw = document.getElementById('results-wrap');
    rw.classList.add('show');
    document.getElementById('loader').style.display = 'block';
    document.getElementById('results-content').innerHTML = '';
    document.getElementById('main-tool').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const timer = animSteps();
    const sys = `You are an expert ATS resume analyzer. Return ONLY raw JSON — no markdown, no explanation. Structure:
{"overallScore":<0-100>,"grade":"Excellent|Good|Fair|Poor","summary":"<2 sentences>","breakdown":{"formatting":{"score":<0-100>,"label":"Formatting & Structure"},"keywords":{"score":<0-100>,"label":"Keyword Optimization"},"readability":{"score":<0-100>,"label":"ATS Readability"},"impact":{"score":<0-100>,"label":"Impact & Metrics"},"completeness":{"score":<0-100>,"label":"Section Completeness"}},"foundKeywords":["..."],"missingKeywords":["..."],"suggestedKeywords":["..."],"suggestions":[{"type":"warn|info|error|ok","title":"...","detail":"..."}]}
foundKeywords:6-10. missingKeywords:4-8. suggestedKeywords:4-6. suggestions:6-8. Be specific.`;
    const usr = `Resume:\n${resume.substring(0, 4000)}\n\n${jd ? 'Job Description:\n' + jd.substring(0, 2000) : 'No job description — general ATS analysis.'}`;
    try {
        const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: sys, messages: [{ role: 'user', content: usr }] }) });
        const data = await res.json();
        clearInterval(timer);
        let raw = data.content.map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
        const r = JSON.parse(raw);
        document.getElementById('loader').style.display = 'none';
        setSteps(3);
        renderResults(r);
    } catch (e) {
        clearInterval(timer);
        document.getElementById('loader').innerHTML = '<p style="color:#DC2626;font-weight:600">Something went wrong — please try again.</p>';
        btn.disabled = false; btn.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" style="width:18px;height:18px"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/></svg> Check My Resume Score';
        console.error(e);
    }
}
function sc(s) { if (s >= 75) return '#16A34A'; if (s >= 55) return '#2563EB'; if (s >= 35) return '#D97706'; return '#DC2626' }
function gm(g) { const m = { Excellent: { bg: '#F0FDF4', c: '#166534' }, Good: { bg: '#EFF6FF', c: '#1E40AF' }, Fair: { bg: '#FFFBEB', c: '#92400E' }, Poor: { bg: '#FEF2F2', c: '#991B1B' } }; return m[g] || m.Fair }
function iconH(t) {
    const col = { warn: '#D97706', error: '#DC2626', ok: '#16A34A', info: '#2563EB' };
    const p = { warn: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>', error: '<path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>', ok: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>', info: '<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>' };
    return `<svg fill="none" viewBox="0 0 24 24" stroke="${col[t] || col.info}" stroke-width="2" style="width:14px;height:14px">${p[t] || p.info}</svg>`
}
function renderResults(r) {
    const circ = 2 * Math.PI * 42, off = circ - (r.overallScore / 100) * circ, g = gm(r.grade);
    const bk = Object.values(r.breakdown).map(b => `<div class="bk-card"><div class="bk-top"><span class="bk-name">${b.label}</span><span class="bk-val" style="color:${sc(b.score)}">${b.score}</span></div><div class="bk-bar-bg"><div class="bk-bar" style="width:${b.score}%;background:${sc(b.score)}"></div></div></div>`).join('');
    const found = (r.foundKeywords || []).map(k => `<span class="kw-chip found">${k}</span>`).join('');
    const missing = (r.missingKeywords || []).map(k => `<span class="kw-chip missing">${k}</span>`).join('');
    const suggested = (r.suggestedKeywords || []).map(k => `<span class="kw-chip suggested">${k}</span>`).join('');
    const suggs = (r.suggestions || []).map(s => `<div class="sugg-item ${s.type}"><div class="si-icon ${s.type}">${iconH(s.type)}</div><div class="si-body"><strong>${s.title}</strong><span>${s.detail}</span></div></div>`).join('');
    document.getElementById('results-content').innerHTML = `
    <div class="score-panel">
      <div class="score-ring">
        <svg width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="8"/><circle cx="48" cy="48" r="42" fill="none" stroke="white" stroke-width="8" stroke-dasharray="${circ}" stroke-dashoffset="${off}" stroke-linecap="round"/></svg>
        <div class="score-ring-txt"><span class="score-ring-num">${r.overallScore}</span><span class="score-ring-lbl">/ 100</span></div>
      </div>
      <div class="score-meta"><span class="grade-pill" style="background:${g.bg};color:${g.c}">${r.grade}</span><h3>Your ATS Resume Score</h3><p>${r.summary}</p></div>
    </div>
    <div class="sec-head">Score Breakdown</div>
    <div class="bk-grid">${bk}</div>
    <div class="sec-head">Keyword Analysis</div>
    <div class="kw-section">
      <div class="kw-legend"><span class="kw-li"><span class="kw-li-dot" style="background:#16A34A"></span>Found</span><span class="kw-li"><span class="kw-li-dot" style="background:#DC2626"></span>Missing</span><span class="kw-li"><span class="kw-li-dot" style="background:#D97706"></span>Suggested</span></div>
      ${found ? `<div class="kw-group"><div class="kw-group-lbl">Found in your resume</div><div class="kw-chips">${found}</div></div>` : ''}
      ${missing ? `<div class="kw-group"><div class="kw-group-lbl">Missing keywords</div><div class="kw-chips">${missing}</div></div>` : ''}
      ${suggested ? `<div class="kw-group"><div class="kw-group-lbl">Suggested additions</div><div class="kw-chips">${suggested}</div></div>` : ''}
    </div>
    <div class="sec-head">Recommendations</div>
    <div class="sugg-list">${suggs}</div>
    <div class="result-actions"><button class="ra-btn" onclick="resetTool()">← Analyze another</button><button class="ra-btn primary" onclick="window.print()">Download report</button></div>`;
}
function resetTool() {
    document.getElementById('results-wrap').classList.remove('show');
    document.getElementById('results-content').innerHTML = '';
    document.getElementById('loader').style.display = 'block';
    document.getElementById('loader').innerHTML = `<div class="loader-ring"></div><p>Scanning your resume...</p><div class="loader-steps"><div class="lstep" id="ls1"><span class="lstep-dot"></span>Parsing document structure</div><div class="lstep" id="ls2"><span class="lstep-dot"></span>Scoring ATS compatibility</div><div class="lstep" id="ls3"><span class="lstep-dot"></span>Extracting &amp; matching keywords</div><div class="lstep" id="ls4"><span class="lstep-dot"></span>Generating recommendations</div></div>`;
    document.getElementById('input-area').style.display = 'block';
    document.getElementById('file-ok').style.display = 'none';
    document.getElementById('resume-text').value = '';
    document.getElementById('job-desc').value = '';
    fileText = ''; setSteps(1);
    const btn = document.getElementById('check-btn');
    btn.disabled = false; btn.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" style="width:18px;height:18px"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/></svg> Check My Resume Score';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function toggleFaq(btn) {
    const open = btn.classList.contains('open');
    document.querySelectorAll('.faq-q').forEach(q => { q.classList.remove('open'); q.nextElementSibling.classList.remove('open') });
    if (!open) { btn.classList.add('open'); btn.nextElementSibling.classList.add('open') }
}
