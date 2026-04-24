const STORAGE_KEY = "notes-app-data-v1";

const form = document.querySelector("#note-form");
const titleInput = document.querySelector("#note-title");
const descriptionInput = document.querySelector("#note-description");
const notesList = document.querySelector("#notes-list");
const noteTemplate = document.querySelector("#note-template");

let notes = loadNotes();
let storageEnabled = true;

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((note) => typeof note?.id === "string");
  } catch (error) {
    storageEnabled = false;
    console.warn("LocalStorage недоступен, используем данные только в памяти.", error);
    return [];
  }
}

function persistNotes() {
  if (!storageEnabled) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    storageEnabled = false;
    console.warn("Не удалось сохранить в LocalStorage.", error);
  }
}

function renderNotes() {
  notesList.innerHTML = "";
  notes.forEach((note) => {
    const noteElement = createNoteElement(note);
    notesList.append(noteElement);
  });
}

function createNoteElement(note) {
  const noteElement = noteTemplate.content.firstElementChild.cloneNode(true);
  const titleElement = noteElement.querySelector(".note-title");
  const descriptionElement = noteElement.querySelector(".note-description");
  const detailsElement = noteElement.querySelector(".note-details");
  const openButton = noteElement.querySelector(".open-btn");
  const editButton = noteElement.querySelector(".edit-btn");
  const deleteButton = noteElement.querySelector(".delete-btn");

  titleElement.textContent = note.title;
  descriptionElement.textContent = note.description || "Описание отсутствует.";

  openButton.addEventListener("click", () => {
    const isHidden = detailsElement.classList.contains("hidden");
    detailsElement.classList.toggle("hidden", !isHidden);
    openButton.textContent = isHidden ? "Закрыть" : "Открыть";
  });

  editButton.addEventListener("click", () => {
    titleInput.value = note.title;
    descriptionInput.value = note.description;
    titleInput.focus();

    notes = notes.filter((item) => item.id !== note.id);
    persistNotes();
    renderNotes();
  });

  deleteButton.addEventListener("click", () => {
    notes = notes.filter((item) => item.id !== note.id);
    persistNotes();
    renderNotes();
  });

  return noteElement;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) {
    titleInput.focus();
    return;
  }

  const newNote = {
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    title,
    description
  };

  notes.unshift(newNote);
  persistNotes();
  renderNotes();

  form.reset();
  titleInput.focus();
});

renderNotes();
