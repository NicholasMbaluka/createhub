/* ═══════════════════════════════════════════════
   CreateHub — Dashboard Shell
   Renders topnav + sidebar + content area
   ═══════════════════════════════════════════════ */

const Dashboard = {
  _page: 'overview',
  _unread: 0,

  async render(page = 'overview') {
    this._page = page;
    const user = Auth.getUser();
    if (!user) { Router.navigate('/login'); return; }

    // Fetch unread count silently
    try {
      const n = await API.notifications.list({ limit: 1 });
      this._unread = n.unreadCount || 0;
    } catch { this._unread = 0; }

    document.getElementById('app').innerHTML = `
      ${this.topnav(user)}
      <div class="shell">
        ${this.sidebar(user, page)}
        <div class="main-content" id="main-content">
          <div class="page-wrap" id="page-area">
            ${H.loading('Loading page…')}
          </div>
        </div>
      </div>
    `;

    this.bindShellEvents();
    await this.loadPage(page, user);
  },

  topnav(user) {
    return `
    <nav class="topnav">
      <div class="nav-logo" onclick="Router.navigate('/')">Create<span>Hub</span></div>
      <span class="nav-pill">${user.role === 'admin' ? 'Admin Panel' : 'Creator Studio'}</span>
      <div class="nav-right">
        <button class="nav-icon-btn" id="notif-btn" onclick="Router.navigate('/${user.role === 'admin' ? 'admin' : 'dashboard'}/notifications')">
          🔔 ${this._unread > 0 ? '<span class="nav-badge"></span>' : ''}
        </button>
        <div class="nav-profile" id="nav-profile-btn">
          ${H.avatar(user.firstName + ' ' + user.lastName, avatarColor(user.firstName), 26)}
          <span class="nav-profile-name">${user.firstName}</span>
          <span class="nav-caret">▾</span>
        </div>
      </div>
    </nav>`;
  },

  sidebar(user, page) {
    const isAdmin = user.role === 'admin';
    const base = isAdmin ? '/admin' : '/dashboard';
    const items = isAdmin ? [
      { id: 'overview',      icon: '📊', label: 'Overview' },
      { id: 'users',         icon: '👥', label: 'Users' },
      { id: 'analytics',     icon: '📈', label: 'Analytics' },
      { id: 'kyc-review',    icon: '🔐', label: 'KYC Review', badge: true },
      { id: 'transactions',  icon: '💳', label: 'Transactions' },
      { id: 'notifications', icon: '🔔', label: 'Notifications' },
      { id: 'settings',      icon: '⚙️', label: 'Settings' },
    ] : [
      { id: 'overview',      icon: '🏠', label: 'Overview',        section: 'Creator' },
      { id: 'products',      icon: '📦', label: 'My Products' },
      { id: 'link-bio',      icon: '🔗', label: 'Link in Bio' },
      { id: 'analytics',     icon: '📈', label: 'Analytics' },
      { id: 'subscriptions', icon: '♻️', label: 'Subscriptions' },
      { id: 'kyc',           icon: '🔐', label: 'KYC',             section: 'Account' },
      { id: 'notifications', icon: '🔔', label: 'Notifications',   badge: this._unread > 0 ? this._unread : null },
      { id: 'settings',      icon: '⚙️', label: 'Settings' },
    ];

    let html = `<nav class="sidebar">`;
    if (isAdmin) html += `<div class="sidebar-section">Platform</div>`;

    let lastSection = null;
    items.forEach(item => {
      if (item.section && item.section !== lastSection) {
        html += `<div class="sidebar-section">${item.section}</div>`;
        lastSection = item.section;
      }
      const active = page === item.id;
      html += `
        <div class="sidebar-item ${active ? 'active' : ''}" data-nav="${base}/${item.id}">
          <span class="sidebar-icon">${item.icon}</span>
          ${item.label}
          ${item.badge ? `<span class="sidebar-badge">${typeof item.badge === 'number' ? item.badge : ''}</span>` : ''}
        </div>`;
    });

    html += `
      <div class="sidebar-footer">
        <button class="btn btn-outline w100" style="justify-content:center;font-size:12.5px" id="logout-btn">Sign out</button>
      </div>
    </nav>`;
    return html;
  },

  bindShellEvents() {
    // Sidebar navigation
    delegate('#app', '[data-nav]', 'click', (e, el) => {
      Router.navigate(el.dataset.nav);
    });

    // Logout
    on('#logout-btn', 'click', () => {
      Modal.confirm('Are you sure you want to sign out?', () => {
        Auth.clearSession();
        Toast.info('Signed out successfully');
        Router.navigate('/');
      }, { title: 'Sign out' });
    });

    // Profile dropdown
    on('#nav-profile-btn', 'click', () => this.showProfileDropdown());
  },

  showProfileDropdown() {
    const user = Auth.getUser();
    Modal.open(`
      <div class="modal-title">Your Account</div>
      <div style="text-align:center;margin-bottom:1.5rem">
        ${H.avatar(user.firstName + ' ' + user.lastName, avatarColor(user.firstName), 64)}
        <div style="font-family:var(--syne);font-size:18px;font-weight:700;margin-top:0.75rem">${user.firstName} ${user.lastName}</div>
        <div style="font-size:13px;color:var(--text2);margin-top:2px">${user.email}</div>
        <div style="margin-top:0.5rem">${H.badge(user.role)}</div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="Modal.close();Router.navigate('/${user.role === 'admin' ? 'admin' : 'dashboard'}/settings')">Settings</button>
        <button class="btn btn-danger" onclick="Modal.close();Auth.clearSession();Router.navigate('/')">Sign out</button>
      </div>
    `);
  },

  setContent(html) {
    const area = $('#page-area');
    if (area) area.innerHTML = html;
  },

  async loadPage(page, user) {
    const isAdmin = user.role === 'admin';
    switch (page) {
      case 'overview':      isAdmin ? await AdminPage.renderOverview()   : await CreatorOverviewPage.render(); break;
      case 'products':      await ProductsPage.render();      break;
      case 'link-bio':      await LinkBioPage.render();       break;
      case 'analytics':     await AnalyticsPage.render();     break;
      case 'subscriptions': await SubscriptionsPage.render(); break;
      case 'kyc':           await KYCPage.render();           break;
      case 'users':         await AdminPage.renderUsers();    break;
      case 'kyc-review':    await AdminPage.renderKYCReview(); break;
      case 'transactions':  await AdminPage.renderTransactions(); break;
      case 'notifications': await NotificationsPage.render(); break;
      case 'settings':      await SettingsPage.render();      break;
      default:
        Dashboard.setContent(H.empty('🔍', 'Page not found', 'This page does not exist.'));
    }
  },
};

// ── Creator Overview ────────────────────────────
const CreatorOverviewPage = {
  async render() {
    Dashboard.setContent(H.loading());
    try {
      const [analyticsRes, notifsRes] = await Promise.all([
        API.analytics.creator({ period: '30d' }),
        API.notifications.list({ limit: 5 }),
      ]);
      const { summary, chart, topProducts } = analyticsRes;
      const days = Object.values(chart.revenueByDay || {});
      const chartData = days.length ? days : [0,0,0,0,0,0,0];

      Dashboard.setContent(`
        <div class="page-header">
          <div>
            <div class="page-title">Good morning, ${Auth.getUser().firstName} 👋</div>
            <div class="page-subtitle">Here's your creator account snapshot for the last 30 days.</div>
          </div>
        </div>

        <div class="stats-grid">
          ${H.statCard('Total Revenue',    Fmt.currency(summary.totalRevenue),     '↑ this month', 'up')}
          ${H.statCard('Total Sales',      Fmt.number(summary.totalSales),          '↑ this month', 'up')}
          ${H.statCard('Subscribers',      Fmt.number(summary.activeSubscribers),   '↑ active',     'up')}
          ${H.statCard('Active Products',  summary.activeProducts + ' of ' + summary.totalProducts, '', 'neu')}
        </div>

        <div class="grid-2 mb-2">
          <div class="card">
            <div class="card-title">Revenue — last ${chartData.length} days</div>
            ${H.barChart(chartData, 'var(--accent)', 80)}
            <div class="chart-labels">
              <span>7 days ago</span><span>Today</span>
            </div>
          </div>
          <div class="card">
            <div class="card-title">Top Products</div>
            ${topProducts.length ? topProducts.map(p => `
              <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--border)">
                <div style="flex:1">
                  <div style="font-size:13.5px;color:var(--text);font-weight:500">${p.name}</div>
                  ${H.progress(p.revenue ? Math.round((p.revenue / (topProducts[0].revenue || 1)) * 100) : 0)}
                </div>
                <div style="font-size:13px;font-weight:600;color:var(--green)">${Fmt.currency(p.revenue)}</div>
              </div>
            `).join('') : `<p style="color:var(--text3);font-size:13px">No sales yet. Create and publish your first product!</p>`}
            <button class="btn btn-outline btn-sm mt-2" onclick="Router.navigate('/dashboard/products')">View all products →</button>
          </div>
        </div>

        ${Auth.isKYCVerified()
          ? H.alert('success', '✅', 'Identity Verified — All features unlocked', 'Your account is fully verified. Payouts are enabled.')
          : H.alert('warning', '⚠️', 'KYC verification required', 'Complete identity verification to unlock monetization features. <a href="#" onclick="Router.navigate(\'/dashboard/kyc\')" style="color:var(--amber);text-decoration:underline">Verify now →</a>')
        }

        <div class="card">
          <div class="card-header">
            <div class="card-title" style="margin-bottom:0">Recent Notifications</div>
            <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/dashboard/notifications')">View all</button>
          </div>
          ${notifsRes.notifications.length
            ? notifsRes.notifications.slice(0, 4).map(n => `
              <div class="notif-row ${n.read ? 'read' : ''}">
                <div class="notif-dot" style="background:${n.type==='sale'||n.type==='subscriber'?'var(--green)':n.type==='kyc'?'var(--accent3)':'var(--text3)'}"></div>
                <div style="flex:1">
                  <div class="notif-title">${n.title}</div>
                  <div class="notif-time">${Fmt.relativeTime(n.createdAt)}</div>
                </div>
                ${!n.read ? '<span class="badge badge-purple">New</span>' : ''}
              </div>
            `).join('')
            : `<p style="color:var(--text3);font-size:13px;padding:1rem 0">No notifications yet.</p>`
          }
        </div>
      `);
    } catch (err) {
      Dashboard.setContent(H.empty('📊', 'Could not load dashboard', err.message, `<button class="btn btn-outline mt-2" onclick="CreatorOverviewPage.render()">Retry</button>`));
    }
  },
};
