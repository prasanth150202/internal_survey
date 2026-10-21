// The Apps Script URL is read from .env (VITE_APPS_SCRIPT_URL=...) when the page loads.
let apiUrl;

async function getUrl() {
  if (apiUrl) return apiUrl;
  const res = await fetch(new URL('../.env', import.meta.url), {cache: 'no-store'});
  if (!res.ok) throw new Error('Could not load .env (' + res.status + ').');
  const match = (await res.text()).match(/^\s*VITE_APPS_SCRIPT_URL\s*=\s*["']?([^"'\s]+)/m);
  if (!match) throw new Error('VITE_APPS_SCRIPT_URL is not set in .env.');
  return apiUrl = match[1];
}

async function parse(res) {
  if (!res.ok) throw new Error('Request failed (' + res.status + ').');
  let data;
  try { data = await res.json(); }
  catch (e) { throw new Error('The Apps Script URL did not return JSON. Deploy the latest Code.gs as a new version.'); }
  if (!data.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

export async function apiGet(action) {
  const url = await getUrl();
  return parse(await fetch(url + '?action=' + encodeURIComponent(action)));
}

// text/plain keeps this a "simple" request, so the browser skips the CORS preflight Apps Script can't answer.
export async function apiPost(body) {
  const url = await getUrl();
  return parse(await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'text/plain;charset=utf-8'},
    body: JSON.stringify(body)
  }));
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
