/* Build-Skript: fügt die Single-File-HTML zusammen und generiert
   SEO-/GEO-Artefakte (statischer Index, JSON-LD, llms.txt, robots, sitemap). */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const BASE_URL = 'https://apps.totalcreations.de/DesignPatterns/';
const SRC = (f) => readFileSync(new URL('./src/' + f, import.meta.url), 'utf8');

/* ---------- 1) Pattern-Daten aus den src-Dateien laden ---------- */
const dataFiles = ['03_base.js','04_creational.js','05_structural.js','06_behavioral.js','07_concurrency.js','08_architectural.js','09_resilience.js'];
const dataJs = dataFiles.map(f => SRC(f).replace(/<\/?script>/g, '')).join('\n');
const sandbox = {};
new Function('sandbox', dataJs + '\nsandbox.CATEGORIES=CATEGORIES; sandbox.PATTERNS=PATTERNS;')(sandbox);
const { CATEGORIES, PATTERNS } = sandbox;
console.log('Patterns geladen:', PATTERNS.length);

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ---------- 2) Statische, crawlbare Sektion (Index + FAQ) – Standard Englisch ---------- */
const FAQ = [
  ['What is a design pattern?',
   'A design pattern is a proven, reusable solution template for a recurring problem in software design. Patterns are not ready-made code but a concept you adapt to your own situation – shown here with concrete examples in C# and Python.'],
  ['How many design patterns are in the Gang of Four book?',
   'The book "Design Patterns: Elements of Reusable Object-Oriented Software" (1994) by Gamma, Helm, Johnson and Vlissides describes exactly 23 patterns in three categories: 5 creational, 7 structural and 11 behavioral patterns. This site covers all 23 – plus 21 modern patterns beyond the GoF.'],
  ['What categories of design patterns exist?',
   'Classic: creational patterns (object creation, e.g. Singleton, Factory, Builder), structural patterns (object composition, e.g. Adapter, Decorator, Facade) and behavioral patterns (communication, e.g. Observer, Strategy, Command). Modern additions: concurrency patterns (Producer-Consumer, Thread Pool), architectural/enterprise patterns (MVC, Repository, CQRS) and resilience/cloud patterns (Circuit Breaker, Retry, Saga).'],
  ['What is the difference between Strategy and State?',
   'Both encapsulate behavior in interchangeable classes with the same structure. The difference is intent: with Strategy the client actively picks the algorithm (e.g. shipping method) and the strategies do not know each other. With State the object changes its own behavior when its internal state changes (e.g. order status), and states often define their mutual transitions.'],
  ['Do design patterns differ between Python and C#?',
   'The concepts are identical, the implementation differs: C# uses interfaces, events and language features like Lazy<T> or IEnumerable; Python solves much of it more lightweightly via duck typing, first-class functions, decorators, generators and modules. Some GoF patterns (e.g. Iterator, Strategy) are practically built into Python. That is exactly why this site shows every pattern in both languages side by side.'],
  ['Is this learning tool free?',
   'Yes. All 44 patterns, 88 code examples and the interactive live demos are completely free and usable without sign-up. The code examples may be freely used for learning purposes.']
];

let staticHtml = `<section class="seo-static wrap" id="pattern-index">
    <h2>Learn design patterns – all 44 patterns at a glance</h2>
    <div class="tldr"><b>In short:</b> This free learning tool explains all 23 Gang-of-Four design patterns plus 21 modern patterns (concurrency, enterprise architecture, cloud resilience) – each with intent, real-world analogy, when-to-use criteria, pros and cons and one complete code example in both C# and Python. A total of 44 patterns, 88 code examples, 5 interactive live demos, bilingual English/German.</div>`;

for (const [key, cat] of Object.entries(CATEGORIES)) {
  const items = PATTERNS.filter(p => p.cat === key);
  staticHtml += `\n    <h3>${esc(cat.name.en)} (${items.length}${cat.gof ? ' – Gang of Four' : ''})</h3>\n    <ul class="idx">`;
  for (const p of items) {
    staticHtml += `\n      <li><a href="#${p.id}">${esc(p.name)}</a> – <span>${esc(p.short.en)}</span></li>`;
  }
  staticHtml += '\n    </ul>';
}

staticHtml += `\n    <h3>Frequently asked questions about design patterns (FAQ)</h3>`;
for (const [q, a] of FAQ) {
  staticHtml += `\n    <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`;
}
staticHtml += '\n  </section>';

/* ---------- 3) JSON-LD generieren ---------- */
const jsonld = [
  {
    '@context': 'https://schema.org', '@type': 'WebSite',
    name: 'Design Patterns Interactive', url: BASE_URL, inLanguage: ['en', 'de']
  },
  {
    '@context': 'https://schema.org', '@type': 'LearningResource',
    name: 'Design Patterns Interactive – 44 Patterns with C# & Python Examples',
    description: 'Free interactive learning tool: all 23 GoF patterns plus concurrency, enterprise and cloud patterns with 88 code examples in C# and Python, live demos and progress tracking. Bilingual EN/DE.',
    url: BASE_URL,
    learningResourceType: 'Interactive Resource',
    educationalLevel: 'Beginner to Advanced',
    inLanguage: ['en', 'de'],
    teaches: 'Software Design Patterns, C#, Python, Gang of Four, Concurrency Patterns, Enterprise Patterns, Cloud Patterns',
    isAccessibleForFree: true,
    dateModified: new Date().toISOString().slice(0, 10),
    author: { '@type': 'Person', name: '[IHR NAME]', url: BASE_URL },
    publisher: { '@type': 'Person', name: '[IHR NAME]',
      sameAs: ['https://github.com/HECer/DesignPatterns'] }
  },
  {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  },
  {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: 'Alle 44 Design Patterns',
    numberOfItems: PATTERNS.length,
    itemListElement: PATTERNS.map((p, i) => ({
      '@type': 'ListItem', position: i + 1, name: p.name,
      url: BASE_URL + '#' + p.id, description: p.short.de
    }))
  },
  {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Apps', item: 'https://apps.totalcreations.de/' },
      { '@type': 'ListItem', position: 2, name: 'Design Patterns Interaktiv', item: BASE_URL }
    ]
  }
];
const jsonldHtml = jsonld.map(o => '<script type="application/ld+json">\n' + JSON.stringify(o, null, 1) + '\n</script>').join('\n');

/* ---------- 4) HTML zusammensetzen (zwei Varianten) ---------- */
const order = ['01_head.html','02_body.html','03_base.js','04_creational.js','05_structural.js','06_behavioral.js','07_concurrency.js','08_architectural.js','09_resilience.js','10_app.js','11_tail.html'];
let base = order.map(SRC).join('');
base = base.replace('<!--SEO_STATIC_CONTENT-->', staticHtml);
base = base.replace('<!--JSONLD_GENERATED-->', jsonldHtml);

/* Persönliche Daten aus optionaler, GITIGNORIERTER Datei laden */
let personal = null;
try { personal = (await import('./personal.config.mjs')).default; }
catch (e) { console.log('Hinweis: personal.config.mjs nicht gefunden – Live-Variante behält Platzhalter.'); }

/* --- Variante A: LIVE (mit echten Daten, für den Webserver) --- */
let live = base;
if (personal) {
  // Kein Telefon angegeben → ganze "Telefon: …<br>"-Zeile entfernen
  if (!personal.phone) {
    live = live.replace(/\s*Telefon: <span class="placeholder">\[TELEFONNUMMER\]<\/span><br>/g, '');
  }
  for (const [key, val] of Object.entries(personal.replacements || {})) {
    live = live.split(`<span class="placeholder">${key}</span>`).join(esc(val));
  }
  // Falls doch eine Telefonnummer gesetzt ist, Platzhalter ersetzen
  if (personal.phone) {
    live = live.split('<span class="placeholder">[TELEFONNUMMER]</span>').join(esc(personal.phone));
  }
  if (personal.name) {
    live = live.split('<span class="placeholder-inline">[IHR NAME]</span>').join(esc(personal.name));
    live = live.split('[IHR NAME]').join(esc(personal.name));
  }
  if (personal.githubRepoUrl) {
    live = live.split('https://github.com/IHR-GITHUB-NUTZERNAME/design-patterns-interaktiv').join(personal.githubRepoUrl);
  }
  // Gelbe „Vor Veröffentlichung ausfüllen"-Hinweisboxen entfernen
  live = live.replace(/<div class="hintbox">[\s\S]*?<\/div>\n?/g, '');
}

/* --- Variante B: GITHUB (ohne Impressum/Datenschutz, ohne persönliche Daten) --- */
let gh = base
  .replace(/<!--LEGAL_PAGES_START-->[\s\S]*?<!--LEGAL_PAGES_END-->/, '<!-- Rechtsseiten: nur in der Live-Version unter https://apps.totalcreations.de/DesignPatterns/ -->')
  .replace(/<!--LEGAL_NAV_START-->[\s\S]*?<!--LEGAL_NAV_END-->/, '')
  .replace(`<button class="lnk" onclick="showPage('datenschutz')" data-i18n="cbLink">Datenschutzerklärung</button>`,
           `<a class="lnk" href="https://apps.totalcreations.de/DesignPatterns/#datenschutz" target="_blank" rel="noopener" data-i18n="cbLink">Datenschutzerklärung</a>`);
if (personal && personal.githubRepoUrl) {
  gh = gh.split('https://github.com/IHR-GITHUB-NUTZERNAME/design-patterns-interaktiv').join(personal.githubRepoUrl);
}

mkdirSync(new URL('./dist/', import.meta.url), { recursive: true });
mkdirSync(new URL('./dist-github/', import.meta.url), { recursive: true });
writeFileSync(new URL('./dist/index.html', import.meta.url), live);
writeFileSync(new URL('./dist-github/index.html', import.meta.url), gh);
writeFileSync(new URL('./design-patterns-interaktiv.html', import.meta.url), live);
const html = live;

/* ---------- 5) robots.txt (Domain-Root!) ---------- */
writeFileSync(new URL('./dist/robots.txt', import.meta.url),
`# robots.txt für apps.totalcreations.de
# Muss im DOMAIN-ROOT liegen: https://apps.totalcreations.de/robots.txt
# WICHTIG: aktuell liefert diese URL einen 500-Fehler – das blockiert Google komplett!

User-agent: *
Allow: /

# KI-Crawler explizit erlauben (LLM-/GEO-Sichtbarkeit: ChatGPT, Claude, Perplexity, Gemini)
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: https://apps.totalcreations.de/DesignPatterns/sitemap.xml
`);

/* ---------- 6) sitemap.xml ---------- */
const today = new Date().toISOString().slice(0, 10);
writeFileSync(new URL('./dist/sitemap.xml', import.meta.url),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`);

/* ---------- 7) llms.txt (compact, English default) ---------- */
let llms = `# Design Patterns Interactive – C# & Python

> Free, interactive learning tool covering all 23 Gang-of-Four design patterns plus 21 modern patterns (concurrency, enterprise/architecture, cloud resilience). Every pattern with intent, real-world analogy, when-to-use criteria, pros/cons and complete code examples in BOTH C# and Python. Bilingual English/German. 44 patterns, 88 code examples, 5 live demos. No sign-up, no cost, no trackers.

URL: ${BASE_URL}
Full content for LLMs: ${BASE_URL}llms-full.txt

## Categories and patterns

`;
for (const [key, cat] of Object.entries(CATEGORIES)) {
  const items = PATTERNS.filter(p => p.cat === key);
  llms += `### ${cat.name.en} / ${cat.name.de}${cat.gof ? ' (Gang of Four)' : ''}\n`;
  for (const p of items) llms += `- [${p.name}](${BASE_URL}#${p.id}): ${p.short.en}\n`;
  llms += '\n';
}
llms += `## FAQ\n\n`;
for (const [q, a] of FAQ) llms += `**${q}**\n${a}\n\n`;
writeFileSync(new URL('./dist/llms.txt', import.meta.url), llms);

/* ---------- 8) llms-full.txt (full content incl. code, English default) ---------- */
let full = llms + '\n---\n\n# Full pattern reference\n\n';
for (const [key, cat] of Object.entries(CATEGORIES)) {
  const items = PATTERNS.filter(p => p.cat === key);
  full += `\n## ${cat.name.en} / ${cat.name.de}\n\n${cat.desc.en}\n\n`;
  for (const p of items) {
    full += `### ${p.name}${p.gof ? ' (GoF)' : ' (Beyond GoF)'}\n\n`;
    full += `**Intent:** ${p.intent.en}\n\n`;
    full += `**Analogy:** ${p.analogy.en}\n\n`;
    full += `**When to use:**\n${p.use.en.map(u => '- ' + u).join('\n')}\n\n`;
    full += `**Pros:** ${p.pros.en.join('; ')}\n\n`;
    full += `**Cons:** ${p.cons.en.join('; ')}\n\n`;
    full += '**C# example:**\n```csharp\n' + p.csharp + '\n```\n\n';
    full += '**Python example:**\n```python\n' + p.python + '\n```\n\n';
    full += `Direct link: ${BASE_URL}#${p.id}\n\n`;
  }
}
writeFileSync(new URL('./dist/llms-full.txt', import.meta.url), full);

console.log('Build fertig: dist/index.html, robots.txt, sitemap.xml, llms.txt, llms-full.txt');
console.log('HTML-Größe:', (html.length / 1024).toFixed(0), 'KB | llms-full:', (full.length / 1024).toFixed(0), 'KB');
