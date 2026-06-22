# SQL Quest

SQL Quest ist eine interaktive Lernanwendung, mit der Nutzer SQL Schritt für Schritt anhand eines Shop-Datenmodells üben können. Die Anwendung läuft direkt im Browser und führt SQL-Abfragen gegen eine vorbereitete SQLite-Datenbank aus.

## Funktionen

- Interaktive SQL-Level mit direkter Abfrageausführung im Browser
- Hinweise und Lösungen je Level
- Sternesystem zur Freischaltung weiterer Level
- Gespeicherter Fortschritt im Browser
- Lernhilfen zu bereits freigeschalteten SQL-Bausteinen
- Tab „Was habe ich gelernt?“ mit Überblick über den Lernfortschritt
- Schwebender Zurück-Button und Nach-oben-Button
- Responsive Darstellung für Desktop und Mobilgeräte

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
- Level 31–50
- Themen:
  - `INNER JOIN`
  - `LEFT JOIN`
  - `ON`-Bedingungen
  - JOINs über mehrere Tabellen
  - `COUNT` und `SUM` mit JOIN
  - `GROUP BY`, `ORDER BY` und `HAVING` mit JOIN
  - Bestellwerte und Shop-Auswertungen

## Fortschritt und Freischaltung

- Neue Level werden normalerweise mit mindestens zwei Sternen im vorherigen Level freigeschaltet.
- Level 31 wird direkt nach dem Lösen von Level 30 freigeschaltet.
- Level 41 wird direkt nach dem Lösen von Level 40 freigeschaltet.
- Der aktuelle Fortschritt wird lokal im Browser gespeichert.

## Datenmodell

SQL Quest verwendet eine kleine Shop-Datenbank mit vier Tabellen:

- `kunden`: Kundendaten wie Name, Stadt, Alter und Punkte
- `produkte`: Produktdaten wie Name, Kategorie, Preis und Lagerbestand
- `bestellungen`: Bestellungen mit Kundenzuordnung, Datum und Status
- `bestellpositionen`: Einzelne Positionen einer Bestellung mit Produkt, Menge und Einzelpreis

Diese Tabellen werden für realistische Shop-Abfragen und JOIN-Übungen verwendet.

## Projekt starten

SQL Quest ist eine statische HTML/CSS/JavaScript-Anwendung. Es werden keine Paketmanager-Befehle und kein Build-Schritt benötigt.

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
```

## Live-Demo

Die Anwendung ist über GitHub Pages erreichbar:

[SQL Quest öffnen](https://linnnaa101.github.io/sql-quest/)
