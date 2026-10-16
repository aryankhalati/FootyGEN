import { useState } from "react";
import ReactMarkdown from "react-markdown";

const API = import.meta.env.VITE_API_URL;

const EXAMPLES = [
  "What is the offside rule?",
  "How does a 4-3-3 press?",
  "What does a false 9 do?",
  "Explain gegenpressing",
];

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [answered, setAnswered] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask(q = question) {
    if (!q.trim()) return;
    setQuestion(q);
    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);
    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setAnswer(data.answer);
      setSources(data.sources || []);
      setAnswered(data.answered !== false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    setQuestion("");
    setAnswer("");
    setSources([]);
    setAnswered(true);
    setError("");
  }

  const chipStyle = {
    padding: "6px 12px",
    borderRadius: 16,
    border: "1px solid #555",
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
    fontSize: 14,
  };

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
      <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={() => ask()} disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </button>
        <button onClick={newChat}>New Chat</button>
      </div>

      {!answer && !loading && !error && (
        <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {EXAMPLES.map((ex) => (
            <button key={ex} style={chipStyle} onClick={() => ask(ex)}>
              {ex}
            </button>
          ))}
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
      {answer && (
        <div
          style={{
            textAlign: "left",
            ...(answered
              ? {}
              : {
                  background: "#3a2f1a",
                  border: "1px solid #b8860b",
                  borderRadius: 8,
                  padding: "4px 16px",
                }),
          }}
        >
          <ReactMarkdown>{answer}</ReactMarkdown>
        </div>
      )}
      {sources.length > 0 && (
        <div style={{ marginTop: 16, fontSize: 14, opacity: 0.7, textAlign: "left" }}>
          <strong>Sources:</strong>
          <ul>
            {sources.map((s, i) => (
              <li key={i}>
                {s.title} · {s.section}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}