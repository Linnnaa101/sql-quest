function seedDatabase(db) {
  db.run(`
    CREATE TABLE kunden (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      stadt TEXT NOT NULL,
      alter_jahre INTEGER NOT NULL,
      punkte INTEGER NOT NULL
    );

    CREATE TABLE produkte (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      kategorie TEXT NOT NULL,
      preis REAL NOT NULL,
      lagerbestand INTEGER NOT NULL
    );

    CREATE TABLE bestellungen (
      id INTEGER PRIMARY KEY,
      kunden_id INTEGER NOT NULL,
      bestelldatum TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (kunden_id) REFERENCES kunden(id)
    );

    CREATE TABLE bestellpositionen (
      id INTEGER PRIMARY KEY,
      bestellung_id INTEGER NOT NULL,
      produkt_id INTEGER NOT NULL,
      menge INTEGER NOT NULL,
      einzelpreis REAL NOT NULL,
      FOREIGN KEY (bestellung_id) REFERENCES bestellungen(id),
      FOREIGN KEY (produkt_id) REFERENCES produkte(id)
    );

    INSERT INTO kunden (id, name, stadt, alter_jahre, punkte) VALUES
    (1, 'Anna', 'Berlin', 24, 120),
    (2, 'Ben', 'Hamburg', 31, 80),
    (3, 'Clara', 'Berlin', 29, 200),
    (4, 'David', 'München', 42, 150),
    (5, 'Emma', 'Köln', 35, 90);

    INSERT INTO produkte (id, name, kategorie, preis, lagerbestand) VALUES
    (1, 'Laptop', 'Elektronik', 899.99, 12),
    (2, 'Maus', 'Elektronik', 24.99, 80),
    (3, 'Tastatur', 'Elektronik', 49.99, 45),
    (4, 'Notizbuch', 'Büro', 4.99, 200),
    (5, 'Kugelschreiber', 'Büro', 1.49, 500),
    (6, 'Rucksack', 'Zubehör', 39.99, 30);

    INSERT INTO bestellungen (id, kunden_id, bestelldatum, status) VALUES
    (1, 1, '2026-01-10', 'bezahlt'),
    (2, 1, '2026-01-12', 'versendet'),
    (3, 2, '2026-01-15', 'offen'),
    (4, 3, '2026-01-18', 'bezahlt'),
    (5, 5, '2026-01-20', 'storniert');

    INSERT INTO bestellpositionen (id, bestellung_id, produkt_id, menge, einzelpreis) VALUES
    (1, 1, 1, 1, 899.99),
    (2, 1, 2, 2, 24.99),
    (3, 2, 4, 5, 4.99),
    (4, 2, 5, 10, 1.49),
    (5, 3, 3, 1, 49.99),
    (6, 4, 6, 1, 39.99),
    (7, 4, 2, 1, 24.99),
    (8, 5, 4, 3, 4.99);
  `);
}
