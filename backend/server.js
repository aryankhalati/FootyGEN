import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { answerQuestion } from "./rag.js";
import { CATEGORIES } from "./retriever.js";
import rateLimit from "express-rate-limit";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const formations = JSON.parse(
  readFileSync(path.join(__dirname, "formations.json"), "utf-8")
);
const positions = JSON.parse(
  readFileSync(path.join(__dirname, "positions.json"), "utf-8")
);

const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL, // your Vercel URL, set on Render (no trailing slash)
  "http://localhost:5173", // local dev
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Behind Render's proxy, trust the first hop so the limiter sees real visitor IPs
app.set("trust proxy", 1);

// Max 20 questions per minute per visitor on /ask
const askLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many questions. Please wait a minute and try again." },
});
app.use("/ask", askLimiter);

// Health check: tells us the server is alive
app.get("/health", (req, res) => {
  res.json({ status: "ok", app: "FootyGEN" });
});

// List of all formations (id, name, summary, players)
app.get("/formations", (req, res) => {
  res.json(formations);
});

// One formation by id, e.g. /formations/4-4-2
app.get("/formations/:id", (req, res) => {
  const formation = formations.find((f) => f.id === req.params.id);
  if (!formation) {
    return res.status(404).json({ error: "Formation not found." });
  }
  res.json(formation);
});

// All position descriptions, keyed by position code (GK, LB, ST, ...)
app.get("/positions", (req, res) => {
  res.json(positions);
});

// Keeps only the last 6 valid messages, trimmed in length
function cleanHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim()
    )
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
}

app.post("/ask", async (req, res) => {
  const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
  const category = req.body?.category || undefined;
  const history = cleanHistory(req.body?.history);

  if (!question) {
    return res.status(400).json({ error: "Send a JSON body like { \"question\": \"...\" }" });
  }
  if (question.length > 500) {
    return res.status(400).json({ error: "Question is too long (500 characters max)." });
  }
  if (category && !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of: ${CATEGORIES.join(", ")}` });
  }

  try {
    const result = await answerQuestion(question, category, history);
    res.json(result);
  } catch (err) {
    console.error("Ask failed:", err);
    res.status(500).json({ error: "Something went wrong answering that. Please try again." });
  }
});

// Last-resort error handler: bad JSON bodies and anything unexpected
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body is not valid JSON." });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FootyGEN backend running on port ${PORT}`);
});