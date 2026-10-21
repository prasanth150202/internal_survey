const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

function requireUrl() {
  if (!API_URL) throw new Error('VITE_APPS_SCRIPT_URL is not set in .env.');
}

async function parse(res) {
  if (!res.ok) throw new Error('Request failed (' + res.status + ').');
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

export async function apiGet(action) {
  requireUrl();
  return parse(await fetch(API_URL + '?action=' + encodeURIComponent(action)));
}

// text/plain keeps this a "simple" request, so the browser skips the CORS preflight Apps Script can't answer.
export async function apiPost(body) {
  requireUrl();
  return parse(await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'text/plain;charset=utf-8'},
    body: JSON.stringify(body)
  }));
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
