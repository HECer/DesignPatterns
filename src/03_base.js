<script>
'use strict';
/* ============================================================
   Daten-Basis: Kategorien, UI-Übersetzungen, Pattern-Registry
   ============================================================ */
const CATEGORIES = {
  creational: {
    color: 'var(--cat-creational)', gof: true,
    name: { de: 'Erzeugungsmuster', en: 'Creational Patterns' },
    desc: {
      de: 'Wie werden Objekte erzeugt? Diese Muster entkoppeln den Code von konkreten Klassen und machen die Objekterstellung flexibel, kontrollierbar und wiederverwendbar.',
      en: 'How are objects created? These patterns decouple code from concrete classes and make object creation flexible, controllable and reusable.'
    }
  },
  structural: {
    color: 'var(--cat-structural)', gof: true,
    name: { de: 'Strukturmuster', en: 'Structural Patterns' },
    desc: {
      de: 'Wie werden Klassen und Objekte zu größeren Strukturen zusammengesetzt? Diese Muster vereinfachen Beziehungen und schaffen flexible, effiziente Architekturen.',
      en: 'How are classes and objects composed into larger structures? These patterns simplify relationships and create flexible, efficient architectures.'
    }
  },
  behavioral: {
    color: 'var(--cat-behavioral)', gof: true,
    name: { de: 'Verhaltensmuster', en: 'Behavioral Patterns' },
    desc: {
      de: 'Wie kommunizieren Objekte und wie werden Verantwortlichkeiten verteilt? Diese Muster organisieren Abläufe, Zuständigkeiten und Algorithmen.',
      en: 'How do objects communicate and how are responsibilities distributed? These patterns organize workflows, responsibilities and algorithms.'
    }
  },
  concurrency: {
    color: 'var(--cat-concurrency)', gof: false,
    name: { de: 'Nebenläufigkeit', en: 'Concurrency Patterns' },
    desc: {
      de: 'Muster für Multithreading und asynchrone Programmierung: sichere Kommunikation zwischen Threads, effiziente Ressourcennutzung und Vermeidung von Race Conditions.',
      en: 'Patterns for multithreading and asynchronous programming: safe communication between threads, efficient resource usage and avoiding race conditions.'
    }
  },
  architectural: {
    color: 'var(--cat-architectural)', gof: false,
    name: { de: 'Architektur & Enterprise', en: 'Architectural & Enterprise' },
    desc: {
      de: 'Muster oberhalb der Klassenebene: Sie strukturieren ganze Anwendungen und Datenzugriffsschichten – von MVC bis Event Sourcing (u. a. nach Martin Fowler).',
      en: 'Patterns above class level: they structure entire applications and data access layers – from MVC to Event Sourcing (following Martin Fowler et al.).'
    }
  },
  resilience: {
    color: 'var(--cat-resilience)', gof: false,
    name: { de: 'Resilienz & Cloud', en: 'Resilience & Cloud' },
    desc: {
      de: 'Moderne Muster für verteilte Systeme und Microservices: Wie bleibt ein System stabil, wenn Netzwerke ausfallen und Dienste Fehler werfen?',
      en: 'Modern patterns for distributed systems and microservices: how does a system stay stable when networks fail and services throw errors?'
    }
  }
};

const I18N = {
  de: {
    siteTitle: 'Design Patterns Interaktiv',
    searchPh: 'Pattern suchen … (z. B. Singleton)',
    learned: 'gelernt',
    eyebrow: 'C# · Python · Zweisprachig',
    heroA: 'Design Patterns,',
    heroB: 'endlich verständlich.',
    heroSub: 'Alle klassischen Gang-of-Four-Muster plus moderne Concurrency-, Enterprise- und Cloud-Patterns – interaktiv erklärt, mit Praxis-Beispielen in C# und Python.',
    statLang: 'Sprachen', statCats: 'Kategorien', statEx: 'Code-Beispiele',
    noRes: 'Kein Pattern gefunden. Versuche einen anderen Suchbegriff.',
    all: 'Alle', gofBadge: 'Gang of Four', beyondBadge: 'Beyond GoF',
    tabExplain: 'Erklärung', tabCs: 'C#', tabPy: 'Python', tabPro: 'Vor- & Nachteile', tabDemo: 'Live-Demo',
    intent: 'Absicht', analogy: 'Analogie aus dem Alltag', whenUse: 'Wann einsetzen?',
    pros: 'Vorteile', cons: 'Nachteile', relatedH: 'Verwandte Patterns',
    copy: 'Kopieren', copied: '✓ Kopiert', copyFail: 'Kopieren nicht möglich',
    markLearned: 'Als gelernt markieren', unmarkLearned: '✓ Gelernt – Markierung entfernen',
    learnedToast: 'Fortschritt gespeichert 🎉',
    needConsent: 'Um den Lernfortschritt zu speichern, aktiviere bitte „Funktional" in den Cookie-Einstellungen.',
    back: 'Zurück zur Übersicht',
    footTag: 'Design Patterns Interaktiv – freies Lernwerkzeug',
    footPrivacy: 'Datenschutz', footCookies: 'Cookie-Einstellungen',
    cbTitle: 'Privatsphäre-Einstellungen',
    cbText: 'Diese Website nutzt ausschließlich lokale Speicherung in Ihrem Browser (keine Tracking-Cookies, keine Datenübertragung an Dritte). Funktionale Einträge – Sprachwahl und Lernfortschritt – werden nur mit Ihrer Einwilligung gespeichert. Details:',
    cbLink: 'Datenschutzerklärung',
    cbEssName: 'Notwendig',
    cbEssDesc: 'Speichert nur Ihre Auswahl in diesem Banner (dp_consent, 12 Monate). Ohne diesen Eintrag müssten wir bei jedem Besuch erneut fragen.',
    cbFunName: 'Funktional',
    cbFunDesc: 'Merkt sich Ihre Sprache (dp_lang) und Ihren Lernfortschritt (dp_progress) – nur lokal auf Ihrem Gerät, bis zum Widerruf.',
    cbReject: 'Alle ablehnen', cbSave: 'Auswahl speichern', cbAccept: 'Alle akzeptieren',
    cbNote: 'Widerruf jederzeit über „Cookie-Einstellungen" im Seitenfuß – genauso einfach wie die Einwilligung.',
    demoHint: 'Probiere das Pattern direkt aus:',
    consentSaved: 'Einstellungen gespeichert ✓'
  },
  en: {
    siteTitle: 'Design Patterns Interactive',
    searchPh: 'Search patterns … (e.g. Singleton)',
    learned: 'learned',
    eyebrow: 'C# · Python · Bilingual',
    heroA: 'Design patterns,',
    heroB: 'finally understandable.',
    heroSub: 'All classic Gang-of-Four patterns plus modern concurrency, enterprise and cloud patterns – explained interactively, with practical examples in C# and Python.',
    statLang: 'Languages', statCats: 'Categories', statEx: 'Code Examples',
    noRes: 'No pattern found. Try a different search term.',
    all: 'All', gofBadge: 'Gang of Four', beyondBadge: 'Beyond GoF',
    tabExplain: 'Explanation', tabCs: 'C#', tabPy: 'Python', tabPro: 'Pros & Cons', tabDemo: 'Live Demo',
    intent: 'Intent', analogy: 'Real-world analogy', whenUse: 'When to use?',
    pros: 'Advantages', cons: 'Disadvantages', relatedH: 'Related patterns',
    copy: 'Copy', copied: '✓ Copied', copyFail: 'Copy failed',
    markLearned: 'Mark as learned', unmarkLearned: '✓ Learned – remove mark',
    learnedToast: 'Progress saved 🎉',
    needConsent: 'To save your progress, please enable "Functional" in the cookie settings.',
    back: 'Back to overview',
    footTag: 'Design Patterns Interactive – free learning tool',
    footPrivacy: 'Privacy', footCookies: 'Cookie Settings',
    cbTitle: 'Privacy Settings',
    cbText: 'This website only uses local storage in your browser (no tracking cookies, no data transfer to third parties). Functional entries – language choice and learning progress – are only stored with your consent. Details:',
    cbLink: 'Privacy Policy',
    cbEssName: 'Essential',
    cbEssDesc: 'Only stores your choice in this banner (dp_consent, 12 months). Without it we would have to ask on every visit.',
    cbFunName: 'Functional',
    cbFunDesc: 'Remembers your language (dp_lang) and learning progress (dp_progress) – locally on your device only, until revoked.',
    cbReject: 'Reject all', cbSave: 'Save selection', cbAccept: 'Accept all',
    cbNote: 'Revoke anytime via "Cookie Settings" in the footer – just as easy as giving consent.',
    demoHint: 'Try the pattern right here:',
    consentSaved: 'Settings saved ✓'
  }
};

const PATTERNS = [];
</script>
