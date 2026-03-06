# EduGap AI 📘✨

**EduGap AI** is a comprehensive career-readiness and learning roadmap platform tailored for VIT (Vellore Institute of Technology) students and faculty. It aims to bridge the gap between static university curriculums and rapidly evolving industry trends using AI-driven insights and a collaborative community.

## 🚀 Features

### 🎓 For Students
- **Domain Selection:** Choose from various career paths, from Software Engineering to Data Science.
- **Personalized Learning Roadmaps:** Discover core VIT curriculum subjects combined with cutting-edge AI-suggested courses.
- **On-Demand Course Requests:** If an industry-relevant topic isn't taught at VIT, vote to request it and demonstrate student demand.
- **AI Resource Finder:** Automatically generate the best free, high-quality online resources for any topic.

### 👨‍🏫 For Teachers
- **Publish Blogs:** Share knowledge, tutorials, and insights via markdown-supported blog posts.
- **Earn Reputation:** Gain points and climb the Teacher Leaderboard based on community interaction and blog engagement.
- **Engage with Students:** View the most active students and provide guidance directly.

### 🛠 For Administrators
- **Dynamic Dashboard:** Monitor student domain interests, teacher rankings, and real-time upvotes for on-demand topic requests.
- **Curriculum Management:** Toggle the availability of VIT subjects for the current semester and review AI-suggested trends to officially integrate them into the curriculum.
- **Content Moderation:** Review and moderate flagged forum posts and doubts to maintain a healthy community environment.

### 💬 Community Forum
- **Student Doubts & Teacher Blogs:** A unified space where teachers publish insights and students ask questions.
- **Interactive Discussions:** Upvote helpful answers, reply to threads, and build a collaborative learning ecosystem.

---

## 💻 Tech Stack

- **Frontend:** React 19, Vite, React Router v7, Tailwind CSS v4, Lucide Icons, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (`pg`), SQLite (`better-sqlite3`)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`), `bcrypt` 
- **AI Integration:** Google Generative AI (`@google/genai`)

---

## ⚙️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and `npm` installed.

### 1. Clone the repository
```bash
git clone https://github.com/itsmikhil/Ideathon-Hackathon.git
cd edugap
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory. Configure the Google Gemini API key:
```env
# AI
GEMINI_API_KEY=your_google_gemini_api_key
```

### 4. Run the Development Server
```bash
npm run dev
```
This command starts both the backend API server (`server.ts`) and the Vite frontend dev server at the same time. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Scripts

- `npm run dev`: Starts the Node/Express server and the Vite development environment concurrently using `tsx`.
- `npm run build`: Builds the React frontend for production.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs TypeScript type-checking without emitting files.

---

## 🎨 Design System

The platform features a clean, technical, and premium UI aesthetic (Design System v1.0), tailored with a structured semantic architecture.
- Built on modern `Plus Jakarta Sans` typography.
- Uses distinct semantic Tailwind v4 layers (`indigo`, `purple`, `slate`, `emerald`, `amber`, `rose`) to handle varying levels of priority, feedback, and engagement.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/itsmikhil/Ideathon-Hackathon/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
