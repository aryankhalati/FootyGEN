import ReactMarkdown from "react-markdown";
import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    setAnswer("");
    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setAnswer(data.answer);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 16 }}>
      <h1>FootyGEN</h1>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && ask()}
        placeholder="Ask about football..."
        style={{ width: "100%", padding: 10, fontSize: 16 }}
      />
      <button onClick={ask} disabled={loading} style={{ marginTop: 10 }}>
        {loading ? "Thinking..." : "Ask"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {answer && (
  <div style={{ textAlign: "left" }}>
    <ReactMarkdown>{answer}</ReactMarkdown>
  </div>
)}
    </div>
  );
}