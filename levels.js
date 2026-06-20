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
  },
  {
    id: 11,
    title: 'Bedingungen mit OR',
    difficulty: 'Anfänger',
    topic: 'OR',
    explanation: 'Mit OR genügt es, wenn mindestens eine von mehreren Bedingungen erfüllt ist.',
    task: 'Zeige alle Kunden aus Berlin oder Hamburg an.',
    expectedSql: "SELECT * FROM kunden WHERE stadt = 'Berlin' OR stadt = 'Hamburg';",
    hint: 'Verbinde beide Stadt-Bedingungen mit OR.',
    points: 10
  },
  {
    id: 12,
    title: 'Jünger als 30',
    difficulty: 'Anfänger',
    topic: '<',
    explanation: 'Mit < findest du Werte, die kleiner als ein bestimmter Wert sind.',
    task: 'Zeige alle Kunden an, die jünger als 30 Jahre sind.',
    expectedSql: 'SELECT * FROM kunden WHERE alter_jahre < 30;',
    hint: 'Filtere die Spalte alter_jahre mit dem Vergleich < 30.',
    points: 10
  },
  {
    id: 13,
    title: 'Mindestens 120 Punkte',
    difficulty: 'Anfänger',
    topic: '>=',
    explanation: 'Mit >= findest du Werte, die größer oder gleich einem bestimmten Wert sind.',
    task: 'Zeige alle Kunden an, die mindestens 120 Punkte haben.',
    expectedSql: 'SELECT * FROM kunden WHERE punkte >= 120;',
    hint: '„Mindestens“ bedeutet: größer oder gleich. Nutze >=.',
    points: 10
  },
  {
    id: 14,
    title: 'Höchstens 100 Punkte',
    difficulty: 'Anfänger',
    topic: '<=',
    explanation: 'Mit <= findest du Werte, die kleiner oder gleich einem bestimmten Wert sind.',
    task: 'Zeige alle Kunden an, die höchstens 100 Punkte haben.',
    expectedSql: 'SELECT * FROM kunden WHERE punkte <= 100;',
    hint: '„Höchstens“ bedeutet: kleiner oder gleich. Nutze <=.',
    points: 10
  },
  {
    id: 15,
    title: 'Ausschließen mit NOT',
    difficulty: 'Anfänger',
    topic: 'NOT',
    explanation: 'Mit NOT kannst du Bedingungen ausschließen.',
    task: 'Zeige alle Kunden an, die nicht aus Berlin kommen.',
    expectedSql: "SELECT * FROM kunden WHERE NOT stadt = 'Berlin';",
    hint: "Setze NOT vor die Bedingung stadt = 'Berlin'.",
    points: 10
  },
  {
    id: 16,
    title: 'Punkte zusammenzählen',
    difficulty: 'Anfänger',
    topic: 'SUM',
    explanation: 'Mit SUM kannst du Zahlenwerte einer Spalte zusammenzählen.',
    task: 'Berechne die Summe aller Punkte aller Kunden.',
    expectedSql: 'SELECT SUM(punkte) FROM kunden;',
    hint: 'Nutze SUM mit der Spalte punkte.',
    points: 10
  },
  {
    id: 17,
    title: 'Jüngster Kunde',
    difficulty: 'Anfänger',
    topic: 'MIN',
    explanation: 'Mit MIN findest du den kleinsten Wert einer Spalte.',
    task: 'Finde das niedrigste Alter aller Kunden.',
    expectedSql: 'SELECT MIN(alter_jahre) FROM kunden;',
    hint: 'Nutze MIN mit der Spalte alter_jahre.',
    points: 10
  },
  {
    id: 18,
    title: 'Höchste Punktzahl',
    difficulty: 'Anfänger',
    topic: 'MAX',
    explanation: 'Mit MAX findest du den größten Wert einer Spalte.',
    task: 'Finde die höchste Punktzahl aller Kunden.',
    expectedSql: 'SELECT MAX(punkte) FROM kunden;',
    hint: 'Nutze MAX mit der Spalte punkte.',
    points: 10
  },
  {
    id: 19,
    title: 'Städte ohne Wiederholungen',
    difficulty: 'Anfänger',
    topic: 'DISTINCT',
    explanation: 'Mit DISTINCT werden doppelte Werte nur einmal angezeigt.',
    task: 'Zeige alle Städte an, in denen Kunden wohnen. Jede Stadt soll nur einmal erscheinen.',
    expectedSql: 'SELECT DISTINCT stadt FROM kunden;',
    hint: 'Setze DISTINCT direkt nach SELECT vor die Spalte stadt.',
    points: 10
  },
  {
    id: 20,
    title: 'Top-Kunden',
    difficulty: 'Anfänger',
    topic: 'WHERE + ORDER BY + LIMIT',
    explanation: 'Du kannst Filtern, Sortieren und Begrenzen in einer Abfrage kombinieren.',
    task: 'Zeige die drei Kunden mit mindestens 100 Punkten an. Sortiere sie absteigend nach Punkten.',
    expectedSql: 'SELECT * FROM kunden WHERE punkte >= 100 ORDER BY punkte DESC LIMIT 3;',
    hint: 'Nutze zuerst WHERE, danach ORDER BY punkte DESC und am Ende LIMIT 3.',
    points: 10
  }
];
