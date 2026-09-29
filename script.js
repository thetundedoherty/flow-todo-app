const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const dateInput = document.getElementById('todo-date');
const priorityInput = document.getElementById('todo-priority');
const statusInput = document.getElementById('todo-status');
const list = document.getElementById('todo-list');
const countEl = document.getElementById('count');
const clearBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('search');
const priorityFilter = document.getElementById('priority-filter');
const sortBy = document.getElementById('sort-by');
const calendarFilter = document.getElementById('calendar-filter');
const clearDateBtn = document.getElementById('clear-date');
const micBtn = document.getElementById('mic-btn');
const voiceStatus = document.getElementById('voice-status');
const themeBtn = document.getElementById('theme-btn');
const todayLine = document.getElementById('today-line');
const quoteEl = document.getElementById('quote');
const newQuoteBtn = document.getElementById('new-quote');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');
const streakEl = document.getElementById('streak');
const statTotal = document.getElementById('stat-total');
const statProgress = document.getElementById('stat-progress');
const statDone = document.getElementById('stat-done');
const statOverdue = document.getElementById('stat-overdue');
const celebrateEl = document.getElementById('celebrate');
const addBtn = document.getElementById('add-btn');
const cancelEditBtn = document.getElementById('cancel-edit');
const hiliteBtn = document.getElementById('hilite-btn');
let editingId = null;

// Migrate old data (completed boolean, plain text) to rich html
let todos = JSON.parse(localStorage.getItem('todos')) || [];
todos = todos.map((t) => {
  if (!t.status) t.status = t.completed ? 'completed' : 'todo';
  if (!t.priority) t.priority = 'medium';
  if (!('dueDate' in t)) t.dueDate = '';
  if (!t.createdAt) t.createdAt = t.id;
  if (!t.html) t.html = escapeHtml(t.text || '');
  if (!t.text) t.text = stripTags(t.html || '');
  delete t.completed;
  return t;
});

let statusFilter = 'all';
let searchText = '';
let priorityFilterValue = 'all';
let sortValue = 'newest';
let dateFilter = '';

function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
  updateStreak();
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function stripTags(html) {
  const d = document.createElement('div');
  d.innerHTML = html || '';
  return (d.textContent || '').trim();
}
function sanitizeHtml(html) {
  const d = document.createElement('div');
  d.innerHTML = html || '';
  d.querySelectorAll('script, style, iframe, object, embed, form, input, button').forEach((n) => n.remove());
  d.querySelectorAll('*').forEach((el) => {
    [...el.attributes].forEach((a) => {
      if (a.name.startsWith('on')) el.removeAttribute(a.name);
    });
    const tag = el.tagName.toLowerCase();
    if (!['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'mark', 'ul', 'ol', 'li', 'br', 'div', 'p', 'span'].includes(tag)) {
      el.replaceWith(document.createTextNode(el.textContent));
    }
  });
  return d.innerHTML;
}

const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };
const PRIORITY_LABEL = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' };
const STATUS_LABEL = { todo: '📌 To Do', 'in-progress': '⏳ In Progress', completed: '✅ Completed' };

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(todo) {
  if (!todo.dueDate || todo.status === 'completed') return false;
  const today = new Date(); today.setHours(0,0,0,0);
  return new Date(todo.dueDate + 'T00:00:00') < today;
}

function getFiltered() {
  let result = todos.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilterValue !== 'all' && t.priority !== priorityFilterValue) return false;
    if (dateFilter && t.dueDate !== dateFilter) return false;
    if (searchText && !t.text.toLowerCase().includes(searchText)) return false;
    return true;
  });
  result.sort((a, b) => {
    if (sortValue === 'oldest') return a.createdAt - b.createdAt;
    if (sortValue === 'due') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (sortValue === 'priority') return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
    return b.createdAt - a.createdAt;
  });
  return result;
}

const QUOTES = [
  'Small steps every day lead to big results.',
  'Done is better than perfect.',
  'Focus on progress, not perfection.',
  'Your future self will thank you.',
  'Start where you are. Use what you have.',
  'Discipline is choosing what you want most.'
];
function randomQuote() { quoteEl.textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)]; }
function updateStreak() {
  const key = new Date().toDateString();
  const last = localStorage.getItem('flowdo_last_day');
  let streak = parseInt(localStorage.getItem('flowdo_streak') || '0', 10);
  if (last !== key) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    streak = last === y.toDateString() ? streak + 1 : 1;
    localStorage.setItem('flowdo_last_day', key);
    localStorage.setItem('flowdo_streak', String(streak));
  }
  streakEl.textContent = `🔥 ${streak}-day streak`;
}

function render() {
  list.innerHTML = '';
  const filtered = getFiltered();
  const doneCount = todos.filter((t) => t.status === 'completed').length;
  const pct = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;
  progressFill.style.width = pct + '%';
  progressText.textContent = pct + '% complete • ' + doneCount + '/' + todos.length + ' done';
  statTotal.textContent = todos.length;
  statProgress.textContent = todos.filter((t) => t.status !== 'completed').length;
  statDone.textContent = doneCount;
  statOverdue.textContent = todos.filter(isOverdue).length;
  celebrateEl.classList.toggle('hidden', !(todos.length && doneCount === todos.length));
  if (filtered.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = searchText || dateFilter || statusFilter !== 'all' ? 'Nothing matches — try clearing filters ✨' : 'No tasks yet. Add your first win above ✨';
    list.appendChild(li);
  }
  filtered.forEach((todo) => {
    const li = document.createElement('li');
    li.className = `priority-${todo.priority} status-${todo.status}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.status === 'completed';
    checkbox.title = 'Toggle completed';
    checkbox.addEventListener('change', () => toggleTodo(todo.id));
    const main = document.createElement('div');
    main.className = 'task-main';
    const span = document.createElement('div');
    span.className = 'task-text';
    span.innerHTML = sanitizeHtml(todo.html || escapeHtml(todo.text || ''));
    span.title = 'Double-click to edit';
    span.addEventListener('dblclick', () => editTodo(todo.id));
    const meta = document.createElement('div');
    meta.className = 'task-meta';
    const prio = document.createElement('span');
    prio.className = `badge ${todo.priority}`;
    prio.textContent = PRIORITY_LABEL[todo.priority] || todo.priority;
    meta.appendChild(prio);
    if (todo.dueDate) {
      const due = document.createElement('span');
      due.className = isOverdue(todo) ? 'badge overdue' : 'badge due';
      due.textContent = (isOverdue(todo) ? '⚠️ Overdue: ' : '📅 ') + formatDate(todo.dueDate);
      meta.appendChild(due);
    }
    main.appendChild(span);
    main.appendChild(meta);
    const statusSelect = document.createElement('select');
    statusSelect.className = 'status-select';
    statusSelect.title = 'Change status';
    ['todo', 'in-progress', 'completed'].forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = STATUS_LABEL[s];
      if (todo.status === s) opt.selected = true;
      statusSelect.appendChild(opt);
    });
    statusSelect.addEventListener('change', () => setStatus(todo.id, statusSelect.value));
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.className = 'icon-btn';
    editBtn.title = 'Edit (rich text)';
    editBtn.addEventListener('click', () => editTodo(todo.id));
    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.className = 'delete-btn';
    delBtn.addEventListener('click', () => deleteTodo(todo.id));
    li.appendChild(checkbox);
    li.appendChild(main);
    li.appendChild(statusSelect);
    li.appendChild(editBtn);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
  const activeCount = todos.filter((t) => t.status !== 'completed').length;
  countEl.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} left`;
}

function addTodo(html, dueDate, priority, status) {
  const clean = sanitizeHtml(html || '');
  const plain = stripTags(clean);
  if (!plain) return;
  const now = Date.now();
  todos.push({ id: now, createdAt: now, text: plain, html: clean, dueDate: dueDate || '', priority: priority || 'medium', status: status || 'todo' });
  save();
  render();
}

function toggleTodo(id) {
  todos = todos.map((t) => (t.id === id ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed' } : t));
  save();
  render();
}

function setStatus(id, status) {
  todos = todos.map((t) => (t.id === id ? { ...t, status } : t));
  save();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  save();
  render();
}

function editTodo(id) {
  const todo = todos.find((t) => t.id === id);
  editingId = id;
  input.innerHTML = sanitizeHtml(todo.html || escapeHtml(todo.text || ''));
  dateInput.value = todo.dueDate || '';
  priorityInput.value = todo.priority || 'medium';
  statusInput.value = todo.status || 'todo';
  addBtn.textContent = 'Save ✦';
  cancelEditBtn.classList.remove('hidden');
  input.focus();
}
function cancelEdit() {
  editingId = null;
  input.innerHTML = '';
  addBtn.textContent = 'Add ✦';
  cancelEditBtn.classList.add('hidden');
}

let recognition = null;
let listening = false;
function setupVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    micBtn.disabled = true;
    micBtn.title = 'Voice not supported (try Chrome)';
    return;
  }
  recognition = new SR();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    input.textContent += (input.textContent ? ' ' : '') + transcript;
    input.focus();
  };
  recognition.onend = () => {
    listening = false;
    micBtn.classList.remove('listening');
    voiceStatus.classList.add('hidden');
  };
  recognition.onerror = (e) => {
    listening = false;
    micBtn.classList.remove('listening');
    voiceStatus.classList.add('hidden');
    alert('Voice error: ' + e.error);
  };
}
micBtn.addEventListener('click', () => {
  if (!recognition) { alert('Voice input not supported. Try Chrome.'); return; }
  if (listening) { recognition.stop(); return; }
  listening = true;
  micBtn.classList.add('listening');
  voiceStatus.classList.remove('hidden');
  recognition.start();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (editingId) {
    const clean = sanitizeHtml(input.innerHTML);
    const plain = stripTags(clean);
    if (!plain) return;
    todos = todos.map((t) => (t.id === editingId ? { ...t, html: clean, text: plain, dueDate: dateInput.value, priority: priorityInput.value, status: statusInput.value } : t));
    cancelEdit();
  } else {
    addTodo(input.innerHTML, dateInput.value, priorityInput.value, statusInput.value);
    input.innerHTML = '';
  }
  dateInput.value = '';
  priorityInput.value = 'medium';
  statusInput.value = 'todo';
  input.focus();
});
cancelEditBtn.addEventListener('click', cancelEdit);

clearBtn.addEventListener('click', () => {
  todos = todos.filter((t) => t.status !== 'completed');
  save();
  render();
});

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    statusFilter = btn.dataset.filter;
    render();
  });
});

searchInput.addEventListener('input', () => {
  searchText = searchInput.value.trim().toLowerCase();
  render();
});
priorityFilter.addEventListener('change', () => {
  priorityFilterValue = priorityFilter.value;
  render();
});
sortBy.addEventListener('change', () => {
  sortValue = sortBy.value;
  render();
});
calendarFilter.addEventListener('change', () => {
  dateFilter = calendarFilter.value;
  render();
});
clearDateBtn.addEventListener('click', () => {
  calendarFilter.value = '';
  dateFilter = '';
  render();
});

document.querySelectorAll('.toolbar [data-cmd]').forEach((btn) => {
  btn.addEventListener('click', () => {
    input.focus();
    document.execCommand(btn.dataset.cmd, false, null);
  });
});
hiliteBtn.addEventListener('click', () => {
  input.focus();
  document.execCommand('hiliteColor', false, '#fef08a');
});
newQuoteBtn.addEventListener('click', randomQuote);
themeBtn.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = dark ? '' : 'dark';
  themeBtn.textContent = dark ? '🌙' : '☀️';
  localStorage.setItem('flowdo_theme', dark ? '' : 'dark');
});
if (localStorage.getItem('flowdo_theme') === 'dark') {
  document.documentElement.dataset.theme = 'dark';
  themeBtn.textContent = '☀️';
}
todayLine.textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

setupVoice();
save();
render();
