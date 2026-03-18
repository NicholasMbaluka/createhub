/* ═══════════════════════════════════════════════
   CreateHub — Auth State
   ═══════════════════════════════════════════════ */

const Auth = (() => {
  const TOKEN_KEY = 'ch_token';
  const USER_KEY  = 'ch_user';

  let _user  = null;
  let _token = null;

  const init = () => {
    _token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      try { _user = JSON.parse(raw); } catch { _user = null; }
    }
  };

  const setSession = (token, user) => {
    _token = token;
    _user  = user;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  const clearSession = () => {
    _token = null;
    _user  = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const isLoggedIn  = () => !!_token && !!_user;
  const getUser     = () => _user;
  const getToken    = () => _token;
  const isAdmin     = () => _user?.role === 'admin';
  const isCreator   = () => _user?.role === 'creator';
  const isKYCVerified = () => _user?.kyc?.status === 'verified';

  // Refresh user data from API
  const refreshUser = async () => {
    if (!_token) return null;
    try {
      // Check if API is available
      if (!API || !API.auth || !API.auth.me) {
        console.log('⚠️  API not available, skipping user refresh');
        return null;
      }
      const data = await API.auth.me();
      _user = data.user;
      localStorage.setItem(USER_KEY, JSON.stringify(_user));
      return _user;
    } catch {
      clearSession();
      return null;
    }
  };

  init();
  return { setSession, clearSession, isLoggedIn, getUser, getToken, isAdmin, isCreator, isKYCVerified, refreshUser };
})();
