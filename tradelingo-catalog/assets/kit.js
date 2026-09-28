/* ============================================================
   TradeLingo · Поведение ассетов кита (A01–A10)
   Каждый блок — самодостаточная функция инициализации.
   ============================================================ */

/* ---------- A01 · Кнопки: ripple + подсчёт кликов ---------- */
function initBtns() {
  document.querySelectorAll('.btn[data-rip]').forEach(function (b) {
    b.addEventListener('pointerdown', function (e) {
      var r = b.getBoundingClientRect();
      var d = document.createElement('span');
      d.className = 'ripple-dot';
      var size = Math.max(r.width, r.height);
      d.style.width = d.style.height = size + 'px';
      d.style.left = (e.clientX - r.left) + 'px';
      d.style.top = (e.clientY - r.top) + 'px';
      b.appendChild(d);
      setTimeout(function () { d.remove(); }, 560);
    });
  });
  document.querySelectorAll('.btn[data-count]').forEach(function (b) {
    var n = 0;
    b.addEventListener('click', function () {
      n++;
      b.querySelector('b').textContent = n;
      TL.floatText(b, '+' + n, '#58cc02');
    });
  });
}

/* ---------- A02 · XP-бар ---------- */
function initXpBar() {
  var root = document.getElementById('xp-demo');
  if (!root) return;
  var fill = root.querySelector('.fill');
  var val = root.querySelector('.v');
  var cur = 1320, max = 2480;
  var ticks = root.querySelector('.ticks');
  [25, 50, 75].forEach(function (p) {
    var t = document.createElement('i');
    t.style.left = p + '%';
    ticks.appendChild(t);
  });
  function render() {
    var p = Math.round(cur / max * 100);
    fill.style.width = p + '%';
    val.textContent = cur + ' / ' + max + ' XP';
  }
  render();
  root.querySelector('.xp-head button').addEventListener('click', function () {
    var add = 40 + Math.floor(Math.random() * 120);
    cur += add;
    var leveled = false;
    if (cur >= max) { cur = cur - max; leveled = true; }
    render();
    var bar = root.querySelector('.track');
    TL.floatText(bar, '+' + add + ' XP', '#8fe555');
    var r = bar.getBoundingClientRect();
    TL.confetti(r.left + r.width * (p / 100), r.top + r.height / 2, leveled ? 26 : 12);
    if (leveled) TL.toast('Новый уровень! Бонус +1 ключ', 'good', 'star');
  });
}

/* ---------- A03 · Карусель наград ---------- */
function initRewards() {
  var row = document.getElementById('reward-row');
  if (!row) return;
  row.querySelectorAll('.reward').forEach(function (r) {
    r.addEventListener('click', function () {
      if (r.classList.contains('claimed') || !r.classList.contains('today')) {
        TL.toast(r.classList.contains('claimed') ? 'Уже забрано' : 'Сначала пройди урок дня', 'bad', 'lock');
        return;
      }
      r.classList.remove('today');
      r.classList.add('claimed');
      TL.confettiAt(r, 22);
      TL.floatText(r, '+' + (r.dataset.val || '50'), '#ffc800');
      TL.toast('Награда дня получена!', 'good', 'gem');
      var next = row.querySelector('.reward:not(.claimed)');
      if (next) next.classList.add('today');
    });
  });
}

/* ---------- A04 · Монеты и гемы ---------- */
function initRes() {
  document.querySelectorAll('.res[data-add]').forEach(function (res) {
    var n = parseInt(res.dataset.n, 10);
    var step = parseInt(res.dataset.add, 10);
    var out = res.querySelector('b');
    res.addEventListener('click', function () {
      n += step;
      out.textContent = n.toLocaleString('ru-RU');
      res.classList.remove('bump');
      void res.offsetWidth;
      res.classList.add('bump');
      TL.floatText(res, '+' + step, res.dataset.color || '#ffc800');
    });
  });
}

/* ---------- A05 · Тумблеры ---------- */
function initToggles() {
  document.querySelectorAll('.toggle[data-demo]').forEach(function (t) {
    t.addEventListener('click', function () {
      var on = t.getAttribute('aria-checked') === 'true';
      t.setAttribute('aria-checked', String(!on));
      var msg = t.dataset.demo + ': ' + (!on ? 'вкл' : 'выкл');
      TL.toast(msg, !on ? 'good' : null, !on ? 'check' : 'minus');
    });
  });
}

/* ---------- A06 · Степпер ---------- */
function initSteppers() {
  document.querySelectorAll('.stepper[data-min]').forEach(function (s) {
    var v = parseInt(s.dataset.v, 10);
    var min = parseInt(s.dataset.min, 10);
    var max = parseInt(s.dataset.max, 10);
    var out = s.querySelector('.val');
    function render(dir) {
      out.textContent = v;
      if (dir) { out.classList.remove('up'); void out.offsetWidth; out.classList.add('up'); }
    }
    render();
    var minus = s.querySelector('[data-step="-1"]'), plus = s.querySelector('[data-step="1"]');
    minus.addEventListener('click', function () { if (v > min) { v--; render(-1); } else { TL.floatText(minus, 'мин', '#ff4b4b'); } });
    plus.addEventListener('click', function () { if (v < max) { v++; render(1); } else { TL.floatText(plus, 'макс', '#ffc800'); } });
  });
}

/* ---------- A07 · Модал покупки ---------- */
function initShopModal() {
  var scrim = document.getElementById('shop-modal');
  if (!scrim) return;
  var modal = scrim.querySelector('.modal');
  function open() { scrim.classList.add('open'); modal.focus(); }
  function close() { scrim.classList.remove('open'); }
  document.querySelectorAll('[data-open-shop]').forEach(function (b) { b.addEventListener('click', open); });
  scrim.addEventListener('click', function (e) { if (e.target === scrim) close(); });
  modal.querySelector('.m-x').addEventListener('click', close);
  modal.querySelector('.m-cancel').addEventListener('click', close);
  modal.querySelector('.m-buy').addEventListener('click', function () {
    close();
    TL.confetti(window.innerWidth / 2, window.innerHeight / 2, 30);
    TL.toast('«Удвоитель XP» активирован на 15 минут', 'good', 'gem');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && scrim.classList.contains('open')) close();
  });
}

/* ---------- A08 · Ленточки уровня ---------- */
function initRibbons() {
  document.querySelectorAll('.lv-ribbon[data-tap]').forEach(function (rb) {
    rb.addEventListener('click', function () {
      var f = rb.querySelector('.lv-fill');
      var x = rb.querySelector('.lv-xp');
      var p = parseInt(rb.dataset.p, 10);
      p = p >= 100 ? 12 : Math.min(100, p + 12);
      rb.dataset.p = p;
      f.style.width = p + '%';
      x.textContent = p * 24 + ' / 2400 XP';
      TL.floatText(rb.querySelector('.lv-badge'), 'LV↑', '#7fd4ff');
    });
  });
}

/* ---------- A09 · Неделя стрика ---------- */
function initWeek() {
  document.querySelectorAll('.wd.today').forEach(function (wd) {
    wd.addEventListener('click', function () {
      if (wd.classList.contains('done')) return;
      wd.classList.remove('today');
      wd.classList.add('done');
      wd.querySelector('.wd-ic').innerHTML = TL.I('fire', 20);
      TL.confettiAt(wd, 16);
      TL.toast('Стрик +1 день! Огонь растёт', 'good', 'fire');
    });
  });
}

/* ---------- A10 · Тосты ---------- */
function initToastDemo() {
  document.querySelectorAll('[data-toast]').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = b.dataset;
      TL.toast(d.toast, d.type || null, d.icon || null);
      if (d.type === 'good') TL.confettiAt(b, 12);
    });
  });
}

/* ---------- Запуск ---------- */
function initKit() {
  initBtns(); initXpBar(); initRewards(); initRes(); initToggles();
  initSteppers(); initShopModal(); initRibbons(); initWeek(); initToastDemo();
}
window.initKit = initKit;
