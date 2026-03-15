/* ═══════════════════════════════════════════════
   CreateHub — Auth Page (Login / Register)
   ═══════════════════════════════════════════════ */

const AuthPage = {
  _tab:  'login',   // 'login' | 'register'
  _role: 'creator', // 'creator' | 'public'

  render(tab = 'login') {
    this._tab = tab;
    document.getElementById('app').innerHTML = `
      <nav class="landing-nav">
        <div class="nav-logo" onclick="Router.navigate('/')">Create<span>Hub</span></div>
      </nav>
      <div class="auth-wrap">
        <div class="auth-box">
          <div class="auth-logo">Create<span>Hub</span></div>
          <p class="auth-tagline">${tab === 'login' ? 'Welcome back. Sign in to continue.' : 'Join the creator economy today.'}</p>
          ${this.tabs()}
          ${this.form()}
        </div>
      </div>
    `;
    this.bindEvents();
  },

  tabs() {
    return `
    <div class="auth-tabs">
      <div class="auth-tab ${this._tab === 'login'    ? 'active' : ''}" data-tab="login">Sign in</div>
      <div class="auth-tab ${this._tab === 'register' ? 'active' : ''}" data-tab="register">Create account</div>
    </div>`;
  },

  form() {
    const isReg = this._tab === 'register';
    return `
    ${isReg ? `
      <div style="margin-bottom:1.25rem">
        <label style="margin-bottom:8px">I'm joining as</label>
        <div class="role-grid">
          <div class="role-card ${this._role === 'creator' ? 'selected' : ''}" data-role="creator">
            <div class="role-emoji">🎨</div>
            <div class="role-name">Creator</div>
            <div class="role-desc">Sell products & content</div>
          </div>
          <div class="role-card ${this._role === 'public' ? 'selected' : ''}" data-role="public">
            <div class="role-emoji">👤</div>
            <div class="role-name">Buyer</div>
            <div class="role-desc">Discover & purchase</div>
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>First name</label>
          <input id="firstName" placeholder="Amara" autocomplete="given-name"/>
        </div>
        <div class="form-group">
          <label>Last name</label>
          <input id="lastName" placeholder="Osei" autocomplete="family-name"/>
        </div>
      </div>
    ` : ''}

    <div class="form-group">
      <label>Email address</label>
      <input id="email" type="email" placeholder="you@example.com" autocomplete="email"/>
    </div>
    <div class="form-group">
      <label>Password</label>
      <input id="password" type="password" placeholder="••••••••" autocomplete="${isReg ? 'new-password' : 'current-password'}"/>
    </div>

    <button class="btn btn-primary w100" id="auth-submit" style="padding:12px;font-size:15px;justify-content:center">
      ${isReg ? 'Create account →' : 'Sign in →'}
    </button>

    ${!isReg ? `
      <div class="auth-divider">quick demo access</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button class="btn btn-outline w100" style="justify-content:center;font-size:13px" data-demo="creator">🎨 Creator demo</button>
        <button class="btn btn-outline w100" style="justify-content:center;font-size:13px" data-demo="admin">🛡️ Admin demo</button>
      </div>
    ` : ''}

    <div id="auth-error" style="display:none;margin-top:1rem;padding:0.75rem;background:var(--redbg);border:1px solid var(--redbdr);border-radius:8px;color:var(--red);font-size:13px"></div>
    `;
  },

  bindEvents() {
    // Tab switching
    delegate('#app', '.auth-tab', 'click', (e, el) => {
      this._tab = el.dataset.tab;
      this.render(this._tab);
    });

    // Role selection
    delegate('#app', '.role-card', 'click', (e, el) => {
      this._role = el.dataset.role;
      $$('.role-card').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
    });

    // Submit
    on('#auth-submit', 'click', () => this.submit());

    // Enter key
    on('#app', 'keydown', (e) => { if (e.key === 'Enter') this.submit(); });

    // Demo logins
    delegate('#app', '[data-demo]', 'click', (e, el) => {
      this.demoLogin(el.dataset.demo);
    });
  },

  async submit() {
    const btn = $('#auth-submit');
    const errBox = $('#auth-error');
    errBox.style.display = 'none';

    const email    = $('#email')?.value.trim();
    const password = $('#password')?.value.trim();

    if (!email || !password) {
      this.showError('Please fill in all required fields.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Please wait…';

    try {
      let data;
      if (this._tab === 'register') {
        const firstName = $('#firstName')?.value.trim();
        const lastName  = $('#lastName')?.value.trim();
        if (!firstName || !lastName) { this.showError('First and last name are required.'); return; }
        data = await API.auth.register({ firstName, lastName, email, password, role: this._role });
      } else {
        data = await API.auth.login({ email, password });
      }

      Auth.setSession(data.token, data.user);
      Toast.success(`Welcome${this._tab === 'login' ? ' back' : ''}, ${data.user.firstName}! 👋`);
      this.redirect(data.user);

    } catch (err) {
      this.showError(err.message || 'Something went wrong. Please try again.');
    } finally {
      btn.disabled = false;
      btn.textContent = this._tab === 'register' ? 'Create account →' : 'Sign in →';
    }
  },

  async demoLogin(role) {
    const creds = {
      creator: { email: 'amara@example.com',  password: 'creator123' },
      admin:   { email: 'admin@createhub.io', password: 'admin123' },
    };
    const c = creds[role];
    if (!c) return;

    try {
      const data = await API.auth.login(c);
      Auth.setSession(data.token, data.user);
      Toast.success(`Signed in as ${data.user.firstName} (${role}) 👋`);
      this.redirect(data.user);
    } catch (err) {
      Toast.error('Demo login failed — is the backend running? Run: cd backend && npm run dev');
    }
  },

  redirect(user) {
    if (user.role === 'admin') {
      Router.navigate('/admin/overview');
    } else {
      Router.navigate('/dashboard/overview');
    }
  },

  showError(msg) {
    const errBox = $('#auth-error');
    if (errBox) { errBox.textContent = msg; errBox.style.display = 'block'; }
    const btn = $('#auth-submit');
    if (btn) { btn.disabled = false; btn.textContent = this._tab === 'register' ? 'Create account →' : 'Sign in →'; }
  },
};
