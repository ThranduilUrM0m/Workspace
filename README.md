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

**What this script does:**
- Initializes Git at workspace root
- Adds all files to staging
- Creates initial commit on `master` branch
- Ready to push to GitHub

**Verify:**
```bash
git status
# Output: "On branch master, nothing to commit, working tree clean"
```

### Phase 2: Create GitHub Repository

**Goal:** Create empty repo to receive your monorepo

1. Go to **github.com**
2. Click **+ New** (top left)
3. **Repository name:** `my-workspace` (or your preferred name)
4. **Visibility:** Public (or Private)
5. **DO NOT** check "Initialize with README"
6. Click **Create Repository**

**Copy the HTTPS URL:**
```
https://github.com/youruser/my-workspace.git
```

---

### Phase 3: Push to GitHub

**Goal:** Upload entire monorepo to GitHub

```bash
cd my_workspace
git remote add origin https://github.com/ThranduilUrM0m/Workspace.git
git push -u origin master
```

**Expected output:**
```
Enumerating objects: 1234, done.
Counting objects: 100% (1234/1234), done.
Delta compression using up to 8 threads
Compressing objects: 100% (800/800), done.
Writing objects: 100% (1234/1234), 2.50 MiB | 1.50 MiB/s, done.
* [new branch]      master -> master
Branch 'master' set up to track remote origin/master.
```

**Verify:** Refresh your GitHub page. You should see:
- `packages/` folder
- `projects/` folder
- `scripts/` folder
- All configuration files

---

### Phase 4: Deploy Risala Client (Netlify)

**Goal:** Deploy first client to establish pattern (5-10 minutes)

#### Step 1: Access Netlify

1. Visit **https://app.netlify.com**
2. Sign in or create account
3. Click **"Add new site"** → **"Import an existing project"**

#### Step 2: Connect GitHub Repository

1. Click **"Connect to Git"**
2. Select **GitHub** (authorize Netlify if needed)
3. Search for: `my-workspace`
4. Click to select it
5. Click **"Continue"**

#### Step 3: Configure Build Settings

When Netlify shows project selection options and you see `@repo/ui`:

**Click "other (configure manually)"** → Form will load

Fill in these fields:

```
Repository:      my-workspace
Branch:          master (IMPORTANT: NOT "main")
Base directory:  projects/Risala/client
Build command:   pnpm install --frozen-lockfile && pnpm build
Publish dir:     .next
```

#### Step 4: Set Environment Variables

Click **"Advanced build settings"** or **"Environment"** tab

Click **"Add new variable"** for each:

| Variable Name | Value | Where to Find |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_xxxxx` | Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_CLERK_FRONTEND_API` | `https://xxx.clerk.accounts.dev` | Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_SOCKET_IO_URL` | `http://localhost:4001` | (Update after Render deploy) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3001` | (Can update later) |

**How to get Clerk Keys:**
1. Go to: https://dashboard.clerk.com
2. Log in to your account
3. Select your application
4. Go to **API Keys** section
5. Copy **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
6. Copy **Frontend API** → `NEXT_PUBLIC_CLERK_FRONTEND_API`

#### Step 5: Review & Deploy

Before clicking Deploy, verify:
- ✅ Base directory: `projects/Risala/client`
- ✅ Build command: `pnpm install --frozen-lockfile && pnpm build`
- ✅ Publish directory: `.next`
- ✅ Branch: `master` (not main)
- ✅ All 4 environment variables set

Click **"Deploy site"**

**Wait:** 3-5 minutes for build to complete

**Result:** 
```
Deploy successful!
Live URL: https://risala-client-xxxxx.netlify.app
```

---

### Phase 5: Deploy Remaining Clients

**For Boutaleb Client:**

Repeat Phase 4, changing only:
```
Base directory: projects/Boutaleb/client
```

(Everything else identical)

**For Maxconfort Client:**

```
Base directory: projects/Maxconfort/client
```

**For Qasidaty Client:**

```
Base directory: projects/Qasidaty/client
```

**Timeline:**
- Risala: 5-10 min (first setup)
- Boutaleb: 3-5 min
- Maxconfort: 3-5 min
- Qasidaty: 3-5 min
- **Total: ~20 minutes for all 4 clients**

---

### Phase 6: Deploy Servers (Render)

**Goal:** Deploy NestJS servers (5-10 min each)

Repeat for each server: Risala, Boutaleb, Maxconfort, Qasidaty

#### Step 1: Access Render

1. Visit **https://dashboard.render.com**
2. Sign in or create account
3. Click **"New +"** button (top right)
4. Select **"Web Service"**

#### Step 2: Connect GitHub Repository

1. Click **"Connect GitHub"** (authorize if needed)
2. Search for: `my-workspace`
3. Click to select
4. Click **"Connect"**

#### Step 3: Configure Deployment

Fill in these fields:

```
Name:              risala-server (or boutaleb-server, etc.)
Environment:       Node
Region:            Choose closest to you
Root Directory:    projects/Risala/server
Build Command:     pnpm install --frozen-lockfile && pnpm build
Start Command:     node dist/main.js
```

#### Step 4: Set Environment Variables

Scroll to **"Environment"** section

Click **"Add new variable"** for each:

| Variable | Value | Where to Find |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/db` | MongoDB Atlas |
| `JWT_SECRET` | `your-jwt-secret` | Generate any random string |
| `CLERK_SECRET_KEY` | `sk_test_xxxxx` | Clerk Dashboard → API Keys |
| `CLERK_PUBLISHABLE_KEY` | `pk_test_xxxxx` | Clerk Dashboard → API Keys |
| `PORT` | `4001` | Fixed value |
| `NODE_ENV` | `production` | Fixed value |
| `CORS_ORIGIN` | `https://risala-client-xxxxx.netlify.app` | From Netlify (your client URL) |

**Note:** Get `CLERK_SECRET_KEY` from Clerk Dashboard (different from publishable key)

#### Step 5: Review & Deploy

Before deploying, verify:
- ✅ Root directory: `projects/Risala/server`
- ✅ Build command: `pnpm install --frozen-lockfile && pnpm build`
- ✅ Start command: `node dist/main.js`
- ✅ All environment variables set
- ✅ PORT = 4001

Click **"Create Web Service"**

**Wait:** 5-10 minutes for build to complete

**Result:**
```
Deploy successful!
Live URL: https://risala-server-xxxxx.onrender.com
```

---

### Phase 7: Connect Clients to Servers

**Goal:** Update client URLs to point to deployed servers

For **each Netlify client site** (4 times):

1. Go to **Netlify dashboard**
2. Select the site (e.g., risala-client)
3. Go to **Site settings** → **Build & deploy** → **Environment**
4. Edit or add variable:
   ```
   NEXT_PUBLIC_SOCKET_IO_URL = https://risala-server-xxxxx.onrender.com
   NEXT_PUBLIC_API_URL = https://risala-server-xxxxx.onrender.com
   ```
5. Click **"Save"**
6. Go to **Deploys** tab
7. Click **"Trigger deploy"** → **"Clear cache and redeploy"**

**Wait:** 3-5 minutes for redeploy

Repeat for remaining 3 clients (Boutaleb, Maxconfort, Qasidaty)

---

## Netlify Setup (Detailed)

### Understanding "@repo/ui Only" Issue

**What you'll see:**
```
Netlify site creation showing:
┌─────────────────────────────┐
│ Select project to deploy:   │
│                             │
│ [ @repo/ui ]                │
│ [ other (configure manual)]  │
└─────────────────────────────┘
```

**Why this happens:**

Netlify scans `pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'              ← Matches: @repo/ui ✓
```

But doesn't show:
```yaml
  - 'projects/*/client'       ← Netlify ignores this
```

**This is NORMAL.** It's not an error. Just use "Configure manually."

### Netlify Configuration Template

Use this template for each client:

```
Repository:        my-workspace
Branch:            master
Base directory:    projects/ProjectName/client
Build command:     pnpm install --frozen-lockfile && pnpm build
Publish directory: .next

Environment Variables:
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_xxxxx
  NEXT_PUBLIC_CLERK_FRONTEND_API = https://xxx.clerk.accounts.dev
  NEXT_PUBLIC_SOCKET_IO_URL = https://project-server-xxx.onrender.com
  NEXT_PUBLIC_APP_URL = https://project-client-xxx.netlify.app
```

### If "@repo/ui" Click Doesn't Work

**Option 1: Refresh & Retry**
- Refresh page (Ctrl+R)
- Start again from "Add new site"

**Option 2: Check GitHub Integration**
1. Go to Netlify Team settings
2. Connected services → GitHub
3. If disconnected, click "Connect"
4. Authorize and retry

**Option 3: Direct Deploy**
1. Create site WITHOUT connecting GitHub first
2. Go to Site settings → Build & deploy
3. Connect GitHub manually
4. Fill in all settings

---

## Render Setup (Detailed)

### Render Configuration Template

Use this template for each server:

```
Name:              project-server
Environment:       Node
Region:            Choose closest to you
Root Directory:    projects/ProjectName/server
Build Command:     pnpm install --frozen-lockfile && pnpm build
Start Command:     node dist/main.js

Environment Variables:
  MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/db
  JWT_SECRET = your-secret-key
  CLERK_SECRET_KEY = sk_test_xxxxx
  CLERK_PUBLISHABLE_KEY = pk_test_xxxxx
  PORT = 4001
  NODE_ENV = production
  CORS_ORIGIN = https://project-client-xxx.netlify.app
```

### Render Known Issues

**Issue: Build fails with "Cannot find module"**

Fix:
1. Go to Service settings → Environment
2. Add: `NODE_ENV = production`
3. Clear cache: Go to Deploys → "Clear build cache"
4. Trigger redeploy

**Issue: Server starts but crashes immediately**

Fix:
1. Check logs: Deployments tab → View logs
2. Common causes:
   - Missing MongoDB connection
   - Wrong JWT_SECRET format
   - PORT already in use

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
