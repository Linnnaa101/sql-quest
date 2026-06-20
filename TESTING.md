# SQL Quest – Manuelle Test-Checkliste

Diese Checkliste dient der manuellen Qualitätsprüfung der aktuellen MVP-Version von SQL Quest vor der Umsetzung weiterer Features.

## Vorbereitung

- [ ] GitHub-Pages-Version öffnen
- [ ] Seite mit <kbd>Strg</kbd> + <kbd>F5</kbd> neu laden
- [ ] Browser-Konsole auf sichtbare Fehler prüfen

## Datenbank

- [ ] Startseite öffnen
- [ ] Button zum Erstellen der Übungsdatenbank klicken
- [ ] Erfolgsnachricht prüfen
- [ ] Datenbank-Info öffnen
- [ ] Tabellen `kunden`, `produkte`, `bestellungen` und `bestellpositionen` prüfen
- [ ] Zurück zu den Leveln wechseln

## Anfänger-Level

- [ ] Level 1 mit `SELECT * FROM kunden;` lösen
- [ ] Level 2 mit `SELECT name FROM kunden;` lösen
- [ ] Level 3 mit `SELECT * FROM kunden WHERE stadt = 'Berlin';` lösen
- [ ] Level 4 mit `SELECT * FROM kunden ORDER BY punkte DESC;` lösen
- [ ] Level 5 mit `SELECT COUNT(*) FROM kunden;` lösen
- [ ] Level 6 mit `SELECT * FROM kunden LIMIT 3;` lösen
- [ ] Level 7 mit `SELECT * FROM kunden WHERE punkte > 100;` lösen
- [ ] Level 8 mit `SELECT * FROM kunden WHERE name LIKE 'A%';` lösen
- [ ] Level 9 mit `SELECT * FROM kunden WHERE stadt = 'Berlin' AND punkte > 100;` lösen
- [ ] Level 10 mit `SELECT AVG(alter_jahre) FROM kunden;` lösen

## Eingabe und Lösungen

- [ ] Neue, ungelöste Level starten mit leerem SQL-Feld
- [ ] Gelöste Level zeigen die gespeicherte eigene SQL-Abfrage
- [ ] Tipp-Lampe oben rechts im SQL-Kasten funktioniert
- [ ] „Lösung anzeigen“ zeigt die Musterlösung
- [ ] „Lösung anzeigen“ vergibt keine Punkte und löst das Level nicht automatisch
- [ ] Falsche SQL-Abfrage zeigt eine verständliche Rückmeldung
- [ ] Leere SQL-Abfrage zeigt eine verständliche Rückmeldung

## Sicherheit

- [ ] `DROP TABLE kunden;` wird blockiert
- [ ] `DELETE FROM kunden;` wird blockiert
- [ ] `UPDATE kunden SET punkte = 0;` wird blockiert
- [ ] `INSERT INTO kunden VALUES (...);` wird blockiert

## Fortschritt und Reset

- [ ] Punktestand erhöht sich bei korrekt gelösten Leveln
- [ ] Seite neu laden und gespeicherten Fortschritt prüfen
- [ ] Reset ausführen
- [ ] Punktestand, gelöste Level und gespeicherte SQL-Abfragen sind danach zurückgesetzt

## Oberfläche

- [ ] Ansicht auf Desktop prüfen
- [ ] Ansicht auf Smartphone oder schmalem Browserfenster prüfen
- [ ] Buttons bleiben erreichbar und lesbar
- [ ] SQL-Eingabefeld ist gut nutzbar
- [ ] Es gibt keine überlappenden Elemente

## Ergebnis

- [ ] Keine kritischen Fehler gefunden
- [ ] Gefundene Probleme als GitHub Issues dokumentiert
