const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const pool = require("./config/database");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const postRoutes = require("./routes/post.routes");
const followRoutes = require("./routes/follow.routes");
const engagementRoutes = require("./routes/engagement.routes");
const discoveryRoutes = require("./routes/discovery.routes");
const platformRoutes = require("./routes/platform.routes");

const {
  notFound,
  errorHandler
} = require("./middleware/error.middleware");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://172.24.204.95:5173",
  "http://10.228.179.236:5173"
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(helmet());

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/api/v1/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      success: true,
      service: "AnimeSync API",
      version: "v1",
      status: "healthy",
      database: "connected"
    });
  } catch (error) {
    console.error("Health check database error:", error.message);

    res.status(503).json({
      success: false,
      service: "AnimeSync API",
      version: "v1",
      status: "degraded",
      database: "unavailable"
    });
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1", followRoutes);
app.use("/api/v1", engagementRoutes);
app.use("/api/v1/discovery", discoveryRoutes);
app.use("/api/v1", platformRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
