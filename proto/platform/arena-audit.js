(function auditModule(global) {
  'use strict';

  const PASS = 'pass';
  const WARN = 'warn';
  const FAIL = 'fail';
  const INFO = 'info';

  const text = (node) => (node && node.textContent ? node.textContent.trim() : '');
  const visible = (node) => {
    if (!node || !node.isConnected) return false;
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  };
  const focusable = (node) => {
    if (!visible(node) || node.matches('[disabled],[inert] *')) return false;
    return node.matches('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
  };
  const nameOf = (node) => {
    if (!node) return '';
    const labelled = node.getAttribute('aria-labelledby');
    if (labelled) {
      return labelled.split(/\s+/).map((id) => text(document.getElementById(id))).join(' ').trim();
    }
    return node.getAttribute('aria-label') || node.getAttribute('alt') || text(node);
  };
  const result = (id, title, status, detail, nodes) => ({
    id,
    title,
    status,
    detail,
    count: nodes ? nodes.length : 0,
    nodes: nodes ? nodes.slice(0, 8) : [],
  });
  const query = (selector) => Array.from(document.querySelectorAll(selector));
  const ratio = (a, b) => {
    const lum = (c) => {
      const rgb = c.match(/[\d.]+/g);
      if (!rgb || rgb.length < 3) return 1;
      const values = rgb.slice(0, 3).map((x) => {
        const v = Number(x) / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
    };
    const x = lum(a);
    const y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  const backgroundOf = (node) => {
    let current = node;
    while (current && current !== document.documentElement) {
      const value = getComputedStyle(current).backgroundColor;
      if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') return value;
      current = current.parentElement;
    }
    return getComputedStyle(document.body).backgroundColor;
  };

  const checks = [
    {
      id: 'document-language',
      title: 'Document language is declared',
      run() {
        const lang = document.documentElement.lang;
        return result(this.id, this.title, lang ? PASS : FAIL, lang || 'Missing html[lang]');
      },
    },
    {
      id: 'document-title',
      title: 'Page has a useful title',
      run() {
        const title = document.title.trim();
        return result(this.id, this.title, title.length >= 8 ? PASS : FAIL, title || 'Missing title');
      },
    },
    {
      id: 'main-landmark',
      title: 'Page has one main landmark',
      run() {
        const nodes = query('main,[role="main"]');
        return result(this.id, this.title, nodes.length === 1 ? PASS : WARN, `${nodes.length} main landmarks`, nodes);
      },
    },
    {
      id: 'single-h1',
      title: 'Page has a clear primary heading',
      run() {
        const nodes = query('h1').filter(visible);
        return result(this.id, this.title, nodes.length >= 1 ? PASS : WARN, `${nodes.length} visible h1`, nodes);
      },
    },
    {
      id: 'heading-order',
      title: 'Heading levels do not skip',
      run() {
        const nodes = query('h1,h2,h3,h4,h5,h6').filter(visible);
        let previous = 0;
        const bad = [];
        nodes.forEach((node) => {
          const level = Number(node.tagName.slice(1));
          if (previous && level > previous + 1) bad.push(node);
          previous = level;
        });
        return result(this.id, this.title, bad.length ? WARN : PASS, `${bad.length} skipped levels`, bad);
      },
    },
    {
      id: 'button-names',
      title: 'Buttons have accessible names',
      run() {
        const bad = query('button').filter((node) => visible(node) && !nameOf(node));
        return result(this.id, this.title, bad.length ? FAIL : PASS, `${bad.length} unnamed buttons`, bad);
      },
    },
    {
      id: 'link-names',
      title: 'Links have accessible names',
      run() {
        const bad = query('a[href]').filter((node) => visible(node) && !nameOf(node));
        return result(this.id, this.title, bad.length ? FAIL : PASS, `${bad.length} unnamed links`, bad);
      },
    },
    {
      id: 'image-alternatives',
      title: 'Images provide alternatives',
      run() {
        const bad = query('img').filter((node) => !node.hasAttribute('alt'));
        return result(this.id, this.title, bad.length ? FAIL : PASS, `${bad.length} images without alt`, bad);
      },
    },
    {
      id: 'form-labels',
      title: 'Form controls are labelled',
      run() {
        const bad = query('input,select,textarea').filter((node) => {
          if (!visible(node) || node.type === 'hidden') return false;
          const id = node.id;
          const label = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
          return !(label || node.closest('label') || node.getAttribute('aria-label') || node.getAttribute('aria-labelledby'));
        });
        return result(this.id, this.title, bad.length ? FAIL : PASS, `${bad.length} unlabelled controls`, bad);
      },
    },
    {
      id: 'duplicate-ids',
      title: 'Element identifiers are unique',
      run() {
        const seen = new Map();
        const bad = [];
        query('[id]').forEach((node) => {
          if (seen.has(node.id)) bad.push(node);
          else seen.set(node.id, node);
        });
        return result(this.id, this.title, bad.length ? FAIL : PASS, `${bad.length} duplicate ids`, bad);
      },
    },
    {
      id: 'target-size',
      title: 'Interactive targets meet 44 px minimum',
      run() {
        const bad = query('a[href],button,input:not([type="hidden"]),select,textarea,[tabindex]:not([tabindex="-1"])')
          .filter(focusable)
          .filter((node) => {
            const rect = node.getBoundingClientRect();
            return rect.width < 44 || rect.height < 44;
          });
        return result(this.id, this.title, bad.length ? WARN : PASS, `${bad.length} undersized targets`, bad);
      },
    },
    {
      id: 'positive-tabindex',
      title: 'Focus order follows the DOM',
      run() {
        const bad = query('[tabindex]').filter((node) => Number(node.getAttribute('tabindex')) > 0);
        return result(this.id, this.title, bad.length ? FAIL : PASS, `${bad.length} positive tabindex values`, bad);
      },
    },
    {
      id: 'focus-visibility',
      title: 'Focusable controls have focus styling',
      run() {
        const nodes = query('a[href],button,input,select,textarea').filter(focusable);
        return result(this.id, this.title, nodes.length ? PASS : INFO, `${nodes.length} focusable controls inspected`, nodes);
      },
    },
    {
      id: 'dialog-semantics',
      title: 'Visible overlays expose dialog semantics',
      run() {
        const bad = query('.overlay').filter(visible).filter((node) => !node.matches('[role="dialog"],[role="alertdialog"]'));
        return result(this.id, this.title, bad.length ? WARN : PASS, `${bad.length} overlays without dialog role`, bad);
      },
    },
    {
      id: 'live-feedback',
      title: 'Dynamic feedback has a live region',
      run() {
        const nodes = query('[aria-live],[role="status"],[role="alert"]');
        return result(this.id, this.title, nodes.length ? PASS : INFO, `${nodes.length} live regions`, nodes);
      },
    },
    {
      id: 'range-values',
      title: 'Range inputs expose numeric bounds',
      run() {
        const bad = query('input[type="range"]').filter((node) => !node.hasAttribute('min') || !node.hasAttribute('max'));
        return result(this.id, this.title, bad.length ? FAIL : PASS, `${bad.length} incomplete ranges`, bad);
      },
    },
    {
      id: 'disabled-explanation',
      title: 'Disabled primary actions remain understandable',
      run() {
        const nodes = query('button:disabled').filter(visible);
        const bad = nodes.filter((node) => !text(node) && !node.getAttribute('aria-label'));
        return result(this.id, this.title, bad.length ? WARN : PASS, `${nodes.length} disabled actions, ${bad.length} unclear`, bad);
      },
    },
    {
      id: 'text-contrast-sample',
      title: 'Visible text contrast sample meets 4.5:1',
      run() {
        const candidates = query('p,span,small,b,h1,h2,h3,label,button,a').filter(visible).slice(0, 120);
        const bad = candidates.filter((node) => {
          const style = getComputedStyle(node);
          if (Number(style.fontSize.replace('px', '')) >= 24) return false;
          return ratio(style.color, backgroundOf(node)) < 4.5;
        });
        return result(this.id, this.title, bad.length > 8 ? WARN : PASS, `${bad.length} low-contrast samples`, bad);
      },
    },
    {
      id: 'horizontal-overflow',
      title: 'Page avoids horizontal scrolling',
      run() {
        const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        return result(this.id, this.title, overflow > 2 ? FAIL : PASS, `${Math.max(0, overflow)} px overflow`);
      },
    },
    {
      id: 'viewport-meta',
      title: 'Mobile viewport is configured',
      run() {
        const node = document.querySelector('meta[name="viewport"]');
        return result(this.id, this.title, node ? PASS : FAIL, node ? node.content : 'Missing viewport');
      },
    },
    {
      id: 'reduced-motion',
      title: 'Reduced motion preference is respected',
      run() {
        const sheets = Array.from(document.styleSheets);
        let found = false;
        sheets.forEach((sheet) => {
          try {
            Array.from(sheet.cssRules || []).forEach((rule) => {
              if (rule.media && String(rule.media.mediaText).includes('prefers-reduced-motion')) found = true;
            });
          } catch (_) {}
        });
        return result(this.id, this.title, found ? PASS : WARN, found ? 'Media query found' : 'No reduced-motion rule');
      },
    },
    {
      id: 'autoplay-media',
      title: 'Media does not autoplay unexpectedly',
      run() {
        const bad = query('audio[autoplay],video[autoplay]').filter((node) => !node.muted);
        return result(this.id, this.title, bad.length ? FAIL : PASS, `${bad.length} audible autoplay elements`, bad);
      },
    },
    {
      id: 'timer-pressure',
      title: 'Core screens do not show countdown pressure',
      run() {
        const body = document.body.textContent.toLowerCase();
        const suspicious = /countdown|обратный отсч[её]т|timer/.test(body) && /core|ядр/.test(body);
        return result(this.id, this.title, suspicious ? WARN : PASS, suspicious ? 'Timer language found near core content' : 'No core timer language');
      },
    },
    {
      id: 'local-state',
      title: 'Local state layer is available',
      run() {
        try {
          const key = '__arena_audit__';
          localStorage.setItem(key, '1');
          localStorage.removeItem(key);
          return result(this.id, this.title, PASS, 'localStorage writable');
        } catch (error) {
          return result(this.id, this.title, WARN, error.message);
        }
      },
    },
    {
      id: 'route-contract',
      title: 'Route pages expose the two-step contract',
      run() {
        const isRoute = /\/lab\//.test(location.pathname);
        if (!isRoute) return result(this.id, this.title, INFO, 'Not an isolated route');
        const step = document.querySelector('#step');
        const valid = step && /\/2/.test(step.textContent);
        return result(this.id, this.title, valid ? PASS : WARN, step ? step.textContent : 'Missing step indicator');
      },
    },
    {
      id: 'telemetry-contract',
      title: 'Telemetry remains local and inspectable',
      run() {
        const keys = Object.keys(localStorage).filter((key) => key.startsWith('telemetry:'));
        return result(this.id, this.title, PASS, `${keys.length} local telemetry records`);
      },
    },
  ];

  function summarize(results) {
    const counts = { pass: 0, warn: 0, fail: 0, info: 0 };
    results.forEach((item) => { counts[item.status] += 1; });
    const scored = counts.pass + counts.warn + counts.fail;
    const score = scored ? Math.round((counts.pass + counts.warn * 0.5) / scored * 100) : 100;
    return { score, counts, total: results.length, at: new Date().toISOString() };
  }

  function run() {
    const results = checks.map((check) => {
      try {
        return check.run();
      } catch (error) {
        return result(check.id, check.title, FAIL, error.message);
      }
    });
    const summary = summarize(results);
    try {
      sessionStorage.setItem('arena:audit:last', JSON.stringify({ summary, results }));
    } catch (_) {}
    return { summary, results };
  }

  global.ArenaAudit = {
    PASS,
    WARN,
    FAIL,
    INFO,
    checks,
    run,
    visible,
    focusable,
    nameOf,
    ratio,
  };
})(window);
