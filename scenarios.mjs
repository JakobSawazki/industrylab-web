const euros = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const number = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });

export function breakEven(fixed, variable, price, units) {
  const fixedCents = Math.round(fixed * 100);
  const variableCents = Math.round(variable * 100);
  const priceCents = Math.round(price * 100);
  const cost = fixedCents + variableCents * units;
  const sales = priceCents * units;
  const contribution = priceCents - variableCents;
  return { cost: cost / 100, sales: sales / 100, profit: (sales - cost) / 100, minimum: contribution > 0 ? Math.ceil(fixedCents / contribution) : null };
}

export function campaignMetrics(clicks, orders, spend, revenue) {
  if (orders > clicks) return "Die Zahl der Bestellungen darf in diesem Beispiel die Klickzahl nicht überschreiten.";
  const conversion = clicks ? number.format(100 * orders / clicks) + " %" : "–";
  const costPerOrder = orders ? euros.format(spend / orders) : "–";
  const metrics = "Conversion Rate " + conversion + " · Kosten je Bestellung " + costPerOrder;
  if (revenue === undefined) return metrics;
  const revenuePerEuro = spend ? euros.format(revenue / spend) : "–";
  return metrics + " · Umsatz je Werbe-Euro " + revenuePerEuro;
}

export function stockProposal(opening, incoming, outgoing, minimum, target) {
  const closing = opening + incoming - outgoing;
  if (closing < 0) return "Prüfe die Bestandsdaten. Der Abgang übersteigt den verfügbaren Bestand.";
  if (target < minimum) return "Der Zielbestand muss mindestens so hoch sein wie der Mindestbestand.";
  const reorder = closing < minimum;
  return "Endbestand " + number.format(closing) + " Stück · " + (reorder ? "Nachbestellen" : "OK")
    + " · Bestellmenge " + number.format(reorder ? target - closing : 0) + " Stück";
}

export function stockFormulaCheck(closing, minimum) {
  const suggestion = closing <= minimum ? "Nachbestellen" : "OK";
  const expected = closing < minimum ? "Nachbestellen" : "OK";
  const assessment = suggestion === expected
    ? "Der KI-Vorschlag liefert für diesen Testfall das erwartete Ergebnis."
    : "Der KI-Vorschlag weicht beim Gleichstand von der Bestellregel ab.";
  return "KI-Vorschlag (≤): " + suggestion + " · Soll laut Bestellregel (<): " + expected + ". " + assessment;
}

const scenarios = {
  4: {
    title: "Bestellvorschlag ausprobieren",
    fields: [["Anfangsbestand", 40, 0, 1], ["Zugang", 15, 0, 1], ["Abgang", 38, 0, 1],
      ["Mindestbestand", 20, 0, 1], ["Zielbestand", 50, 0, 1]],
    note: "Die Mengen sind in Stück. Verändere den Abgang, bis der Endbestand genau dem Mindestbestand entspricht.",
    calculate: stockProposal
  },
  7: {
    title: "Gewinnschwelle ausprobieren",
    fields: [["Fixkosten in €", 4000, 1, 0.01], ["Variable Stückkosten in €", 15, 0, 0.01],
      ["Verkaufspreis je Stück in €", 25, 0, 0.01], ["Absatzmenge", 450, 0, 1]],
    calculate(fixed, variable, price, units) {
      const { cost, sales, profit, minimum } = breakEven(fixed, variable, price, units);
      return "Erlös " + euros.format(sales) + " · Kosten " + euros.format(cost) + " · Ergebnis " + euros.format(profit)
        + (minimum === null ? " · Keine Gewinnschwelle bei diesem Preis." : " · Kostendeckung ab " + number.format(minimum) + " Stück.");
    }
  },
  9: {
    title: "Kampagnen vergleichen",
    fields: [["Klicks", 1200, 0, 1], ["Bestellungen", 36, 0, 1], ["Werbekosten in €", 540, 0, 0.01], ["Umsatz in €", 1800, 0, 0.01]],
    campaigns: [["Kampagne A", [1200, 36, 540, 1800]], ["Kampagne B", [800, 32, 640, 2240]]],
    note: "Umsatz je Werbe-Euro zeigt das Verhältnis von Umsatz zu Werbekosten. Für eine Gewinnrechnung fehlen die übrigen Kosten.",
    calculate: campaignMetrics
  },
  15: {
    title: "KI-Formel im Browser testen",
    fields: [["Endbestand", 17, 0, 1], ["Mindestbestand", 20, 0, 1]],
    note: "Notiere zuerst das erwartete Ergebnis. Teste dann bei Mindestbestand 20 die Endbestände 17, 20 und 23.",
    calculate: stockFormulaCheck
  }
};

function calculatorFields(scenario, values) {
  const calculator = document.createElement("div");
  const fields = document.createElement("div");
  fields.className = "scenario-fields";
  const result = document.createElement("p");
  result.setAttribute("role", "status");
  const inputs = scenario.fields.map(([caption, defaultValue, minimum, step], index) => {
    const label = document.createElement("label");
    label.textContent = caption;
    const input = document.createElement("input");
    input.type = "number";
    input.value = values?.[index] ?? defaultValue;
    input.min = minimum;
    input.max = 1000000;
    input.step = step;
    input.required = true;
    label.append(input);
    fields.append(label);
    return input;
  });
  function update() {
    result.textContent = inputs.every(input => input.validity.valid)
      ? scenario.calculate(...inputs.map(input => input.valueAsNumber))
      : "Prüfe die Eingaben.";
  }
  fields.addEventListener("input", update);
  update();
  calculator.append(fields, result);
  return calculator;
}

const sqlCustomers = new Map([["K01", "Hahn GmbH"], ["K02", "Weller KG"]]);
const sqlOrders = [
  { id: "O101", kunden_id: "K01", status: "offen" },
  { id: "O102", kunden_id: "K02", status: "geliefert" },
  { id: "O103", kunden_id: "K01", status: "offen" }
];

export function orderQuery(status, joinKey) {
  if (!["", "offen", "geliefert"].includes(status) || !["", "kunden_id", "id"].includes(joinKey)) {
    throw new Error("Unbekannter Abfragebaustein");
  }
  const query = [
    joinKey ? "SELECT a.id, k.name" : "SELECT a.id",
    "FROM auftraege AS a",
    joinKey && "JOIN kunden AS k ON a." + joinKey + " = k.id",
    status && "WHERE a.status = '" + status + "'",
    "ORDER BY a.id;"
  ].filter(Boolean).join("\n");

  const rows = [];
  for (const order of sqlOrders) {
    if (status && order.status !== status) continue;
    if (!joinKey) {
      rows.push([order.id]);
      continue;
    }
    const name = sqlCustomers.get(order[joinKey]);
    if (name !== undefined) rows.push([order.id, name]);
  }
  return { query, columns: joinKey ? ["Auftrag", "Kundenname"] : ["Auftrag"], rows };
}

function orderLab() {
  const panel = document.createElement("details");
  panel.className = "scenario sql-lab";
  const summary = document.createElement("summary");
  summary.textContent = "Aufträge mit SQL abfragen";
  const intro = document.createElement("p");
  intro.textContent = "Wähle einen Status und eine Verknüpfung. Sage die Treffer voraus und prüfe sie an den Übungsdaten.";
  const form = document.createElement("form");
  const fields = document.createElement("div");
  fields.className = "scenario-fields";

  function choice(caption, entries) {
    const label = document.createElement("label");
    label.textContent = caption;
    const select = document.createElement("select");
    for (const [value, title] of entries) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = title;
      select.append(option);
    }
    label.append(select);
    fields.append(label);
    return select;
  }
  const filter = choice("Status (WHERE)", [["", "Alle"], ["offen", "Offen"], ["geliefert", "Geliefert"]]);
  const join = choice("Verknüpfung (JOIN)", [
    ["", "Nur Auftragsnummern"],
    ["kunden_id", "Kunden-ID → Kunden-ID"],
    ["id", "Auftragsnummer → Kunden-ID"]
  ]);

  const preview = document.createElement("pre");
  const code = document.createElement("code");
  preview.setAttribute("aria-label", "Zusammengestellte SQL-Abfrage");
  preview.append(code);
  const run = document.createElement("button");
  run.type = "submit";
  run.textContent = "Ergebnis anzeigen";
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const result = document.createElement("div");

  function updateQuery() {
    code.textContent = orderQuery(filter.value, join.value).query;
    result.replaceChildren();
    status.textContent = "";
  }
  form.addEventListener("change", updateQuery);
  form.addEventListener("submit", event => {
    event.preventDefault();
    const { columns, rows } = orderQuery(filter.value, join.value);
    status.textContent = rows.length === 1 ? "1 Treffer" : rows.length + " Treffer";
    if (!rows.length) {
      status.textContent += ". Prüfe, ob die ausgewählten Schlüssel zueinander passen.";
      return;
    }

    const table = document.createElement("table");
    table.createCaption().textContent = "Treffer der Abfrage";
    const heading = table.createTHead().insertRow();
    for (const column of columns) {
      const header = document.createElement("th");
      header.scope = "col";
      header.textContent = column;
      heading.append(header);
    }
    const body = table.createTBody();
    for (const row of rows) {
      const line = body.insertRow();
      for (const value of row) line.insertCell().textContent = value;
    }
    result.replaceChildren(table);
  });

  updateQuery();
  form.append(fields, preview, run, status, result);
  panel.append(summary, intro, form);
  return panel;
}

export function scenarioPanel(id) {
  if (id === 12) return orderLab();
  const panel = document.createElement("details");
  const scenario = scenarios[id];
  if (!scenario) {
    panel.hidden = true;
    return panel;
  }

  panel.className = "scenario";
  const summary = document.createElement("summary");
  summary.textContent = scenario.title;
  panel.append(summary);
  if (scenario.campaigns) {
    for (const [name, values] of scenario.campaigns) {
      const group = document.createElement("fieldset");
      const legend = document.createElement("legend");
      legend.textContent = name;
      group.append(legend, calculatorFields(scenario, values));
      panel.append(group);
    }
  } else {
    panel.append(calculatorFields(scenario));
  }
  if (scenario.note) {
    const note = document.createElement("p");
    note.textContent = scenario.note;
    panel.append(note);
  }
  return panel;
}
