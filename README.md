# Git Surgery & Conflict 3D Simulator

An interactive, visual, zero-risk simulation workbench for complex Git operations: interactive rebase, 3-way merge conflict resolution, cherry-picking, and reflog time-travel.

![Git Surgery 3D Simulator](https://img.shields.io/badge/Vibe_Code-Git_Surgery_3D-6366f1?style=for-the-badge)
![HTML5 / Vanilla CSS / Modern JS](https://img.shields.io/badge/Stack-HTML5%20%7C%20Vanilla%20CSS%20%7C%20ES6-38bdf8?style=for-the-badge)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-10b981?style=for-the-badge)

---

## ⚡ The Problem It Solves

Merge conflicts, interactive rebases, detached HEADs, and squashing commits are among the most stress-inducing workflows for developers. One wrong `--force` or improper hard reset can wipe unpushed work.

**Git Surgery 3D Simulator** eliminates the fear by giving developers a **tactile visual sandbox**:
1. Visually stage and rehearse complex operations on a live **3D isometric DAG commit graph**.
2. Resolve **3-way code collisions** interactively (`Accept Current`, `Accept Incoming`, or `Accept Both`).
3. Reorder, squash, or drop commits in an **interactive rebase surgery rack**.
4. Automatically generate verified, safe terminal command sequences with reflog safety nets.

---

## 🚀 Key Features

- **3D Isometric & 2D DAG Visualizer**:
  - Live commit directed acyclic graph rendered with glowing neon nodes and cubic Bezier branch links.
  - Interactive tilt angle slider and 3D depth toggles (`rotateX` / `rotateZ` isometric projection).
  - Smooth mouse panning and wheel zooming.
  - Live branch pointers (`main`, `feature/auth`, `HEAD`).

- **Interactive Rebase Surgery Tray (`git rebase -i`)**:
  - Drag-and-drop commit staging cards to reorder history.
  - Action selector dropdowns for each commit: `pick`, `reword`, `squash`, `fixup`, `drop`.
  - Step-by-step playback simulation that dynamically recalculates DAG hashes and parent lineage.

- **3-Way Conflict Surgery Module**:
  - Live diff viewer displaying `<<<<<<< HEAD`, `=======`, and `>>>>>>> incoming`.
  - 1-click surgical resolution buttons:
    - **Accept Current (HEAD)**
    - **Accept Incoming**
    - **Accept Both (Hybrid Synthesis)**
  - Instantly generates the clean merge commit with dual parent lines.

- **Reflog Time Machine & Cherry-Picker**:
  - Inspect local reflog history entries (`HEAD@{n}`).
  - 1-click rescue of orphaned commits after accidental `git reset --hard`.
  - Pluck any individual commit node from one branch into another.

- **Safe Terminal Command Generator**:
  - Every action continuously compiles the exact bash commands with risk ratings:
    - `SAFE (Zero Risk)`
    - `CAUTION (Force Push / History Rewrite)`
  - Instant 1-click clipboard copy button.

- **Built-in Panic Missions**:
  1. *Rebase Collision (Merge Conflict on Auth)*
  2. *Emergency: Accidental Commit on Main*
  3. *Surgery: Squash 4 Messy Commits for PR*
  4. *Time Travel: Detached HEAD & Reflog Rescue*
  5. *Freeform Sandbox: Custom DAG Experiment*

- **Web Audio UI Synthesizer**:
  - Procedural sound effects for node clicks, branch commits, conflict warnings, and resolution chords.
  - Audio mute toggle in the top navigation bar.

---

## 🛠️ How to Run

Zero build steps or npm installations needed!

Simply open `index.html` in your browser:

```bash
# Option 1: Directly open in default browser on Windows
start index.html

# Option 2: Run with any local static server (e.g. npx serve or python)
npx -y serve .
# or
python -m http.server 8080
```

---

## 🎨 Design System

- **Obsidian Dark Palette**: `#07090e`, `#0d121c`, `#131b2a`
- **Neon Glow Accents**:
  - Cyan (`#38bdf8`)
  - Indigo / Violet (`#6366f1`)
  - Rose / Pink (`#f43f5e`)
  - Emerald (`#10b981`)
  - Amber (`#f59e0b`)
- **Glassmorphism**: `backdrop-filter: blur(16px)` with subtle border highlights
- **Typography**: Google Fonts Inter & JetBrains Mono
- **Standards Compliance**: Native `<dialog closedby="any">` with backward compatibility fallback.
