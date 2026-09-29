# agent.md — FlowDo (HNG Stage 1 To-Do App)

> Instructions for AI agents working on this repo. Keep it simple: no build, no framework, no deps.

## 1. Project overview
- Name: FlowDo — "Make today amazing."
- Type: Single-page vanilla web app (HTML + CSS + JS).
- Run: open `index.html` directly in browser (double-click). No server/build needed.
- Storage: `localStorage` only. Keys: `todos`, `flowdo_theme`, `flowdo_streak`, `flowdo_last_day`.
- Browser APIs used: `contenteditable` + `document.execCommand` (rich text), Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`, Chrome best), `<input type="date">` (calendar).

## 2. File structure
```
index.html  — layout: bg blobs, topbar, hero, stats, todo-form (toolbar+editor), controls, list, footer
style.css   — theme via CSS vars (:root + [data-theme="dark"]), glass card, blobs, badges, responsive @520px
script.js   — all state + rendering + events, single <script> at end of body
agent.md    — this file
```

## 3. Data model (localStorage `todos`)
```js
{ id: number, createdAt: number, text: string, html: string,
  dueDate: '' | 'YYYY-MM-DD', priority: 'low'|'medium'|'high',
  status: 'todo'|'in-progress'|'completed' }
```
- `text` = plain text (search/sort/count). `html` = sanitized rich HTML (render).
- Migration on load: fills missing `status/priority/dueDate/createdAt/html/text`, deletes legacy `completed` boolean.

## 4. Features map (where to edit)
| Feature | HTML id | JS function | CSS |
|---|---|---|---|
| Rich text editor | `#todo-input` (contenteditable), `.toolbar [data-cmd]`, `#hilite-btn` | `sanitizeHtml/escapeHtml/stripTags`, toolbar listeners | `#todo-input`, `.toolbar`, `.task-text mark/ul` |
| Add/Edit | `#todo-form`, `#add-btn`, `#cancel-edit`, `editingId` | `addTodo/editTodo/cancelEdit`, form submit | — |
| Priority | `#todo-priority`, `#priority-filter` | `PRIORITY_ORDER/LABEL`, `getFiltered`, sort `priority` | `li.priority-*`, `.badge.high/med/low` |
| Status | `#todo-status`, `.filter-btn[data-filter]`, `.status-select` | `setStatus/toggleTodo`, `STATUS_LABEL` | `.badge.todo/in-progress/completed` |
| Calendar/due | `#todo-date`, `#calendar-filter`, `#clear-date` | `formatDate/isOverdue`, `dateFilter`, sort `due` | `.badge.due/.overdue` |
| Voice | `#mic-btn`, `#voice-status` | `setupVoice` (SpeechRecognition) | `#mic-btn.listening`, pulse |
| Search/sort | `#search`, `#sort-by` | `searchText/sortValue` in `getFiltered` | — |
| Inspire UI | `#today-line/#quote/#new-quote`, `#progress-*`, `#streak`, stats ids, `#celebrate`, `#theme-btn` | `QUOTES/randomQuote`, `updateStreak`, progress in `render()`, theme toggle | `.bg/.blob`, `.hero`, `.stats`, dark vars |

## 5. Key conventions
- Single `render()` re-renders `#todo-list` + stats + progress; call `save()` then `render()` after every mutation.
- Filters state: `statusFilter, priorityFilterValue, sortValue, dateFilter, searchText` — combined in `getFiltered()`.
- Sanitizer allowlist: `b,strong,i,em,u,s,strike,mark,ul,ol,li,br,div,p,span`; strips `script/style/iframe/object/embed/form/input/button` + `on*` attrs. Keep in sync for editor + list.
- IDs are stable hooks — don't rename without updating all 3 files.
- No new dependencies without asking. Keep vanilla + ≤6000-char edits.

## 6. Common tasks
- New filter: add button/select in `.controls`, add state var, extend `getFiltered()`, re-render.
- New badge: add span in `render()` meta block + `.badge.*` class in style.css.
- Theming: edit `:root` vars + `[data-theme="dark"]` override; toggle via `documentElement.dataset.theme`.
- Verify: reopen `index.html`, test add/edit/voice/date/filter/theme + reload (persistence).
