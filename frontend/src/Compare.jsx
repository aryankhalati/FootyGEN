import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Pitch from "./Pitch";

const API = import.meta.env.VITE_API_URL;

export default function Compare({ formations }) {
  const [aId, setAId] = useState(formations[0]?.id || "");
  const [bId, setBId] = useState(formations[1]?.id || formations[0]?.id || "");
  const [result, setResult] = useState(null); // { answer, sources, answered }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const a = formations.find((f) => f.id === aId);
  const b = formations.find((f) => f.id === bId);
  const canCompare = aId && bId && aId !== bId && !loading;

  function pick(setter, id) {
    setter(id);
    setResult(null);
    setError("");
  }

  async function compare() {
    if (!canCompare) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: aId, b: bId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult({
        answer: data.answer,
        sources: data.sources || [],
        answered: data.answered !== false,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="compare-view" aria-label="Compare formations">
      <div className="compare-inner">
        <div className="compare-grid">
          <div className="compare-side">
            <select
              className="select"
              value={aId}
              onChange={(e) => pick(setAId, e.target.value)}
              aria-label="First formation"
            >
              {formations.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            {a && <Pitch players={a.players} />}
          </div>

          <div className="compare-side">
            <select
              className="select"
              value={bId}
              onChange={(e) => pick(setBId, e.target.value)}
              aria-label="Second formation"
            >
              {formations.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            {b && <Pitch players={b.players} />}
          </div>
        </div>

        <div className="compare-actions">
          <button className="btn btn-primary" onClick={compare} disabled={!canCompare}>
            {loading ? "Comparing..." : "Compare"}
          </button>
          {aId === bId && <p className="pitch-hint">Pick two different formations.</p>}
        </div>

        {error && <p className="error-text">{error}</p>}

        {result && (
          <div className="answer compare-result">
            <div className={result.answered ? "answer-body" : "answer-body answer-fallback"}>
              <ReactMarkdown>{result.answer}</ReactMarkdown>
            </div>

            {result.sources.length > 0 && (
              <div className="sources">
                <strong>Sources</strong>
                <ul>
                  {result.sources.map((s, j) => (
                    <li key={j}>
                      {s.title} · {s.section}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}