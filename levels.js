// Die ersten MVP-Level für SQL Quest. Jedes Level enthält alle Texte für die Oberfläche
// und eine erwartete Abfrage, deren Ergebnis mit der Spieler-Abfrage verglichen wird.
const LEVELS = [
  {
    id: 1,
    title: 'Alle Kunden anzeigen',
    difficulty: 'Anfänger',
    topic: 'SELECT',
    explanation: 'Mit SELECT liest man Daten aus einer Tabelle. Das Sternchen * bedeutet, dass alle Spalten angezeigt werden.',
    task: 'Zeige alle Kunden aus der Tabelle kunden an.',
    starterSql: 'SELECT * FROM kunden;',
    expectedSql: 'SELECT * FROM kunden;',
    hint: 'Verwende SELECT * FROM kunden;',
    points: 10
  },
  {
    id: 2,
    title: 'Nur Namen anzeigen',
    difficulty: 'Anfänger',
    topic: 'Spalten auswählen',
    explanation: 'Man kann gezielt auswählen, welche Spalten angezeigt werden sollen.',
    task: 'Zeige nur die Namen aller Kunden an.',
    starterSql: 'SELECT name FROM kunden;',
    expectedSql: 'SELECT name FROM kunden;',
    hint: 'Schreibe die Spalte name direkt nach SELECT.',
    points: 10
  },
  {
    id: 3,
    title: 'Kunden aus Berlin finden',
    difficulty: 'Anfänger',
    topic: 'WHERE',
    explanation: 'Mit WHERE filtert man Datensätze.',
    task: 'Zeige alle Kunden an, die aus Berlin kommen.',
    starterSql: "SELECT * FROM kunden WHERE stadt = 'Berlin';",
    expectedSql: "SELECT * FROM kunden WHERE stadt = 'Berlin';",
    hint: 'Filtere nach der Spalte stadt.',
    points: 10
  },
  {
    id: 4,
    title: 'Nach Punkten sortieren',
    difficulty: 'Anfänger',
    topic: 'ORDER BY',
    explanation: 'Mit ORDER BY sortiert man Ergebnisse. Mit DESC wird absteigend sortiert.',
    task: 'Zeige alle Kunden an, sortiert nach Punkten. Die meisten Punkte sollen oben stehen.',
    starterSql: 'SELECT * FROM kunden ORDER BY punkte DESC;',
    expectedSql: 'SELECT * FROM kunden ORDER BY punkte DESC;',
    hint: 'Verwende ORDER BY punkte DESC.',
    points: 10
  },
  {
    id: 5,
    title: 'Kunden zählen',
    difficulty: 'Anfänger',
    topic: 'COUNT',
    explanation: 'Mit COUNT(*) zählt man Zeilen.',
    task: 'Zähle, wie viele Kunden in der Tabelle gespeichert sind.',
    starterSql: 'SELECT COUNT(*) FROM kunden;',
    expectedSql: 'SELECT COUNT(*) FROM kunden;',
    hint: 'Verwende COUNT(*).',
    points: 10
  }
];
