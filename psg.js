(function () {
  'use strict';

  // TheSportsDB public key and Paris Saint-Germain team ID (to verify).
  var API_KEY = '123';
  var TEAM_ID = '133604';
  var BASE = 'https://www.thesportsdb.com/api/v1/json/' + API_KEY + '/';

  var DAY_MS = 86400000;
  var MATCH_MS = 110 * 60000;
  var FAST_GAP_MS = 3 * 60000;
  var SLOW_GAP_MS = 20 * 60000;
  var TICK_MS = 60000;
  var WINDOW_BEFORE_MS = 2 * DAY_MS;   // show from 48 h before kickoff
  var WINDOW_AFTER_MS = DAY_MS;        // keep showing 24 h after the final whistle

  var DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  var MONTHS_SHORT = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];

  var state = {
    nextList: [],
    lastList: [],
    lastFetch: 0,
    fetching: false
  };

  var lastKey = '';

  function $(id) {
    return document.getElementById(id);
  }

  function show(el, on) {
    if (el) {
      el.style.display = on ? '' : 'none';
    }
  }

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
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

  function getJSON(url, cb) {
    var xhr;
    try {
      xhr = new XMLHttpRequest();
    } catch (e) {
      cb(true, null);
      return;
    }
    xhr.open('GET', url, true);
    xhr.timeout = 10000;
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status !== 200) {
        cb(true, null);
        return;
      }
      try {
        cb(false, JSON.parse(xhr.responseText));
      } catch (e) {
        cb(true, null);
      }
    };
    try {
      xhr.send(null);
    } catch (e) {
      cb(true, null);
    }
  }

  function isPsg(name) {
    return /saint[- ]germain|psg|paris sg/i.test(name || '');
  }

  function shortName(name) {
    return isPsg(name) ? 'PSG' : (name || '');
  }

  function isFinished(status) {
    var s = (status || '').toLowerCase();
    return s === 'ft' || s === 'aet' || s === 'pen' ||
      s.indexOf('finished') !== -1 || s.indexOf('postponed') !== -1 || s.indexOf('cancel') !== -1;
  }

  function toInt(v) {
    var n = parseInt(v, 10);
    return isNaN(n) ? null : n;
  }

  function build(ev) {
    if (!ev || !ev.dateEvent) {
      return null;
    }
    var parts = ev.dateEvent.split('-');
    if (parts.length !== 3) {
      return null;
    }
    var hasTime = !!ev.strTime;
    var t = hasTime ? ev.strTime.split(':') : [0, 0];
    var kickoff = Date.UTC(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10),
      parseInt(t[0], 10) || 0,
      parseInt(t[1], 10) || 0
    );
    if (isNaN(kickoff)) {
      return null;
    }

    var psgHome = isPsg(ev.strHomeTeam);

    return {
      id: ev.idEvent,
      kickoff: kickoff,
      hasTime: hasTime,
      psgHome: psgHome,
      opponent: psgHome ? (ev.strAwayTeam || '') : (ev.strHomeTeam || ''),
      home: shortName(ev.strHomeTeam),
      away: shortName(ev.strAwayTeam),
      hs: toInt(ev.intHomeScore),
      as: toInt(ev.intAwayScore),
      status: ev.strStatus || ''
    };
  }

  function parseList(data) {
    var arr = (data && (data.events || data.results)) || [];
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var m = build(arr[i]);
      if (m) {
        out.push(m);
      }
    }
    return out;
  }

  function allMatches() {
    return state.nextList.concat(state.lastList);
  }

  function nearMatch(now) {
    var list = allMatches();
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.hasTime && now >= m.kickoff - 30 * 60000 && now < m.kickoff + MATCH_MS + 10 * 60000) {
        return true;
      }
    }
    return false;
  }

  // Chooses at most one match to show: live first, then the next one within
  // 48 h, then a finished one for 24 h after its end.
  function pick(now) {
    var list = allMatches();
    var live = null;
    var next = null;
    var recent = null;

    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      var finished = isFinished(m.status);

      if (m.hasTime && now >= m.kickoff && now < m.kickoff + MATCH_MS && !finished) {
        if (!live) {
          live = m;
        }
        continue;
      }

      if (m.kickoff > now && m.kickoff - now <= WINDOW_BEFORE_MS) {
        if (!next || m.kickoff < next.kickoff) {
          next = m;
        }
        continue;
      }

      var ended = finished || (m.hasTime && now >= m.kickoff + MATCH_MS);
      var refTime = m.hasTime ? m.kickoff + MATCH_MS : m.kickoff;
      if (ended && m.kickoff <= now && now - refTime < WINDOW_AFTER_MS && m.hs !== null && m.as !== null) {
        if (!recent || m.kickoff > recent.kickoff) {
          recent = m;
        }
      }
    }

    if (live) {
      return { type: 'live', m: live };
    }
    if (next) {
      return { type: 'next', m: next };
    }
    if (recent) {
      return { type: 'recent', m: recent };
    }
    return null;
  }

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function dayLabel(ts) {
    var d = new Date(ts);
    if (sameDay(d, new Date())) {
      return "Aujourd'hui";
    }
    if (sameDay(d, new Date(Date.now() + DAY_MS))) {
      return 'Demain';
    }
    return DAYS_SHORT[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS_SHORT[d.getMonth()];
  }

  function timeLabel(ts) {
    var d = new Date(ts);
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function opponentOf(m) {
    return m.opponent || (m.psgHome ? m.away : m.home);
  }

  function scoreLine(m) {
    var psgScore = m.psgHome ? m.hs : m.as;
    var oppScore = m.psgHome ? m.as : m.hs;
    return 'PSG ' + psgScore + ' - ' + oppScore + ' ' + opponentOf(m);
  }

  // Three layouts, each with at most three short lines:
  //   upcoming:  ⚽ PSG vs Arsenal   /  Aujourd'hui · 16:00
  //   live:      🔴 LIVE            /  PSG 2 - 1 Arsenal  /  78'
  //   finished:  ✅ PSG 3 - 1 Arsenal
  function render() {
    var now = Date.now();
    var p = pick(now);

    if (!p) {
      lastKey = '';
      show($('psg'), false);
      return;
    }

    var m = p.m;
    var label;
    var main = '';
    var detail = '';

    if (p.type === 'live') {
      var elapsed = Math.floor((now - m.kickoff) / 60000);
      if (elapsed > 60) {
        elapsed -= 15;
      }
      elapsed = Math.max(1, Math.min(90, elapsed));

      label = '🔴 LIVE';
      if (m.hs !== null && m.as !== null) {
        main = scoreLine(m);
      }
      detail = elapsed + "'";
    } else if (p.type === 'next') {
      label = '⚽ ' + (m.psgHome ? 'PSG vs ' + opponentOf(m) : opponentOf(m) + ' vs PSG');
      detail = m.hasTime
        ? dayLabel(m.kickoff) + ' · ' + timeLabel(m.kickoff)
        : dayLabel(m.kickoff);
    } else {
      label = '✅ ' + scoreLine(m);
      main = '';
    }

    var key = label + '|' + main + '|' + detail;
    if (key === lastKey) {
      show($('psg'), true);
      return;
    }
    lastKey = key;

    setText($('psg-label'), label);
    setText($('psg-match'), main);
    setText($('psg-detail'), detail);
    show($('psg-match'), !!main);
    show($('psg-detail'), !!detail);
    show($('psg'), true);
  }

  function fetchAll(force) {
    var now = Date.now();
    if (state.fetching) {
      return;
    }
    var gap = nearMatch(now) ? FAST_GAP_MS : SLOW_GAP_MS;
    if (!force && now - state.lastFetch < gap) {
      return;
    }

    state.fetching = true;
    state.lastFetch = now;

    var pending = 2;
    var done = function () {
      pending--;
      if (pending === 0) {
        state.fetching = false;
        render();
      }
    };

    getJSON(BASE + 'eventsnext.php?id=' + TEAM_ID, function (err, data) {
      if (!err && data) {
        state.nextList = parseList(data);
      }
      done();
    });

    getJSON(BASE + 'eventslast.php?id=' + TEAM_ID, function (err, data) {
      if (!err && data) {
        state.lastList = parseList(data);
      }
      done();
    });
  }

  function init() {
    show($('psg'), false);
    fetchAll(true);
    window.setInterval(function () {
      fetchAll(false);
      render();
    }, TICK_MS);
  }

  window.PSG = { init: init };
})();
