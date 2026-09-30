(function platformModule(global) {
  'use strict';

  const ownScript = document.currentScript;
  const platformRoot = ownScript ? new URL('../', ownScript.src) : new URL('./', location.href);
  const routes = Array.isArray(global.ARENA_ROUTES) ? global.ARENA_ROUTES : [];
  const storagePrefix = 'arena:platform:';
  const telemetryPrefix = 'arena:events:';
  const maxEvents = 500;
  const maxRecent = 12;
  const state = {
    open: false,
    tab: 'search',
    query: '',
    cursor: 0,
    previousFocus: null,
    audit: null,
    preferences: {
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      feedback: true,
    },
    recent: [],
    favorites: [],
    sessionStarted: Date.now(),
  };

  const safeParse = (value, fallback) => {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (_) {
      return fallback;
    }
  };
  const load = (key, fallback) => safeParse(localStorage.getItem(storagePrefix + key), fallback);
  const save = (key, value) => {
    try {
      localStorage.setItem(storagePrefix + key, JSON.stringify(value));
      return true;
    } catch (_) {
      return false;
    }
  };
  const create = (tag, className, attributes) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    Object.entries(attributes || {}).forEach(([key, value]) => {
      if (key === 'text') node.textContent = value;
      else if (key === 'html') node.innerHTML = value;
      else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value);
    });
    return node;
  };
  const rootUrl = (relative) => new URL(relative, platformRoot).href;
  const routeUrl = (route) => rootUrl(route.route);
  const now = () => new Date().toISOString();
  const normalize = (value) => String(value || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const isEditable = (node) => node && (node.matches('input,textarea,select') || node.isContentEditable);
  const unique = (items) => Array.from(new Set(items));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function restoreState() {
    state.preferences = { ...state.preferences, ...load('preferences', {}) };
    state.recent = load('recent', []);
    state.favorites = load('favorites', []);
    applyPreferences();
  }

  function applyPreferences() {
    const html = document.documentElement;
    html.classList.toggle('arena-reduced-motion', state.preferences.reducedMotion);
    html.classList.toggle('arena-high-contrast', state.preferences.highContrast);
    html.classList.toggle('arena-large-text', state.preferences.largeText);
    html.dataset.feedback = state.preferences.feedback ? 'on' : 'off';
    save('preferences', state.preferences);
  }

  function announce(message, priority = 'polite') {
    let region = document.getElementById('arena-announcer');
    if (!region) {
      region = create('div', 'sr-only', {
        id: 'arena-announcer',
        'aria-live': priority,
        'aria-atomic': 'true',
      });
      document.body.append(region);
    }
    region.setAttribute('aria-live', priority);
    region.textContent = '';
    requestAnimationFrame(() => { region.textContent = message; });
  }

  function event(type, payload = {}) {
    const record = {
      type,
      payload,
      at: now(),
      path: location.pathname,
      title: document.title,
      sessionMs: Date.now() - state.sessionStarted,
    };
    const day = record.at.slice(0, 10);
    const key = telemetryPrefix + day;
    const events = safeParse(localStorage.getItem(key), []);
    events.push(record);
    while (events.length > maxEvents) events.shift();
    try { localStorage.setItem(key, JSON.stringify(events)); } catch (_) {}
    global.dispatchEvent(new CustomEvent('arena:telemetry', { detail: record }));
    return record;
  }

  function installSkipLink() {
    if (document.querySelector('.arena-skip')) return;
    const main = document.querySelector('main');
    if (!main) return;
    if (!main.id) main.id = 'main-content';
    const skip = create('a', 'arena-skip', { href: '#' + main.id, text: 'К основному содержанию' });
    document.body.prepend(skip);
  }

  function improveSemantics() {
    document.querySelectorAll('.tabs').forEach((tabs) => {
      if (!tabs.hasAttribute('role')) tabs.setAttribute('role', 'group');
    });
    document.querySelectorAll('.overlay').forEach(prepareDialog);
    document.querySelectorAll('.toast').forEach((toast) => toast.setAttribute('role', 'status'));
    document.querySelectorAll('button:not([type])').forEach((button) => button.type = 'button');
    document.querySelectorAll('a.tab').forEach((link) => {
      if (!link.getAttribute('aria-label') && link.textContent.trim() === '←') link.setAttribute('aria-label', 'Назад');
    });
    document.querySelectorAll('button.tab').forEach((button) => {
      if (!button.getAttribute('aria-label') && button.textContent.trim() === '×') button.setAttribute('aria-label', 'Закрыть');
    });
    document.querySelectorAll('input[type="range"]').forEach((range) => {
      if (!range.getAttribute('aria-valuetext')) range.setAttribute('aria-valuetext', range.value + (range.max === '95' ? '%' : ''));
      range.addEventListener('input', () => range.setAttribute('aria-valuetext', range.value + (range.max === '95' ? '%' : '')));
    });
  }

  function prepareDialog(overlay) {
    if (overlay.dataset.arenaDialog === 'ready') return;
    overlay.dataset.arenaDialog = 'ready';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    const heading = overlay.querySelector('.big,h1,h2,h3');
    if (heading) {
      if (!heading.id) heading.id = 'arena-dialog-title-' + Math.random().toString(36).slice(2, 9);
      overlay.setAttribute('aria-labelledby', heading.id);
    }
    requestAnimationFrame(() => {
      const target = overlay.querySelector('[data-close],button,input,textarea,a[href]');
      if (target) target.focus({ preventScroll: true });
    });
  }

  function observeDialogs() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches('.overlay')) prepareDialog(node);
        node.querySelectorAll?.('.overlay').forEach(prepareDialog);
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return observer;
  }

  function focusables(container) {
    return Array.from(container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'))
      .filter((node) => node.offsetParent !== null);
  }

  function trapFocus(event) {
    const dialog = document.querySelector('.arena-palette:not(.hidden),.overlay[role="dialog"]');
    if (!dialog || event.key !== 'Tab') return;
    const nodes = focusables(dialog);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function currentRoute() {
    const path = location.pathname.replace(/^\//, '');
    return routes.find((route) => path.endsWith(route.route));
  }

  function markRecent(route) {
    if (!route) return;
    state.recent = [route.id, ...state.recent.filter((id) => id !== route.id)].slice(0, maxRecent);
    save('recent', state.recent);
  }

  function toggleFavorite(routeId) {
    state.favorites = state.favorites.includes(routeId)
      ? state.favorites.filter((id) => id !== routeId)
      : [routeId, ...state.favorites];
    save('favorites', state.favorites);
    renderPalette();
    announce(state.favorites.includes(routeId) ? 'Добавлено в избранное' : 'Удалено из избранного');
  }

  function routeProgress(route) {
    const key = 'telemetry:' + route.code;
    const lowerKey = 'telemetry:' + route.code.toLowerCase();
    const complete = localStorage.getItem(key) || localStorage.getItem(lowerKey);
    const savedRoute = localStorage.getItem('route:' + route.code) || localStorage.getItem('route:' + route.code.toLowerCase());
    return complete ? 'complete' : savedRoute ? 'started' : 'new';
  }

  function progressSummary() {
    const summary = { complete: 0, started: 0, new: 0 };
    routes.forEach((route) => { summary[routeProgress(route)] += 1; });
    return summary;
  }

  function filteredRoutes() {
    const tokens = normalize(state.query).split(/\s+/).filter(Boolean);
    let list = routes.filter((route) => tokens.every((token) => normalize(route.searchText).includes(token)));
    if (!tokens.length) {
      const recent = state.recent.map((id) => routes.find((route) => route.id === id)).filter(Boolean);
      const favorites = state.favorites.map((id) => routes.find((route) => route.id === id)).filter(Boolean);
      list = unique([...favorites, ...recent, ...list]);
    }
    return list.slice(0, 40);
  }

  function buildPalette() {
    if (document.getElementById('arena-palette')) return;
    const openButton = create('button', 'arena-tools-button', {
      type: 'button',
      'aria-label': 'Открыть быстрое меню',
      'aria-keyshortcuts': 'Control+K Meta+K',
      html: '<span aria-hidden="true">⌘K</span>',
    });
    openButton.addEventListener('click', () => openPalette());
    document.body.append(openButton);

    const palette = create('section', 'arena-palette hidden', {
      id: 'arena-palette',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'arena-palette-title',
    });
    palette.innerHTML = `
      <div class="arena-palette-backdrop" data-palette-close></div>
      <div class="arena-palette-sheet">
        <header class="arena-palette-header">
          <div>
            <div class="label">БЫСТРОЕ МЕНЮ</div>
            <h2 id="arena-palette-title">Найти и продолжить</h2>
          </div>
          <button class="arena-icon-button" type="button" data-palette-close aria-label="Закрыть">×</button>
        </header>
        <nav class="arena-palette-tabs" aria-label="Разделы быстрого меню">
          <button type="button" data-palette-tab="search">Маршруты</button>
          <button type="button" data-palette-tab="progress">Прогресс</button>
          <button type="button" data-palette-tab="settings">Настройки</button>
          <button type="button" data-palette-tab="audit">QA</button>
        </nav>
        <div id="arena-palette-content"></div>
      </div>`;
    document.body.append(palette);
    palette.querySelectorAll('[data-palette-close]').forEach((node) => node.addEventListener('click', closePalette));
    palette.querySelectorAll('[data-palette-tab]').forEach((node) => node.addEventListener('click', () => {
      state.tab = node.dataset.paletteTab;
      state.cursor = 0;
      renderPalette();
    }));
  }

  function routeRow(route, index) {
    const progress = routeProgress(route);
    const favorite = state.favorites.includes(route.id);
    const selected = index === state.cursor;
    return `
      <div class="arena-route-row ${selected ? 'selected' : ''}" data-route-row="${index}">
        <a href="${routeUrl(route)}" data-route-id="${route.id}">
          <span class="arena-route-code">${route.code}</span>
          <span class="arena-route-copy">
            <b>${route.name}</b>
            <small>${route.suite} · ${Math.max(...route.decisions)} реш. · ${Math.max(...route.sources)} ист.</small>
          </span>
          <span class="arena-progress-dot ${progress}" aria-label="${progress}"></span>
        </a>
        <button type="button" class="arena-favorite" data-favorite="${route.id}" aria-label="${favorite ? 'Убрать из избранного' : 'Добавить в избранное'}">${favorite ? '★' : '☆'}</button>
      </div>`;
  }

  function searchView() {
    const list = filteredRoutes();
    return `
      <div class="arena-command-search">
        <label class="sr-only" for="arena-command-input">Поиск маршрута</label>
        <input id="arena-command-input" type="search" autocomplete="off" placeholder="Код, название или набор…" value="${state.query.replace(/"/g, '&quot;')}">
        <kbd>Esc</kbd>
      </div>
      <div class="arena-command-meta">
        <span>${list.length} результатов</span>
        <span>↑↓ выбрать · Enter открыть</span>
      </div>
      <div class="arena-route-results" role="listbox">${list.map(routeRow).join('') || '<div class="empty">Маршрут не найден</div>'}</div>
      <div class="arena-quick-links">
        <a href="${rootUrl('index.html')}">Все стенды</a>
        <a href="${rootUrl('route-index.html')}">Полный каталог</a>
        <button type="button" data-export>Экспорт прогресса</button>
      </div>`;
  }

  function progressView() {
    const summary = progressSummary();
    const percent = routes.length ? Math.round(summary.complete / routes.length * 100) : 0;
    const recent = state.recent.map((id) => routes.find((route) => route.id === id)).filter(Boolean).slice(0, 6);
    return `
      <div class="arena-progress-card">
        <div class="arena-progress-ring" style="--value:${percent}"><b>${percent}%</b></div>
        <div><div class="label">ЛОКАЛЬНЫЙ ПРОГРЕСС</div><h3>${summary.complete} завершено</h3><p>${summary.started} начато · ${summary.new} новых</p></div>
      </div>
      <div class="arena-stat-grid">
        <div><b>${state.favorites.length}</b><span>избранных</span></div>
        <div><b>${state.recent.length}</b><span>недавних</span></div>
        <div><b>${routes.length}</b><span>маршрутов</span></div>
      </div>
      <h3>Продолжить</h3>
      <div class="arena-route-results">${recent.map(routeRow).join('') || '<div class="empty">Откройте первый маршрут — он появится здесь.</div>'}</div>
      <button class="secondary" type="button" data-clear-progress>Очистить локальный прогресс</button>`;
  }

  function preferenceRow(key, title, description) {
    const checked = state.preferences[key];
    return `
      <label class="arena-setting-row">
        <span><b>${title}</b><small>${description}</small></span>
        <input type="checkbox" data-preference="${key}" ${checked ? 'checked' : ''}>
      </label>`;
  }

  function settingsView() {
    return `
      <div class="arena-settings">
        ${preferenceRow('reducedMotion', 'Меньше движения', 'Убирает декоративные переходы и анимации.')}
        ${preferenceRow('highContrast', 'Высокий контраст', 'Усиливает границы и вторичный текст.')}
        ${preferenceRow('largeText', 'Крупный текст', 'Увеличивает базовый размер без зума страницы.')}
        ${preferenceRow('feedback', 'Обратная связь', 'Разрешает визуальные, звуковые и тактильные сигналы.')}
      </div>
      <div class="card soft">
        <b>Приватность</b>
        <p>Прогресс и события хранятся только в этом браузере. Сетевой отправки нет.</p>
      </div>`;
  }

  function auditView() {
    const report = state.audit || (global.ArenaAudit ? global.ArenaAudit.run() : null);
    state.audit = report;
    if (!report) return '<div class="empty">Модуль QA недоступен.</div>';
    const { summary, results } = report;
    return `
      <div class="arena-audit-score">
        <strong>${summary.score}</strong>
        <div><div class="label">ТЕКУЩИЙ ЭКРАН</div><b>${summary.counts.pass} pass · ${summary.counts.warn} warn · ${summary.counts.fail} fail</b></div>
      </div>
      <div class="arena-audit-list">${results.map((item) => `
        <div class="arena-audit-row ${item.status}">
          <span>${item.status === 'pass' ? '✓' : item.status === 'fail' ? '!' : '·'}</span>
          <div><b>${item.title}</b><small>${item.detail}</small></div>
        </div>`).join('')}</div>
      <button type="button" class="secondary" data-rerun-audit>Запустить повторно</button>`;
  }

  function renderPalette() {
    const palette = document.getElementById('arena-palette');
    if (!palette) return;
    palette.querySelectorAll('[data-palette-tab]').forEach((node) => {
      const active = node.dataset.paletteTab === state.tab;
      node.classList.toggle('active', active);
      node.setAttribute('aria-current', active ? 'page' : 'false');
    });
    const content = palette.querySelector('#arena-palette-content');
    content.innerHTML = state.tab === 'search' ? searchView()
      : state.tab === 'progress' ? progressView()
      : state.tab === 'settings' ? settingsView()
      : auditView();
    bindPaletteContent(content);
  }

  function bindPaletteContent(content) {
    const input = content.querySelector('#arena-command-input');
    if (input) {
      input.addEventListener('input', () => {
        state.query = input.value;
        state.cursor = 0;
        renderPalette();
        requestAnimationFrame(() => {
          const next = document.querySelector('#arena-command-input');
          if (next) {
            next.focus();
            next.setSelectionRange(next.value.length, next.value.length);
          }
        });
      });
      input.addEventListener('keydown', commandKeydown);
      requestAnimationFrame(() => input.focus());
    }
    content.querySelectorAll('[data-route-id]').forEach((link) => link.addEventListener('click', () => {
      const route = routes.find((item) => item.id === link.dataset.routeId);
      markRecent(route);
      event('route_opened', { routeId: link.dataset.routeId });
    }));
    content.querySelectorAll('[data-favorite]').forEach((button) => button.addEventListener('click', () => toggleFavorite(button.dataset.favorite)));
    content.querySelectorAll('[data-preference]').forEach((input) => input.addEventListener('change', () => {
      state.preferences[input.dataset.preference] = input.checked;
      applyPreferences();
      event('preference_changed', { key: input.dataset.preference, value: input.checked });
    }));
    content.querySelector('[data-export]')?.addEventListener('click', exportData);
    content.querySelector('[data-clear-progress]')?.addEventListener('click', clearProgress);
    content.querySelector('[data-rerun-audit]')?.addEventListener('click', () => {
      state.audit = global.ArenaAudit ? global.ArenaAudit.run() : null;
      renderPalette();
    });
  }

  function commandKeydown(eventObject) {
    const list = filteredRoutes();
    if (eventObject.key === 'ArrowDown') {
      eventObject.preventDefault();
      state.cursor = clamp(state.cursor + 1, 0, Math.max(0, list.length - 1));
      renderPalette();
    }
    if (eventObject.key === 'ArrowUp') {
      eventObject.preventDefault();
      state.cursor = clamp(state.cursor - 1, 0, Math.max(0, list.length - 1));
      renderPalette();
    }
    if (eventObject.key === 'Enter' && list[state.cursor]) {
      eventObject.preventDefault();
      markRecent(list[state.cursor]);
      location.href = routeUrl(list[state.cursor]);
    }
  }

  function openPalette(tab = 'search') {
    const palette = document.getElementById('arena-palette');
    if (!palette) return;
    state.previousFocus = document.activeElement;
    state.open = true;
    state.tab = tab;
    state.audit = null;
    palette.classList.remove('hidden');
    document.body.classList.add('arena-palette-open');
    renderPalette();
    event('palette_opened', { tab });
  }

  function closePalette() {
    const palette = document.getElementById('arena-palette');
    if (!palette || !state.open) return;
    state.open = false;
    palette.classList.add('hidden');
    document.body.classList.remove('arena-palette-open');
    state.previousFocus?.focus?.();
    event('palette_closed');
  }

  function exportData() {
    const data = {};
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('arena:') || key.startsWith('route:') || key.startsWith('telemetry:') || key.startsWith('sa')) data[key] = localStorage.getItem(key);
    });
    const blob = new Blob([JSON.stringify({ exportedAt: now(), data }, null, 2)], { type: 'application/json' });
    const link = create('a', '', { href: URL.createObjectURL(blob), download: 'signal-arena-progress.json' });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    announce('Прогресс экспортирован');
    event('progress_exported', { keys: Object.keys(data).length });
  }

  function clearProgress() {
    const confirmed = global.confirm('Удалить локальный прогресс и телеметрию? Это действие нельзя отменить.');
    if (!confirmed) return;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('route:') || key.startsWith('telemetry:') || key.startsWith('sa38:') || key === 'sa46:last') localStorage.removeItem(key);
    });
    state.recent = [];
    save('recent', []);
    renderPalette();
    announce('Локальный прогресс очищен');
    event('progress_cleared');
  }

  function installKeyboard() {
    document.addEventListener('keydown', (eventObject) => {
      const command = (eventObject.ctrlKey || eventObject.metaKey) && eventObject.key.toLowerCase() === 'k';
      const slash = eventObject.key === '/' && !isEditable(eventObject.target);
      if (command || slash) {
        eventObject.preventDefault();
        state.open ? closePalette() : openPalette('search');
      }
      if (eventObject.key === 'Escape') {
        if (state.open) closePalette();
        else {
          const overlay = document.querySelector('.overlay');
          const close = overlay?.querySelector('[data-close],[data-x]');
          if (close) close.click();
        }
      }
      trapFocus(eventObject);
    });
  }

  function installTelemetry() {
    document.addEventListener('click', (eventObject) => {
      const target = eventObject.target.closest('button,a,[data-code],[data-unit],[data-a],[data-action]');
      if (!target) return;
      event('interaction', {
        kind: target.tagName.toLowerCase(),
        label: (target.getAttribute('aria-label') || target.textContent || '').trim().slice(0, 80),
        action: target.dataset.a || target.dataset.action || target.dataset.code || target.dataset.unit || null,
      });
    }, { capture: true });
    document.addEventListener('change', (eventObject) => {
      const target = eventObject.target;
      if (!target.matches('input,select,textarea')) return;
      event('control_changed', {
        type: target.type || target.tagName.toLowerCase(),
        id: target.id || null,
        value: target.type === 'password' ? '[redacted]' : String(target.value).slice(0, 80),
      });
    });
    global.addEventListener('pagehide', () => event('page_hidden', { duration: Date.now() - state.sessionStarted }));
  }

  function installNetworkStatus() {
    const update = () => {
      document.documentElement.dataset.network = navigator.onLine ? 'online' : 'offline';
      if (!navigator.onLine) announce('Нет сети. Локальные задания продолжают работать.', 'assertive');
    };
    global.addEventListener('online', update);
    global.addEventListener('offline', update);
    update();
  }

  function installResume() {
    const route = currentRoute();
    if (route) markRecent(route);
    const firstPrimary = document.querySelector('.primary');
    if (firstPrimary && !firstPrimary.hasAttribute('aria-describedby')) {
      const hint = create('span', 'sr-only', { id: 'arena-primary-hint', text: 'Основное действие текущего шага' });
      firstPrimary.after(hint);
      firstPrimary.setAttribute('aria-describedby', hint.id);
    }
  }

  function runAuditLater() {
    if (!global.ArenaAudit) return;
    const run = () => {
      state.audit = global.ArenaAudit.run();
      document.documentElement.dataset.auditScore = state.audit.summary.score;
    };
    if ('requestIdleCallback' in global) requestIdleCallback(run, { timeout: 1500 });
    else setTimeout(run, 300);
  }

  function init() {
    restoreState();
    installSkipLink();
    improveSemantics();
    observeDialogs();
    buildPalette();
    installKeyboard();
    installTelemetry();
    installNetworkStatus();
    installResume();
    runAuditLater();
    event('page_opened', { routesAvailable: routes.length });
    document.documentElement.dataset.arenaPlatform = 'ready';
  }

  global.ArenaPlatform = {
    state,
    init,
    open: openPalette,
    close: closePalette,
    announce,
    event,
    exportData,
    runAudit: () => global.ArenaAudit?.run(),
    routes,
    routeUrl,
    progressSummary,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(window);
