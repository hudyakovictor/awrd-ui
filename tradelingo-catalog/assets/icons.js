/* ============================================================
   TradeLingo · Иконки (SVG, stroke=currentColor) + микро-VFX
   - TL.I(name, size)  -> svg-строка иконки
   - TL.art(kind)      -> декоративная SVG-артка для карт
   - TL.floatText(el, text, color)          -> всплывающий текст
   - TL.confetti(x, y, n, colors)           -> конфетти-бёрст
   - TL.toast(msg, type)                    -> игровой тост
   - TL.reveal()        -> staggered walk-in для [data-anim]
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Иконки: монолиния 1.8px, viewBox 24 ---------- */
  var P = {
    bolt:    '<path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z"/>',
    chart:   '<path d="M4 19V5"/><path d="M4 19h16"/><path d="M7 15l3.5-4 3 2.5L18 8"/>',
    candles: '<path d="M7 8v10M7 8l-1.5 1.5M7 8l1.5 1.5M7 18l-1.5-1.5M7 18l1.5-1.5"/><rect x="5" y="10" width="4" height="6" rx="1"/><path d="M17 4v12M17 4l-1.5 1.5M17 4l1.5 1.5M17 16l-1.5-1.5M17 16l1.5-1.5"/><rect x="15" y="7" width="4" height="6" rx="1"/>',
    book:    '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z"/><path d="M20 18v3H6.5A2.5 2.5 0 0 1 4 18.5"/><path d="M9 8h7M9 11.5h5"/>',
    swords:  '<path d="m14.5 14.5 5-5V4h-5.5l-5 5"/><path d="m9.5 9.5-5.5 5.5L6 17l2-1 5.5-5.5"/><path d="m3 21 4-4M21 21l-4-4"/><path d="m12 15 2 2M15 12l2 2"/>',
    shop:    '<path d="M4 8h16l-1 12a1.5 1.5 0 0 1-1.5 1.4h-11A1.5 1.5 0 0 1 5 20L4 8Z"/><path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2"/>',
    play:    '<path d="M7 4.8v14.4a.8.8 0 0 0 1.2.7l11.4-7.2a.8.8 0 0 0 0-1.4L8.2 4.1a.8.8 0 0 0-1.2.7Z"/>',
    check:   '<path d="m4.5 12.5 5 5 10-11"/>',
    cross:   '<path d="m6 6 12 12M18 6 6 18"/>',
    arrowL:  '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    arrowR:  '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowU:  '<path d="M12 19V5M6 11l6-6 6 6"/>',
    arrowD:  '<path d="M12 5v14M6 13l6 6 6-6"/>',
    star:    '<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6L12 16.7l-5.4 2.9 1.1-6L3.2 9.4l6.1-.8L12 3Z"/>',
    coin:    '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.5 9.8c0-1.2 1.1-1.8 2.5-1.8s2.5.6 2.5 1.7c0 2.5-5 1.6-5 4.1 0 1.1 1.1 1.8 2.5 1.8s2.5-.7 2.5-1.8"/>',
    heart:   '<path d="M12 20.5S4 15 4 9.6C4 7 6 5 8.4 5c1.5 0 2.9.8 3.6 2 .7-1.2 2.1-2 3.6-2C18 5 20 7 20 9.6c0 5.4-8 10.9-8 10.9Z"/>',
    lock:    '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/><circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none"/>',
    search:  '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.8-3.8"/>',
    filter:  '<path d="M4 6h16M7 12h10M10 18h4"/>',
    grid:    '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    info:    '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="8" r="1.2" fill="currentColor" stroke="none"/>',
    bell:    '<path d="M6 9.5a6 6 0 0 1 12 0c0 5 1.8 6 1.8 6H4.2S6 14.5 6 9.5Z"/><path d="M10 19a2.2 2.2 0 0 0 4 0"/>',
    fire:    '<path d="M12 21c4 0 6.5-2.6 6.5-6.2 0-3.1-2-5.3-3.6-7.3C13.5 5.7 12.7 3.7 13 2c-3 1.4-4 4.2-3.7 6.6-.9-.4-1.6-1.2-2-2.4C5.9 7.8 5.5 9.8 5.5 12c0 5.4 2.9 9 6.5 9Z"/><path d="M12 21c-1.9 0-3-1.6-3-3.4 0-1.9 1.3-3 3-4.6 1.7 1.6 3 2.7 3 4.6 0 1.8-1.1 3.4-3 3.4Z"/>',
    gem:     '<path d="M7 4h10l4 5.5L12 21 3 9.5 7 4Z"/><path d="M3 9.5h18M9.5 4 8 9.5l4 11 4-11L14.5 4"/>',
    crown:   '<path d="m3 8 4.5 3L12 4l4.5 7L21 8l-1.6 10.5H4.6L3 8Z"/><path d="M5 21h14"/>',
    target:  '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
    brain:   '<path d="M9.5 3.5A3 3 0 0 0 6.6 7 3.2 3.2 0 0 0 4 10.2c0 1.1.5 2 1.3 2.6A3.4 3.4 0 0 0 7 19c.9 0 1.8-.4 2.5-1V3.5Z"/><path d="M14.5 3.5A3 3 0 0 1 17.4 7 3.2 3.2 0 0 1 20 10.2c0 1.1-.5 2-1.3 2.6A3.4 3.4 0 0 1 17 19c-.9 0-1.8-.4-2.5-1V3.5Z"/><path d="M12 3v17"/>',
    eye:     '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    clock:   '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.4 2"/>',
    flag:    '<path d="M5 21V4"/><path d="M5 5c4.5-2.2 7 2.2 14 0v9c-7 2.2-9.5-2.2-14 0"/>',
    gear:    '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8 13 5.3a7 7 0 0 1 2.2.9l2.4-1 1.7 1.7-1 2.4c.4.7.7 1.4.9 2.2l2.5 1v2.4l-2.5 1a7 7 0 0 1-.9 2.2l1 2.4-1.7 1.7-2.4-1a7 7 0 0 1-2.2.9l-1 2.5h-2.4l-1-2.5a7 7 0 0 1-2.2-.9l-2.4 1-1.7-1.7 1-2.4a7 7 0 0 1-.9-2.2l-2.5-1v-2.4l2.5-1c.2-.8.5-1.5.9-2.2l-1-2.4L6.4 5.2l2.4 1c.7-.4 1.4-.7 2.2-.9l1-2.5h2.4Z"/>',
    shield:  '<path d="M12 2.8 19.5 6v6c0 4.8-3.2 8-7.5 9.2C7.7 20 4.5 16.8 4.5 12V6L12 2.8Z"/><path d="m8.8 11.8 2.3 2.3 4.3-4.6"/>',
    mask:    '<path d="M4 5.5C4 4.7 4.7 4 5.5 4h13c.8 0 1.5.7 1.5 1.5V12a8 8 0 0 1-16 0V5.5Z"/><path d="M8.5 9.5h.01M15.5 9.5h.01"/><path d="M8.5 14c1 .9 2.2 1.4 3.5 1.4s2.5-.5 3.5-1.4"/>',
    spiral:  '<path d="M12 12c.8-.8 2-.5 2.4.4.5 1.2-.4 2.6-1.9 2.8-2 .3-3.8-1.3-4-3.5C8.2 8.6 10.5 6.4 13.5 6.7c3.6.4 6.1 3.5 5.7 7.1"/><path d="M19.2 13.8c.6 4-2.4 7.4-6.6 7.7C7.6 22 3.4 18 3.2 12.7"/>',
    wallet:  '<rect x="3" y="6.5" width="18" height="13" rx="3"/><path d="M3 10h18M16.5 15h.01"/>',
    users:   '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.8 20c.6-3.3 3.1-5 6.2-5s5.6 1.7 6.2 5"/><circle cx="17.5" cy="9.5" r="2.6"/><path d="M16.4 15.2c2.8.2 4.5 1.7 4.9 4.3"/>',
    scroll:  '<path d="M7 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7"/><path d="M7 4a2 2 0 0 0-2 2v12.5A1.5 1.5 0 0 1 3.5 20 1.5 1.5 0 0 0 5 21.5h9.5A1.5 1.5 0 0 0 16 20V6a2 2 0 0 0-2-2"/><path d="M9.5 9h5M9.5 12.5h5"/>',
    dice:    '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.15" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.15" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.15" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.15" fill="currentColor" stroke="none"/>',
    cursor:  '<path d="M5.5 3.5 19 10.8l-5.9 1.6-2.4 5.7L5.5 3.5Z"/><path d="m13.5 13.5 5 5"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 3v5h-5"/>',
    cart:    '<path d="M3 4h2.5l2.3 11.2A2 2 0 0 0 9.8 17h8.4a2 2 0 0 0 2-1.6L21.5 8H6"/><circle cx="10" cy="20.4" r="1.4"/><circle cx="17.5" cy="20.4" r="1.4"/>',
    trophy:  '<path d="M8 4h8v6.5a4 4 0 0 1-8 0V4Z"/><path d="M8 5.5H4.5V8a3 3 0 0 0 3.6 3M16 5.5h3.5V8a3 3 0 0 1-3.6 3"/><path d="M12 14.5V18M8.5 21h7M9.5 18h5"/>',
    volume:  '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.8a7.5 7.5 0 0 1 0 10.4"/>',
    plus:    '<path d="M12 5v14M5 12h14"/>',
    minus:   '<path d="M5 12h14"/>',
    copy:    '<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M5.5 15.5h-1a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'
  };

  function I(name, size) {
    var d = P[name] || P.info;
    var s = size || 20;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }
  function ic(name, size) { return I(name, size).replace('<svg ', '<svg class="ic" '); }

  /* ---------- Декоративная артка карт ---------- */
  var ART = {
    bull: '<path d="M6 9 12 3.5 18 9v9.5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9Z" fill="{c1}"/><path d="M9.5 15.5 12 13l2.5 2.5" stroke="{c2}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    wave: '<rect x="4" y="4" width="16" height="16" rx="4" fill="{c1}"/><path d="M7 14c1.6-3 3.2-3 4.6-.6 1.3 2.2 3 1.8 4.4-1" stroke="{c2}" stroke-width="1.9" fill="none" stroke-linecap="round"/>',
    coin: '<circle cx="12" cy="12" r="8" fill="{c1}"/><circle cx="12" cy="12" r="8" fill="none" stroke="{c2}" stroke-width="1.6" stroke-dasharray="2.5 3"/><path d="M12 8v8M9.5 10.2c0-1 1.1-1.5 2.5-1.5s2.5.5 2.5 1.4c0 2.1-5 1.4-5 3.5 0 .9 1.1 1.5 2.5 1.5s2.5-.6 2.5-1.5" stroke="{c2}" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
    spark: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3Z" fill="{c1}"/><circle cx="18" cy="17.5" r="2.2" fill="{c2}"/>'
  };
  function art(kind, c1, c2, size) {
    var body = (ART[kind] || ART.coin).split('{c1}').join(c1).split('{c2}').join(c2);
    return '<svg width="' + (size || 40) + '" height="' + (size || 40) + '" viewBox="0 0 24 24" aria-hidden="true">' + body + '</svg>';
  }

  /* ---------- Микро-VFX ---------- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function floatText(el, text, color) {
    if (!el || reduced) return;
    var host = el.classList.contains('fx-host') ? el : (el.querySelector('.fx-host') || el);
    var prev = host.style.position;
    if (!prev || prev === 'static') host.style.position = 'relative';
    var r = host.getBoundingClientRect();
    var f = document.createElement('div');
    f.className = 'float-text';
    f.textContent = text;
    f.style.left = (r.width / 2) + 'px';
    f.style.top = Math.max(8, r.height * 0.18) + 'px';
    f.style.color = color || '#58cc02';
    host.appendChild(f);
    setTimeout(function () { f.remove(); }, 950);
  }

  var CONF_COLORS = ['#58cc02', '#1cb0f5', '#ffc800', '#ff4b4b', '#ce82ff', '#ffffff'];
  function confetti(x, y, n, colors) {
    if (reduced) return;
    n = n || 18;
    var set = colors || CONF_COLORS;
    for (var i = 0; i < n; i++) {
      (function () {
        var p = document.createElement('i');
        p.className = 'confetti-piece';
        var c = set[Math.floor(Math.random() * set.length)];
        p.style.background = c;
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        document.body.appendChild(p);
        var ang = Math.random() * Math.PI * 2;
        var v = 60 + Math.random() * 130;
        var dx = Math.cos(ang) * v, dy = Math.sin(ang) * v - 90;
        var rot = (Math.random() * 540 - 270);
        p.animate([
          { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
          { transform: 'translate(' + dx * 0.7 + 'px,' + (dy + 60) + 'px) rotate(' + rot * 0.6 + 'deg) scale(1)', opacity: 1, offset: 0.6 },
          { transform: 'translate(' + dx + 'px,' + (dy + 320) + 'px) rotate(' + rot + 'deg) scale(.6)', opacity: 0 }
        ], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,0,0,1)' }).onfinish = function () { p.remove(); };
      })();
    }
  }

  function confettiAt(el, n) {
    var r = el.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height / 2, n);
  }

  function toast(msg, type, iconName) {
    var layer = document.querySelector('.toast-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'toast-layer';
      layer.setAttribute('role', 'status');
      layer.setAttribute('aria-live', 'polite');
      document.body.appendChild(layer);
    }
    var t = document.createElement('div');
    t.className = 'toast' + (type ? ' ' + type : '');
    t.innerHTML = (iconName ? ic(iconName, 17) : ic(type === 'bad' ? 'cross' : 'check', 17)) + '<span>' + msg + '</span>';
    layer.appendChild(t);
    setTimeout(function () { t.classList.add('bye'); }, 2100);
    setTimeout(function () { t.remove(); }, 2400);
    while (layer.children.length > 3) layer.firstChild.remove();
  }

  /* ---------- Staggered walk-in ---------- */
  function reveal() {
    var els = document.querySelectorAll('[data-anim]');
    if (reduced) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var sibs = Array.prototype.slice.call(el.parentElement.children).filter(function (c) { return c.hasAttribute('data-anim'); });
        var idx = Math.max(0, sibs.indexOf(el));
        el.style.transitionDelay = Math.min(idx * 55, 440) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* data-copy: клик копирует текст */
  function bindCopy(root) {
    (root || document).querySelectorAll('[data-copy]').forEach(function (b) {
      b.addEventListener('click', function () {
        var txt = b.getAttribute('data-copy');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(function () { toast('ID скопирован', 'good', 'copy'); });
        } else { toast('ID: ' + txt, null, 'copy'); }
      });
    });
  }

  window.TL = { I: I, ic: ic, art: art, floatText: floatText, confetti: confetti, confettiAt: confettiAt, toast: toast, reveal: reveal, bindCopy: bindCopy, reduced: reduced };
})();
