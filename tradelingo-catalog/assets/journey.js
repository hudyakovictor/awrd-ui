/* ============================================================
   TradeLingo · Поведение сюжетных и рисковых ассетов (C01–C10)
   ============================================================ */

/* ---------- C01 · Живой график ---------- */
function initChart() {
  var well = document.getElementById('chart-live');
  if (!well) return;
  var rnd = mulberry(42);
  var candles = [];
  var price = 100;
  function gen() {
    var o = price;
    var drift = (rnd() - 0.44) * 14;
    var c = Math.max(20, Math.min(190, o + drift));
    var h = Math.max(o, c) + rnd() * 10;
    var l = Math.min(o, c) - rnd() * 10;
    price = c;
    return { o: o, c: c, h: h, l: l, up: c >= o };
  }
  for (var i = 0; i < 13; i++) candles.push(gen());
  function render() {
    well.querySelectorAll('.cnd').forEach(function (el, i) {
      var k = candles[i];
      if (!k) return;
      var wick = el.querySelector('.wick');
      var body = el.querySelector('.body');
      var total = k.h - k.l || 1;
      wick.style.height = total + '%';
      wick.style.marginBottom = (k.l) + '%';
      var bTop = Math.max(k.o, k.c), bBot = Math.min(k.o, k.c);
      body.style.height = Math.max(4, (bTop - bBot)) + '%';
      body.style.marginBottom = bBot + '%';
      el.classList.toggle('down', !k.up);
      el.querySelector('.tip').innerHTML =
        (k.up ? '▲' : '▼') + ' O:' + Math.round(k.o) + ' C:' + Math.round(k.c) + '<br>H:' + Math.round(k.h) + ' L:' + Math.round(k.l);
    });
  }
  /* статичный набор из 13 колонок создан в HTML; данные накладываем */
  render();
  var live = document.getElementById('chart-live-toggle');
  var timer = null;
  live.addEventListener('click', function () {
    var on = live.getAttribute('aria-checked') === 'true';
    live.setAttribute('aria-checked', String(!on));
    if (!on) {
      timer = setInterval(function () {
        candles.shift();
        candles.push(gen());
        render();
      }, 1100);
      TL.toast('График пошёл в прямом эфире', 'good', 'play');
    } else {
      clearInterval(timer);
      TL.toast('Поток остановлен');
    }
  });
}

/* ---------- C02 · Пульс-стрелка ---------- */
function initTicker() {
  document.querySelectorAll('.ticker-pill[data-flip]').forEach(function (p) {
    p.addEventListener('click', function () {
      var up = p.classList.toggle('bull');
      p.classList.toggle('bear', !up);
      var ic = p.querySelector('.tk-ic');
      ic.classList.toggle('up', up);
      ic.classList.toggle('down', !up);
      ic.innerHTML = TL.I(up ? 'arrowU' : 'arrowD', 18);
      p.querySelector('.tk-val').textContent = up ? '+2.4%' : '−1.8%';
      var dot = p.querySelector('.pulse-dot');
      dot.classList.toggle('up', up);
      dot.classList.toggle('down', !up);
      TL.floatText(p, up ? 'лонги' : 'шорты', up ? '#58cc02' : '#ff4b4b');
    });
  });
}

/* ---------- C03 · Таймлайн квестов ---------- */
function initQuests() {
  document.querySelectorAll('.qnode-card[data-claim]').forEach(function (c) {
    c.addEventListener('click', function () {
      var node = c.closest('.qnode');
      if (!node.classList.contains('current')) {
        TL.toast('Сначала закрыт текущий урок', 'bad', 'lock');
        return;
      }
      node.classList.remove('current');
      node.classList.add('done');
      c.setAttribute('disabled', '');
      c.querySelector('.qn-xp').textContent = '+' + c.dataset.claim + ' XP';
      TL.confettiAt(c, 20);
      TL.floatText(c, '+' + c.dataset.claim + ' XP', '#58cc02');
      var next = document.querySelector('.qnode:not(.done):not(.current)');
      if (next) {
        next.classList.add('current');
        TL.toast('Новый узел маршрута открыт', 'good', 'flag');
      }
    });
  });
}

/* ---------- C04 · Карьерная лестница ---------- */
function initCareer() {
  var steps = Array.prototype.slice.call(document.querySelectorAll('.career-step[data-rank]'));
  steps.forEach(function (s, i) {
    s.addEventListener('click', function () {
      if (s.classList.contains('locked')) {
        TL.floatText(s, 'закрыто', '#64789a');
        return;
      }
      steps.forEach(function (x, j) {
        x.classList.toggle('reached', j <= i);
        x.classList.toggle('next', j === i + 1);
        x.classList.toggle('locked', j > i + 1);
      });
      TL.floatText(s, s.dataset.rank, '#58cc02');
      TL.confettiAt(s, 14);
      TL.toast('Ранг: ' + s.dataset.rank, 'good', 'crown');
    });
  });
}

/* ---------- C05 · Лидерборд ---------- */
function initLeader() {
  var board = document.getElementById('leader-demo');
  if (!board) return;
  board.querySelectorAll('.lb-row').forEach(function (r) {
    r.addEventListener('click', function () {
      r.classList.remove('bump');
      void r.offsetWidth;
      r.classList.add('bump');
      var pts = r.querySelector('.lb-pts');
      var cur = parseInt(pts.textContent.replace(/\s/g, ''), 10);
      var add = 20 + Math.floor(Math.random() * 80);
      pts.textContent = (cur + add).toLocaleString('ru-RU');
      TL.floatText(pts, '+' + add, '#ffc800');
    });
  });
  var simBtn = document.getElementById('leader-sim');
  if (simBtn) {
    simBtn.addEventListener('click', function () {
      var rows = Array.prototype.slice.call(board.querySelectorAll('.lb-row'));
      rows.forEach(function (r) { r.classList.add('bump'); });
      var me = board.querySelector('.lb-row.me');
      board.appendChild(me);
      TL.toast('Симуляция недели: соперники двигаются!', null, 'users');
      setTimeout(function () { rows.forEach(function (r) { r.classList.remove('bump'); }); }, 600);
    });
  }
}

/* ---------- C06 · Дуэль-мод ---------- */
function initDuelMod() {
  var arena = document.getElementById('duel-arena');
  if (!arena) return;
  var score = 0, streak = 0;
  var sEl = arena.querySelector('[data-dscore]');
  var stEl = arena.querySelector('[data-streak]');
  var fx = arena.querySelector('.duel-fx');
  var timerEl = arena.querySelector('[data-dtimer]');
  var timer = null;
  function start() {
    var t = 30;
    timerEl.textContent = '0:' + t;
    clearInterval(timer);
    timer = setInterval(function () {
      t--;
      timerEl.textContent = '0:' + (t < 10 ? '0' : '') + t;
      if (t <= 5) timerEl.style.color = '#ff4b4b';
      if (t <= 0) {
        clearInterval(timer);
        fx.textContent = 'ВРЕМЯ!';
        fx.style.color = '#ffc800';
        fx.classList.remove('go'); void fx.offsetWidth; fx.classList.add('go');
        TL.toast('Дуэль завершена: ' + score + ' очков', null, 'clock');
      }
    }, 1000);
    TL.toast('Дуэль началась! 30 секунд', 'good', 'swords');
  }
  arena.querySelector('[data-duel-start]').addEventListener('click', start);
  arena.querySelectorAll('.duel-btns .btn').forEach(function (b) {
    if (b.hasAttribute('data-duel-start')) return;
    b.addEventListener('click', function () {
      score += 10; streak++;
      sEl.textContent = score;
      stEl.textContent = 'x' + streak;
      fx.textContent = 'CRIT!';
      fx.style.color = '#ce82ff';
      fx.classList.remove('go'); void fx.offsetWidth; fx.classList.add('go');
      if (streak % 5 === 0) TL.toast('Серия x' + streak + ' — двойные очки!', 'good', 'fire');
    });
  });
}

/* ---------- C07 · Лутбокс ---------- */
function initChest() {
  var chest = document.getElementById('chest-demo');
  if (!chest) return;
  var prizes = ['+150 монет', 'Карта «Стоп-лосс»', '+1 ключ', 'Скин «Бык»', '+30 гемов'];
  var opened = false;
  chest.addEventListener('click', function () {
    if (opened) {
      chest.classList.remove('open');
      opened = false;
      TL.toast('Сундук закрыт до завтра', null, 'lock');
      return;
    }
    chest.classList.remove('shake'); void chest.offsetWidth; chest.classList.add('shake');
    setTimeout(function () {
      chest.classList.add('open');
      chest.querySelector('.chest-prize').textContent = prizes[Math.floor(Math.random() * prizes.length)];
      TL.confettiAt(chest, 30, ['#ffc800', '#ffffff', '#ce82ff']);
      opened = true;
    }, 430);
  });
}

/* ---------- C08 · Волатильность-метр ---------- */
function initVola() {
  var root = document.getElementById('vola-demo');
  if (!root) return;
  var needle = root.querySelector('.vola-needle');
  var status = root.querySelector('.vola-status');
  var zones = [
    { max: 30, t: 'ТИХИЙ РЫНОК', c: '#58cc02' },
    { max: 55, t: 'УМЕРЕННЫЙ', c: '#ffc800' },
    { max: 80, t: 'ВОЛАТИЛЬНЫЙ', c: '#ff9a1f' },
    { max: 101, t: 'ХАОС! РИСК ЛИКВИДАЦИИ', c: '#ff4b4b' }
  ];
  function set(v) {
    needle.style.left = v + '%';
    var z = zones.find(function (x) { return v < x.max; });
    status.textContent = z.t;
    status.style.color = z.c;
  }
  set(24);
  root.querySelector('[data-vola-roll]').addEventListener('click', function () {
    var v = 8 + Math.floor(Math.random() * 88);
    set(v);
    TL.floatText(needle, v + '%', '#ffffff');
    if (v > 80) TL.toast('Хаос: включай стоп-лоссы!', 'bad', 'fire');
  });
}

/* ---------- C09 · Ачивка-прорыв ---------- */
function initAch() {
  var b = document.getElementById('ach-badge');
  if (!b) return;
  b.addEventListener('click', function () {
    b.classList.remove('shine'); void b.offsetWidth; b.classList.add('shine');
    var r = b.getBoundingClientRect();
    TL.confetti(r.left + r.width / 2, r.top + 20, 26, ['#ffc800', '#ffe98a', '#ffffff']);
    TL.floatText(b, 'РАЗЛОЧЕНО!', '#ffe98a');
    TL.toast('Достижение «Первый профит» записано в профиль', 'good', 'trophy');
  });
}

/* ---------- C10 · Карта мира ---------- */
function initMap() {
  var map = document.getElementById('worldmap');
  if (!map) return;
  var hero = map.querySelector('.wm-hero');
  map.querySelectorAll('.wm-node .wn-btn').forEach(function (n) {
    n.addEventListener('click', function () {
      var node = n.closest('.wm-node');
      if (node.classList.contains('locked')) {
        TL.floatText(node, 'закрыто', '#64789a');
        return;
      }
      var l = node.style.left, t = node.style.top;
      hero.style.left = l;
      hero.style.top = t;
      var done = map.querySelector('.wm-node.done:last-of-type');
      if (!node.classList.contains('done') && !node.classList.contains('boss')) {
        node.classList.remove('current'); node.classList.add('done');
        n.innerHTML = TL.I('check', 22);
        TL.confettiAt(node, 18);
        TL.toast('Урок пройден: ' + node.dataset.name, 'good', 'check');
        var next = map.querySelector('.wm-node:not(.done):not(.locked):not(.boss)');
        if (next) TL.toast('Следующая точка: ' + next.dataset.name, null, 'flag');
      } else if (node.classList.contains('boss')) {
        TL.toast('Босс-уровень: победи Кита Ликвидации!', 'bad', 'swords');
      }
    });
  });
}

/* ---------- PRNG ---------- */
function mulberry(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function initJourney() {
  initChart(); initTicker(); initQuests(); initCareer(); initLeader();
  initDuelMod(); initChest(); initVola(); initAch(); initMap();
}
window.initJourney = initJourney;
