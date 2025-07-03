"use strict";

(() => {
  const dialog = document.querySelector("[data-dialog]");
  const dialogCloseButton = document.querySelector(
    "[data-dialog-close-button]"
  );
  const noteForm = document.querySelector("[data-note-form]");
  const addNoteButton = document.querySelector("[data-add-note-button]");
  const cancelNoteButton = document.querySelector("[data-cancel-note-button]");
  const notesContainer = document.querySelector("[data-notes-container]");

  let notes = [];
  let editingNoteId = null;

  const escapeHtml = (text) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  const loadNotes = () => JSON.parse(localStorage.getItem("notes") ?? "[]");
  const saveNotes = () => localStorage.setItem("notes", JSON.stringify(notes));

  const renderNotes = () => {
    if (notes.length === 0) {
      notesContainer.innerHTML = `
        <div class="empty-state">
          <h2>No notes yet</h2>
          <p>Create your first note to get started!</p>
          <button class="button button-primary" data-add-note-button>+ Add Your First Note</button>
        </div>
      `;
      return;
    }

    notesContainer.innerHTML = notes
      .map(
        (note) => `
      <div class="note" data-note data-note-id="${note.id}">
        <h3 class="note-title" data-note-title>${escapeHtml(note.title)}</h3>
        <p class="note-description" data-note-description>${escapeHtml(
          note.description
        )}</p>
        <div class="note-actions">
          <button
            class="button-edit-note"
            title="Edit Note"
            aria-label="Edit Note"
            data-note-action="edit"
          >
            <svg width="16" height="16" aria-hidden="true">
              <use href="assets/icons.svg#edit"></use>
            </svg>
          </button>
          <button
            class="button-delete-note"
            title="Delete Note"
            aria-label="Delete Note"
            data-note-action="delete"
          >
            <svg width="16" height="16" aria-hidden="true">
              <use href="assets/icons.svg#delete"></use>
            </svg>
          </button>
        </div>
      </div>
      `
      )
      .join("");
  };

  const addNote = (note) => {
    const newNote = {
      id: String(Date.now()),
      title: note.title,
      description: note.description,
    };
    notes.unshift(newNote);
    saveNotes();
    renderNotes();
  };

  const updateNote = (note) => {
    notes = notes.map((currentNote) =>
      currentNote.id === note.id
        ? { ...currentNote, title: note.title, description: note.description }
        : currentNote
    );
    saveNotes();
    renderNotes();
  };

  const deleteNote = (noteItem) => {
    notes = notes.filter(
      (currentNote) => currentNote.id !== noteItem.dataset.noteId
    );
    saveNotes();
    renderNotes();
  };

  const editNote = (noteItem) => {
    editingNoteId = noteItem.dataset.noteId;
    noteForm.querySelector("input[name=title]").value =
      noteItem.querySelector("[data-note-title]").textContent;
    noteForm.querySelector("textarea[name=description]").value =
      noteItem.querySelector("[data-note-description]").textContent;
  };

  const openDialog = () => {
    const title = document.querySelector("[data-dialog-title]");
    if (editingNoteId) {
      title.textContent = "Edit Note";
    } else {
      title.textContent = "Add New Note";
    }
    dialog.showModal();
  };

  const closeDialog = () => {
    if (editingNoteId) {
      editingNoteId = null;
    }
    noteForm.reset();
    dialog.close();
  };

  notesContainer.addEventListener("click", (event) => {
    const target = event.target;
    const actionButton = target.closest("[data-note-action]");
    const addButton = target.closest("[data-add-note-button]");

    if (actionButton == null && addButton == null) {
      return;
    }

    if (addButton) {
      return openDialog();
    }

    const noteItem = target.closest("[data-note]");
    switch (actionButton.dataset.noteAction) {
      case "edit":
        editNote(noteItem);
        openDialog();
        break;
      case "delete":
        deleteNote(noteItem);
        break;
      default:
        return;
    }
  });

  noteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(noteForm);
    const data = Object.fromEntries(formData.entries());
    if (editingNoteId == null) {
      addNote(data);
    } else {
      updateNote({ id: editingNoteId, ...data });
      editingNoteId = null;
    }
    closeDialog();
  });

  addNoteButton.addEventListener("click", openDialog);
  cancelNoteButton.addEventListener("click", closeDialog);
  dialogCloseButton.addEventListener("click", closeDialog);

  notes = loadNotes();
  renderNotes();
})();
