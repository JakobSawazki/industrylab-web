import { lessonImageName, lessons, pointsPerLesson } from "./lessons.mjs";
import { backupFor, mergeProgress, profileStorageKey, readBackup, readProfile, readResponses, responseIds, responseLimit, responsePrefix, storageKey, totalPoints } from "./progress.mjs";

import { extensions, phases, responseFields, units } from "./unterricht.mjs";
import { scenarioPanel } from "./scenarios.mjs";

const find = id => document.getElementById(id);
const cards = find("cards");
const continueLink = find("continue");
const lessonPage = find("lesson");
const lessonHref = id => "./einheit.html?nr=" + id;
const lessonById = new Map(lessons.map(lesson => [lesson.id, lesson]));
const dateFormat = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" });
const filters = [["Alle Themen", 0], ["LF 6 · Produktion", 6], ["LF 7 · Logistik", 7], ["LF 8 · Kosten", 8], ["LF 9 · Marketing", 9]];
const route = new URLSearchParams(location.search);
const requestedField = Number(route.get("lf"));
let activeField = filters.some(([, field]) => field === requestedField) ? requestedField : 0;
let completed = [];
let profile = readProfile();

function element(tag, content, className) {
  const node = document.createElement(tag);
  if (content) node.textContent = content;
  if (className) node.className = className;
  return node;
}

const learningNav = find("learning-nav");
if (learningNav) {
  const summary = learningNav.querySelector("summary");
  const currentLesson = lessonPage ? Number(route.get("nr")) : null;
  const items = lessons.map(lesson => {
    const item = element("li");
    const number = String(lesson.id).padStart(2, "0");
    const link = element("a");
    link.href = lessonHref(lesson.id);
    link.append(element("span", number, "learning-nav-number"), element("span", lesson.title));
    if (lesson.id === currentLesson) link.setAttribute("aria-current", "page");
    item.append(link);
    return item;
  });
  find("learning-nav-units").append(...items);

  document.addEventListener("pointerdown", event => {
    if (learningNav.open && !learningNav.contains(event.target)) learningNav.open = false;
  });
  learningNav.addEventListener("focusout", event => {
    if (event.relatedTarget && !learningNav.contains(event.relatedTarget)) learningNav.open = false;
  });
  learningNav.addEventListener("keydown", event => {
    if (!learningNav.open || event.key !== "Escape") return;
    event.preventDefault();
    learningNav.open = false;
    summary.focus();
  });
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
  if (!cards) return;
  const terms = searchKey(find("search").value).split(/\s+/).filter(Boolean);
  const matching = lessons.filter(lesson => {
    const text = searchKey([lesson.title, lesson.brief, fieldLabel(lesson)].join(" "));
    return (!activeField || lesson.fields.includes(activeField)) && terms.every(term => text.includes(term));
  });

  find("results").textContent = matching.length + (matching.length === 1 ? " Einheit" : " Einheiten");
  const lessonCards = matching.map((lesson, index) => {
    const card = element("article", "", "card");
    const action = element("a", isComplete(lesson.id) ? "Wiederholen" : "Einheit öffnen", "button");
    action.href = lessonHref(lesson.id);
    action.setAttribute("aria-label", action.textContent + " · " + lesson.title);
    const photo = element("img", "", "card-photo");
    photo.alt = "";
    photo.width = 960;
    photo.height = 640;
    photo.loading = index < 3 ? "eager" : "lazy";
    photo.decoding = "async";
    photo.src = "./kapitelbilder/" + lessonImageName(lesson.id);
    card.append(
      photo,
      element("p", "Einheit " + lesson.id + " · " + fieldLabel(lesson) + (isComplete(lesson.id) ? " · Bestanden" : ""), "eyebrow"),
      element("h3", lesson.title),
      element("p", lesson.brief),
      action
    );
    return card;
  });
  cards.replaceChildren(...(lessonCards.length ? lessonCards : [element("p", "Zu deiner Suche gibt es keine passenden Themen.")]));
}

function refresh() {
  const points = totalPoints(completed);
  find("top-points").textContent = points + " EP";
  find("top-points").setAttribute("aria-label", "Lernprofil öffnen · " + points + " EP");
  find("profile-progress").max = lessons.length;
  find("profile-progress").value = completed.length;
  find("balance").textContent = points + " EP · " + completed.length + " von " + lessons.length + " Aufgabenchecks bestanden";
  if (continueLink) {
    const next = lessons.find(lesson => !isComplete(lesson.id));
    const shouldResume = completed.length > 0 && next;
    find("done").textContent = completed.length;
    find("count").textContent = " / " + lessons.length;
    find("progress").max = lessons.length;
    find("progress").value = completed.length;
    continueLink.href = shouldResume ? lessonHref(next.id) : "./lernpfad.html";
    continueLink.textContent = completed.length === 0 ? "Lernpfad starten ↗" : next ? "Weiterlernen ↗" : "Themen wiederholen ↗";
  }

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

function drawLessonPlan(unit, extras) {
  const plan = find("lesson-plan");
  const schedule = element("ul", "", "lesson-schedule");
  for (const [minutes, phase] of phases) schedule.append(element("li", minutes + " Min. · " + phase));

  const steps = element("ol", "", "lesson-steps");
  for (const step of unit.steps) steps.append(element("li", step));

  const hint = element("details", "", "lesson-hint");
  hint.append(element("summary", "Tipp anzeigen"), element("p", unit.hint));
  plan.replaceChildren(
    element("h2", "Arbeitsauftrag"),
    element("p", unit.goal),
    element("h3", "Ablauf · 45 Minuten"),
    schedule,
    element("h3", "Ausgangsdaten"),
    element("p", unit.data, "lesson-data"),
    element("h3", "Arbeitsschritte"),
    steps,
    element("p", "Ergebnis: " + unit.result),
    hint
  );
  for (const { minutes, title, data, steps, result } of extras) {
    const exercise = element("details", "", "lesson-hint");
    const instructions = element("ol", "", "lesson-steps");
    for (const step of steps) instructions.append(element("li", step));
    exercise.append(
      element("summary", "Zusatzaufgabe · " + minutes + " Min. · " + title),
      element("p", data, "lesson-data"),
      instructions,
      element("p", "Ergebnis: " + result)
    );
    plan.append(exercise);
  }
}

const pendingResponses = new Map();
const visibleResponses = new Map();

function responseValue(id) {
  if (pendingResponses.has(id)) return pendingResponses.get(id);
  try {
    return localStorage.getItem(responsePrefix + id) ?? "";
  } catch {
    return "";
  }
}

function saveResponse(id, value) {
  try {
    if (value.trim()) localStorage.setItem(responsePrefix + id, value);
    else localStorage.removeItem(responsePrefix + id);
    pendingResponses.delete(id);
    return true;
  } catch {
    pendingResponses.set(id, value);
    return false;
  }
}

function restoreResponseFields() {
  for (const [id, input] of visibleResponses) {
    if (input !== document.activeElement) input.value = responseValue(id);
  }
}

window.addEventListener("storage", event => {
  if (event.key === null || event.key.startsWith(responsePrefix)) restoreResponseFields();
});

function drawResponses(lessonId) {
  const panel = find("lesson-responses");
  const status = element("p", "", "response-status");
  status.setAttribute("role", "status");
  panel.append(
    element("h2", "Deine Arbeitsergebnisse"),
    element("p", "Halte hier deine Ergebnisse fest. Der Browser speichert sie beim Schreiben. Über das Disketten-Icon kannst du sie zusammen mit deinem Lernstand mitnehmen.")
  );
  for (const [key, title, prompt] of responseFields[lessonId]) {
    const id = lessonId + "-" + key;
    const group = element("div", "", "response-field");
    const label = element("label", title);
    label.htmlFor = "antwort-" + id;
    const hint = element("p", prompt);
    hint.id = "antwort-hinweis-" + id;
    const answer = element("textarea");
    answer.id = label.htmlFor;
    answer.setAttribute("aria-describedby", hint.id);
    answer.maxLength = responseLimit;
    answer.rows = lessonId === 12 && key === "sql" ? 6 : 3;
    answer.value = responseValue(id);
    answer.addEventListener("input", () => {
      const saved = saveResponse(id, answer.value);
      status.textContent = saved
        ? "Änderung in diesem Browser gespeichert."
        : "Speichern im Browser fehlgeschlagen. Lade über das Disketten-Icon eine Sicherung herunter.";
    });
    answer.addEventListener("blur", restoreResponseFields);
    visibleResponses.set(id, answer);
    group.append(label, hint, answer);
    panel.append(group);
  }
  panel.append(status);
}

function showLesson(lesson) {
  document.title = lesson.title + " – IndustryLab";
  find("lesson-label").textContent = "Einheit " + lesson.id + " · " + fieldLabel(lesson);
  find("lesson-title").textContent = lesson.title;
  find("lesson-brief").textContent = lesson.brief;
  const photo = find("lesson-photo");
  photo.alt = lesson.imageAlt;
  photo.src = "./kapitelbilder/" + lessonImageName(lesson.id);
  find("lesson-files").replaceChildren(lesson.files.length
    ? downloadLinks(lesson)
    : []);

  const excel = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 15, 17].includes(lesson.id);
  const workspace = find("lesson-workspace");
  workspace.append(element("p", excel ? "Du arbeitest mit Excel und dieser Seite." : "Du arbeitest auf dieser Seite."));
  if (excel) {
    const help = element("details");
    help.append(
      element("summary", "Browser und Excel nebeneinander öffnen"),
      element("p", "Öffne Excel. Wechsle zum Browser und drücke Windows-Taste + Pfeil links. Wähle dann Excel für die rechte Bildschirmhälfte. Mit Windows-Taste + Pfeil rechts kannst du Excel auch selbst rechts andocken.")
    );
    workspace.append(help);
  }
  drawLessonPlan(units[lesson.id], extensions[lesson.id] ?? []);
  find("scenario").replaceChildren(scenarioPanel(lesson.id));
  drawResponses(lesson.id);

  const questions = [lesson.check, lesson.transfer];
  const groups = questions.map(({ prompt, choices }, questionIndex) => {
    const name = "answer-" + questionIndex;
    const options = element("fieldset");
    const feedback = element("p", "", "quiz-feedback");
    feedback.id = "quiz-feedback-" + questionIndex;
    options.setAttribute("aria-describedby", feedback.id);
    options.append(element("legend", (questionIndex + 1) + ". " + prompt));
    choices.forEach((choice, index) => {
      const label = element("label", "", "answer");
      const input = element("input");
      input.type = "radio";
      input.name = name;
      input.value = index;
      input.required = true;
      label.append(input, element("span", choice));
      options.append(label);
    });
    options.append(feedback);
    return { name, options, feedback };
  });

  const submit = element("button", "Antworten prüfen");
  submit.type = "submit";
  const result = element("p");
  result.setAttribute("role", "status");
  const form = find("quiz");
  form.replaceChildren(
    element("h2", "Aufgabencheck · " + pointsPerLesson + " EP"),
    element("p", "Beantworte beide Fragen richtig, um den Check zu bestehen."),
    ...groups.map(({ options }) => options),
    submit,
    result
  );
  form.onchange = event => {
    const group = groups.find(({ name }) => name === event.target.name);
    if (group) group.feedback.textContent = "";
    result.textContent = "";
  };
  form.onsubmit = event => {
    event.preventDefault();
    const answers = new FormData(form);
    if (groups.some(({ name }) => !answers.has(name))) return;

    const toReview = [];
    groups.forEach(({ name, feedback }, index) => {
      const question = questions[index];
      const correct = Number(answers.get(name)) === question.correct;
      feedback.textContent = (correct ? "Richtig. " : "Noch nicht richtig. ") + question.feedback;
      if (!correct) toReview.push(index + 1);
    });
    if (toReview.length) {
      result.textContent = toReview.length === 2
        ? "Prüfe beide Antworten und versuche es erneut."
        : "Prüfe deine Antwort auf Frage " + toReview[0] + " und versuche es erneut.";
      return;
    }

    const alreadyComplete = isComplete(lesson.id);
    const saved = saveProgress([{ id: lesson.id, at: new Date().toISOString() }]);
    const reward = alreadyComplete ? "Die EP wurden bereits gutgeschrieben." : "+" + pointsPerLesson + " EP.";
    result.textContent = "Aufgabencheck bestanden. " + reward
      + (saved ? "" : " Der Browser konnte den Lernstand nicht speichern. Lade eine Sicherung herunter.");
    for (const { options } of groups) options.disabled = true;
    submit.disabled = true;
    refresh();
  };

  const index = lessons.indexOf(lesson);
  for (const [direction, neighbor] of [["← Vorherige Einheit", lessons[index - 1]], ["Nächste Einheit →", lessons[index + 1]]]) {
    if (!neighbor) continue;
    const link = element("a", direction + " · " + neighbor.title);
    link.href = lessonHref(neighbor.id);
    find("lesson-neighbors").append(link);
  }
  lessonPage.hidden = false;
}

if (cards) {
  for (const [label, field] of filters) {
    const button = element("button", label);
    button.type = "button";
    button.setAttribute("aria-pressed", String(field === activeField));
    button.addEventListener("click", () => {
      activeField = field;
      const url = new URL(location.href);
      if (field) url.searchParams.set("lf", field);
      else url.searchParams.delete("lf");
      history.replaceState(history.state, "", url);
      for (const filter of find("filters").children) filter.setAttribute("aria-pressed", String(filter === button));
      drawCards();
    });
    find("filters").append(button);
  }
  find("search").addEventListener("input", drawCards);
}

const downloads = find("downloads");
if (downloads) {
  for (const lesson of lessons.filter(lesson => lesson.files.length)) {
    const row = element("li");
    row.append(element("strong", lesson.title), downloadLinks(lesson));
    downloads.append(row);
  }
}

const profileDialog = find("profile");
const profileFields = { studentCode: find("student-code"), className: find("class-name") };

try {
  const stored = localStorage.getItem(profileStorageKey);
  if (stored) profile = readProfile(JSON.parse(stored));
} catch {
  find("profile-status").textContent = "Das gespeicherte Profil konnte nicht geladen werden.";
}

function saveProfile(nextProfile) {
  for (const [key, field] of Object.entries(profileFields)) {
    if (field.value === profile[key]) field.value = nextProfile[key];
  }
  profile = nextProfile;
  try {
    localStorage.setItem(profileStorageKey, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

function openProfile() {
  if (profileDialog.open) return;
  for (const [key, field] of Object.entries(profileFields)) field.value = profile[key];
  profileDialog.showModal();
}

find("top-points").addEventListener("click", openProfile);
find("open-progress").addEventListener("click", openProfile);
find("close-profile").addEventListener("click", () => profileDialog.close());
find("profile-form").addEventListener("submit", event => {
  event.preventDefault();
  const nextProfile = readProfile(Object.fromEntries(new FormData(event.currentTarget)));
  const saved = saveProfile(nextProfile);
  for (const [key, field] of Object.entries(profileFields)) field.value = profile[key];
  find("profile-status").textContent = saved
    ? "Profil gespeichert."
    : "Der Browser konnte das Profil nicht dauerhaft speichern. Du kannst eine Sicherung speichern.";
});

function exportBackup() {
  const responses = Object.fromEntries(responseIds.map(id => [id, responseValue(id)]));
  const data = JSON.stringify(backupFor(completed, profile, responses), null, 2);
  const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
  const link = element("a");
  link.href = url;
  link.download = "IndustryLab-Lernstand.json";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

for (const id of ["export", "quick-export"]) {
  find(id).addEventListener("click", exportBackup);
}
for (const id of ["import", "quick-import"]) {
  find(id).addEventListener("click", () => find("backup-file").click());
}
find("backup-file").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;
  openProfile();
  try {
    if (file.size > 500000) throw new Error("Die Sicherungsdatei ist zu groß.");
    let payload;
    try {
      payload = JSON.parse(await file.text());
    } catch {
      throw new Error("Die Datei enthält kein lesbares JSON.");
    }
    const entries = readBackup(payload);
    const imported = readProfile(payload.profile);
    const responses = readResponses(payload.responses);
    const nextProfile = {
      studentCode: profile.studentCode || imported.studentCode,
      className: profile.className || imported.className
    };
    const savedProfile = (nextProfile.studentCode === profile.studentCode && nextProfile.className === profile.className)
      || saveProfile(nextProfile);
    let savedResponses = true;
    for (const [id, answer] of Object.entries(responses)) {
      if (!responseValue(id).trim()) savedResponses = saveResponse(id, answer) && savedResponses;
    }
    restoreResponseFields();
    const saved = saveProgress(entries) && savedProfile && savedResponses;
    refresh();
    find("backup-status").textContent = saved
      ? "Sicherung geladen. Dein Lernstand, leere Profilfelder und leere Antwortfelder wurden ergänzt."
      : "Sicherung geladen. Der Browser konnte die Daten nicht vollständig speichern.";
  } catch (error) {
    find("backup-status").textContent = error.message;
  } finally {
    event.target.value = "";
    find("backup-status").focus();
  }
});

function openLinkedProfile() {
  if (location.hash === "#fortschritt") openProfile();
}

window.addEventListener("hashchange", openLinkedProfile);
window.addEventListener("pageshow", event => {
  if (!event.persisted) return;
  restoreResponseFields();
  try {
    completed = mergeProgress(completed, savedProgress());
    const stored = localStorage.getItem(profileStorageKey);
    if (stored) profile = readProfile(JSON.parse(stored));
    refresh();
  } catch {
    find("backup-status").textContent = "Der Browser konnte den gespeicherten Stand nicht aktualisieren.";
  }
});

refresh();
if (continueLink && location.hash === "#lernfelder") location.replace("./lernpfad.html");
openLinkedProfile();
if (lessonPage) {
  const lesson = lessonById.get(Number(route.get("nr")));
  if (lesson) showLesson(lesson);
  else find("lesson-unavailable").hidden = false;
} else if (cards) {
  const lesson = lessonById.get(Number(route.get("aufgabe")));
  if (lesson) location.replace(lessonHref(lesson.id) + location.hash);
}
