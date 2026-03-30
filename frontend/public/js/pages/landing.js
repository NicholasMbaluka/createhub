/* ═══════════════════════════════════════════════
   CreateHub — Landing Page
   ═══════════════════════════════════════════════ */

const LandingPage = {
  render() {
    console.log('🏠 LandingPage.render() called');
    try {
      document.getElementById('app').innerHTML = `
        ${this.navbar()}
        <main>
          ${this.hero()}
          ${this.statsBand()}
          ${this.features()}
          ${this.pricing()}
          ${this.footer()}
        </main>
      `;
      this.bindEvents();
      console.log('✅ LandingPage rendered successfully');
    } catch (error) {
      console.error('❌ LandingPage render failed:', error);
    }
  },

  navbar() {
    return `
    <nav class="landing-nav">
      <div class="nav-logo" id="nav-home">Create<span>Hub</span></div>
      <div class="landing-nav-links">
        <a class="btn btn-ghost" href="#features" onclick="LandingPage.scrollTo('features')">Features</a>
        <a class="btn btn-ghost" href="#pricing"  onclick="LandingPage.scrollTo('pricing')">Pricing</a>
        <button class="btn btn-ghost" onclick="(function(){ console.log('🔐 Sign in clicked'); try { Router.navigate('/login'); console.log('✅ Navigating to /login'); } catch(e) { console.error('❌ Navigation failed:', e); } })()">Sign in</button>
        <button class="btn btn-primary" onclick="(function(){ console.log('🚀 Get started clicked'); try { Router.navigate('/register'); console.log('✅ Navigating to /register'); } catch(e) { console.error('❌ Navigation failed:', e); } })()">Get started free</button>
      </div>
    </nav>`;
  },

  hero() {
    return `
    <section class="hero" id="hero">
      <div class="hero-tag">✦ The Modern Creator Economy Platform</div>
      <h1 class="hero-title">Monetize your content.<br><span class="hl">Own your audience.</span></h1>
      <p class="hero-sub">CreateHub gives creators everything they need — sell digital products, build a stunning link-in-bio, accept payments globally, and grow a sustainable income. No code. No limits.</p>
      <div class="hero-cta">
        <button class="hero-btn primary" onclick="(function(){ console.log('🚀 Start for free clicked'); try { Router.navigate('/register'); console.log('✅ Navigating to /register'); } catch(e) { console.error('❌ Navigation failed:', e); } })()">Start for free →</button>
        <button class="hero-btn secondary" onclick="(function(){ console.log('🔐 View live demo clicked'); try { Router.navigate('/login'); console.log('✅ Navigating to /login'); } catch(e) { console.error('❌ Navigation failed:', e); } })()">View live demo</button>
      </div>
    </section>`;
  },

  statsBand() {
    const stats = [
      ['50K+', 'Active creators'],
      ['$12M+', 'Paid out monthly'],
      ['3M+', 'End customers'],
      ['99.9%', 'Uptime SLA'],
    ];
    return `
    <div class="stats-band">
      ${stats.map(([n, l]) => `
        <div style="text-align:center">
          <div class="stat-band-num">${n}</div>
          <div class="stat-band-lbl">${l}</div>
        </div>
      `).join('')}
    </div>`;
  },

  features() {
    const list = [
      { icon: '🛒', name: 'Digital Products', desc: 'Sell courses, templates, eBooks, presets, and file bundles with instant automated delivery worldwide.' },
      { icon: '🔗', name: 'Link-in-Bio Pages', desc: 'Build a branded landing page. Add all your links, products, and social profiles in one beautiful place.' },
      { icon: '📊', name: 'Real-Time Analytics', desc: 'Track revenue, page views, conversion rates, subscriber growth, and traffic sources in real time.' },
      { icon: '🔐', name: 'KYC Verification', desc: 'Identity-verified creators unlock full monetization, higher payout limits, and a verified badge.' },
      { icon: '💳', name: 'Global Payments', desc: 'Accept payments worldwide via Stripe with instant processing, auto currency conversion, and low fees.' },
      { icon: '🛡️', name: 'Admin & Compliance', desc: 'Robust admin panel for platform oversight, user management, KYC review, and compliance tools.' },
    ];
    return `
    <div class="section-block" id="features">
      <div class="section-header">
        <div class="section-eyebrow">Platform Features</div>
        <h2 class="section-title">Everything a creator needs</h2>
        <p class="section-sub">One platform. Zero friction. Complete control.</p>
      </div>
      <div class="features-grid">
        ${list.map(f => `
          <div class="feature-card">
            <div class="feature-icon">${f.icon}</div>
            <div class="feature-name">${f.name}</div>
            <p class="feature-desc">${f.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>`;
  },

  pricing() {
    const plans = [
      {
        name: 'Free', price: '$0', per: '/month', style: 'out',
        feats: [
          { ok: true,  text: '1 product listing' },
          { ok: true,  text: 'Link-in-bio page' },
          { ok: true,  text: 'Basic analytics' },
          { ok: true,  text: '5% transaction fee' },
          { ok: false, text: 'Custom domain' },
          { ok: false, text: 'KYC fast-track' },
        ],
        cta: 'Start free',
      },
      {
        name: 'Creator', price: '$29', per: '/month', style: 'main', featured: true, badge: 'MOST POPULAR',
        feats: [
          { ok: true, text: 'Unlimited products' },
          { ok: true, text: 'Custom domain' },
          { ok: true, text: 'Advanced analytics' },
          { ok: true, text: '2% transaction fee' },
          { ok: true, text: 'KYC fast-track' },
          { ok: true, text: 'Priority support' },
        ],
        cta: 'Get Creator',
      },
      {
        name: 'Pro', price: '$79', per: '/month', style: 'out',
        feats: [
          { ok: true, text: 'Everything in Creator' },
          { ok: true, text: 'Team members (5)' },
          { ok: true, text: 'API access' },
          { ok: true, text: '0% transaction fee' },
          { ok: true, text: 'Dedicated account manager' },
          { ok: true, text: 'SLA guarantee' },
        ],
        cta: 'Get Pro',
      },
    ];
    return `
    <div class="section-block" id="pricing" style="max-width:960px">
      <div class="section-header">
        <div class="section-eyebrow">Pricing</div>
        <h2 class="section-title">Start free. Scale as you grow.</h2>
        <p class="section-sub">No hidden fees. No surprise charges.</p>
      </div>
      <div class="pricing-grid">
        ${plans.map(p => `
          <div class="plan-card ${p.featured ? 'featured' : ''}">
            ${p.badge ? `<div class="plan-pop">${p.badge}</div>` : ''}
            <div class="plan-name">${p.name}</div>
            <div class="plan-price">${p.price}<span class="per">${p.per}</span></div>
            ${p.feats.map(f => `
              <div class="plan-feat">
                <span class="${f.ok ? 'feat-ck' : 'feat-xx'}">${f.ok ? '✓' : '✕'}</span>
                ${f.text}
              </div>
            `).join('')}
            <button class="plan-cta ${p.style}" onclick="Router.navigate('/register')">${p.cta}</button>
          </div>
        `).join('')}
      </div>
    </div>`;
  },

  footer() {
    return `
    <footer class="landing-footer">
      <div style="margin-bottom:0.5rem">
        <span style="font-family:var(--syne);font-weight:800;color:var(--text)">Create<span style="color:var(--accent)">Hub</span></span>
      </div>
      <div>© ${new Date().getFullYear()} CreateHub. Built for creators worldwide.</div>
      <div style="margin-top:0.5rem;display:flex;justify-content:center;gap:1.5rem;font-size:12px">
        <a href="#" style="color:var(--text3)">Terms</a>
        <a href="#" style="color:var(--text3)">Privacy</a>
        <a href="#" style="color:var(--text3)">Support</a>
      </div>
    </footer>`;
  },

  scrollTo(id) {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  },

  bindEvents() {
    on('#nav-home', 'click', () => Router.navigate('/'));
  },
};
