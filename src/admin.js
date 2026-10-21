import { apiPost, esc } from './api.js';

let data = [];
let questions = [];
const $ = id => document.getElementById(id);

async function loadData() {
  $('error').textContent = 'Loading…';
  try {
    const res = await apiPost({action: 'admin', pin: $('pin').value});
    data = res.rows || [];
    questions = res.questions || [];
    $('total').textContent = res.total || 0;
    ['q1','q2','q3','q4'].forEach(k => $(k).textContent = res.counts[k] || 0);
    $('dashboard').classList.remove('hidden');
    $('error').textContent = '';
    renderRows();
  } catch (err) {
    $('error').textContent = err.message || 'Could not load dashboard.';
  }
}

function qclass(q) { return q.startsWith('Q1') ? 'q1' : q.startsWith('Q2') ? 'q2' : q.startsWith('Q3') ? 'q3' : 'q4'; }

function renderRows() {
  const term = $('search').value.toLowerCase();
  const filt = $('filter').value;
  const rows = data.filter(r => (!filt || r.quadrant === filt) && (`${r.name} ${r.team}`.toLowerCase().includes(term)));
  $('rows').innerHTML = rows.map(r => `<tr>
 <td>${esc(r.timestamp)}</td><td>${esc(r.name)}</td><td>${esc(r.team)}</td>
 ${['attitude','skill','interest','motivation'].map(k => `<td>${Number(r[k]).toFixed(2)} / 3</td>`).join('')}
 <td><span class="pill ${qclass(r.quadrant)}">${esc(r.quadrant)}</span></td>
 <td><button data-row="${r.row}">View</button></td></tr>`).join('');
  $('empty').textContent = rows.length ? 'Showing ' + rows.length + ' response(s).' : 'No matching responses.';
}

// Plain-language reading of each dimension score. Levels: High >= 2.25, Moderate >= 1.5, Low below.
const DIMENSION_TEXT = {
  attitude: {
    label: 'Attitude',
    high: 'Takes ownership, is open to feedback and adapts well when things change.',
    moderate: 'Generally constructive, but may hold back concerns or get defensive in some situations.',
    low: 'May resist feedback or change, or put problems down to others. Worth discussing with real examples.'
  },
  skill: {
    label: 'Skill',
    high: 'Describes a structured, independent approach to problems, estimates and quality.',
    moderate: 'Solid on familiar work; may need support with new or unclear problems.',
    low: 'Relies on others for troubleshooting, learning or quality checks. Compare with actual work; training or mentoring may help.'
  },
  interest: {
    label: 'Interest',
    high: 'Enjoys this kind of work and is curious to go deeper.',
    moderate: 'Engaged with parts of the work; interest varies by task.',
    low: 'Shows limited interest in the current type of work. A different focus may suit them better.'
  },
  motivation: {
    label: 'Motivation',
    high: 'Self-driven: takes initiative, keeps going when it gets hard and sets their own goals.',
    moderate: 'Reliable on assigned work; initiative depends on the situation.',
    low: 'Tends to wait for direction or lose momentum. Explore what is getting in the way.'
  }
};

const QUADRANT_TEXT = {
  q1: 'High motivation and high interest: engaged and self-driven in this work. Offer stretch goals and ownership.',
  q2: 'Motivated, but less interested in this type of work. Explore whether a different focus would fit better.',
  q3: 'Interested in the work, but motivation is low. Look for blockers: unclear priorities, support, recognition or workload.',
  q4: 'Low motivation and low interest. Start with an open conversation about what is not working.'
};

function level(score) { return score >= 2.25 ? 'high' : score >= 1.5 ? 'moderate' : 'low'; }
const LEVEL_LABEL = {high: 'High', moderate: 'Moderate', low: 'Low'};

function showDetail(rowNum) {
  const r = data.find(x => x.row === rowNum); if (!r) return;
  let ans = {}; try { ans = JSON.parse(r.answers || '{}'); } catch (e) {}
  const picked = Object.keys(ans).sort((a, b) => Number(a) - Number(b)).map(k => {
    const q = questions.find(x => x.id === Number(k));
    return {k, q, opt: q && q.a[Number(ans[k])]};
  });
  const dims = Object.keys(DIMENSION_TEXT);
  const strengths = dims.filter(d => level(r[d]) === 'high').map(d => DIMENSION_TEXT[d].label);
  const focus = dims.filter(d => level(r[d]) === 'low').map(d => DIMENSION_TEXT[d].label);
  // Answers that scored 0 make concrete conversation starters.
  const talkingPoints = picked.filter(p => p.opt && p.opt[1] === 0);

  $('detailTitle').textContent = r.name + ' — summary';
  $('detailBody').innerHTML = `<p class="muted">${esc(r.team || 'No team / role given')} · Submitted ${esc(r.timestamp)}</p>
 <div class="summary-box">
   <span class="pill ${qclass(r.quadrant)}">${esc(r.quadrant)}</span>
   <p>${esc(QUADRANT_TEXT[qclass(r.quadrant)])}</p>
   <p><b>Strengths:</b> ${esc(strengths.join(', ') || 'None stand out yet')} &nbsp;·&nbsp; <b>Areas to discuss:</b> ${esc(focus.join(', ') || 'None flagged')}</p>
 </div>
 <div class="dims">${dims.map(d => {
   const lv = level(r[d]);
   return `<div class="dim">
     <div class="dim-head"><b>${DIMENSION_TEXT[d].label}</b><span class="lvl ${lv}">${LEVEL_LABEL[lv]} · ${r[d].toFixed(2)} / 3</span></div>
     <div class="bar"><span class="${lv}" style="width:${Math.max(0, Math.min(100, r[d] / 3 * 100))}%"></span></div>
     <p>${esc(DIMENSION_TEXT[d][lv])}</p>
   </div>`;
 }).join('')}</div>
 ${talkingPoints.length ? `<h3>Talking points</h3><ul>${talkingPoints.map(p => `<li>${esc(p.q.q)}<br><b>${esc(p.opt[0])}</b> <span class="muted">${esc(p.q.d)}</span></li>`).join('')}</ul>` : ''}
 <h3>Their notes</h3><p>${esc(r.notes || 'No notes provided.')}</p>
 <p class="muted">A preliminary indicator from self-reported answers, not a diagnosis. Use it as a conversation starter alongside real work examples.</p>
 <details><summary>Show all ${picked.length} answers</summary><ol>${picked.map(p => p.opt
   ? `<li><span class="muted">${esc(p.q.d)}</span> ${esc(p.q.q)}<br><b>${esc(p.opt[0])}</b> <span class="muted">(${p.opt[1]} / 3)</span></li>`
   : `<li>Question ${esc(p.k)} — option ${Number(ans[p.k]) + 1}</li>`).join('')}</ol></details>`;
  const box = $('detail'); box.classList.remove('hidden'); box.scrollIntoView({behavior: 'smooth'});
}

function downloadCsv() {
  const headers = ['Submitted','Name','Team / role','Attitude score','Skill score','Interest score','Motivation score','Quadrant','Answers JSON','Notes'];
  const lines = [headers, ...data.map(r => [r.timestamp, r.name, r.team, r.attitude, r.skill, r.interest, r.motivation, r.quadrant, r.answers, r.notes])];
  const csv = lines.map(row => row.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'}); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'team-assessment-responses.csv'; a.click(); URL.revokeObjectURL(url);
}

$('login').addEventListener('submit', e => { e.preventDefault(); loadData(); });
$('refresh').addEventListener('click', loadData);
$('export').addEventListener('click', downloadCsv);
$('search').addEventListener('input', renderRows);
$('filter').addEventListener('change', renderRows);
$('rows').addEventListener('click', e => {
  const btn = e.target.closest('button[data-row]');
  if (btn) showDetail(Number(btn.dataset.row));
});
