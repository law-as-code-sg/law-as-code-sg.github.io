# KiBG-Rechner (SvelteKit)

Oberfläche des Rechners: Fragebogen, Berechnen, Ergebnis. Gerechnet wird
ausschliesslich in OpenFisca (`../openfisca-CH-SG`); dieses Projekt setzt nur
die Werte in die Texte ein. OpenFisca läuft dabei **im Browser**: Pyodide
(Python als WebAssembly) in einem Web Worker, mit derselben Funktion wie die
OpenFisca-Web-API (`openfisca_web_api.handlers.calculate`). Es gibt keinen
Server; die Website ist statisch und läuft auf GitHub Pages. Die Angaben
verlassen den Browser nicht.

## Starten

```bash
cd frontend && npm install
# Pyodide, Python-Pakete und Modell nach static/pyodide/ (braucht Python mit pip).
# Nach jeder Änderung am Modell erneut ausführen.
bash ../tools/build_pyodide.sh
npm run dev          # http://localhost:5173
```

Statische Website bauen und ansehen: `npm run build && npm run preview`.
Auf GitHub Pages veröffentlicht der Workflow `.github/workflows/pages.yaml`
bei jedem Push auf `main`.

Die Tests in `tests/api.test.js` prüfen die Situationen gegen die
OpenFisca-Web-API (`cd openfisca-CH-SG && make serve-local`, Port 5000); ohne
API werden sie übersprungen. `OPENFISCA_URL=http://… npm test` für eine andere
Adresse.

## Aufbau

| Datei | Inhalt |
|---|---|
| `src/lib/texte.de.json` | Alle Texte (Fragen, Hilfen, Ergebnis, Hinweise). Ohne Code bearbeitbar |
| `src/routes/+page.svelte` | Tab «Home» (`/`), noch leer |
| `src/routes/rechner/+page.svelte` | Tab «Rechner» (`/rechner`): Fragebogen (Haushalt, Erziehungsberechtigte, Kinder), Pflichtangaben, Berechnen |
| `src/routes/dashboard/+page.svelte` | Tab «Dashboard» (`/dashboard`): Vergleich «Mehr arbeiten – welche Betreuung – was bleibt?». Pensum einer frei wählbaren Person × Betreuungsform (Kita, Tagesfamilie, schulergänzend), mit dem Einkommen laut letzter Steuerveranlagung; Wochenplan, Kennzahlen, Linien- und Balken-Chart, Tabelle |
| `src/routes/ueberblick/+page.svelte` | Tab «Überblick» (`/ueberblick`): Ablauf der Gesuchstellung in 6 Schritten als Diagramm, je Schritt «Sie tun» und «Das passiert ohne Sie», Zeitstrahl der 30-Tage-Frist |
| `src/lib/ablauf.de.json` | Texte des Ablaufs mit Artikelverweisen. Ohne Code bearbeitbar |
| `src/routes/gesetzgebung/+page.svelte` | Tab «Gesetzgebung» (`/gesetzgebung`): Wortlaut von KiBG und KiBV (Entwurf), jeder Artikel, Absatz und Buchstabe mit Sprungmarke (z. B. `#kibg-art-9-abs-2`); Links auf die PDF-Fassungen |
| `src/lib/recht/kibg.md`, `src/lib/recht/kibv.md` | Wortlaut als Markdown, gegliedert wie im Erlass (Ziffer, Abschnitt, Artikel, Absatz, lit., Ziffer); aus `challenge/*.pdf`, Wort für Wort geprüft |
| `src/lib/server/recht.js` | Markdown → HTML (marked, marked-footnote), Fussnoten je Erlass mit eigener Sprungmarke; läuft beim Bauen |
| `src/lib/quellen.js`, `src/lib/Quelle.svelte` | Verweis wie «KiBG 9 Abs. 2» → Link auf die Sprungmarke im Tab «Gesetzgebung» (`/gesetzgebung#kibg-art-9-abs-2`); `tests/quellen.test.js` prüft, dass es jede Sprungmarke gibt |
| `src/lib/vergleich.js` | Wochenplan mit Halbtagen (Mo–Fr, Vormittag und Nachmittag; 1 Halbtag = 10 % Pensum): Betreuung nötig, wenn alle Eltern arbeiten, niemand sonst hilft und das Kind nicht in der Schule ist; Pläne bei anderem Pensum (dazu ab Montag Vormittag, weg ab Freitag Nachmittag); Umrechnung in Monatswerte; Vorgaben für Preise und Stunden pro Halbtag |
| `src/lib/Wochenplan.svelte` | Wochenplan zum Anklicken (heute) und zur Anzeige (beim neuen Pensum); auf dem Handy mit Titel über der Zeile |
| `src/lib/openfisca/vergleich.js` | Ein Haushalt je Stufe × Form in einer OpenFisca-Anfrage; Annahmen: Wohnsitz, anerkannte und angemeldete Einrichtung, rechtzeitiges Gesuch, keine Zusatzbeiträge, ohne Steuern |
| `src/lib/LinienChart.svelte`, `BalkenChart.svelte` | Charts als SVG, ohne zusätzliche Bibliothek |
| `src/lib/Feld.svelte`, `Auswahl.svelte` | Eingabefeld mit Info-Text beim Fokus; Auswahlknöpfe |
| `src/lib/Ergebnis.svelte` | Ergebnis pro Kind: Betrag, Voraussetzungen, Rechenweg, Hinweise |
| `src/lib/darstellung.js` | Werte formatieren und in Texte einsetzen; welche Texte erscheinen («wann») |
| `src/lib/openfisca/situation.js` | Formular → OpenFisca-Situation; Antwort und Fehler auslesen |
| `src/lib/openfisca/browser.js` | `berechnen()` und `vergleichen()`: schickt die Situation an den Web Worker, liest das Ergebnis aus; speichert nichts |
| `src/lib/openfisca/motor.worker.js`, `motor.py` | Web Worker: lädt Pyodide und das Modell aus `/pyodide/`, rechnet wie `POST /calculate` der OpenFisca-Web-API. numexpr und psutil (nicht als WebAssembly verfügbar) sind durch Platzhalter ersetzt |
| `src/app.css` | Design-Tokens: Farben, Schrift, Abstände (Grün an einer Stelle) |
| `src/routes/+layout.svelte` | Kopfzeile und Tabs (Namen in `texte.de.json`, `navigation`) |

Design: nach dem Style-Kit (`style-kit/STYLE.md`), schlank umgesetzt, ohne
Tailwind oder shadcn. Tokens in `src/app.css`: nur hell, neutrale Grautöne,
Ebenen durch Fläche und 1px-Linie statt Schatten, Rundung 8px, Schrift Geist,
Beträge in Geist Mono, kleine Überschriften in Grossbuchstaben. Einzige
Akzentfarbe ist das Grün des Kantons St. Gallen (`--primary`, `--gruen-wappen`
in `app.css`; offiziellen Farbcode dort einsetzen): Hauptknopf, Auswahl, Fokus,
Ergebnis. Eine Seite mit drei Abschnitten als Karten, Info-Text beim Fokus,
Berechnen immer klickbar mit Liste der fehlenden Angaben. Kein Logo oder
Wappen, weil es ein Prototyp ist.

SvelteKit 3 mit `adapter-static`: Konfiguration in `vite.config.js`, Import-Alias
`#lib`, alle Seiten vorgerendert (`src/routes/+layout.js`).
