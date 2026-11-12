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

export function campaignMetrics(clicks, orders, spend) {
  if (orders > clicks) return "Die Zahl der Bestellungen darf in diesem Beispiel die Klickzahl nicht überschreiten.";
  const conversion = clicks ? number.format(100 * orders / clicks) + " %" : "–";
  const costPerOrder = orders ? euros.format(spend / orders) : "–";
  return "Conversion Rate " + conversion + " · Kosten je Bestellung " + costPerOrder;
}

const scenarios = {
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
    title: "Kampagnenkennzahlen ausprobieren",
    fields: [["Klicks", 1200, 0, 1], ["Bestellungen", 36, 0, 1], ["Werbekosten in €", 540, 0, 0.01]],
    calculate: campaignMetrics
  }
};

export function scenarioPanel(id) {
  const panel = document.createElement("details");
  const scenario = scenarios[id];
  if (!scenario) {
    panel.hidden = true;
    return panel;
  }

  panel.className = "scenario";
  const summary = document.createElement("summary");
  summary.textContent = scenario.title;
  const fields = document.createElement("div");
  fields.className = "scenario-fields";
  const result = document.createElement("p");
  result.setAttribute("role", "status");
  const inputs = scenario.fields.map(([caption, value, minimum, step]) => {
    const label = document.createElement("label");
    label.textContent = caption;
    const input = document.createElement("input");
    input.type = "number";
    input.value = value;
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
  panel.append(summary, fields, result);
  return panel;
}
