(function () {
  'use strict';

  // Approximate coordinates for Gazeran (Yvelines, France). Verify if needed.
  var LAT = typeof DASH_LAT === 'number' ? DASH_LAT : 48.76;
  var LON = typeof DASH_LON === 'number' ? DASH_LON : 1.87;
  var URL = 'https://api.open-meteo.com/v1/forecast?latitude=' + LAT +
    '&longitude=' + LON + '&current_weather=true&timezone=Europe%2FParis';
  var REFRESH_MS = 15 * 60 * 1000;

  var lastKey = '';

  function $(id) {
    return document.getElementById(id);
  }

  function describe(code) {
    if (code === 0) {
      return { icon: '☀', text: 'Dégagé', kind: 'clear' };
    }
    if (code === 1 || code === 2) {
      return { icon: '☁', text: 'Peu nuageux', kind: 'cloud' };
    }
    if (code === 3) {
      return { icon: '☁', text: 'Couvert', kind: 'cloud' };
    }
    if (code === 45 || code === 48) {
      return { icon: '≋', text: 'Brouillard', kind: 'fog' };
    }
    if (code >= 51 && code <= 57) {
      return { icon: '☂', text: 'Bruine', kind: 'rain' };
    }
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
      return { icon: '☂', text: 'Pluie', kind: 'rain' };
    }
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
      return { icon: '❄', text: 'Neige', kind: 'snow' };
    }
    if (code >= 95 && code <= 99) {
      return { icon: '⚡', text: 'Orage', kind: 'storm' };
    }
    return { icon: '☁', text: 'Nuageux', kind: 'cloud' };
  }

  function setTint(kind) {
    var el = $('ambient-tint');
    if (el) {
      el.setAttribute('data-wx', kind);
    }
  }

  function render(temp, info) {
    setTint(info.kind);

    var key = temp + '|' + info.text;
    if (key === lastKey) {
      return;
    }
    lastKey = key;
    $('weather-icon').textContent = info.icon;
    $('weather-temp').textContent = temp + '°';
    $('weather-cond').textContent = info.text;
    $('weather').style.display = '';
  }

  function load() {
    var xhr;
    try {
      xhr = new XMLHttpRequest();
    } catch (e) {
      return;
    }
    xhr.open('GET', URL, true);
    xhr.timeout = 10000;
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4 || xhr.status !== 200) {
        return;
      }
      try {
        var data = JSON.parse(xhr.responseText);
        var cw = data && data.current_weather;
        if (!cw || typeof cw.temperature !== 'number' || !isFinite(cw.temperature)) {
          return;
        }
        render(Math.round(cw.temperature), describe(cw.weathercode));
      } catch (e) {}
    };
    try {
      xhr.send(null);
    } catch (e) {}
  }

  function init() {
    load();
    window.setInterval(load, REFRESH_MS);
  }

  window.Weather = { init: init };
})();
