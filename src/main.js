import { apiGet, apiPost, esc } from './api.js';

let questions = [];

function render(qs) {
  questions = qs;
  document.getElementById('questions').innerHTML = qs.map(item => `
    <div class="question">
      <div class="qtitle">${item.id}. ${esc(item.q)}</div>
      ${item.a.map((a, i) => `<label class="option"><input type="radio" name="q${item.id}" value="${i}" required><span>${esc(a)}</span></label>`).join('')}
    </div>`).join('');
}

apiGet('questions')
  .then(res => render(res.questions))
  .catch(e => document.getElementById('questions').textContent = e.message || 'Could not load questions.');

document.getElementById('form').addEventListener('submit', async e => {
  e.preventDefault();
  const status = document.getElementById('status');
  const name = document.getElementById('name').value.trim();
  if (!name) { alert('Please enter your name.'); return; }
  const answers = {};
  for (const q of questions) {
    const selected = document.querySelector(`input[name="q${q.id}"]:checked`);
    if (!selected) { document.querySelector(`[name="q${q.id}"]`).focus(); status.textContent = 'Please answer all 15 questions.'; return; }
    answers[String(q.id)] = Number(selected.value);
  }
  const btn = document.getElementById('submit');
  btn.disabled = true; btn.textContent = 'Submitting…';
  try {
    const res = await apiPost({
      action: 'submit',
      payload: {name, team: document.getElementById('team').value, notes: document.getElementById('notes').value, answers}
    });
    status.textContent = res.message;
    document.getElementById('form').reset();
    window.scrollTo({top: 0, behavior: 'smooth'});
  } catch (err) {
    status.textContent = err.message || 'Submission failed. Please try again.';
  } finally {
    btn.disabled = false; btn.textContent = 'Submit responses';
  }
});
