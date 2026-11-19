const euros = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const number = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });
const axisNumber = new Intl.NumberFormat("de-DE", { notation: "compact", maximumFractionDigits: 1 });

export function breakEven(fixed, variable, price, units) {
  const fixedCents = Math.round(fixed * 100);
  const variableCents = Math.round(variable * 100);
  const priceCents = Math.round(price * 100);
  const cost = fixedCents + variableCents * units;
  const sales = priceCents * units;
  const contribution = priceCents - variableCents;
  const intersection = contribution > 0 ? fixedCents / contribution : null;
  return {
    cost: cost / 100, sales: sales / 100, profit: (sales - cost) / 100,
    intersection, minimum: intersection === null ? null : Math.ceil(intersection)
  };
}

const makeDays = 4;
const buyDays = 7;

export function makeOrBuy(units, deadline) {
  const makeCost = 1500 + 5 * units;
  const buyCost = 8 * units;
  let cheapest = "tie";
  if (makeCost < buyCost) cheapest = "make";
  if (buyCost < makeCost) cheapest = "buy";
  let recommendation = cheapest;
  if (deadline < buyDays) recommendation = "make";
  if (deadline < makeDays) recommendation = "none";
  return { makeCost, buyCost, cheapest, recommendation };
}

export function campaignMetrics(clicks, orders, spend, revenue, limit) {
  if (orders > clicks) return "Die Zahl der Bestellungen darf in diesem Beispiel die Klickzahl nicht überschreiten.";
  const conversion = clicks ? number.format(100 * orders / clicks) + " %" : "–";
  const costPerOrder = orders ? euros.format(spend / orders) : "–";
  const metrics = "Conversion Rate " + conversion + " · Kosten je Bestellung " + costPerOrder;
  if (revenue === undefined) return metrics;
  const revenuePerEuro = spend ? euros.format(revenue / spend) : "–";
  const withRevenue = metrics + " · Umsatz je Werbe-Euro " + revenuePerEuro;
  if (limit === undefined) return withRevenue;
  if (orders === 0) return withRevenue + " · Kostenziel ohne Bestellungen nicht bewertbar.";
  const qualifies = Math.round(spend * 100) <= Math.round(limit * 100) * orders;
  return withRevenue + (qualifies ? " · Kostenziel erreicht." : " · Kostenziel überschritten.");
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
  2: {
    title: "Soll und Ist am Grenzfall vergleichen",
    fields: [["Ist-Menge für P-2703 in Stück", 65, 0, 1]],
    note: "Das Soll für P-2703 beträgt 65 Stück. Sage den Status für 64, 65 und 66 Stück voraus und prüfe beide Bedingungen.",
    calculate(actual) {
      const target = 65;
      const difference = actual - target;
      const quota = number.format(100 * actual / target) + " %";
      const inclusive = actual >= target ? "Erreicht" : "Unter Plan";
      const strict = actual > target ? "Erreicht" : "Unter Plan";
      return "Abweichung " + number.format(difference) + " Stück · Erfüllungsgrad " + quota
        + ". Ist ≥ Soll ergibt „" + inclusive + "“. Ist > Soll ergibt „" + strict + "“.";
    }
  },
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
    chart: breakEvenChart,
    calculate(fixed, variable, price, units) {
      const { cost, sales, profit, minimum } = breakEven(fixed, variable, price, units);
      return "Erlös " + euros.format(sales) + " · Kosten " + euros.format(cost) + " · Ergebnis " + euros.format(profit)
        + (minimum === null ? " · Keine Gewinnschwelle bei diesem Preis." : " · Kostendeckung ab " + number.format(minimum) + " Stück.");
    }
  },
  8: {
    title: "Kosten und Lieferfrist vergleichen",
    fields: [["Auftragsmenge in Stück", 300, 1, 1], ["Lieferfrist in Tagen", 5, 0, 1]],
    note: "Im Modell bleiben die Lieferzeiten bei jeder Menge gleich. Prüfe zuerst die Frist von 5 Tagen und erhöhe sie dann auf 7 Tage.",
    calculate(units, deadline) {
      const { makeCost, buyCost, cheapest, recommendation } = makeOrBuy(units, deadline);
      const labels = { make: "Eigenfertigung", buy: "Fremdbezug" };
      const cost = cheapest === "tie"
        ? "Beide Varianten kosten gleich viel."
        : labels[cheapest] + " ist um " + euros.format(Math.abs(makeCost - buyCost)) + " günstiger.";
      const eligible = {
        none: "Keine Variante hält die Frist ein.",
        tie: "Beide Varianten halten die Frist ein und kosten gleich viel.",
        make: "Eigenfertigung ist die passende Variante innerhalb der Frist.",
        buy: "Fremdbezug ist die passende Variante innerhalb der Frist."
      };
      return "Eigenfertigung " + euros.format(makeCost) + " (" + makeDays + " Tage) · Fremdbezug "
        + euros.format(buyCost) + " (" + buyDays + " Tage). " + cost + " " + eligible[recommendation];
    }
  },
  9: {
    title: "Kampagnen vergleichen",
    fields: [["Klicks", 1200, 0, 1], ["Bestellungen", 36, 0, 1], ["Werbekosten in €", 540, 0, 0.01], ["Umsatz in €", 1800, 0, 0.01]],
    campaigns: [["Kampagne A", [1200, 36, 540, 1800]], ["Kampagne B", [800, 32, 640, 2240]]],
    limit: 18,
    note: "Für den Vergleich mit dem Kostenziel zählen die ungerundeten Werbekosten je Bestellung. Für eine Gewinnrechnung fehlen die übrigen Kosten.",
    calculate: campaignMetrics
  },
  15: {
    title: "KI-Formel im Browser testen",
    fields: [["Endbestand", 17, 0, 1], ["Mindestbestand", 20, 0, 1]],
    note: "Notiere zuerst das erwartete Ergebnis. Teste dann bei Mindestbestand 20 die Endbestände 17, 20 und 23.",
    calculate: stockFormulaCheck
  }
};

function breakEvenChart() {
  const figure = document.createElement("figure");
  figure.className = "break-even-chart";
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 340;
  canvas.setAttribute("aria-hidden", "true");
  const caption = document.createElement("figcaption");
  const legend = document.createElement("p");
  legend.textContent = "Erlös · blaue Linie. Gesamtkosten · gestrichelte orange Linie.";
  const point = document.createElement("p");
  caption.append(legend, point);
  figure.append(canvas, caption);

  function update(fixed, variable, price, units) {
    const start = breakEven(fixed, variable, price, 0);
    const quantityMax = Math.max(600, units, Math.ceil((start.intersection ?? 0) * 1.1));
    const end = breakEven(fixed, variable, price, quantityMax);
    const valueMax = Math.max(end.cost, end.sales, 1);
    const intersection = start.intersection;
    const crossing = intersection === null ? null : breakEven(fixed, variable, price, intersection).sales;
    const approximation = Number.isInteger(intersection) ? "" : "rund ";
    point.textContent = crossing === null
      ? "Kein Schnittpunkt. Die Gesamtkosten bleiben bei jeder Menge höher als der Erlös."
      : "Schnittpunkt bei " + approximation + number.format(intersection) + " Stück und " + euros.format(crossing) + ".";

    const context = canvas.getContext("2d");
    if (!context) return;
    const left = 94, right = 535, top = 42, bottom = 269;
    const x = quantity => left + quantity / quantityMax * (right - left);
    const y = value => bottom - value / valueMax * (bottom - top);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = "18px system-ui, sans-serif";
    context.fillStyle = "#213950";
    context.textBaseline = "middle";
    context.textAlign = "left";
    context.fillText("Betrag (€)", left, 20);
    context.fillText("Absatzmenge (Stück)", left, 322);
    context.lineWidth = 1;
    context.strokeStyle = "#a0b3c4";
    context.setLineDash([]);
    for (const fraction of [0, .25, .5, .75, 1]) {
      const amount = valueMax * fraction;
      context.beginPath();
      context.moveTo(left, y(amount));
      context.lineTo(right, y(amount));
      context.stroke();
      context.textAlign = "right";
      context.fillText(axisNumber.format(amount), left - 8, y(amount));
      context.textAlign = "center";
      context.fillText(axisNumber.format(Math.round(quantityMax * fraction)), x(quantityMax * fraction), bottom + 22);
    }
    for (const [initial, final, color, dash] of [
      [start.cost, end.cost, "#a34611", [9, 6]],
      [0, end.sales, "#17618b", []]
    ]) {
      context.beginPath();
      context.lineWidth = 3;
      context.strokeStyle = color;
      context.setLineDash(dash);
      context.moveTo(left, y(initial));
      context.lineTo(right, y(final));
      context.stroke();
    }
    if (crossing !== null) {
      context.beginPath();
      context.arc(x(intersection), y(crossing), 5, 0, Math.PI * 2);
      context.fill();
    }
  }
  return { figure, update };
}

function calculatorFields(scenario, values, limitInput) {
  const calculator = document.createElement("div");
  const fields = document.createElement("div");
  fields.className = "scenario-fields";
  const result = document.createElement("p");
  result.setAttribute("role", "status");
  const chart = scenario.chart?.();
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
    const valid = inputs.every(input => input.validity.valid) && (!limitInput || limitInput.validity.valid);
    const current = inputs.map(input => input.valueAsNumber);
    if (limitInput) current.push(limitInput.valueAsNumber);
    result.textContent = valid ? scenario.calculate(...current) : "Prüfe die Eingaben.";
    if (chart) {
      chart.figure.hidden = !valid;
      if (valid) chart.update(...current);
    }
  }
  fields.addEventListener("input", update);
  limitInput?.addEventListener("input", update);
  update();
  calculator.append(fields, result);
  if (chart) calculator.append(chart.figure);
  return calculator;
}

const sqlCustomers = new Map([["K01", "Hahn GmbH"], ["K02", "Weller KG"]]);
const sqlOrders = [
  { id: "O101", kunden_id: "K01", status: "offen" },
  { id: "O102", kunden_id: "K02", status: "geliefert" },
  { id: "O103", kunden_id: "K01", status: "offen" }
];

const positionRows = [["O101", "1", "A01"], ["O101", "2", "A02"], ["O103", "1", "A01"]];
const catalog = [
  ["A-1001", "Steuermodul X1", 148.5], ["A-1002", "Sensorbox S2", 89.9],
  ["A-1003", "Bedienpanel P4", 219], ["A-1004", "Leistungsmodul L3", 185],
  ["A-1005", "Steuerplatine C5", 112.4], ["A-1006", "Gehäuse G8", 24.9],
  ["A-1007", "Kabelsatz K2", 18.7], ["A-1008", "Netzteil N7", 76.6],
  ["A-1009", "Displayeinheit D6", 132], ["A-1010", "Temperaturfühler T9", 37.8]
];

export function findCatalogArticle(number) {
  const search = number.toUpperCase();
  const index = catalog.findIndex(([id]) => id === search);
  if (index < 0) return null;
  const [id, label, price] = catalog[index];
  return { id, label, price, row: index + 5 };
}

function scenarioTable(title, columns, rows) {
  const table = document.createElement("table");
  table.createCaption().textContent = title;
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
  return table;
}

function comparisonField(parent, caption, entries) {
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
  parent.append(label);
  return select;
}

function planningReserveLab() {
  const panel = document.createElement("details");
  panel.className = "scenario";
  const summary = document.createElement("summary");
  summary.textContent = "Formeln beim Kopieren vergleichen";
  const intro = document.createElement("p");
  intro.textContent = "Die Formel aus E8 wird nach E9 und E10 kopiert. Sage zuerst voraus, welche Zelle die zweite Formel für die Reserve liest. Wechsle dann zwischen B4 und $B$4.";
  const fields = document.createElement("div");
  fields.className = "scenario-fields";
  const reference = comparisonField(fields, "Bezug in der ersten Formel", [["relative", "B4 · relativ"], ["absolute", "$B$4 · absolut"]]);
  const reserve = comparisonField(fields, "Planungsreserve in B4", [["8", "8 %"], ["12", "12 %"]]);
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const result = document.createElement("div");
  const orders = [[120, 6.5], [80, 8], [150, 6.5]];

  function update() {
    const fixed = reference.value === "absolute";
    const percentage = Number(reserve.value) / 100;
    const rows = orders.map(([quantity, minutes], index) => {
      const row = index + 8;
      const address = fixed ? "$B$4" : "B" + (index + 4);
      const appliedReserve = fixed || index === 0 ? percentage : 0;
      const hours = quantity * minutes / 60 * (1 + appliedReserve);
      return ["E" + row, "=D" + row + "*(1+" + address + ")", number.format(hours) + " h"];
    });
    result.replaceChildren(scenarioTable("Planzeit in der Excel-Vorlage", ["Zelle", "Formel", "Ergebnis"], rows));
    status.textContent = fixed
      ? "Alle drei Formeln lesen die Reserve aus B4. Der Bezug zur Produktionszeit folgt weiterhin der Auftragszeile."
      : "Nur E8 liest die Reserve aus B4. In der Vorlage sind B5 und B6 leer. Excel rechnet dort mit 0 % Reserve.";
  }
  fields.addEventListener("change", update);
  update();
  panel.append(summary, intro, fields, status, result);
  return panel;
}

// From the published pivot workbook, based on quantity × unit price for rows 5–184.
const regionalOrders = [
  { region: "Nord", count: 46, revenue: 112349 },
  { region: "Ost", count: 52, revenue: 110289 },
  { region: "Süd", count: 44, revenue: 106145 },
  { region: "West", count: 38, revenue: 81000 }
];
const lastOrder = { region: "Nord", count: 1, revenue: 27 * 27 };

export function summarizeRegions(metric, includeLastOrder) {
  const rows = regionalOrders.map(region => {
    const omitted = !includeLastOrder && region.region === lastOrder.region ? lastOrder[metric] : 0;
    return [region.region, region[metric] - omitted];
  });
  const total = rows.reduce((sum, [, value]) => sum + value, 0);
  return { rows, total };
}

function pivotLab() {
  const panel = document.createElement("details");
  panel.className = "scenario";
  const summary = document.createElement("summary");
  summary.textContent = "Pivot-Ergebnis kontrollieren";
  const intro = document.createElement("p");
  intro.textContent = "Vergleiche zuerst deine Excel-Auswertung mit der vollständigen Liste. Wechsle dann zu Anzahl und probiere den verkürzten Quellbereich aus.";
  const fields = document.createElement("div");
  fields.className = "scenario-fields";
  const metric = comparisonField(fields, "Wertfeld zusammenfassen", [["revenue", "Summe von Umsatz"], ["count", "Anzahl von Umsatz"]]);
  const range = comparisonField(fields, "Quellbereich im Blatt Daten", [["full", "A4:I184 · vollständig"], ["short", "A4:I183 · ohne letzten Auftrag"]]);
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const result = document.createElement("div");
  function update() {
    const isRevenue = metric.value === "revenue";
    const full = summarizeRegions(metric.value, true);
    const { rows, total } = summarizeRegions(metric.value, range.value === "full");
    const formatter = isRevenue ? euros : number;
    const title = isRevenue ? "Summe von Umsatz" : "Anzahl von Umsatz";
    result.replaceChildren(scenarioTable("Umsatzfeld nach Region", ["Region", title],
      [...rows, ["Gesamtergebnis", total]].map(([region, value]) => [region, formatter.format(value)])));
    const completed = isRevenue
      ? "Die Summe addiert die Auftragsumsätze in Euro."
      : "Anzahl zählt ausgefüllte Umsatzzellen. Jede davon gehört hier zu einem Auftrag.";
    const omitted = isRevenue
      ? euros.format(full.total - total) + " fehlen gegenüber der vollständigen Liste."
      : "Der letzte Auftrag fehlt. Gegenüber der vollständigen Liste fehlt eine ausgefüllte Umsatzzelle.";
    status.textContent = full.total === total ? completed : completed + " " + omitted;
  }
  fields.addEventListener("change", update);
  update();
  panel.append(summary, intro, fields, result, status);
  return panel;
}

const costModels = [["A", 2000, 6], ["B", 800, 9]];

export function costVariants(units) {
  return costModels.map(([name, fixed, rate]) => {
    const variable = units * rate;
    const total = fixed + variable;
    return { name, fixed, variable, total, perUnit: units ? total / units : null };
  });
}

function costLab() {
  const panel = document.createElement("details");
  panel.className = "scenario cost-lab";
  const summary = document.createElement("summary");
  summary.textContent = "Stückkosten bei anderen Mengen prüfen";
  const intro = document.createElement("p");
  intro.textContent = "Vergleiche nach der Excel-Rechnung 200 und 500 Stück. Finde die Menge, bei der beide Varianten gleich viel kosten. Teste auch 0 Stück.";
  const fields = document.createElement("div");
  fields.className = "scenario-fields";
  const label = document.createElement("label");
  label.textContent = "Produktionsmenge in Stück";
  const amount = document.createElement("input");
  amount.type = "number";
  amount.value = "200";
  amount.min = "0";
  amount.max = "1000000";
  amount.step = "1";
  amount.required = true;
  label.append(amount);
  fields.append(label);
  const output = document.createElement("div");
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  function update() {
    if (!amount.validity.valid) {
      output.replaceChildren();
      status.textContent = "Gib eine ganze Menge zwischen 0 und 1.000.000 Stück ein.";
      return;
    }
    const units = amount.valueAsNumber;
    const variants = costVariants(units);
    const rows = [
      ["Fixkosten", "fixed"], ["Variable Kosten gesamt", "variable"], ["Gesamtkosten", "total"], ["Kosten je Stück", "perUnit"]
    ].map(([title, key]) => [title, ...variants.map(variant => variant[key] === null ? "–" : euros.format(variant[key]))]);
    output.replaceChildren(scenarioTable("Kosten bei " + number.format(units) + " Stück", ["Kostenart", "Variante A", "Variante B"], rows));
    const [first, second] = variants;
    const difference = first.total - second.total;
    if (units === 0) {
      status.textContent = "Bei 0 Stück fallen die Fixkosten an. Kosten je Stück lassen sich erst ab 1 Stück berechnen.";
    } else if (difference === 0) {
      status.textContent = "Beide Varianten kosten bei dieser Menge gleich viel.";
    } else {
      const cheaper = difference > 0 ? second : first;
      status.textContent = "Variante " + cheaper.name + " kostet " + euros.format(Math.abs(difference)) + " weniger.";
    }
  }
  amount.addEventListener("input", update);
  update();
  panel.append(summary, intro, fields, output, status);
  return panel;
}

function lookupLab() {
  const panel = document.createElement("details");
  panel.className = "scenario lookup-lab";
  const summary = document.createElement("summary");
  summary.textContent = "Artikelsuche wie mit XVERWEIS ausprobieren";
  const intro = document.createElement("p");
  intro.textContent = "Probiere A-1001 und A-9999 aus. Die Suche liest die Artikelnummer in Spalte A und gibt aus derselben Zeile die Bezeichnung aus B oder den Preis aus C zurück.";
  const form = document.createElement("form");
  const fields = document.createElement("div");
  fields.className = "scenario-fields";
  const label = document.createElement("label");
  label.textContent = "Artikelnummer";
  const input = document.createElement("input");
  input.type = "text";
  input.value = "A-1001";
  input.required = true;
  label.append(input);
  fields.append(label);
  const column = comparisonField(fields, "Rückgabespalte", [["B", "B · Bezeichnung"], ["C", "C · Einzelpreis"]]);
  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = "Artikel suchen";
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const table = scenarioTable("Artikelstamm aus der Excel-Datei", ["Zeile", "Artikel-Nr.", "Bezeichnung", "Einzelpreis"],
    catalog.map(([id, name, price], index) => [index + 5, id, name, euros.format(price)]));

  let highlighted = [];
  function clearResult() {
    for (const cell of highlighted) cell.classList.remove("lookup-match");
    highlighted = [];
    status.textContent = "";
  }
  input.addEventListener("input", clearResult);
  column.addEventListener("change", clearResult);
  form.addEventListener("submit", event => {
    event.preventDefault();
    clearResult();
    const article = findCatalogArticle(input.value);
    if (!article) {
      status.textContent = "Artikel fehlt. Die Artikelnummer wurde in Spalte A nicht gefunden.";
      return;
    }
    const cells = table.tBodies[0].rows[article.row - 5].cells;
    const returnIndex = column.value === "B" ? 2 : 3;
    highlighted = [cells[1], cells[returnIndex]];
    for (const cell of highlighted) cell.classList.add("lookup-match");
    status.textContent = article.id + " in A" + article.row + " gefunden. Aus "
      + column.value + article.row + " kommt " + cells[returnIndex].textContent + ".";
  });
  form.append(fields, button, status);
  panel.append(summary, intro, form, table);
  return panel;
}

function positionLab() {
  const panel = document.createElement("details");
  panel.className = "scenario";
  const summary = document.createElement("summary");
  summary.textContent = "Primärschlüssel an Auftragspositionen testen";
  const intro = document.createElement("p");
  intro.textContent = "Wähle eine Spalte oder eine Kombination. Sage voraus, welche Zeilen denselben Schlüssel hätten.";
  const table = scenarioTable("Auszug aus den Auftragspositionen", ["Auftrag", "Position", "Artikel"], positionRows);
  const fields = document.createElement("div");
  fields.className = "scenario-fields";
  const candidates = [
    ["Position", [1]], ["Auftrag", [0]], ["Artikel", [2]], ["Auftrag und Position", [0, 1]]
  ];
  const choice = comparisonField(fields, "Möglicher Primärschlüssel", candidates.map(([title], index) => [index, title]));
  const form = document.createElement("form");
  const test = document.createElement("button");
  test.type = "submit";
  test.textContent = "Schlüssel testen";
  const result = document.createElement("p");
  result.setAttribute("role", "status");
  choice.addEventListener("change", () => { result.textContent = ""; });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const [, columns] = candidates[choice.selectedIndex];
    const keys = positionRows.map(row => columns.map(index => row[index]).join(" / "));
    const duplicates = [...new Set(keys.filter((key, index) => keys.indexOf(key) !== index))];
    result.textContent = duplicates.length
      ? "Mehrfach vergeben: " + duplicates.join(", ") + ". Diese Auswahl unterscheidet die Zeilen nicht eindeutig."
      : "Eindeutig im Auszug: " + keys.join(", ") + ". In jedem Auftrag darf eine Positionsnummer nur einmal vorkommen.";
  });
  form.append(fields, test, result);
  panel.append(summary, intro, table, form);
  return panel;
}

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
  intro.textContent = "Hier verwendest du dieselben Kunden und Aufträge wie in Einheit 11. Wähle einen Status und eine Verknüpfung und sage die Treffer voraus.";
  const form = document.createElement("form");
  const fields = document.createElement("div");
  fields.className = "scenario-fields";

  const filter = comparisonField(fields, "Status (WHERE)", [["", "Alle"], ["offen", "Offen"], ["geliefert", "Geliefert"]]);
  const join = comparisonField(fields, "Verknüpfung (JOIN)", [
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

    result.replaceChildren(scenarioTable("Treffer der Abfrage", columns, rows));
  });

  updateQuery();
  form.append(fields, preview, run, status, result);
  panel.append(summary, intro, form);
  return panel;
}

export function auditDeliveryRows(rows) {
  const versionsByPosition = new Map();
  const uniqueRows = [];
  let duplicateCount = 0;
  for (const row of rows) {
    const [deliveryNote, position, article, amount] = row;
    const key = deliveryNote + "/" + position;
    const content = article + ";" + amount;
    const versions = versionsByPosition.get(key) ?? new Set();
    if (versions.has(content)) {
      duplicateCount++;
      continue;
    }
    versions.add(content);
    versionsByPosition.set(key, versions);
    uniqueRows.push(row);
  }
  const conflicts = [...versionsByPosition].filter(([, versions]) => versions.size > 1).map(([key]) => key);
  return { rows: uniqueRows, duplicateCount, conflicts };
}

function deliveriesLab(data) {
  const panel = document.createElement("details");
  panel.className = "scenario";
  const summary = document.createElement("summary");
  summary.textContent = "Bereinigung im Browser kontrollieren";
  const intro = document.createElement("p");
  intro.textContent = "Sage zuerst voraus, welche Zeilen du behalten würdest. Vergleiche dann die Originalliste mit einem Fall, in dem für dieselbe Position zwei verschiedene Mengen vorliegen.";
  const fields = document.createElement("div");
  fields.className = "scenario-fields";
  const sample = comparisonField(fields, "Prüffall", [
    ["original", "Originalliste"],
    ["conflict", "Zweite Zeile mit Menge 12 statt 10"]
  ]);
  const form = document.createElement("form");
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Bereinigung prüfen";
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const result = document.createElement("div");
  // The lesson data is a fixed exercise excerpt with unquoted fields.
  const [columns, ...rows] = data.split("\n").map(line => line.split(";"));
  sample.addEventListener("change", () => {
    result.replaceChildren();
    status.textContent = "";
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const input = sample.value === "conflict"
      ? rows.map((row, index) => index === 1 ? [...row.slice(0, 3), "12"] : row)
      : rows;
    const checked = auditDeliveryRows(input);
    const note = checked.conflicts.length
      ? "Widerspruch bei " + checked.conflicts.join(", ") + ". Kläre die Menge anhand des Lieferscheins."
      : "Die Positionen sind nach der Bereinigung eindeutig.";
    const duplicates = checked.duplicateCount === 1 ? "identische Dublette" : "identische Dubletten";
    status.textContent = checked.duplicateCount + " " + duplicates + " entfernt. " + note;
    const display = checked.rows.map(([deliveryNote, position, article, amount]) => [deliveryNote, position, article, amount || "offen"]);
    result.replaceChildren(scenarioTable("Zeilen nach der Dublettenprüfung", columns, display));
  });
  form.append(fields, submit, status, result);
  panel.append(summary, intro, form);
  return panel;
}

function shipmentReportLab() {
  const panel = document.createElement("details");
  panel.className = "scenario";
  const summary = document.createElement("summary");
  summary.textContent = "Versandbericht datensparsam erstellen";
  const intro = document.createElement("p");
  intro.textContent = "Die Logistikleitung braucht nur die Gesamtzahl versandter Stück je Region. Wähle die Felder, die du für diesen Bericht brauchst.";
  const form = document.createElement("form");
  const choices = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.textContent = "Felder im Beispiel-Export";
  choices.append(legend);
  const labels = [["Name", false], ["E-Mail", false], ["Region", true], ["Versandmenge", true]];
  const fields = labels.map(([title, needed]) => {
    const label = document.createElement("label");
    label.className = "answer";
    const input = document.createElement("input");
    input.type = "checkbox";
    label.append(input, document.createTextNode(title));
    choices.append(label);
    return { title, needed, input };
  });
  const check = document.createElement("button");
  check.type = "submit";
  check.textContent = "Feldauswahl prüfen";
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const result = document.createElement("div");
  form.addEventListener("input", () => {
    status.textContent = "";
    result.replaceChildren();
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const missing = fields.filter(({ input, needed }) => needed && !input.checked).map(field => field.title);
    const extra = fields.filter(({ input, needed }) => !needed && input.checked).map(field => field.title);
    const feedback = [];
    if (missing.length) feedback.push("Für die Summe je Region fehlen noch Felder: " + missing.join(", ") + ".");
    if (extra.length) feedback.push("Entferne die für diesen Bericht überflüssigen Felder: " + extra.join(", ") + ".");
    if (feedback.length) {
      status.textContent = feedback.join(" ");
      return;
    }
    status.textContent = "Die Auswahl passt. Im fertigen Bericht steht pro Region nur die Summe der Versandmengen.";
    result.replaceChildren(scenarioTable("Beispielbericht", ["Region", "Versandmenge (Stück)"], [["Nord", 40], ["Süd", 25]]));
  });
  form.append(choices, check, status, result);
  panel.append(summary, intro, form);
  return panel;
}

export function scenarioPanel(id, data) {
  if (id === 1) return planningReserveLab();
  if (id === 3) return lookupLab();
  if (id === 5) return pivotLab();
  if (id === 6) return costLab();
  if (id === 11) return positionLab();
  if (id === 12) return orderLab();
  if (id === 14) return deliveriesLab(data);
  if (id === 16) return shipmentReportLab();
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
    const target = document.createElement("div");
    target.className = "scenario-fields";
    const label = document.createElement("label");
    label.textContent = "Maximale Werbekosten je Bestellung in €";
    const limitInput = document.createElement("input");
    limitInput.type = "number";
    limitInput.value = scenario.limit;
    limitInput.min = 0;
    limitInput.max = 1000000;
    limitInput.step = 0.01;
    limitInput.required = true;
    label.append(limitInput);
    target.append(label);
    panel.append(target);
    for (const [name, values] of scenario.campaigns) {
      const group = document.createElement("fieldset");
      const legend = document.createElement("legend");
      legend.textContent = name;
      group.append(legend, calculatorFields(scenario, values, limitInput));
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
