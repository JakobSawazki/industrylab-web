export const phases = [
  [5, "Einstieg"], [8, "Beispiel klären"], [24, "Praxis"], [8, "Ergebnis prüfen und Aufgabencheck"]
];

// IDs match lessons.mjs and remain stable when units are reordered.
const plans = [
  [1,
    "Relative und absolute Zellbezüge einsetzen.",
    "Planungsreserve: 8 %.\nAuftrag | Menge | Minuten je Stück\nP-2601 | 120 | 6,5\nP-2602 | 80 | 8,0\nP-2603 | 150 | 6,5",
    ["Öffne die Excel-Ausgangsdatei. Die drei Aufträge und die Planungsreserve von 8 % stehen bereits darin.",
      "Berechne Produktionszeit in Stunden und Planzeit mit Reserve. Kopiere beide Formeln nach unten.",
      "Ändere die Reserve auf 12 % und erkläre, warum sich alle Planzeiten ändern."],
    "Drei berechnete Aufträge mit Produktionszeit und Planzeit für beide Reserven.",
    "Teile die Gesamtminuten durch 60. Fixiere die Reservezelle mit Dollarzeichen."
  ],
  [2,
    "Soll und Ist vergleichen und mit WENN einen Status ableiten.",
    "Ab 100 % gilt die Zielmenge als erreicht.\nAuftrag | Soll (Stück) | Ist (Stück)\nP-2701 | 120 | 123\nP-2702 | 90 | 86\nP-2703 | 65 | 65",
    ["Öffne die Excel-Ausgangsdatei und berechne für die drei Aufträge Abweichung und Erfüllungsgrad.",
      "Lege eine Statusformel an, die zwischen „Erreicht“ und „Unter Plan“ unterscheidet.",
      "Teste die Formel bei Gleichheit und benenne die größte Unterschreitung in deiner Auswahl, falls eine vorliegt."],
    "Drei ausgewertete Aufträge und ein Grenztest mit Ist = Soll.",
    "Rechne Ist minus Soll und Ist geteilt durch Soll. Verwende das Prozentformat."
  ],
  [3,
    "Aufträge über Artikelnummern mit Stammdaten verbinden.",
    "Verwende die Excel-Ausgangsdatei mit den Blättern Aufträge und Artikelstamm.",
    ["Suche die erste Artikelnummer von Hand im Artikelstamm.",
      "Übernimm per XVERWEIS Bezeichnung und Preis in die ersten drei Aufträge.",
      "Prüfe den ersten Treffer manuell. Teste in einer Kopie eine unbekannte Artikelnummer mit der Rückgabe „Artikel fehlt“."],
    "Drei korrekte Treffer und eine verständliche Meldung beim fehlenden Artikel.",
    "Such- und Rückgabematrix müssen dieselben Artikel in derselben Reihenfolge enthalten."
  ],
  [4,
    "Endbestand und Nachbestellmenge berechnen.",
    "Beispiel: Anfang 40, Zugang 15, Abgang 38, Mindestbestand 20, Zielbestand 50.",
    ["Öffne die Ausgangsdatei und lies die Bestellregel im Blatt „Hinweise“.",
      "Berechne für drei Artikel Endbestand, Lagerstatus und Bestellmenge. Bestelle bei Unterschreitung bis zum Zielbestand.",
      "Teste in einer Kopie Endbestand = Mindestbestand und filtere nach „Nachbestellen“. Vergleiche den Grenzfall mit dem Browserrechner."],
    "Im Beispiel ergeben sich 17 Stück Bestand und 33 Stück Bestellmenge. Bei Gleichheit wird nicht bestellt.",
    "Endbestand = Anfang + Zugang − Abgang. Vergleiche mit < und nicht mit ≤."
  ],
  [5,
    "Umsatz nach Region mit einer Pivot-Tabelle verdichten.",
    "Die Excel-Datei enthält 180 fiktive Aufträge. Bearbeite heute nur die regionale Sicht.",
    ["Berechne im Blatt „Daten“ den Umsatz aus Menge × Einzelpreis und kopiere die Formel auf alle Aufträge.",
      "Erstelle eine Pivot-Tabelle mit Region in den Zeilen und Summe von Umsatz in den Werten.",
      "Benenne die stärkste Region und vergleiche das Pivot-Gesamtergebnis mit der Summe der Umsatzspalte."],
    "Pivot-Tabelle, stärkste Region mit Umsatz und geprüfte Gesamtsumme.",
    "Prüfe auf Zahlen und die Einstellung „Summe“, wenn Excel stattdessen „Anzahl“ anzeigt."
  ],
  [6,
    "Fixkosten, variable Kosten und Stückkosten in Excel modellieren.",
    "A: 2.000 € fix + 6 € je Stück. B: 800 € fix + 9 € je Stück. Vergleiche 200 und 500 Stück.",
    ["Öffne die Excel-Ausgangsdatei mit vier Zeilen für die beiden Varianten und Mengen.",
      "Berechne Gesamt- und Stückkosten mit Zellbezügen.",
      "Empfiehl für jede Menge eine Variante und belege sie mit dem Preisunterschied."],
    "Vier berechnete Zeilen, zwei Empfehlungen mit Zahlen.",
    "Gesamtkosten = Fixkosten + Stückzahl × variable Stückkosten. Teile anschließend durch die Menge."
  ],
  [7,
    "Gewinnschwelle berechnen und grafisch erklären.",
    "Fixkosten 4.000 €, variable Stückkosten 15 €, Preis 25 €. Mengen: 0, 200, 400 und 600 Stück.",
    ["Berechne in der Excel-Ausgangsdatei Erlös, Kosten und Ergebnis für jede Menge.",
      "Zeichne ein Punktdiagramm mit Linien für Erlös und Kosten. Die Menge steht auf der X-Achse.",
      "Kontrolliere den Schnittpunkt im Rechner. Probiere dort 15 € Verkaufspreis aus und erkläre das Ergebnis."],
    "Zwei beschriftete Reihen und eine Erklärung für beide Preisszenarien.",
    "Fixkosten geteilt durch Stückdeckungsbeitrag ergibt die Gewinnschwelle, sofern der Deckungsbeitrag positiv ist."
  ],
  [8,
    "Eine Make-or-buy-Entscheidung mit Kosten und Liefertermin begründen.",
    "Eigen: 1.500 € fix + 5 €/Stück, 4 Tage. Fremd: 8 €/Stück, 7 Tage. Mengen: 300, 500 und 600. Lieferfrist: 5 Tage.",
    ["Öffne die Excel-Ausgangsdatei. Berechne beide Gesamtkosten je Menge und markiere den Gleichstand.",
      "Ermittle die günstigste Variante für 300 Stück.",
      "Empfiehl eine Variante für 300 Stück unter Einhaltung des Termins. Begründe den Unterschied zur reinen Kostenentscheidung."],
    "Kostenvergleich und terminbezogene Empfehlung.",
    "Prüfe die Lieferzeit getrennt von den Kosten."
  ],
  [9,
    "Marketingkampagnen anhand von Bestellquote, Kosten und Umsatz vergleichen.",
    "A: 1.200 Klicks, 36 Bestellungen, 540 € Werbekosten, 1.800 € Umsatz.\nB: 800 Klicks, 32 Bestellungen, 640 € Werbekosten, 2.240 € Umsatz.\nZiel: höchstens 18 € Werbekosten je Bestellung.",
    ["Berechne in der Excel-Ausgangsdatei für beide Kampagnen Conversion Rate, Werbekosten je Bestellung und Umsatz je Werbe-Euro.",
      "Vergleiche die beiden Zeilen mit dem Kennzahlenrechner. Ändere für eine Kampagne die Bestellzahl und beobachte die Auswirkungen.",
      "Wähle eine Kampagne für das Kostenziel. Prüfe, ob du für das Ziel „möglichst viel Umsatz je Werbe-Euro“ dieselbe Kampagne wählen würdest."],
    "Zwei berechnete Kampagnen und eine Empfehlung mit Zahlen.",
    "Bestellungen durch Klicks als Prozentwert. Für den Umsatz je Werbe-Euro teile den Umsatz durch die Werbekosten. Bei einem Nenner von 0 bleibt die betreffende Kennzahl offen."
  ],
  [10,
    "Umsatzverlauf und Kennzahlen verständlich darstellen.",
    "Umsatz in €: Jan 12.000, Feb 14.000, Mär 11.000, Apr 15.000, Mai 16.000, Jun 13.000.",
    ["Prüfe in der Excel-Ausgangsdatei die Reihenfolge der Monate und erstelle ein Liniendiagramm.",
      "Zeige Gesamtumsatz und stärksten Monat oberhalb des Diagramms.",
      "Benenne die stärksten Rückgänge zum Vormonat und formuliere eine Frage nach ihrer Ursache."],
    "Ein beschriftetes Diagramm, zwei Kennzahlen und eine Beobachtung mit Zahlen.",
    "Berechne die Differenzen zum Vormonat. Mehrere Rückgänge können gleich groß sein."
  ],
  [11,
    "Kunden, Aufträge und Artikel mit Schlüsseln modellieren.",
    "K01 erteilt O101 und O103, K02 erteilt O102. O101 enthält A01 und A02. O103 enthält A01.",
    ["Skizziere Tabellen für Kunden, Aufträge, Artikel und Auftragspositionen.",
      "Markiere die Primärschlüssel und zeichne die Fremdschlüsselbeziehungen ein.",
      "Ergänze die drei Positionszeilen und erkläre, warum eine Artikelnummer mehrfach vorkommen kann."],
    "Vier verknüpfte Tabellen und zwei getrennte Positionszeilen für O101.",
    "Eine Position verweist auf einen Auftrag und einen Artikel. Die Artikelnummer allein identifiziert keine Position."
  ],
  [12,
    "Auftragsdaten mit SELECT, WHERE und JOIN auswerten.",
    "kunden(id, name): K01 Hahn GmbH, K02 Weller KG. auftraege(id, kunden_id, status): O101 K01 offen, O102 K02 geliefert, O103 K01 offen.",
    ["Schreibe eine Abfrage für die Nummern offener Aufträge.",
      "Ergänze den Kundenstamm per JOIN und gib auch den Namen aus.",
      "Notiere die erwarteten Zeilen und prüfe sie im Browserlabor. Wenn ein SQL-System bereitsteht, kannst du deine Abfrage mit der Startdatei auch in einer leeren lokalen Übungsdatenbank ausführen."],
    "SQL-Abfrage und erwartete Ergebnistabelle.",
    "Verbinde auftraege.kunden_id mit kunden.id und filtere auf auftraege.status = 'offen'."
  ],
  [13,
    "Materialfluss und Informationsfluss in einem Auftrag unterscheiden.",
    "Der Kunde möchte 40 Baugruppen am Freitag erhalten. Für Auftrag O201 liegen 30 Stück im Lager. Die restlichen 10 sollen gefertigt werden.",
    ["Lies die Fallakte. Skizziere die fünf Übergaben vom Vertrieb bis zur Buchhaltung.",
      "Notiere je Übergabe einen Beleg oder Datensatz und zwei benötigte Felder. Markiere, wo Ware bewegt wird.",
      "Öffne die Störungsmeldung. Erkläre, wer informiert werden muss und was im ERP zum Lieferplan steht."],
    "Prozessskizze und begründeter Vorschlag für den Umgang mit der Verzögerung.",
    "Trenne die geplante Fertigstellung, den Versand und die Ankunft beim Kunden. Für jede Station kann im ERP ein eigener Termin stehen.",
    { caseFile: {
      title: "Fallakte O201",
      handoffs: [
        ["Vertrieb → Planung", "Der Vertrieb gibt den Kundenwunsch weiter. Auftrag O201 umfasst 40 Baugruppen BG-40 mit gewünschter Ankunft am Freitag."],
        ["Planung → Fertigung", "Die Planung prüft den Bestand und beauftragt die Fertigung mit den fehlenden 10 Stück. Geplant ist die Fertigstellung am Donnerstag."],
        ["Fertigung → Lager", "Sobald die geprüften Baugruppen fertig sind, übergibt die Fertigung sie an das Lager. Das Lager erfasst die tatsächlich eingegangene Menge für Fach B-04."],
        ["Lager → Versand", "Das Lager stellt die freigegebenen Baugruppen aus Fach B-04 am Packplatz bereit. Der Versand erhält die Auftragsnummer und die Menge zur Zuordnung."],
        ["Versand → Buchhaltung", "Der Versand meldet nach der Übergabe an den Transportdienst, wie viele Stück wann den Betrieb verlassen haben. Die Buchhaltung erhält diese Daten für die Rechnung."]
      ],
      delay: "Die Fertigung meldet, dass die fehlenden 10 Baugruppen voraussichtlich erst am Montag fertig sind. Der Kunde bestätigt die Teilmenge von 30 Stück zur Lieferung am Freitag. Den Liefertermin der restlichen 10 Stück hat der Vertrieb noch nicht bestätigt."
    } }
  ],
  [14,
    "Dubletten und fehlende Werte bei einem CSV-Import behandeln.",
    "Beleg;Position;Artikel;Menge\nL01;1;00127;10\nL01;1;00127;10\nL01;2;00127;5\nL02;1;00404;",
    ["Lade die CSV-Rohdaten herunter. Importiere sie in Excel über „Daten“ → „Aus Text/CSV“. Wähle UTF-8 und Semikolon. Öffne „Daten transformieren“ und stelle „Artikel“ vor dem Laden auf Text.",
      "Entferne nur die identische Dublette anhand von Beleg und Position.",
      "Markiere die fehlende Menge als ungeklärt und protokolliere die Änderungen."],
    "Drei verbliebene Datenzeilen, erhaltene Nullen und ein Änderungsprotokoll.",
    "In Power Query kann ein automatisch gesetzter Schritt „Geänderter Typ“ führende Nullen entfernen. Entferne diesen Schritt, bevor du „Artikel“ als Text einstellst. Die gleiche Artikelnummer kann in mehreren Positionen vorkommen."
  ],
  [15,
    "Einen KI-Formelvorschlag mit fachlichen Testfällen überprüfen.",
    'Vorschlag: =WENN(B2<=C2;"Nachbestellen";"OK")\nB2 = Endbestand, C2 = Mindestbestand. Bestellung nur bei Unterschreitung.',
    ["Öffne die Excel-Ausgangsdatei. Notiere in Spalte D zuerst das erwartete Ergebnis für die drei Testfälle.",
      "Prüfe den Vorschlag in Spalte E und markiere den Fehler. Trage die korrigierte Formel in Spalte F ein.",
      "Vergleiche das erwartete Ergebnis mit deiner korrigierten Formel. Nutze den Browserrechner, um den Grenzfall zu kontrollieren."],
    "Testtabelle mit drei Fällen und korrigierter Formel. Der mitgelieferte Vorschlag genügt.",
    "Teste insbesondere den Fall gleicher Werte."
  ],
  [16,
    "Eine verdächtige Nachricht prüfen und eine Auswertung datensparsam erstellen.",
    "Fiktive Meldung: „Neues Versandportal. Melden Sie sich binnen 15 Minuten über den Link an.“ Für Mengen je Region liegen Name, E-Mail, Region und Versandmenge vor.",
    ["Markiere zwei Warnsignale und nenne einen unabhängigen Weg, die Nachricht zu prüfen.",
      "Wähle die erforderlichen Spalten aus. Erkläre, welche aggregierten Angaben weitergegeben werden können.",
      "Formuliere einen kurzen internen Meldehinweis. Verwende keine Zugangsdaten und öffne keinen Link."],
    "Begründete Prüfschritte und zwei ausgewählte Spalten.",
    "Verwende einen bekannten Kontaktweg. Region und Versandmenge reichen für die Auswertung."
  ],
  [17,
    "Die Geschäftsleitung der Nagold Components GmbH hat Zeit für eine vertiefte Analyse. Empfiehl, welche Region sie zuerst untersuchen sollte und zu welcher Frage.",
    "Monat | Nord € | Süd €\nApril | 12.000 | 9.000\nMai | 13.000 | 11.000\nJuni | 11.000 | 14.000",
    ["Berechne in Excel mit Formeln für beide Regionen den Quartalsumsatz und die Veränderung in Euro von April bis Juni.",
      "Erstelle aus den Monatswerten ein Liniendiagramm mit beiden Regionen. Gleiche die April- und Juniwerte im Diagramm mit der Tabelle ab.",
      "Wähle einen Schwerpunkt für die Analyse. Soll sie das größere Umsatzvolumen oder die stärkere Entwicklung untersuchen? Empfiehl eine Region mit zwei vergleichbaren Zahlen und nenne eine konkrete Frage für die weitere Analyse."],
    "Excel-Arbeitsmappe mit Kennzahlen und Diagramm. Empfehlung an die Geschäftsleitung in zwei bis drei Sätzen.",
    "Quartalsumsatz und Entwicklung beantworten unterschiedliche Fragen. Prüfe, welche Kennzahl zu deiner Empfehlung passt und welche Daten die Geschäftsleitung als Nächstes bräuchte.",
    { criteria: [
      ["Kennzahlen", "Für Nord und Süd stehen Quartalsumsatz und Veränderung in Euro in der Tabelle. Die Veränderung rechnest du als Juni minus April."],
      ["Diagramm", "April, Mai und Juni stehen in dieser Reihenfolge auf der Zeitachse. Beide Regionen sind erkennbar, die Wertachse ist in Euro beschriftet und die April- und Juniwerte stimmen mit der Tabelle überein."],
      ["Empfehlung", "Du nennst den Schwerpunkt und vergleichst die passende Kennzahl für beide Regionen, bevor du eine Region empfiehlst."],
      ["Offene Frage", "Deine Frage macht klar, welche zusätzliche Information du brauchst und was du damit klären willst."]
    ] }
  ]
];

export const units = Object.fromEntries(plans.map(([id, goal, data, steps, result, hint, options]) => [
  id, { goal, data, steps, result, hint, ...options }
]));

export const extensions = {
  15: [
    {
      minutes: 10,
      title: "Einen KI-Text mit dem Auftrag abgleichen",
      data: "Auftrag O201: 30 Baugruppen sind versandbereit, 10 folgen voraussichtlich am Montag. Der Termin ist offen.\nKI-Entwurf: „Alle 40 Baugruppen treffen garantiert am Montag ein.“",
      steps: [
        "Markiere zwei Aussagen, die der Auftragsstand nicht stützt. Unterscheide Versandbereitschaft und Lieferung.",
        "Formuliere einen sachlichen Zweizeiler für den Vertrieb. Kennzeichne ausdrücklich, was noch offen ist."
      ],
      result: "Zwei belegte Korrekturen und ein Text ohne erfundene Lieferzusage."
    },
    {
      minutes: 10,
      title: "Eine KI-Auskunft mit Quellen prüfen",
      data: "Fiktives Preisblatt A: gültig ab 1. Oktober, Artikel A17: 18 € netto. Preisblatt B: gültig ab 1. November, Artikel A17: 21 € netto. Laut Einkauf ersetzt B das Preisblatt A.\nKI-Auskunft für 18. November: „A17 kostet aktuell 18 € brutto laut Preisblatt A.“",
      steps: [
        "Vergleiche Preis, Gültigkeit und Netto-/Brutto-Angabe mit den beiden Preisblättern.",
        "Notiere den belegbaren Preis mit Quelle und Stand. Erkläre, welche Angabe für einen Bruttobetrag noch benötigt wird."
      ],
      result: "Ein belegter Wert mit Quellenstand und eine klar benannte fehlende Information."
    }
  ],
  16: [
    {
      minutes: 10,
      title: "Passwörter und MFA im Büroalltag",
      data: "Eine Kollegin nutzt dasselbe Passwort für Versandportal und privaten Shop. Später erscheint unerwartet eine Anmeldebestätigung auf ihrem Handy.",
      steps: [
        "Erkläre, warum jedes Konto ein eigenes Passwort braucht. Skizziere, wie ein freigegebener Passwortmanager dabei hilft.",
        "Beschreibe, was der zweite Faktor zusätzlich abfragt. Entscheide, wie die Kollegin bei der unerwarteten Bestätigung reagiert."
      ],
      result: "Eine Empfehlung für eindeutige, starke Passwörter und ein begründeter Umgang mit der unerwarteten Anfrage."
    }
  ]
};

// Die Feldschlüssel bleiben stabil, damit Sicherungen lesbar bleiben.
export const responseFields = {
  1: [["zeiten","Produktions- und Planzeiten","Notiere die Produktionszeit und die beiden Planzeiten für P-2601. Gib die Einheit an."], ["bezug","Zellbezug begründen","Warum ändert sich die Planzeit aller drei Aufträge, wenn du die Reserve änderst?"]],
  2: [["abweichung","Größte Unterschreitung","Nenne Auftrag, Abweichung in Stück und Erfüllungsgrad."], ["gleichstand","Grenztest erklären","Welchen Status zeigt deine Formel bei Ist = Soll? Begründe das."]],
  3: [["treffer","Erster Treffer","Welche Artikelnummer, Bezeichnung und welchen Preis liefert deine Formel beim ersten Auftrag?"], ["fehlt","Fehlende Artikelnummer","Was zeigt deine Formel bei einer unbekannten Artikelnummer?"]],
  4: [["lager","Bestellvorschlag dokumentieren","Notiere für einen Artikel Endbestand, Status und Bestellmenge."], ["grenze","Mindestbestand erreicht","Was ergibt sich, wenn Endbestand und Mindestbestand gleich sind?"]],
  5: [["pivot","Regionale Auswertung","Nenne die Region mit dem höchsten Umsatz samt Betrag."], ["abgleich","Summen abgleichen","Notiere Pivot-Gesamtsumme und die Summe der Umsatzspalte. Erkläre, wie du sie geprüft hast."]],
  6: [["wahl","Fertigungsvarianten vergleichen","Welche Variante empfiehlst du für 200 Stück und welche für 500? Belege beide Empfehlungen mit dem Kostenunterschied."]],
  7: [["schwelle","Gewinnschwelle ablesen","Nenne Menge und Betrag am Schnittpunkt von Kosten und Erlös."], ["preis","Preisänderung beurteilen","Was passiert bei einem Verkaufspreis von 15 €? Begründe es mit dem Stückdeckungsbeitrag."]],
  8: [["kosten","Reine Kostenentscheidung","Welche Variante ist bei 300 Stück günstiger? Nenne beide Gesamtkosten."], ["termin","Entscheidung mit Lieferfrist","Welche Variante empfiehlst du, wenn 300 Stück binnen fünf Tagen verfügbar sein müssen? Begründe deine Wahl."]],
  9: [["kampagne","Kampagnenentscheidung","Empfiehl je eine Kampagne für das Kostenziel und für den höchsten Umsatz je Werbe-Euro. Belege beide Entscheidungen mit Zahlen."]],
  10: [["trend","Dashboard erklären","Nenne Gesamtumsatz, stärksten Monat und die stärksten Rückgänge."], ["frage","Ursache untersuchen","Welche Frage würdest du stellen, um einen Rückgang zu erklären?"]],
  11: [["modell","Tabellen und Schlüssel","Notiere für Kunden, Aufträge, Artikel und Auftragspositionen den Primärschlüssel und die benötigten Fremdschlüssel."], ["position","Auftragspositionen","Erfasse die drei Positionen. Begründe, warum die Artikelnummer allein keine Position eindeutig kennzeichnet."]],
  12: [["sql","SQL-Abfragen","Schreibe zuerst die Abfrage für offene Auftragsnummern und danach die Variante mit JOIN und Kundennamen."], ["treffer","Erwartete Treffer","Notiere vor der Kontrolle im Labor die erwarteten Zeilen."]],
  13: [["belege","Übergaben im ERP","Nenne je Übergabe einen Beleg oder Datensatz und zwei Datenfelder. Kennzeichne die Warenbewegungen."], ["verzug","Verzögerung bearbeiten","Wer muss informiert werden? Was steht zu den bestätigten 30 Stück und zu den restlichen 10 Stück im ERP?"]],
  14: [["protokoll","Änderungsprotokoll","Welche Zeile hast du entfernt? Welcher Wert fehlt und wie behandelst du ihn? Erkläre auch, wie die führenden Nullen erhalten bleiben."]],
  15: [["test","Formeltest dokumentieren","Notiere für 17, 20 und 23 Stück jeweils das erwartete Ergebnis und das Ergebnis des KI-Vorschlags."], ["korrektur","Korrektur erklären","Schreibe deine korrigierte Formel auf und begründe, welche Änderung den Fehler behebt."]],
  16: [["massnahmen","Nachricht und Datenauswertung prüfen","Nenne zwei Warnsignale und einen unabhängigen Prüfweg. Welche Spalten brauchst du für die Auswertung?"], ["meldung","Internen Meldehinweis formulieren","Schreibe eine kurze fiktive Meldung mit dem Anlass und deinem bisherigen Umgang mit der Nachricht."]],
  17: [["kennzahlen","Kennzahlen festhalten","Notiere Quartalssumme und Veränderung von April bis Juni für beide Regionen."], ["empfehlung","Empfehlung begründen","Nenne deinen Schwerpunkt und die empfohlene Region. Vergleiche die passende Kennzahl für Nord und Süd und formuliere eine konkrete offene Datenfrage."]],
};
