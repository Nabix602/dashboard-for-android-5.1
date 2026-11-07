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

  // Album art cross-fade.
  function setArt(url) {
    var art = $('sp-art');
    if (!art) {
      return;
    }
    var bg = url ? 'url("' + url + '")' : 'none';
    if (art.getAttribute('data-bg') === bg) {
      return;
    }
    art.setAttribute('data-bg', bg);
    if (!art.getAttribute('data-init')) {
      art.setAttribute('data-init', '1');
      art.style.backgroundImage = bg;
      return;
    }
    art.style.opacity = '0';
    window.setTimeout(function () {
      art.style.backgroundImage = bg;
      art.style.opacity = '1';
    }, 500);
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
    if (playingOn) {
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

  function setNowPlaying(track) {
    if (!track) {
      if (mediaActive) {
        mediaActive = false;
        lastTrackKey = '';
        applyMediaState();
        checkSaver();
      }
      return;
    }

    var key = track.artist + '|' + track.name + '|' + track.image;
    if (key !== lastTrackKey) {
      lastTrackKey = key;
      setText($('sp-title'), track.name);
      setText($('sp-artist'), track.artist);
      setArt(track.image);
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

  /* ---------- Screen saver ---------- */

  var idleSince = 0;

  function psgVisible() {
    var el = $('psg');
    return !!el && el.style.display !== 'none';
  }

  function setSaver(on) {
    if (on === saverOn) {
      return;
    }
    saverOn = on;
    applyBodyClass();
  }

  function checkSaver() {
    var now = Date.now();
    var active = mediaActive || psgVisible();

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
    if (window.PSG) {
      PSG.init();
    }
    if (window.News) {
      News.init();
    }

    fetchNowPlaying();
    window.setInterval(fetchNowPlaying, 30000);

    window.setInterval(checkSaver, SAVER_CHECK_MS);
    checkSaver();

    window.addEventListener('online', onNetChange, false);
    window.addEventListener('offline', onNetChange, false);
    onNetChange();
  }

  window.onload = init;
})();
