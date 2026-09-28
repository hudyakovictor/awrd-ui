/* ============================================================
   TradeLingo · Главная страница каталога (index)
   ============================================================ */

/* Фильтры категорий + поиск */
function initHome() {
  var grid = document.getElementById('cat-grid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.cat-card'));
  var search = document.getElementById('q');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));

  function apply() {
    var q = (search.value || '').trim().toLowerCase();
    var active = chips.filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; })
      .map(function (c) { return c.dataset.filter; });
    var shown = 0;
    cards.forEach(function (c) {
      var okF = !active.length || active.indexOf(c.dataset.tag) !== -1;
      var okQ = !q || (c.dataset.search || '').indexOf(q) !== -1;
      var show = okF && okQ;
      c.style.display = show ? '' : 'none';
      if (show) shown++;
    });
    var empty = document.getElementById('cat-empty');
    empty.style.display = shown ? 'none' : '';
    if (!shown) document.getElementById('cat-empty-q').textContent = q || '…';
  }

  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      apply();
    });
  });
  search.addEventListener('input', apply);
  apply();
}

/* Бегущая строка со сводкой */
function initMarqueeFill() {
  var m = document.getElementById('stat-marquee');
  if (!m) return;
  var items = [
    '30 интерактивных ассетов', '6 категорий', '0 растровых изображений',
    '100% CSS/SVG-графика', 'prefers-reduced-motion: ок', 'токены Duolingo-палитры',
    '5 редкостей карт', '10 врагов-ошибок', '3 босса риска', 'клавиатура: ок'
  ];
  var half = items.map(function (t) { return '<span class="mq-item">' + t + '</span><span class="mq-dot"></span>'; }).join('');
  m.innerHTML = half + half;
}

/* Hero-ракета: курсор с монеткой */
function initHeroFx() {
  var hero = document.querySelector('.hero');
  if (!hero || TL.reduced) return;
  var coin = document.getElementById('hero-coin');
  if (!coin) return;
  hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    var x = e.clientX - r.left, y = e.clientY - r.top;
    coin.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    coin.style.opacity = '.9';
  });
  hero.addEventListener('pointerleave', function () {
    coin.style.opacity = '0';
  });
  var cta = document.getElementById('cta-start');
  cta.addEventListener('click', function (e) {
    var r = cta.getBoundingClientRect();
    TL.confetti(r.left + r.width / 2, r.top, 30);
  });
}

/* Переключатель «дневной режим» для превью-полосы */
function initThemePeek() {
  var btn = document.getElementById('theme-peek');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var on = document.body.classList.toggle('light-peek');
    btn.setAttribute('aria-pressed', String(on));
    TL.toast(on ? 'Светлая тема (превью поверхностей)' : 'Тёмная тема', 'good', 'gear');
  });
}

document.addEventListener('DOMContentLoaded', function () {
  TL.reveal();
  TL.bindCopy();
  initKit();
  initCards();
  initJourney();
  initMarqueeFill();
  initHeroFx();
  initThemePeek();
  initHome();
  /* паттиман: анимация пунктирного пути */
  document.querySelectorAll('.mini-path path').forEach(function (p) {
    var len = p.getTotalLength ? p.getTotalLength() : 300;
    p.style.strokeDasharray = '2 10';
    p.style.strokeDashoffset = '0';
    p.animate(
      [{ strokeDashoffset: 0 }, { strokeDashoffset: -len }],
      { duration: 6000, iterations: Infinity, easing: 'linear' }
    );
  });
});
