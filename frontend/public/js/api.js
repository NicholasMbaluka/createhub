/* ═══════════════════════════════════════════════
   CreateHub — API Client
   All requests to /api/* with JWT auth headers
   ═══════════════════════════════════════════════ */

const API = (() => {
  // Dynamic API URL - localhost for development, relative for production
  const isLocalDev = window.location.origin === 'http://localhost:3000' || 
                     window.location.origin === 'http://127.0.0.1:3000' ||
                     window.location.origin === 'http://localhost:8081' ||
                     window.location.origin === 'http://127.0.0.1:8081';
  
  const BASE_URL = isLocalDev
    ? 'http://localhost:8081/api'  // Local development
    : '/api';                     // Production - relative path

  const getToken = () => localStorage.getItem('ch_token');

  const headers = (extra = {}) => ({
    'Content-Type': 'application/json',
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    ...extra,
  });

  const request = async (method, path, body = null) => {
    try {
      const opts = { method, headers: headers() };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(`${BASE_URL}${path}`, opts);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API ${method} ${path}:`, err.message);
      throw err;
    }
  };

  const get    = (path)         => request('GET',    path);
  const post   = (path, body)   => request('POST',   path, body);
  const put    = (path, body)   => request('PUT',    path, body);
  const del    = (path)         => request('DELETE', path);

  return {
    // ── Auth ────────────────────────────────────
    auth: {
      register:       (data) => post('/auth/register', data),
      login:          (data) => post('/auth/login', data),
      me:             ()     => get('/auth/me'),
      updatePassword: (data) => put('/auth/password', data),
    },

    // ── Users ───────────────────────────────────
    users: {
      getProfile:    ()      => get('/users/me'),
      updateProfile: (data)  => put('/users/me', data),
      getCreator:    (slug)  => get(`/users/creator/${slug}`),
      updatePayoutSettings: (data) => put('/users/payout-settings', data),
    },

    // ── Products ────────────────────────────────
    products: {
      getMine: (query) => request('GET', '/products', query),
      getPublic: (query) => request('GET', '/products/public', query),
      getBySlug: (slug) => request('GET', `/products/public/${slug}`),
      create: (data) => request('POST', '/products', data),
      update: (id, data) => request('PUT', `/products/${id}`, data),
      delete: (id) => request('DELETE', `/products/${id}`),
      getAnalytics: (id) => request('GET', `/products/${id}/analytics`),
    },

    // ── Orders ──────────────────────────────────
    orders: {
      create:     (data)           => post('/orders', data),
      getMine:    ()               => get('/orders'),
      purchases:  ()               => get('/orders/purchases'),
      sales:      (params = {})    => get('/orders/sales?' + new URLSearchParams(params)),
      refund:     (id, data)       => post(`/orders/${id}/refund`, data),
      adminAll:   (params = {})    => get('/orders/admin?' + new URLSearchParams(params)),
    },

    // ── Analytics ───────────────────────────────
    analytics: {
      getMyStats:  ()            => get('/analytics/my-stats'),
      creator: (params = {}) => get('/analytics/creator?' + new URLSearchParams(params)),
      admin:   ()            => get('/analytics/admin'),
      platform: ()           => get('/analytics/platform'),
    },

    // ── KYC ─────────────────────────────────────
    kyc: {
      status:  ()            => get('/kyc'),
      submit:  (data)        => post('/kyc/submit', data),
      pending: ()            => get('/kyc/admin/pending'),
      approve: (userId)      => put(`/kyc/admin/${userId}/approve`),
      reject:  (userId, data)=> put(`/kyc/admin/${userId}/reject`, data),
    },

    // ── Subscriptions ────────────────────────────
    subscriptions: {
      subscribe:    (data)   => post('/subscriptions', data),
      cancel:       (id)     => put(`/subscriptions/${id}/cancel`),
      mine:         ()       => get('/subscriptions/mine'),
      subscribers:  ()       => get('/subscriptions/subscribers'),
      create:        (data)   => post('/subscriptions/create', data),
      update:        (id, data) => put(`/subscriptions/${id}`, data),
      // Platform subscription plans
      getPlans:     ()       => get('/subscriptions/plans'),
      getStatus:    ()       => get('/subscriptions/status'),
      upgrade:      (data)   => post('/subscriptions/upgrade', data),
      cancelPlan:   ()       => post('/subscriptions/cancel'),
    },

    // ── Notifications ────────────────────────────
    notifications: {
      getMine: () => get('/notifications'),
      markRead: (id) => put(`/notifications/${id}/read`),
      markAllRead: () => put('/notifications/read-all'),
      send: (data) => post('/notifications/send', data),
      remove: (id) => del(`/notifications/${id}`),
    },

    // ── Admin ────────────────────────────────────
    admin: {
      stats:        ()            => get('/admin/stats'),
      users:        (params = {}) => get('/admin/users?' + new URLSearchParams(params)),
      userDetail:   (id)          => get(`/admin/users/${id}`),
      setStatus:    (id, data)    => put(`/admin/users/${id}/status`, data),
      setRole:      (id, data)    => put(`/admin/users/${id}/role`, data),
    },
  };
})();
