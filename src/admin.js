import { apiPost, esc } from './api.js';

let data = [];
const $ = id => document.getElementById(id);

async function loadData() {
  $('error').textContent = 'Loading…';
  try {
    const res = await apiPost({action: 'admin', pin: $('pin').value});
    data = res.rows || [];
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
 <td>${Number(r.motivation).toFixed(2)} / 3</td><td>${Number(r.interest).toFixed(2)} / 3</td>
 <td><span class="pill ${qclass(r.quadrant)}">${esc(r.quadrant)}</span></td>
 <td><button data-row="${r.row}">View</button></td></tr>`).join('');
  $('empty').textContent = rows.length ? 'Showing ' + rows.length + ' response(s).' : 'No matching responses.';
}

function showDetail(rowNum) {
  const r = data.find(x => x.row === rowNum); if (!r) return;
  let ans = {}; try { ans = JSON.parse(r.answers || '{}'); } catch (e) {}
  $('detailTitle').textContent = r.name + ' — response details';
  $('detailBody').innerHTML = `<p><b>Team / role:</b> ${esc(r.team || 'Not provided')} &nbsp; <b>Submitted:</b> ${esc(r.timestamp)}</p>
 <p><b>Preliminary quadrant:</b> ${esc(r.quadrant)}. Treat this as a discussion starter, not a permanent label.</p>
 <p><b>Additional notes:</b><br>${esc(r.notes || 'No notes provided')}</p>
 <h3>Selected options</h3><ol>${Object.keys(ans).sort((a, b) => Number(a) - Number(b)).map(k => `<li>Question ${esc(k)} — option ${Number(ans[k]) + 1}</li>`).join('')}</ol>`;
  const box = $('detail'); box.classList.remove('hidden'); box.scrollIntoView({behavior: 'smooth'});
}

function downloadCsv() {
  const headers = ['Submitted','Name','Team / role','Motivation score','Interest score','Quadrant','Answers JSON','Notes'];
  const lines = [headers, ...data.map(r => [r.timestamp, r.name, r.team, r.motivation, r.interest, r.quadrant, r.answers, r.notes])];
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
