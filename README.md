# ✨ FlowDo — flow-todo-app

> Make today *amazing.* A simple, inspiring to-do list web app — HNG Stage 1.
> Vanilla HTML + CSS + JS. No build, no framework, no dependencies. Just open `index.html`.

![vanilla](https://img.shields.io/badge/vanilla-HTML%20%2B%20CSS%20%2B%20JS-7c3aed)
![storage](https://img.shields.io/badge/storage-localStorage-ec4899)
![license](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **Rich text tasks** — Bold, italic, underline, strikethrough, bullet lists, highlight (contenteditable + toolbar, sanitized)
- **📅 Calendar / due dates** — date picker, due badges, ⚠️ overdue detection, filter by date, sort by due date
- **🎤 Voice to text** — Web Speech API mic button (best in Chrome)
- **Priority levels** — 🟢 Low / 🟡 Medium / 🔴 High with color-coded borders + filter + sort
- **Status workflow** — 📌 To Do / ⏳ In Progress / ✅ Completed, per-task dropdown + checkbox + filters
- **Inspiring UI** — gradient hero, animated blobs, glassmorphism, progress bar, 🔥 streak, stats cards, dark/light toggle 🌙, celebration message
- **Search, sort, persist** — live search, newest/oldest/due/priority sort, `localStorage` persistence, old-data migration

## 🚀 Quick start

```bash
# option 1: just open it
start index.html
# option 2: serve locally
npx serve .
# then visit http://localhost:3000
```

No install needed.

## 📁 Structure

```
flow-todo-app/
├── index.html   # layout: hero, stats, editor + toolbar, filters, list, footer
├── style.css    # theme vars (:root + [data-theme=dark]), glass UI, badges
├── script.js    # state, render(), filters, voice, streak, theme
├── agent.md     # AI-agent guide: data model, feature map, conventions
└── README.md    # this file
```

## 💾 Data model (`localStorage: todos`)

```js
{ id, createdAt, text, html, dueDate: ''|'YYYY-MM-DD',
  priority: 'low'|'medium'|'high', status: 'todo'|'in-progress'|'completed' }
```

## 🧑‍💻 Contributing

1. Fork / clone, edit `index.html`, `style.css`, `script.js` (keep IDs stable — see `agent.md`)
2. Test: open `index.html`, try add / rich-text edit / voice / date / filters / theme, then reload
3. PR with a clear description + screenshot if UI changed

## 📄 License

MIT — free to use, modify, and share.
