/* ═══════════════════════════════════════════════
   CreateHub — App Bootstrap
   Sets up routes and starts the application
   ═══════════════════════════════════════════════ */

const App = {
  init() {
    console.log('🚀 App.init() called');
    try {
      this.setupRoutes();
      Router.start();
      console.log('✅ App initialized successfully');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
    }
  },

  setupRoutes() {
    // ── Public Routes ────────────────────────────
    Router.register('/', () => {
      if (Auth.isLoggedIn()) {
        const u = Auth.getUser();
        Router.navigate(u.role === 'admin' ? '/admin/overview' : '/dashboard/overview', true);
      } else {
        LandingPage.render();
      }
    });

    Router.register('/login',    () => AuthPage.render('login'));
    Router.register('/register', () => AuthPage.render('register'));
    Router.register('/plans',    () => PlansPage.render());

    // ── Creator Dashboard Routes ─────────────────
    Router.register('/dashboard', (hash) => {
      if (!Auth.isLoggedIn()) { Router.navigate('/login', true); return; }
      const page = hash.replace('/dashboard/', '') || 'overview';
      Dashboard.render(page);
    });

    // ── Admin Routes ─────────────────────────────
    Router.register('/admin', (hash) => {
      if (!Auth.isLoggedIn()) { Router.navigate('/login', true); return; }
      if (!Auth.isAdmin())    { Router.navigate('/dashboard/overview', true); return; }
      const page = hash.replace('/admin/', '') || 'overview';
      Dashboard.render(page);
    });

    // ── 404 ──────────────────────────────────────
    Router.register('/404', () => {
      document.getElementById('app').innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:1rem;text-align:center;padding:2rem">
          <div style="font-size:60px">🔍</div>
          <div style="font-family:var(--syne);font-size:24px;font-weight:800">Page not found</div>
          <p style="color:var(--text2)">The page you're looking for doesn't exist.</p>
          <button class="btn btn-primary" onclick="Router.navigate('/')">Go home</button>
        </div>
      `;
    });
  },
};

// ── Start the app ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
