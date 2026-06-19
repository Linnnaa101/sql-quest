# SQL Quest

SQL Quest ist ein browserbasiertes Lernspiel zum Erlernen von SQL und grundlegenden Datenbankkonzepten. Die aktuelle MVP-Version läuft vollständig im Browser, nutzt SQLite über `sql.js` und benötigt kein Backend, keine Frameworks und keine Build-Tools.

## Ziel des Spiels

Anfängerinnen und Anfänger sollen SQL-Abfragen Schritt für Schritt üben können. Jede Quest erklärt ein kleines SQL-Konzept, stellt eine Aufgabe und prüft die Lösung anhand des tatsächlichen Abfrageergebnisses.

## Aktueller MVP-Funktionsumfang

- Moderne Start- und Spieloberfläche mit dem Titel **SQL Quest**
- Fünf Anfänger-Level zu `SELECT`, Spaltenauswahl, `WHERE`, `ORDER BY` und `COUNT(*)`
- SQLite-Datenbank im Browser mit einer Beispiel-Tabelle `kunden`
- SQL-Eingabefeld mit Starter-Abfragen
- Ausführen von lesenden SQL-Abfragen über `sql.js`
- Ergebnisanzeige als Tabelle
- Bewertungslogik über Ergebnisvergleich statt reinem Textvergleich
- Verständliches Feedback für richtige und falsche Lösungen
- Hinweise pro Level
- Punktestand und gelöste Level mit Speicherung im `localStorage`
- Sicherheitsblockade für schreibende oder strukturelle SQL-Befehle wie `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER` und weitere
- Responsives Kartenlayout für Desktop und mobile Geräte

## Starten im Browser

1. Repository klonen oder herunterladen.
2. Die Datei `index.html` direkt in einem modernen Browser öffnen.
3. Falls der Browser lokale CDN-Anfragen blockiert, das Projekt optional mit einem einfachen statischen Server starten, zum Beispiel:

   ```bash
   python3 -m http.server 8000
   ```

4. Danach `http://localhost:8000` öffnen.

> Hinweis: Für `sql.js` wird eine Internetverbindung benötigt, weil die Bibliothek im MVP über ein CDN geladen wird.

## Geplante nächste Schritte

- Weitere Level und Themen wie `LIMIT`, Aggregationen, `GROUP BY` und Joins ergänzen
- Level-Gruppen und Schwierigkeitsstufen ausbauen
- Bessere SQL-Editor-Funktionen wie Syntax-Highlighting oder Autoformatierung hinzufügen
- Ausführlichere Erklärungen und Lernkarten integrieren
- Optional Import/Export des Lernfortschritts ergänzen
- Automatisierte Browser-Tests für die wichtigsten Spielabläufe einführen
