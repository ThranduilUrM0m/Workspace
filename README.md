# My Workspace — Monorepo Scaffold (Next.js + NestJS + Clerk + Socket.IO + SASS + pnpm + Turbo + Docker + CI)

This repository is a **production-ready monorepo scaffold** for building and deploying multiple full‑stack projects (Next.js clients + NestJS servers). It is fully integrated with **Clerk authentication**, **Socket.IO**, **Mongoose (MongoDB)**, **SASS with TailwindCSS**, **Docker**, and **GitHub Actions CI/CD**. The setup uses **pnpm workspaces** and **Turborepo** for efficient dependency management and parallel task execution.

---

## 📦 Monorepo Structure

```
my_workspace/
│
├── packages/
│   └── ui/                  # Shared UI library (React components, SCSS utilities, hooks)
│
├── projects/
│   ├── Risala/
│   │   ├── client/          # Next.js 15 client
│   │   └── server/          # NestJS server
│   ├── Boutaleb/
│   │   ├── client/
│   │   └── server/
│   ├── Maxconfort/
│   │   ├── client/
│   │   └── server/
│   └── Qasidaty/
│       ├── client/
│       └── server/
│
├── scripts/                 # Bootstrap, git-init, subtree publishing helpers
│
├── turbo.json               # Task pipeline config for Turborepo
├── pnpm-workspace.yaml      # Workspace definition
├── docker-compose.yml       # Multi-service dev & prod composition
├── .github/workflows/ci.yml # GitHub Actions CI pipeline
└── README.md                # You are here
```

---

## 🚀 Features

* **Next.js 15 clients** with:

  * Clerk authentication integration
  * TailwindCSS (v4-ready) + SASS with modular architecture
  * Redux Toolkit state management
  * Prebuilt layout, header/footer, progress bar, and sample pages
  * Shared SCSS utilities from `packages/ui`

* **NestJS servers** with:

  * ConfigModule + environment variables support
  * MongoDB + Mongoose + User schema/service/controller
  * Clerk JWT validation strategy with Passport
  * WebSocket gateway with sample `echo` and `ping` events
  * REST endpoint for broadcasting messages to WebSocket clients

* **Shared UI Package (`@repo/ui`)**:

  * Responsive container component
  * Socket.io client React hook
  * SCSS responsive mixins

* **Development tooling**:

  * pnpm workspaces (fast, disk‑efficient package management)
  * Turborepo task runner for caching/build orchestration
  * Dockerfiles for each client/server + root docker-compose.yml
  * GitHub Actions CI (build matrix for each project)
  * Git subtree publishing script (deploy each project to its own GitHub repo)

---

## 🛠 Prerequisites

* **Node.js** v18+
* **pnpm** (via `corepack enable` or manual install)
* **Docker** (for containerization and local DB)
* **MongoDB** (local or cloud instance, e.g. Atlas)
* **Clerk account** (for authentication)

---

## ⚡ Quickstart

### 1. Scaffold & Install

```bash
# Run scaffold script (done once)
# Use the script provided in this directory
bash scaffold-workspace.sh

cd my_workspace
pnpm -w install
bash scripts/bootstrap.sh
```

### 2. Start Development

```bash
# Start all projects concurrently
pnpm -w run dev

# Start one project (client + server)
pnpm run risala:dev

# Start client or server individually
pnpm run risala-client:dev
pnpm run risala-server:dev
```

### 3. Environment Setup

* Each **client** has `.env` with:

  ```env
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
  NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.xxx
  NEXT_PUBLIC_SOCKET_URL=http://localhost:4001
  ```
* Each **server** has `.env` with:

  ```env
  CLERK_JWKS_URI=https://clerk.xxx/.well-known/jwks.json
  MONGODB_URI=mongodb://localhost:27017/risala
  PORT=4001
  ```

Update with your **Clerk API keys** and **MongoDB URI** before running.

### 4. Run with Docker

```bash
docker-compose up --build
```

This spins up all clients and servers with their own ports.

---

## 🐙 Git & GitHub Integration

The repo is monorepo‑first, but each project can be split and deployed separately.

### Initialize Git

```bash
bash scripts/git-init.sh
```

### Publish a Project to its Own GitHub Repo (HTTPS — recommended for you)

Authenticate with GitHub CLI first (recommended — opens browser for login):

- PowerShell / CMD:
  gh auth login --web

- Git Bash (if the web flow fails; use winpty):
  winpty gh auth login --web

After successful login you can run the publish command. Example (you asked for master branch):

```bash
bash scripts/publish-subtree.sh Maxconfort https://github.com/ThranduilUrM0m/MaxConfort.git master
```

What this script does (safe default)
- Exports only the files under projects/Maxconfort plus the shared package packages/ui (so your standalone repo contains the project and required shared UI).
- Initializes a fresh Git repo, commits and pushes to the remote branch you pass (force push).
- This avoids accidentally pushing the entire workspace to the target repo.

If you already pushed the full monorepo by mistake
- Option A (recommended): make the remote empty and re-run the publish script above (it force-pushes).
- Option B: delete the remote GitHub repository and recreate it empty, then re-run the script.
- Option C (if you cannot re-create remote): in the remote repo remove unwanted files via GitHub web UI or locally clone, remove files, force-push a cleaned branch.

Render supports monorepos and can deploy multiple services (frontend + backend) from the same GitHub repository. The recommended, professional workflow is to push the entire workspace (monorepo) to GitHub and create one Render service per project piece (client and server), pointing each service to the correct root directory inside the repository.

Steps to deploy a project (example: `Risala`) from the monorepo to Render:

1. Push the full workspace to GitHub (recommended):

  - From the workspace root:

    ```bash
    git remote add origin git@github.com:yourorg/your-repo.git
    git push -u origin master
    ```

  - Note: pushing the full workspace preserves shared packages (`packages/ui`) and Turborepo configuration which avoids import/build issues.

2. In the Render dashboard, create a new Web Service for the client (Next.js):

  - Select your GitHub repository.
  - Set the Root Directory to: `projects/<ProjectName>/client` (e.g. `projects/Risala/client`).
  - Build Command: `pnpm install --frozen-lockfile && pnpm build`.
  - Start Command: `pnpm start` (ensure `start` runs `next start` in the client's `package.json`).
  - Add necessary environment variables (Clerk publishable key, frontend API, NEXT_PUBLIC_SOCKET_URL, etc.).

3. In the Render dashboard, create a new Web Service for the server (NestJS):

  - Select the same GitHub repository.
  - Set the Root Directory to: `projects/<ProjectName>/server` (e.g. `projects/Risala/server`).
  - Build Command: `pnpm install --frozen-lockfile && pnpm build`.
  - Start Command: `node dist/main.js` (or `pnpm start` if defined to run this).
  - Add required environment variables (MONGODB_URI, CLERK_JWKS_URI, PORT, etc.).

4. Repeat for each project (create separate frontend + backend services), each pointing at the correct root directory inside the single repository.

Why this approach?

- Shared packages (like `packages/ui`) remain in the repository; Render will install dependencies and build from the project root and can resolve local workspace packages via pnpm workspaces.
- Keeping a single canonical repo avoids duplication, dependency mismatch, and the fragile process of exporting subtrees that must also carry shared packages.

Notes and tips:

- Make sure each project's `package.json` uses workspace-friendly install/build scripts (for example `pnpm build` and `pnpm start`).
- In Render, you can set the Install Command to `pnpm install --frozen-lockfile` to ensure reproducible installs.
- Add Render environment variables in the service settings (do not check secrets into git).

If you still need to export a single project repository, the `scripts/publish-subtree.sh` helper exists but the preferred workflow is to keep the monorepo and configure platform roots.

---

## 📖 Common Commands

```bash
# Install dependencies (workspace-wide)
pnpm -w install

# Run everything in dev mode
pnpm -w run dev

# Build everything
pnpm -w run build

# Run linter
pnpm -w run lint

# Run only one project (example Risala)
pnpm run risala:dev

# Run inside client directory
cd projects/Risala/client
pnpm run dev

# Run inside server directory
cd projects/Risala/server
pnpm run start:dev

# Docker build and run
docker-compose up --build
```

---

## 🔑 Clerk Setup Notes

* Go to [Clerk Dashboard](https://dashboard.clerk.com/)
* Create an **application** for each project
* Add **Frontend API URL** + **Publishable Key** to client `.env`
* Add **JWKS URI** to server `.env`
* Configure **Allowed Origins** (client URL in dev/prod)

---

## 🧩 Next Steps

* Add features to your client apps inside `src/components`, `src/pages`, `src/styles`
* Extend your server apps with new modules under `src/logic`
* Share UI/logic across projects in `packages/ui`
* Configure CI/CD secrets in GitHub → Settings → Secrets → Actions
* Deploy clients and servers to Render (recommended for monorepos)

---

## 📝 Notes

* The scaffold already sets up `redux`, `socket.io`, `clerk`, and `mongoose` integration.
* SASS deprecation warning for `map-get` → update `_responsive.scss` to `map.get` if using Dart Sass 3.0+.
* Ignore `Watchpack` warnings on Windows (`pagefile.sys`, etc.) — harmless.
* Each project is **fully independent** yet benefits from shared packages and workspace tooling.

---

## 🤝 Contributing

This monorepo is scaffolded for personal/multi‑tenant fullstack projects. Fork, adapt, or extend as you wish.
