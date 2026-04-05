// ── Storage helpers ─────────────────────────────────────────────
function getItems() {
  return JSON.parse(sessionStorage.getItem('rh_items') || '[]');
}
function saveItems(arr) {
  sessionStorage.setItem('rh_items', JSON.stringify(arr));
}
function addItem(item) {
  const arr = getItems();
  item.id     = Date.now();
  item.date   = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  item.status = 'Submitted';
  arr.unshift(item);
  saveItems(arr);
  return item;
}

// ── Stats ────────────────────────────────────────────────────────
function getStats() {
  const items = getItems();
  return {
    total:    items.length,
    found:    items.filter(i => i.type === 'found').length,
    lost:     items.filter(i => i.type === 'lost').length,
    resolved: items.filter(i => i.status === 'Resolved').length,
  };
}

// ── Auth ─────────────────────────────────────────────────────────
function getUser()  { return sessionStorage.getItem('rh_user'); }

function doLogin(email, pw) {
  if (!email || !pw) return false;
  sessionStorage.setItem('rh_user', email);
  return true;
}

function logout() {
  sessionStorage.removeItem('rh_user');
  window.location.href = 'index.html';
}

function requireLogin() {
  if (!getUser()) window.location.href = 'index.html';
}

// ── Navbar user chip ──────────────────────────────────────────────
function renderNav() {
  const el = document.getElementById('navRight');
  if (!el) return;
  const u = getUser();
  if (!u) return;
  const letter = u.charAt(0).toUpperCase();
  el.innerHTML = `
    <div class="nav-user-chip">
      <div class="nav-avatar">${letter}</div>
      <span class="nav-email">${u}</span>
    </div>
    <button class="btn btn-ghost-red btn-sm" onclick="logout()">Logout</button>
  `;
}
document.addEventListener('DOMContentLoaded', renderNav);

// ── Toast ─────────────────────────────────────────────────────────
function toast(msg, dur = 2800) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), dur);
}

// ── Photo preview ─────────────────────────────────────────────────
function previewPhoto(input, targetId) {
  const f = input.files[0];
  const t = document.getElementById(targetId);
  if (!f || !t) return;
  const r = new FileReader();
  r.onload = e => { t.innerHTML = `<img src="${e.target.result}" alt="preview">`; };
  r.readAsDataURL(f);
}

// ── Status flow ───────────────────────────────────────────────────
const STATUS_FLOW = ['Submitted', 'Under Review', 'Matched', 'Resolved'];

function nextStatus(current) {
  const i = STATUS_FLOW.indexOf(current);
  return i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null;
}

function progressHTML(status) {
  const cur = STATUS_FLOW.indexOf(status);
  return STATUS_FLOW.map((s, i) => {
    const cls = i < cur ? 'done' : i === cur ? 'active' : '';
    const arrow = i < STATUS_FLOW.length - 1 ? '<span class="prog-arrow">›</span>' : '';
    return `<span class="prog-step ${cls}">${s}</span>${arrow}`;
  }).join('');
}
