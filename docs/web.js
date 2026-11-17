// Versión web: juego publicado (sin modo revisión), instalable y sin conexión. Se carga antes del juego.
window.EE_WEB = 1;
(function () {
  var h = location.hostname;
  var secure = location.protocol === 'https:' || h === 'localhost' || h === '127.0.0.1';
  if (!('serviceWorker' in navigator) || !secure) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (r) { r.update().catch(function () {}); }).catch(function () {});
  });
})();
window.EE_BUILD = '20261117-06ca99';
