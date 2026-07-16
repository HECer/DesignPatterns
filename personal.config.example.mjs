/* Vorlage: nach personal.config.mjs kopieren und ausfüllen.
   personal.config.mjs ist GITIGNORED – echte Daten landen nie im Repository.
   `node build.mjs` erzeugt damit:
   - dist/index.html        → Live-Version MIT diesen Daten (für den Webserver)
   - dist-github/index.html → GitHub-Version OHNE Impressum/Datenschutz        */
export default {
  name: 'Max Mustermann',                    // ersetzt [IHR NAME] (Meta, JSON-LD, Footer)
  githubRepoUrl: 'https://github.com/DEIN-NUTZERNAME/design-patterns-interaktiv',
  replacements: {
    '[VOR- UND NACHNAME / FIRMENNAME inkl. Rechtsform]': 'Max Mustermann',
    '[VOR- UND NACHNAME / FIRMA]': 'Max Mustermann',
    '[VOR- UND NACHNAME]': 'Max Mustermann',
    '[STRASSE UND HAUSNUMMER]': 'Musterstraße 1',
    '[PLZ UND ORT]': '12345 Musterstadt',
    '[LAND]': 'Deutschland',
    '[TELEFONNUMMER]': '+49 123 456789',
    '[E-MAIL-ADRESSE]': 'mail@example.com',
    '[UST-IDNR. – falls vorhanden, sonst Abschnitt löschen]': 'DE123456789',
    '[ANSCHRIFT wie oben]': 'Musterstraße 1, 12345 Musterstadt',
    '[NAME UND ANSCHRIFT DES HOSTING-ANBIETERS, z. B. GitHub Pages / Netlify / IONOS / STRATO]': 'Hoster GmbH, Beispielweg 2, 10115 Berlin',
    '[SPEICHERDAUER LT. HOSTER, z. B. 7 Tagen]': '7 Tagen',
    '[FALLS DER HOSTER AUSSERHALB DER EU SITZT (z. B. GitHub Pages/USA): Hinweis auf Drittlandübermittlung, EU-Standardvertragsklauseln bzw. EU-US Data Privacy Framework ergänzen. Auftragsverarbeitungsvertrag (AVV) mit dem Hoster abschließen, sofern angeboten.]': '',
    '[DATUM DER VERÖFFENTLICHUNG]': '16.07.2026'
  }
};
