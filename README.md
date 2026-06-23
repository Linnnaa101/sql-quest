# SQL Quest

SQL Quest ist eine interaktive Lernanwendung, mit der Nutzer SQL Schritt für Schritt anhand eines Shop-Datenmodells üben können. Die Anwendung läuft direkt im Browser und führt SQL-Abfragen gegen eine vorbereitete SQLite-Datenbank aus.

## Funktionen

- 80 interaktive SQL-Level mit direkter Abfrageausführung im Browser
- Hinweise und Lösungen je Level
- Sternesystem zur Freischaltung weiterer Level
- Gespeicherter Fortschritt im Browser
- Lernhilfen zu bereits freigeschalteten SQL-Bausteinen
- Tab „Was habe ich gelernt?“ mit Überblick über den Lernfortschritt
- Schwebender Zurück-Button und Nach-oben-Button
- Responsive Darstellung für Desktop und Mobilgeräte
- Abschlussseite nach Level 80 mit Punktzahl, gelösten Leveln und Sternen
- Automatisierte Node-Basistests und GitHub Actions für Syntax-, Diff- und Funktionstests
- Versteckter Testmodus für Entwicklung über `?testmode=1`

## Lernpfade

### Anfänger

- Level 1–30
- Themen:
  - `SELECT` und `FROM`
  - Spalten auswählen
  - `WHERE`
  - `ORDER BY`
  - `LIMIT`
  - `LIKE`
  - `AND`, `OR` und `NOT`
  - `COUNT`, `AVG`, `SUM`, `MIN` und `MAX`
  - `DISTINCT`
  - `GROUP BY` und `HAVING`

### Fortgeschritten

- Wird nach Abschluss von Level 30 freigeschaltet
- Level 31–60
- Themen:
  - `INNER JOIN`
  - `LEFT JOIN`
  - `ON`-Bedingungen
  - JOINs über mehrere Tabellen
  - `COUNT` und `SUM` mit JOIN
  - `GROUP BY`, `ORDER BY` und `HAVING` mit JOIN
  - Bestellwerte und Shop-Auswertungen
  - Unterabfragen
  - `IN` und `NOT IN`
  - `EXISTS` und `NOT EXISTS`
  - Vergleiche mit `AVG` und komplexere Filter


### Meister

- Wird nach Abschluss von Level 60 freigeschaltet
- Level 61–80
- Themen:
  - `CASE WHEN` für Umsatzkategorien und verständliche Einordnungen
  - CTEs mit `WITH` für übersichtliche Zwischenergebnisse
  - verschachtelte Unterabfragen als Alternative für komplexe Vergleichswerte
  - mehrstufige Unterabfragen mit `AVG`, `GROUP BY` und `HAVING`
  - komplexe JOIN-Auswertungen über Kunden, Bestellungen, Bestellpositionen und Produkte
  - `NULL` und `COALESCE()` für fehlende Daten und sinnvolle Ersatzwerte
  - SQLite-Datumsfunktionen wie `date()` und `strftime()` für Monats- und Jahresauswertungen
  - Window Functions mit `ROW_NUMBER()`, `RANK()` und `OVER (ORDER BY ...)`
  - `PARTITION BY` für Rankings innerhalb von Gruppen
  - laufende Summen mit Window Functions
  - Meister-Challenges mit `JOIN`, Unterabfrage oder CTE, `CASE WHEN`, `COALESCE`, `GROUP BY`, `HAVING`, Window Functions und `PARTITION BY`
  - Bestellwertberechnung mit `menge * einzelpreis`

## Fortschritt und Freischaltung

- Neue Level werden normalerweise mit mindestens zwei Sternen im vorherigen Level freigeschaltet.
- Level 31 wird direkt nach dem Lösen von Level 30 freigeschaltet.
- Level 41 wird direkt nach dem Lösen von Level 40 freigeschaltet.
- Level 51 wird direkt nach dem Lösen von Level 50 freigeschaltet.
- Level 61 wird direkt nach dem Lösen von Level 60 freigeschaltet.
- Für Level 62–80 sind mindestens zwei Sterne im vorherigen Level erforderlich.
- Der aktuelle Fortschritt wird lokal im Browser gespeichert.

## Datenmodell

SQL Quest verwendet eine kleine Shop-Datenbank mit vier Tabellen:

- `kunden`: Kundendaten wie Name, Stadt, Alter und Punkte
- `produkte`: Produktdaten wie Name, Kategorie, Preis und Lagerbestand
- `bestellungen`: Bestellungen mit Kundenzuordnung, Datum und Status
- `bestellpositionen`: Einzelne Positionen einer Bestellung mit Produkt, Menge und Einzelpreis

Diese Tabellen werden für realistische Shop-Abfragen und JOIN-Übungen verwendet.

## Projekt starten

SQL Quest ist eine statische HTML/CSS/JavaScript-Anwendung. Es wird kein Build-Schritt benötigt. Die automatisierten Tests laufen mit Node.js und `npm test`.

Repository klonen und einen einfachen lokalen Webserver starten:

```bash
git clone <repository-url>
cd sql-quest
python3 -m http.server
```

Danach im Browser öffnen:

```text
http://localhost:8000
```

Alternativ kann `index.html` direkt in einem modernen Browser geöffnet werden. Für `sql.js` wird eine Internetverbindung benötigt, weil die Bibliothek über ein CDN geladen wird.

## Technologien

- HTML
- CSS
- JavaScript
- sql.js / SQLite im Browser

## Projektstruktur

```text
index.html
style.css
app.js
levels.js
database.js
README.md
quest-logic.js
tests/run-tests.js
.github/workflows/tests.yml
```

## Live-Demo

Die Anwendung ist über GitHub Pages erreichbar:

[SQL Quest öffnen](https://linnnaa101.github.io/sql-quest/)

## Testmodus für Entwicklung

Zum schnellen Testen aller Level kann der Testmodus über diesen Link geöffnet werden:

[Testmodus öffnen](https://linnnaa101.github.io/sql-quest/?testmode=1)

Im Testmodus können alle Level freigeschaltet, alle Level als gelöst markiert, der Fortschritt zurückgesetzt sowie die Bereiche Anfänger, Fortgeschritten und Meister direkt geöffnet werden.

Ohne den URL-Parameter `?testmode=1` bleibt dieser Bereich in der Anwendung unsichtbar.


## Automatisierte Tests

Die Basis-Tests prüfen Levelstruktur, Freischaltlogik, SQL-Sicherheitslogik und Testmodus-Helfer. Lokal ausführen:

```bash
node --check app.js
node --check levels.js
git diff --check
npm test
```

Der Workflow `.github/workflows/tests.yml` führt diese Checks automatisch bei Pushes und Pull Requests aus.

## Abschluss nach Level 80

Nach erfolgreichem Lösen von Level 80 erscheint eine Abschlusskarte mit gelösten Leveln, Gesamtpunktzahl, erreichten Sternen und der Bestätigung, dass Anfänger-, Fortgeschrittenen- und Meisterbereich abgeschlossen wurden. Der Abschluss bleibt nach einem Neuladen über den gespeicherten Browser-Fortschritt erreichbar und wird durch „Fortschritt zurücksetzen“ entfernt.
