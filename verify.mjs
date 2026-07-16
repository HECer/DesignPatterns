import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(async () => {
  const pw = await import('playwright');
  return pw.chromium.launch();
});
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

await page.goto('file:///home/claude/patterns-site/dist/index.html');
await page.waitForTimeout(1600);

// 1. Grundzustand + Cookie-Banner
const bannerVisible = await page.isVisible('#pvDialog');
const patternCount = await page.evaluate(() => PATTERNS.length);
const cardCount = await page.locator('.pcard').count();
console.log('Banner sichtbar:', bannerVisible, '| PATTERNS:', patternCount, '| Karten:', cardCount);
await page.screenshot({ path: 'shot1_banner.png' });

// 2. Nur Notwendige ablehnen → Banner weg
await page.click('.pv-no');
await page.waitForTimeout(400);
console.log('Banner nach Ablehnen:', await page.isVisible('#pvDialog'));

// 3. Pattern-Modal öffnen (Observer) + Tabs testen
await page.evaluate(() => openPattern('observer'));
await page.waitForTimeout(600);
console.log('Modal offen:', await page.isVisible('#modalBox'));
await page.screenshot({ path: 'shot2_modal_explain.png' });
await page.evaluate(() => switchTab('csharp'));
await page.waitForTimeout(300);
const codeVisible = await page.isVisible('#pane-csharp .code');
console.log('C#-Code sichtbar:', codeVisible);
await page.screenshot({ path: 'shot3_modal_code.png' });

// 4. Live-Demo testen
await page.evaluate(() => switchTab('demo'));
await page.waitForTimeout(300);
await page.evaluate(() => { demoObsSub('display'); demoObsSet(35); });
await page.waitForTimeout(300);
const demoOut = await page.textContent('#demo-out-observer');
console.log('Demo-Output enthält Display:', demoOut.includes('Display'));
await page.screenshot({ path: 'shot4_demo.png' });
await page.keyboard.press('Escape');

// 5. Sprachumschaltung EN
await page.click('#lang-en');
await page.waitForTimeout(500);
const heroEn = await page.textContent('.hero h1');
console.log('Hero EN:', heroEn.trim().replace(/\s+/g, ' '));

// 6. Suche
await page.fill('#search', 'saga');
await page.waitForTimeout(400);
console.log('Suchtreffer "saga":', await page.locator('.pcard:visible').count());
await page.fill('#search', 'xyz123nichtda');
await page.waitForTimeout(400);
console.log('NoResults sichtbar:', await page.isVisible('#noResults'));
await page.fill('#search', '');
await page.waitForTimeout(300);

// 7. Kategorie-Filter
await page.evaluate(() => setCat('concurrency'));
await page.waitForTimeout(300);
console.log('Concurrency-Karten:', await page.locator('.pcard').count());
await page.evaluate(() => setCat('all'));

// 8. Impressum & Datenschutz
await page.evaluate(() => showPage('impressum'));
await page.waitForTimeout(300);
console.log('Impressum sichtbar:', await page.isVisible('#page-impressum'));
await page.evaluate(() => showPage('datenschutz'));
await page.waitForTimeout(300);
console.log('Datenschutz sichtbar:', await page.isVisible('#page-datenschutz'));
await page.screenshot({ path: 'shot5_datenschutz.png' });
await page.evaluate(() => showMain());

// 9. Cookie-Einstellungen erneut öffnen (Widerruf) + Alle akzeptieren + Lernfortschritt
await page.evaluate(() => openCookieSettings());
await page.waitForTimeout(300);
await page.click('.pv-yes');
await page.waitForTimeout(300);
await page.evaluate(() => openPattern('singleton'));
await page.waitForTimeout(400);
await page.click('#learnBtn');
await page.waitForTimeout(300);
const learnedCount = await page.textContent('#learnedCount');
console.log('Gelernt-Zähler:', learnedCount);
await page.keyboard.press('Escape');

// 10. Alle 44 Patterns einmal öffnen (Smoke-Test aller Tabs)
const ids = await page.evaluate(() => PATTERNS.map(p => p.id));
for (const id of ids) {
  await page.evaluate(i => { openPattern(i); switchTab('csharp'); switchTab('python'); switchTab('proscons'); closeModal(); }, id);
}
console.log('Alle', ids.length, 'Patterns geöffnet ohne Absturz.');

// Vollseiten-Screenshot
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
await page.screenshot({ path: 'shot6_full.png', fullPage: false });

console.log('JS-FEHLER:', errors.length ? errors.join(' || ') : 'keine ✓');
await browser.close();
