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
    expectedSql: 'SELECT * FROM kunden;',
    hint: 'Du brauchst SELECT, das Sternchen * und FROM kunden.',
    points: 10
  },
  {
    id: 2,
    title: 'Nur Namen anzeigen',
    difficulty: 'Anfänger',
    topic: 'Spalten auswählen',
    explanation: 'Man kann gezielt auswählen, welche Spalten angezeigt werden sollen.',
    task: 'Zeige nur die Namen aller Kunden an.',
    expectedSql: 'SELECT name FROM kunden;',
    hint: 'Wenn du nur eine Spalte sehen möchtest, schreibe ihren Namen nach SELECT.',
    points: 10
  },
  {
    id: 3,
    title: 'Kunden aus Berlin finden',
    difficulty: 'Anfänger',
    topic: 'WHERE',
    explanation: 'Mit WHERE filtert man Datensätze.',
    task: 'Zeige alle Kunden an, die aus Berlin kommen.',
    expectedSql: "SELECT * FROM kunden WHERE stadt = 'Berlin';",
    hint: 'Mit WHERE filterst du Zeilen. Textwerte stehen in einfachen Anführungszeichen.',
    points: 10
  },
  {
    id: 4,
    title: 'Nach Punkten sortieren',
    difficulty: 'Anfänger',
    topic: 'ORDER BY',
    explanation: 'Mit ORDER BY sortiert man Ergebnisse. Mit DESC wird absteigend sortiert.',
    task: 'Zeige alle Kunden an, sortiert nach Punkten. Die meisten Punkte sollen oben stehen.',
    expectedSql: 'SELECT * FROM kunden ORDER BY punkte DESC;',
    hint: 'Mit ORDER BY sortierst du. DESC bedeutet absteigend, also die höchsten Werte zuerst.',
    points: 10
  },
  {
    id: 5,
    title: 'Kunden zählen',
    difficulty: 'Anfänger',
    topic: 'COUNT',
    explanation: 'Mit COUNT(*) zählt man Zeilen.',
    task: 'Zähle, wie viele Kunden in der Tabelle gespeichert sind.',
    expectedSql: 'SELECT COUNT(*) FROM kunden;',
    hint: 'COUNT(*) zählt, wie viele Zeilen eine Abfrage zurückgibt.',
    points: 10
  },
  {
    id: 6,
    title: 'Ergebnisse begrenzen',
    difficulty: 'Anfänger',
    topic: 'LIMIT',
    explanation: 'Mit LIMIT begrenzt man, wie viele Zeilen angezeigt werden.',
    task: 'Zeige nur die ersten 3 Kunden aus der Tabelle kunden an.',
    expectedSql: 'SELECT * FROM kunden LIMIT 3;',
    hint: 'Schreibe LIMIT 3 ans Ende deiner SELECT-Abfrage.',
    points: 10
  },
  {
    id: 7,
    title: 'Vergleichsoperator größer als',
    difficulty: 'Anfänger',
    topic: 'Vergleichsoperatoren',
    explanation: 'Mit Vergleichsoperatoren wie >, < oder = kann man Zahlenwerte filtern.',
    task: 'Zeige alle Kunden an, die mehr als 100 Punkte haben.',
    expectedSql: 'SELECT * FROM kunden WHERE punkte > 100;',
    hint: 'Nutze WHERE und den Vergleich punkte > 100.',
    points: 10
  },
  {
    id: 8,
    title: 'Textsuche mit LIKE',
    difficulty: 'Anfänger',
    topic: 'LIKE',
    explanation: 'Mit LIKE kann man nach Textmustern suchen. Das Prozentzeichen % steht für beliebige weitere Zeichen.',
    task: 'Zeige alle Kunden an, deren Name mit A beginnt.',
    expectedSql: "SELECT * FROM kunden WHERE name LIKE 'A%';",
    hint: 'A% bedeutet: Der Text beginnt mit A und danach kann beliebiger Text folgen.',
    points: 10
  },
  {
    id: 9,
    title: 'Mehrere Bedingungen mit AND',
    difficulty: 'Anfänger',
    topic: 'AND',
    explanation: 'Mit AND müssen mehrere Bedingungen gleichzeitig erfüllt sein.',
    task: 'Zeige alle Kunden aus Berlin an, die mehr als 100 Punkte haben.',
    expectedSql: "SELECT * FROM kunden WHERE stadt = 'Berlin' AND punkte > 100;",
    hint: 'Verbinde die Bedingung für stadt mit der Bedingung für punkte durch AND.',
    points: 10
  },
  {
    id: 10,
    title: 'Durchschnitt berechnen',
    difficulty: 'Anfänger',
    topic: 'AVG',
    explanation: 'Mit AVG berechnet man den Durchschnitt einer Zahlenspalte.',
    task: 'Berechne das durchschnittliche Alter aller Kunden.',
    expectedSql: 'SELECT AVG(alter_jahre) FROM kunden;',
    hint: 'AVG(alter_jahre) berechnet den Durchschnitt der Spalte alter_jahre.',
    points: 10
  }
];
