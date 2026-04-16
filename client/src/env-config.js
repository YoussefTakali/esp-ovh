window.__env = Object.assign({}, window.__env, {
  // Default to same-origin API when served behind Nginx.
  apiUrl: window.location.origin
});
