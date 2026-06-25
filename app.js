const STORAGE_KEY = 'sqlQuestProgress';
const STAR_SYSTEM_VERSION = 3;
const MAX_STARS = 3;
const MIN_STARS_TO_UNLOCK_NEXT_LEVEL = 2;
const BLOCKED_COMMANDS = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'REPLACE', 'TRUNCATE', 'PRAGMA', 'ATTACH', 'DETACH'];
const BADGE_DEFINITIONS = [
  { id: 'first_steps', title: 'Erste Schritte', description: 'Erstes Level gelöst.', icon: '👣' },
  { id: 'star_collector', title: 'Sternensammler', description: 'Mindestens 25 Sterne gesammelt.', icon: '⭐' },
  { id: 'halfway', title: 'Halbzeit', description: 'Mindestens 40 von 80 Leveln gelöst.', icon: '🏁' },
  { id: 'no_help', title: 'Ohne Hilfe', description: 'Mindestens 5 Level mit 3 Sternen gelöst.', icon: '💎' },
  { id: 'beginner_done', title: 'Anfänger geschafft', description: 'Alle Anfänger-Level 1–30 gelöst.', icon: '🌱' },
  { id: 'advanced_done', title: 'Fortgeschritten', description: 'Alle Fortgeschritten-Level 31–60 gelöst.', icon: '🚀' },
  { id: 'masterclass', title: 'Meisterklasse', description: 'Level 80 gelöst.', icon: '👑' },
  { id: 'quest_complete', title: 'SQL Quest abgeschlossen', description: 'Alle 80 Level gelöst.', icon: '🏆' }
];
const MILESTONE_DEFINITIONS = [25, 50, 75, 100];
const TIME_CHALLENGE_LIMIT_SECONDS = 300;
const TIME_CHALLENGE_LEVEL_COUNT = 5;
const READ_ONLY_SQL_MESSAGE = 'SQL Quest erlaubt nur lesende Abfragen. Die Übungsdatenbank wurde nicht verändert. Verwende für diese Aufgabe bitte eine SELECT-Abfrage.';
const IS_TEST_MODE = new URLSearchParams(window.location.search).get('testmode') === '1';
let currentLevelHelpUsage = { hintUsed: false, solutionViewed: false };


const SQL_LEARNING_TERMS = {
  select: {
    term: 'SELECT',
    description: 'Legt fest, welche Spalten oder berechneten Werte angezeigt werden.',
    example: `SELECT name
FROM kunden;`,
    exampleExplanation: 'Zeigt die Namen aller Kunden aus der Tabelle kunden.'
  },
  from: {
    term: 'FROM',
    description: 'Legt fest, aus welcher Tabelle die Daten gelesen werden.',
    example: `SELECT *
FROM kunden;`,
    exampleExplanation: 'Liest Daten aus der Tabelle kunden.'
  },
  star: {
    term: '*',
    description: 'Das Sternchen steht für alle Spalten einer Tabelle.',
    example: `SELECT *
FROM kunden;`,
    exampleExplanation: 'Zeigt alle Spalten und alle Kunden an.'
  },
  columns: {
    term: 'einzelne Spalten auswählen',
    description: 'Du kannst gezielt nur die Spalten angeben, die im Ergebnis erscheinen sollen.',
    example: `SELECT name, stadt
FROM kunden;`,
    exampleExplanation: 'Zeigt nur die Spalten name und stadt.'
  },
  where: {
    term: 'WHERE',
    description: 'Filtert Datensätze mit einer Bedingung.',
    example: `SELECT *
FROM kunden
WHERE stadt = 'Berlin';`,
    exampleExplanation: 'Zeigt nur Kunden aus Berlin.'
  },
  orderBy: {
    term: 'ORDER BY',
    description: 'Sortiert Ergebnisse nach einer oder mehreren Spalten.',
    example: `SELECT *
FROM kunden
ORDER BY punkte DESC;`,
    exampleExplanation: 'Sortiert Kunden nach Punkten, mit den höchsten Punkten zuerst.'
  },
  count: {
    term: 'COUNT()',
    description: 'Zählt Datensätze oder Werte.',
    example: `SELECT COUNT(*)
FROM kunden;`,
    exampleExplanation: 'Zählt alle Kunden.'
  },
  limit: {
    term: 'LIMIT',
    description: 'Begrenzt, wie viele Ergebnisse angezeigt werden.',
    example: `SELECT *
FROM kunden
LIMIT 3;`,
    exampleExplanation: 'Zeigt nur die ersten drei Ergebnisse.'
  },
  greaterThan: {
    term: 'Vergleich >',
    description: 'Prüft, ob ein Zahlenwert größer als ein Vergleichswert ist.',
    example: `SELECT *
FROM kunden
WHERE punkte > 100;`,
    exampleExplanation: 'Zeigt Kunden mit mehr als 100 Punkten.',
    details: ['> größer als: Der linke Wert muss größer sein als der rechte Wert.']
  },
  like: {
    term: 'LIKE',
    description: 'Sucht nach Textmustern. Das Prozentzeichen % steht für beliebige weitere Zeichen.',
    example: `SELECT *
FROM kunden
WHERE name LIKE 'A%';`,
    exampleExplanation: 'Zeigt Kunden, deren Name mit A beginnt.'
  },
  and: {
    term: 'AND',
    description: 'Verknüpft Bedingungen, bei denen alle Bedingungen erfüllt sein müssen.',
    example: `SELECT *
FROM kunden
WHERE stadt = 'Berlin' AND punkte > 100;`,
    exampleExplanation: 'Beide Bedingungen müssen erfüllt sein.'
  },
  avg: {
    term: 'AVG()',
    description: 'Berechnet den Durchschnitt einer Zahlenspalte.',
    example: `SELECT AVG(alter_jahre)
FROM kunden;`,
    exampleExplanation: 'Berechnet das durchschnittliche Alter aller Kunden.'
  },
  or: {
    term: 'OR',
    description: 'Verknüpft Bedingungen, bei denen mindestens eine Bedingung erfüllt sein muss.',
    example: `SELECT *
FROM kunden
WHERE stadt = 'Berlin' OR stadt = 'Hamburg';`,
    exampleExplanation: 'Mindestens eine Stadt-Bedingung muss erfüllt sein.'
  },
  lessThan: {
    term: '<',
    description: 'Prüft, ob ein Zahlenwert kleiner als ein Vergleichswert ist.',
    example: `SELECT *
FROM kunden
WHERE alter_jahre < 30;`,
    exampleExplanation: 'Zeigt Kunden, die jünger als 30 Jahre sind.',
    details: ['< kleiner als: Der linke Wert muss kleiner sein als der rechte Wert.']
  },
  greaterEqual: {
    term: '>=',
    description: 'Prüft, ob ein Zahlenwert größer oder gleich einem Vergleichswert ist.',
    example: `SELECT *
FROM kunden
WHERE punkte >= 120;`,
    exampleExplanation: 'Zeigt Kunden mit mindestens 120 Punkten.',
    details: ['>= größer oder gleich: Der linke Wert darf gleich oder größer sein.']
  },
  lessEqual: {
    term: '<=',
    description: 'Prüft, ob ein Zahlenwert kleiner oder gleich einem Vergleichswert ist.',
    example: `SELECT *
FROM kunden
WHERE punkte <= 100;`,
    exampleExplanation: 'Zeigt Kunden mit höchstens 100 Punkten.',
    details: ['<= kleiner oder gleich: Der linke Wert darf gleich oder kleiner sein.']
  },
  not: {
    term: 'NOT',
    description: 'Kehrt eine Bedingung um und schließt passende Datensätze aus.',
    example: `SELECT *
FROM kunden
WHERE NOT stadt = 'Berlin';`,
    exampleExplanation: 'Zeigt alle Kunden, die nicht aus Berlin kommen.'
  },
  sum: {
    term: 'SUM()',
    description: 'Addiert Zahlenwerte einer Spalte.',
    example: `SELECT SUM(punkte)
FROM kunden;`,
    exampleExplanation: 'Addiert alle Punkte.'
  },
  min: {
    term: 'MIN()',
    description: 'Ermittelt den kleinsten Wert einer Spalte.',
    example: `SELECT MIN(alter_jahre)
FROM kunden;`,
    exampleExplanation: 'Findet das niedrigste Alter.'
  },
  max: {
    term: 'MAX()',
    description: 'Ermittelt den größten Wert einer Spalte.',
    example: `SELECT MAX(punkte)
FROM kunden;`,
    exampleExplanation: 'Findet die höchste Punktzahl.'
  },
  distinct: {
    term: 'DISTINCT',
    description: 'Entfernt doppelte Werte aus dem Ergebnis.',
    example: `SELECT DISTINCT stadt
FROM kunden;`,
    exampleExplanation: 'Zeigt jede Stadt nur einmal.'
  },
  whereOrderLimit: {
    term: 'Kombinationen aus WHERE, ORDER BY und LIMIT',
    description: 'Filtert zuerst Zeilen, sortiert danach das Ergebnis und begrenzt anschließend die Anzahl.',
    example: `SELECT *
FROM kunden
WHERE punkte >= 100
ORDER BY punkte DESC
LIMIT 3;`,
    exampleExplanation: 'Zeigt die drei punktstärksten Kunden mit mindestens 100 Punkten.'
  },
  queryOrder: {
    term: 'typische Reihenfolge einer kombinierten Abfrage',
    description: 'Kombinierte SELECT-Abfragen folgen meist der Reihenfolge SELECT → FROM → WHERE → ORDER BY → LIMIT.',
    example: `SELECT name, punkte
FROM kunden
WHERE punkte >= 80
ORDER BY punkte DESC
LIMIT 2;`,
    exampleExplanation: 'Wählt bestimmte Spalten, filtert, sortiert und begrenzt das Ergebnis in der typischen Reihenfolge.'
  },
  groupBy: {
    term: 'GROUP BY',
    description: 'Fasst Zeilen mit gleichen Werten zu Gruppen zusammen.',
    example: `SELECT stadt, COUNT(*)
FROM kunden
GROUP BY stadt;`,
    exampleExplanation: 'Gruppiert Kunden nach Stadt und zählt die Kunden je Stadt.'
  },
  having: {
    term: 'HAVING',
    description: 'Filtert Gruppen nach dem Gruppieren.',
    example: `SELECT stadt, COUNT(*)
FROM kunden
GROUP BY stadt
HAVING COUNT(*) > 1;`,
    exampleExplanation: 'Zeigt nur Städte mit mehr als einem Kunden.'
  },
  groupAggregates: {
    term: 'COUNT, SUM und AVG je Gruppe',
    description: 'Wertet jede Gruppe mit Zählung, Summe oder Durchschnitt aus.',
    example: `SELECT stadt, COUNT(*), SUM(punkte), AVG(punkte)
FROM kunden
GROUP BY stadt;`,
    exampleExplanation: 'Berechnet Anzahl, Punktesumme und Durchschnitt je Stadt.'
  },
  groupOrder: {
    term: 'Gruppenergebnisse sortieren',
    description: 'Sortiert bereits gruppierte Ergebnisse nach einer Gruppenspalte oder Aggregatfunktion.',
    example: `SELECT stadt, SUM(punkte)
FROM kunden
GROUP BY stadt
ORDER BY SUM(punkte) DESC;`,
    exampleExplanation: 'Sortiert Städte nach ihrer gesamten Punktzahl.'
  },
  groupLimit: {
    term: 'Gruppenergebnisse mit LIMIT begrenzen',
    description: 'Begrenzt nach dem Gruppieren und Sortieren die Anzahl der Gruppenergebnisse.',
    example: `SELECT stadt, SUM(punkte)
FROM kunden
GROUP BY stadt
ORDER BY SUM(punkte) DESC
LIMIT 1;`,
    exampleExplanation: 'Zeigt die Stadt mit der höchsten Gesamtpunktzahl.'
  },
  innerJoin: {
    term: 'INNER JOIN',
    description: 'Verbindet Tabellen und zeigt nur Zeilen, bei denen die ON-Bedingung in beiden Tabellen einen Treffer findet.',
    example: `SELECT kunden.name, bestellungen.bestelldatum
FROM kunden
INNER JOIN bestellungen
  ON kunden.id = bestellungen.kunden_id;`,
    exampleExplanation: 'Verbindet kunden mit bestellungen: bestellungen.kunden_id verweist auf kunden.id.',
    details: ['Gut für Bestellungen mit vorhandenem Kunden.', 'Kunden ohne Bestellung erscheinen bei INNER JOIN nicht.']
  },
  leftJoin: {
    term: 'LEFT JOIN',
    description: 'Zeigt alle Zeilen der linken Tabelle und ergänzt passende Daten der rechten Tabelle.',
    example: `SELECT kunden.name, bestellungen.bestelldatum
FROM kunden
LEFT JOIN bestellungen
  ON kunden.id = bestellungen.kunden_id;`,
    exampleExplanation: 'Zeigt alle Kunden; bei Kunden ohne Bestellung bleibt das Bestelldatum leer.',
    details: ['Gut, wenn auch fehlende rechte Datensätze sichtbar bleiben sollen.', 'Mit WHERE bestellungen.id IS NULL findest du Kunden ohne Bestellung.']
  },
  joinOn: {
    term: 'ON',
    description: 'Legt bei einem JOIN fest, welche Spalten aus den Tabellen zusammenpassen.',
    example: `SELECT produkte.name, bestellpositionen.menge
FROM bestellpositionen
INNER JOIN produkte
  ON bestellpositionen.produkt_id = produkte.id;`,
    exampleExplanation: 'Verbindet jede Bestellposition mit ihrem Produkt über produkt_id und id.',
    details: ['kunden.id passt zu bestellungen.kunden_id.', 'bestellungen.id passt zu bestellpositionen.bestellung_id.', 'produkte.id passt zu bestellpositionen.produkt_id.']
  },
  multiTableJoins: {
    term: 'JOINs über mehrere Tabellen',
    description: 'Mehrere JOINs verbinden eine Beziehungskette, zum Beispiel vom Kunden über Bestellungen und Positionen zum Produkt.',
    example: `SELECT kunden.name, bestellungen.id, produkte.name, bestellpositionen.menge
FROM kunden
INNER JOIN bestellungen
  ON kunden.id = bestellungen.kunden_id
INNER JOIN bestellpositionen
  ON bestellungen.id = bestellpositionen.bestellung_id
INNER JOIN produkte
  ON bestellpositionen.produkt_id = produkte.id;`,
    exampleExplanation: 'Erstellt eine Shop-Auswertung mit Kunde, Bestellung, Position und Produkt.'
  },
  countJoin: {
    term: 'COUNT() mit JOIN',
    description: 'Zählt passende Datensätze aus verbundenen Tabellen, zum Beispiel Bestellungen pro Kunde.',
    example: `SELECT kunden.name, COUNT(bestellungen.id)
FROM kunden
LEFT JOIN bestellungen
  ON kunden.id = bestellungen.kunden_id
GROUP BY kunden.name;`,
    exampleExplanation: 'Zeigt für jeden Kunden, wie viele Bestellungen gefunden wurden.'
  },
  sumJoin: {
    term: 'SUM() mit JOIN',
    description: 'Addiert Werte aus verbundenen Tabellen, zum Beispiel Umsatz oder verkaufte Mengen.',
    example: `SELECT bestellungen.id, SUM(bestellpositionen.menge * bestellpositionen.einzelpreis)
FROM bestellungen
INNER JOIN bestellpositionen
  ON bestellungen.id = bestellpositionen.bestellung_id
GROUP BY bestellungen.id;`,
    exampleExplanation: 'Berechnet den Bestellwert pro Bestellung.'
  },
  multiTableGrouping: {
    term: 'Gruppieren über mehrere Tabellen',
    description: 'GROUP BY kann JOIN-Ergebnisse nach Kunden, Produkten oder Bestellungen zusammenfassen.',
    example: `SELECT produkte.name, SUM(bestellpositionen.menge)
FROM produkte
INNER JOIN bestellpositionen
  ON produkte.id = bestellpositionen.produkt_id
GROUP BY produkte.name
ORDER BY SUM(bestellpositionen.menge) DESC;`,
    exampleExplanation: 'Gruppiert Bestellpositionen nach Produkt und sortiert nach verkaufter Menge.'
  },
  havingJoin: {
    term: 'HAVING mit JOIN',
    description: 'Filtert gruppierte JOIN-Ergebnisse, wenn die Bedingung eine Aggregatfunktion betrifft.',
    example: `SELECT kunden.name, COUNT(bestellungen.id)
FROM kunden
INNER JOIN bestellungen
  ON kunden.id = bestellungen.kunden_id
GROUP BY kunden.name
HAVING COUNT(bestellungen.id) > 1;`,
    exampleExplanation: 'Zeigt nur Kunden mit mehr als einer Bestellung.'
  },
  orderValueCalculation: {
    term: 'Bestellwert berechnen mit menge * einzelpreis',
    description: 'Der Wert einer Bestellposition entsteht aus der bestellten Menge multipliziert mit dem Einzelpreis.',
    example: `SELECT bestellungen.id, SUM(bestellpositionen.menge * bestellpositionen.einzelpreis)
FROM bestellungen
INNER JOIN bestellpositionen
  ON bestellungen.id = bestellpositionen.bestellung_id
GROUP BY bestellungen.id;`,
    exampleExplanation: 'Summiert alle Positionswerte zum Bestellwert.'
  },
  subquery: {
    term: 'Unterabfrage',
    description: 'Eine Unterabfrage ist eine SELECT-Abfrage innerhalb einer anderen Abfrage. Sie liefert Werte für Filter oder Vergleiche.',
    example: `SELECT name
FROM kunden
WHERE id IN (
  SELECT kunden_id
  FROM bestellungen
);`,
    exampleExplanation: 'Die innere Abfrage liefert Kunden-IDs mit Bestellung; die äußere Abfrage zeigt die passenden Kundennamen.'
  },
  inOperator: {
    term: 'IN',
    description: 'Prüft, ob ein Wert in einer Liste oder im Ergebnis einer Unterabfrage enthalten ist.',
    example: `SELECT name
FROM kunden
WHERE id IN (
  SELECT kunden_id
  FROM bestellungen
);`,
    exampleExplanation: 'Zeigt Kunden, deren id in der Bestellliste vorkommt.'
  },
  notInOperator: {
    term: 'NOT IN',
    description: 'Schließt Werte aus, die in einer Liste oder im Ergebnis einer Unterabfrage enthalten sind.',
    example: `SELECT name
FROM kunden
WHERE id NOT IN (
  SELECT kunden_id
  FROM bestellungen
);`,
    exampleExplanation: 'Zeigt Kunden ohne Bestellung.'
  },
  existsOperator: {
    term: 'EXISTS',
    description: 'Prüft, ob eine korrelierte Unterabfrage mindestens eine passende Zeile findet.',
    example: `SELECT kunden.name
FROM kunden
WHERE EXISTS (
  SELECT 1
  FROM bestellungen
  WHERE bestellungen.kunden_id = kunden.id
);`,
    exampleExplanation: 'Zeigt Kunden, zu denen mindestens eine Bestellung existiert.'
  },
  notExistsOperator: {
    term: 'NOT EXISTS',
    description: 'Prüft, ob eine korrelierte Unterabfrage keine passende Zeile findet.',
    example: `SELECT kunden.name
FROM kunden
WHERE NOT EXISTS (
  SELECT 1
  FROM bestellungen
  WHERE bestellungen.kunden_id = kunden.id
);`,
    exampleExplanation: 'Zeigt Kunden, zu denen keine Bestellung existiert.'
  },
  avgComparisonSubquery: {
    term: 'Vergleich mit AVG()',
    description: 'Eine Unterabfrage kann einen Durchschnitt berechnen, mit dem die äußere Abfrage einzelne Werte vergleicht.',
    example: `SELECT name, preis
FROM produkte
WHERE preis > (
  SELECT AVG(preis)
  FROM produkte
);`,
    exampleExplanation: 'Zeigt Produkte, die teurer als der Durchschnittspreis sind.'
  },
  groupedSubquery: {
    term: 'Unterabfrage mit GROUP BY',
    description: 'Unterabfragen können gruppieren und mit HAVING nur Gruppen zurückgeben, die eine Aggregatbedingung erfüllen.',
    example: `SELECT name
FROM kunden
WHERE id IN (
  SELECT kunden_id
  FROM bestellungen
  GROUP BY kunden_id
  HAVING COUNT(*) > 1
);`,
    exampleExplanation: 'Zeigt Kunden mit mehr als einer Bestellung.'
  },
  joinSubqueryCombination: {
    term: 'Kombination aus JOIN und Unterabfrage',
    description: 'Fortgeschrittene Shop-Auswertungen verbinden Tabellen und vergleichen gruppierte Ergebnisse mit Werten aus Unterabfragen.',
    example: `SELECT kunden.name, SUM(bestellpositionen.menge * bestellpositionen.einzelpreis)
FROM kunden
INNER JOIN bestellungen
  ON kunden.id = bestellungen.kunden_id
INNER JOIN bestellpositionen
  ON bestellungen.id = bestellpositionen.bestellung_id
GROUP BY kunden.name
HAVING SUM(bestellpositionen.menge * bestellpositionen.einzelpreis) > (
  SELECT AVG(bestellwert)
  FROM (
    SELECT SUM(menge * einzelpreis) AS bestellwert
    FROM bestellpositionen
    GROUP BY bestellung_id
  )
);`,
    exampleExplanation: 'Vergleicht Kundenumsätze mit dem durchschnittlichen Bestellwert.'
  },
  caseWhen: {
    term: 'CASE WHEN',
    description: 'Erzeugt bedingte Ausgaben direkt in der SELECT-Liste, zum Beispiel Kategorien abhängig von Umsatz oder Menge.',
    example: `SELECT name,
  CASE WHEN punkte >= 150 THEN 'Top'
       WHEN punkte >= 100 THEN 'Aktiv'
       ELSE 'Basis'
  END
FROM kunden;`,
    exampleExplanation: 'Ordnet Kunden anhand ihrer Punkte in Textkategorien ein.'
  },
  cteWith: {
    term: 'CTE / WITH',
    description: 'Definiert ein benanntes Zwischenergebnis, das die Hauptabfrage wie eine temporäre Tabelle nutzen kann.',
    example: `WITH bestellwerte AS (
  SELECT bestellung_id, SUM(menge * einzelpreis) AS bestellwert
  FROM bestellpositionen
  GROUP BY bestellung_id
)
SELECT AVG(bestellwert)
FROM bestellwerte;`,
    exampleExplanation: 'Berechnet erst Bestellwerte und wertet sie anschließend übersichtlich aus.'
  },
  nestedSubquery: {
    term: 'mehrstufige Unterabfrage',
    description: 'Verschachtelt mehrere SELECT-Abfragen, damit gruppierte Kennzahlen mit daraus berechneten Vergleichswerten geprüft werden können.',
    example: `SELECT produkt_id, SUM(menge)
FROM bestellpositionen
GROUP BY produkt_id
HAVING SUM(menge) > (
  SELECT AVG(gesamtmenge)
  FROM (
    SELECT SUM(menge) AS gesamtmenge
    FROM bestellpositionen
    GROUP BY produkt_id
  )
);`,
    exampleExplanation: 'Vergleicht Produktmengen mit dem Durchschnitt bereits gruppierter Produktmengen.'
  },
  complexAggregation: {
    term: 'komplexe Aggregation',
    description: 'Kombiniert JOINs, GROUP BY, HAVING und mehrere Aggregatfunktionen für aussagekräftige Shop-Auswertungen.',
    example: `SELECT produkte.kategorie, SUM(bestellpositionen.menge), SUM(bestellpositionen.menge * bestellpositionen.einzelpreis)
FROM produkte
INNER JOIN bestellpositionen
  ON produkte.id = bestellpositionen.produkt_id
GROUP BY produkte.kategorie
HAVING SUM(bestellpositionen.menge * bestellpositionen.einzelpreis) > 50;`,
    exampleExplanation: 'Zeigt nur Produktkategorien mit nennenswertem Umsatz.'
  },
  revenueCategory: {
    term: 'Umsatzkategorie',
    description: 'Eine mit CASE WHEN erzeugte fachliche Einordnung von berechneten Umsätzen, etwa Niedrig, Mittel oder Hoch.',
    example: `SELECT bestellung_id,
  SUM(menge * einzelpreis),
  CASE WHEN SUM(menge * einzelpreis) >= 500 THEN 'Hoch'
       WHEN SUM(menge * einzelpreis) >= 50 THEN 'Mittel'
       ELSE 'Niedrig'
  END
FROM bestellpositionen
GROUP BY bestellung_id;`,
    exampleExplanation: 'Macht Zahlenwerte als Kategorien leichter verständlich.'
  },

  nullValues: {
    term: 'NULL',
    description: 'NULL bedeutet: Ein Wert fehlt oder ist unbekannt. Das ist etwas anderes als ein echter Text wie Keine Bestellung oder die Zahl 0.',
    example: `SELECT kunden.name, bestellungen.status
FROM kunden
LEFT JOIN bestellungen
  ON kunden.id = bestellungen.kunden_id;`,
    exampleExplanation: 'Kunden ohne Bestellung erhalten in den Bestellspalten NULL.'
  },
  coalesce: {
    term: 'COALESCE()',
    description: 'Gibt den ersten nicht-NULL-Wert zurück und eignet sich für Ersatztexte oder Ersatzwerte bei fehlenden Daten.',
    example: `SELECT kunden.name, COALESCE(bestellungen.status, 'Keine Bestellung')
FROM kunden
LEFT JOIN bestellungen
  ON kunden.id = bestellungen.kunden_id;`,
    exampleExplanation: 'Fehlende Statuswerte werden lesbar ersetzt, vorhandene Statuswerte bleiben unverändert.'
  },
  dateFunctions: {
    term: 'date() und strftime()',
    description: 'SQLite wertet Datumswerte im Textformat mit Funktionen wie date() und strftime() aus, zum Beispiel für Jahre und Monate.',
    example: `SELECT strftime('%Y-%m', bestelldatum), COUNT(*)
FROM bestellungen
GROUP BY strftime('%Y-%m', bestelldatum);`,
    exampleExplanation: 'Zählt Bestellungen pro Monat.'
  },
  rowNumber: {
    term: 'ROW_NUMBER()',
    description: 'Vergibt mit OVER (ORDER BY ...) eindeutige laufende Nummern in einer sortierten Ergebnismenge.',
    example: `SELECT name, preis, ROW_NUMBER() OVER (ORDER BY preis DESC)
FROM produkte;`,
    exampleExplanation: 'Nummeriert Produkte eindeutig vom teuersten zum günstigsten Produkt.'
  },
  rankFunction: {
    term: 'RANK()',
    description: 'Erstellt eine Rangliste. Gleiche Werte erhalten denselben Rang; danach können Rangnummern übersprungen werden.',
    example: `SELECT name, punkte, RANK() OVER (ORDER BY punkte DESC)
FROM kunden;`,
    exampleExplanation: 'Rankt Kunden nach Punkten.'
  },
  overClause: {
    term: 'OVER',
    description: 'Leitet bei Window Functions das Fenster ein und enthält die Sortierung oder Gruppierung für die Berechnung.',
    example: `SELECT name, preis, ROW_NUMBER() OVER (ORDER BY preis DESC)
FROM produkte;`,
    exampleExplanation: 'ORDER BY innerhalb von OVER bestimmt die Reihenfolge der Nummerierung.'
  },
  partitionBy: {
    term: 'PARTITION BY',
    description: 'Teilt Window Functions in Gruppen auf, sodass Ranking oder Summen innerhalb jeder Gruppe neu berechnet werden.',
    example: `SELECT kategorie, name, preis,
  RANK() OVER (PARTITION BY kategorie ORDER BY preis DESC)
FROM produkte;`,
    exampleExplanation: 'Rankt Produkte innerhalb jeder Kategorie separat.'
  },
  runningTotals: {
    term: 'laufende Summen',
    description: 'Berechnen mit SUM(...) OVER (ORDER BY ...) eine fortlaufende Summe bis zur aktuellen Zeile.',
    example: `WITH bestellwerte AS (
  SELECT bestellung_id, SUM(menge * einzelpreis) AS bestellwert
  FROM bestellpositionen
  GROUP BY bestellung_id
)
SELECT bestellung_id, bestellwert,
  SUM(bestellwert) OVER (ORDER BY bestellung_id)
FROM bestellwerte;`,
    exampleExplanation: 'Zeigt je Bestellung den bisherigen kumulierten Umsatz.'
  },
  masterAnalysis: {
    term: 'Meister-Auswertung',
    description: 'Verbindet mehrere SQL-Bausteine wie JOIN, Unterabfrage oder CTE, CASE WHEN, GROUP BY, HAVING und Aggregatfunktionen.',
    example: `WITH kundenumsaetze AS (
  SELECT kunden.name, SUM(bestellpositionen.menge * bestellpositionen.einzelpreis) AS umsatz
  FROM kunden
  INNER JOIN bestellungen ON kunden.id = bestellungen.kunden_id
  INNER JOIN bestellpositionen ON bestellungen.id = bestellpositionen.bestellung_id
  GROUP BY kunden.name
)
SELECT name, umsatz
FROM kundenumsaetze
WHERE umsatz > (SELECT AVG(umsatz) FROM kundenumsaetze);`,
    exampleExplanation: 'Bereitet Umsätze vor und filtert anschließend Kunden oberhalb des Durchschnitts.'
  }


};

const SQL_LEARNING_STAGES = [
  { unlockLevelId: 5, title: 'Grundlagen', levelRange: 'Level 1–5', levelStart: 1, levelEnd: 5, summary: 'Du kannst einfache Daten aus Tabellen lesen, einzelne Spalten auswählen, filtern, sortieren und Datensätze zählen.', lockedPreview: 'SELECT, FROM, *, Spaltenauswahl, WHERE, ORDER BY und COUNT() werden nach Level 5 freigeschaltet.', termKeys: ['select', 'from', 'star', 'columns', 'where', 'orderBy', 'count'] },
  { unlockLevelId: 10, title: 'Filtern und Sortieren', levelRange: 'Level 6–10', levelStart: 6, levelEnd: 10, summary: 'Du begrenzt Ergebnislisten, vergleichst Zahlenwerte, suchst Textmuster und verbindest Filterbedingungen.', lockedPreview: 'LIMIT, Vergleich >, LIKE, AND und AVG() werden nach Level 10 freigeschaltet.', termKeys: ['limit', 'greaterThan', 'like', 'and', 'avg'] },
  { unlockLevelId: 15, title: 'Bedingungen', levelRange: 'Level 11–15', levelStart: 11, levelEnd: 15, summary: 'Du formulierst flexiblere Bedingungen mit OR, NOT und weiteren Vergleichsoperatoren.', lockedPreview: 'OR, <, >=, <= und NOT werden nach Level 15 freigeschaltet.', termKeys: ['or', 'lessThan', 'greaterEqual', 'lessEqual', 'not'] },
  { unlockLevelId: 20, title: 'Funktionen und Auswertungen', levelRange: 'Level 16–20', levelStart: 16, levelEnd: 20, summary: 'Du wertest Zahlen mit SUM, MIN und MAX aus, entfernst Duplikate und kombinierst Filter, Sortierung und Begrenzung.', lockedPreview: 'SUM(), MIN(), MAX(), DISTINCT und Kombinationen aus WHERE, ORDER BY und LIMIT werden nach Level 20 freigeschaltet.', termKeys: ['sum', 'min', 'max', 'distinct', 'whereOrderLimit'] },
  { unlockLevelId: 25, title: 'Kombinierte Abfragen', levelRange: 'Level 21–25', levelStart: 21, levelEnd: 25, summary: 'Du festigst die typische Reihenfolge von SELECT-Abfragen und kombinierst mehrere SQL-Bausteine sicher.', lockedPreview: 'Eine Wiederholungs- und Kombinationsstufe wird nach Level 25 freigeschaltet.', termKeys: ['where', 'and', 'columns', 'orderBy', 'limit', 'queryOrder'] },
  { unlockLevelId: 30, title: 'Gruppieren und Auswerten', levelRange: 'Level 26–30', levelStart: 26, levelEnd: 30, summary: 'Du gruppierst Daten, filterst Gruppen und sortierst oder begrenzt Auswertungen pro Gruppe.', lockedPreview: 'GROUP BY, HAVING und Gruppenauswertungen werden nach Level 30 freigeschaltet.', termKeys: ['groupBy', 'having', 'groupAggregates', 'groupOrder', 'groupLimit'] },
  { unlockLevelId: 30, title: 'Fortgeschritten – JOINs', levelRange: 'Level 31–50', levelStart: 31, levelEnd: 50, summary: 'Du verbindest Shop-Tabellen mit INNER JOIN und LEFT JOIN, nutzt ON-Bedingungen und wertest Bestellungen mit Produkten aus. Anschließend zählst, summierst, gruppierst, sortierst und filterst du JOIN-Ergebnisse für Shop-Auswertungen.', lockedPreview: 'Fortgeschritten – JOINs wird nach Abschluss von Level 30 freigeschaltet.', termKeys: ['innerJoin', 'leftJoin', 'joinOn', 'multiTableJoins', 'countJoin', 'sumJoin', 'multiTableGrouping', 'havingJoin', 'orderValueCalculation'] },
  { unlockLevelId: 50, title: 'Fortgeschritten – Unterabfragen und komplexe Filter', levelRange: 'Level 51–60', levelStart: 51, levelEnd: 60, summary: 'Du nutzt Unterabfragen mit IN, NOT IN, EXISTS und NOT EXISTS, vergleichst Werte mit AVG() und kombinierst JOINs, GROUP BY, HAVING und Bestellwertberechnungen.', lockedPreview: 'Unterabfragen und komplexe Filter werden nach Abschluss von Level 50 freigeschaltet.', termKeys: ['subquery', 'inOperator', 'notInOperator', 'existsOperator', 'notExistsOperator', 'avgComparisonSubquery', 'groupedSubquery', 'joinSubqueryCombination'] },
  { unlockLevelId: 60, title: 'Meister – komplexe Auswertungen', levelRange: 'Level 61–80', levelStart: 61, levelEnd: 80, summary: 'Du erstellst Meister-Abfragen mit CASE WHEN, CTEs, NULL-Behandlung, COALESCE, Datumsfunktionen, Window Functions, PARTITION BY, laufenden Summen und kombinierten Abschluss-Challenges.', lockedPreview: 'Meister-Themen werden nach Abschluss von Level 60 freigeschaltet.', termKeys: ['caseWhen', 'cteWith', 'nestedSubquery', 'complexAggregation', 'revenueCategory', 'nullValues', 'coalesce', 'dateFunctions', 'rowNumber', 'rankFunction', 'overClause', 'partitionBy', 'runningTotals', 'masterAnalysis'] }
];

const SQL_BASICS_CHAPTERS = SQL_LEARNING_STAGES.map(stage => ({
  title: stage.title,
  unlockLevelId: stage.unlockLevelId,
  lockedPreview: stage.lockedPreview,
  terms: stage.termKeys.map(termKey => SQL_LEARNING_TERMS[termKey])
}));

const LEARNED_SQL_STAGES = SQL_LEARNING_STAGES.map(stage => ({
  ...stage,
  items: stage.termKeys.map(termKey => SQL_LEARNING_TERMS[termKey])
}));

const elements = {
  score: document.querySelector('#score'),
  levelList: document.querySelector('#levelList'),
  progressText: document.querySelector('#progressText'),
  progressTrack: document.querySelector('#progressTrack'),
  progressFill: document.querySelector('#progressFill'),
  progressPercent: document.querySelector('#progressPercent'),
  milestoneBanner: document.querySelector('#milestoneBanner'),
  badgeSummary: document.querySelector('#badgeSummary'),
  badgeGrid: document.querySelector('#badgeGrid'),
  sqlBasicsList: document.querySelector('#sqlBasicsList'),
  sqlBasicsProgress: document.querySelector('#sqlBasicsProgress'),
  dailyChallengeDate: document.querySelector('#dailyChallengeDate'),
  dailyChallengeContent: document.querySelector('#dailyChallengeContent'),
  learnedSqlList: document.querySelector('#learnedSqlList'),
  learnedSqlProgress: document.querySelector('#learnedSqlProgress'),
  levelsTabButton: document.querySelector('#levelsTabButton'),
  learnedOverviewTabButton: document.querySelector('#learnedOverviewTabButton'),
  replayTabButton: document.querySelector('#replayTabButton'),
  timeChallengeTabButton: document.querySelector('#timeChallengeTabButton'),
  levelsOverviewPanel: document.querySelector('#levelsOverviewPanel'),
  learnedOverviewPanel: document.querySelector('#learnedOverviewPanel'),
  replayOverviewPanel: document.querySelector('#replayOverviewPanel'),
  timeChallengeOverviewPanel: document.querySelector('#timeChallengeOverviewPanel'),
  timeChallengeSummary: document.querySelector('#timeChallengeSummary'),
  timeChallengeContent: document.querySelector('#timeChallengeContent'),
  timeChallengeTimer: document.querySelector('#timeChallengeTimer'),
  timeChallengeEndCard: document.querySelector('#timeChallengeEndCard'),
  editorCard: document.querySelector('#editorCard'),
  replayOverviewSummary: document.querySelector('#replayOverviewSummary'),
  replayLevelList: document.querySelector('#replayLevelList'),
  replayAllFilterButton: document.querySelector('#replayAllFilterButton'),
  replayUnderThreeFilterButton: document.querySelector('#replayUnderThreeFilterButton'),
  replayRandomButton: document.querySelector('#replayRandomButton'),
  learnedOverviewList: document.querySelector('#learnedOverviewList'),
  learnedOverviewSummary: document.querySelector('#learnedOverviewSummary'),
  difficulty: document.querySelector('#difficulty'),
  topic: document.querySelector('#topic'),
  levelTitle: document.querySelector('#levelTitle'),
  explanation: document.querySelector('#explanation'),
  task: document.querySelector('#task'),
  hintText: document.querySelector('#hintText'),
  solutionBox: document.querySelector('#solutionBox'),
  sqlInput: document.querySelector('#sqlInput'),
  runButton: document.querySelector('#runButton'),
  hintButton: document.querySelector('#hintButton'),
  solutionButton: document.querySelector('#solutionButton'),
  overviewButton: document.querySelector('#overviewButton'),
  backToOverviewButton: document.querySelector('#backToOverviewButton'),
  levelOverview: document.querySelector('#levelOverview'),
  showDatabaseInfoInGameButton: document.querySelector('#showDatabaseInfoInGameButton'),
  feedback: document.querySelector('#feedback'),
  resultTable: document.querySelector('#resultTable'),
  rowCount: document.querySelector('#rowCount'),
  resetProgressButton: document.querySelector('#resetProgressButton'),
  databaseIntro: document.querySelector('#databaseIntro'),
  gameLayout: document.querySelector('#gameLayout'),
  pathSelection: document.querySelector('#pathSelection'),
  beginnerIntro: document.querySelector('#beginnerIntro'),
  createDatabaseButton: document.querySelector('#createDatabaseButton'),
  startLevelsButton: document.querySelector('#startLevelsButton'),
  startBeginnerPathButton: document.querySelector('#startBeginnerPathButton'),
  advancedPathCard: document.querySelector('#advancedPathCard'),
  advancedPathBadge: document.querySelector('#advancedPathBadge'),
  startAdvancedPathButton: document.querySelector('#startAdvancedPathButton'),
  startLevelOneButton: document.querySelector('#startLevelOneButton'),
  backToLevelsButton: document.querySelector('#backToLevelsButton'),
  showDatabaseInfoButton: document.querySelector('#showDatabaseInfoButton'),
  introFeedback: document.querySelector('#introFeedback'),
  overviewFeedback: document.querySelector('#overviewFeedback'),
  successModalOverlay: document.querySelector('#successModalOverlay'),
  successModal: document.querySelector('#successModal'),
  successModalCloseButton: document.querySelector('#successModalCloseButton'),
  successModalStars: document.querySelector('#successModalStars'),
  successModalStarText: document.querySelector('#successModalStarText'),
  successModalBest: document.querySelector('#successModalBest'),
  successModalMessage: document.querySelector('#successModalMessage'),
  successModalCompletion: document.querySelector('#successModalCompletion'),
  successModalActions: document.querySelector('#successModalActions'),
  scrollTopButton: document.querySelector('#scrollTopButton'),
  globalBackButton: document.querySelector('#globalBackButton'),
  testModePanel: document.querySelector('#testModePanel'),
  testUnlockAllButton: document.querySelector('#testUnlockAllButton'),
  testSolveAllButton: document.querySelector('#testSolveAllButton'),
  testResetProgressButton: document.querySelector('#testResetProgressButton'),
  testJumpBeginnerButton: document.querySelector('#testJumpBeginnerButton'),
  testJumpAdvancedButton: document.querySelector('#testJumpAdvancedButton'),
  testJumpMasterButton: document.querySelector('#testJumpMasterButton'),
  completionCard: document.querySelector('#completionCard'),
  completionSolvedLevels: document.querySelector('#completionSolvedLevels'),
  completionScore: document.querySelector('#completionScore'),
  completionStars: document.querySelector('#completionStars'),
  completionTotalLevels: document.querySelector('#completionTotalLevels'),
  completionOverviewButton: document.querySelector('#completionOverviewButton'),
  completionPracticeButton: document.querySelector('#completionPracticeButton'),
  completionResetButton: document.querySelector('#completionResetButton')
};

let SQL;
let db;
let isDatabaseReady = false;
let hasLevelSessionStarted = false;
let selectedPath = null;
let hasBeginnerIntroCompleted = false;
let currentLevelIndex = 0;
let activeLevelSection = 'beginner';
let activeReplayFilter = 'all';
let progress = loadProgress();
let currentView = null;
let viewHistory = [];
let isNavigatingBack = false;
let areAllLevelsUnlockedForTesting = false;
let activeTimeChallenge = null;
let timeChallengeIntervalId = null;

window.addEventListener('DOMContentLoaded', init);
elements.runButton.addEventListener('click', runPlayerQuery);
elements.hintButton.addEventListener('click', showHint);
elements.solutionButton.addEventListener('click', showSolution);
elements.overviewButton.addEventListener('click', showLevelOverview);
elements.backToOverviewButton.addEventListener('click', showLevelOverview);
elements.resetProgressButton.addEventListener('click', resetProgress);
elements.levelsTabButton.addEventListener('click', () => showOverviewTab('levels'));
elements.learnedOverviewTabButton.addEventListener('click', () => showOverviewTab('learned'));
elements.replayTabButton.addEventListener('click', () => showOverviewTab('replay'));
elements.timeChallengeTabButton.addEventListener('click', () => showOverviewTab('timeChallenge'));
elements.replayAllFilterButton.addEventListener('click', () => setReplayFilter('all'));
elements.replayUnderThreeFilterButton.addEventListener('click', () => setReplayFilter('underThreeStars'));
elements.replayRandomButton.addEventListener('click', startRandomReplayLevel);
elements.createDatabaseButton.addEventListener('click', createPracticeDatabase);
elements.startLevelsButton.addEventListener('click', startLevels);
elements.startBeginnerPathButton.addEventListener('click', startBeginnerPath);
elements.startAdvancedPathButton.addEventListener('click', startAdvancedPath);
elements.startLevelOneButton.addEventListener('click', completeBeginnerIntro);
elements.backToLevelsButton.addEventListener('click', showLearningFlow);
elements.showDatabaseInfoButton.addEventListener('click', showDatabaseInfo);
elements.showDatabaseInfoInGameButton.addEventListener('click', showDatabaseInfo);
elements.successModalCloseButton.addEventListener('click', closeSuccessModalToOverview);
elements.successModal.addEventListener('keydown', handleSuccessModalKeydown);
elements.scrollTopButton.addEventListener('click', scrollToPageTop);
elements.globalBackButton.addEventListener('click', navigateBack);
elements.completionOverviewButton.addEventListener('click', () => {
  showOverviewTab('levels');
  elements.levelList.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
elements.completionPracticeButton.addEventListener('click', () => loadLevel(0));
elements.completionResetButton.addEventListener('click', resetProgress);
window.addEventListener('scroll', updateScrollTopButton);

if (IS_TEST_MODE) {
  elements.testUnlockAllButton.addEventListener('click', unlockAllLevelsForTesting);
  elements.testSolveAllButton.addEventListener('click', markAllLevelsSolvedForTesting);
  elements.testResetProgressButton.addEventListener('click', resetProgressForTesting);
  elements.testJumpBeginnerButton.addEventListener('click', () => jumpToLevelSectionForTesting('beginner'));
  elements.testJumpAdvancedButton.addEventListener('click', () => jumpToLevelSectionForTesting('advancedJoins'));
  elements.testJumpMasterButton.addEventListener('click', () => jumpToLevelSectionForTesting('master'));
}

async function init() {
  updateProgressBar();
  updateScrollTopButton();
  setIntroFeedback('sql.js wird geladen …', 'info');
  showDatabaseInfo();
  try {
    SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    });
    updateDatabaseIntroActions();
    setIntroFeedback('Bereit zum Erstellen der Übungsdatenbank.', 'info');
  } catch (error) {
    updateDatabaseIntroActions();
    setIntroFeedback(`sql.js konnte nicht geladen werden: ${error.message}`, 'error');
  }
}

function createPracticeDatabase() {
  if (isDatabaseReady) {
    setIntroFeedback('Die Übungsdatenbank ist bereits erstellt.', 'info');
    updateDatabaseIntroActions();
    return;
  }

  if (!SQL) {
    setIntroFeedback('sql.js ist noch nicht bereit. Bitte warte einen Moment.', 'error');
    return;
  }

  db = new SQL.Database();
  seedDatabase(db);
  isDatabaseReady = true;
  updateDatabaseIntroActions();
  setIntroFeedback('Die Übungsdatenbank wurde erfolgreich erstellt.', 'success');
}

function startLevels() {
  hasLevelSessionStarted = true;
  showLearningFlow();
}

function startBeginnerPath() {
  selectedPath = 'beginner';
  hasLevelSessionStarted = true;
  showLearningFlow();
}

function startAdvancedPath() {
  if (!isAdvancedPathUnlocked()) {
    setIntroFeedback('Der Fortgeschrittenenpfad wird nach Abschluss von Level 30 freigeschaltet.', 'info');
    return;
  }
  selectedPath = 'advanced';
  hasLevelSessionStarted = true;
  hasBeginnerIntroCompleted = true;
  currentLevelIndex = LEVELS.findIndex(level => level.id === 31);
  showLevelOverview();
}

function completeBeginnerIntro() {
  hasBeginnerIntroCompleted = true;
  currentLevelIndex = Math.min(progress.currentLevelIndex || 0, LEVELS.length - 1);
  if (!isLevelUnlocked(currentLevelIndex)) {
    currentLevelIndex = 0;
  }
  showLevelOverview();
}

function showLearningFlow() {
  if (!isDatabaseReady) {
    setIntroFeedback('Bitte erstelle zuerst die Übungsdatenbank.', 'error');
    showDatabaseInfo();
    return;
  }

  if (!selectedPath) {
    showPathSelection();
    return;
  }

  if (selectedPath === 'advanced') {
    showLevelOverview();
    return;
  }

  if (selectedPath === 'beginner' && !hasBeginnerIntroCompleted) {
    showBeginnerIntro();
    return;
  }

  showLevelOverview();
}

function navigateToView(viewName, renderView) {
  if (currentView && currentView !== viewName && !isNavigatingBack) {
    const previousView = viewHistory[viewHistory.length - 1];
    if (previousView !== currentView) {
      viewHistory.push(currentView);
    }
  }

  currentView = viewName;
  renderView();
  updateGlobalBackButton();
}

function navigateBack() {
  let previousView = viewHistory.pop();
  while (previousView && previousView === currentView) {
    previousView = viewHistory.pop();
  }

  if (!previousView) {
    updateGlobalBackButton();
    return;
  }

  isNavigatingBack = true;
  renderViewByName(previousView);
  isNavigatingBack = false;
}

function renderViewByName(viewName) {
  if (viewName === 'databaseInfo') {
    showDatabaseInfo();
  } else if (viewName === 'pathSelection') {
    showPathSelection();
  } else if (viewName === 'beginnerIntro') {
    showBeginnerIntro();
  } else if (viewName === 'levelOverview') {
    showLevelOverview();
  } else if (viewName === 'game') {
    loadLevel(currentLevelIndex);
  }
}

function updateGlobalBackButton() {
  const hasPreviousView = viewHistory.some(viewName => viewName !== currentView);
  elements.globalBackButton.hidden = !hasPreviousView;
  elements.globalBackButton.disabled = !hasPreviousView;
}

function scrollToPageTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateScrollTopButton() {
  elements.scrollTopButton.hidden = window.scrollY < 160;
}

function hideLearningViews(options = {}) {
  const preserveTimeChallenge = Boolean(options.preserveTimeChallenge);
  if (!preserveTimeChallenge && !elements.gameLayout.hidden) {
    stopTimeChallenge('navigation');
  }
  if (elements.completionCard) {
    elements.completionCard.hidden = true;
  }
  elements.databaseIntro.hidden = true;
  elements.pathSelection.hidden = true;
  elements.beginnerIntro.hidden = true;
  elements.gameLayout.hidden = true;
  elements.levelOverview.hidden = true;
}

function showPathSelection() {
  navigateToView('pathSelection', () => {
    hideLearningViews();
    elements.pathSelection.hidden = false;
    updatePathSelection();
  });
}

function updatePathSelection() {
  const advancedUnlocked = isAdvancedPathUnlocked();
  elements.advancedPathCard.classList.toggle('active-path', advancedUnlocked);
  elements.advancedPathCard.classList.toggle('disabled-path', !advancedUnlocked);
  elements.advancedPathCard.setAttribute('aria-disabled', String(!advancedUnlocked));
  elements.advancedPathBadge.textContent = advancedUnlocked ? 'Freigeschaltet' : 'Gesperrt';
  elements.startAdvancedPathButton.disabled = !advancedUnlocked;
  elements.startAdvancedPathButton.textContent = advancedUnlocked ? 'Fortgeschrittene starten' : 'Nach Level 30 verfügbar';
}


function showBeginnerIntro() {
  navigateToView('beginnerIntro', () => {
    hideLearningViews();
    elements.beginnerIntro.hidden = false;
  });
}

function showLevelOverview() {
  if (!isDatabaseReady) {
    setIntroFeedback('Bitte erstelle zuerst die Übungsdatenbank.', 'error');
    showDatabaseInfo();
    return;
  }

  navigateToView('levelOverview', () => {
    hideSuccessModal();
    hideLearningViews();
    elements.levelOverview.hidden = false;
    renderTestModePanel();
    renderLevelList();
    renderSqlBasicsChapters();
    renderLearnedOverview();
    showOverviewTab('levels');
    updateProgressBar();
    renderCompletionCard();
    renderBadges();
    checkAndShowMilestones();
  });
}


function showOverviewTab(tabName) {
  const showLearned = tabName === 'learned';
  const showReplay = tabName === 'replay';
  const showTimeChallenge = tabName === 'timeChallenge';
  elements.levelsOverviewPanel.hidden = showLearned || showReplay || showTimeChallenge;
  elements.learnedOverviewPanel.hidden = !showLearned;
  elements.replayOverviewPanel.hidden = !showReplay;
  elements.timeChallengeOverviewPanel.hidden = !showTimeChallenge;
  elements.levelsTabButton.classList.toggle('active', !showLearned && !showReplay && !showTimeChallenge);
  elements.learnedOverviewTabButton.classList.toggle('active', showLearned);
  elements.replayTabButton.classList.toggle('active', showReplay);
  elements.timeChallengeTabButton.classList.toggle('active', showTimeChallenge);
  elements.levelsTabButton.setAttribute('aria-selected', String(!showLearned && !showReplay && !showTimeChallenge));
  elements.learnedOverviewTabButton.setAttribute('aria-selected', String(showLearned));
  elements.replayTabButton.setAttribute('aria-selected', String(showReplay));
  elements.timeChallengeTabButton.setAttribute('aria-selected', String(showTimeChallenge));
  if (showLearned) renderLearnedOverview();
  if (showReplay) renderReplayOverview();
  if (showTimeChallenge) renderTimeChallengeOverview();
}

function showDatabaseInfo() {
  navigateToView('databaseInfo', () => {
    hideSuccessModal();
    hideLearningViews();
    elements.databaseIntro.hidden = false;
    updateDatabaseIntroActions();
  });
}

function updateDatabaseIntroActions() {
  elements.createDatabaseButton.hidden = isDatabaseReady;
  elements.createDatabaseButton.disabled = !SQL || isDatabaseReady;
  elements.startLevelsButton.hidden = !isDatabaseReady || hasLevelSessionStarted;
  elements.backToLevelsButton.hidden = !isDatabaseReady || !hasLevelSessionStarted;
}

function createEmptyProgress() {
  return {
    score: 0,
    solvedLevelIds: [],
    currentLevelIndex: 0,
    savedQueries: {},
    levelStars: {},
    levelAttempts: {},
    hintUsedLevelIds: [],
    solutionViewedLevelIds: [],
    unlockedBadgeDates: {},
    shownMilestones: [],
    starSystemVersion: STAR_SYSTEM_VERSION,
    dailyChallenge: { date: null, levelId: null, completed: false },
    timeChallenge: { bestRemainingSecondsByLevel: {}, completedCount: 0, lastStartedLevelId: null }
  };
}

function loadProgress() {
  const fallback = createEmptyProgress();
  try {
    const rawProgress = localStorage.getItem(STORAGE_KEY);
    if (!rawProgress) {
      return fallback;
    }

    const storedProgress = JSON.parse(rawProgress) || {};
    const migratedProgress = migrateProgressToCurrentStarSystem(storedProgress);
    const normalizedProgress = {
      ...fallback,
      ...migratedProgress,
      score: Number.isFinite(migratedProgress.score) ? migratedProgress.score : fallback.score,
      currentLevelIndex: Number.isInteger(migratedProgress.currentLevelIndex) ? migratedProgress.currentLevelIndex : fallback.currentLevelIndex,
      solvedLevelIds: Array.isArray(migratedProgress.solvedLevelIds) ? migratedProgress.solvedLevelIds : [],
      savedQueries: migratedProgress.savedQueries && typeof migratedProgress.savedQueries === 'object' ? migratedProgress.savedQueries : {},
      levelStars: migratedProgress.levelStars && typeof migratedProgress.levelStars === 'object' ? migratedProgress.levelStars : {},
      levelAttempts: migratedProgress.levelAttempts && typeof migratedProgress.levelAttempts === 'object' ? migratedProgress.levelAttempts : {},
      hintUsedLevelIds: Array.isArray(migratedProgress.hintUsedLevelIds) ? migratedProgress.hintUsedLevelIds : [],
      solutionViewedLevelIds: Array.isArray(migratedProgress.solutionViewedLevelIds) ? migratedProgress.solutionViewedLevelIds : [],
      unlockedBadgeDates: migratedProgress.unlockedBadgeDates && typeof migratedProgress.unlockedBadgeDates === 'object' ? migratedProgress.unlockedBadgeDates : {},
      shownMilestones: Array.isArray(migratedProgress.shownMilestones) ? migratedProgress.shownMilestones : [],
      dailyChallenge: normalizeDailyChallenge(migratedProgress).dailyChallenge,
      timeChallenge: normalizeTimeChallenge(migratedProgress).timeChallenge,
      starSystemVersion: STAR_SYSTEM_VERSION
    };

    if (storedProgress.starSystemVersion !== STAR_SYSTEM_VERSION) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedProgress));
    }

    return normalizedProgress;
  } catch {
    return fallback;
  }
}

function migrateProgressToCurrentStarSystem(storedProgress) {
  if (storedProgress.starSystemVersion === STAR_SYSTEM_VERSION) {
    return storedProgress;
  }

  const migratedLevelStars = {};
  const oldLevelStars = storedProgress.levelStars && typeof storedProgress.levelStars === 'object'
    ? storedProgress.levelStars
    : {};

  Object.entries(oldLevelStars).forEach(([levelId, oldStars]) => {
    migratedLevelStars[levelId] = migrateLegacyStars(oldStars);
  });

  return {
    ...storedProgress,
    levelStars: migratedLevelStars,
    starSystemVersion: STAR_SYSTEM_VERSION,
    dailyChallenge: { date: null, levelId: null, completed: false },
    timeChallenge: { bestRemainingSecondsByLevel: {}, completedCount: 0, lastStartedLevelId: null }
  };
}

function migrateLegacyStars(oldStars) {
  const stars = Number(oldStars) || 0;
  if (stars >= 5) {
    return 3;
  }
  if (stars === 4) {
    return 2;
  }
  if (stars === 3) {
    return 1;
  }
  return 0;
}

function saveProgress({ refreshDailyChallenge = true } = {}) {
  if (refreshDailyChallenge) {
    progress = updateDailyChallengeProgress(progress);
  }
  progress.currentLevelIndex = currentLevelIndex;
  progress.starSystemVersion = STAR_SYSTEM_VERSION;
  progress = applyBadgeUnlockDates(progress);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

const LEVEL_SECTIONS = [
  {
    id: 'beginner',
    title: 'Anfänger',
    levelStart: 1,
    levelEnd: 30,
    unlockLevelId: null,
    lockedHint: ''
  },
  {
    id: 'advancedJoins',
    title: 'Fortgeschritten',
    levelStart: 31,
    levelEnd: 60,
    unlockLevelId: 30,
    lockedHint: 'Wird nach dem Lösen von Level 30 freigeschaltet.'
  },
  {
    id: 'master',
    title: 'Meister',
    levelStart: 61,
    levelEnd: 80,
    unlockLevelId: 60,
    lockedHint: 'Wird nach dem Lösen von Level 60 freigeschaltet.'
  }
];


function getSolvedLevelIdSet() {
  return new Set((Array.isArray(progress.solvedLevelIds) ? progress.solvedLevelIds : []).map(id => Number(id)));
}

function countSolvedLevelsInRange(start, end) {
  const solved = getSolvedLevelIdSet();
  let count = 0;
  for (let id = start; id <= end; id += 1) {
    if (solved.has(id)) count += 1;
  }
  return count;
}

function getSolvedLevelCount() {
  return countSolvedLevelsInRange(1, LEVELS.length);
}

function isBadgeUnlocked(badgeId) {
  const solved = getSolvedLevelIdSet();
  if (badgeId === 'first_steps') return getSolvedLevelCount() >= 1;
  if (badgeId === 'star_collector') return getCollectedStars() >= 25;
  if (badgeId === 'halfway') return getSolvedLevelCount() >= 40;
  if (badgeId === 'no_help') return Object.values(progress.levelStars || {}).filter(stars => Number(stars) === MAX_STARS).length >= 5;
  if (badgeId === 'beginner_done') return countSolvedLevelsInRange(1, 30) >= 30;
  if (badgeId === 'advanced_done') return countSolvedLevelsInRange(31, 60) >= 30;
  if (badgeId === 'masterclass') return solved.has(80);
  if (badgeId === 'quest_complete') return getSolvedLevelCount() >= LEVELS.length;
  return false;
}

function applyBadgeUnlockDates(currentProgress) {
  const unlockedBadgeDates = currentProgress.unlockedBadgeDates && typeof currentProgress.unlockedBadgeDates === 'object' ? { ...currentProgress.unlockedBadgeDates } : {};
  const previousProgress = progress;
  progress = { ...currentProgress, unlockedBadgeDates };
  BADGE_DEFINITIONS.forEach(badge => {
    if (isBadgeUnlocked(badge.id) && !unlockedBadgeDates[badge.id]) {
      unlockedBadgeDates[badge.id] = new Date().toISOString();
    }
  });
  const updatedProgress = { ...progress, unlockedBadgeDates };
  progress = previousProgress;
  return updatedProgress;
}

function renderBadges() {
  if (!elements.badgeGrid || !elements.badgeSummary) return;
  const badges = BADGE_DEFINITIONS.map(badge => ({ ...badge, unlocked: isBadgeUnlocked(badge.id), unlockedAt: progress.unlockedBadgeDates?.[badge.id] || null }));
  const unlockedCount = badges.filter(badge => badge.unlocked).length;
  elements.badgeSummary.textContent = `${unlockedCount} von ${badges.length} Abzeichen freigeschaltet`;
  elements.badgeGrid.innerHTML = '';
  badges.forEach(badge => {
    const card = document.createElement('article');
    card.className = `badge-card${badge.unlocked ? ' unlocked' : ' locked'}`;
    const statusText = badge.unlocked ? 'Freigeschaltet' : 'Gesperrt';
    const dateText = badge.unlockedAt ? ` · ${new Date(badge.unlockedAt).toLocaleDateString('de-DE')}` : '';
    card.setAttribute('aria-label', `${badge.title}: ${statusText}`);
    card.innerHTML = `
      <div class="badge-icon" aria-hidden="true">${badge.unlocked ? badge.icon : '🔒'}</div>
      <div>
        <h3>${badge.title}</h3>
        <p>${badge.description}</p>
        <span>${statusText}${dateText}</span>
      </div>`;
    elements.badgeGrid.append(card);
  });
}

function getNewMilestones() {
  const percent = LEVELS.length === 0 ? 0 : Math.floor((getSolvedLevelCount() / LEVELS.length) * 100);
  const shown = new Set((progress.shownMilestones || []).map(Number));
  return MILESTONE_DEFINITIONS.filter(milestone => percent >= milestone && !shown.has(milestone));
}

function checkAndShowMilestones() {
  const newMilestones = getNewMilestones();
  if (!newMilestones.length) return;
  progress.shownMilestones = Array.from(new Set([...(progress.shownMilestones || []), ...newMilestones]));
  saveProgress();
  showMilestoneBanner(newMilestones[newMilestones.length - 1]);
}

function showMilestoneBanner(percent) {
  if (!elements.milestoneBanner) return;
  elements.milestoneBanner.textContent = `🎉 Meilenstein erreicht: ${percent} % von SQL Quest geschafft!`;
  elements.milestoneBanner.hidden = false;
  window.setTimeout(hideMilestoneBanner, 5200);
}

function hideMilestoneBanner() {
  if (elements.milestoneBanner) elements.milestoneBanner.hidden = true;
}

function renderLevelList() {
  if (!isLevelSectionAccessible(activeLevelSection)) {
    activeLevelSection = 'beginner';
  }

  elements.levelList.innerHTML = '';
  elements.levelList.append(createLevelSectionTabs());
  const lockedHint = createLockedLevelSectionHint();
  if (lockedHint) {
    elements.levelList.append(lockedHint);
  }
  elements.levelList.append(createActiveLevelSectionPanel());
  elements.score.textContent = progress.score;
  renderSqlBasicsChapters();
  renderDailyChallenge();
  updateProgressBar();
}

function createLevelSectionTabs() {
  const tabList = document.createElement('div');
  tabList.className = 'level-section-tabs';
  tabList.setAttribute('role', 'tablist');
  tabList.setAttribute('aria-label', 'Levelbereiche');

  LEVEL_SECTIONS.forEach(section => {
    const isAccessible = isLevelSectionAccessible(section.id);
    const isSelected = activeLevelSection === section.id;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = getLevelSectionTabId(section.id);
    tab.className = 'level-section-tab';
    tab.dataset.section = section.id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(isSelected));
    tab.setAttribute('aria-controls', getLevelSectionPanelId(section.id));
    tab.disabled = !isAccessible;
    tab.innerHTML = `${!isAccessible ? '<span aria-hidden="true">🔒</span> ' : ''}${getLevelSectionIcon(section.id)} ${section.title}`;
    if (!isAccessible) {
      tab.setAttribute('aria-label', `${section.title} gesperrt. ${section.lockedHint}`);
      tab.title = section.lockedHint;
    }
    tab.addEventListener('click', () => {
      if (!isAccessible) {
        setOverviewFeedback(section.lockedHint, 'info');
        return;
      }
      activeLevelSection = section.id;
      renderLevelList();
    });
    tabList.append(tab);
  });

  return tabList;
}

function createLockedLevelSectionHint() {
  const lockedSections = LEVEL_SECTIONS.filter(section => section.unlockLevelId && !isLevelSectionAccessible(section.id));
  if (!lockedSections.length) {
    return null;
  }

  const hint = document.createElement('p');
  hint.className = 'level-section-locked-hint';
  hint.textContent = lockedSections.map(section => `🔒 ${section.title}: ${section.lockedHint}`).join(' ');
  return hint;
}

function createActiveLevelSectionPanel() {
  const section = LEVEL_SECTIONS.find(levelSection => levelSection.id === activeLevelSection) || LEVEL_SECTIONS[0];
  const levels = getLevelsForLevelSection(section);
  const solved = levels.filter(level => progress.solvedLevelIds.includes(level.id)).length;
  const panel = document.createElement('section');
  panel.id = getLevelSectionPanelId(section.id);
  panel.className = `level-section section-${section.id} ${solved === levels.length ? 'completed' : ''}`;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', getLevelSectionTabId(section.id));
  panel.innerHTML = `<div class="level-section-heading"><h3 data-icon="${getLevelSectionIcon(section.id)}">${section.title}</h3><span>Mission ${solved} von ${levels.length} gelöst</span></div>`;

  const grid = document.createElement('div');
  grid.className = 'level-list compact-level-grid';
  levels.forEach(level => {
    if (section.id === 'advancedJoins' && (level.id === 41 || level.id === 51)) {
      const subheading = document.createElement('h4');
      subheading.className = 'level-section-subheading';
      subheading.textContent = level.id === 41 ? 'JOIN-Auswertungen' : 'Unterabfragen und komplexe Filter';
      grid.append(subheading);
    }
    if (section.id === 'master' && level.id === 61) {
      const subheading = document.createElement('h4');
      subheading.className = 'level-section-subheading';
      subheading.textContent = 'Meister-Abfragen und komplexe Auswertungen';
      grid.append(subheading);
    }
    grid.append(createLevelButton(level, LEVELS.indexOf(level)));
  });
  panel.append(grid);
  return panel;
}

function getLevelsForLevelSection(section) {
  return LEVELS.filter(level => level.id >= section.levelStart && level.id <= section.levelEnd);
}

function isLevelSectionAccessible(sectionId) {
  const section = LEVEL_SECTIONS.find(levelSection => levelSection.id === sectionId);
  return Boolean(section && (isEveryLevelUnlockedForTesting() || !section.unlockLevelId || progress.solvedLevelIds.includes(section.unlockLevelId)));
}


function getLevelSectionIcon(sectionId) {
  if (sectionId === 'beginner') return '🌱';
  if (sectionId === 'advancedJoins') return '🚀';
  if (sectionId === 'master') return '👑';
  return '🧭';
}

function getLevelSectionTabId(sectionId) {
  return `${sectionId}LevelSectionTab`;
}

function getLevelSectionPanelId(sectionId) {
  return `${sectionId}LevelSectionPanel`;
}

function createLevelButton(level, index) {
  const unlocked = isLevelUnlocked(index);
  const stars = getLevelStars(level.id);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'level-button';
  button.classList.toggle('active', index === currentLevelIndex);
  button.classList.toggle('solved', progress.solvedLevelIds.includes(level.id));
  button.classList.toggle('locked', !unlocked);
  button.setAttribute('aria-disabled', String(!unlocked));
  button.setAttribute('aria-label', getLevelButtonLabel(level, index, unlocked, stars));
  button.innerHTML = `
    <span class="level-button-topline">
      <span class="level-number" data-level-number="${level.id}">Level ${level.id}</span>
      <span class="level-stars" aria-hidden="true">${unlocked ? renderStars(stars) : '🔒'}</span>
    </span>
    <strong>${level.title}</strong>
  `;
  button.addEventListener('click', () => {
    if (!isLevelUnlocked(index)) {
      setOverviewFeedback('Erreiche mindestens 2 Sterne im vorherigen Level, um dieses Level freizuschalten.', 'info');
      return;
    }
    loadLevel(index);
  });
  return button;
}


function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashStringToIndex(seed, length) {
  if (!length) return -1;
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

function normalizeDailyChallenge(sourceProgress = progress) {
  const challenge = sourceProgress.dailyChallenge && typeof sourceProgress.dailyChallenge === 'object' ? sourceProgress.dailyChallenge : {};
  return {
    ...sourceProgress,
    dailyChallenge: {
      date: typeof challenge.date === 'string' ? challenge.date : null,
      levelId: Number.isInteger(Number(challenge.levelId)) ? Number(challenge.levelId) : null,
      completed: Boolean(challenge.completed)
    }
  };
}

function hasDailyChallengeChanged(previousProgress = {}, nextProgress = {}) {
  const previous = normalizeDailyChallenge(previousProgress).dailyChallenge;
  const next = normalizeDailyChallenge(nextProgress).dailyChallenge;
  return previous.date !== next.date || Number(previous.levelId) !== Number(next.levelId) || Boolean(previous.completed) !== Boolean(next.completed);
}

function persistDailyChallengeIfChanged(previousProgress, nextProgress) {
  if (!hasDailyChallengeChanged(previousProgress, nextProgress)) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgress));
}

function selectDailyChallengeLevel(sourceProgress = progress, dateKey = getLocalDateKey()) {
  const normalized = normalizeDailyChallenge(sourceProgress);
  const existingIds = new Set(LEVELS.map(level => Number(level.id)));
  if (normalized.dailyChallenge.date === dateKey && existingIds.has(Number(normalized.dailyChallenge.levelId))) {
    return LEVELS.find(level => Number(level.id) === Number(normalized.dailyChallenge.levelId)) || null;
  }
  const solved = new Set((Array.isArray(normalized.solvedLevelIds) ? normalized.solvedLevelIds : []).map(Number));
  const unlocked = LEVELS.filter((level, index) => isLevelUnlocked(index));
  const groups = [
    unlocked.filter(level => !solved.has(Number(level.id))),
    unlocked.filter(level => solved.has(Number(level.id)) && getLevelStars(level.id) < MAX_STARS),
    unlocked,
    LEVELS.filter(level => solved.has(Number(level.id)))
  ];
  const candidates = groups.find(group => group.length > 0) || [];
  if (!candidates.length) return null;
  return candidates[hashStringToIndex(`${dateKey}:daily-challenge`, candidates.length)] || null;
}

function updateDailyChallengeProgress(sourceProgress = progress) {
  const dateKey = getLocalDateKey();
  const level = selectDailyChallengeLevel(sourceProgress, dateKey);
  const normalized = normalizeDailyChallenge(sourceProgress);
  if (!level) return normalized;
  const sameChallenge = normalized.dailyChallenge.date === dateKey && Number(normalized.dailyChallenge.levelId) === Number(level.id);
  return {
    ...normalized,
    dailyChallenge: { date: dateKey, levelId: level.id, completed: sameChallenge ? normalized.dailyChallenge.completed : false }
  };
}

function renderDailyChallenge() {
  const previousProgress = progress;
  progress = updateDailyChallengeProgress(progress);
  persistDailyChallengeIfChanged(previousProgress, progress);
  const challenge = progress.dailyChallenge;
  const level = LEVELS.find(candidate => Number(candidate.id) === Number(challenge.levelId));
  elements.dailyChallengeDate.textContent = challenge.date ? `Heutige Challenge · ${challenge.date}` : 'Heutige Challenge';
  elements.dailyChallengeContent.innerHTML = '';
  if (!level) {
    elements.dailyChallengeContent.innerHTML = '<p class="empty-state">Noch keine gültige Tages-Challenge verfügbar.</p>';
    return;
  }
  const article = document.createElement('article');
  article.innerHTML = `
    <h3 class="daily-challenge-title">Level ${level.id}: ${level.title}</h3>
    <div class="daily-challenge-meta">
      <span>Kategorie: ${level.difficulty}</span>
      <span>Aktuelle Sterne: ${renderStars(getLevelStars(level.id))}</span>
      <span>${challenge.completed ? 'Heute geschafft' : 'Neue Challenge morgen'}</span>
    </div>
    <div class="daily-challenge-actions">
      <button class="primary-button" type="button">Challenge starten</button>
      <span class="daily-challenge-note">Zählt normal für Sterne, Punkte und Fortschritt.</span>
    </div>
  `;
  article.querySelector('button').addEventListener('click', () => loadLevel(LEVELS.indexOf(level), { dailyChallenge: true }));
  elements.dailyChallengeContent.append(article);
}

function markDailyChallengeCompleted(levelId) {
  const dateKey = getLocalDateKey();
  progress = normalizeDailyChallenge(progress);
  if (progress.dailyChallenge.date === dateKey && Number(progress.dailyChallenge.levelId) === Number(levelId)) {
    progress.dailyChallenge.completed = true;
  }
}


function normalizeTimeChallenge(progress = {}) {
  const challenge = progress.timeChallenge && typeof progress.timeChallenge === 'object' ? progress.timeChallenge : {};
  return {
    ...progress,
    timeChallenge: {
      bestRemainingSecondsByLevel: challenge.bestRemainingSecondsByLevel && typeof challenge.bestRemainingSecondsByLevel === 'object' ? challenge.bestRemainingSecondsByLevel : {},
      completedCount: Number.isInteger(Number(challenge.completedCount)) ? Math.max(0, Number(challenge.completedCount)) : 0,
      completedChallengeCount: Number.isInteger(Number(challenge.completedChallengeCount)) ? Math.max(0, Number(challenge.completedChallengeCount)) : (Number.isInteger(Number(challenge.completedCount)) ? Math.max(0, Number(challenge.completedCount)) : 0),
      bestRemainingSeconds: Number.isFinite(Number(challenge.bestRemainingSeconds)) ? Math.max(0, Math.floor(Number(challenge.bestRemainingSeconds))) : 0,
      bestExpiredSolvedCount: Number.isInteger(Number(challenge.bestExpiredSolvedCount)) ? Math.max(0, Number(challenge.bestExpiredSolvedCount)) : 0,
      lastStartedLevelId: Number.isInteger(Number(challenge.lastStartedLevelId)) ? Number(challenge.lastStartedLevelId) : null
    }
  };
}


function formatTimeChallengeSeconds(seconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

function getTimeChallengeCandidateGroups() {
  const solved = getSolvedLevelIdSet();
  const unlocked = LEVELS.filter((level, index) => isLevelUnlocked(index));
  return [
    unlocked.filter(level => !solved.has(Number(level.id))),
    unlocked.filter(level => getLevelStars(level.id) < MAX_STARS),
    unlocked
  ];
}

function selectTimeChallengeLevel(random = Math.random) {
  return selectTimeChallengeLevels(random, 1)[0] || null;
}

function shuffleTimeChallengeCandidates(candidates = [], random = Math.random) {
  const shuffled = [...candidates];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomValue = Math.max(0, Math.min(0.999999999999, Number(random()) || 0));
    const swapIndex = Math.floor(randomValue * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function selectTimeChallengeLevels(random = Math.random, count = TIME_CHALLENGE_LEVEL_COUNT) {
  const selected = [];
  const selectedIds = new Set();
  for (const group of getTimeChallengeCandidateGroups()) {
    const uniqueGroup = group.filter(level => !selectedIds.has(Number(level.id)));
    for (const level of shuffleTimeChallengeCandidates(uniqueGroup, random)) {
      if (selectedIds.has(Number(level.id))) continue;
      selected.push(level);
      selectedIds.add(Number(level.id));
      if (selected.length >= count) return selected;
    }
  }
  return selected;
}

function renderTimeChallengeOverview() {
  progress = normalizeTimeChallenge(progress);
  const previewLevels = selectTimeChallengeLevels(Math.random);
  elements.timeChallengeSummary.textContent = `${progress.timeChallenge.completedChallengeCount} geschafft`;
  elements.timeChallengeContent.innerHTML = '';
  if (!previewLevels.length) {
    elements.timeChallengeContent.innerHTML = '<p class="empty-state">Noch kein freigeschaltetes Level für die Zeit-Challenge verfügbar.</p>';
    return;
  }
  const best = Number(progress.timeChallenge.bestRemainingSeconds) || 0;
  const article = document.createElement('article');
  article.className = 'time-challenge-card';
  article.innerHTML = `
    <h3 class="daily-challenge-title">5 zufällige freigeschaltete Level</h3>
    <div class="daily-challenge-meta">
      <span>Gesamtzeit: ${formatTimeChallengeSeconds(TIME_CHALLENGE_LIMIT_SECONDS)}</span>
      <span>Level pro Runde: ${previewLevels.length}</span>
      <span>Bestzeit: ${best ? formatTimeChallengeSeconds(best) : '—'}</span>
      <span>Bester Ablauf-Fortschritt: ${progress.timeChallenge.bestExpiredSolvedCount || 0}</span>
    </div>
    <p>Bei jedem Start wird eine neue zufällige Auswahl ohne Duplikate erzeugt. Priorität haben ungelöste Level und Level mit weniger als 3 Sternen.</p>
    <div class="daily-challenge-actions">
      <button class="primary-button" type="button" data-action="start">Zeit-Challenge starten</button>
    </div>`;
  article.querySelector('[data-action="start"]').addEventListener('click', () => startTimeChallenge());
  elements.timeChallengeContent.append(article);
}

function startTimeChallenge() {
  const levels = selectTimeChallengeLevels(Math.random);
  if (!levels.length) return;
  stopTimeChallenge('restart');
  hideTimeChallengeEndCard();
  progress = normalizeTimeChallenge(progress);
  progress.timeChallenge.lastStartedLevelId = levels[0].id;
  saveProgress({ refreshDailyChallenge: false });
  activeTimeChallenge = { active: true, levelIds: levels.map(level => level.id), currentIndex: 0, remainingSeconds: TIME_CHALLENGE_LIMIT_SECONDS, expired: false, completed: false };
  loadLevel(LEVELS.indexOf(levels[0]), { timeChallenge: true });
}

function scrollToTimeChallengeEditor() {
  window.requestAnimationFrame(() => {
    elements.editorCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function beginTimeChallenge(level) {
  if (!activeTimeChallenge || activeTimeChallenge.completed || activeTimeChallenge.expired) return;
  activeTimeChallenge.levelId = level.id;
  updateTimeChallengeTimer();
  scrollToTimeChallengeEditor();
  if (timeChallengeIntervalId) return;
  timeChallengeIntervalId = window.setInterval(() => {
    if (!activeTimeChallenge) return;
    activeTimeChallenge.remainingSeconds -= 1;
    if (activeTimeChallenge.remainingSeconds <= 0) {
      activeTimeChallenge.remainingSeconds = 0;
      finishTimeChallenge(false);
      return;
    }
    updateTimeChallengeTimer();
  }, 1000);
}

function hideTimeChallengeEndCard() {
  if (!elements.timeChallengeEndCard) return;
  elements.timeChallengeEndCard.hidden = true;
  elements.timeChallengeEndCard.innerHTML = '';
}

function updateTimeChallengeTimer() {
  if (!activeTimeChallenge) {
    elements.timeChallengeTimer.hidden = true;
    return;
  }
  const total = activeTimeChallenge.levelIds.length;
  const solved = Math.min(activeTimeChallenge.currentIndex, total);
  const currentNumber = Math.min(activeTimeChallenge.currentIndex + 1, total);
  const level = LEVELS.find(candidate => candidate.id === activeTimeChallenge.levelId) || LEVELS.find(candidate => candidate.id === activeTimeChallenge.levelIds[activeTimeChallenge.currentIndex]);
  elements.timeChallengeTimer.hidden = false;
  elements.timeChallengeTimer.innerHTML = `<div class="time-challenge-timer-top"><strong>⏱ ${formatTimeChallengeSeconds(activeTimeChallenge.remainingSeconds)}</strong><span>Level ${currentNumber} von ${total}</span></div><div class="challenge-progress-track" aria-label="Challenge-Fortschritt" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${solved}" role="progressbar"><span style="width: ${total ? (solved / total) * 100 : 0}%"></span></div><span class="time-challenge-level-title">${level ? `Level ${level.id}: ${level.title}` : 'Zeit-Challenge'}</span>`;
}

function stopTimeChallenge() {
  if (timeChallengeIntervalId) window.clearInterval(timeChallengeIntervalId);
  timeChallengeIntervalId = null;
  activeTimeChallenge = null;
  if (elements.timeChallengeTimer) elements.timeChallengeTimer.hidden = true;
  hideTimeChallengeEndCard();
}

function finishTimeChallenge(wasCompleted) {
  if (!activeTimeChallenge) return null;
  const summary = { wasCompleted, solvedCount: wasCompleted ? activeTimeChallenge.levelIds.length : activeTimeChallenge.currentIndex, totalCount: activeTimeChallenge.levelIds.length, remainingSeconds: activeTimeChallenge.remainingSeconds };
  if (timeChallengeIntervalId) window.clearInterval(timeChallengeIntervalId);
  timeChallengeIntervalId = null;
  activeTimeChallenge.completed = wasCompleted;
  activeTimeChallenge.expired = !wasCompleted;
  progress = normalizeTimeChallenge(progress);
  if (wasCompleted) {
    progress.timeChallenge.completedChallengeCount += 1;
    progress.timeChallenge.completedCount = progress.timeChallenge.completedChallengeCount;
    progress.timeChallenge.bestRemainingSeconds = Math.max(progress.timeChallenge.bestRemainingSeconds, summary.remainingSeconds);
  } else {
    progress.timeChallenge.bestExpiredSolvedCount = Math.max(progress.timeChallenge.bestExpiredSolvedCount, summary.solvedCount);
  }
  saveProgress({ refreshDailyChallenge: false });
  activeTimeChallenge = null;
  if (elements.timeChallengeTimer) elements.timeChallengeTimer.hidden = true;
  showTimeChallengeEndCard(summary);
  return summary;
}

function completeActiveTimeChallenge(levelId) {
  if (!activeTimeChallenge || activeTimeChallenge.expired || activeTimeChallenge.completed || Number(activeTimeChallenge.levelId) !== Number(levelId) || activeTimeChallenge.remainingSeconds <= 0) return null;
  const remainingSeconds = activeTimeChallenge.remainingSeconds;
  progress = normalizeTimeChallenge(progress);
  const previousBest = Number(progress.timeChallenge.bestRemainingSecondsByLevel[levelId]) || 0;
  progress.timeChallenge.bestRemainingSecondsByLevel[levelId] = Math.max(previousBest, remainingSeconds);
  progress.timeChallenge.lastStartedLevelId = Number(levelId);
  activeTimeChallenge.currentIndex += 1;
  if (activeTimeChallenge.currentIndex >= activeTimeChallenge.levelIds.length) return finishTimeChallenge(true);
  const nextLevel = LEVELS.find(level => Number(level.id) === Number(activeTimeChallenge.levelIds[activeTimeChallenge.currentIndex]));
  activeTimeChallenge.levelId = nextLevel?.id;
  updateTimeChallengeTimer();
  return { wasCompleted: false, solvedCount: activeTimeChallenge.currentIndex, totalCount: activeTimeChallenge.levelIds.length, remainingSeconds, nextLevel };
}

function showTimeChallengeEndCard(summary) {
  hideSuccessModal();
  const message = summary.wasCompleted
    ? `🎉 Zeit-Challenge geschafft!\n${summary.solvedCount} von ${summary.totalCount} Leveln gelöst.\nVerbleibende Zeit: ${formatTimeChallengeSeconds(summary.remainingSeconds)}`
    : `⏱ Zeit abgelaufen.\nDu hast ${summary.solvedCount} von ${summary.totalCount} Challenge-Leveln geschafft.\nDeine Sterne und Punkte bleiben unverändert geschützt.`;
  setFeedback(message, summary.wasCompleted ? 'success' : 'info');
  if (elements.timeChallengeTimer) elements.timeChallengeTimer.hidden = true;
  if (!elements.timeChallengeEndCard) return;
  elements.timeChallengeEndCard.hidden = false;
  elements.timeChallengeEndCard.innerHTML = `<h3>${summary.wasCompleted ? '🎉 Zeit-Challenge geschafft!' : '⏱ Zeit abgelaufen.'}</h3><p>${summary.wasCompleted ? `${summary.solvedCount} von ${summary.totalCount} Challenge-Leveln gelöst.` : `Du hast ${summary.solvedCount} von ${summary.totalCount} Challenge-Leveln geschafft.`}</p><p>${summary.wasCompleted ? `Verbleibende Zeit: ${formatTimeChallengeSeconds(summary.remainingSeconds)}` : 'Deine Sterne und Punkte bleiben unverändert geschützt.'}</p><div class="daily-challenge-actions"><button class="primary-button" type="button" data-action="overview">Zur Übersicht</button><button class="secondary-button" type="button" data-action="restart">Neue Zeit-Challenge starten</button></div>`;
  elements.timeChallengeEndCard.querySelector('[data-action="overview"]').addEventListener('click', () => {
    stopTimeChallenge('end-overview');
    showLevelOverview();
  });
  elements.timeChallengeEndCard.querySelector('[data-action="restart"]').addEventListener('click', startTimeChallenge);
  elements.timeChallengeEndCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function getSolvedLevelsForReplay() {
  const solved = getSolvedLevelIdSet();
  return LEVELS.filter(level => solved.has(Number(level.id)));
}

function filterReplayLevels(filter = activeReplayFilter) {
  const replayLevels = getSolvedLevelsForReplay();
  if (filter === 'underThreeStars') {
    return replayLevels.filter(level => getLevelStars(level.id) < MAX_STARS);
  }
  return replayLevels;
}

function getRandomSolvedLevel() {
  const replayLevels = getSolvedLevelsForReplay();
  if (!replayLevels.length) return null;
  return replayLevels[Math.floor(Math.random() * replayLevels.length)];
}

function setReplayFilter(filter) {
  activeReplayFilter = filter;
  renderReplayOverview();
}

function startRandomReplayLevel() {
  const level = getRandomSolvedLevel();
  if (!level) {
    setOverviewFeedback('Löse zuerst ein Level, um den Wiederholungsmodus freizuschalten.', 'info');
    return;
  }
  loadLevel(LEVELS.indexOf(level), { replay: true });
}

function renderReplayOverview() {
  const solvedReplayLevels = getSolvedLevelsForReplay();
  const replayLevels = filterReplayLevels();
  elements.replayOverviewSummary.textContent = `${solvedReplayLevels.length} Level bereit`;
  elements.replayAllFilterButton.classList.toggle('active', activeReplayFilter === 'all');
  elements.replayUnderThreeFilterButton.classList.toggle('active', activeReplayFilter === 'underThreeStars');
  elements.replayRandomButton.disabled = solvedReplayLevels.length === 0;
  elements.replayLevelList.innerHTML = '';

  if (!solvedReplayLevels.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Löse zuerst ein Level, um den Wiederholungsmodus freizuschalten.';
    elements.replayLevelList.append(empty);
    return;
  }

  if (!replayLevels.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Für diesen Filter gibt es aktuell keine gelösten Level.';
    elements.replayLevelList.append(empty);
    return;
  }

  replayLevels.forEach(level => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'level-button solved replay-level-button';
    button.innerHTML = `
      <span class="level-button-topline">
        <span class="level-number">Level ${level.id}</span>
        <span class="level-stars" aria-label="${getLevelStars(level.id)} von ${MAX_STARS} Sternen">${renderStars(getLevelStars(level.id))}</span>
      </span>
      <strong>${level.title}</strong>
      <span>Kategorie: ${level.difficulty}</span>
    `;
    button.addEventListener('click', () => loadLevel(LEVELS.indexOf(level), { replay: true }));
    elements.replayLevelList.append(button);
  });
}

function getHighestSolvedLevelId() {
  const validLevelIds = new Set(LEVELS.map(level => Number(level.id)));
  return progress.solvedLevelIds.reduce((highestLevelId, solvedLevelId) => {
    const numericLevelId = Number(solvedLevelId);
    if (!Number.isFinite(numericLevelId) || !validLevelIds.has(numericLevelId)) {
      return highestLevelId;
    }
    return Math.max(highestLevelId, numericLevelId);
  }, 0);
}

function getUnlockedLearnedSqlStages() {
  const highestSolvedLevelId = getHighestSolvedLevelId();
  return LEARNED_SQL_STAGES.filter(stage => isLearningStageUnlocked(stage, highestSolvedLevelId));
}

function isLearningStageUnlocked(stage, highestSolvedLevelId = getHighestSolvedLevelId()) {
  return highestSolvedLevelId >= stage.unlockLevelId;
}

function createLearnedSqlCard(item) {
  const card = document.createElement('article');
  card.className = 'learned-sql-item';

  const title = document.createElement('h4');
  title.textContent = item.term;
  card.append(title);

  const description = document.createElement('p');
  description.textContent = item.description;
  card.append(description);

  if (item.details?.length) {
    const details = document.createElement('ul');
    details.className = 'learned-sql-details';
    item.details.forEach(detail => {
      const detailItem = document.createElement('li');
      detailItem.textContent = detail;
      details.append(detailItem);
    });
    card.append(details);
  }

  const exampleLabel = document.createElement('p');
  exampleLabel.className = 'learned-sql-example-label';
  exampleLabel.textContent = 'Beispielabfrage';
  card.append(exampleLabel);

  const example = document.createElement('pre');
  example.className = 'sql-example learned-sql-example';
  const code = document.createElement('code');
  code.textContent = item.example;
  example.append(code);
  card.append(example);

  const exampleExplanation = document.createElement('p');
  exampleExplanation.className = 'muted small';
  exampleExplanation.textContent = item.exampleExplanation;
  card.append(exampleExplanation);

  return card;
}

function renderLearnedSqlBlocks() {
  if (!elements.learnedSqlList || !elements.learnedSqlProgress) {
    return;
  }

  const highestSolvedLevelId = getHighestSolvedLevelId();
  const unlockedStageCount = LEARNED_SQL_STAGES.filter(stage => isLearningStageUnlocked(stage, highestSolvedLevelId)).length;

  elements.learnedSqlProgress.textContent = `Stufe ${unlockedStageCount} von ${LEARNED_SQL_STAGES.length}`;
  elements.learnedSqlList.innerHTML = '';

  LEARNED_SQL_STAGES.forEach(stage => {
    const isUnlocked = isLearningStageUnlocked(stage, highestSolvedLevelId);
    const stageDetails = document.createElement('details');
    stageDetails.className = `learned-sql-stage${isUnlocked ? '' : ' locked'}`;

    const summary = document.createElement('summary');
    summary.className = 'learned-sql-stage-summary';

    const title = document.createElement('span');
    title.className = 'learned-sql-stage-title';
    title.textContent = stage.title;

    const status = document.createElement('span');
    status.className = `learned-sql-stage-status${isUnlocked ? ' unlocked' : ''}`;
    status.textContent = isUnlocked ? 'Freigeschaltet' : 'Gesperrt';

    summary.append(title, status);
    stageDetails.append(summary);

    if (isUnlocked) {
      const itemGrid = document.createElement('div');
      itemGrid.className = 'learned-sql-stage-grid';
      stage.items.forEach(item => itemGrid.append(createLearnedSqlCard(item)));
      stageDetails.append(itemGrid);
    } else {
      const lockedMessage = document.createElement('p');
      lockedMessage.className = 'muted small';
      lockedMessage.textContent = stage.lockedPreview;
      stageDetails.append(lockedMessage);
    }

    elements.learnedSqlList.append(stageDetails);
  });
}


function renderLearnedOverview() {
  if (!elements.learnedOverviewList || !elements.learnedOverviewSummary) {
    return;
  }

  const highestSolvedLevelId = getHighestSolvedLevelId();
  const unlockedStageCount = SQL_LEARNING_STAGES.filter(stage => isLearningStageUnlocked(stage, highestSolvedLevelId)).length;
  const beginnerCompleted = highestSolvedLevelId >= 30;
  elements.learnedOverviewSummary.textContent = beginnerCompleted
    ? `Anfängerbereich abgeschlossen · ${unlockedStageCount} von ${SQL_LEARNING_STAGES.length} Stufen aktiv`
    : `${unlockedStageCount} von ${SQL_LEARNING_STAGES.length} Stufen aktiv`;
  elements.learnedOverviewList.innerHTML = '';

  SQL_LEARNING_STAGES.forEach(stage => {
    elements.learnedOverviewList.append(createLearningOverviewStageCard(stage, highestSolvedLevelId));
  });
}

function createLearningOverviewStageCard(stage, highestSolvedLevelId) {
  const levelsInStage = getLevelsForStage(stage);
  const solvedInStage = levelsInStage.filter(level => progress.solvedLevelIds.includes(level.id)).length;
  const isAccessible = isLearningOverviewStageAccessible(stage, highestSolvedLevelId);
  const status = getLearningOverviewStatus(solvedInStage, levelsInStage.length, isAccessible);
  const article = document.createElement('details');
  article.className = `learning-overview-card ${status.className}`;
  article.setAttribute('aria-label', `${stage.title}: ${status.label}, ${solvedInStage} von ${levelsInStage.length} Leveln gelöst`);

  const header = document.createElement('summary');
  header.className = 'learning-overview-card-header';
  const title = document.createElement('h4');
  title.textContent = stage.title;
  const badge = document.createElement('span');
  badge.className = `status-badge ${status.className}`;
  badge.textContent = status.label;
  header.append(title, badge);

  const content = document.createElement('div');
  content.className = 'learning-overview-card-content';

  const range = document.createElement('p');
  range.className = 'learning-overview-range';
  range.textContent = stage.levelRange;

  const terms = document.createElement('p');
  terms.className = 'learning-overview-terms';
  terms.innerHTML = `<strong>SQL-Begriffe:</strong> ${stage.termKeys.map(termKey => SQL_LEARNING_TERMS[termKey].term).join(', ')}`;

  const summary = document.createElement('p');
  summary.className = 'muted';
  summary.textContent = isAccessible ? stage.summary : stage.lockedPreview;

  const progressText = document.createElement('p');
  progressText.className = 'learning-overview-progress';
  progressText.textContent = `${solvedInStage} von ${levelsInStage.length} Leveln gelöst`;

  content.append(range, terms, summary, createMiniProgressBar(solvedInStage, levelsInStage.length, `${stage.title}: Fortschritt innerhalb des Abschnitts`), progressText);
  article.append(header, content);
  return article;
}

function getLearningOverviewStatus(solvedCount, totalCount, isAccessible) {
  if (!isAccessible) {
    return { label: 'noch gesperrt', className: 'locked' };
  }
  if (totalCount > 0 && solvedCount === totalCount) {
    return { label: 'abgeschlossen', className: 'completed' };
  }
  if (solvedCount > 0 && solvedCount < totalCount) {
    return { label: 'in Bearbeitung', className: 'in-progress' };
  }
  return { label: 'freigeschaltet', className: 'unlocked' };
}

function isLearningOverviewStageAccessible(stage, highestSolvedLevelId) {
  return stage.levelStart === 1 || highestSolvedLevelId >= stage.levelStart - 1;
}

function getLevelsForStage(stage) {
  return LEVELS.filter(level => level.id >= stage.levelStart && level.id <= stage.levelEnd);
}

function createMiniProgressBar(value, max, label) {
  const track = document.createElement('div');
  track.className = 'mini-progress-track';
  track.setAttribute('role', 'progressbar');
  track.setAttribute('aria-label', label);
  track.setAttribute('aria-valuemin', '0');
  track.setAttribute('aria-valuemax', String(max));
  track.setAttribute('aria-valuenow', String(value));
  const fill = document.createElement('div');
  fill.className = 'mini-progress-fill';
  fill.style.width = max === 0 ? '0%' : `${Math.round((value / max) * 100)}%`;
  track.append(fill);
  return track;
}

function renderSqlBasicsChapters() {
  if (!elements.sqlBasicsList || !elements.sqlBasicsProgress) {
    return;
  }

  elements.sqlBasicsList.innerHTML = '';
  const highestSolvedLevelId = getHighestSolvedLevelId();
  const unlockedChapterCount = SQL_BASICS_CHAPTERS.filter(chapter => isSqlBasicsChapterUnlocked(chapter, highestSolvedLevelId)).length;
  elements.sqlBasicsProgress.textContent = `Kapitel ${unlockedChapterCount} von ${SQL_BASICS_CHAPTERS.length} freigeschaltet`;

  SQL_BASICS_CHAPTERS.forEach((chapter, index) => {
    const isUnlocked = isSqlBasicsChapterUnlocked(chapter, highestSolvedLevelId);
    const chapterDetails = document.createElement('details');
    chapterDetails.className = 'sql-basics-chapter';
    chapterDetails.classList.toggle('locked', !isUnlocked);

    const summary = document.createElement('summary');
    summary.className = 'sql-basics-chapter-summary';

    const titleGroup = document.createElement('span');
    titleGroup.className = 'sql-basics-chapter-title-group';

    const chapterLabel = document.createElement('span');
    chapterLabel.className = 'sql-basics-chapter-label';
    chapterLabel.textContent = `Kapitel ${index + 1}`;

    const title = document.createElement('span');
    title.className = 'sql-basics-chapter-title';
    title.textContent = chapter.title;

    titleGroup.append(chapterLabel, title);

    const status = document.createElement('span');
    status.className = `sql-basics-chapter-status${isUnlocked ? ' unlocked' : ''}`;
    status.textContent = isUnlocked ? 'Freigeschaltet' : 'Gesperrt';

    summary.append(titleGroup, status);
    chapterDetails.append(summary);

    const content = document.createElement('div');
    content.className = 'sql-basics-chapter-content';

    if (isUnlocked) {
      const terms = document.createElement('p');
      terms.innerHTML = `<strong>Begriffe:</strong> ${chapter.terms.map(term => term.term).join(', ')}`;
      content.append(terms);

      const descriptions = document.createElement('ul');
      descriptions.className = 'sql-basics-term-list';
      chapter.terms.forEach(term => {
        const item = document.createElement('li');
        item.innerHTML = `<strong>${term.term}:</strong> ${term.description}`;
        descriptions.append(item);
      });
      content.append(descriptions);

      const firstExample = chapter.terms.find(term => term.example)?.example;
      if (firstExample) {
        const example = document.createElement('pre');
        example.className = 'sql-example';
        const code = document.createElement('code');
        code.textContent = firstExample;
        example.append(code);
        content.append(example);
      }
    } else {
      const lockedMessage = document.createElement('p');
      lockedMessage.className = 'muted';
      lockedMessage.textContent = chapter.lockedPreview;
      content.append(lockedMessage);
    }

    chapterDetails.append(content);
    elements.sqlBasicsList.append(chapterDetails);
  });
}

function isSqlBasicsChapterUnlocked(chapter, highestSolvedLevelId = getHighestSolvedLevelId()) {
  return highestSolvedLevelId >= chapter.unlockLevelId;
}

function getLevelButtonLabel(level, index, unlocked, stars) {
  const status = unlocked ? 'freigeschaltet' : 'gesperrt';
  const starText = unlocked
    ? `${stars} von ${MAX_STARS} Sternen`
    : getLockedLevelText(level);
  return `Level ${level.id}: ${level.title}, ${status}, ${starText}`;
}

function getLockedLevelText(level) {
  if (level.id === 31) {
    return 'Freischaltung benötigt den Abschluss von Level 30';
  }
  if (level.id === 41) {
    return 'Freischaltung benötigt den Abschluss von Level 40';
  }
  if (level.id === 51) {
    return 'Freischaltung benötigt den Abschluss von Level 50';
  }
  if (level.id === 61) {
    return 'Freischaltung benötigt den Abschluss von Level 60';
  }
  return 'Freischaltung benötigt mindestens 2 Sterne im vorherigen Level';
}

function renderStars(stars) {
  return `${'★'.repeat(stars)}${'☆'.repeat(MAX_STARS - stars)}`;
}

function getLevelStars(levelId) {
  return Math.max(0, Math.min(MAX_STARS, Number(progress.levelStars[levelId]) || 0));
}

function isLevelUnlocked(levelIndex) {
  const level = LEVELS[levelIndex];
  if (!level) {
    return false;
  }
  if (isEveryLevelUnlockedForTesting()) {
    return true;
  }
  if (levelIndex === 0) {
    return true;
  }
  if (level.id === 31) {
    return isAdvancedPathUnlocked();
  }
  if (level.id === 41) {
    return progress.solvedLevelIds.includes(40);
  }
  if (level.id === 51) {
    return progress.solvedLevelIds.includes(50);
  }
  if (level.id === 61) {
    return progress.solvedLevelIds.includes(60);
  }
  const previousLevel = LEVELS[levelIndex - 1];
  return getLevelStars(previousLevel.id) >= MIN_STARS_TO_UNLOCK_NEXT_LEVEL;
}

function isAdvancedPathUnlocked() {
  return isEveryLevelUnlockedForTesting() || progress.solvedLevelIds.includes(30);
}

function isEveryLevelUnlockedForTesting() {
  return IS_TEST_MODE && areAllLevelsUnlockedForTesting;
}

function updateProgressBar() {
  const beginnerLevels = LEVELS.filter(level => level.difficulty === 'Anfänger');
  const advancedLevels = LEVELS.filter(level => level.difficulty === 'Fortgeschritten');
  const masterLevels = LEVELS.filter(level => level.difficulty === 'Meister');
  const solvedBeginnerLevelCount = beginnerLevels.filter(level => progress.solvedLevelIds.includes(level.id)).length;
  const solvedAdvancedLevelCount = advancedLevels.filter(level => progress.solvedLevelIds.includes(level.id)).length;
  const solvedMasterLevelCount = masterLevels.filter(level => progress.solvedLevelIds.includes(level.id)).length;
  const beginnerCompleted = solvedBeginnerLevelCount >= beginnerLevels.length;
  const unlockedAdvancedLevelCount = advancedLevels.filter(level => isLevelUnlocked(LEVELS.indexOf(level))).length;
  const unlockedMasterLevelCount = masterLevels.filter(level => isLevelUnlocked(LEVELS.indexOf(level))).length;
  const consideredBeginnerLevelCount = Math.max(beginnerLevels.filter(level => isLevelUnlocked(LEVELS.indexOf(level))).length, solvedBeginnerLevelCount);
  const totalLevelCount = LEVELS.length;
  const consideredTotalLevelCount = consideredBeginnerLevelCount + Math.max(unlockedAdvancedLevelCount, solvedAdvancedLevelCount) + Math.max(unlockedMasterLevelCount, solvedMasterLevelCount);
  const progressPercent = totalLevelCount === 0 ? 0 : Math.round((consideredTotalLevelCount / totalLevelCount) * 100);
  const collectedStars = LEVELS.reduce((sum, level) => sum + getLevelStars(level.id), 0);
  const maxStars = LEVELS.length * MAX_STARS;

  elements.progressText.textContent = `Anfänger: ${solvedBeginnerLevelCount}/${beginnerLevels.length}${beginnerCompleted ? ' abgeschlossen' : ''} · Fortgeschritten: ${solvedAdvancedLevelCount}/${advancedLevels.length} · Meister: ${solvedMasterLevelCount}/${masterLevels.length}`;
  elements.progressPercent.textContent = `${progressPercent} % gesamt · ${collectedStars} von ${maxStars} Sternen gesammelt`;
  elements.progressFill.style.width = `${progressPercent}%`;
  elements.progressTrack.setAttribute('aria-valuemax', totalLevelCount);
  elements.progressTrack.setAttribute('aria-valuenow', consideredTotalLevelCount);
  elements.progressTrack.setAttribute('aria-label', 'Gesamtfortschritt über Anfänger, Fortgeschritten und Meister');
}

function loadLevel(index, options = {}) {
  hideSuccessModal();
  const isReplay = Boolean(options.replay);
  const isTimeChallenge = Boolean(options.timeChallenge);
  if (!isTimeChallenge) stopTimeChallenge('level-change');
  if (!isReplay && !isLevelUnlocked(index)) {
    setFeedback('Erreiche mindestens 2 Sterne im vorherigen Level, um dieses Level freizuschalten.', 'info');
    renderLevelList();
    return;
  }

  navigateToView('game', () => {
    hideLearningViews({ preserveTimeChallenge: isTimeChallenge });
    elements.gameLayout.hidden = false;
    currentLevelIndex = index;
    const level = LEVELS[currentLevelIndex];
    elements.difficulty.textContent = level.difficulty;
    elements.topic.textContent = level.topic;
    elements.levelTitle.textContent = `Level ${level.id}: ${level.title}`;
    elements.explanation.textContent = level.explanation;
    elements.task.textContent = level.task;
    elements.hintText.textContent = `💡 Tipp: ${level.hint}`;
    elements.hintText.hidden = true;
    elements.solutionBox.textContent = `Lösung: ${level.expectedSql}`;
    elements.solutionBox.hidden = true;
    progress.levelAttempts[level.id] = 0;
    currentLevelHelpUsage = {
      hintUsed: progress.hintUsedLevelIds.includes(level.id),
      solutionViewed: progress.solutionViewedLevelIds.includes(level.id)
    };
    elements.sqlInput.value = progress.savedQueries[level.id] || '';
    elements.sqlInput.placeholder = 'Schreibe hier deine SQL-Abfrage …';
    elements.resultTable.className = 'table-wrap empty-state';
    elements.resultTable.textContent = 'Noch keine Abfrage ausgeführt.';
    elements.rowCount.textContent = '';
    setFeedback(isTimeChallenge ? 'Zeit-Challenge gestartet: Löse das Level vor Ablauf des Countdowns.' : (isReplay ? 'Wiederholungsmodus: Löse das Level erneut. Deine bisherigen Sterne und Punkte bleiben geschützt.' : 'Führe deine Abfrage aus, um das Level zu lösen.'), 'info');
    if (isTimeChallenge) beginTimeChallenge(level);
    saveProgress();
    renderLevelList();
    renderLearnedSqlBlocks();
  });
}

function runPlayerQuery() {
  if (!db) {
    setFeedback('Bitte erstelle zuerst die Übungsdatenbank.', 'error');
    return;
  }

  const sql = elements.sqlInput.value.trim();
  if (!sql) {
    setFeedback('Bitte gib zuerst eine SQL-Abfrage ein.', 'error');
    return;
  }

  if (hasMultipleStatements(sql)) {
    setFeedback(`Mehrere SQL-Befehle wurden sicher blockiert. ${READ_ONLY_SQL_MESSAGE}`, 'error');
    return;
  }

  const blockedCommand = findBlockedCommand(sql);
  if (blockedCommand) {
    setFeedback(`Der Befehl ${blockedCommand} ist in SQL Quest nicht erlaubt. ${READ_ONLY_SQL_MESSAGE}`, 'error');
    return;
  }

  if (!isSelectStatement(sql)) {
    setFeedback(READ_ONLY_SQL_MESSAGE, 'error');
    return;
  }

  try {
    const playerResult = executeSelect(sql);
    const expectedResult = executeSelect(LEVELS[currentLevelIndex].expectedSql);
    renderResult(playerResult);

    if (resultsEqual(playerResult, expectedResult)) {
      markLevelSolved();
    } else {
      countFailedAttempt(LEVELS[currentLevelIndex].id);
      setFeedback('Die Abfrage wurde ausgeführt, liefert aber noch nicht das erwartete Ergebnis der Aufgabe. Prüfe bitte Spalten, Filter, Sortierung und Anzahl der Zeilen.', 'error');
    }
  } catch (error) {
    countFailedAttempt(LEVELS[currentLevelIndex].id);
    setFeedback(`Deine SQL-Abfrage ist syntaktisch nicht korrekt. Bitte prüfe die Schreibweise und die Reihenfolge der SQL-Bausteine. Technischer Hinweis: ${error.message}`, 'error');
  }
}

function findBlockedCommand(sql) {
  const searchableSql = maskSqlCommentsAndStrings(sql);
  const blockedCommandPattern = new RegExp(`\\b(${BLOCKED_COMMANDS.join('|')})\\b`, 'i');
  return searchableSql.match(blockedCommandPattern)?.[1].toUpperCase();
}

function isSelectStatement(sql) {
  return getReadOnlyMainCommand(sql) === 'SELECT';
}

function getReadOnlyMainCommand(sql) {
  const statement = removeSqlComments(sql);
  const firstKeyword = readSqlKeyword(statement, 0);
  if (firstKeyword?.keyword === 'SELECT') {
    return 'SELECT';
  }
  if (firstKeyword?.keyword !== 'WITH') {
    return firstKeyword?.keyword || null;
  }

  return getMainCommandAfterCtes(statement, firstKeyword.end);
}

function getMainCommandAfterCtes(sql, startIndex) {
  let index = skipSqlWhitespace(sql, startIndex);
  const recursiveKeyword = readSqlKeyword(sql, index);
  if (recursiveKeyword?.keyword === 'RECURSIVE') {
    index = skipSqlWhitespace(sql, recursiveKeyword.end);
  }

  while (index < sql.length) {
    const cteName = readCteName(sql, index);
    if (!cteName) {
      return null;
    }
    index = skipSqlWhitespace(sql, cteName.end);

    if (sql[index] === '(') {
      index = findMatchingSqlParenthesis(sql, index);
      if (index === -1) {
        return null;
      }
      index = skipSqlWhitespace(sql, index + 1);
    }

    const asKeyword = readSqlKeyword(sql, index);
    if (asKeyword?.keyword !== 'AS') {
      return null;
    }
    index = skipSqlWhitespace(sql, asKeyword.end);

    if (sql[index] !== '(') {
      return null;
    }
    index = findMatchingSqlParenthesis(sql, index);
    if (index === -1) {
      return null;
    }
    index = skipSqlWhitespace(sql, index + 1);

    if (sql[index] === ',') {
      index = skipSqlWhitespace(sql, index + 1);
      continue;
    }

    return readSqlKeyword(sql, index)?.keyword || null;
  }

  return null;
}

function readCteName(sql, startIndex) {
  const index = skipSqlWhitespace(sql, startIndex);
  if (sql[index] === '"' || sql[index] === '`' || sql[index] === '[') {
    return readQuotedSqlIdentifier(sql, index);
  }
  return readSqlIdentifier(sql, index);
}

function readSqlKeyword(sql, startIndex) {
  const identifier = readSqlIdentifier(sql, startIndex);
  return identifier ? { keyword: identifier.value.toUpperCase(), end: identifier.end } : null;
}

function readSqlIdentifier(sql, startIndex) {
  const index = skipSqlWhitespace(sql, startIndex);
  const match = sql.slice(index).match(/^([A-Z_][A-Z0-9_$]*)/i);
  return match ? { value: match[1], end: index + match[1].length } : null;
}

function readQuotedSqlIdentifier(sql, startIndex) {
  const openingQuote = sql[startIndex];
  const closingQuote = openingQuote === '[' ? ']' : openingQuote;
  for (let index = startIndex + 1; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];
    if (char === closingQuote && next === closingQuote) {
      index += 1;
      continue;
    }
    if (char === closingQuote) {
      return { value: sql.slice(startIndex + 1, index), end: index + 1 };
    }
  }
  return null;
}

function skipSqlWhitespace(sql, startIndex) {
  let index = startIndex;
  while (index < sql.length && /\s/.test(sql[index])) {
    index += 1;
  }
  return index;
}

function findMatchingSqlParenthesis(sql, startIndex) {
  let depth = 0;
  let quote = null;

  for (let index = startIndex; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];

    if (quote) {
      if (char === quote && next === quote) {
        index += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '\'' || char === '"') {
      quote = char;
    } else if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function maskSqlCommentsAndStrings(sql) {
  let masked = '';
  let quote = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
        masked += char;
      } else {
        masked += ' ';
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        masked += '  ';
        inBlockComment = false;
        index += 1;
      } else {
        masked += ' ';
      }
      continue;
    }

    if (quote) {
      if (char === quote && next === quote) {
        masked += '  ';
        index += 1;
      } else if (char === quote) {
        masked += ' ';
        quote = null;
      } else {
        masked += ' ';
      }
      continue;
    }

    if (char === '-' && next === '-') {
      masked += '  ';
      inLineComment = true;
      index += 1;
      continue;
    }

    if (char === '/' && next === '*') {
      masked += '  ';
      inBlockComment = true;
      index += 1;
      continue;
    }

    if (char === '\'' || char === '"') {
      masked += ' ';
      quote = char;
      continue;
    }

    masked += char;
  }

  return masked;
}

function hasMultipleStatements(sql) {
  return splitSqlStatements(sql).filter(statement => statement.trim()).length > 1;
}

function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let quote = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
        current += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (!quote && char === '-' && next === '-') {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (!quote && char === '/' && next === '*') {
      inBlockComment = true;
      index += 1;
      continue;
    }

    current += char;

    if (quote) {
      if (char === quote && next === quote) {
        current += next;
        index += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '\'' || char === '"') {
      quote = char;
    } else if (char === ';') {
      statements.push(current.slice(0, -1));
      current = '';
    }
  }

  statements.push(current);
  return statements;
}

function removeSqlComments(sql) {
  return splitSqlStatements(sql).join(' ');
}

function executeSelect(sql) {
  const result = db.exec(sql);
  if (result.length === 0) {
    return { columns: [], values: [] };
  }
  return { columns: result[0].columns, values: result[0].values };
}

function resultsEqual(left, right) {
  return JSON.stringify(left.columns) === JSON.stringify(right.columns)
    && JSON.stringify(left.values) === JSON.stringify(right.values);
}

function renderResult(result) {
  elements.resultTable.className = 'table-wrap';
  elements.resultTable.innerHTML = '';
  elements.rowCount.textContent = `${result.values.length} Zeile(n)`;

  if (result.columns.length === 0) {
    elements.resultTable.classList.add('empty-state');
    elements.resultTable.textContent = 'Die Abfrage hat keine Tabelle zurückgegeben.';
    return;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const headerRow = document.createElement('tr');

  result.columns.forEach(column => {
    const th = document.createElement('th');
    th.textContent = column;
    headerRow.append(th);
  });

  result.values.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;
      tr.append(td);
    });
    tbody.append(tr);
  });

  thead.append(headerRow);
  table.append(thead, tbody);
  elements.resultTable.append(table);
}

function calculateStarsForHelpUsage({ hintUsed = false, solutionViewed = false } = {}) {
  if (solutionViewed) {
    return 1;
  }
  if (hintUsed) {
    return 2;
  }
  return MAX_STARS;
}

function calculatePointsForStars(level, stars) {
  const cappedStars = Math.max(0, Math.min(MAX_STARS, Number(stars) || 0));
  return Math.round((Number(level.points) || 0) * (cappedStars / MAX_STARS));
}

function calculateScoreFromStars() {
  return LEVELS.reduce((score, level) => score + calculatePointsForStars(level, getLevelStars(level.id)), 0);
}

function getHelpUsageMessage(helpUsage) {
  if (helpUsage.solutionViewed) {
    return 'Lösung angesehen: maximal 1 Stern';
  }
  if (helpUsage.hintUsed) {
    return 'Hinweis verwendet: maximal 2 Sterne';
  }
  return 'Ohne Hilfe gelöst: 3 Sterne';
}

function countFailedAttempt(levelId) {
  progress.levelAttempts[levelId] = (Number(progress.levelAttempts[levelId]) || 0) + 1;
  saveProgress();
}

function calculateStars() {
  return calculateStarsForHelpUsage(currentLevelHelpUsage);
}

function markLevelSolved() {
  const level = LEVELS[currentLevelIndex];
  const sql = elements.sqlInput.value.trim();
  const earnedStars = calculateStars();
  const previousStars = getLevelStars(level.id);
  const bestStars = Math.max(previousStars, earnedStars);
  const isNewBest = bestStars > previousStars;

  progress.savedQueries[level.id] = sql;
  progress.levelStars[level.id] = bestStars;
  if (isNewBest && !currentLevelHelpUsage.hintUsed) {
    progress.hintUsedLevelIds = progress.hintUsedLevelIds.filter(levelId => levelId !== level.id);
  }
  if (isNewBest && !currentLevelHelpUsage.solutionViewed) {
    progress.solutionViewedLevelIds = progress.solutionViewedLevelIds.filter(levelId => levelId !== level.id);
  }
  if (!progress.solvedLevelIds.includes(level.id)) {
    progress.solvedLevelIds.push(level.id);
  }
  progress.score = calculateScoreFromStars();
  markDailyChallengeCompleted(level.id);
  const timeChallengeResult = completeActiveTimeChallenge(level.id);
  saveProgress();
  renderLevelList();
  renderLearnedSqlBlocks();
  renderCompletionCard();
  renderBadges();
  renderDailyChallenge();
  checkAndShowMilestones();

  const bestMessage = isNewBest ? ` Neue Bestleistung: ${bestStars} von ${MAX_STARS} Sternen!` : '';
  if (timeChallengeResult?.nextLevel) {
    setFeedback(`Richtig gelöst! ${timeChallengeResult.solvedCount} von ${timeChallengeResult.totalCount} Challenge-Leveln geschafft. Weiter geht es mit dem nächsten Level.`, 'success');
    loadLevel(LEVELS.indexOf(timeChallengeResult.nextLevel), { timeChallenge: true });
    return;
  }
  if (timeChallengeResult?.wasCompleted) {
    setFeedback(`Richtig gelöst! Zeit-Challenge geschafft! Verbleibende Zeit: ${formatTimeChallengeSeconds(timeChallengeResult.remainingSeconds)}.`, 'success');
    return;
  }
  setFeedback(`Richtig gelöst! ${getHelpUsageMessage(currentLevelHelpUsage)}. Du hast ${earnedStars} von ${MAX_STARS} Sternen erreicht.${bestMessage}`, 'success');
  showSuccessModal({ earnedStars, bestStars, isNewBest });
}

function showSuccessModal({ earnedStars, bestStars, isNewBest, timeChallengeRemaining = null }) {
  const level = LEVELS[currentLevelIndex];
  const isFinalLevel = currentLevelIndex === LEVELS.length - 1;
  const hasBestStarsForUnlock = bestStars >= MIN_STARS_TO_UNLOCK_NEXT_LEVEL;
  const canOfferNextLevel = hasBestStarsForUnlock && !isFinalLevel;
  const nextLevelIsUnlocked = canOfferNextLevel && isLevelUnlocked(currentLevelIndex + 1);

  elements.successModalStars.textContent = '★'.repeat(earnedStars) + '☆'.repeat(MAX_STARS - earnedStars);
  elements.successModalStarText.textContent = `${earnedStars} von ${MAX_STARS} Sternen`;
  elements.successModalBest.hidden = !isNewBest;
  const isDailyChallenge = progress.dailyChallenge?.date === getLocalDateKey() && Number(progress.dailyChallenge?.levelId) === Number(level.id);
  elements.successModalMessage.textContent = `${isDailyChallenge ? 'Tages-Challenge geschafft! ' : ''}${getHelpUsageMessage(currentLevelHelpUsage)}. ${getSuccessMessage(earnedStars)}`;
  elements.successModalCompletion.hidden = !(isFinalLevel && hasBestStarsForUnlock);
  elements.successModalActions.innerHTML = '';

  if (hasBestStarsForUnlock) {
    if (isFinalLevel) {
      addSuccessModalButton('Abschluss anzeigen', 'primary-button', showLevelOverview);
      addSuccessModalButton(`Level ${level.id} wiederholen`, 'secondary-button', () => loadLevel(currentLevelIndex));
    } else {
      addSuccessModalButton('Nächstes Level', 'primary-button', () => {
        if (nextLevelIsUnlocked) {
          loadLevel(currentLevelIndex + 1);
        } else {
          showLevelOverview();
          setOverviewFeedback('Das nächste Level ist noch nicht freigeschaltet. Erreiche mindestens 2 Sterne im vorherigen Level.', 'info');
        }
      });
      addSuccessModalButton('Zur Levelübersicht', 'secondary-button', showLevelOverview);
    }
  } else {
    addSuccessModalButton('Level wiederholen', 'primary-button', () => loadLevel(currentLevelIndex));
    addSuccessModalButton('Zur Levelübersicht', 'secondary-button', showLevelOverview);
  }

  elements.successModalOverlay.hidden = false;
  document.body.classList.add('modal-open');
  const firstActionButton = elements.successModalActions.querySelector('button');
  (firstActionButton || elements.successModalCloseButton).focus();
}

function getSuccessMessage(earnedStars) {
  if (earnedStars === MAX_STARS) {
    return 'Perfekt gelöst – ohne Fehlversuch.';
  }
  if (earnedStars === MIN_STARS_TO_UNLOCK_NEXT_LEVEL) {
    return 'Gut geschafft! Das nächste Level ist freigeschaltet.';
  }
  return 'Du hast das Level bestanden. Wiederhole es später, um mehr Sterne zu erreichen.';
}

function addSuccessModalButton(label, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', onClick);
  elements.successModalActions.append(button);
}

function closeSuccessModalToOverview() {
  showLevelOverview();
}

function hideSuccessModal() {
  if (elements.successModalOverlay.hidden) {
    return;
  }
  elements.successModalOverlay.hidden = true;
  document.body.classList.remove('modal-open');
}

function handleSuccessModalKeydown(event) {
  if (event.key !== 'Tab') {
    return;
  }

  const focusableElements = Array.from(elements.successModal.querySelectorAll('button:not([disabled])'));
  if (focusableElements.length === 0) {
    event.preventDefault();
    return;
  }

  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstFocusableElement) {
    event.preventDefault();
    lastFocusableElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
    event.preventDefault();
    firstFocusableElement.focus();
  }
}

function showHint() {
  const level = LEVELS[currentLevelIndex];
  elements.hintText.hidden = false;
  currentLevelHelpUsage.hintUsed = true;
  if (!progress.hintUsedLevelIds.includes(level.id)) {
    progress.hintUsedLevelIds.push(level.id);
    saveProgress();
  }
  setFeedback('Der Hinweis ist jetzt sichtbar. Hinweis verwendet: maximal 2 Sterne.', 'info');
}

function showSolution() {
  const level = LEVELS[currentLevelIndex];
  elements.solutionBox.hidden = false;
  currentLevelHelpUsage.solutionViewed = true;
  if (!progress.solutionViewedLevelIds.includes(level.id)) {
    progress.solutionViewedLevelIds.push(level.id);
    saveProgress();
  }
  setFeedback('Die Musterlösung ist jetzt sichtbar. Lösung angesehen: maximal 1 Stern. Führe sie aus, wenn du das Level lösen möchtest.', 'info');
}

function isQuestCompleted() {
  return progress.solvedLevelIds.includes(80);
}

function getCollectedStars() {
  return LEVELS.reduce((sum, level) => sum + getLevelStars(level.id), 0);
}

function renderCompletionCard() {
  if (!elements.completionCard) {
    return;
  }
  const completed = isQuestCompleted();
  elements.completionCard.hidden = !completed;
  if (!completed) {
    return;
  }
  const solvedLevelCount = LEVELS.filter(level => progress.solvedLevelIds.includes(level.id)).length;
  elements.completionSolvedLevels.textContent = String(solvedLevelCount);
  elements.completionScore.textContent = String(progress.score);
  elements.completionStars.textContent = `${getCollectedStars()} / ${LEVELS.length * MAX_STARS}`;
  elements.completionTotalLevels.textContent = String(LEVELS.length);
}

function resetProgress() {
  stopTimeChallenge('reset');
  progress = createEmptyProgress();
  currentLevelIndex = 0;
  saveProgress({ refreshDailyChallenge: false });
  activeLevelSection = 'beginner';
  elements.score.textContent = progress.score;
  renderCompletionCard();
  renderBadges();
  renderDailyChallenge();
  hideMilestoneBanner();
  showLevelOverview();
}

function renderTestModePanel() {
  elements.testModePanel.hidden = !IS_TEST_MODE;
}

function unlockAllLevelsForTesting() {
  areAllLevelsUnlockedForTesting = true;
  refreshTestModeProgressDisplay();
  setOverviewFeedback(`Testmodus: Level 1–${LEVELS.length} sind jetzt direkt auswählbar.`, 'success');
}

function markAllLevelsSolvedForTesting() {
  areAllLevelsUnlockedForTesting = true;
  progress.solvedLevelIds = LEVELS.map(level => level.id);
  progress.levelStars = LEVELS.reduce((levelStars, level) => {
    levelStars[level.id] = MAX_STARS;
    return levelStars;
  }, {});
  progress.levelAttempts = progress.levelAttempts && typeof progress.levelAttempts === 'object' ? progress.levelAttempts : {};
  progress.savedQueries = progress.savedQueries && typeof progress.savedQueries === 'object' ? progress.savedQueries : {};
  progress.hintUsedLevelIds = [];
  progress.solutionViewedLevelIds = [];
  progress.score = LEVELS.reduce((score, level) => score + (Number(level.points) || 0), 0);
  currentLevelIndex = Math.min(currentLevelIndex, LEVELS.length - 1);
  saveProgress();
  refreshTestModeProgressDisplay();
  renderCompletionCard();
  renderLearnedOverview();
  renderReplayOverview();
  renderDailyChallenge();
  renderBadges();
  checkAndShowMilestones();
  setOverviewFeedback('Testmodus: Alle Level wurden mit 3 Sternen als gelöst gespeichert.', 'success');
}

function resetProgressForTesting() {
  stopTimeChallenge('reset');
  progress = createEmptyProgress();
  areAllLevelsUnlockedForTesting = false;
  currentLevelIndex = 0;
  saveProgress({ refreshDailyChallenge: false });
  activeLevelSection = 'beginner';
  refreshTestModeProgressDisplay();
  renderCompletionCard();
  renderLearnedOverview();
  renderReplayOverview();
  renderDailyChallenge();
  renderBadges();
  hideMilestoneBanner();
  showOverviewTab('levels');
  setOverviewFeedback('Testmodus: Der Fortschritt wurde vollständig zurückgesetzt.', 'success');
}

function refreshTestModeProgressDisplay() {
  elements.score.textContent = progress.score;
  renderLevelList();
  updateProgressBar();
}

function jumpToLevelSectionForTesting(sectionId) {
  areAllLevelsUnlockedForTesting = true;
  activeLevelSection = sectionId;
  showLevelOverview();
  setOverviewFeedback(`Testmodus: Bereich ${getLevelSectionTitle(sectionId)} geöffnet.`, 'success');
}

function getLevelSectionTitle(sectionId) {
  const section = LEVEL_SECTIONS.find(levelSection => levelSection.id === sectionId);
  return section ? section.title : 'Levelübersicht';
}

function setFeedback(message, type) {
  elements.feedback.textContent = message;
  elements.feedback.className = `feedback ${type}`;
}

function setOverviewFeedback(message, type) {
  elements.overviewFeedback.textContent = message;
  elements.overviewFeedback.className = `feedback ${type}`;
}

function setIntroFeedback(message, type) {
  elements.introFeedback.textContent = message;
  elements.introFeedback.className = `feedback ${type}`;
}
