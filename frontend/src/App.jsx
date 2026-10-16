import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Pitch from "./Pitch";

const API = import.meta.env.VITE_API_URL;
const HISTORY_LIMIT = 6; // last 6 messages = 3 question/answer pairs

const EXAMPLES = [
  "What is the offside rule?",
  "How does a 4-3-3 press?",
  "What does a false 9 do?",
  "Explain gegenpressing",
];

export default function App() {
  // Each message: { role: "user" | "assistant", content, sources?, answered?, error? }
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Formation picker
  const [formations, setFormations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [formationsError, setFormationsError] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    async function loadFormations() {
      try {
        const res = await fetch(`${API}/formations`);
        if (!res.ok) throw new Error("Could not load formations.");
        const data = await res.json();
        setFormations(data);
        if (data.length > 0) setSelectedId(data[0].id);
      } catch (e) {
        setFormationsError(e.message);
      }
    }
    loadFormations();
  }, []);

  const selected = formations.find((f) => f.id === selectedId);

  async function ask(q = question) {
    if (!q.trim() || loading) return;

    // History = last few messages before this question. Skip errors, send only role + content.
    const history = messages
      .filter((m) => !m.error)
      .slice(-HISTORY_LIMIT)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
          answered: data.answered !== false,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: e.message, error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    setMessages([]);
    setQuestion("");
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

  const activeChipStyle = {
    ...chipStyle,
    background: "#f5c518",
    borderColor: "#f5c518",
    color: "#1b1b1b",
    fontWeight: "bold",
  };

  const userBubble = {
    alignSelf: "flex-end",
    maxWidth: "80%",
    background: "#2a3b2a",
    borderRadius: 12,
    padding: "8px 14px",
    textAlign: "left",
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 16 }}>
      <h1>FootyGEN</h1>

      {/* Formation picker */}
      <div style={{ marginBottom: 32 }}>
        {formationsError && (
          <p style={{ color: "red" }}>{formationsError}</p>
        )}
        {formations.length > 0 && (
          <>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              {formations.map((f) => (
                <button
                  key={f.id}
                  style={f.id === selectedId ? activeChipStyle : chipStyle}
                  onClick={() => setSelectedId(f.id)}
                >
                  {f.name}
                </button>
              ))}
            </div>
            {selected && (
              <>
                <Pitch players={selected.players} />
                <p style={{ textAlign: "center", opacity: 0.8, marginTop: 12 }}>
                  {selected.summary}
                </p>
              </>
            )}
          </>
        )}
      </div>

      {messages.length === 0 && !loading && (
        <div
          style={{
            marginTop: 20,
            marginBottom: 20,
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

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => {
          if (m.role === "user") {
            return (
              <div key={i} style={userBubble}>
                {m.content}
              </div>
            );
          }

          if (m.error) {
            return (
              <p key={i} style={{ color: "red", textAlign: "left" }}>
                {m.content}
              </p>
            );
          }

          return (
            <div key={i} style={{ textAlign: "left" }}>
              <div
                style={
                  m.answered
                    ? {}
                    : {
                        background: "#3a2f1a",
                        border: "1px solid #b8860b",
                        borderRadius: 8,
                        padding: "4px 16px",
                      }
                }
              >
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
              {m.sources.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
                  <strong>Sources:</strong>
                  <ul>
                    {m.sources.map((s, j) => (
                      <li key={j}>
                        {s.title} · {s.section}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <p style={{ textAlign: "left", opacity: 0.7 }}>Thinking...</p>
        )}
        <div ref={bottomRef} />
      </div>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && ask()}
        placeholder="Ask about football..."
        style={{ width: "100%", padding: 10, fontSize: 16, marginTop: 20 }}
      />
      <div
        style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "center" }}
      >
        <button onClick={() => ask()} disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </button>
        <button onClick={newChat}>New Chat</button>
      </div>
    </div>
  );
}