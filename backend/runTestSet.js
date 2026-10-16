import fs from "fs";
import { answerQuestion } from "./rag.js";
import { testSet } from "./testSet.js";

// Lowercase, turn all hyphens into spaces, drop apostrophes and punctuation.
function normalize(s) {
  return String(s)
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212-]/g, " ")
    .replace(/['\u2019`]/g, "")
    .replace(/[^a-z0-9\u00c0-\u024f ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Whole-word/phrase match, so "5" does not match "15".
function hasPhrase(text, phrase) {
  return (" " + text + " ").includes(" " + normalize(phrase) + " ");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];

for (let i = 0; i < testSet.length; i++) {
  const t = testSet[i];
  const id = String(i + 1).padStart(2, "0");
  const r = { id, category: t.category, question: t.question, pass: false, retrievalHit: null };

  try {
    const res = await answerQuestion(t.question);
    const answer = res.answer ?? "";
    const sources = res.sources ?? [];
    const text = normalize(answer);

    r.answer = answer;
    r.answered = res.answered;
    r.topScore = res.topScore;
    r.sources = sources.map((s) => `${s.title} > ${s.section}`);

    if (t.expectAnswered === false) {
      r.pass = res.answered === false;
      if (!r.pass) r.reason = "should have refused, but answered";
    } else {
      const missing = (t.mustInclude ?? []).filter(
        (group) => !group.some((p) => hasPhrase(text, p))
      );
      r.missing = missing.map((g) => g.join(" | "));
      const answeredOk = res.answered !== false && sources.length > 0;
      r.pass = answeredOk && missing.length === 0;
      if (!answeredOk) r.reason = "refused or returned no sources";
      else if (missing.length) r.reason = "answer is missing expected keywords";

      // Retrieval check (reported separately from the pass/fail score).
      if (t.source) {
        const hay = normalize(r.sources.join(" "));
        r.retrievalHit = t.source.some((h) => hay.includes(normalize(h)));
      }
    }
  } catch (err) {
    r.reason = "ERROR: " + err.message;
  }

  results.push(r);
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${id}  [${r.category}]  ${r.question}`);
  await sleep(400);
}

// ---------- Summary ----------
const passed = results.filter((r) => r.pass).length;
console.log("\n" + "=".repeat(70));
console.log(`SCORE: ${passed}/${results.length}`);

const byCat = {};
for (const r of results) {
  byCat[r.category] ??= { pass: 0, total: 0 };
  byCat[r.category].total++;
  if (r.pass) byCat[r.category].pass++;
}
for (const [cat, v] of Object.entries(byCat)) {
  console.log(`  ${cat.padEnd(13)} ${v.pass}/${v.total}`);
}

const retr = results.filter((r) => r.retrievalHit !== null);
const retrHits = retr.filter((r) => r.retrievalHit).length;
console.log(`RETRIEVAL: right doc cited in ${retrHits}/${retr.length} in-scope questions`);

// ---------- Failure details ----------
const failures = results.filter((r) => !r.pass);
if (failures.length) {
  console.log("\n" + "=".repeat(70));
  console.log("FAILURES");
  for (const r of failures) {
    console.log(`\n#${r.id} [${r.category}] ${r.question}`);
    console.log("  reason :", r.reason);
    if (r.missing?.length) console.log("  missing:", r.missing.join("  ||  "));
    console.log("  answered:", r.answered, "| topScore:", r.topScore);
    console.log("  sources :", (r.sources ?? []).join("  ;  ") || "(none)");
    console.log("  answer  :", r.answer);
  }
}

const wrongDoc = results.filter((r) => r.pass && r.retrievalHit === false);
if (wrongDoc.length) {
  console.log("\nPassed but cited an unexpected doc (check these):");
  for (const r of wrongDoc) console.log(`  #${r.id} ${r.question} -> ${r.sources.join("  ;  ")}`);
}

fs.writeFileSync(
  "testResults.json",
  JSON.stringify({ date: new Date().toISOString(), score: `${passed}/${results.length}`, results }, null, 2)
);
console.log("\nSaved full results to testResults.json");
process.exit(failures.length ? 1 : 0);