# Drawing Board Demo

# 🖌️ React Canvas Drawing App

This is a simple yet powerful canvas drawing application built with **React**, **React Router**, **TypeScript**, and **React-Konva**. It allows users to:

- Log in and manage their own drawing projects
- Create multiple pages within each project
- Use drawing tools like brush, eraser, shapes, arrows, and text
- Undo/redo, layer reordering, and zoom in/out
- Persist projects to `localStorage` based on user

---

## 🚀 Features

- 🧑‍🎨 Multiple drawing tools (brush, eraser, rectangle, circle, triangle, arrow, text)
- 🧠 Layer control (undo, redo, bring forward, send backward)
- 🔍 Zoom control
- 💾 User-specific project persistence with `localStorage`
- 🗂️ Multi-page support within each project

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git https://github.com/tsailing0113/drawing-board-demo
cd drawing-board-demo
```

### 2. Install dependencies

```bash
npm install
```
or
```bash
yarn
```

### 3. Start the development server
```bash
npm run dev
```
or
```bash
yarn dev
```

## 🗂️ Project Structure
```bash
src/
├── components/
│   ├── CanvasPage.tsx         # Drawing canvas logic using react-konva
│   └── Toolbar.tsx            # Toolbar for selecting tools, color, thickness
├── pages/
│   ├── Login.tsx              # Username-based login screen
│   ├── ProjectList.tsx        # Project dashboard per user
│   └── DrawingBoard.tsx       # Main editor view for a single project
├── utils/
│   └── localStorage.ts        # Load/save project data for each user
├── App.tsx                    # Main app with routing
└── main.tsx                   # Entry point

```

## ✅Usage
Visit `/` to log in with a username (mock auth).

Create a new project with a title.

Use the toolbar to draw and switch tools.

Use Undo / Redo / Layer ordering.

Projects are saved automatically to `localStorage` per user.

## 📦 Built With

- [**React**](https://reactjs.org/) - Frontend library for building user interfaces
- [**TypeScript**](https://www.typescriptlang.org/) - Strongly typed JavaScript
- [**React-Konva**](https://konvajs.org/docs/react/) - Declarative canvas rendering using Konva + React
- [**Vite**](https://vitejs.dev/) - Fast frontend build tool and dev server
- [**Tailwind CSS**](https://tailwindcss.com/) - Utility-first CSS framework for styling
- [**React Router**](https://reactrouter.com/) - Declarative routing for React apps


## Link
https://tsailing0113.github.io/drawing-board-demo

## How to Run

```bash
npm install
npm start
```

## How to Deploy

```bash
npm run deploy
```

## Mock Account
```bash
account: admin
password: 1234

account: wendy
password: 5678
```


