import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./server/routes/auth.js";
import domainRoutes from "./server/routes/domains.js";
import topicRoutes from "./server/routes/topics.js";
import communityRoutes from "./server/routes/community.js";
import teacherRoutes from "./server/routes/teacher.js";
import adminRoutes from "./server/routes/admin.js";
import { initDb } from "./server/db.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize DB
  await initDb();

  // API routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/domains", domainRoutes);
  app.use("/api/v1/topics", topicRoutes);
  app.use("/api/v1/community", communityRoutes);
  app.use("/api/v1/teacher", teacherRoutes);
  app.use("/api/v1/admin", adminRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
