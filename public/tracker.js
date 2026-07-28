/* TOP SITE — Tracker v1 */
(function () {
  var el = document.currentScript;

  // Support both data-site-id attribute (external sites) and window.__ts_id (our own pages)
  var siteId = (el && el.getAttribute('data-site-id')) || window.__ts_id;
  if (!siteId) return;

  // Derive the API URL from the script src so it works in any environment
  var src = (el && el.src) || '';
  var apiUrl = src.replace(/\/tracker\.js(\?.*)?$/, '/api/track');
  if (!apiUrl || apiUrl === src) {
    apiUrl = window.location.origin + '/api/track';
  }

  // Anonymous per-session ID — no personal data, just a random token in sessionStorage
  var KEY = '_ts_s';
  var sessionId = sessionStorage.getItem(KEY);
  if (!sessionId) {
    sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(KEY, sessionId);
  }

  function track() {
    var ref = document.referrer || '';
    // Strip self-referrals
    try { if (ref && new URL(ref).hostname === location.hostname) ref = ''; } catch (e) {}

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: siteId,
        path: location.pathname,
        referrer: ref || null,
        sessionId: sessionId,
      }),
      keepalive: true,
      mode: 'cors',
    }).catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', track);
  } else {
    track();
  }

  // SPA navigation support
  var _push = history.pushState;
  history.pushState = function () {
    _push.apply(history, arguments);
    setTimeout(track, 100);
  };
  window.addEventListener('popstate', function () { setTimeout(track, 100); });
})();
