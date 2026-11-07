(function () {
  'use strict';

  // Free public feeds, converted to JSON by rss2json (no key needed for light use).
  // Technology, science and France. Verify these URLs before relying on them.
  var FEEDS = [
    'https://www.numerama.com/feed/',
    'https://www.lemonde.fr/pixels/rss_full.xml',
    'https://www.lemonde.fr/sciences/rss_full.xml'
  ];
  var CONVERTER = 'https://api.rss2json.com/v1/api.json?rss_url=';

  var REFRESH_MS = 60 * 60 * 1000;
  var ROTATE_MS = 15 * 60 * 1000;
  var MAX_ITEMS = 8;
  var MIN_ROTATE_ITEMS = 3; // below this, keep the best headline still
  var MAX_CHARS = 80;

  // Simple filter against political and clickbait headlines.
  var EXCLUDE = /élection|elections?|gouvernement|ministre|président|député|assemblée|sondage|macron|trump|politi|attentat|meurtre|procès|vous ne croirez pas|choquant|incroyable|scandale/i;

  var items = [];
  var index = 0;
  var lastKey = '';
  var fetching = false;

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

  // rss2json dates look like "2026-11-07 10:30:00" (UTC).
  function parseDate(s) {
    if (!s) {
      return 0;
    }
    var p = String(s).split(/[- :T]/);
    if (p.length < 5) {
      return 0;
    }
    var t = Date.UTC(
      parseInt(p[0], 10),
      parseInt(p[1], 10) - 1,
      parseInt(p[2], 10),
      parseInt(p[3], 10) || 0,
      parseInt(p[4], 10) || 0,
      parseInt(p[5], 10) || 0
    );
    return isNaN(t) ? 0 : t;
  }

  function clean(text) {
    var t = String(text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');
    t = t.replace(/^\s+|\s+$/g, '');
    if (t.length > MAX_CHARS) {
      t = t.substr(0, MAX_CHARS - 1).replace(/\s+\S*$/, '') + '…';
    }
    return t;
  }

  function timeLabel(ms) {
    var d = new Date(ms);
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function fetchFeed(feed, cb) {
    var xhr;
    try {
      xhr = new XMLHttpRequest();
    } catch (e) {
      cb([]);
      return;
    }
    xhr.open('GET', CONVERTER + encodeURIComponent(feed), true);
    xhr.timeout = 10000;
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }
      var out = [];
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          if (data && data.status === 'ok' && data.items) {
            var source = (data.feed && data.feed.title) || '';
            for (var i = 0; i < data.items.length; i++) {
              var it = data.items[i];
              var title = clean(it.title);
              var time = parseDate(it.pubDate);
              if (!title || !time || EXCLUDE.test(title)) {
                continue;
              }
              out.push({
                title: title,
                source: clean(source).substr(0, 30),
                time: time
              });
            }
          }
        } catch (e) {
          out = [];
        }
      }
      cb(out);
    };
    try {
      xhr.send(null);
    } catch (e) {
      cb([]);
    }
  }

  function render() {
    var el = $('news');
    if (!el) {
      return;
    }
    if (!items.length || navigator.onLine === false) {
      show(el, false);
      return;
    }

    show(el, true);
    var it = items[index % items.length];
    var key = it.title + '|' + it.source + '|' + it.time;
    if (key === lastKey) {
      return;
    }
    lastKey = key;

    var meta = it.source + (it.source ? ' · ' : '') + timeLabel(it.time);
    setText($('news-source'), meta);
    setText($('news-title'), it.title);
  }

  function finish(fresh) {
    var seen = {};
    var unique = [];
    fresh.sort(function (a, b) {
      return b.time - a.time;
    });
    for (var i = 0; i < fresh.length; i++) {
      var k = fresh[i].title.toLowerCase();
      if (!seen[k]) {
        seen[k] = true;
        unique.push(fresh[i]);
      }
    }
    var oldTitle = items.length ? items[index % items.length].title : '';
    var oldIndex = index;
    items = unique.slice(0, MAX_ITEMS);
    index = 0;
    if (items.length) {
      index = oldIndex % items.length;
      for (var j = 0; j < items.length; j++) {
        if (items[j].title === oldTitle) {
          index = j;
          break;
        }
      }
    }
    fetching = false;
    render();
  }

  function refresh() {
    if (fetching) {
      return;
    }
    if (navigator.onLine === false) {
      render();
      return;
    }

    fetching = true;
    var pending = FEEDS.length;
    var collected = [];

    for (var i = 0; i < FEEDS.length; i++) {
      fetchFeed(FEEDS[i], function (list) {
        collected = collected.concat(list);
        pending--;
        if (pending === 0) {
          finish(collected);
        }
      });
    }
  }

  function rotate() {
    if (items.length < MIN_ROTATE_ITEMS) {
      return;
    }
    index = (index + 1) % items.length;
    render();
  }

  function init() {
    show($('news'), false);
    refresh();
    window.setInterval(refresh, REFRESH_MS);
    window.setInterval(rotate, ROTATE_MS);
    window.addEventListener('online', refresh, false);
    window.addEventListener('offline', render, false);
  }

  window.News = { init: init };
})();
