# ⚡ HyperGit — Next-Generation Spatial Control Plane & Visual Command Deck for Git

A modern, high-precision developer tool that **connects directly to your real local Git repositories**. It visualizes your commit history in sleek spatial swimlanes, provides an interactive CLI terminal to run **any** Git command, and includes an AI Doctor and 1-click 3-Way Conflict Resolver.

![HyperGit Real-Time Dashboard](https://img.shields.io/badge/Status-Connected_to_Real_Git-10b981?style=for-the-badge)
![Zero Dependencies](https://img.shields.io/badge/Python_3-Standard_Library_Only-38bdf8?style=for-the-badge)
![Pure Vanilla Web Stack](https://img.shields.io/badge/Frontend-HTML5_%7C_Vanilla_CSS_%7C_ES6-6366f1?style=for-the-badge)

---

## ⚡ What Makes HyperGit Powerful

Unlike passive simulators, **HyperGit connects to your actual Git working tree on disk**:

1. **Auto-Detects Local Projects**:
   - The top navigation dropdown scans `d:\OLD_HP_PC_BACKUP\e\GIT_REPOS` and lets you switch between `DragShift`, `rea`, `superpowers`, `hypergit`, or any other repository in 1 click.
   - Shows active branch name (`main`, `feature/...`) and working tree status (`Clean`, `3 uncommitted`, `Conflict`).

2. **Interactive Git Command Console**:
   - A real terminal CLI panel in the web interface.
   - Run **any** command (`git status`, `git pull`, `git push`, `git branch -a`, `git stash`, `git checkout -b <name>`, `git diff`).
   - Quick one-click command chips for rapid diagnosis.
   - Auto-refreshes the visual commit graph whenever any command finishes.

3. **Live Commit Swimlanes**:
   - Fetches actual commit history using `git log`.
   - Displays author avatars, short hashes, relative timestamps (`5m ago`), and commit messages in clean, high-contrast cards.
   - Click any commit card to run `git show <hash>` in the console.

4. **Live 3-Way Merge Conflict Resolver**:
   - When files in your repository have conflict markers (`<<<<<<< HEAD ... ======= ... >>>>>>>`):
     - Displays the colliding code blocks side-by-side.
     - Click **"Keep Your Version"**, **"Keep Incoming Version"**, or **"Merge Both"**.
     - Writes the resolution directly to the file on disk and automatically runs `git add <file>`.

5. **AI Doctor & Natural Language Intent Copilot**:
   - Type what you want to achieve (e.g. *"I made a commit on main by mistake"* or *"clean untracked files"*).
   - HyperGit analyzes the repo's current state and recommends the exact safe sequence of actions with full explanation and blast-radius warnings.

---

## 🚀 How to Run Locally

1. Open PowerShell or Terminal in the project directory:
   ```powershell
   cd d:\OLD_HP_PC_BACKUP\e\GIT_REPOS\git-surgery-simulator
   python server.py
   ```

2. Open your browser to:
   ```
   http://localhost:4321
   ```

*(Zero `npm install` or pip packages required — uses Python's standard library `http.server` & `subprocess`)*

---

## 🌐 Deploy to Vercel (Zero-Install Web App)

HyperGit is fully configured to deploy as a static web app on Vercel with **zero server dependencies**:

### Option 1: 1-Click via GitHub & Vercel Dashboard (Recommended)
1. Push this repository to your GitHub account:
   ```powershell
   git remote add origin https://github.com/<your-username>/hypergit.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** → **"Project"** → **Import** your repository.
4. Click **Deploy**. Vercel will build and serve it at `https://hypergit.vercel.app` (or your custom domain) instantly!

### Option 2: Deploy via Vercel CLI
```powershell
npx vercel
```
Follow the short terminal prompts to link and deploy to your personal Vercel team.

### How It Works on Vercel
- **Zero Virus Risk / Zero Install**: Users simply open the link in any modern browser (Chrome, Edge, Brave, etc.).
- **Client-Side File System Access API**: Users can click **"Browse Local Git Repo"** to open any local folder safely without uploading their private code to any server.
- **Built-in Disaster Scenarios**: Visitors without local repos can immediately play with realistic simulated Git incidents (Accidental Main Commit, 3-Way Conflict, Stale Lock Files).
- **Hybrid Bridge**: If the user runs `python server.py` locally, the Vercel app automatically detects it on `localhost:4321` and bridges into full real-time CLI mode!

---

## 📁 Project Architecture

- [vercel.json](file:///d:/OLD_HP_PC_BACKUP/e/GIT_REPOS/git-surgery-simulator/vercel.json) — Vercel routing, clean URLs & security headers
- [package.json](file:///d:/OLD_HP_PC_BACKUP/e/GIT_REPOS/git-surgery-simulator/package.json) — NPM metadata and deploy scripts
- [server.py](file:///d:/OLD_HP_PC_BACKUP/e/GIT_REPOS/git-surgery-simulator/server.py) — Optional lightweight local daemon bridge communicating with Git CLI
- [index.html](file:///d:/OLD_HP_PC_BACKUP/e/GIT_REPOS/git-surgery-simulator/index.html) — Modern dashboard layout, project selector, commit swimlanes, terminal CLI
- [index.css](file:///d:/OLD_HP_PC_BACKUP/e/GIT_REPOS/git-surgery-simulator/index.css) — Linear/Vercel-inspired SaaS dark design system & responsive layout
- [app.js](file:///d:/OLD_HP_PC_BACKUP/e/GIT_REPOS/git-surgery-simulator/app.js) — Client API connector, Web File System API handler, terminal execution handler, live DAG graph renderer
