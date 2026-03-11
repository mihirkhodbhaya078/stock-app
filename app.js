/**
 * To-Do List Application
 * Vanilla JS • localStorage persistence • No frameworks
 */

// ─── Constants ────────────────────────────────────────────
const STORAGE_KEY = 'todo_tasks';

// ─── State ────────────────────────────────────────────────
/** @type {{ id: string, text: string, completed: boolean, createdAt: string }[]} */
let tasks = [];

/** @type {'all' | 'active' | 'completed'} */
let currentFilter = 'all';

// ─── DOM References ───────────────────────────────────────
const form        = document.getElementById('add-task-form');
const input       = document.getElementById('add-task-input');
const taskList    = document.getElementById('task-list');
const emptyState  = document.getElementById('empty-state');
const taskCounter = document.getElementById('task-counter');
const clearBtn    = document.getElementById('clear-completed-btn');
const filterBtns  = document.querySelectorAll('.filter-btn');

// ─── Persistence ──────────────────────────────────────────

/** Load tasks from localStorage. */
function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    tasks = stored ? JSON.parse(stored) : [];
  } catch {
    tasks = [];
  }
}

/** Save current tasks array to localStorage. */
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ─── Task Helpers ─────────────────────────────────────────

/** Generate a unique ID, preferring the browser crypto API. */
function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: combine timestamp + random for older environments
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create a new task object.
 * @param {string} text
 * @returns {{ id: string, text: string, completed: boolean, createdAt: string }}
 */
function createTask(text) {
  return {
    id: generateId(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

/** Get tasks visible under the current filter. */
function getFilteredTasks() {
  if (currentFilter === 'active')    return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t =>  t.completed);
  return tasks;
}

// ─── Rendering ────────────────────────────────────────────

/** Re-render the entire task list based on current state & filter. */
function render() {
  const filtered = getFilteredTasks();

  // Clear current list
  taskList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.add('visible');
  } else {
    emptyState.classList.remove('visible');
    const fragment = document.createDocumentFragment();
    filtered.forEach(task => fragment.appendChild(buildTaskElement(task)));
    taskList.appendChild(fragment);
  }

  updateCounter();
  updateFilterButtons();
}

/**
 * Build a <li> element for a task.
 * @param {{ id: string, text: string, completed: boolean }} task
 * @returns {HTMLLIElement}
 */
function buildTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item${task.completed ? ' completed' : ''}`;
  li.dataset.id = task.id;

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`);
  checkbox.addEventListener('change', () => toggleTask(task.id));

  // Task text span (double-click to edit)
  const span = document.createElement('span');
  span.className = 'task-text';
  span.textContent = task.text;
  span.setAttribute('title', 'Double-click to edit');
  span.addEventListener('dblclick', () => startEditing(task.id, li, span));

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'task-delete-btn';
  deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
  deleteBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`;
  deleteBtn.addEventListener('click', () => deleteTask(task.id, li));

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteBtn);

  return li;
}

/** Update the "X items left" counter. */
function updateCounter() {
  const active = tasks.filter(t => !t.completed).length;
  taskCounter.textContent = `${active} item${active !== 1 ? 's' : ''} left`;
}

/** Highlight the active filter button. */
function updateFilterButtons() {
  filterBtns.forEach(btn => {
    const isActive = btn.dataset.filter === currentFilter;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

// ─── Actions ──────────────────────────────────────────────

/** Add a new task from the input field. */
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const task = createTask(trimmed);
  tasks.unshift(task); // newest first
  saveTasks();
  render();
  input.value = '';
}

/**
 * Toggle the completed state of a task.
 * @param {string} id
 */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  render();
}

/**
 * Animate and remove a task from the list and state.
 * @param {string} id
 * @param {HTMLLIElement} li
 */
function deleteTask(id, li) {
  li.classList.add('removing');
  li.addEventListener('animationend', () => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }, { once: true });
}

/** Remove all completed tasks. */
function clearCompleted() {
  const completedItems = taskList.querySelectorAll('.task-item.completed');

  if (completedItems.length === 0) return;

  // Animate each completed item then remove from state
  let remaining = completedItems.length;
  completedItems.forEach(li => {
    li.classList.add('removing');
    li.addEventListener('animationend', () => {
      remaining--;
      if (remaining === 0) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        render();
      }
    }, { once: true });
  });
}

// ─── Inline Editing ───────────────────────────────────────

/**
 * Replace the task text span with an input for inline editing.
 * @param {string} id
 * @param {HTMLLIElement} li
 * @param {HTMLSpanElement} span
 */
function startEditing(id, li, span) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'task-edit-input';
  editInput.value = task.text;
  editInput.maxLength = 200;
  editInput.setAttribute('aria-label', 'Edit task text');

  li.replaceChild(editInput, span);
  editInput.focus();
  editInput.select();

  /** Commit the edit. */
  function commitEdit() {
    const newText = editInput.value.trim();
    if (!newText) {
      // Empty text: restore original without saving
      render();
      return;
    }
    if (newText !== task.text) {
      task.text = newText;
      saveTasks();
    }
    render();
  }

  editInput.addEventListener('blur', commitEdit);
  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (!editInput.value.trim()) {
        // Prevent commit with empty text; visual cue via shake animation
        editInput.style.animation = 'none';
        requestAnimationFrame(() => { editInput.style.animation = 'shake 0.3s ease'; });
        e.preventDefault();
        return;
      }
      editInput.blur();
    }
    if (e.key === 'Escape') { editInput.value = task.text; editInput.blur(); }
  });
}

// ─── Event Listeners ──────────────────────────────────────

// Submit form (Enter key or click)
form.addEventListener('submit', e => {
  e.preventDefault();
  addTask(input.value);
});

// Filter tabs
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    render();
  });
});

// Clear completed
clearBtn.addEventListener('click', clearCompleted);

// ─── Initialise ───────────────────────────────────────────
loadTasks();
render();
