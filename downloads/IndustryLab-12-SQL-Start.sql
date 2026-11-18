-- IndustryLab · Einheit 12
-- In einer neuen, leeren lokalen Übungsdatenbank ausführen.
-- Alle Namen und Aufträge sind fiktiv.

CREATE TABLE kunden (
    id VARCHAR(3) PRIMARY KEY,
    name VARCHAR(80) NOT NULL
);

CREATE TABLE auftraege (
    id VARCHAR(4) PRIMARY KEY,
    kunden_id VARCHAR(3) NOT NULL,
    status VARCHAR(15) NOT NULL,
    FOREIGN KEY (kunden_id) REFERENCES kunden (id)
);

INSERT INTO kunden (id, name) VALUES
    ('K01', 'Hahn GmbH'),
    ('K02', 'Weller KG');

INSERT INTO auftraege (id, kunden_id, status) VALUES
    ('O101', 'K01', 'offen'),
    ('O102', 'K02', 'geliefert'),
    ('O103', 'K01', 'offen');

-- Schreib deine Abfragen unter diese Zeile.
