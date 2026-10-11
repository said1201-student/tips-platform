require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const { testConnection } = require("./config/db");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:3000").trim();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Basic protection against brute-force on authentication endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});
app.use("/api/auth", authLimiter);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await testConnection();
    console.log("Database connected.");
  } catch (err) {
    console.error("Could not connect to the database:", err.message);
    console.error("Check your .env settings and make sure MySQL is running.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
  });
}

start();
