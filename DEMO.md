# Git Mastery — Quick demo (tomorrow)

## Option 0 — Same app for everyone (Docker) — recommended for teams

Everyone gets the **same** frontend + backend (versions match the repo).

**Requirements:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```powershell
cd path\to\git-mastery-repo   # folder that contains docker-compose.yml

# Optional: AI mentor (create .env next to docker-compose.yml)
# copy .env.example to .env and set GROQ_API_KEY=...

docker compose up --build
```

Open **http://localhost:3000** (single URL — UI + API).

- First build may take a few minutes (Maven + npm).
- Stop: `Ctrl+C` or `docker compose down`.

---

## Option A — Fastest: one person presents (5 min setup)

**Presenter’s laptop only**

1. Install **Java 17**, **Node.js 18+**, **Maven** (or use IDE with Maven).
2. Two terminals:

**Terminal 1 — backend**

```powershell
cd backend
$env:GROQ_API_KEY="your_groq_key_here"
mvn spring-boot:run
```

Wait until you see: `Tomcat started on port ...`

**Terminal 2 — frontend**

```powershell
cd frontend
npm install
npm run dev
```

3. Open the URL Vite prints (often `http://localhost:5173` — if busy, use `5174`).
4. **Demo flow (2 minutes):** Home → **Learning** (lessons) → **Simulator** (type `git status`) → **Quiz** → **AI Mentor** (floating button) → **Login/Register** → **Dashboard** (after login).

**If AI says “unavailable”:** set `GROQ_API_KEY` in terminal 1 and restart backend.

---

## Option B — Everyone runs locally (share repo)

1. Push latest code to GitHub (include this file).
2. Send teammates: “Clone repo, follow **DEMO.md** Option A.”
3. Each person needs their own **Groq API key** for AI, or skip AI during demo.

---

## Option C — Live link (if already deployed)

- Share **frontend URL** + **backend URL** (Railway, etc.).
- Ensure frontend `api` base URL points at that backend and **CORS** allows the frontend origin.

---

## Common issues

| Problem | Fix |
|--------|-----|
| Port 8080 in use | Stop other Java apps or change `server.port` in `backend/.../application.properties` |
| Port 5173 in use | Vite picks 5174 — use the URL it prints |
| Network error in browser | Backend must be running first; same machine = use `localhost` |
| Register/login fails | Backend must be running; H2 is in-memory — data resets when backend restarts |

---

## One-line pitch

“Git Mastery is a learning app: lessons, a Git command simulator, quiz, progress, and an AI mentor — full stack React + Spring Boot.”
