<script>
/* ============================================================
   APP-LOGIK
   ============================================================ */

/* ---------- Sicherer Storage (funktioniert auch ohne localStorage) ---------- */
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

/* ---------- Consent-Verwaltung (§ 25 TDDDG / Art. 6 DSGVO) ---------- */
const CONSENT_KEY = 'dp_consent';
const CONSENT_MAX_AGE = 365 * 24 * 3600 * 1000; // 12 Monate

function getConsent() {
  const raw = store.get(CONSENT_KEY);
  if (!raw) return null;
  try {
    const c = JSON.parse(raw);
    if (!c.ts || Date.now() - c.ts > CONSENT_MAX_AGE) return null; // abgelaufen → erneut fragen
    return c;
  } catch (e) { return null; }
}
function hasFunctionalConsent() {
  const c = getConsent();
  return !!(c && c.functional);
}
function saveConsent(functional) {
  store.set(CONSENT_KEY, JSON.stringify({ functional: !!functional, ts: Date.now(), v: 1 }));
  if (!functional) {          // Datenminimierung: Widerruf löscht die Daten
    store.del('dp_lang');
    store.del('dp_progress');
  }
  hideCookieBanner();
  showToast(t('consentSaved'));
  updateProgressUI();
}
function consentAcceptAll()     { saveConsent(true); persistLang(); persistProgress(); }
function consentRejectAll()     { document.getElementById('pvFun').checked = false; saveConsent(false); }
function consentSaveSelection() {
  const fun = document.getElementById('pvFun').checked;
  saveConsent(fun);
  if (fun) { persistLang(); persistProgress(); }
}
function showCookieBanner() {
  const c = getConsent();
  document.getElementById('pvFun').checked = !!(c && c.functional);
  document.getElementById('pvVeil').classList.add('show');
  document.getElementById('pvDialog').classList.add('show');
  // Fallback: Wenn ein Content-Blocker den Dialog versteckt (Cosmetic Filter),
  // darf die Seite nicht hinter dem Blur-Schleier gefangen bleiben.
  // Es wird KEINE Einwilligung angenommen – nur der Schleier entfernt.
  setTimeout(() => {
    const dlg = document.getElementById('pvDialog');
    const hidden = !dlg || dlg.offsetHeight === 0 ||
      getComputedStyle(dlg).display === 'none' ||
      getComputedStyle(dlg).visibility === 'hidden';
    if (hidden) {
      document.getElementById('pvVeil').classList.remove('show');
      dlg && dlg.classList.remove('show');
    }
  }, 700);
}
function hideCookieBanner() {
  document.getElementById('pvVeil').classList.remove('show');
  document.getElementById('pvDialog').classList.remove('show');
}
function openCookieSettings() { showCookieBanner(); } // Widerruf so einfach wie Einwilligung

/* ---------- Sprache / i18n ---------- */
let LANG = 'de';
function t(key) { return (I18N[LANG] && I18N[LANG][key]) || I18N.de[key] || key; }
function L(obj) { return obj ? (obj[LANG] || obj.de) : ''; }

function setLang(lang) {
  LANG = lang;
  document.documentElement.lang = lang;
  document.getElementById('lang-de').classList.toggle('active', lang === 'de');
  document.getElementById('lang-en').classList.toggle('active', lang === 'en');
  applyI18n();
  renderChips();
  renderSections();
  updateProgressUI();
  persistLang();
  if (openPatternId) openPattern(openPatternId, activeTab); // offenes Modal neu rendern
}
function persistLang() { if (hasFunctionalConsent()) store.set('dp_lang', LANG); }

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
}

/* ---------- Lernfortschritt ---------- */
let learned = new Set();
function loadProgress() {
  if (!hasFunctionalConsent()) return;
  try { learned = new Set(JSON.parse(store.get('dp_progress') || '[]')); } catch (e) {}
}
function persistProgress() { if (hasFunctionalConsent()) store.set('dp_progress', JSON.stringify([...learned])); }
function toggleLearned(id) {
  if (!hasFunctionalConsent()) { showToast(t('needConsent'), true); return; }
  if (learned.has(id)) learned.delete(id); else learned.add(id);
  persistProgress();
  updateProgressUI();
  const card = document.querySelector(`.pcard[data-id="${id}"]`);
  if (card) card.classList.toggle('is-learned', learned.has(id));
  const btn = document.getElementById('learnBtn');
  if (btn) {
    btn.classList.toggle('on', learned.has(id));
    btn.innerHTML = learned.has(id) ? t('unmarkLearned') : t('markLearned');
  }
  if (learned.has(id)) showToast(t('learnedToast'));
}
function updateProgressUI() {
  document.getElementById('learnedCount').textContent = hasFunctionalConsent() ? learned.size : 0;
  document.getElementById('totalCount').textContent = PATTERNS.length;
  document.querySelectorAll('.pcard').forEach(c =>
    c.classList.toggle('is-learned', hasFunctionalConsent() && learned.has(c.dataset.id)));
}

/* ---------- Syntax-Highlighting (eigener Mini-Tokenizer, keine CDN nötig) ---------- */
const CS_KW = 'public|private|protected|internal|static|readonly|sealed|abstract|virtual|override|partial|class|interface|record|struct|enum|void|int|long|float|double|decimal|bool|string|char|object|var|new|return|if|else|for|foreach|while|do|switch|case|default|break|continue|try|catch|finally|throw|when|using|namespace|get|set|init|value|event|delegate|async|await|true|false|null|this|base|out|ref|in|is|as|where|lock|yield|typeof|nameof|params';
const PY_KW = 'def|class|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|import|from|as|with|try|except|finally|raise|yield|lambda|pass|break|continue|global|nonlocal|async|await|del|assert|match|case|self|cls|super|print|isinstance|len|range|sum|min|max|list|dict|set|tuple|str|int|float|bool|enumerate|reversed|sorted|open|type|property|staticmethod|classmethod|abstractmethod';

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function highlight(code, lang) {
  const kw = lang === 'csharp' ? CS_KW : PY_KW;
  let re;
  if (lang === 'csharp') {
    re = new RegExp(
      '(\\/\\/[^\\n]*)' +                                   // 1 Kommentar
      '|(\\$?@?"(?:[^"\\\\\\n]|\\\\.)*")' +                 // 2 String
      "|('(?:[^'\\\\\\n]|\\\\.)*')" +                       // 3 Char
      '|\\b(\\d[\\d_]*(?:\\.\\d+)?[mMfFdDlL]?)\\b' +        // 4 Zahl
      '|\\[(\\w+)\\]' +                                     // 5 Attribut
      '|\\b(' + kw + ')\\b' +                               // 6 Keyword
      '|\\b([A-Z]\\w*)\\b' +                                // 7 Typname
      '|\\b([a-z_]\\w*)(?=\\s*\\()',                        // 8 Funktion
      'g');
  } else {
    re = new RegExp(
      '(#[^\\n]*)' +                                        // 1 Kommentar
      '|("""[\\s\\S]*?"""|[rbf]*"(?:[^"\\\\\\n]|\\\\.)*"|[rbf]*\'(?:[^\'\\\\\\n]|\\\\.)*\')' + // 2 String
      '|(\\uFFFF)' +                                        // 3 (Platzhalter, matcht nie)
      '|\\b(\\d[\\d_]*(?:\\.\\d+)?[jJ]?)\\b' +              // 4 Zahl
      '|@(\\w[\\w.]*)' +                                    // 5 Decorator
      '|\\b(' + kw + ')\\b' +                               // 6 Keyword
      '|\\b([A-Z]\\w*)\\b' +                                // 7 Typname
      '|\\b([a-z_]\\w*)(?=\\s*\\()',                        // 8 Funktion
      'g');
  }
  let out = '', last = 0, m;
  while ((m = re.exec(code)) !== null) {
    if (m[0] === '') { re.lastIndex++; continue; }   // Schutz vor Zero-Length-Matches
    out += escHtml(code.slice(last, m.index));
    const [full, com, str, chr, num, dec, kwm, cls, fn] = m;
    if (com !== undefined)      out += '<span class="tok-com">' + escHtml(com) + '</span>';
    else if (str !== undefined) out += '<span class="tok-str">' + escHtml(str) + '</span>';
    else if (chr !== undefined && chr !== '') out += '<span class="tok-str">' + escHtml(chr) + '</span>';
    else if (num !== undefined) out += '<span class="tok-num">' + escHtml(num) + '</span>';
    else if (dec !== undefined) out += (lang === 'csharp' ? '[' : '@') + '<span class="tok-dec">' + escHtml(dec) + '</span>' + (lang === 'csharp' ? ']' : '');
    else if (kwm !== undefined) out += '<span class="tok-kw">' + escHtml(kwm) + '</span>';
    else if (cls !== undefined) out += '<span class="tok-cls">' + escHtml(cls) + '</span>';
    else if (fn !== undefined)  out += '<span class="tok-fn">' + escHtml(fn) + '</span>';
    else out += escHtml(full);
    last = m.index + full.length;
  }
  out += escHtml(code.slice(last));
  return out;
}

/* ---------- Rendering: Filter-Chips ---------- */
let activeCat = 'all';
function renderChips() {
  const box = document.getElementById('filterChips');
  const counts = {};
  PATTERNS.forEach(p => counts[p.cat] = (counts[p.cat] || 0) + 1);
  let html = `<button class="chip ${activeCat === 'all' ? 'active' : ''}" onclick="setCat('all')">${t('all')} <span class="cnt">${PATTERNS.length}</span></button>`;
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    html += `<button class="chip ${activeCat === key ? 'active' : ''}" onclick="setCat('${key}')">
      <span class="cdot" style="background:${cat.color}"></span>${L(cat.name)} <span class="cnt">${counts[key] || 0}</span></button>`;
  }
  box.innerHTML = html;
}
function setCat(cat) { activeCat = cat; renderChips(); renderSections(); }

/* ---------- Rendering: Sektionen & Karten ---------- */
let searchTerm = '';
function matchesFilter(p) {
  if (activeCat !== 'all' && p.cat !== activeCat) return false;
  if (!searchTerm) return true;
  const hay = (p.name + ' ' + p.id + ' ' + L(p.short) + ' ' + L(p.intent)).toLowerCase();
  return hay.includes(searchTerm);
}
function renderSections() {
  const box = document.getElementById('sections');
  let html = '', visible = 0;
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    const items = PATTERNS.filter(p => p.cat === key && matchesFilter(p));
    if (!items.length) continue;
    visible += items.length;
    html += `<section class="cat-section" id="cat-${key}">
      <div class="cat-head">
        <div class="bar" style="background:${cat.color}"></div>
        <h2>${L(cat.name)}</h2>
        <span class="badge-gof">${cat.gof ? t('gofBadge') : t('beyondBadge')}</span>
      </div>
      <p class="cat-desc">${L(cat.desc)}</p>
      <div class="grid">`;
    for (const p of items) {
      html += `<article class="pcard" data-id="${p.id}" style="--pc:${CATEGORIES[p.cat].color}"
                 onclick="openPattern('${p.id}')" tabindex="0" role="button"
                 onkeydown="if(event.key==='Enter')openPattern('${p.id}')">
        ${p.gof ? '' : `<span class="nongof">${t('beyondBadge')}</span>`}
        <div class="top"><h3>${p.name}</h3><div class="icon">${p.icon}</div></div>
        <p>${L(p.short)}</p>
        <div class="foot">
          <span class="tag">${L(CATEGORIES[p.cat].name)}</span>
          <span class="learned-mark">✓ ${t('learned')}</span>
        </div>
      </article>`;
    }
    html += '</div></section>';
  }
  box.innerHTML = html;
  document.getElementById('noResults').style.display = visible ? 'none' : 'block';
  updateProgressUI();
  observeCards();
}

/* ---------- Scroll-Reveal-Animation ---------- */
let revealObserver = null;
function observeCards() {
  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        e.target.style.transitionDelay = (Math.min(i, 8) * 45) + 'ms';
        e.target.classList.add('revealed');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.pcard:not(.revealed)').forEach(c => revealObserver.observe(c));
}

/* ---------- Modal ---------- */
let openPatternId = null;
let activeTab = 'explain';
function openPattern(id, tab) {
  const p = PATTERNS.find(x => x.id === id);
  if (!p) return;
  openPatternId = id;
  activeTab = tab || 'explain';
  const cat = CATEGORIES[p.cat];
  const isLearned = hasFunctionalConsent() && learned.has(id);
  const tabs = [
    ['explain', t('tabExplain')],
    ['csharp', t('tabCs')],
    ['python', t('tabPy')],
    ['proscons', t('tabPro')]
  ];
  if (p.demo) tabs.push(['demo', '▶ ' + t('tabDemo')]);

  const box = document.getElementById('modalBox');
  box.style.setProperty('--pc', cat.color);
  box.innerHTML = `
    <div class="mhead">
      <div style="display:flex;gap:16px;align-items:center">
        <div class="icon">${p.icon}</div>
        <div>
          <h2>${p.name}</h2>
          <div class="subtitle">${L(cat.name)} · ${p.gof ? t('gofBadge') : t('beyondBadge')}</div>
        </div>
      </div>
      <button class="close" onclick="closeModal()" aria-label="Schließen">✕</button>
    </div>
    <div class="mbody">
      <div class="tabs">${tabs.map(([k, label]) =>
        `<button class="${activeTab === k ? 'active' : ''}" onclick="switchTab('${k}')">${label}</button>`).join('')}
      </div>
      <div class="tabpane ${activeTab === 'explain' ? 'active' : ''}" id="pane-explain">
        <h4>${t('intent')}</h4>
        <p class="desc">${L(p.intent)}</p>
        <div class="analogy">💡 <b>${t('analogy')}:</b> ${L(p.analogy)}</div>
        <h4>${t('whenUse')}</h4>
        <ul class="uses">${L(p.use).map(u => `<li>${u}</li>`).join('')}</ul>
        ${p.related && p.related.length ? `<h4>${t('relatedH')}</h4>
        <div class="related">${p.related.filter(r => PATTERNS.some(x => x.id === r)).map(r =>
          `<span class="rel" onclick="openPattern('${r}')">${PATTERNS.find(x => x.id === r).name}</span>`).join('')}</div>` : ''}
      </div>
      <div class="tabpane ${activeTab === 'csharp' ? 'active' : ''}" id="pane-csharp">
        ${codeBlock(p.csharp, 'csharp', 'C#', '#68217a')}
      </div>
      <div class="tabpane ${activeTab === 'python' ? 'active' : ''}" id="pane-python">
        ${codeBlock(p.python, 'python', 'Python', '#3776ab')}
      </div>
      <div class="tabpane ${activeTab === 'proscons' ? 'active' : ''}" id="pane-proscons">
        <div class="proscons">
          <div class="box pro"><h5>✓ ${t('pros')}</h5><ul>${L(p.pros).map(x => `<li>${x}</li>`).join('')}</ul></div>
          <div class="box con"><h5>✕ ${t('cons')}</h5><ul>${L(p.cons).map(x => `<li>${x}</li>`).join('')}</ul></div>
        </div>
      </div>
      ${p.demo ? `<div class="tabpane ${activeTab === 'demo' ? 'active' : ''}" id="pane-demo">${renderDemo(p.demo)}</div>` : ''}
      <button class="learn-toggle ${isLearned ? 'on' : ''}" id="learnBtn" onclick="toggleLearned('${p.id}')">
        ${isLearned ? t('unmarkLearned') : t('markLearned')}
      </button>
    </div>`;
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  if (p.demo) initDemo(p.demo);
}
function codeBlock(code, lang, label, dot) {
  return `<div class="codewrap">
    <div class="codebar">
      <span class="langlabel"><span class="ldot" style="background:${dot}"></span>${label}</span>
      <button class="copybtn" onclick="copyCode(this)">${t('copy')}</button>
    </div>
    <pre class="code"><code data-raw>${highlight(code, lang)}</code></pre>
  </div>`;
}
function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('#modalBox .tabs button').forEach((b, i) => b.classList.remove('active'));
  document.querySelectorAll('#modalBox .tabpane').forEach(p => p.classList.remove('active'));
  const pane = document.getElementById('pane-' + tab);
  if (pane) pane.classList.add('active');
  document.querySelectorAll('#modalBox .tabs button').forEach(b => {
    if (b.getAttribute('onclick') === `switchTab('${tab}')`) b.classList.add('active');
  });
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  openPatternId = null;
}
function copyCode(btn) {
  const codeEl = btn.closest('.codewrap').querySelector('code');
  const text = codeEl.textContent;
  const done = ok => {
    btn.textContent = ok ? t('copied') : t('copyFail');
    btn.classList.toggle('copied', ok);
    setTimeout(() => { btn.textContent = t('copy'); btn.classList.remove('copied'); }, 1800);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => done(true), () => done(false));
  } else { done(false); }
}

/* ---------- Live-Demos ---------- */
function demoLog(outId, msg, hl) {
  const out = document.getElementById(outId);
  if (!out) return;
  const line = document.createElement('div');
  line.className = 'line' + (hl ? ' hl' : '');
  line.textContent = msg;
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
}
const demoState = {};

function renderDemo(kind) {
  const hint = `<div class="demo-title">⚡ ${t('demoHint')}</div>`;
  if (kind === 'observer') return `<div class="demo">${hint}
    <button class="dbtn ghost" onclick="demoObsSub('display')">📺 Display ${LANG === 'de' ? 'abonnieren' : 'subscribe'}</button>
    <button class="dbtn ghost" onclick="demoObsSub('alarm')">🚨 ${LANG === 'de' ? 'Hitzewarner abonnieren' : 'subscribe heat alert'}</button>
    <br>
    <button class="dbtn" onclick="demoObsSet(22)">22 °C</button>
    <button class="dbtn" onclick="demoObsSet(28)">28 °C</button>
    <button class="dbtn" onclick="demoObsSet(35)">35 °C</button>
    <div class="demo-out" id="demo-out-observer"></div></div>`;
  if (kind === 'strategy') return `<div class="demo">${hint}
    <select id="demo-strategy-select">
      <option value="standard">Standard (4,95 € / ${LANG === 'de' ? 'gratis ab' : 'free from'} 50 €)</option>
      <option value="express">Express (12,90 €)</option>
      <option value="pickup">${LANG === 'de' ? 'Abholung' : 'Pickup'} (0 €)</option>
    </select>
    <button class="dbtn" onclick="demoStrategyRun(39.99)">${LANG === 'de' ? 'Warenkorb' : 'Cart'} 39,99 €</button>
    <button class="dbtn" onclick="demoStrategyRun(89.00)">${LANG === 'de' ? 'Warenkorb' : 'Cart'} 89,00 €</button>
    <div class="demo-out" id="demo-out-strategy"></div></div>`;
  if (kind === 'state') return `<div class="demo">${hint}
    <button class="dbtn" onclick="demoStateAdvance()">${LANG === 'de' ? 'Nächster Schritt →' : 'Next step →'}</button>
    <button class="dbtn ghost" onclick="demoStateReset()">↺ Reset</button>
    <div class="demo-out" id="demo-out-state"></div></div>`;
  if (kind === 'pubsub') return `<div class="demo">${hint}
    <button class="dbtn" onclick="demoPub('order.created','Bestellung #' + (++demoState.orderNo))">📢 order.created</button>
    <button class="dbtn" onclick="demoPub('user.registered','User anna_dev')">📢 user.registered</button>
    <div class="demo-out" id="demo-out-pubsub"></div></div>`;
  if (kind === 'circuit') return `<div class="demo">${hint}
    <button class="dbtn" onclick="demoCircuitCall(false)">💥 ${LANG === 'de' ? 'Kaputten Service aufrufen' : 'Call broken service'}</button>
    <button class="dbtn" onclick="demoCircuitCall(true)">✅ ${LANG === 'de' ? 'Gesunden Service aufrufen' : 'Call healthy service'}</button>
    <button class="dbtn ghost" onclick="demoCircuitReset()">↺ Reset</button>
    <div class="demo-out" id="demo-out-circuit"></div></div>`;
  return '';
}
function initDemo(kind) {
  if (kind === 'observer') demoState.obs = { subs: {} };
  if (kind === 'state') demoStateReset(true);
  if (kind === 'pubsub') { demoState.orderNo = 1000; demoPubInit(); }
  if (kind === 'circuit') demoCircuitReset(true);
}
function demoObsSub(which) {
  if (!demoState.obs) demoState.obs = { subs: {} };
  const de = LANG === 'de';
  if (demoState.obs.subs[which]) {
    delete demoState.obs.subs[which];
    demoLog('demo-out-observer', (which === 'display' ? '📺 Display' : '🚨 ' + (de ? 'Hitzewarner' : 'Heat alert')) + (de ? ' abgemeldet' : ' unsubscribed'));
  } else {
    demoState.obs.subs[which] = true;
    demoLog('demo-out-observer', (which === 'display' ? '📺 Display' : '🚨 ' + (de ? 'Hitzewarner' : 'Heat alert')) + (de ? ' abonniert' : ' subscribed'), true);
  }
}
function demoObsSet(temp) {
  const de = LANG === 'de';
  demoLog('demo-out-observer', `— ${de ? 'Subjekt: Temperatur' : 'Subject: temperature'} = ${temp} °C —`, true);
  const subs = (demoState.obs && demoState.obs.subs) || {};
  if (!Object.keys(subs).length) demoLog('demo-out-observer', de ? '(keine Beobachter registriert)' : '(no observers registered)');
  if (subs.display) demoLog('demo-out-observer', `📺 Display: ${de ? 'zeigt' : 'shows'} ${temp} °C`);
  if (subs.alarm) demoLog('demo-out-observer', temp > 30 ? `🚨 ${de ? 'WARNUNG: Hitze!' : 'WARNING: heat!'}` : `🚨 ${de ? 'alles ok' : 'all fine'} (≤ 30 °C)`);
}
function demoStrategyRun(total) {
  const kind = document.getElementById('demo-strategy-select').value;
  const strategies = {
    standard: t => t > 50 ? 0 : 4.95,
    express: t => 12.90,
    pickup: t => 0
  };
  const ship = strategies[kind](total);
  const de = LANG === 'de';
  demoLog('demo-out-strategy', `${de ? 'Strategie' : 'Strategy'}: ${kind} | ${de ? 'Ware' : 'Goods'} ${total.toFixed(2)} € + ${de ? 'Versand' : 'Shipping'} ${ship.toFixed(2)} € = ${(total + ship).toFixed(2)} €`, ship === 0);
}
const DEMO_ORDER_STATES = { de: ['🛒 Bestellt', '📦 Versandt', '🏠 Zugestellt'], en: ['🛒 Placed', '📦 Shipped', '🏠 Delivered'] };
function demoStateReset(silent) {
  demoState.order = 0;
  const out = document.getElementById('demo-out-state');
  if (out) out.innerHTML = '';
  if (!silent) demoLog('demo-out-state', LANG === 'de' ? 'Neue Bestellung angelegt.' : 'New order created.');
  demoLog('demo-out-state', (LANG === 'de' ? 'Status: ' : 'State: ') + DEMO_ORDER_STATES[LANG][0], true);
}
function demoStateAdvance() {
  const states = DEMO_ORDER_STATES[LANG];
  if (demoState.order < states.length - 1) {
    demoState.order++;
    demoLog('demo-out-state', (LANG === 'de' ? 'Status: ' : 'State: ') + states[demoState.order], true);
    if (demoState.order === states.length - 1) demoLog('demo-out-state', LANG === 'de' ? '(Endzustand erreicht – advance() ändert nichts mehr)' : '(final state reached – advance() is now a no-op)');
  } else {
    demoLog('demo-out-state', LANG === 'de' ? 'Bereits zugestellt – keine Änderung.' : 'Already delivered – no change.');
  }
}
function demoPubInit() {
  const de = LANG === 'de';
  demoLog('demo-out-pubsub', de ? '📧 Mail-Service abonniert "order.created"' : '📧 Mail service subscribed to "order.created"');
  demoLog('demo-out-pubsub', de ? '📦 Lager-Service abonniert "order.created"' : '📦 Warehouse service subscribed to "order.created"');
  demoLog('demo-out-pubsub', de ? '📊 Analytics abonniert "user.registered"' : '📊 Analytics subscribed to "user.registered"');
}
function demoPub(topic, msg) {
  const de = LANG === 'de';
  demoLog('demo-out-pubsub', `— publish("${topic}", "${msg}") —`, true);
  if (topic === 'order.created') {
    demoLog('demo-out-pubsub', `📧 Mail-Service: ${de ? 'Bestätigung für' : 'confirmation for'} ${msg}`);
    demoLog('demo-out-pubsub', `📦 ${de ? 'Lager-Service: reserviere' : 'Warehouse: reserving'} ${msg}`);
  } else {
    demoLog('demo-out-pubsub', `📊 Analytics: ${de ? 'neuer Nutzer erfasst' : 'new user tracked'} (${msg})`);
  }
}
function demoCircuitReset(silent) {
  demoState.cb = { failures: 0, state: 'CLOSED' };
  const out = document.getElementById('demo-out-circuit');
  if (out && !silent) out.innerHTML = '';
  demoLog('demo-out-circuit', (LANG === 'de' ? 'Zustand: 🟢 GESCHLOSSEN (Aufrufe gehen durch)' : 'State: 🟢 CLOSED (calls pass through)'), true);
}
function demoCircuitCall(healthy) {
  const de = LANG === 'de';
  const cb = demoState.cb || (demoState.cb = { failures: 0, state: 'CLOSED' });
  if (cb.state === 'OPEN' && !healthy) {
    demoLog('demo-out-circuit', de ? '⛔ Sofort abgelehnt (fail fast) – Sicherung ist OFFEN. Fallback: Cache-Daten.' : '⛔ Rejected instantly (fail fast) – breaker is OPEN. Fallback: cached data.');
    return;
  }
  if (cb.state === 'OPEN' && healthy) {
    cb.state = 'HALF';
    demoLog('demo-out-circuit', de ? 'Zustand: 🟡 HALB-OFFEN – ein Testaufruf wird durchgelassen ...' : 'State: 🟡 HALF-OPEN – letting one test call through ...', true);
  }
  if (healthy) {
    cb.failures = 0;
    if (cb.state !== 'CLOSED') { cb.state = 'CLOSED'; demoLog('demo-out-circuit', de ? 'Zustand: 🟢 GESCHLOSSEN – Service erholt!' : 'State: 🟢 CLOSED – service recovered!', true); }
    demoLog('demo-out-circuit', de ? '✅ Antwort: 200 OK' : '✅ Response: 200 OK');
  } else {
    cb.failures++;
    demoLog('demo-out-circuit', `💥 ${de ? 'Fehler' : 'Failure'} ${cb.failures}/3 – Timeout`);
    if (cb.failures >= 3) {
      cb.state = 'OPEN';
      demoLog('demo-out-circuit', de ? 'Zustand: 🔴 OFFEN – Sicherung ausgelöst! Weitere Aufrufe werden sofort abgewiesen.' : 'State: 🔴 OPEN – breaker tripped! Further calls rejected instantly.', true);
    }
  }
}

/* ---------- Seiten-Navigation (Impressum/Datenschutz) ---------- */
function showPage(id) {
  const page = document.getElementById('page-' + id);
  if (!page) return;   // Variante ohne Rechtsseiten (z. B. GitHub-Build)
  document.getElementById('mainContent').style.display = 'none';
  document.querySelectorAll('.legal-page').forEach(p => p.classList.remove('open'));
  page.classList.add('open');
  closeModal();
  hideCookieBannerIfDecided();
  window.scrollTo({ top: 0 });
  if (history.replaceState) history.replaceState(null, '', '#' + id);
}
function showMain() {
  document.querySelectorAll('.legal-page').forEach(p => p.classList.remove('open'));
  document.getElementById('mainContent').style.display = '';
  window.scrollTo({ top: 0 });
  if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
  maybeShowBanner();
}
function hideCookieBannerIfDecided() {
  // Rechtstexte müssen OHNE Einwilligung lesbar sein → Banner dort ausblenden
  document.getElementById('pvVeil').classList.remove('show');
  document.getElementById('pvDialog').classList.remove('show');
}
function maybeShowBanner() { if (!getConsent()) showCookieBanner(); }

/* ---------- Toast & Scroll-to-top ---------- */
let toastTimer = null;
function showToast(msg, warn) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.borderColor = warn ? 'var(--amber)' : 'var(--green)';
  el.style.color = warn ? 'var(--amber)' : 'var(--green)';
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

/* ---------- Hero: schwebende Code-Symbole ---------- */
function spawnOrbit() {
  const zone = document.getElementById('orbitZone');
  const symbols = ['{ }', '=>', 'class', 'def', 'async', '<T>', 'new()', 'self', 'await', 'yield', '::', '()', 'interface', 'lambda'];
  symbols.forEach((s, i) => {
    const el = document.createElement('span');
    el.className = 'code-orbit';
    el.textContent = s;
    el.style.left = ((i * 71) % 96 + 2) + '%';
    el.style.top = ((i * 37) % 80 + 8) + '%';
    el.style.animationDelay = (i * 1.7) + 's';
    el.style.animationDuration = (11 + (i % 5) * 3) + 's';
    zone.appendChild(el);
  });
}

/* ---------- Statistik-Zähler animieren ---------- */
function animateCounters() {
  const items = [
    [document.getElementById('statPatterns'), PATTERNS.length],
    [document.getElementById('statExamples'), PATTERNS.length * 2]
  ];
  items.forEach(([el, target]) => {
    let cur = 0;
    const step = Math.max(1, Math.round(target / 40));
    const iv = setInterval(() => {
      cur = Math.min(target, cur + step);
      el.textContent = cur;
      if (cur >= target) clearInterval(iv);
    }, 28);
  });
}

/* ---------- Init ---------- */
function init() {
  // Standardsprache Englisch; gespeicherte Auswahl (mit Einwilligung) hat Vorrang
  const savedLang = hasFunctionalConsent() ? store.get('dp_lang') : null;
  LANG = (savedLang === 'en' || savedLang === 'de') ? savedLang : 'en';
  document.documentElement.lang = LANG;
  document.getElementById('lang-de').classList.toggle('active', LANG === 'de');
  document.getElementById('lang-en').classList.toggle('active', LANG === 'en');

  loadProgress();
  applyI18n();
  renderChips();
  renderSections();
  updateProgressUI();
  spawnOrbit();
  animateCounters();

  // Suche
  document.getElementById('search').addEventListener('input', e => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderSections();
  });

  // Modal schließen: Klick auf Overlay / ESC
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Scroll-to-top
  window.addEventListener('scroll', () => {
    document.getElementById('toTop').classList.toggle('show', window.scrollY > 600);
  }, { passive: true });

  // Anker-Links aus dem statischen Pattern-Index öffnen das Modal
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace('#', '');
    if (h === 'impressum' || h === 'datenschutz') showPage(h);
    else if (PATTERNS.some(p => p.id === h)) openPattern(h);
  });

  // Deep-Links: #impressum / #datenschutz / #pattern-id
  const hash = location.hash.replace('#', '');
  if (hash === 'impressum' || hash === 'datenschutz') {
    showPage(hash);
  } else {
    if (hash && PATTERNS.some(p => p.id === hash)) openPattern(hash);
    maybeShowBanner();   // Consent-Banner beim ersten Besuch
  }
}
document.addEventListener('DOMContentLoaded', init);
</script>
