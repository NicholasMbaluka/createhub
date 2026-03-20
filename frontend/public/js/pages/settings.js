/* ═══════════════════════════════════════════════
   CreateHub — Settings Page
   ═══════════════════════════════════════════════ */

const SettingsPage = {
  _toggles: { sales: true, subscriber: true, payout: true, kyc: true, system: false },

  async render() {
    Dashboard.setContent(H.loading());
    const user = Auth.getUser();
    const isAdmin = user.role === 'admin';

    Dashboard.setContent(`
      <div class="page-header">
        <div>
          <div class="page-title">Settings</div>
          <div class="page-subtitle">Manage your account and preferences.</div>
        </div>
      </div>
      <div style="max-width:580px">

        <!-- Account -->
        <div class="card mb-2">
          <div class="card-title">Account details</div>
          <div class="form-row">
            <div class="form-group"><label>First name</label><input id="s-first" value="${user.firstName}"/></div>
            <div class="form-group"><label>Last name</label><input id="s-last"  value="${user.lastName}"/></div>
          </div>
          <div class="form-group"><label>Email address</label><input id="s-email" type="email" value="${user.email}"/></div>
          ${!isAdmin ? `<div class="form-group"><label>Bio</label><textarea id="s-bio" rows="2">${user.bio || ''}</textarea></div>` : ''}
          <button class="btn btn-primary" id="s-save">Save changes</button>
        </div>

        <!-- Password -->
        <div class="card mb-2">
          <div class="card-title">Change password</div>
          <div class="form-group"><label>Current password</label><input id="s-cur-pass" type="password" placeholder="••••••••"/></div>
          <div class="form-row">
            <div class="form-group"><label>New password</label><input id="s-new-pass" type="password" placeholder="••••••••"/></div>
            <div class="form-group"><label>Confirm new</label><input id="s-con-pass" type="password" placeholder="••••••••"/></div>
          </div>
          <button class="btn btn-outline" id="s-pass-save">Update password</button>
        </div>

        ${!isAdmin ? `
        <!-- Payout -->
        <div class="card mb-2">
          <div class="card-title">Payout method</div>
          <div style="display:flex;align-items:center;gap:12px;padding:0.85rem;background:var(--bg3s);border-radius:9px;border:1px solid var(--border2);margin-bottom:0.75rem">
            <span style="font-size:20px">🏦</span>
            <div style="flex:1">
              <div style="font-size:13.5px;font-weight:500">Bank account ending •••• 4821</div>
              <div style="font-size:12px;color:var(--text3)">Verified · Weekly payouts · USD</div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="SettingsPage.openPayoutSettings()">Change</button>
          </div>
          <div style="display:flex;align-items:center;gap:12px;padding:0.85rem;background:var(--bg3s);border-radius:9px;border:1px solid var(--border2)">
            <span style="font-size:20px">💳</span>
            <div style="flex:1">
              <div style="font-size:13.5px;font-weight:500">Stripe Connect</div>
              <div style="font-size:12px;color:var(--text3)">Connected · Processing active</div>
            </div>
            <span class="badge badge-green">Active</span>
          </div>
        </div>
        ` : ''}

        <!-- Notifications -->
        <div class="card">
          <div class="card-title">Notification preferences</div>
          ${Object.entries(this._toggles).map(([key, val]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border)">
              <div>
                <div style="font-size:13.5px;color:var(--text)">${this.notifLabel(key)}</div>
                <div style="font-size:12px;color:var(--text3)">${this.notifDesc(key)}</div>
              </div>
              <div class="toggle ${val ? 'on' : 'off'}" data-toggle="${key}">
                <div class="toggle-knob"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `);

    this.bindEvents();
  },

  notifLabel(key) {
    return { sales: 'New sale', subscriber: 'New subscriber', payout: 'Payout processed', kyc: 'KYC updates', system: 'Platform announcements' }[key] || key;
  },
  notifDesc(key) {
    return { sales: 'Get notified when someone purchases your product', subscriber: 'When someone subscribes to your plan', payout: 'Confirmation when payouts are sent', kyc: 'Updates on verification status', system: 'News and platform updates from CreateHub' }[key] || '';
  },

  bindEvents() {
    on('#s-save', 'click', async () => {
      const btn = $('#s-save');
      btn.disabled = true; btn.textContent = 'Saving…';
      try {
        await API.users.updateProfile({
          firstName: $('#s-first').value.trim(),
          lastName:  $('#s-last').value.trim(),
          bio:       $('#s-bio')?.value.trim(),
        });
        await Auth.refreshUser();
        Toast.success('Profile updated ✓');
      } catch (err) { Toast.error(err.message); }
      finally { btn.disabled = false; btn.textContent = 'Save changes'; }
    });

    on('#s-pass-save', 'click', async () => {
      const cur = $('#s-cur-pass')?.value;
      const nw  = $('#s-new-pass')?.value;
      const cn  = $('#s-con-pass')?.value;
      if (!cur || !nw || !cn) { Toast.error('Fill in all password fields'); return; }
      if (nw !== cn)           { Toast.error('New passwords do not match'); return; }
      if (nw.length < 6)       { Toast.error('Password must be at least 6 characters'); return; }
      try {
        await API.auth.updatePassword({ currentPassword: cur, newPassword: nw });
        Toast.success('Password updated ✓');
        $('#s-cur-pass').value = ''; $('#s-new-pass').value = ''; $('#s-con-pass').value = '';
      } catch (err) { Toast.error(err.message); }
    });

    delegate('#page-area', '[data-toggle]', 'click', (e, el) => {
      const key = el.dataset.toggle;
      this._toggles[key] = !this._toggles[key];
      el.classList.toggle('on',  this._toggles[key]);
      el.classList.toggle('off', !this._toggles[key]);
      Toast.success('Preference saved');
    });
  },

  openPayoutSettings() {
    Modal.open(`
      <div class="modal-title">Payout Settings</div>
      <div style="display:grid;gap:1rem">
        <div>
          <label style="display:block;margin-bottom:0.5rem;font-size:13px;font-weight:500">Bank Account Number</label>
          <input type="text" id="bank-account" placeholder="123456789" style="width:100%;padding:8px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);color:var(--text)">
        </div>
        <div>
          <label style="display:block;margin-bottom:0.5rem;font-size:13px;font-weight:500">Routing Number</label>
          <input type="text" id="routing-number" placeholder="021000021" style="width:100%;padding:8px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);color:var(--text)">
        </div>
        <div>
          <label style="display:block;margin-bottom:0.5rem;font-size:13px;font-weight:500">Account Holder Name</label>
          <input type="text" id="account-holder" placeholder="John Doe" style="width:100%;padding:8px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);color:var(--text)">
        </div>
        <div>
          <label style="display:block;margin-bottom:0.5rem;font-size:13px;font-weight:500">Payout Frequency</label>
          <select id="payout-frequency" style="width:100%;padding:8px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);color:var(--text)">
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="SettingsPage.savePayoutSettings()">Save Settings</button>
      </div>
    `);
  },

  async savePayoutSettings() {
    const bankAccount = $('#bank-account')?.value;
    const routingNumber = $('#routing-number')?.value;
    const accountHolder = $('#account-holder')?.value;
    const frequency = $('#payout-frequency')?.value;

    if (!bankAccount || !routingNumber || !accountHolder) {
      Toast.error('Please fill in all required fields');
      return;
    }

    try {
      await API.users.updatePayoutSettings({
        bankAccount,
        routingNumber,
        accountHolder,
        frequency
      });
      
      Toast.success('Payout settings updated successfully!');
      Modal.close();
      this.render();
    } catch (err) {
      Toast.error(err.message);
    }
  },
};

/* ═══════════════════════════════════════════════
   CreateHub — Notifications Page
   ═══════════════════════════════════════════════ */

const NotificationsPage = {
  async render() {
    Dashboard.setContent(H.loading());
    try {
      const res = await API.notifications.list({ limit: 40 });
      const { notifications, unreadCount } = res;

      Dashboard.setContent(`
        <div class="page-header">
          <div>
            <div class="page-title">Notifications</div>
            <div class="page-subtitle">${unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}</div>
          </div>
          ${unreadCount > 0 ? `<button class="btn btn-outline btn-sm" id="mark-all-read">Mark all read</button>` : ''}
        </div>

        ${notifications.length === 0
          ? H.empty('🔔', 'No notifications', 'You\'re all caught up! Notifications will appear here.')
          : `<div class="card">
              ${notifications.map(n => `
                <div class="notif-row ${n.read ? 'read' : ''}" data-id="${n._id}">
                  <div class="notif-dot" style="background:${this.dotColor(n.type)}"></div>
                  <div style="flex:1">
                    <div class="notif-title">${n.title}</div>
                    ${n.body ? `<div style="font-size:12.5px;color:var(--text2);margin-top:2px">${n.body}</div>` : ''}
                    <div class="notif-time">${Fmt.relativeTime(n.createdAt)}</div>
                  </div>
                  ${!n.read ? '<span class="badge badge-purple">New</span>' : ''}
                  <button class="btn btn-ghost btn-sm" data-del-notif="${n._id}" style="color:var(--text3);padding:4px 6px" title="Delete">✕</button>
                </div>
              `).join('')}
            </div>`
        }
      `);

      on('#mark-all-read', 'click', async () => {
        try {
          await API.notifications.markRead([]);
          Toast.success('All notifications marked as read');
          await this.render();
        } catch (err) { Toast.error(err.message); }
      });

      delegate('#page-area', '[data-del-notif]', 'click', async (e, el) => {
        e.stopPropagation();
        try {
          await API.notifications.remove(el.dataset.delNotif);
          el.closest('.notif-row').remove();
        } catch (err) { Toast.error(err.message); }
      });

    } catch (err) {
      Dashboard.setContent(H.empty('🔔', 'Could not load notifications', err.message,
        `<button class="btn btn-outline mt-2" onclick="NotificationsPage.render()">Retry</button>`));
    }
  },

  dotColor(type) {
    return { sale: 'var(--green)', subscriber: 'var(--green)', payout: 'var(--green)', kyc: 'var(--accent3)', system: 'var(--text3)', refund: 'var(--red)' }[type] || 'var(--text3)';
  },
};

/* ═══════════════════════════════════════════════
   CreateHub — Subscriptions Page
   ═══════════════════════════════════════════════ */

const SubscriptionsPage = {
  async render() {
    Dashboard.setContent(H.loading());
    try {
      const res = await API.subscriptions.subscribers();
      const { subscribers, total, mrr } = res;

      Dashboard.setContent(`
        <div class="page-header">
          <div>
            <div class="page-title">Subscriptions</div>
            <div class="page-subtitle">Manage your recurring subscribers.</div>
          </div>
          <button class="btn btn-primary" onclick="SubscriptionsPage.openPlanBuilder()">+ Create plan</button>
        </div>

        <div class="stats-grid stats-grid-3">
          ${H.statCard('Active Subscribers', total,                 '↑ growing',   'up')}
          ${H.statCard('Monthly MRR',        Fmt.currency(mrr),     '↑ recurring', 'up')}
          ${H.statCard('Churn Rate',         '0%',                  '— no churns', 'up')}
        </div>

        <div class="card" style="padding:0">
          ${total === 0
            ? `<div style="padding:2rem">${H.empty('♻️', 'No subscribers yet', 'Create a subscription plan and start building your recurring revenue.', `<button class="btn btn-primary mt-2">Create plan</button>`)}</div>`
            : `<div class="table-container">
                <table>
                  <thead><tr><th>Subscriber</th><th>Plan</th><th>Since</th><th>Next charge</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    ${subscribers.map(s => `<tr>
                      <td>
                        <div class="user-cell">
                          ${H.avatar(s.subscriber?.firstName + ' ' + s.subscriber?.lastName, avatarColor(s.subscriber?.firstName), 30)}
                          <div>
                            <div class="user-name">${s.subscriber?.firstName} ${s.subscriber?.lastName}</div>
                            <div class="user-email">${s.subscriber?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>${H.badge(s.plan === 'annual' ? 'annual' : 'monthly', 'purple')}</td>
                      <td style="color:var(--text3)">${Fmt.date(s.currentPeriodStart)}</td>
                      <td style="color:var(--text3)">${Fmt.date(s.currentPeriodEnd)}</td>
                      <td style="color:var(--green);font-weight:600">${Fmt.currency(s.pricing?.amount)}</td>
                      <td>${H.badge(s.status)}</td>
                      <td><button class="btn btn-outline btn-sm" onclick="SubscriptionsPage.manageSubscription('${s._id}')">Manage</button></td>
                    </tr>`).join('')}
                  </tbody>
                </table>
              </div>`
          }
        </div>
      `);
    } catch (err) {
      Dashboard.setContent(H.empty('♻️', 'Could not load subscriptions', err.message,
        `<button class="btn btn-outline mt-2" onclick="SubscriptionsPage.render()">Retry</button>`));
    }
  },

  openPlanBuilder() {
    Modal.open(`
      <div class="modal-title">Create Subscription Plan</div>
      <div style="display:grid;gap:1rem">
        <div>
          <label style="display:block;margin-bottom:0.5rem;font-size:13px;font-weight:500">Plan Name</label>
          <input type="text" id="plan-name" placeholder="e.g., Premium Membership" style="width:100%;padding:8px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);color:var(--text)">
        </div>
        <div>
          <label style="display:block;margin-bottom:0.5rem;font-size:13px;font-weight:500">Price (USD)</label>
          <input type="number" id="plan-price" placeholder="29.99" style="width:100%;padding:8px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);color:var(--text)">
        </div>
        <div>
          <label style="display:block;margin-bottom:0.5rem;font-size:13px;font-weight:500">Billing Cycle</label>
          <select id="plan-cycle" style="width:100%;padding:8px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);color:var(--text)">
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </div>
        <div>
          <label style="display:block;margin-bottom:0.5rem;font-size:13px;font-weight:500">Features (one per line)</label>
          <textarea id="plan-features" rows="4" placeholder="Premium content&#10;Exclusive community&#10;Early access" style="width:100%;padding:8px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);color:var(--text);resize:vertical"></textarea>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="SubscriptionsPage.createPlan()">Create Plan</button>
      </div>
    `);
  },

  async createPlan() {
    const name = $('#plan-name')?.value;
    const price = $('#plan-price')?.value;
    const cycle = $('#plan-cycle')?.value;
    const features = $('#plan-features')?.value.split('\n').filter(f => f.trim());

    if (!name || !price) {
      Toast.error('Please fill in all required fields');
      return;
    }

    try {
      await API.subscriptions.create({
        name,
        price: parseFloat(price),
        billingCycle: cycle,
        features
      });
      
      Toast.success('Subscription plan created successfully!');
      Modal.close();
      this.render();
    } catch (err) {
      Toast.error(err.message);
    }
  },

  manageSubscription(subId) {
    Modal.open(`
      <div class="modal-title">Manage Subscription</div>
      <div style="display:grid;gap:1rem">
        <div style="display:flex;gap:1rem">
          <button class="btn btn-outline" onclick="SubscriptionsPage.pauseSubscription('${subId}')">Pause</button>
          <button class="btn btn-outline" onclick="SubscriptionsPage.cancelSubscription('${subId}')">Cancel</button>
        </div>
        <div>
          <label style="display:block;margin-bottom:0.5rem;font-size:13px;font-weight:500">Send message to subscriber</label>
          <textarea id="sub-message" rows="3" placeholder="Type your message..." style="width:100%;padding:8px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);color:var(--text);resize:vertical"></textarea>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="Modal.close()">Close</button>
        <button class="btn btn-primary" onclick="SubscriptionsPage.sendMessage('${subId}')">Send Message</button>
      </div>
    `);
  },

  async pauseSubscription(subId) {
    try {
      await API.subscriptions.update(subId, { status: 'paused' });
      Toast.success('Subscription paused');
      Modal.close();
      this.render();
    } catch (err) {
      Toast.error(err.message);
    }
  },

  async cancelSubscription(subId) {
    Modal.confirm('Are you sure you want to cancel this subscription?', async () => {
      try {
        await API.subscriptions.update(subId, { status: 'cancelled' });
        Toast.success('Subscription cancelled');
        Modal.close();
        this.render();
      } catch (err) {
        Toast.error(err.message);
      }
    });
  },

  async sendMessage(subId) {
    const message = $('#sub-message')?.value;
    if (!message) {
      Toast.error('Please enter a message');
      return;
    }

    try {
      await API.notifications.send({
        subscriptionId: subId,
        message,
        type: 'custom'
      });
      Toast.success('Message sent to subscriber');
      Modal.close();
    } catch (err) {
      Toast.error(err.message);
    }
  },
};
