(() => {
  const themeKey = "industrylab.theme";
  const appearanceKey = "industrylab.appearance.v1";
  const root = document.documentElement;
  const system = matchMedia("(prefers-color-scheme: dark)");
  const groups = {
    text: {
      label: "Schriftfarbe",
      choices: {
        standard: { label: "Standard", light: ["#142b40"], dark: ["#eff6fc"] },
        neutral: { label: "Neutral", light: ["#23272e", "#424951"], dark: ["#f5f5f4", "#c8cdd1"] },
        warm: { label: "Warm", light: ["#3f2b20", "#554238"], dark: ["#fff1dc", "#e0cdbc"] }
      },
      tokens: ["ink", "muted"]
    },
    background: {
      label: "Hintergrund",
      choices: {
        standard: { label: "Stahlblau", light: ["#b5cde0"], dark: ["#102539"] },
        graphite: {
          label: "Graphit",
          light: ["#c6cbd1", "#f4f6f7", "#e0e4e8", "#e2e5eaf0", "#30384230", "#ffffff62"],
          dark: ["#1b1e24", "#262b32", "#1b1f25", "#1b1e24ed", "#070b1290", "#39445440"]
        },
        petrol: {
          label: "Petrol",
          light: ["#bedbd7", "#f1f9f7", "#dceeea", "#cde7e0eb", "#1d585339", "#f0fffb72"],
          dark: ["#102f30", "#183838", "#102b2c", "#0d3535c9", "#031919a3", "#3b786d45"]
        }
      },
      tokens: ["metal-base", "surface", "inset", "metal-wash", "metal-shade", "metal-sheen"]
    },
    accent: {
      label: "Akzentfarbe",
      choices: {
        standard: { label: "Kupfer", light: ["#ffc47c"], dark: ["#ffc47c"] },
        ice: {
          label: "Eisblau",
          light: ["#b8deff", "#174d78", "#174d78", "#245e8d"],
          dark: ["#b8deff", "#b8deff", "#b8deff", "#b8deff"]
        },
        mint: {
          label: "Mint",
          light: ["#a8efd4", "#155943", "#155943", "#187258"],
          dark: ["#a8efd4", "#a8efd4", "#a8efd4", "#a8efd4"]
        }
      },
      tokens: ["accent", "edge", "link", "focus"]
    },
    size: {
      label: "Schriftgröße",
      choices: { standard: { label: "Standard" }, large: { label: "Groß" }, extra: { label: "Sehr groß" } }
    }
  };

  let choice;
  try {
    const saved = localStorage.getItem(themeKey);
    if (saved === "light" || saved === "dark") choice = saved;
  } catch {
    // The switch also works when the browser blocks storage.
  }

  function loadAppearance() {
    try {
      return JSON.parse(localStorage.getItem(appearanceKey)) ?? {};
    } catch {
      return {};
    }
  }

  function validOption(group, value) {
    return typeof value === "string" && Object.hasOwn(groups[group].choices, value) ? value : "standard";
  }

  const savedAppearance = loadAppearance();
  const colorsFor = mode => ({
    text: validOption("text", savedAppearance[mode]?.text),
    background: validOption("background", savedAppearance[mode]?.background),
    accent: validOption("accent", savedAppearance[mode]?.accent)
  });
  const appearance = {
    light: colorsFor("light"),
    dark: colorsFor("dark"),
    size: validOption("size", savedAppearance.size)
  };

  const currentTheme = () => choice ?? (system.matches ? "dark" : "light");

  function applyAppearance() {
    const mode = currentTheme();
    root.dataset.theme = mode;
    root.dataset.fontSize = appearance.size;
    for (const [group, selected] of Object.entries(appearance[mode])) {
      const { choices, tokens } = groups[group];
      tokens.forEach((token, index) => {
        const property = "--" + token;
        if (selected === "standard") root.style.removeProperty(property);
        else root.style.setProperty(property, choices[selected][mode][index]);
      });
    }
    document.getElementById("theme-toggle")?.setAttribute("aria-pressed", String(mode === "dark"));
  }

  applyAppearance();
  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("theme-toggle");
    const opener = document.getElementById("appearance-toggle");
    const dialog = document.getElementById("appearance");
    const fields = document.getElementById("appearance-fields");
    const modeLabel = document.getElementById("appearance-mode");
    const status = document.getElementById("appearance-status");
    applyAppearance();
    toggle.hidden = false;
    opener.hidden = false;

    function persistAppearance(message = "") {
      applyAppearance();
      try {
        localStorage.setItem(appearanceKey, JSON.stringify(appearance));
        status.textContent = message;
      } catch {
        status.textContent = "Die Einstellungen gelten in diesem Tab. Der Browser konnte sie nicht speichern.";
      }
    }

    function drawOptions() {
      const mode = currentTheme();
      modeLabel.textContent = mode === "dark" ? "Dunkelmodus" : "Hellmodus";
      const rows = Object.entries(groups).map(([group, { label, choices }]) => {
        const fieldset = document.createElement("fieldset");
        fieldset.className = "appearance-group";
        const legend = document.createElement("legend");
        legend.textContent = label;
        const options = document.createElement("div");
        options.className = group === "size" ? "appearance-choices appearance-sizes" : "appearance-choices";
        for (const [value, option] of Object.entries(choices)) {
          const label = document.createElement("label");
          label.className = "appearance-option";
          label.title = option.label;
          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = group;
          radio.value = value;
          radio.checked = value === (group === "size" ? appearance.size : appearance[mode][group]);
          const tile = document.createElement("span");
          const caption = document.createElement("span");
          caption.textContent = option.label;
          if (group !== "size") {
            tile.className = "appearance-swatch";
            tile.style.setProperty("--swatch", option[mode][0]);
            caption.className = "sr-only";
          }
          tile.append(caption);
          label.append(radio, tile);
          options.append(label);
        }
        fieldset.append(legend, options);
        return fieldset;
      });
      fields.replaceChildren(...rows);
    }

    function onThemeChange() {
      applyAppearance();
      if (dialog.open) drawOptions();
    }

    toggle.addEventListener("click", () => {
      choice = currentTheme() === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(themeKey, choice);
      } catch {
        // Retain the selection in this tab.
      }
      onThemeChange();
    });
    system.addEventListener("change", onThemeChange);

    opener.addEventListener("click", () => {
      status.textContent = "";
      drawOptions();
      dialog.showModal();
      document.getElementById("appearance-title").focus();
    });

    fields.addEventListener("change", ({ target }) => {
      const { name, value } = target;
      if (!Object.hasOwn(groups, name)) return;
      const selected = validOption(name, value);
      if (name === "size") appearance.size = selected;
      else appearance[currentTheme()][name] = selected;
      persistAppearance();
    });

    document.getElementById("reset-appearance").addEventListener("click", () => {
      const mode = currentTheme();
      for (const group of Object.keys(appearance[mode])) appearance[mode][group] = "standard";
      appearance.size = "standard";
      persistAppearance("Farben für diesen Modus und Schriftgröße wurden zurückgesetzt.");
      drawOptions();
    });

    for (const id of ["close-appearance", "done-appearance"]) {
      document.getElementById(id).addEventListener("click", () => dialog.close());
    }
  });
})();
