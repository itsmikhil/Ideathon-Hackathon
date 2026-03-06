<div align="center">

<img src="https://img.shields.io/badge/EduGap_AI-VIT_Edition-0A1628?style=for-the-badge&labelColor=00D4FF&color=0A1628" alt="EduGap AI" />

# EduGap AI

**Bridging the gap between university curriculum and industry reality.**

Built for VIT students and faculty. Career roadmaps, curated resources, and a collaborative community — all in one platform.

[![React](https://img.shields.io/badge/React_19-0A1628?style=flat-square&logo=react&logoColor=00D4FF)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-0A1628?style=flat-square&logo=vite&logoColor=00D4FF)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js_v18+-0A1628?style=flat-square&logo=node.js&logoColor=00C896)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-0A1628?style=flat-square&logo=postgresql&logoColor=4D9FFF)](https://postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-0A1628?style=flat-square)](LICENSE)

[Live Demo](#) · [Report Bug](https://github.com/itsmikhil/Ideathon-Hackathon/issues) · [Request Feature](https://github.com/itsmikhil/Ideathon-Hackathon/issues)

</div>

---

## What is EduGap AI?

VIT's curriculum is structured. Industry moves fast. EduGap AI sits between the two.

It maps your VIT subjects to real career paths, surfaces what the industry actually expects you to know, and gives students a place to learn, ask, and grow — while giving teachers a platform to contribute and be recognized for it.

---

## Platform Workflow

```
┌──────────────────────────────────────────────────────────────────────┐
│                         STUDENT JOURNEY                              │
│                                                                      │
│   Register / Login                                                   │
│         │                                                            │
│         ▼                                                            │
│   Pick a Career Domain  (Backend, Data Science, DevOps, AI/ML...)    │
│         │                                                            │
│         ▼                                                            │
│   Topic Roadmap Generated  (AI topics merged with VIT subjects)      │
│         │                                                            │
│         ├──── Topic available in VIT? ────► Syllabus + Active        │
│         │              YES                   Teachers for that tag   │
│         │                                                            │
│         └──── Topic NOT in VIT? ─────────► Free Online Resources     │
│                        NO                  + "I want this in VIT"    │
│                                              demand checkbox         │
│         │                                                            │
│         ▼                                                            │
│   Forum  ──►  Post doubts · Read teacher blogs · Upvote · Reply      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                         TEACHER JOURNEY                              │
│                                                                      │
│   Login                                                              │
│         │                                                            │
│         ▼                                                            │
│   Dashboard  ──►  Write Blog Post  ──►  Published to Forum           │
│         │                                       │                    │
│         │                            Students comment & reply        │
│         │                                       │                    │
│         └──────────── Points Awarded ◄───────────┘                   │
│                      +5 per blog published                           │
│                      +1 per reply received                           │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                          ADMIN JOURNEY                               │
│                                                                      │
│   Login                                                              │
│         │                                                            │
│         ▼                                                            │
│   Dashboard                                                          │
│         ├── Demand Signals      topics students voted to add to VIT  │
│         ├── Teacher Leaderboard ranked by total contribution points  │
│         ├── Domain Popularity   how many students per career path    │
│         ├── Content Moderation  review and remove flagged posts      │
│         └── Refresh Topics      regenerate topic list per domain     │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW                                  │
│                                                                      │
│   Topic Generation                                                   │
│         ├── Triggered on first student selection of a domain         │
│         ├── Result saved to DB — served instantly for all others     │
│         └── Merged with VIT VTOP subjects via fuzzy match            │
│                                                                      │
│   Points Engine                                                      │
│         ├── Teacher publishes blog ──────────────────► +5 pts        │
│         └── Any user replies to teacher's blog ──────► +1 pt         │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Features

### 🎓 For Students

| Feature | Description |
|---|---|
| **Domain Selection** | Pick a career path — Backend, Data Science, DevOps, AI/ML, and more |
| **Personalized Roadmap** | Generated topics merged with your actual VIT curriculum subjects |
| **On-Demand Course Requests** | Topic not taught at VIT? Vote to request it — admin sees the demand |
| **Resource Finder** | Automatically surfaces the best free online resources for any topic |

### 👨‍🏫 For Teachers

| Feature | Description |
|---|---|
| **Publish Blogs** | Write markdown-supported tutorials, concept explanations, and insights |
| **Earn Reputation** | Gain points for every blog post and community reply — climb the leaderboard |
| **Student Engagement** | See which students are most active in your subject area and guide them directly |

### 🛠️ For Administrators

| Feature | Description |
|---|---|
| **Dynamic Dashboard** | Monitor domain interests, teacher rankings, and topic demand in real time |
| **Curriculum Management** | Toggle VIT subject availability per semester, review industry trend signals |
| **Content Moderation** | Review and remove flagged forum posts to keep the community healthy |

### 💬 Community Forum

- Teachers publish long-form blogs and tutorials
- Students post doubt questions (Stack Overflow-style)
- Subject-tag filtering so every post reaches the right audience
- Upvotes and threaded replies on all posts

---

## Tech Stack

### Frontend

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | Latest | Build tool and dev server |
| React Router | v7 | Client-side routing |
| Tailwind CSS | v4 | Utility-first styling |
| Framer Motion | Latest | Animations and transitions |
| Lucide Icons | Latest | Icon system |

### Backend

| Tool | Version | Purpose |
|---|---|---|
| Node.js | v18+ | Runtime |
| Express.js | Latest | REST API server |
| PostgreSQL + `pg` | Latest | Primary database |
| SQLite + `better-sqlite3` | Latest | Local / dev database |
| `jsonwebtoken` | Latest | JWT authentication |
| `bcrypt` | Latest | Password hashing |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- `npm` v9 or higher

Verify your setup:

```bash
node --version   # v18.x.x or higher
npm --version    # 9.x.x or higher
```

### 1. Clone the Repository

```bash
git clone https://github.com/itsmikhil/Ideathon-Hackathon.git
cd edugap
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# ── AI ─────────────────────────────────────────
GEMINI_API_KEY=your_google_gemini_api_key_here

# ── Auth ───────────────────────────────────────
SECRET_KEY=your_jwt_secret_here

# ── Database ───────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/edugap
```

> **Never commit your `.env` file. It is already in `.gitignore`.**

### 4. Start the Development Server

```bash
npm run dev
```

Starts both the Express backend and Vite frontend simultaneously.  
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Express backend and Vite frontend concurrently via `tsx` |
| `npm run build` | Builds the React frontend for production |
| `npm run preview` | Locally previews the production build |
| `npm run lint` | Runs TypeScript type-checking without emitting files |

---

## Design System

The UI follows a **technical-premium** aesthetic built on structured semantic layers.

- **Typography:** `Plus Jakarta Sans` — clean, modern, legible at all sizes
- **Color layers:** Semantic Tailwind v4 tokens — `indigo`, `purple`, `slate`, `emerald`, `amber`, `rose` — each with a defined role across priority, feedback, and engagement
- **Motion:** Framer Motion for page transitions and micro-interactions
- **Principle:** Every component earns its place. No decorative noise.

---

## Contributing

Contributions, issues, and feature requests are welcome.

```bash
# 1. Fork the repository

# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature description"

# 4. Push to your branch
git push origin feature/your-feature-name

# 5. Open a Pull Request on GitHub
```

Check the [open issues](https://github.com/itsmikhil/Ideathon-Hackathon/issues) before starting — your idea might already be tracked.

---

<div align="center">

Built for VIT · VIT Internal Use Only

</div>
