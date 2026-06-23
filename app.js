const STORAGE_KEY = 'sqlQuestProgress';
const STAR_SYSTEM_VERSION = 3;
const MAX_STARS = 3;
const MIN_STARS_TO_UNLOCK_NEXT_LEVEL = 2;
const BLOCKED_COMMANDS = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'REPLACE', 'TRUNCATE', 'PRAGMA', 'ATTACH', 'DETACH'];
const READ_ONLY_SQL_MESSAGE = 'SQL Quest erlaubt nur lesende Abfragen. Die Übungsdatenbank wurde nicht verändert. Verwende für diese Aufgabe bitte eine SELECT-Abfrage.';


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
  { unlockLevelId: 60, title: 'Meister – komplexe Auswertungen', levelRange: 'Level 61–70', levelStart: 61, levelEnd: 70, summary: 'Du erstellst Meister-Abfragen mit CASE WHEN, CTEs mit WITH, mehrstufigen Unterabfragen, komplexen Aggregationen und vollständigen Shop-Auswertungen.', lockedPreview: 'Meister-Themen werden nach Abschluss von Level 60 freigeschaltet.', termKeys: ['caseWhen', 'cteWith', 'nestedSubquery', 'complexAggregation', 'revenueCategory', 'masterAnalysis'] }
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
  sqlBasicsList: document.querySelector('#sqlBasicsList'),
  sqlBasicsProgress: document.querySelector('#sqlBasicsProgress'),
  learnedSqlList: document.querySelector('#learnedSqlList'),
  learnedSqlProgress: document.querySelector('#learnedSqlProgress'),
  levelsTabButton: document.querySelector('#levelsTabButton'),
  learnedOverviewTabButton: document.querySelector('#learnedOverviewTabButton'),
  levelsOverviewPanel: document.querySelector('#levelsOverviewPanel'),
  learnedOverviewPanel: document.querySelector('#learnedOverviewPanel'),
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
  globalBackButton: document.querySelector('#globalBackButton')
};

let SQL;
let db;
let isDatabaseReady = false;
let hasLevelSessionStarted = false;
let selectedPath = null;
let hasBeginnerIntroCompleted = false;
let currentLevelIndex = 0;
let activeLevelSection = 'beginner';
let progress = loadProgress();
let currentView = null;
let viewHistory = [];
let isNavigatingBack = false;

window.addEventListener('DOMContentLoaded', init);
elements.runButton.addEventListener('click', runPlayerQuery);
elements.hintButton.addEventListener('click', showHint);
elements.solutionButton.addEventListener('click', showSolution);
elements.overviewButton.addEventListener('click', showLevelOverview);
elements.backToOverviewButton.addEventListener('click', showLevelOverview);
elements.resetProgressButton.addEventListener('click', resetProgress);
elements.levelsTabButton.addEventListener('click', () => showOverviewTab('levels'));
elements.learnedOverviewTabButton.addEventListener('click', () => showOverviewTab('learned'));
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
window.addEventListener('scroll', updateScrollTopButton);

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

function hideLearningViews() {
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
    renderLevelList();
    renderSqlBasicsChapters();
    renderLearnedOverview();
    showOverviewTab('levels');
    updateProgressBar();
  });
}


function showOverviewTab(tabName) {
  const showLearned = tabName === 'learned';
  elements.levelsOverviewPanel.hidden = showLearned;
  elements.learnedOverviewPanel.hidden = !showLearned;
  elements.levelsTabButton.classList.toggle('active', !showLearned);
  elements.learnedOverviewTabButton.classList.toggle('active', showLearned);
  elements.levelsTabButton.setAttribute('aria-selected', String(!showLearned));
  elements.learnedOverviewTabButton.setAttribute('aria-selected', String(showLearned));
  if (showLearned) {
    renderLearnedOverview();
  }
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
    solutionViewedLevelIds: [],
    starSystemVersion: STAR_SYSTEM_VERSION
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
      solutionViewedLevelIds: Array.isArray(migratedProgress.solutionViewedLevelIds) ? migratedProgress.solutionViewedLevelIds : [],
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
    starSystemVersion: STAR_SYSTEM_VERSION
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

function saveProgress() {
  progress.currentLevelIndex = currentLevelIndex;
  progress.starSystemVersion = STAR_SYSTEM_VERSION;
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
    levelEnd: 70,
    unlockLevelId: 60,
    lockedHint: 'Wird nach dem Lösen von Level 60 freigeschaltet.'
  }
];

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
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(isSelected));
    tab.setAttribute('aria-controls', getLevelSectionPanelId(section.id));
    tab.disabled = !isAccessible;
    tab.innerHTML = `${!isAccessible ? '<span aria-hidden="true">🔒</span> ' : ''}${section.title}`;
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
  panel.className = `level-section ${solved === levels.length ? 'completed' : ''}`;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', getLevelSectionTabId(section.id));
  panel.innerHTML = `<div class="level-section-heading"><h3>${section.title}</h3><span>${solved} von ${levels.length} gelöst</span></div>`;

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
  return Boolean(section && (!section.unlockLevelId || progress.solvedLevelIds.includes(section.unlockLevelId)));
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
      <span data-level-number="${level.id}">Level ${level.id}</span>
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
  const article = document.createElement('article');
  article.className = `learning-overview-card ${status.className}`;
  article.setAttribute('aria-label', `${stage.title}: ${status.label}, ${solvedInStage} von ${levelsInStage.length} Leveln gelöst`);

  const header = document.createElement('div');
  header.className = 'learning-overview-card-header';
  const title = document.createElement('h4');
  title.textContent = stage.title;
  const badge = document.createElement('span');
  badge.className = `status-badge ${status.className}`;
  badge.textContent = status.label;
  header.append(title, badge);

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

  article.append(header, range, terms, summary, createMiniProgressBar(solvedInStage, levelsInStage.length, `${stage.title}: Fortschritt innerhalb des Abschnitts`), progressText);
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
    const article = document.createElement('article');
    article.className = 'sql-basics-chapter';
    article.classList.toggle('locked', !isUnlocked);

    const topline = document.createElement('div');
    topline.className = 'level-button-topline';
    topline.innerHTML = `<span>Kapitel ${index + 1}</span><span aria-hidden="true">${isUnlocked ? '📖' : '🔒'}</span>`;

    const title = document.createElement('h3');
    title.textContent = chapter.title;
    article.append(topline, title);

    if (isUnlocked) {
      const terms = document.createElement('p');
      terms.innerHTML = `<strong>Begriffe:</strong> ${chapter.terms.map(term => term.term).join(', ')}`;
      article.append(terms);

      const descriptions = document.createElement('ul');
      descriptions.className = 'sql-basics-term-list';
      chapter.terms.forEach(term => {
        const item = document.createElement('li');
        item.innerHTML = `<strong>${term.term}:</strong> ${term.description}`;
        descriptions.append(item);
      });
      article.append(descriptions);

      const firstExample = chapter.terms.find(term => term.example)?.example;
      if (firstExample) {
        const example = document.createElement('pre');
        example.className = 'sql-example';
        const code = document.createElement('code');
        code.textContent = firstExample;
        example.append(code);
        article.append(example);
      }
    } else {
      const lockedMessage = document.createElement('p');
      lockedMessage.className = 'muted';
      lockedMessage.textContent = chapter.lockedPreview;
      article.append(lockedMessage);
    }

    elements.sqlBasicsList.append(article);
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
  return progress.solvedLevelIds.includes(30);
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

function loadLevel(index) {
  hideSuccessModal();
  if (!isLevelUnlocked(index)) {
    setFeedback('Erreiche mindestens 2 Sterne im vorherigen Level, um dieses Level freizuschalten.', 'info');
    renderLevelList();
    return;
  }

  navigateToView('game', () => {
    hideLearningViews();
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
    elements.sqlInput.value = progress.savedQueries[level.id] || '';
    elements.sqlInput.placeholder = 'Schreibe hier deine SQL-Abfrage …';
    elements.resultTable.className = 'table-wrap empty-state';
    elements.resultTable.textContent = 'Noch keine Abfrage ausgeführt.';
    elements.rowCount.textContent = '';
    setFeedback('Führe deine Abfrage aus, um das Level zu lösen.', 'info');
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

function countFailedAttempt(levelId) {
  progress.levelAttempts[levelId] = (Number(progress.levelAttempts[levelId]) || 0) + 1;
  saveProgress();
}

function calculateStars(levelId) {
  const failedAttempts = Number(progress.levelAttempts[levelId]) || 0;
  const solutionViewed = progress.solutionViewedLevelIds.includes(levelId);

  if (solutionViewed || failedAttempts >= 3) {
    return 1;
  }
  if (failedAttempts >= 1) {
    return 2;
  }
  return 3;
}

function markLevelSolved() {
  const level = LEVELS[currentLevelIndex];
  const sql = elements.sqlInput.value.trim();
  const earnedStars = calculateStars(level.id);
  const previousStars = getLevelStars(level.id);
  const bestStars = Math.max(previousStars, earnedStars);
  const isNewBest = bestStars > previousStars;

  progress.savedQueries[level.id] = sql;
  progress.levelStars[level.id] = bestStars;
  progress.solutionViewedLevelIds = progress.solutionViewedLevelIds.filter(levelId => levelId !== level.id);
  if (!progress.solvedLevelIds.includes(level.id)) {
    progress.solvedLevelIds.push(level.id);
    progress.score += level.points;
  }
  saveProgress();
  renderLevelList();
  renderLearnedSqlBlocks();

  const bestMessage = isNewBest ? ` Neue Bestleistung: ${bestStars} von ${MAX_STARS} Sternen!` : '';
  setFeedback(`Richtig gelöst! Du hast ${earnedStars} von ${MAX_STARS} Sternen erreicht.${bestMessage}`, 'success');
  showSuccessModal({ earnedStars, bestStars, isNewBest });
}

function showSuccessModal({ earnedStars, bestStars, isNewBest }) {
  const level = LEVELS[currentLevelIndex];
  const isFinalLevel = currentLevelIndex === LEVELS.length - 1;
  const hasBestStarsForUnlock = bestStars >= MIN_STARS_TO_UNLOCK_NEXT_LEVEL;
  const canOfferNextLevel = hasBestStarsForUnlock && !isFinalLevel;
  const nextLevelIsUnlocked = canOfferNextLevel && isLevelUnlocked(currentLevelIndex + 1);

  elements.successModalStars.textContent = '★'.repeat(earnedStars) + '☆'.repeat(MAX_STARS - earnedStars);
  elements.successModalStarText.textContent = `${earnedStars} von ${MAX_STARS} Sternen`;
  elements.successModalBest.hidden = !isNewBest;
  elements.successModalMessage.textContent = getSuccessMessage(earnedStars);
  elements.successModalCompletion.hidden = !(isFinalLevel && hasBestStarsForUnlock);
  elements.successModalActions.innerHTML = '';

  if (hasBestStarsForUnlock) {
    if (isFinalLevel) {
      addSuccessModalButton('Zur Levelübersicht', 'primary-button', showLevelOverview);
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
  elements.hintText.hidden = false;
  setFeedback('Der Hinweis ist jetzt sichtbar.', 'info');
}

function showSolution() {
  const level = LEVELS[currentLevelIndex];
  elements.solutionBox.hidden = false;
  if (!progress.solutionViewedLevelIds.includes(level.id)) {
    progress.solutionViewedLevelIds.push(level.id);
    saveProgress();
  }
  setFeedback('Die Musterlösung ist jetzt sichtbar. Führe sie aus, wenn du das Level lösen möchtest.', 'info');
}

function resetProgress() {
  progress = createEmptyProgress();
  saveProgress();
  currentLevelIndex = 0;
  elements.score.textContent = progress.score;
  showLevelOverview();
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
