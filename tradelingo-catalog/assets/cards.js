/* ============================================================
   TradeLingo · Поведение карт и врагов (B01–B10)
   ============================================================ */

/* ---------- B01 · Игровая карта: тап -> бёмп + вспышка стоимости ---------- */
function initGcards() {
  document.querySelectorAll('.gcard').forEach(function (c) {
    c.addEventListener('click', function () {
      var cost = c.querySelector('.gcard-cost');
      TL.floatText(c, 'В колоду!', getComputedStyle(c).getPropertyValue('--gc') || '#1cb0f5');
      cost.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.45) rotate(10deg)' }, { transform: 'scale(1)' }],
        { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' }
      );
    });
  });
}

/* ---------- B02 · Редкости: тап -> блик сканирования ---------- */
function initRarChips() {
  document.querySelectorAll('.rar-chip').forEach(function (ch) {
    ch.addEventListener('click', function () {
      var old = ch.querySelector('.scanline');
      if (old) old.remove();
      var s = document.createElement('i');
      s.className = 'scanline';
      ch.appendChild(s);
      setTimeout(function () { s.remove(); }, 800);
      var r = ch.getBoundingClientRect();
      TL.confetti(r.left + r.width / 2, r.top + r.height / 2, 8, [getComputedStyle(ch).borderColor]);
    });
  });
}

/* ---------- B03 · Флип-карта ---------- */
function initFlip() {
  document.querySelectorAll('.flip').forEach(function (f) {
    f.addEventListener('click', function () {
      f.classList.toggle('flipped');
      var hint = document.getElementById('flip-hint');
      if (hint) hint.textContent = f.classList.contains('flipped')
        ? 'Рубашка. Тапни ещё раз'
        : 'Аверс. Тапни, чтобы перевернуть';
    });
    f.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f.click(); }
    });
  });
}

/* ---------- B04 · Хайлайт выбора: ровно одна карта ---------- */
function initPick() {
  var picks = Array.prototype.slice.call(document.querySelectorAll('.pick'));
  picks.forEach(function (p) {
    p.addEventListener('click', function () {
      var was = p.classList.contains('selected');
      picks.forEach(function (x) { x.classList.remove('selected'); x.setAttribute('aria-pressed', 'false'); });
      if (!was) {
        p.classList.add('selected');
        p.setAttribute('aria-pressed', 'true');
        var r = p.getBoundingClientRect();
        TL.confetti(r.left + r.width / 2, r.top - 4, 14, ['#58cc02', '#ffffff']);
        TL.floatText(p.querySelector('.gcard') || p, 'Выбрано', '#58cc02');
      }
    });
  });
}

/* ---------- B05 · Глоссарий-карта: полное определение ---------- */
function initTerm() {
  document.querySelectorAll('.term-card[data-full]').forEach(function (t) {
    var btn = t.querySelector('.tc-more');
    btn.addEventListener('click', function () {
      var open = t.classList.toggle('open');
      t.querySelector('.tc-def').textContent = open ? t.dataset.full : t.dataset.short;
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('span').textContent = open ? 'Свернуть' : 'Далее';
      if (open) TL.floatText(t.querySelector('.tc-term'), '+10 XP', '#58cc02');
    });
  });
  document.querySelectorAll('.term-card .tc-say').forEach(function (b) {
    b.addEventListener('click', function () {
      b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      TL.toast('Произношение термина', null, 'volume');
    });
  });
}

/* ============================================================
   Враги (B06–B10)
   ============================================================ */

/* Общая фабрика удара по врагу */
function hitEnemy(stage, opts) {
  opts = opts || {};
  var bust = stage.querySelector('.enemy-bust');
  var hp = stage.querySelector('.hp');
  var fill = hp.querySelector('i');
  var hpTxt = stage.querySelector('.hp-now');
  var hpMax = opts.hpMax || 300;
  var dmg = opts.dmg || (34 + Math.floor(Math.random() * 60));
  var cur = opts.getHp();
  cur = Math.max(0, cur - dmg);
  opts.setHp(cur);
  var pct = Math.round(cur / hpMax * 100);
  fill.style.width = pct + '%';
  hp.classList.toggle('low', pct <= 60 && pct > 25);
  hp.classList.toggle('crit', pct <= 25);
  if (hpTxt) hpTxt.textContent = cur + ' / ' + hpMax;
  bust.classList.remove('hit');
  void bust.offsetWidth;
  bust.classList.add('hit');
  var r = bust.getBoundingClientRect();
  TL.confetti(r.left + r.width / 2, r.top + r.height / 3, 16, ['#ffffff', '#ffc800', '#ff4b4b']);
  TL.floatText(bust, '-' + dmg, '#ff4b4b');
  if (cur <= 0) {
    setTimeout(function () {
      TL.confetti(r.left + r.width / 2, r.top + r.height / 2, 34);
      TL.toast(opts.winMsg || 'Враг побеждён!', 'good', 'trophy');
      cur = hpMax; opts.setHp(cur);
      fill.style.width = '100%';
      hp.classList.remove('low', 'crit');
      if (hpTxt) hpTxt.textContent = cur + ' / ' + hpMax;
    }, 620);
  }
  return cur;
}

/* B06 · Обычный враг №1: Фомо-Дух */
function initEnemyFomo() {
  var stage = document.getElementById('enemy-fomo');
  if (!stage) return;
  var hpCur = 380;
  var btn = stage.querySelector('.attack-btn');
  var fx = stage.querySelector('.slash-fx');
  btn.addEventListener('click', function () {
    fx.classList.remove('go'); void fx.offsetWidth; fx.classList.add('go');
    hitEnemy(stage, {
      hpMax: 380, dmg: 40 + Math.floor(Math.random() * 50), getHp: function () { return hpCur; }, setHp: function (v) { hpCur = v; },
      winMsg: 'Фомо-Дух развеян! Урок: покупай по плану'
    });
  });
}

/* B07 · Обычный враг №2: Полтергейст Бумажных Рук */
function initEnemyPaper() {
  var stage = document.getElementById('enemy-paper');
  if (!stage) return;
  var hpCur = 320;
  var btn = stage.querySelector('.attack-btn');
  var fx = stage.querySelector('.slash-fx');
  var dodge = true;
  btn.addEventListener('click', function () {
    if (dodge) {
      dodge = false;
      var bust = stage.querySelector('.enemy-bust');
      bust.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(14px) scale(.92)', opacity: .4 }, { transform: 'translateX(0)' }], { duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      TL.floatText(bust, 'уклон!', '#7fd4ff');
      TL.toast('Паник-сейл: враг уклонился от первого удара', 'bad', 'mask');
      return;
    }
    fx.classList.remove('go'); void fx.offsetWidth; fx.classList.add('go');
    hitEnemy(stage, {
      hpMax: 320, dmg: 38 + Math.floor(Math.random() * 46), getHp: function () { return hpCur; }, setHp: function (v) { hpCur = v; },
      winMsg: 'Бумажные руки рассыпались! Урок: держи план, а не эмоции'
    });
  });
}

/* B08 · Враг-статистика: Допаминовый Бес */
function initEnemyDopamine() {
  var stage = document.getElementById('enemy-dopamine');
  if (!stage) return;
  var hpCur = 220;
  var atk = 12;
  var atkEl = stage.querySelector('[data-atk]');
  var btn = stage.querySelector('.attack-btn');
  var fx = stage.querySelector('.slash-fx');
  btn.addEventListener('click', function () {
    fx.classList.remove('go'); void fx.offsetWidth; fx.classList.add('go');
    var before = hpCur;
    hitEnemy(stage, {
      hpMax: 220, dmg: 30 + Math.floor(Math.random() * 40), getHp: function () { return hpCur; }, setHp: function (v) { hpCur = v; },
      winMsg: 'Бес развеян! Урок: эйфория после победы — тоже риск'
    });
    if (hpCur < before && hpCur > 0) {
      atk += 2;
      atkEl.innerHTML = atk + ' <i class="up">+2</i>';
      TL.toast('Эйфория: атака Беса растёт с каждой свечой', 'bad', 'fire');
    }
  });
}

/* B09 · Босс: Кит Ликвидации (3 фазы) */
function initBoss() {
  var stage = document.getElementById('boss-stage');
  if (!stage) return;
  var hpMax = 900, hpCur = 900, phase = 1;
  var fill = stage.querySelector('.hp > i');
  var hpTxt = stage.querySelector('.hp-now');
  var dots = stage.querySelectorAll('.phase-dots i');
  var aura = stage.querySelector('.boss-aura');
  var btn = stage.querySelector('.attack-btn');
  var fx = stage.querySelector('.slash-fx');
  function setPhase(p) {
    phase = p;
    dots.forEach(function (d, i) { d.classList.toggle('on', i < p); });
    stage.style.setProperty('--bc', p === 1 ? '#ce82ff' : p === 2 ? '#ff9a1f' : '#ff4b4b');
    if (p === 3) {
      aura.animate([{ filter: 'saturate(1)' }, { filter: 'saturate(1.6) brightness(1.25)', transform: 'scale(1.05)' }, { filter: 'saturate(1)' }], { duration: 600, easing: 'ease-out' });
      TL.toast('ФАЗА 3: ярость Кита Ликвидации!', 'bad', 'fire');
    } else if (p === 2) {
      TL.toast('ФАЗА 2: каскад ликвидаций', 'bad', 'swords');
    }
  }
  btn.addEventListener('click', function () {
    fx.classList.remove('go'); void fx.offsetWidth; fx.classList.add('go');
    var dmg = 60 + Math.floor(Math.random() * 70);
    hpCur = Math.max(0, hpCur - dmg);
    fill.style.width = Math.round(hpCur / hpMax * 100) + '%';
    hpTxt.textContent = hpCur + ' / ' + hpMax;
    var bust = stage.querySelector('.enemy-bust');
    bust.classList.remove('hit'); void bust.offsetWidth; bust.classList.add('hit');
    var r = bust.getBoundingClientRect();
    TL.confetti(r.left + r.width / 2, r.top + r.height / 3, 18, ['#ce82ff', '#ffffff', '#ffc800']);
    TL.floatText(bust, '-' + dmg, '#ddafff');
    var pct = hpCur / hpMax;
    if (pct <= 0.66 && phase === 1) setPhase(2);
    if (pct <= 0.33 && phase === 2) setPhase(3);
    if (hpCur <= 0) {
      setTimeout(function () {
        TL.confetti(window.innerWidth / 2, window.innerHeight / 2, 60);
        TL.toast('Босс повержен! Открыт урок «Управление риском»', 'good', 'crown');
        hpCur = hpMax; fill.style.width = '100%'; hpTxt.textContent = hpCur + ' / ' + hpMax;
        setPhase(1);
      }, 700);
    }
  });
}

/* B10 · Дуэльный мини-стенд: игрок vs враг */
function initDuel() {
  var scene = document.getElementById('duel-scene');
  if (!scene) return;
  var eHp = 260;
  var pHp = 100;
  var eFill = scene.querySelector('.enemy-side .hp > i');
  var eTxt = scene.querySelector('.enemy-side .hp-now');
  var pFill = scene.querySelector('.player-side .meter > i');
  var pTxt = scene.querySelector('.player-side .pl-hp');
  var fx = scene.querySelector('.duel-fx');
  var atkBtn = scene.querySelector('[data-duel="atk"]');
  var defBtn = scene.querySelector('[data-duel="def"]');
  var log = scene.querySelector('.duel-score');
  var hits = 0;
  function refresh() {
    eFill.style.width = Math.round(eHp / 260 * 100) + '%';
    eTxt.textContent = eHp + ' / 260';
    pFill.style.width = pHp + '%';
    pTxt.textContent = 'HP ' + pHp;
  }
  refresh();
  atkBtn.addEventListener('click', function () {
    if (eHp <= 0) return;
    var d = 34 + Math.floor(Math.random() * 40);
    eHp = Math.max(0, eHp - d);
    hits++;
    fx.textContent = '-' + d;
    fx.style.color = '#58cc02';
    fx.classList.remove('go'); void fx.offsetWidth; fx.classList.add('go');
    TL.floatText(scene.querySelector('.enemy-bust'), '-' + d, '#58cc02');
    refresh();
    if (eHp <= 0) {
      TL.confettiAt(scene.querySelector('.duel-field'), 30);
      TL.toast('Дуэль выиграна за ' + hits + ' ударов', 'good', 'swords');
    } else {
      var back = 4 + Math.floor(Math.random() * 8);
      pHp = Math.max(10, pHp - back);
      refresh();
    }
  });
  defBtn.addEventListener('click', function () {
    pHp = Math.min(100, pHp + 12);
    refresh();
    TL.floatText(scene.querySelector('.player-side'), '+12 HP', '#1cb0f5');
    TL.toast('Защита: восстановлено 12 HP', null, 'shield');
  });
}

function initCards() {
  initGcards(); initRarChips(); initFlip(); initPick(); initTerm();
  initEnemyFomo(); initEnemyPaper(); initEnemyDopamine(); initBoss(); initDuel();
}
window.initCards = initCards;
