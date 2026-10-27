/* CSBC101 «Мэргэжлийн удиртгал» — SCORM 1.2 интерактив хичээлийн тоглуулагч.
   window.LESSON (content.js) өгөгдлийг уншиж дэлгэц, дасгалуудыг үүсгэнэ. Гадны сангүй, офлайн ажиллана. */
(function () {
  'use strict';
  const L = window.LESSON;
  const E = window.ENGINE;
  const DEBUG = /[?&]debug=1/.test(location.search);

  // ═════════════ Туслах функцууд ═════════════
  function h(tag, attrs) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (let i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) c.forEach((x) => add(el, x));
    else if (c instanceof Node) el.appendChild(c);
    else el.appendChild(document.createTextNode(String(c)));
  }
  // Хялбар markdown: **тод**, *налуу*, `код`, мөр шилжилт
  function md(str) {
    const frag = document.createDocumentFragment();
    String(str == null ? '' : str).split('\n').forEach((line, li) => {
      if (li) frag.appendChild(document.createElement('br'));
      const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;
      let last = 0, m;
      while ((m = re.exec(line))) {
        if (m.index > last) frag.appendChild(document.createTextNode(line.slice(last, m.index)));
        const tok = m[0];
        if (tok.startsWith('**')) frag.appendChild(h('strong', { text: tok.slice(2, -2) }));
        else if (tok.startsWith('`')) frag.appendChild(h('code', { text: tok.slice(1, -1) }));
        else frag.appendChild(h('em', { text: tok.slice(1, -1) }));
        last = m.index + tok.length;
      }
      if (last < line.length) frag.appendChild(document.createTextNode(line.slice(last)));
    });
    return frag;
  }
  function P(str, cls) { return h('p', { class: cls }, md(str)); }
  function shuffle(a) {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  }
  function shuffledIdx(n) {
    let idx;
    let guard = 0;
    do { idx = shuffle([...Array(n).keys()]); guard++; } while (n > 2 && guard < 10 && idx.every((v, i) => v === i));
    return idx;
  }
  const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, ' ').replace(/[«»"“”]/g, '');
  const pct = (x) => Math.round(x * 100) + '%';

  // ═════════════ SCORM 1.2 ═════════════
  const SCORM = {
    api: null, start: Date.now(),
    find() {
      let w = window, n = 0;
      while (w && n < 500) {
        if (w.API) return w.API;
        if (w.parent && w.parent !== w) { w = w.parent; n++; continue; }
        break;
      }
      try { if (window.opener) { w = window.opener; n = 0; while (w && n < 500) { if (w.API) return w.API; if (w.parent && w.parent !== w) { w = w.parent; n++; } else break; } } } catch (e) { /* cross-origin */ }
      return null;
    },
    init() {
      this.api = this.find();
      if (!this.api) return false;
      try { this.api.LMSInitialize(''); } catch (e) { this.api = null; return false; }
      return true;
    },
    get(k) { try { return this.api ? this.api.LMSGetValue(k) : ''; } catch (e) { return ''; } },
    set(k, v) { try { if (this.api) this.api.LMSSetValue(k, String(v)); } catch (e) { /* ignore */ } },
    commit() { try { if (this.api) this.api.LMSCommit(''); } catch (e) { /* ignore */ } },
    sessionTime() {
      let s = Math.floor((Date.now() - this.start) / 1000);
      const hh = Math.floor(s / 3600); s -= hh * 3600;
      const mm = Math.floor(s / 60); s -= mm * 60;
      return String(hh).padStart(4, '0') + ':' + String(mm).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    },
    finish(done) {
      if (!this.api || this.finished) return;
      this.set('cmi.core.session_time', this.sessionTime());
      this.set('cmi.core.exit', done ? '' : 'suspend');
      this.commit();
      try { this.api.LMSFinish(''); } catch (e) { /* ignore */ }
      this.finished = true;
    },
  };
  const lmsOn = SCORM.init();

  // ═════════════ Төлөв ═════════════
  const screens = L.screens.concat([{ id: '__results', title: 'Үр дүн', results: true }]);
  const exercises = []; // {id, points, title, screen}
  L.screens.forEach((s, si) => (s.blocks || []).forEach((b) => {
    if (b.id && b.points) exercises.push({ id: b.id, points: b.points, title: b.title || b.q || b.id, screen: si });
  }));
  const totalPoints = exercises.reduce((s, e) => s + e.points, 0);
  const state = { cur: 0, visited: {}, scores: {}, polls: {} };
  (function load() {
    let raw = lmsOn ? SCORM.get('cmi.suspend_data') : '';
    if (!lmsOn) { try { raw = localStorage.getItem('csbc101_' + L.id) || ''; } catch (e) { raw = ''; } }
    if (raw) {
      try {
        const d = JSON.parse(raw);
        (d.v || []).forEach((i) => (state.visited[i] = true));
        state.scores = d.s || {};
        state.cur = Math.min(d.c || 0, screens.length - 1);
      } catch (e) { /* ignore broken data */ }
    }
    if (lmsOn) {
      const st = SCORM.get('cmi.core.lesson_status');
      if (!st || st === 'not attempted') SCORM.set('cmi.core.lesson_status', 'incomplete');
      SCORM.set('cmi.core.score.min', 0);
      SCORM.set('cmi.core.score.max', 100);
    }
  })();

  function earned() { return exercises.reduce((s, e) => s + (e.id in state.scores ? state.scores[e.id] * e.points : 0), 0); }
  function scorePct() { return totalPoints ? Math.round((earned() / totalPoints) * 100) : 100; }
  function allVisited() { return L.screens.every((_, i) => state.visited[i]); }
  function allDone() { return exercises.every((e) => e.id in state.scores); }
  function passPct() { return L.passPercent || 70; }

  function save() {
    const data = JSON.stringify({ v: Object.keys(state.visited).map(Number), s: state.scores, c: state.cur });
    if (lmsOn) {
      SCORM.set('cmi.suspend_data', data);
      SCORM.set('cmi.core.lesson_location', String(state.cur));
      SCORM.set('cmi.core.score.raw', scorePct());
      if (allVisited() && allDone()) SCORM.set('cmi.core.lesson_status', scorePct() >= passPct() ? 'passed' : 'failed');
      SCORM.commit();
    } else {
      try { localStorage.setItem('csbc101_' + L.id, data); } catch (e) { /* ignore */ }
    }
    updateChrome();
  }
  let interactionN = null;
  function record(ex, ratio, resp) {
    if (ex.id in state.scores) return false;
    ratio = Math.max(0, Math.min(1, ratio));
    state.scores[ex.id] = Math.round(ratio * 100) / 100;
    if (lmsOn) {
      if (interactionN === null) interactionN = parseInt(SCORM.get('cmi.interactions._count'), 10) || 0;
      const n = interactionN++;
      SCORM.set('cmi.interactions.' + n + '.id', ex.id);
      SCORM.set('cmi.interactions.' + n + '.type', 'performance');
      SCORM.set('cmi.interactions.' + n + '.weighting', ex.points);
      SCORM.set('cmi.interactions.' + n + '.student_response', String(resp || ('score_' + Math.round(ratio * 100))).replace(/[^\x20-\x7E]/g, '').slice(0, 250));
      SCORM.set('cmi.interactions.' + n + '.result', ratio >= 0.999 ? 'correct' : 'wrong');
    }
    save();
    return true;
  }

  // ═════════════ Үндсэн бүтэц ═════════════
  const app = document.getElementById('app');
  const elProgress = h('div', { class: 'bar-fill' });
  const elScore = h('span', { class: 'score-val', text: '0' });
  const header = h('header', { class: 'top' },
    h('div', { class: 'brand' }, h('span', { class: 'code', text: '> CSBC101' }), h('span', { class: 'lec', text: 'Лекц ' + L.num })),
    h('div', { class: 'ttl', text: L.title }),
    h('div', { class: 'score', title: 'Цуглуулсан оноо' }, h('span', { class: 'xp', text: 'Оноо' }), elScore, h('span', { class: 'of', text: ' / 100' })),
    h('button', { class: 'menu-btn', 'aria-label': 'Агуулга', onclick: () => document.body.classList.toggle('nav-open') }, '☰'));
  const progress = h('div', { class: 'bar' }, elProgress);
  const nav = h('nav', { class: 'side', 'aria-label': 'Хичээлийн агуулга' });
  const main = h('main', { class: 'main', tabindex: '-1' });
  app.append(header, progress, h('div', { class: 'wrap' }, nav, main));
  const elDebug = DEBUG ? h('div', { id: 'debug', 'data-lms': lmsOn ? '1' : '0' }) : null;
  if (elDebug) document.body.appendChild(elDebug);

  function updateChrome() {
    elScore.textContent = String(Math.round((earned() / Math.max(1, totalPoints)) * 100));
    const visitedN = L.screens.filter((_, i) => state.visited[i]).length;
    elProgress.style.width = Math.round((visitedN / L.screens.length) * 100) + '%';
    nav.innerHTML = '';
    nav.appendChild(h('div', { class: 'side-h', text: 'Агуулга' }));
    screens.forEach((s, i) => {
      const exs = exercises.filter((e) => e.screen === i);
      const done = s.results ? allDone() : state.visited[i] && exs.every((e) => e.id in state.scores);
      nav.appendChild(h('button', {
        class: 'side-i' + (i === state.cur ? ' cur' : '') + (done ? ' done' : ''),
        onclick: () => go(i),
      }, h('span', { class: 'dot', text: done ? '✓' : String(i + 1) }), h('span', { text: s.title }), exs.length ? h('span', { class: 'tag', text: exs.length + ' дасгал' }) : null));
    });
  }

  function go(i) {
    state.cur = Math.max(0, Math.min(screens.length - 1, i));
    if (!screens[state.cur].results) state.visited[state.cur] = true;
    document.body.classList.remove('nav-open');
    renderScreen();
    save();
    main.scrollTop = 0;
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  function renderScreen() {
    const s = screens[state.cur];
    main.innerHTML = '';
    const sec = h('section', { class: 'screen' });
    sec.appendChild(h('div', { class: 'kicker', text: (s.results ? 'Төгсгөл' : 'Хэсэг ' + (state.cur + 1) + ' / ' + L.screens.length) }));
    sec.appendChild(h('h1', { text: s.title }));
    if (s.results) renderResults(sec);
    else (s.blocks || []).forEach((b) => sec.appendChild(renderBlock(b)));
    main.appendChild(sec);
    const prev = h('button', { class: 'btn ghost', onclick: () => go(state.cur - 1), disabled: state.cur === 0 }, '← Өмнөх');
    const next = state.cur < screens.length - 1
      ? h('button', { class: 'btn primary', onclick: () => go(state.cur + 1) }, state.cur === screens.length - 2 ? 'Үр дүн харах →' : 'Дараах →')
      : h('span');
    main.appendChild(h('div', { class: 'pager' }, prev, h('span', { class: 'pg', text: (state.cur + 1) + ' / ' + screens.length }), next));
  }

  // ═════════════ Агуулгын блокууд ═════════════
  const R = {};
  function renderBlock(b) {
    const f = R[b.type];
    if (!f) return h('div', { class: 'err', text: 'Тодорхойгүй блок: ' + b.type });
    return f(b);
  }

  R.text = (b) => h('div', { class: 'blk text' },
    b.h ? h('h2', { text: b.h }) : null,
    (b.p || []).map((x) => P(x)),
    b.bullets ? h('ul', null, b.bullets.map((x) => h('li', null, md(x)))) : null);

  R.callout = (b) => h('div', { class: 'blk callout ' + (b.variant || 'info') },
    h('div', { class: 'callout-h', text: b.h || ({ info: 'Анхаар', tip: 'Зөвлөмж', warn: 'Сануулга', fact: 'Мэдсэн үү?' }[b.variant || 'info']) }),
    P(b.text));

  R.cards = (b) => {
    const grid = h('div', { class: 'cards cols-' + (b.cols || Math.min(4, b.items.length)) });
    b.items.forEach((it) => {
      if (b.flip && it.back) {
        const card = h('button', { class: 'card flip', 'aria-pressed': 'false' },
          h('div', { class: 'face front' }, it.icon ? h('div', { class: 'ico', text: it.icon }) : null, h('h3', { text: it.h }), it.t ? P(it.t) : null, h('span', { class: 'hint', text: 'Дарж эргүүлэх ↻' })),
          h('div', { class: 'face back' }, P(it.back)));
        card.addEventListener('click', () => { card.classList.toggle('on'); card.setAttribute('aria-pressed', card.classList.contains('on')); });
        grid.appendChild(card);
      } else {
        grid.appendChild(h('div', { class: 'card' }, it.icon ? h('div', { class: 'ico', text: it.icon }) : null, h('h3', { text: it.h }), it.sub ? h('div', { class: 'sub', text: it.sub }) : null, it.t ? P(it.t) : null));
      }
    });
    return h('div', { class: 'blk' }, b.h ? h('h2', { text: b.h }) : null, b.lead ? P(b.lead, 'lead') : null, grid);
  };

  R.stats = (b) => h('div', { class: 'blk' }, b.h ? h('h2', { text: b.h }) : null,
    h('div', { class: 'stats' }, b.items.map((it) => h('div', { class: 'stat' }, h('div', { class: 'n', text: it.n }), h('div', { class: 'l', text: it.l }), it.s ? h('div', { class: 's', text: it.s }) : null))));

  R.timeline = (b) => {
    const box = h('div', { class: 'tl' });
    b.items.forEach((it) => {
      const det = h('div', { class: 'tl-d' }, P(it.t));
      const item = h('button', { class: 'tl-i', onclick: () => item.classList.toggle('on') }, h('span', { class: 'tl-y', text: it.y }), h('span', { class: 'tl-h', text: it.h || '' }));
      box.appendChild(h('div', { class: 'tl-row' }, item, det));
    });
    return h('div', { class: 'blk' }, b.h ? h('h2', { text: b.h }) : null, h('p', { class: 'hint', text: 'Он бүр дээр дарж дэлгэрэнгүйг үзнэ үү.' }), box);
  };

  R.accordion = (b) => h('div', { class: 'blk' }, b.h ? h('h2', { text: b.h }) : null,
    b.items.map((it) => h('details', { class: 'acc' }, h('summary', { text: it.h }), h('div', { class: 'acc-b' }, (Array.isArray(it.t) ? it.t : [it.t]).map((x) => P(x))))));

  R.tabs = (b) => {
    const bar = h('div', { class: 'tabbar', role: 'tablist' });
    const body = h('div', { class: 'tabbody' });
    const show = (i) => {
      [...bar.children].forEach((x, j) => x.classList.toggle('on', i === j));
      body.innerHTML = '';
      const it = b.items[i];
      (it.p || []).forEach((x) => body.appendChild(P(x)));
      if (it.bullets) body.appendChild(h('ul', null, it.bullets.map((x) => h('li', null, md(x)))));
    };
    b.items.forEach((it, i) => bar.appendChild(h('button', { class: 'tab', role: 'tab', onclick: () => show(i) }, it.h)));
    const el = h('div', { class: 'blk' }, b.h ? h('h2', { text: b.h }) : null, bar, body);
    show(0);
    return el;
  };

  R.reveal = (b) => {
    const ans = h('div', { class: 'reveal-a', hidden: true }, P(b.a));
    const btn = h('button', { class: 'btn ghost', onclick: () => { ans.hidden = false; btn.remove(); } }, 'Хариултыг харах');
    return h('div', { class: 'blk reveal' }, h('div', { class: 'reveal-k', text: b.h || 'Бодоод үз' }), P(b.q, 'reveal-q'), btn, ans);
  };

  R.poll = (b) => {
    const out = h('div', { class: 'poll-out', hidden: true }, P(b.after || 'Баярлалаа! Таны санааг дараагийн хэлэлцүүлэгт ашиглана.'));
    const opts = h('div', { class: 'opts' }, b.options.map((o) => h('button', { class: 'opt', onclick: (ev) => { [...opts.children].forEach((x) => x.classList.remove('sel')); ev.currentTarget.classList.add('sel'); out.hidden = false; } }, o)));
    return h('div', { class: 'blk poll' }, h('div', { class: 'reveal-k', text: 'Санал асуулга (оноогүй)' }), P(b.q, 'reveal-q'), opts, out);
  };

  R.quote = (b) => h('blockquote', { class: 'blk quote' }, P(b.text), b.by ? h('cite', { text: '— ' + b.by }) : null);

  // ═════════════ Хэрэгслүүд ═════════════
  R.tool = (b) => {
    const T = TOOLS[b.tool];
    return h('div', { class: 'blk tool' }, h('div', { class: 'tool-h' }, h('span', { class: 'tool-k', text: 'ХЭРЭГСЭЛ' }), h('span', { text: b.h || T.title })), b.text ? P(b.text) : null, T.render(b));
  };
  const TOOLS = {
    cipher: {
      title: 'Кодчилол тайлагч (CyberChef-ийн хялбар хувилбар)',
      render(b) {
        const inp = h('textarea', { class: 'mono', rows: 3, placeholder: 'Текстээ энд оруулна уу' });
        if (b.sample) inp.value = b.sample;
        const outp = h('textarea', { class: 'mono', rows: 3, readonly: true });
        const shift = h('input', { type: 'number', value: b.shift || 3, min: -25, max: 25, class: 'num' });
        const doIt = (fn) => { try { outp.value = fn(inp.value); } catch (e) { outp.value = 'Алдаа: оролт буруу байна (' + e.message + ')'; } };
        return h('div', { class: 'tool-b' }, h('label', { text: 'Оролт' }), inp,
          h('div', { class: 'row wrapr' },
            h('button', { class: 'btn sm', onclick: () => doIt(E.b64decode) }, 'Base64 → текст'),
            h('button', { class: 'btn sm', onclick: () => doIt(E.b64encode) }, 'Текст → Base64'),
            h('button', { class: 'btn sm', onclick: () => doIt((s) => E.caesar(s, 13)) }, 'ROT13'),
            h('span', { class: 'inl' }, h('button', { class: 'btn sm', onclick: () => doIt((s) => E.caesar(s, parseInt(shift.value, 10) || 0)) }, 'Caesar шилжүүлэх'), shift),
            h('button', { class: 'btn sm', onclick: () => doIt(E.hexdecode) }, 'Hex → текст'),
            h('button', { class: 'btn sm', onclick: () => doIt((s) => Array.from(s).reverse().join('')) }, 'Урвуулах'),
            h('button', { class: 'btn sm', onclick: () => { inp.value = outp.value; } }, '↑ Гаралтыг оролт болгох')),
          h('label', { text: 'Гаралт' }), outp);
      },
    },
    hash: {
      title: 'SHA-256 хэш тооцоолуур',
      render() {
        const inp = h('textarea', { class: 'mono', rows: 2, placeholder: 'Текст оруулна уу' });
        const outp = h('div', { class: 'mono hashout', text: E.sha256('') });
        inp.addEventListener('input', () => (outp.textContent = E.sha256(inp.value)));
        return h('div', { class: 'tool-b' }, inp, h('label', { text: 'SHA-256' }), outp, h('p', { class: 'hint', text: 'Ганц тэмдэгт өөрчлөхөд хэш бүхэлдээ өөрчлөгдөхийг ажиглаарай.' }));
      },
    },
    password: {
      title: 'Нууц үгийн хүч шалгагч',
      render() {
        const inp = h('input', { type: 'text', class: 'mono wide', placeholder: 'ЖИНХЭНЭ нууц үгээ бүү оруул — жишээ зохиож шалга', autocomplete: 'off', spellcheck: 'false' });
        const out = h('div', { class: 'pw-out' });
        const meter = h('div', { class: 'meter' }, h('div', { class: 'meter-f' }));
        const upd = () => {
          const r = E.passwordInfo(inp.value);
          const lvl = r.common || r.bits < 40 ? 0 : r.bits < 60 ? 1 : r.bits < 80 ? 2 : 3;
          meter.firstChild.style.width = Math.min(100, r.bits) + '%';
          meter.className = 'meter l' + lvl;
          out.innerHTML = '';
          out.append(
            h('div', null, 'Урт: ', h('b', { text: r.len }), ' · Тэмдэгтийн олонлог: ', h('b', { text: r.pool }), ' · Энтропи: ', h('b', { text: r.bits + ' бит' })),
            h('div', null, 'Секундэд 10 тэрбум таалт хийх компьютерт: ', h('b', { text: r.common ? 'шууд (түгээмэл нууц үгийн жагсаалтад байна!)' : E.humanTime(r.seconds) })),
            h('div', { class: 'pw-l', text: ['Маш сул', 'Дунд', 'Сайн', 'Маш сайн'][lvl] }));
        };
        inp.addEventListener('input', upd);
        upd();
        return h('div', { class: 'tool-b' }, inp, meter, out, h('p', { class: 'hint', text: 'Энтропи = урт × log₂(олонлог). Урт нэмэх нь тэмдэгтийн төрөл нэмэхээс илүү үр дүнтэй.' }));
      },
    },
    url: {
      title: 'URL задлагч',
      render(b) {
        const inp = h('input', { type: 'text', class: 'mono wide', value: b.sample || 'https://www.mndu.gov.mn/news', spellcheck: 'false' });
        const out = h('div', { class: 'url-out' });
        const upd = () => {
          out.innerHTML = '';
          const r = E.parseUrl(inp.value);
          if (!r) { out.appendChild(h('div', { class: 'hint', text: 'URL-ийг протоколтой нь (https://...) бичнэ үү.' })); return; }
          const chip = (cls, label, val) => val ? h('span', { class: 'uc ' + cls }, h('small', { text: label }), h('span', { text: val })) : null;
          out.append(h('div', { class: 'url-chips' },
            chip('sch', 'протокол', r.scheme + '://'), chip('ui', '«@»-ийн өмнөх (хуурамч)', r.userinfo ? r.userinfo + '@' : ''),
            chip('sub', 'дэд домэйн', r.sub ? r.sub + '.' : ''), chip('reg', 'ҮНДСЭН ДОМЭЙН', r.regDomain), chip('sch', 'порт', r.port ? ':' + r.port : ''),
            chip('path', 'зам', r.path), chip('path', 'параметр', r.query)),
          h('div', { class: 'url-own' }, 'Энэ холбоос үнэндээ ', h('b', { text: r.regDomain }), ' домэйн рүү очно.'),
          r.warnings.length ? h('ul', { class: 'warns' }, r.warnings.map((w) => h('li', { text: w }))) : h('div', { class: 'ok', text: 'Илэрхий сэжигтэй шинж олдсонгүй — гэхдээ үндсэн домэйн нь танил эсэхийг заавал шалгаарай.' }));
        };
        inp.addEventListener('input', upd);
        upd();
        return h('div', { class: 'tool-b' }, inp, out);
      },
    },
  };

  // ═════════════ Дасгалын хүрээ ═════════════
  function exercise(b, build) {
    const ex = exercises.find((e) => e.id === b.id) || { id: b.id, points: 0 };
    const box = h('div', { class: 'blk ex', id: 'ex-' + b.id, 'data-ex': b.id });
    const head = h('div', { class: 'ex-h' },
      h('span', { class: 'ex-k', text: b.kicker || 'ДАСГАЛ' }),
      h('span', { class: 'ex-t', text: b.title || '' }),
      ex.points ? h('span', { class: 'pts', text: ex.points + ' оноо' }) : null);
    const status = h('div', { class: 'ex-status' });
    const body = h('div', { class: 'ex-b' });
    const fb = h('div', { class: 'fb', 'aria-live': 'polite' });
    const btns = h('div', { class: 'row' });
    box.appendChild(head);
    if (b.instr) box.appendChild(P(b.instr, 'instr'));
    box.append(status, body, btns, fb);
    let api = null;
    const paint = () => {
      status.innerHTML = '';
      if (ex.id in state.scores) status.appendChild(h('div', { class: 'done-note' }, 'Оноонд тооцсон дүн: ', h('b', { text: pct(state.scores[ex.id]) }), '. Дахин хийх нь сургалтын зорилготой бөгөөд оноонд нөлөөлөхгүй.'));
    };
    const reset = () => {
      body.innerHTML = ''; fb.innerHTML = ''; fb.className = 'fb'; btns.innerHTML = '';
      api = build(body);
      const check = h('button', { class: 'btn primary' }, 'Шалгах');
      check.addEventListener('click', () => {
        const res = api.check();
        if (!res) return;
        if (res.incomplete) { fb.className = 'fb warn'; fb.innerHTML = ''; fb.appendChild(P(res.incomplete)); return; }
        check.disabled = true;
        const first = ex.points ? record(ex, res.ratio, res.resp) : false;
        fb.className = 'fb ' + (res.ratio >= 0.999 ? 'good' : res.ratio >= 0.5 ? 'mid' : 'bad');
        fb.innerHTML = '';
        fb.appendChild(h('div', { class: 'fb-h', text: (res.ratio >= 0.999 ? 'Маш сайн! ' : res.ratio >= 0.5 ? 'Хагас зөв. ' : 'Дахин бодоорой. ') + 'Гүйцэтгэл: ' + pct(res.ratio) + (ex.points && first ? ' · +' + (Math.round(res.ratio * ex.points * 10) / 10) + ' оноо' : '') }));
        (res.notes || []).forEach((n) => fb.appendChild(n instanceof Node ? n : P(n)));
        if (b.explain) fb.appendChild(h('div', { class: 'explain' }, h('b', { text: 'Тайлбар: ' }), md(b.explain)));
        btns.appendChild(h('button', { class: 'btn ghost', onclick: () => { reset(); paint(); } }, 'Дахин оролдох'));
        paint();
        if (elDebug) elDebug.setAttribute('data-last', b.id + ':' + res.ratio);
      });
      btns.appendChild(check);
      if (DEBUG) btns.appendChild(h('button', { class: 'btn sm dbg', 'data-solve': b.id, onclick: () => api.solve && api.solve() }, 'solve'));
    };
    reset();
    paint();
    return box;
  }

  // ── Сонгох асуулт ──
  R.mcq = (b) => exercise(b, (body) => {
    const multi = b.multi || b.options.filter((o) => o.correct).length > 1;
    if (b.scenario) body.appendChild(h('div', { class: 'scenario' }, md(b.scenario)));
    body.appendChild(P(b.q, 'q'));
    if (multi) body.appendChild(h('div', { class: 'hint', text: 'Хэд хэдэн зөв хариулт байж болно.' }));
    const order = b.keepOrder ? b.options.map((_, i) => i) : shuffledIdx(b.options.length);
    const sel = new Set();
    const list = h('div', { class: 'opts col' });
    order.forEach((i) => {
      const o = b.options[i];
      const btn = h('button', { class: 'opt', 'data-i': i, role: multi ? 'checkbox' : 'radio', 'aria-checked': 'false' }, h('span', { class: 'mk' }), h('span', null, md(o.t)));
      btn.addEventListener('click', () => {
        if (btn.classList.contains('locked')) return;
        if (!multi) { sel.clear(); [...list.children].forEach((x) => { x.classList.remove('sel'); x.setAttribute('aria-checked', 'false'); }); }
        if (sel.has(i)) { sel.delete(i); btn.classList.remove('sel'); } else { sel.add(i); btn.classList.add('sel'); }
        btn.setAttribute('aria-checked', String(sel.has(i)));
      });
      list.appendChild(btn);
    });
    body.appendChild(list);
    return {
      solve() { [...list.children].forEach((x) => { const i = +x.dataset.i; if (!!b.options[i].correct !== sel.has(i)) x.click(); }); },
      check() {
        if (!sel.size) return { incomplete: 'Хариултаа сонгоно уу.' };
        let right = 0, wrong = 0;
        const nCorrect = b.options.filter((o) => o.correct).length;
        const notes = [];
        [...list.children].forEach((x) => {
          const i = +x.dataset.i, o = b.options[i];
          x.classList.add('locked');
          if (o.correct) x.classList.add('right');
          if (sel.has(i) && !o.correct) x.classList.add('wrong');
          if (sel.has(i)) { o.correct ? right++ : wrong++; if (o.fb) notes.push(h('div', { class: 'note ' + (o.correct ? 'g' : 'b') }, md(o.fb))); }
        });
        const ratio = multi ? Math.max(0, (right - wrong) / nCorrect) : right ? 1 : 0;
        return { ratio, notes, resp: [...sel].join(',') };
      },
    };
  });

  // ── Ангилах ──
  R.classify = (b) => exercise(b, (body) => {
    body.appendChild(P(b.q, 'q'));
    const choice = {};
    const rows = h('div', { class: 'cls' });
    shuffledIdx(b.items.length).forEach((i) => {
      const it = b.items[i];
      const btns = h('div', { class: 'cls-btns' }, b.categories.map((c, ci) => h('button', {
        class: 'chip', 'data-c': ci, onclick: (ev) => {
          if (row.classList.contains('locked')) return;
          choice[i] = ci;
          [...btns.children].forEach((x) => x.classList.toggle('sel', x === ev.currentTarget));
        },
      }, c)));
      const row = h('div', { class: 'cls-row', 'data-i': i }, h('div', { class: 'cls-t' }, it.mono ? h('code', { class: 'blockcode', text: it.t }) : md(it.t)), btns, h('div', { class: 'cls-fb' }));
      rows.appendChild(row);
    });
    body.appendChild(rows);
    return {
      solve() { [...rows.children].forEach((r) => r.querySelector('[data-c="' + b.items[+r.dataset.i].cat + '"]').click()); },
      check() {
        if (Object.keys(choice).length < b.items.length) return { incomplete: 'Бүх мөрийг ангилна уу (' + Object.keys(choice).length + ' / ' + b.items.length + ').' };
        let ok = 0;
        [...rows.children].forEach((r) => {
          const i = +r.dataset.i, it = b.items[i], good = choice[i] === it.cat;
          if (good) ok++;
          r.classList.add('locked', good ? 'right' : 'wrong');
          const f = r.querySelector('.cls-fb');
          f.appendChild(h('span', { class: 'tagc', text: (good ? '✓ ' : '✗ Зөв нь: ') + b.categories[it.cat] }));
          if (it.fb) f.appendChild(h('span', null, ' — ', md(it.fb)));
        });
        return { ratio: ok / b.items.length, resp: 'ok_' + ok + '_of_' + b.items.length };
      },
    };
  });

  // ── Дараалал ──
  R.order = (b) => exercise(b, (body) => {
    body.appendChild(P(b.q, 'q'));
    const cur = shuffledIdx(b.items.length);
    const list = h('ol', { class: 'ord' });
    const draw = () => {
      list.innerHTML = '';
      cur.forEach((idx, pos) => {
        const mv = (d) => { const j = pos + d; if (j < 0 || j >= cur.length || list.classList.contains('locked')) return; [cur[pos], cur[j]] = [cur[j], cur[pos]]; draw(); };
        list.appendChild(h('li', { class: 'ord-i', 'data-i': idx },
          h('span', { class: 'ord-n', text: pos + 1 }), h('span', { class: 'ord-t' }, md(b.items[idx])),
          h('span', { class: 'ord-b' }, h('button', { class: 'btn sm', 'aria-label': 'Дээш', onclick: () => mv(-1) }, '▲'), h('button', { class: 'btn sm', 'aria-label': 'Доош', onclick: () => mv(1) }, '▼'))));
      });
    };
    draw();
    body.appendChild(list);
    return {
      solve() { cur.sort((a, c) => a - c); draw(); },
      check() {
        list.classList.add('locked');
        let ok = 0;
        [...list.children].forEach((li, pos) => { const good = +li.dataset.i === pos; if (good) ok++; li.classList.add(good ? 'right' : 'wrong'); });
        const notes = [h('div', { class: 'note' }, h('b', { text: 'Зөв дараалал: ' }), b.items.map((x, i) => (i + 1) + '. ' + x).join('  →  '))];
        return { ratio: ok / b.items.length, notes, resp: cur.join('-') };
      },
    };
  });

  // ── Харгалзуулах ──
  R.match = (b) => exercise(b, (body) => {
    body.appendChild(P(b.q, 'q'));
    const rights = b.pairs.map((p) => p.r).concat(b.extra || []);
    const opts = shuffle(rights.map((r, i) => i));
    const rows = h('div', { class: 'match' });
    const sels = [];
    shuffledIdx(b.pairs.length).forEach((i) => {
      const sel = h('select', { 'data-i': i }, h('option', { value: '', text: '— сонгоно уу —' }), opts.map((ri) => h('option', { value: ri, text: rights[ri] })));
      sels.push(sel);
      rows.appendChild(h('div', { class: 'match-row' }, h('div', { class: 'match-l' }, md(b.pairs[i].l)), sel, h('div', { class: 'match-fb' })));
    });
    body.appendChild(rows);
    return {
      solve() { sels.forEach((s) => (s.value = String(+s.dataset.i))); },
      check() {
        if (sels.some((s) => s.value === '')) return { incomplete: 'Бүх мөрөнд хариулт сонгоно уу.' };
        let ok = 0;
        sels.forEach((s) => {
          const i = +s.dataset.i, good = +s.value === i;
          if (good) ok++;
          s.disabled = true;
          s.parentNode.classList.add(good ? 'right' : 'wrong');
          if (!good) s.parentNode.querySelector('.match-fb').textContent = 'Зөв нь: ' + b.pairs[i].r;
        });
        return { ratio: ok / b.pairs.length, resp: 'ok_' + ok };
      },
    };
  });

  // ── Нөхөх ──
  function answerOk(val, answers) {
    const v = norm(val);
    return answers.some((a) => (a.startsWith('/') && a.lastIndexOf('/') > 0 ? new RegExp(a.slice(1, a.lastIndexOf('/')), a.slice(a.lastIndexOf('/') + 1) || 'i').test(val.trim()) : norm(a) === v));
  }
  function fillRow(task, i) {
    const inp = h('input', { type: 'text', class: 'mono wide', placeholder: task.placeholder || 'Хариулт', spellcheck: 'false', autocomplete: 'off' });
    const hint = task.hint ? h('details', { class: 'hintd' }, h('summary', { text: 'Сэжүүр' }), P(task.hint)) : null;
    const res = h('div', { class: 'fill-fb' });
    const row = h('div', { class: 'fill' }, h('div', { class: 'fill-q' }, h('span', { class: 'fill-n', text: (i + 1) + '.' }), h('span', null, md(task.q))), inp, hint, res);
    return { row, inp, res, task };
  }
  function checkFills(rows) {
    if (rows.some((r) => !r.inp.value.trim())) return { incomplete: 'Бүх асуултад хариулна уу.' };
    let ok = 0;
    rows.forEach((r) => {
      const good = answerOk(r.inp.value, r.task.answers);
      if (good) ok++;
      r.inp.disabled = true;
      r.row.classList.add(good ? 'right' : 'wrong');
      r.res.textContent = good ? '✓ Зөв' : '✗ Зөв хариулт: ' + (r.task.show || r.task.answers[0]);
    });
    return { ratio: ok / rows.length, resp: 'ok_' + ok + '_of_' + rows.length };
  }
  R.fillin = (b) => exercise(b, (body) => {
    if (b.q) body.appendChild(P(b.q, 'q'));
    if (b.code) body.appendChild(h('pre', { class: 'code' }, b.code));
    const tasks = b.tasks || [{ q: b.ask || 'Хариулт:', answers: b.answers, hint: b.hint, show: b.show }];
    const rows = tasks.map(fillRow);
    rows.forEach((r) => body.appendChild(r.row));
    return { solve() { rows.forEach((r) => (r.inp.value = r.task.answers[0].startsWith('/') ? (r.task.solve || '') : r.task.answers[0])); }, check: () => checkFills(rows) };
  });

  // ── Терминал + асуултууд ──
  R.terminal = (b) => exercise(b, (body) => {
    if (b.q) body.appendChild(P(b.q, 'q'));
    const screen = h('div', { class: 'term-out' });
    const inp = h('input', { type: 'text', class: 'term-in', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Команд' });
    const hist = []; let hi = 0;
    const print = (text, cls) => { screen.appendChild(h('div', { class: 'tl ' + (cls || '') }, text)); screen.scrollTop = screen.scrollHeight; };
    print(b.banner || 'Сургалтын терминал. «help» гэж бичээд командуудыг харна уу. Файлууд: ' + Object.keys(b.files).join(', '), 'sys');
    inp.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        const line = inp.value; inp.value = '';
        if (line.trim()) { hist.push(line); hi = hist.length; }
        print('cadet@lab:~$ ' + line, 'cmd');
        if (line.trim() === 'clear') { screen.innerHTML = ''; return; }
        const r = E.run(line, b.files);
        if (r.out) print(r.out, r.error ? 'err' : '');
      } else if (ev.key === 'ArrowUp') { if (hi > 0) inp.value = hist[--hi]; ev.preventDefault(); }
      else if (ev.key === 'ArrowDown') { if (hi < hist.length) inp.value = hist[++hi] || ''; ev.preventDefault(); }
    });
    const term = h('div', { class: 'term', onclick: () => inp.focus() }, screen, h('div', { class: 'term-line' }, h('span', { class: 'ps', text: 'cadet@lab:~$' }), inp));
    body.appendChild(term);
    if (b.examples) body.appendChild(h('div', { class: 'hint' }, 'Жишээ команд: ', b.examples.map((x) => h('code', { class: 'ex-cmd', title: 'Дарж оруулах', onclick: () => { inp.value = x; inp.focus(); } }, x))));
    const rows = b.tasks.map(fillRow);
    body.appendChild(h('div', { class: 'tasks-h', text: 'Терминалаар шинжилж, дараах асуултад хариулна уу:' }));
    rows.forEach((r) => body.appendChild(r.row));
    return { solve() { rows.forEach((r) => (r.inp.value = r.task.answers[0])); }, check: () => checkFills(rows) };
  });

  // ── Тэмдэглэх (фишинг и-мэйл, пост, зар) ──
  function partsTo(container, parts, hots, clicked) {
    (Array.isArray(parts) ? parts : [parts]).forEach((p) => {
      if (typeof p === 'string') { container.appendChild(md(p)); return; }
      const idx = hots.length;
      hots.push(p);
      const span = h('span', { class: 'hs', 'data-h': idx, tabindex: '0', role: 'button' }, md(p.t));
      const toggle = () => {
        if (span.classList.contains('locked')) return;
        if (clicked.has(idx)) { clicked.delete(idx); span.classList.remove('mark'); } else { clicked.add(idx); span.classList.add('mark'); }
      };
      span.addEventListener('click', toggle);
      span.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
      container.appendChild(span);
    });
  }
  R.hotspot = (b) => exercise(b, (body) => {
    if (b.q) body.appendChild(P(b.q, 'q'));
    const nHot = (function count(list) { let n = 0; list.forEach((p) => { if (p && typeof p === 'object' && p.hot) n++; }); return n; })(
      [].concat(...['from', 'to', 'subject', 'date'].map((k) => (b.header && Array.isArray(b.header[k]) ? b.header[k] : [])), ...(b.body || []).map((x) => (Array.isArray(x) ? x : [x]))));
    body.appendChild(h('div', { class: 'hint', text: 'Сэжигтэй гэж үзсэн хэсгүүд дээрээ дарж тэмдэглэнэ үү (дахин дарвал тэмдэглэгээ арилна). Нийт ' + nHot + ' шинж нуугдсан байна.' }));
    const hots = [], clicked = new Set();
    const style = b.style || 'email';
    const card = h('div', { class: 'hs-card ' + style });
    if (style === 'email' && b.header) {
      const hd = h('div', { class: 'mail-h' });
      [['from', 'Илгээгч'], ['to', 'Хүлээн авагч'], ['date', 'Огноо'], ['subject', 'Гарчиг']].forEach(([k, lab]) => {
        if (!b.header[k]) return;
        const v = h('span', { class: 'mv' });
        partsTo(v, b.header[k], hots, clicked);
        hd.appendChild(h('div', { class: 'mrow' + (k === 'subject' ? ' subj' : '') }, h('span', { class: 'ml', text: lab + ':' }), v));
      });
      if (b.header.attach) {
        const v = h('span', { class: 'mv' });
        partsTo(v, b.header.attach, hots, clicked);
        hd.appendChild(h('div', { class: 'mrow' }, h('span', { class: 'ml', text: 'Хавсралт:' }), h('span', { class: 'att' }, '📎 ', v)));
      }
      card.appendChild(hd);
    }
    if (style === 'post' && b.header) {
      card.appendChild(h('div', { class: 'post-h' }, h('div', { class: 'avatar', text: (b.header.name || '?').slice(0, 1) }), h('div', null, h('b', { text: b.header.name || '' }), h('div', { class: 'muted', text: b.header.meta || '' }))));
    }
    const bd = h('div', { class: 'mail-b' });
    (b.body || []).forEach((para) => { const p = h('p'); partsTo(p, para, hots, clicked); bd.appendChild(p); });
    card.appendChild(bd);
    body.appendChild(card);
    let verdictSel = null;
    let vbox = null;
    if (b.verdict) {
      vbox = h('div', { class: 'opts' }, b.verdict.options.map((o, i) => h('button', { class: 'opt', 'data-v': i, onclick: (ev) => { verdictSel = i; [...vbox.children].forEach((x) => x.classList.toggle('sel', x === ev.currentTarget)); } }, o)));
      body.appendChild(h('div', { class: 'verdict' }, P(b.verdict.q, 'q'), vbox));
    }
    return {
      solve() { hots.forEach((p, i) => { if (p.hot && !clicked.has(i)) card.querySelector('[data-h="' + i + '"]').click(); }); if (vbox) vbox.children[b.verdict.correct].click(); },
      check() {
        if (b.verdict && verdictSel === null) return { incomplete: 'Эцсийн дүгнэлтээ (доорх сонголт) хийнэ үү.' };
        if (!clicked.size && nHot) return { incomplete: 'Дор хаяж нэг сэжигтэй хэсгийг тэмдэглэнэ үү.' };
        let found = 0, wrong = 0;
        const notes = [];
        hots.forEach((p, i) => {
          const sp = card.querySelector('[data-h="' + i + '"]');
          sp.classList.add('locked');
          if (p.hot) {
            sp.classList.add(clicked.has(i) ? 'found' : 'missed');
            if (clicked.has(i)) found++;
            notes.push(h('div', { class: 'note ' + (clicked.has(i) ? 'g' : 'b') }, h('b', { text: (clicked.has(i) ? '✓ Олсон: ' : '○ Алдсан: ') }), '«', md(p.t), '» — ', md(p.fb || '')));
          } else if (clicked.has(i)) {
            sp.classList.add('fp'); wrong++;
            notes.push(h('div', { class: 'note b' }, h('b', { text: '✗ Сэжиггүй: ' }), '«', md(p.t), '» — ', md(p.fb || 'Энэ хэсэг хэвийн.')));
          }
        });
        let ratio = nHot ? Math.max(0, (found - 0.5 * wrong) / nHot) : 1;
        if (b.verdict) {
          const vok = verdictSel === b.verdict.correct;
          [...vbox.children].forEach((x, i) => { x.classList.add('locked'); if (i === b.verdict.correct) x.classList.add('right'); else if (i === verdictSel) x.classList.add('wrong'); });
          ratio = nHot ? 0.7 * ratio + 0.3 * (vok ? 1 : 0) : vok ? 1 : 0;
          notes.unshift(h('div', { class: 'note ' + (vok ? 'g' : 'b') }, h('b', { text: 'Дүгнэлт: ' }), vok ? 'зөв' : 'буруу — зөв нь «' + b.verdict.options[b.verdict.correct] + '»'));
        }
        return { ratio, notes, resp: 'found_' + found + '_fp_' + wrong + (b.verdict ? '_v' + verdictSel : '') };
      },
    };
  });

  // ── Нөхцөл байдлын шийдвэр (алхамтай) ──
  R.scenario = (b) => exercise(b, (body) => {
    const scores = [];
    let step = 0;
    const box = h('div', { class: 'scn' });
    body.appendChild(box);
    const showStep = () => {
      const st = b.steps[step];
      const sb = h('div', { class: 'scn-step' }, h('div', { class: 'scn-n', text: 'Алхам ' + (step + 1) + ' / ' + b.steps.length }), h('div', { class: 'scenario' }, md(st.text)));
      const opts = h('div', { class: 'opts col' });
      shuffledIdx(st.choices.length).forEach((ci) => {
        const c = st.choices[ci];
        opts.appendChild(h('button', {
          class: 'opt', 'data-ci': ci, onclick: () => {
            if (opts.classList.contains('locked')) return;
            opts.classList.add('locked');
            scores[step] = c.s;
            [...opts.children].forEach((x) => { const cc = st.choices[+x.dataset.ci]; x.classList.add('locked'); if (cc.s >= 1) x.classList.add('right'); });
            opts.querySelector('[data-ci="' + ci + '"]').classList.add(c.s >= 1 ? 'right' : c.s > 0 ? 'midc' : 'wrong');
            sb.appendChild(h('div', { class: 'note ' + (c.s >= 1 ? 'g' : 'b') }, md(c.fb || '')));
            step++;
            if (step < b.steps.length) sb.appendChild(h('button', { class: 'btn sm', onclick: (ev) => { ev.currentTarget.remove(); showStep(); } }, 'Үргэлжлүүлэх →'));
            else sb.appendChild(h('div', { class: 'hint', text: 'Бүх алхам дууслаа — «Шалгах» товчийг дарж дүнгээ бүртгүүлнэ үү.' }));
          },
        }, h('span', null, md(c.t))));
      });
      sb.appendChild(opts);
      box.appendChild(sb);
    };
    showStep();
    return {
      solve() {
        const loop = () => {
          const sb = box.lastChild; const opts = sb.querySelector('.opts');
          if (!opts.classList.contains('locked')) { const best = [...opts.children].find((x) => b.steps[step].choices[+x.dataset.ci].s >= 1); best.click(); }
          const nxt = sb.querySelector('.btn.sm'); if (nxt) { nxt.click(); loop(); }
        };
        loop();
      },
      check() {
        if (scores.length < b.steps.length || scores.some((x) => x === undefined)) return { incomplete: 'Бүх алхмыг дуусгана уу.' };
        return { ratio: scores.reduce((s, x) => s + x, 0) / b.steps.length, resp: scores.join('_') };
      },
    };
  });

  // ═════════════ Үр дүнгийн дэлгэц ═════════════
  function renderResults(sec) {
    const p = Math.round((earned() / Math.max(1, totalPoints)) * 100);
    const done = allDone(), visited = allVisited();
    const pass = p >= passPct();
    sec.appendChild(h('div', { class: 'res-top ' + (done ? (pass ? 'pass' : 'fail') : 'pending') },
      h('div', { class: 'res-n', text: p + '%' }),
      h('div', null,
        h('div', { class: 'res-l', text: !done ? 'Хичээл дуусаагүй байна' : pass ? 'Тэнцлээ! Баяр хүргэе.' : 'Тэнцэх босго ' + passPct() + '% — дахин давтаарай' },
        ),
        h('div', { class: 'muted', text: 'Цуглуулсан оноо: ' + Math.round(earned() * 10) / 10 + ' / ' + totalPoints + ' · Тэнцэх босго: ' + passPct() + '%' }))));
    if (done && pass && L.badge) sec.appendChild(h('div', { class: 'badge' }, h('div', { class: 'badge-i', text: L.badge.icon || '★' }), h('div', null, h('div', { class: 'badge-k', text: 'ЭНГЭРИЙН ТЭМДЭГ' }), h('div', { class: 'badge-n', text: L.badge.name }), h('div', { class: 'muted', text: L.badge.text || '' }))));
    const tbl = h('table', { class: 'res-t' }, h('thead', null, h('tr', null, h('th', { text: 'Дасгал' }), h('th', { text: 'Оноо' }), h('th', { text: 'Гүйцэтгэл' }))));
    const tb = h('tbody');
    exercises.forEach((e) => {
      const s = state.scores[e.id];
      tb.appendChild(h('tr', { class: s === undefined ? 'todo' : '' },
        h('td', null, h('button', { class: 'linkb', onclick: () => go(e.screen) }, e.title)),
        h('td', { text: s === undefined ? '— / ' + e.points : Math.round(s * e.points * 10) / 10 + ' / ' + e.points }),
        h('td', { text: s === undefined ? 'хийгээгүй' : pct(s) })));
    });
    tbl.appendChild(tb);
    sec.appendChild(tbl);
    if (!visited) sec.appendChild(P('Үзээгүй хэсэг байна: ' + L.screens.map((s, i) => (state.visited[i] ? null : (i + 1) + '. ' + s.title)).filter(Boolean).join(', '), 'warnp'));
    if (L.summary) sec.appendChild(h('div', { class: 'blk callout tip' }, h('div', { class: 'callout-h', text: 'Энэ хичээлийн гол санаа' }), h('ul', null, L.summary.map((x) => h('li', null, md(x))))));
    if (L.next) sec.appendChild(h('div', { class: 'blk callout info' }, h('div', { class: 'callout-h', text: 'Дараагийн алхам' }), P(L.next)));
    const fin = h('button', { class: 'btn primary big', disabled: !(done && visited) }, lmsOn ? 'Хичээлийг дуусгаж LMS-д илгээх' : 'Хичээлийг дуусгах');
    fin.addEventListener('click', () => { save(); SCORM.finish(true); fin.disabled = true; fin.textContent = 'Илгээгдлээ. Цонхыг хааж болно.'; });
    sec.appendChild(h('div', { class: 'row center' }, fin));
    if (!(done && visited)) sec.appendChild(h('p', { class: 'hint center', text: 'Бүх хэсгийг үзэж, бүх дасгалыг гүйцэтгэсний дараа дуусгах боломжтой.' }));
  }

  // ═════════════ Эхлүүлэх ═════════════
  window.addEventListener('beforeunload', () => { save(); SCORM.finish(false); });
  window.addEventListener('pagehide', () => { save(); SCORM.finish(false); });
  if (DEBUG) {
    window.PLAYER = {
      state, exercises, screens, totalPoints, go, scorePct: () => Math.round((earned() / Math.max(1, totalPoints)) * 100),
      lms: () => lmsOn,
    };
  }
  document.title = 'Лекц ' + L.num + '. ' + L.title;
  go(state.cur);
})();
