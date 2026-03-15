/* ═══════════════════════════════════════════════
   CreateHub — Utility Functions
   ═══════════════════════════════════════════════ */

// ── Toast Notifications ─────────────────────────
const Toast = {
  show(msg, type = 'info', duration = 3500) {
    const area = document.getElementById('toast-area');
    if (!area) return;
    const colors = { success: 'var(--green)', error: 'var(--red)', info: 'var(--accent3)', warning: 'var(--amber)' };
    const icons  = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `
      <span style="color:${colors[type]||colors.info};font-weight:700;font-size:13px;flex-shrink:0">${icons[type]||'•'}</span>
      <span>${msg}</span>
    `;
    area.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'toastOut 0.22s ease forwards';
      setTimeout(() => el.remove(), 230);
    }, duration);
  },
  success: (msg) => Toast.show(msg, 'success'),
  error:   (msg) => Toast.show(msg, 'error'),
  info:    (msg) => Toast.show(msg, 'info'),
  warning: (msg) => Toast.show(msg, 'warning'),
};

// ── Modal ───────────────────────────────────────
const Modal = {
  _el: null,

  open(contentHTML, onClose) {
    Modal.close();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-root';
    overlay.innerHTML = `<div class="modal">${contentHTML}</div>`;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { Modal.close(); if (onClose) onClose(); }
    });
    document.body.appendChild(overlay);
    Modal._el = overlay;
    // Focus first input
    setTimeout(() => { const inp = overlay.querySelector('input'); if (inp) inp.focus(); }, 50);
  },

  close() {
    const el = document.getElementById('modal-root');
    if (el) el.remove();
    Modal._el = null;
  },

  confirm(message, onConfirm, opts = {}) {
    Modal.open(`
      <div class="modal-title">${opts.title || 'Confirm'}</div>
      <p style="color:var(--text2);font-size:14px;margin-bottom:1.5rem">${message}</p>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="Modal.close()">Cancel</button>
        <button class="btn ${opts.danger ? 'btn-danger' : 'btn-primary'}" id="confirm-ok">${opts.label || 'Confirm'}</button>
      </div>
    `);
    document.getElementById('confirm-ok').addEventListener('click', () => {
      Modal.close(); onConfirm();
    });
  },
};

// ── HTML Helpers ────────────────────────────────
const H = {
  avatar(name = '?', color = '#7c6ff7', size = 32) {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return `<div class="avatar" style="background:${color};width:${size}px;height:${size}px;font-size:${Math.round(size * 0.38)}px">${initials}</div>`;
  },

  badge(text, type = 'gray') {
    const map = { active:'green', suspended:'red', draft:'gray', pending:'amber', verified:'green', rejected:'red', none:'gray', creator:'purple', admin:'red', public:'gray', course:'blue', template:'purple', ebook:'blue', file_bundle:'blue', coaching:'amber', subscription:'green' };
    const cls = map[text] || map[type] || 'gray';
    return `<span class="badge badge-${cls}">${text}</span>`;
  },

  loading(msg = 'Loading…') {
    return `<div class="loading-state"><div class="spinner"></div><span>${msg}</span></div>`;
  },

  empty(icon, title, sub, action = '') {
    return `<div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <div class="empty-title">${title}</div>
      <div class="empty-sub">${sub}</div>
      ${action}
    </div>`;
  },

  statCard(label, value, change, dir = 'neu') {
    const arrow = dir === 'up' ? '↑' : dir === 'dn' ? '↓' : '';
    return `<div class="stat-card">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
      <div class="stat-change stat-${dir}">${arrow} ${change}</div>
    </div>`;
  },

  barChart(values, color = 'var(--accent)', height = 80) {
    const max = Math.max(...values, 1);
    const bars = values.map(v => `<div class="bar" style="height:${Math.round((v/max)*100)}%;background:${color}"></div>`).join('');
    return `<div class="bar-chart" style="height:${height}px">${bars}</div>`;
  },

  progress(pct, color = 'var(--accent)') {
    return `<div class="progress"><div class="progress-fill" style="width:${pct}%;background:${color}"></div></div>`;
  },

  alert(type, icon, title, body) {
    return `<div class="alert alert-${type}">
      <div class="alert-icon">${icon}</div>
      <div><div class="alert-title" style="color:var(--${type==='success'?'green':type==='warning'?'amber':type==='danger'?'red':'accent3'})">${title}</div>
      <div class="alert-body">${body}</div></div>
    </div>`;
  },
};

// ── Formatters ──────────────────────────────────
const Fmt = {
  currency: (n, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n),

  number: (n) => new Intl.NumberFormat('en-US').format(n),

  date: (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),

  relativeTime: (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1)   return 'just now';
    if (minutes < 60)  return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)    return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7)      return `${days}d ago`;
    return Fmt.date(d);
  },

  initials: (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
};

// ── DOM Helpers ─────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const on = (el, event, handler, ctx = document) => {
  if (typeof el === 'string') el = $(el, ctx);
  if (el) el.addEventListener(event, handler);
};

// Delegate event from parent
const delegate = (parent, selector, event, handler) => {
  if (typeof parent === 'string') parent = $(parent);
  if (!parent) return;
  parent.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) handler(e, target);
  });
};

// Debounce
const debounce = (fn, ms) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

// Color palette for avatars
const AVATAR_COLORS = ['#7c6ff7','#22d48e','#f04444','#f5a623','#4a9eff','#e056a0','#1db8a0','#9d6aff'];
const avatarColor = (str = '') => AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];
