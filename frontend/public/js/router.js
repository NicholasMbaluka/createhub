/* ═══════════════════════════════════════════════
   CreateHub — Hash Router
   ═══════════════════════════════════════════════ */

const Router = (() => {
  const routes = {};
  let _current = null;

  const register = (path, handler) => { routes[path] = handler; };

  const navigate = (path, replace = false) => {
    console.log('🧭 Router.navigate() called with path:', path);
    try {
      if (replace) {
        history.replaceState(null, '', `#${path}`);
      } else {
        location.hash = path;
      }
      console.log('✅ Router.navigate() succeeded, hash is now:', location.hash);
    } catch (error) {
      console.error('❌ Router.navigate() failed:', error);
    }
  };

  const resolve = () => {
    const hash = location.hash.slice(1) || '/';
    console.log('🔍 Router resolving:', hash);
    // Find exact or prefix match
    let handler = routes[hash];
    if (!handler) {
      // Try prefix match (e.g. /dashboard/products)
      for (const key of Object.keys(routes)) {
        if (hash.startsWith(key + '/') || hash === key) {
          handler = routes[key];
          break;
        }
      }
    }
    if (!handler) handler = routes['/404'] || routes['/'];
    console.log('🎯 Router handler found:', !!handler);
    _current = hash;
    try {
      handler(hash);
      console.log('✅ Route executed successfully');
    } catch (error) {
      console.error('❌ Route execution failed:', error);
    }
  };

  const current = () => _current;

  const start = () => {
    window.addEventListener('hashchange', resolve);
    resolve();
  };

  return { register, navigate, start, current };
})();
