# 🎓 Lumina Study OS

> A comprehensive, modern, all-in-one productivity and study workstation built for students and engineers. Featuring Pomodoro focus timer, lo-fi ambient audio, virtual co-working study rooms, Windows File Explorer-style study drive notes manager, SM-2 active recall flashcards, and study analytics.

---

## ✨ Key Features

### 1. ⏳ Pomodoro Focus Engine
- Customizable Pomodoro modes (**Focus**, **Short Break**, **Long Break**).
- Subject-tracked study logging with live time accumulation.
- Audio cues & study streak tracking.

### 2. 🎵 Ambient & Lo-Fi Soundstage
- Floating persistent background audio player.
- Multi-channel ambient mixer (**Rain**, **Café**, **Binaural Beats**, **White Noise**, **Forest**).
- Synthesized custom tones & curated lo-fi chill beats.

### 3. 👥 Virtual Study Rooms & Social Co-Working
- Join active study rooms with real-time peer presence indicators.
- Live room chat with emoji reactions & encouragement nudges.
- Global studier leaderboard, friend requests, and direct messaging.

### 4. 🗂️ Windows File Explorer Notes & Document System
- **Strict Course Hierarchy**:
  - `This PC > Study Drive (C:) > [Subjects] > [Folders / Subfolders] > [Files & Notes]`
  - Top-level **Subjects** represent university courses (Distinguished with academic badges & theme colors).
  - Normal folders are created strictly inside their respective subjects.
- **Windows 11 Explorer Interface**:
  - Address bar with clickable segmented breadcrumbs.
  - Multi-view modes: **Details Table**, **Large Icons**, and **Tiles**.
  - Sortable by Name, Date modified, Type, and File size.
  - Instant file search & filtering.
  - Drag-and-drop direct file upload zone with visual drop targets.
  - Context menu (**Right Click** for Rename, Delete, Download, and Schedule Revision).
- **Rich Document Editor**:
  - Word-style typography toolbar (Bold, Italic, Headings, Highlights).
  - Real-time auto-saving to local study vault.
  - One-click `.txt` document export.
- **Multi-Format Attachment Support**:
  - PDF preview modal with in-browser pagination.
  - DOCX Word document HTML parser (`mammoth.js`).
  - Text, Markdown, CSV, JSON, and image files.

### 5. 🧠 SM-2 Spaced Repetition Flashcards & Smart Revision
- SuperMemo-2 algorithm for optimized memory retention.
- Active recall difficulty ratings (Again, Hard, Good, Easy).
- 3D card flip animation & progress statistics.

### 6. 📊 Study Analytics & Performance Heatmap
- Daily and weekly study target tracking.
- Subject breakdown visual progress bars.
- GitHub-style study streak activity matrix.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 6+](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Document Parsing**: [Mammoth.js](https://github.com/mwilliamson/mammoth.js) (DOCX to HTML)
- **Effects**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Storage Layer**: LocalStorage + IndexedDB (with Cloudflare R2 / S3 configuration support)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser to view the app.

4. **Build for Production**:
   ```bash
   npm run build
   ```

5. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

## 📁 Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── components/         # Modular UI components
│   │   ├── analytics/      # Performance dashboards & study stats
│   │   ├── audio/          # Lo-Fi player & ambient sound mixer
│   │   ├── common/         # Modals, buttons, badges, navigation header
│   │   ├── flashcards/     # Spaced repetition review deck & card creator
│   │   ├── notes/          # File explorer, folder tree, rich editor, modals
│   │   ├── pomodoro/       # Focus timer, session logging, break alerts
│   │   ├── revision/       # Spaced revision scheduler & calendar
│   │   └── rooms/          # Virtual study rooms, peer list, chat, leaderboard
│   ├── context/            # React Context state providers (App, Timer, Audio, Room, Router)
│   ├── services/           # SM-2 algorithm, R2 storage, sound synthesis
│   ├── types/              # TypeScript interface definitions
│   ├── utils/              # Seed data, text formatting, date helpers
│   ├── App.tsx             # Root application shell
│   ├── index.css           # Tailwind CSS & design system tokens
│   └── main.tsx            # Application entry point
├── index.html              # HTML entry template
├── package.json            # Dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

---

## 🤝 Contributing & Collaborating

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - feel free to use and adapt it for your own study needs!
