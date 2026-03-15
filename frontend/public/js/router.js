/* ═══════════════════════════════════════════════
   CreateHub — Hash Router
   ═══════════════════════════════════════════════ */

const Router = (() => {
  const routes = {};
  let _current = null;

  const register = (path, handler) => { routes[path] = handler; };

  const navigate = (path, replace = false) => {
    if (replace) {
      history.replaceState(null, '', `#${path}`);
    } else {
      location.hash = path;
    }
  };

  const resolve = () => {
    const hash = location.hash.slice(1) || '/';
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
    _current = hash;
    handler(hash);
  };

  const current = () => _current;

  const start = () => {
    window.addEventListener('hashchange', resolve);
    resolve();
  };

  return { register, navigate, start, current };
})();
