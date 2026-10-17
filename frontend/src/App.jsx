import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Pitch from "./Pitch";
import Compare from "./Compare";
import "./App.css";
const API = import.meta.env.VITE_API_URL;
const HISTORY_LIMIT = 6; // last 6 messages = 3 question/answer pairs

const EXAMPLES = [
  "What is the offside rule?",
  "How does a 4-3-3 press?",
  "What does a false 9 do?",
  "Explain gegenpressing",
];

const CATEGORY_LABELS = {
  formations: "Formations",
  tactics: "Tactics",
  roles: "Roles",
  managers: "Managers",
  laws: "Laws of the game",
};

export default function App() {
  // Which screen is showing: "chat" or "compare"
  const [view, setView] = useState("chat");

  // Answer style: "beginner" or "detailed"
  const [level, setLevel] = useState("beginner");

  // Each message: { role: "user" | "assistant", content, sources?, answered?, error? }
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Formation picker
  const [formations, setFormations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [formationsError, setFormationsError] = useState("");

  // Role highlighting
  const [positions, setPositions] = useState({});
  const [selectedPos, setSelectedPos] = useState("");

  // Browse sidebar
  const [browse, setBrowse] = useState([]);
  const [browseOpen, setBrowseOpen] = useState(false);

  // Only scroll once the chat has started, so the pitch stays in view on first load
  useEffect(() => {
    if (messages.length === 0 && !loading) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
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

  useEffect(() => {
    async function loadPositions() {
      try {
        const res = await fetch(`${API}/positions`);
        if (!res.ok) return;
        setPositions(await res.json());
      } catch {
        // Role cards are optional, so fail quietly
      }
    }
    loadPositions();
  }, []);

  useEffect(() => {
    async function loadBrowse() {
      try {
        const res = await fetch(`${API}/browse`);
        if (!res.ok) return;
        setBrowse(await res.json());
      } catch {
        // Browse is optional, so fail quietly
      }
    }
    loadBrowse();
  }, []);

  const selected = formations.find((f) => f.id === selectedId);
  const roleInfo = selectedPos ? positions[selectedPos] : null;

  function chooseFormation(id) {
    setSelectedId(id);
    setSelectedPos("");
  }

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
        body: JSON.stringify({ question: q, history, level }),
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

  // Clicking a doc in the Browse sidebar: jump to chat and ask about it
  function askAboutDoc(title) {
    setBrowseOpen(false);
    setView("chat");
    ask(`Explain ${title}`);
  }

  function newChat() {
    setMessages([]);
    setQuestion("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    ask();
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>FootyGEN</h1>

        <nav className="tabs" aria-label="Views">
          <button
            type="button"
            className={`tab${view === "chat" ? " tab-active" : ""}`}
            onClick={() => setView("chat")}
          >
            Chat
          </button>
          <button
            type="button"
            className={`tab${view === "compare" ? " tab-active" : ""}`}
            onClick={() => setView("compare")}
          >
            Compare
          </button>
          <button
            type="button"
            className={`tab${browseOpen ? " tab-active" : ""}`}
            onClick={() => setBrowseOpen((o) => !o)}
            aria-expanded={browseOpen}
          >
            Browse
          </button>
        </nav>

        {view === "chat" ? (
          <button type="button" className="btn btn-ghost" onClick={newChat}>
            New chat
          </button>
        ) : (
          <span className="topbar-spacer" aria-hidden="true" />
        )}
      </header>

      {/* Browse sidebar */}
      {browseOpen && (
        <>
          <div className="browse-overlay" onClick={() => setBrowseOpen(false)} />
          <aside className="browse-drawer" aria-label="Browse topics">
            <div className="browse-head">
              <strong>Browse topics</strong>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setBrowseOpen(false)}
              >
                Close
              </button>
            </div>

            {browse.length === 0 && <p className="pitch-hint">Loading topics...</p>}

            {browse.map((group) => (
              <div key={group.category} className="browse-group">
                <h3>{CATEGORY_LABELS[group.category] || group.category}</h3>
                <ul>
                  {group.docs.map((d) => (
                    <li key={d.title}>
                      <button
                        type="button"
                        className="browse-item"
                        onClick={() => askAboutDoc(d.title)}
                        disabled={loading}
                      >
                        {d.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>
        </>
      )}

      {/* Compare view: stays mounted, hidden when Chat is active */}
      {formations.length >= 2 ? (
        <div hidden={view !== "compare"} className="compare-wrap">
          <Compare formations={formations} />
        </div>
      ) : (
        view === "compare" && (
          <p className="error-text compare-status">
            {formationsError || "Loading formations..."}
          </p>
        )
      )}

      {/* Chat view: stays mounted, hidden when Compare is active */}
      <main className="layout" hidden={view !== "chat"}>
        {/* Pitch panel */}
        <section className="pitch-panel" aria-label="Formations">
          {formationsError && <p className="error-text">{formationsError}</p>}

          {formations.length > 0 && (
            <>
              <div className="chip-row">
                {formations.map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    className={`chip${f.id === selectedId ? " chip-active" : ""}`}
                    onClick={() => chooseFormation(f.id)}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              {selected && (
                <>
                  <Pitch
                    players={selected.players}
                    selectedPos={selectedPos}
                    onSelect={setSelectedPos}
                  />

                  {roleInfo ? (
                    <div className="role-card">
                      <strong>{roleInfo.name}</strong>
                      <p>{roleInfo.description}</p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => ask(roleInfo.question)}
                        disabled={loading}
                      >
                        Ask about this role
                      </button>
                    </div>
                  ) : (
                    <p className="pitch-hint">
                      {selected.summary} Tap a player to see their role.
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </section>

        {/* Chat panel */}
        <section className="chat-panel" aria-label="Chat">
          <div className="level-bar">
            <span className="level-label">Answer style</span>
            <div className="level-toggle" role="group" aria-label="Answer style">
              <button
                type="button"
                className={`level-btn${level === "beginner" ? " level-active" : ""}`}
                onClick={() => setLevel("beginner")}
                aria-pressed={level === "beginner"}
              >
                Beginner
              </button>
              <button
                type="button"
                className={`level-btn${level === "detailed" ? " level-active" : ""}`}
                onClick={() => setLevel("detailed")}
                aria-pressed={level === "detailed"}
              >
                Detailed
              </button>
            </div>
          </div>

          <div className="messages">
            {messages.length === 0 && !loading && (
              <div className="empty">
                <p>Ask anything about tactics, roles, managers or the laws of the game.</p>
                <div className="chip-row">
                  {EXAMPLES.map((ex) => (
                    <button
                      type="button"
                      key={ex}
                      className="chip"
                      onClick={() => ask(ex)}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => {
              if (m.role === "user") {
                return (
                  <div key={i} className="bubble-user">
                    {m.content}
                  </div>
                );
              }

              if (m.error) {
                return (
                  <p key={i} className="error-text">
                    {m.content}
                  </p>
                );
              }

              return (
                <div key={i} className="answer">
                  <div className={m.answered ? "answer-body" : "answer-body answer-fallback"}>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>

                  {m.sources.length > 0 && (
                    <div className="sources">
                      <strong>Sources</strong>
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

            {loading && <p className="thinking">Thinking...</p>}
            <div ref={bottomRef} />
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about football..."
              enterKeyHint="send"
              aria-label="Your question"
            />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "..." : "Ask"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}