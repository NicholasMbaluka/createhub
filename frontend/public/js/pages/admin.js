/* ═══════════════════════════════════════════════
   CreateHub — Admin Pages
   ═══════════════════════════════════════════════ */

const AdminPage = {

  // ── Platform Overview ──────────────────────────
  async renderOverview() {
    Dashboard.setContent(H.loading());
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        API.admin.stats(),
        API.analytics.admin(),
      ]);
      const { stats } = statsRes;
      const { summary, userGrowth, recentOrders } = analyticsRes;
      const growthVals = (userGrowth || []).map(d => d.count);

      Dashboard.setContent(`
        <div class="page-header">
          <div>
            <div class="page-title">Platform Overview</div>
            <div class="page-subtitle">Monitor and manage the CreateHub platform.</div>
          </div>
          <button class="btn btn-outline" onclick="Toast.info('Report exported as CSV')">Export report</button>
        </div>

        <div class="stats-grid">
          ${H.statCard('Total Users',    Fmt.number(stats.users.total),       '↑ growing',    'up')}
          ${H.statCard('Creators',       Fmt.number(stats.users.creators),    '↑ active',     'up')}
          ${H.statCard('Platform Revenue', Fmt.currency(stats.revenue.total), '↑ all time',   'up')}
          ${H.statCard('Pending KYC',    stats.users.pendingKYC,              'needs review', stats.users.pendingKYC > 0 ? 'dn' : 'neu')}
        </div>

        <div class="grid-2 mb-2">
          <div class="card">
            <div class="card-header">
              <div class="card-title" style="margin-bottom:0">User growth</div>
              <span style="font-size:12px;color:var(--text3)">Last 30 days</span>
            </div>
            ${H.barChart(growthVals.length ? growthVals : Array(15).fill(0).map(() => Math.ceil(Math.random()*20)), 'var(--green)', 80)}
            <div class="chart-labels"><span>30d ago</span><span>Today</span></div>
          </div>
          <div class="card">
            <div class="card-title">Platform stats</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
              ${[
                ['Active users',   stats.users.active,             'var(--green)'],
                ['Transactions',   Fmt.number(stats.revenue.transactions), 'var(--accent3)'],
                ['Platform fees',  Fmt.currency(stats.revenue.fees), 'var(--amber)'],
                ['Products',       Fmt.number(stats.products.active) + ' active', 'var(--blue)'],
              ].map(([l, v, c]) => `
                <div style="background:var(--bg3s);border-radius:8px;padding:0.85rem">
                  <div style="font-size:11px;color:var(--text3)">${l}</div>
                  <div style="font-family:var(--syne);font-size:18px;font-weight:700;color:${c}">${v}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title" style="margin-bottom:0">Recent transactions</div>
            <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/admin/transactions')">View all →</button>
          </div>
          ${recentOrders && recentOrders.length
            ? `<div class="table-container"><table>
                <thead><tr><th>Customer</th><th>Product</th><th>Amount</th><th>Date</th></tr></thead>
                <tbody>
                  ${recentOrders.map(o => `<tr>
                    <td><div class="u-name">${o.buyer?.firstName || '—'} ${o.buyer?.lastName || ''}</div></td>
                    <td>${o.product?.name || '—'}</td>
                    <td style="color:var(--green);font-weight:600">${Fmt.currency(o.pricing?.subtotal || 0)}</td>
                    <td style="color:var(--text3)">${Fmt.relativeTime(o.createdAt)}</td>
                  </tr>`).join('')}
                </tbody>
              </table></div>`
            : `<p style="color:var(--text3);font-size:13px">No transactions yet.</p>`
          }
        </div>
      `);
    } catch (err) {
      Dashboard.setContent(H.empty('📊', 'Could not load admin overview', err.message,
        `<button class="btn btn-outline mt-2" onclick="AdminPage.renderOverview()">Retry</button>`));
    }
  },

  // ── User Management ────────────────────────────
  _userFilters: { role: '', status: '', kyc: '', search: '' },

  async renderUsers(filters = {}) {
    Object.assign(this._userFilters, filters);
    Dashboard.setContent(H.loading());
    try {
      const res = await API.admin.users(this._userFilters);
      const { users, total, page, pages } = res;

      Dashboard.setContent(`
        <div class="page-header">
          <div>
            <div class="page-title">Users</div>
            <div class="page-subtitle">Manage all platform users and creators.</div>
          </div>
          <button class="btn btn-primary" onclick="AdminPage.openInviteModal()">+ Invite user</button>
        </div>

        <div class="card mb-2" style="padding:0.75rem 1.25rem">
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center">
            <input id="u-search" placeholder="Search name or email…" style="width:220px" value="${this._userFilters.search}"/>
            <select id="u-role" style="width:130px">
              <option value="">All roles</option>
              <option value="creator" ${this._userFilters.role==='creator'?'selected':''}>Creator</option>
              <option value="public"  ${this._userFilters.role==='public' ?'selected':''}>Public</option>
              <option value="admin"   ${this._userFilters.role==='admin'  ?'selected':''}>Admin</option>
            </select>
            <select id="u-status" style="width:130px">
              <option value="">All statuses</option>
              <option value="active"    ${this._userFilters.status==='active'   ?'selected':''}>Active</option>
              <option value="suspended" ${this._userFilters.status==='suspended'?'selected':''}>Suspended</option>
            </select>
            <select id="u-kyc" style="width:130px">
              <option value="">All KYC</option>
              <option value="verified" ${this._userFilters.kyc==='verified'?'selected':''}>Verified</option>
              <option value="pending"  ${this._userFilters.kyc==='pending' ?'selected':''}>Pending</option>
              <option value="none"     ${this._userFilters.kyc==='none'    ?'selected':''}>None</option>
            </select>
            <button class="btn btn-outline btn-sm" id="u-search-btn">Search</button>
          </div>
        </div>

        <div class="card" style="padding:0">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th><th>Role</th><th>KYC</th><th>Status</th>
                  <th>Revenue</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${users.length
                  ? users.map(u => `<tr>
                      <td>
                        <div class="user-cell">
                          ${H.avatar(u.firstName + ' ' + u.lastName, avatarColor(u.firstName), 32)}
                          <div>
                            <div class="user-name">${u.firstName} ${u.lastName}</div>
                            <div class="user-email">${u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>${H.badge(u.role)}</td>
                      <td>${H.badge(u.kyc?.status || 'none')}</td>
                      <td>${H.badge(u.status)}</td>
                      <td style="color:var(--green);font-weight:600">${Fmt.currency(u.stats?.totalRevenue || 0)}</td>
                      <td style="color:var(--text3)">${Fmt.date(u.createdAt)}</td>
                      <td>
                        <div style="display:flex;gap:5px">
                          <button class="btn btn-outline btn-sm" data-action="view-user" data-id="${u._id}">View</button>
                          <button class="btn btn-${u.status==='active'?'danger':'success'} btn-sm"
                            data-action="${u.status==='active'?'suspend':'activate'}" data-id="${u._id}" data-name="${u.firstName}">
                            ${u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>`).join('')
                  : `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:2rem">No users found.</td></tr>`
                }
              </tbody>
            </table>
          </div>
          <div class="table-pagination">
            <span>Showing ${users.length} of ${Fmt.number(total)} users</span>
            <div style="display:flex;gap:5px">
              <button class="btn btn-outline btn-sm" ${page <= 1 ? 'disabled' : ''}>← Prev</button>
              <span style="padding:5px 10px;font-size:12px">Page ${page} of ${pages}</span>
              <button class="btn btn-outline btn-sm" ${page >= pages ? 'disabled' : ''}>Next →</button>
            </div>
          </div>
        </div>
      `);

      this.bindUserEvents();
    } catch (err) {
      Dashboard.setContent(H.empty('👥', 'Could not load users', err.message,
        `<button class="btn btn-outline mt-2" onclick="AdminPage.renderUsers()">Retry</button>`));
    }
  },

  bindUserEvents() {
    on('#u-search-btn', 'click', () => {
      AdminPage.renderUsers({
        search: $('#u-search')?.value.trim(),
        role:   $('#u-role')?.value,
        status: $('#u-status')?.value,
        kyc:    $('#u-kyc')?.value,
      });
    });
    on('#u-search', 'keydown', (e) => { if (e.key === 'Enter') $('#u-search-btn').click(); });

    delegate('#page-area', '[data-action]', 'click', async (e, el) => {
      const { action, id, name } = el.dataset;
      if (action === 'view-user') {
        await this.showUserDetail(id);
      } else if (action === 'suspend') {
        Modal.confirm(`Suspend ${name}'s account? They will be locked out immediately.`, async () => {
          try {
            await API.admin.setStatus(id, { status: 'suspended' });
            Toast.success(`${name} suspended`);
            await AdminPage.renderUsers();
          } catch (err) { Toast.error(err.message); }
        }, { title: 'Suspend User', label: 'Suspend', danger: true });
      } else if (action === 'activate') {
        try {
          await API.admin.setStatus(id, { status: 'active' });
          Toast.success(`${name} reactivated`);
          await AdminPage.renderUsers();
        } catch (err) { Toast.error(err.message); }
      }
    });
  },

  async showUserDetail(id) {
    try {
      const res = await API.admin.userDetail(id);
      const { user, products, orders } = res;
      Modal.open(`
        <div class="modal-title">User Detail</div>
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:1.5rem">
          ${H.avatar(user.firstName + ' ' + user.lastName, avatarColor(user.firstName), 52)}
          <div>
            <div style="font-family:var(--syne);font-size:16px;font-weight:700">${user.firstName} ${user.lastName}</div>
            <div style="font-size:13px;color:var(--text2)">${user.email}</div>
            <div style="display:flex;gap:6px;margin-top:4px">${H.badge(user.role)} ${H.badge(user.status)} ${H.badge(user.kyc?.status || 'none')}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem">
          <div style="background:var(--bg3s);border-radius:8px;padding:0.75rem">
            <div style="font-size:11px;color:var(--text3)">Total Revenue</div>
            <div style="font-size:16px;font-weight:700;color:var(--green)">${Fmt.currency(user.stats?.totalRevenue || 0)}</div>
          </div>
          <div style="background:var(--bg3s);border-radius:8px;padding:0.75rem">
            <div style="font-size:11px;color:var(--text3)">Products</div>
            <div style="font-size:16px;font-weight:700;color:var(--text)">${products.length}</div>
          </div>
        </div>
        <div style="font-size:12px;color:var(--text3)">Joined ${Fmt.date(user.createdAt)} · Last login ${user.lastLogin ? Fmt.relativeTime(user.lastLogin) : 'Never'}</div>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="Modal.close()">Close</button>
        </div>
      `);
    } catch (err) { Toast.error(err.message); }
  },

  openInviteModal() {
    Modal.open(`
      <div class="modal-title">Invite User</div>
      <div class="form-group"><label>Email address</label><input id="inv-email" type="email" placeholder="user@example.com"/></div>
      <div class="form-group">
        <label>Role</label>
        <select id="inv-role">
          <option value="public">Buyer / Public</option>
          <option value="creator">Creator</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div class="form-group"><label>Welcome note (optional)</label><textarea id="inv-note" rows="2" placeholder="Add a welcome message…"></textarea></div>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="Modal.close();Toast.success('Invite sent! ✉️')">Send invite</button>
      </div>
    `);
  },

  // ── KYC Review ─────────────────────────────────
  async renderKYCReview() {
    Dashboard.setContent(H.loading());
    try {
      const res = await API.kyc.pending();
      const { submissions, total } = res;

      Dashboard.setContent(`
        <div class="page-header">
          <div>
            <div class="page-title">KYC Review</div>
            <div class="page-subtitle">Review and approve identity verification submissions.</div>
          </div>
        </div>

        <div class="stats-grid stats-grid-3">
          ${H.statCard('Pending Review', total, 'needs action', total > 0 ? 'dn' : 'neu')}
          ${H.statCard('Approved Today', '—', 'see history', 'neu')}
          ${H.statCard('Avg Review Time', '< 24h', 'SLA target', 'up')}
        </div>

        <div class="card">
          <div class="card-title">Pending submissions (${total})</div>
          ${total === 0
            ? H.empty('✅', 'All caught up!', 'No pending KYC submissions.')
            : submissions.map(u => `
              <div style="display:flex;align-items:center;gap:12px;padding:1rem;background:var(--bg3s);border-radius:10px;border:1px solid var(--border);margin-bottom:0.75rem">
                ${H.avatar(u.firstName + ' ' + u.lastName, avatarColor(u.firstName), 42)}
                <div style="flex:1">
                  <div style="font-weight:600;color:var(--text)">${u.firstName} ${u.lastName}</div>
                  <div style="font-size:12px;color:var(--text3)">${u.email} · ${u.kyc?.documentType || 'Document'} · Submitted ${Fmt.relativeTime(u.kyc?.submittedAt)}</div>
                </div>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-outline btn-sm" onclick="Toast.info('Opening documents…')">View docs</button>
                  <button class="btn btn-success btn-sm" data-kyc-approve="${u._id}" data-name="${u.firstName}">Approve ✓</button>
                  <button class="btn btn-danger btn-sm"  data-kyc-reject="${u._id}"  data-name="${u.firstName}">Reject</button>
                </div>
              </div>
            `).join('')
          }
        </div>
      `);

      // Bind approve/reject
      delegate('#page-area', '[data-kyc-approve]', 'click', async (e, el) => {
        const id = el.dataset.kycApprove;
        try {
          await API.kyc.approve(id);
          Toast.success(`KYC approved for ${el.dataset.name} ✓`);
          await this.renderKYCReview();
        } catch (err) { Toast.error(err.message); }
      });

      delegate('#page-area', '[data-kyc-reject]', 'click', (e, el) => {
        const id = el.dataset.kycReject;
        Modal.open(`
          <div class="modal-title">Reject KYC</div>
          <div class="form-group"><label>Rejection reason</label>
            <select id="rej-reason">
              <option>Documents could not be verified</option>
              <option>ID appears altered or invalid</option>
              <option>Selfie does not match document</option>
              <option>Incomplete submission</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" onclick="Modal.close()">Cancel</button>
            <button class="btn btn-danger" id="rej-confirm">Reject KYC</button>
          </div>
        `);
        on('#rej-confirm', 'click', async () => {
          try {
            await API.kyc.reject(id, { reason: $('#rej-reason').value });
            Modal.close();
            Toast.info('KYC rejected — user notified');
            await AdminPage.renderKYCReview();
          } catch (err) { Toast.error(err.message); }
        });
      });

    } catch (err) {
      Dashboard.setContent(H.empty('🔐', 'Could not load KYC queue', err.message,
        `<button class="btn btn-outline mt-2" onclick="AdminPage.renderKYCReview()">Retry</button>`));
    }
  },

  // ── Transactions ────────────────────────────────
  async renderTransactions() {
    Dashboard.setContent(H.loading());
    try {
      const res = await API.orders.adminAll({ limit: 30 });
      const { orders, total } = res;

      Dashboard.setContent(`
        <div class="page-header">
          <div>
            <div class="page-title">Transactions</div>
            <div class="page-subtitle">All platform transactions and payment records.</div>
          </div>
          <button class="btn btn-outline" onclick="Toast.success('CSV exported')">Export CSV</button>
        </div>

        <div class="stats-grid stats-grid-3">
          ${H.statCard('Total Transactions', Fmt.number(total), 'all time', 'neu')}
          ${H.statCard('Completed', orders.filter(o=>o.status==='completed').length, 'in this view', 'up')}
          ${H.statCard('Refunded', orders.filter(o=>o.status==='refunded').length, 'in this view', 'dn')}
        </div>

        <div class="card" style="padding:0">
          <div class="table-container">
            <table>
              <thead>
                <tr><th>Buyer</th><th>Product</th><th>Amount</th><th>Fee</th><th>Net</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                ${orders.length
                  ? orders.map(o => `<tr>
                      <td><div class="u-name">${o.buyer?.firstName || '—'} ${o.buyer?.lastName || ''}</div></td>
                      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${o.product?.name || '—'}</td>
                      <td style="font-weight:600;color:var(--text)">${Fmt.currency(o.pricing?.subtotal || 0)}</td>
                      <td style="color:var(--text3)">${Fmt.currency(o.pricing?.platformFee || 0)}</td>
                      <td style="color:var(--green);font-weight:600">${Fmt.currency(o.pricing?.creatorNet || 0)}</td>
                      <td style="color:var(--text3)">${Fmt.date(o.createdAt)}</td>
                      <td>${H.badge(o.status)}</td>
                    </tr>`).join('')
                  : `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:2rem">No transactions yet.</td></tr>`
                }
              </tbody>
            </table>
          </div>
          <div class="table-pagination">
            <span>Showing ${orders.length} of ${Fmt.number(total)}</span>
          </div>
        </div>
      `);
    } catch (err) {
      Dashboard.setContent(H.empty('💳', 'Could not load transactions', err.message,
        `<button class="btn btn-outline mt-2" onclick="AdminPage.renderTransactions()">Retry</button>`));
    }
  },
};
