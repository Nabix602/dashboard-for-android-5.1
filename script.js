(function () {
  'use strict';

  // Fill both values to enable the Spotify card through Last.fm
  // (free Last.fm account, Spotify connected in Last.fm Settings > Applications).
  // Leave empty: the dashboard simply shows quotes.
  var CONFIG = {
    lastfmApiKey: 'ed3fbf6769fe8f50b8b688be7da068b7',
    lastfmUser: 'Nabixxxx'
  };

  var DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  var MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  var DEFAULT_LASTFM_IMAGE_HASH = '2a96cbd8b46e442fc41c2b86b821562f';

  var SAVER_AFTER_MS = 30 * 60 * 1000;
  var SAVER_CHECK_MS = 30 * 1000;
  var DAY_START_SHIFT_MS = 7 * 3600000;
  var DAILY_WINDOW_HOURS = 2;
  var NET_SHOW_MS = 4000;

  function $(id) {
    return document.getElementById(id);
  }

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function show(el, on) {
    if (el) {
      el.style.display = on ? '' : 'none';
    }
  }

  // Text swap with a fade: fade out, replace, fade in.
  function setText(el, text) {
    if (!el || el.getAttribute('data-t') === text) {
      return;
    }
    el.setAttribute('data-t', text);
    el.style.opacity = '0';
    window.setTimeout(function () {
      el.textContent = text;
      el.style.opacity = '1';
    }, 400);
  }

  // Card fade in / out. Hidden elements are removed from layout after the fade.
  function fadeEl(el, on) {
    if (!el) {
      return;
    }
    var want = on ? '1' : '0';
    if (el.getAttribute('data-on') === want) {
      return;
    }
    el.setAttribute('data-on', want);
    if (el._fadeT) {
      window.clearTimeout(el._fadeT);
      el._fadeT = null;
    }
    if (on) {
      el.style.opacity = '0';
      el.style.display = '';
      void el.offsetHeight;
      el._fadeT = window.setTimeout(function () {
        el.style.opacity = '1';
        el._fadeT = null;
      }, 30);
    } else {
      el.style.opacity = '0';
      el._fadeT = window.setTimeout(function () {
        el.style.display = 'none';
        el._fadeT = null;
      }, 850);
    }
  }

  // Album art: the new picture fades in over the old one, no dip to black.
  // Missing or failing artwork shows the elegant placeholder.
  var artUrl = null;
  var artReady = false;
  var artToken = 0;

  function paintLayer(el, url) {
    el.className = 'sp-layer' + (url ? '' : ' empty');
    el.style.backgroundImage = url ? 'url("' + url + '")' : 'none';
  }

  function setArt(url) {
    var a = $('sp-a');
    var b = $('sp-b');
    if (!a || !b || url === artUrl) {
      return;
    }
    artUrl = url;
    var token = ++artToken;

    var reveal = function (ok) {
      if (token !== artToken) {
        return;
      }
      var u = ok ? url : '';
      if (!artReady) {
        artReady = true;
        paintLayer(a, u);
        return;
      }
      paintLayer(b, u);
      b.style.opacity = '1';
      window.setTimeout(function () {
        if (token !== artToken) {
          return;
        }
        paintLayer(a, u);
        b.style.transition = 'none';
        b.style.opacity = '0';
        void b.offsetWidth;
        b.style.transition = '';
      }, 950);
    };

    if (!url) {
      reveal(false);
      return;
    }
    var img = new Image();
    img.onload = function () { reveal(true); };
    img.onerror = function () { reveal(false); };
    img.src = url;
  }


  /* ---------- Body classes ---------- */

  var nightOn = false;
  var saverOn = false;
  var playingOn = false;

  function applyBodyClass() {
    var parts = [];
    if (nightOn) {
      parts.push('night');
    }
    if (saverOn) {
      parts.push('saver');
    }
    if (playingOn && !nightOn) {
      parts.push('playing');
    }
    document.body.className = parts.join(' ');
  }

  /* ---------- Clock and night mode ---------- */

  var lastMinute = -1;

  function updateNight(minutes) {
    var on = minutes >= 21 * 60 + 30 || minutes < 7 * 60;
    if (on !== nightOn) {
      nightOn = on;
      applyBodyClass();
    }
  }

  function tickClock() {
    var d = new Date();
    var minutes = d.getHours() * 60 + d.getMinutes();
    if (minutes !== lastMinute) {
      lastMinute = minutes;
      $('clock').textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
      $('date').textContent = DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
      updateNight(minutes);
    }
  }

  /* ---------- Quotes ---------- */

  var shownKey = '';
  var lastQuoteIndex = -1;

  function quoteList() {
    if (typeof USER_QUOTES !== 'undefined' && USER_QUOTES && USER_QUOTES.length) {
      return USER_QUOTES;
    }
    return typeof QUOTES !== 'undefined' ? QUOTES : [];
  }

  function localDayKey(d) {
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function dayNumber(d) {
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }

  function refreshQuote(force) {
    var now = Date.now();
    var shifted = new Date(now - DAY_START_SHIFT_MS);
    var daily = shifted.getHours() < DAILY_WINDOW_HOURS;
    var key = daily ? 'd' + localDayKey(shifted) : 'h' + Math.floor(now / 3600000);

    if (!force && key === shownKey) {
      return;
    }
    shownKey = key;

    var list = quoteList();
    if (!list.length) {
      fadeEl($('quote'), false);
      return;
    }

    var n = list.length;
    var idx = daily ? (dayNumber(shifted) % n) : (Math.floor(now / 3600000) % n);
    if (n > 1 && idx === lastQuoteIndex) {
      idx = (idx + 1) % n;
    }
    lastQuoteIndex = idx;

    var q = list[idx];
    var isArtist = q.category === 'Artist name' || !!q.song;
    var quoteEl = $('quote');
    if (quoteEl) {
      quoteEl.className = isArtist ? 'card optional artist' : 'card optional';
    }
    setText($('quote-text'), '« ' + q.text + ' »');
    setText($('quote-meta'), isArtist ? '🎵 ' + q.author : (q.author === q.category ? q.author : q.author + '  ·  ' + q.category));
    setText($('quote-song'), isArtist && q.song ? q.song : '');
    show($('quote-song'), !!(isArtist && q.song));
    show($('quote-badge'), daily);
  }

  /* ---------- Spotify through Last.fm ---------- */

  var mediaActive = false;
  var lastTrackKey = '';

  function applyMediaState() {
    fadeEl($('spotify'), mediaActive);
    fadeEl($('quote'), !mediaActive && quoteList().length > 0);
    playingOn = mediaActive;
    applyBodyClass();
  }

  /* ---------- Artwork fallback: iTunes Search (public, no key) ---------- */

  var artCache = {};

  // Asks iTunes for the cover of a track Last.fm has no picture for.
  // Calls cb(url) or cb('') on any failure. Results are cached per track.
  function fetchFallbackArt(track, cb) {
    var term = encodeURIComponent((track.artist + ' ' + track.name).trim());
    var cacheKey = track.artist + '|' + track.name;
    if (artCache.hasOwnProperty(cacheKey)) {
      cb(artCache[cacheKey]);
      return;
    }
    var xhr;
    try {
      xhr = new XMLHttpRequest();
    } catch (e) {
      cb('');
      return;
    }
    xhr.open('GET', 'https://itunes.apple.com/search?entity=song&limit=1&term=' + term, true);
    xhr.timeout = 8000;
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }
      var url = '';
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          var r = data.results && data.results[0];
          if (r && r.artworkUrl100) {
            url = r.artworkUrl100.replace('100x100', '600x600');
          }
        } catch (e) {
          url = '';
        }
      }
      artCache[cacheKey] = url;
      cb(url);
    };
    try {
      xhr.send(null);
    } catch (e) {
      cb('');
    }
  }

  function setNowPlaying(track) {
    if (!track) {
      if (mediaActive) {
        mediaActive = false;
        lastTrackKey = '';
        trackStart = 0;
        trackDuration = 0;
        applyMediaState();
        checkSaver();
      }
      return;
    }

    var key = track.artist + '|' + track.name + '|' + track.image;
    if (key !== lastTrackKey) {
      lastTrackKey = key;
      trackStart = Date.now();
      trackDuration = 0;
      setText($('sp-title'), track.name);
      setText($('sp-artist'), track.artist);
      setArt(track.image);
      if (!track.image) {
        fetchFallbackArt(track, function (url) {
          if (lastTrackKey === key && url) {
            setArt(url);
          }
        });
      }
      var bar0 = $('sp-bar');
      if (bar0) {
        bar0.style.transition = 'none';
        bar0.style.width = '0%';
        void bar0.offsetWidth;
        bar0.style.transition = '';
      }
      fetchDuration(track, key);
      updateProgress();
    }

    if (!mediaActive) {
      mediaActive = true;
      applyMediaState();
      checkSaver();
    }
  }

  function parseNowPlaying(data) {
    var rt = data && data.recenttracks;
    var t = rt && rt.track;
    if (!t) {
      return null;
    }
    if (t.length) {
      t = t[0];
    }
    if (!t || !t['@attr'] || t['@attr'].nowplaying !== 'true') {
      return null;
    }

    var image = '';
    var imgs = t.image || [];
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i]['#text']) {
        image = imgs[i]['#text'];
      }
    }
    if (image.indexOf(DEFAULT_LASTFM_IMAGE_HASH) !== -1) {
      image = '';
    }

    var name = t.name || '';
    var artist = (t.artist && (t.artist['#text'] || t.artist.name)) || '';
    if (!name) {
      return null;
    }
    return { name: name, artist: artist, image: image };
  }

  function fetchNowPlaying() {
    if (!CONFIG.lastfmApiKey || !CONFIG.lastfmUser) {
      return;
    }

    var xhr;
    try {
      xhr = new XMLHttpRequest();
    } catch (e) {
      setNowPlaying(null);
      return;
    }

    var url = 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks' +
      '&user=' + encodeURIComponent(CONFIG.lastfmUser) +
      '&api_key=' + encodeURIComponent(CONFIG.lastfmApiKey) +
      '&format=json&limit=1';

    xhr.open('GET', url, true);
    xhr.timeout = 8000;
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status !== 200) {
        // Visible only in the browser console (F12). Status 0 usually means the browser blocked the request (CORS).
        if (window.console && console.warn) {
          console.warn('Last.fm request failed, status:', xhr.status);
        }
        setNowPlaying(null);
        return;
      }
      var track = null;
      try {
        track = parseNowPlaying(JSON.parse(xhr.responseText));
      } catch (e) {
        track = null;
      }
      setNowPlaying(track);
    };

    try {
      xhr.send(null);
    } catch (e) {
      setNowPlaying(null);
    }
  }

  /* ---------- Track progress (estimated) ---------- */

  var trackStart = 0;
  var trackDuration = 0;

  function fmtTime(sec) {
    return Math.floor(sec / 60) + ':' + pad(sec % 60);
  }

  // Duration comes from Last.fm track.getInfo (fetched once per track).
  function fetchDuration(track, key) {
    if (!CONFIG.lastfmApiKey || !track.artist) {
      return;
    }
    var xhr;
    try {
      xhr = new XMLHttpRequest();
    } catch (e) {
      return;
    }
    var url = 'https://ws.audioscrobbler.com/2.0/?method=track.getInfo' +
      '&artist=' + encodeURIComponent(track.artist) +
      '&track=' + encodeURIComponent(track.name) +
      '&autocorrect=1&api_key=' + encodeURIComponent(CONFIG.lastfmApiKey) +
      '&format=json';
    xhr.open('GET', url, true);
    xhr.timeout = 8000;
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4 || xhr.status !== 200) {
        return;
      }
      try {
        var info = JSON.parse(xhr.responseText).track;
        var ms = info ? parseInt(info.duration, 10) : 0;
        if (key === lastTrackKey && ms > 0) {
          trackDuration = Math.round(ms / 1000);
          updateProgress();
        }
      } catch (e) {}
    };
    try {
      xhr.send(null);
    } catch (e) {}
  }

  // Elapsed time is measured from when the track was first detected.
  function updateProgress() {
    if (!mediaActive || !trackStart) {
      return;
    }
    var elapsed = Math.max(0, Math.floor((Date.now() - trackStart) / 1000));
    var known = trackDuration > 0;
    if (known) {
      elapsed = Math.min(elapsed, trackDuration);
    }
    var bar = $('sp-bar');
    if (bar) {
      bar.style.width = known ? (elapsed / trackDuration * 100).toFixed(2) + '%' : '0%';
    }
    var track = $('sp-track');
    if (track) {
      track.style.opacity = known ? '1' : '0';
    }
    var timeEl = $('sp-time');
    var text = known ? fmtTime(elapsed) + ' / ' + fmtTime(trackDuration) : '';
    if (timeEl && timeEl.textContent !== text) {
      timeEl.textContent = text;
    }
  }

  /* ---------- Screen saver ---------- */

  var idleSince = 0;

  function setSaver(on) {
    if (on === saverOn) {
      return;
    }
    saverOn = on;
    applyBodyClass();
  }

  function checkSaver() {
    var now = Date.now();
    var active = mediaActive;

    if (active) {
      idleSince = 0;
      setSaver(false);
      return;
    }

    if (!idleSince) {
      idleSince = now;
    }
    if (now - idleSince >= SAVER_AFTER_MS) {
      setSaver(true);
    }
  }

  /* ---------- Internet status ---------- */

  var netTimer = null;

  function showNet(online) {
    var el = $('net');
    if (!el) {
      return;
    }
    el.textContent = online ? '🟢 En ligne' : '🔴 Hors ligne';
    show(el, true);

    if (netTimer) {
      window.clearTimeout(netTimer);
      netTimer = null;
    }
    if (online) {
      netTimer = window.setTimeout(function () {
        show(el, false);
        netTimer = null;
      }, NET_SHOW_MS);
    }
  }

  function onNetChange() {
    showNet(navigator.onLine !== false);
  }

  /* ---------- Init ---------- */

  function init() {
    tickClock();
    window.setInterval(tickClock, 1000);

    refreshQuote(true);
    window.setInterval(function () {
      refreshQuote(false);
    }, 60000);
    applyMediaState();

    if (window.Weather) {
      Weather.init();
    }
    if (window.News) {
      News.init();
    }

    fetchNowPlaying();
    window.setInterval(fetchNowPlaying, 15000);
    window.setInterval(updateProgress, 1000);

    window.setInterval(checkSaver, SAVER_CHECK_MS);
    checkSaver();

    window.addEventListener('online', onNetChange, false);
    window.addEventListener('offline', onNetChange, false);
    onNetChange();
  }

  /* ---------- Fullscreen button (touch or mouse only) ---------- */

  var fsTimer = null;

  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function toggleFullscreen() {
    try {
      if (isFullscreen()) {
        (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
      } else {
        var el = document.documentElement;
        (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el);
      }
    } catch (e) {
      // Fullscreen refused by the browser: nothing to do.
    }
  }

  function setupFullscreen() {
    var btn = $('fs');
    var el = document.documentElement;
    var supported = !!(el.requestFullscreen || el.webkitRequestFullscreen);
    if (!btn || !supported) {
      return;
    }
    show(btn, true);

    var reveal = function () {
      btn.className = 'show';
      if (fsTimer) {
        window.clearTimeout(fsTimer);
      }
      fsTimer = window.setTimeout(function () {
        btn.className = '';
      }, 3000);
    };

    btn.onclick = function (e) {
      if (e && e.stopPropagation) { e.stopPropagation(); }
      toggleFullscreen();
      reveal();
    };
    document.addEventListener('mousemove', reveal);
    document.addEventListener('touchstart', reveal);
    document.addEventListener('touchmove', reveal);
  }

  /* ---------- Sunrise and sunset (computed locally, Gazeran) ---------- */

  var SUN_LAT = 48.76;
  var SUN_LON = 1.87;

  // Standard solar position approximation, accurate to about a minute.
  function sunEvent(date, rising) {
    var rad = Math.PI / 180;
    var J2000 = 2451545;
    var d0 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    var jd = d0 / 86400000 + 2440587.5 + 0.5;
    var n = Math.round(jd - J2000 + 0.0008);
    var js = n - SUN_LON / 360;
    var M = (357.5291 + 0.98560028 * js) % 360;
    var C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
    var lambda = (M + C + 180 + 102.9372) % 360;
    var jt = J2000 + js + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lambda * rad);
    var sinDec = Math.sin(lambda * rad) * Math.sin(23.4397 * rad);
    var cosDec = Math.cos(Math.asin(sinDec));
    var cosW = (Math.sin(-0.833 * rad) - Math.sin(SUN_LAT * rad) * sinDec) /
      (Math.cos(SUN_LAT * rad) * cosDec);
    if (cosW > 1 || cosW < -1) {
      return null;
    }
    var w = Math.acos(cosW) / rad;
    var j = rising ? jt - w / 360 : jt + w / 360;
    return new Date((j - 2440587.5) * 86400000);
  }

  function hhmm(d) {
    if (!d) {
      return '';
    }
    return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
  }

  function updateSun() {
    var el = $('sun');
    if (!el) {
      return;
    }
    var now = new Date();
    var rise = sunEvent(now, true);
    var set = sunEvent(now, false);
    if (!rise || !set) {
      el.innerHTML = '';
      return;
    }
    var up = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h20"/><path d="M6 18a6 6 0 0 1 12 0"/><path d="M12 11V4"/><path d="M9 7l3-3 3 3"/></svg>';
    var down = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h20"/><path d="M6 18a6 6 0 0 1 12 0"/><path d="M12 4v7"/><path d="M9 8l3 3 3-3"/></svg>';
    el.innerHTML =
      '<span class="sun-item">' + up + '<span>' + hhmm(rise) + '</span></span>' +
      '<span class="sun-item">' + down + '<span>' + hhmm(set) + '</span></span>';
  }

  window.onload = function () {
    init();
    setupFullscreen();
    updateSun();
    window.setInterval(updateSun, 60000);
  };
})();
