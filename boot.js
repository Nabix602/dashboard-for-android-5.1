// Loads the settings saved in this browser before the other scripts run.
(function () {
  try {
    var c = JSON.parse(window.localStorage.getItem('dashCoords') || 'null');
    if (c && typeof c.lat === 'number' && typeof c.lon === 'number') {
      window.DASH_LAT = c.lat;
      window.DASH_LON = c.lon;
    }
  } catch (e) {
    // Storage unavailable: defaults are used.
  }
  try {
    window.DASH_CFG = JSON.parse(window.localStorage.getItem('dashCfg') || 'null');
  } catch (e) {
    window.DASH_CFG = null;
  }
})();
