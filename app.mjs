import { lessons, pointsPerLesson } from "./lessons.mjs";
import { backupFor, mergeProgress, readBackup, storageKey, totalPoints } from "./progress.mjs";

import { scenarioPanel } from "./scenarios.mjs";

const find = id => document.getElementById(id);
const lessonById = new Map(lessons.map(lesson => [lesson.id, lesson]));
const dateFormat = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" });
const filters = [["Alle Themen", 0], ["LF 6 · Produktion", 6], ["LF 7 · Logistik", 7], ["LF 8 · Kosten", 8], ["LF 9 · Marketing", 9]];
let activeField = 0;
let completed = [];

function element(tag, content, className) {
  const node = document.createElement(tag);
  if (content) node.textContent = content;
  if (className) node.className = className;
  return node;
}

function savedProgress() {
  const raw = localStorage.getItem(storageKey);
  return raw ? readBackup(JSON.parse(raw)) : [];
}

try {
  completed = savedProgress();
} catch {
  find("backup-status").textContent = "Der gespeicherte Lernstand konnte nicht geladen werden. Du kannst eine Sicherung laden.";
}

function saveProgress(entries) {
  completed = mergeProgress(completed, entries);
  try {
    completed = mergeProgress(completed, savedProgress());
  } catch {
    // A valid new backup can replace a damaged local record.
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify(backupFor(completed)));
    return true;
  } catch {
    return false;
  }
}

window.addEventListener("storage", event => {
  if (event.key !== storageKey || !event.newValue) return;
  try {
    completed = mergeProgress(completed, readBackup(JSON.parse(event.newValue)));
    refresh();
  } catch {
    find("backup-status").textContent = "Eine Änderung aus einem anderen Tab konnte nicht geladen werden.";
  }
});

function isComplete(id) {
  return completed.some(entry => entry.id === id);
}

function fieldLabel(lesson) {
  return "LF " + lesson.fields.join(" / ");
}

function downloadLinks(lesson) {
  const links = element("div", "", "downloads");
  for (const file of lesson.files) {
    const link = element("a", file.label, "download");
    link.href = "./downloads/" + encodeURIComponent(file.name);
    link.download = file.name;
    link.setAttribute("aria-label", file.label + " herunterladen · " + lesson.title);
    links.append(link);
  }
  return links;
}

function searchKey(text) {
  return text.toLocaleLowerCase("de-DE").normalize("NFD").replace(/\p{M}/gu, "");
}

function drawCards() {
  const terms = searchKey(find("search").value).split(/\s+/).filter(Boolean);
  const matching = lessons.filter(lesson => {
    const text = searchKey([lesson.title, lesson.brief, fieldLabel(lesson)].join(" "));
    return (!activeField || lesson.fields.includes(activeField)) && terms.every(term => text.includes(term));
  });

  find("results").textContent = matching.length + " Themen gefunden";
  const cards = matching.map(lesson => {
    const card = element("article", "", "card");
    const action = element("button", isComplete(lesson.id) ? "Wiederholen" : "Übung öffnen");
    action.type = "button";
    action.dataset.lessonId = lesson.id;
    action.setAttribute("aria-label", action.textContent + " · " + lesson.title);
    action.addEventListener("click", () => showLesson(lesson));
    card.append(
      element("p", fieldLabel(lesson) + (isComplete(lesson.id) ? " · Bestanden" : ""), "eyebrow"),
      element("h3", lesson.title),
      element("p", lesson.brief),
      action
    );
    return card;
  });
  find("cards").replaceChildren(...(cards.length ? cards : [element("p", "Zu deiner Suche gibt es keine passenden Themen.")]));
}

function refresh() {
  const points = totalPoints(completed);
  find("top-points").textContent = points + " EP";
  find("done").textContent = completed.length;
  find("count").textContent = " / " + lessons.length;
  find("progress").max = lessons.length;
  find("progress").value = completed.length;
  find("balance").textContent = points + " EP · " + completed.length + " von " + lessons.length + " Aufgabenchecks bestanden";
  find("continue").textContent = completed.length === 0 ? "Lernpfad starten ↗" : completed.length === lessons.length ? "Themen wiederholen ↗" : "Weiterlernen ↗";

  const rows = completed.slice().reverse().map(entry => {
    const row = element("li");
    const time = element("time", dateFormat.format(new Date(entry.at)));
    time.dateTime = entry.at;
    row.append(element("strong", lessonById.get(entry.id).title), time, element("span", "+" + pointsPerLesson + " EP"));
    return row;
  });
  find("ledger").replaceChildren(...(rows.length ? rows : [element("li", "Deine bestandenen Aufgabenchecks erscheinen hier.")]));
  drawCards();
}

let lastLessonId;
function showLesson(lesson) {
  lastLessonId = lesson.id;
  const { prompt, choices, correct, feedback } = lesson.check;
  find("lesson-label").textContent = fieldLabel(lesson);
  find("lesson-title").textContent = lesson.title;
  find("lesson-brief").textContent = lesson.brief;
  find("lesson-files").replaceChildren(lesson.files.length
    ? downloadLinks(lesson)
    : element("p", "Für dieses Thema gibt es einen Aufgabencheck. Unterrichtsdateien folgen."));

  find("scenario").replaceChildren(scenarioPanel(lesson.id));

  const options = element("fieldset");
  options.append(element("legend", prompt));
  choices.forEach((choice, index) => {
    const label = element("label", "", "answer");
    const input = element("input");
    input.type = "radio";
    input.name = "answer";
    input.value = index;
    input.required = true;
    label.append(input, element("span", choice));
    options.append(label);
  });

  const submit = element("button", "Antwort prüfen");
  submit.type = "submit";
  const result = element("p");
  result.setAttribute("role", "status");
  const form = find("quiz");
  form.replaceChildren(options, submit, result);
  form.onsubmit = event => {
    event.preventDefault();
    const answer = new FormData(form).get("answer");
    if (answer === null) return;
    if (Number(answer) !== correct) {
      result.textContent = "Noch nicht richtig. " + feedback + " Versuche es noch einmal.";
      return;
    }
    const alreadyComplete = isComplete(lesson.id);
    const saved = saveProgress([{ id: lesson.id, at: new Date().toISOString() }]);
    const reward = alreadyComplete ? "Bereits abgeschlossen." : "+" + pointsPerLesson + " EP.";
    result.textContent = "Richtig. " + feedback + " " + reward
      + (saved ? "" : " Der Browser konnte den Lernstand nicht speichern. Lade eine Sicherung herunter.");
    options.disabled = true;
    submit.disabled = true;
    refresh();
  };

  find("lesson").showModal();
  find("lesson-title").focus();
}

find("close").addEventListener("click", () => find("lesson").close());
find("lesson").addEventListener("close", () => {
  const trigger = find("cards").querySelector('[data-lesson-id="' + lastLessonId + '"]');
  (trigger || find("continue")).focus();
});

find("continue").addEventListener("click", event => {
  const next = lessons.find(lesson => !isComplete(lesson.id));
  if (!completed.length || !next) return;
  event.preventDefault();
  showLesson(next);
});

for (const [label, field] of filters) {
  const button = element("button", label);
  button.type = "button";
  button.setAttribute("aria-pressed", String(field === activeField));
  button.addEventListener("click", () => {
    activeField = field;
    for (const filter of find("filters").children) filter.setAttribute("aria-pressed", String(filter === button));
    drawCards();
  });
  find("filters").append(button);
}

find("search").addEventListener("input", drawCards);

for (const lesson of lessons.filter(lesson => lesson.files.length)) {
  const row = element("li");
  row.append(element("strong", lesson.title), downloadLinks(lesson));
  find("downloads").append(row);
}

find("export").addEventListener("click", () => {
  const data = JSON.stringify(backupFor(completed), null, 2);
  const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
  const link = element("a");
  link.href = url;
  link.download = "IndustryLab-Lernstand.json";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

find("import").addEventListener("click", () => find("backup-file").click());
find("backup-file").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 100000) throw new Error("Die Sicherungsdatei ist zu groß.");
    let payload;
    try {
      payload = JSON.parse(await file.text());
    } catch {
      throw new Error("Die Datei enthält kein lesbares JSON.");
    }
    const saved = saveProgress(readBackup(payload));
    refresh();
    find("backup-status").textContent = saved
      ? "Sicherung geladen. Dein bisheriger Lernstand wurde ergänzt."
      : "Sicherung geladen. Der Browser konnte den Lernstand nicht dauerhaft speichern.";
  } catch (error) {
    find("backup-status").textContent = error.message;
  } finally {
    event.target.value = "";
  }
});

refresh();
