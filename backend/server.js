import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { answerQuestion } from "./rag.js";
import { CATEGORIES } from "./retriever.js";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
app.use(cors());
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

app.post("/ask", async (req, res) => {
  const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
  const category = req.body?.category || undefined;

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
    const result = await answerQuestion(question, category);
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