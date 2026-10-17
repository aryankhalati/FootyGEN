# FootyGEN

A football tactics Q&A app. Ask about formations, roles, managers, tactics or the laws of the game and get an answer grounded in a small knowledge base, with the sources shown under every answer.

**Live app:** https://footy-gen.vercel.app
**Backend:** https://footygen.onrender.com (try `/health`)

> The first request after a quiet period can take 30 to 60 seconds, because the free Render instance sleeps when idle.

## Features

- **Chat** with sources under every answer, and memory so follow-ups like "what about the 4-4-2?" work
- **Beginner / Detailed** answer style toggle
- **Interactive pitch:** pick a formation, see all 11 players, tap a player to read about their role
- **Compare** two formations side by side, with a six-section written comparison
- **Browse** every topic in the knowledge base, grouped by category, and ask about any of them in one tap
- **Honest fallback:** questions outside football tactics get a clear "outside what I cover" message instead of a made-up answer
- Works on mobile

## How it works

This is a RAG (retrieval-augmented generation) app.

1. The 39 markdown docs in `docs/` are split into 323 chunks, embedded, and stored in Pinecone (`node ingest.js`).
2. When you ask a question, it is embedded and the 6 closest chunks are retrieved.
3. If the best match scores below 0.3, the app refuses without calling the model (cheap gate).
4. Otherwise the chunks go to the LLM with instructions to answer **only** from the excerpts. The model can also reply `NOT_COVERED`, which triggers the same fallback (second gate).
5. The model reports which excerpts it used, and only those are shown as sources.
6. For follow-up questions, the last few messages are used to rewrite the question into a standalone one before retrieval.

## Tech stack

| Part | Tech |
|---|---|
| Frontend | Vite, React, plain CSS, react-markdown (hosted on Vercel) |
| Backend | Node.js, Express 5, ES modules (hosted on Render) |
| LLM | `openai/gpt-oss-120b` via Groq |
| Embeddings | `llama-text-embed-v2` (1024 dimensions) |
| Vector DB | Pinecone |

## Knowledge base

39 docs, 323 chunks, in five categories: formations (5), tactics (10), roles (11), managers (6), laws (7). Each doc follows the template in `docs/_template.md`.

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/formations`, `/formations/:id` | Formation data for the pitch |
| GET | `/positions` | Role descriptions |
| GET | `/browse` | Docs grouped by category |
| POST | `/ask` | `{ question, category?, history?, level? }` returns `{ answer, sources, topScore, answered }` |
| POST | `/compare` | `{ a, b }` (formation ids) returns the same shape |

`level` is `"beginner"` or `"detailed"`. `/ask` and `/compare` share a rate limit of 20 requests per minute per visitor. CORS is restricted to the Vercel URL and localhost.

## Evaluation

`backend/testSet.js` holds 40 questions (laws 12, managers 8, roles 5, tactics 6, formations 4, out-of-scope 4, cross-doc 1). `backend/runTestSet.js` runs them and checks that:

- the answer contains the expected keywords (synonyms allowed),
- the right doc is cited (reported separately), and
- out-of-scope questions are refused.

Results:

- **First run: 35/40.** All five misses were correct answers worded differently from the test keywords (for example "opposing team" instead of "opponents"), so I widened the keyword lists.
- **Later runs: 34 to 39 out of 40.** The model words answers slightly differently each run, so one or two keyword checks flip between runs.
- **One real bug found:** the question "What does DOGSO mean?" was refused, because the acronym was buried in the doc text and the question scored 0.229, below the 0.3 cutoff. Putting the acronym in the section heading and re-ingesting fixed it.
- **Best runs: 39/40**, with 4/4 out-of-scope refusals and the correct doc cited on 36/36 in-scope questions.
- A later run was cut off by the Groq free-tier daily token limit and is not a valid result.

Run it yourself from `backend`: `node runTestSet.js` (uses roughly 60,000 Groq tokens per run).

## Run locally

You need Node 20 or newer, a Groq API key and a Pinecone index.

```bash
# backend
cd backend
npm install
```

Create `backend/.env`:

```
PORT=5000
GROQ_API_KEY=
PINECONE_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
EMBED_MODEL=llama-text-embed-v2
PINECONE_INDEX=
FRONTEND_URL=
```

```bash
node ingest.js      # embed the docs and upload to Pinecone (one time, and after doc edits)
npm run dev         # starts the API on port 5000
```

```bash
# frontend (new terminal)
cd frontend
npm install
```

Create `frontend/.env.local`:

```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev         # opens on http://localhost:5173
```

After editing any doc, run `node ingest.js` again. If you add or remove docs, run `node buildBrowse.js` too and commit the new `browse.json`, because the deployed server cannot read the `docs/` folder.

## Project structure

```
FootyGEN/
  docs/         knowledge base (formations, laws, managers, roles, tactics)
  backend/      Express API, RAG pipeline, ingest and eval scripts
  frontend/     React app
```

## Known limitations

- **Groq free tier:** a limit of 200,000 tokens per day is shared by every visitor. When it runs out, chat, Compare and Browse questions fail until it resets.
- **Cold starts:** the free Render instance sleeps after about 15 minutes idle.
- **Compare sources** list every retrieved chunk rather than only the ones the model used.
- **Detailed mode** is told to use only the excerpts, but long answers can occasionally add outside knowledge. The eval does not measure this yet.
- **Scope:** no player biographies. The knowledge base covers tactics, roles, managers and the laws only.