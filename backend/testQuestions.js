import * as rag from "./rag.js";

const questions = [
  "How long can a goalkeeper hold the ball?",
  "Who manages Manchester City?",
  "Can VAR review a second yellow card?",
  "What gets a red card?",
  "What did Mourinho win with Porto?",
  "Who won the 2018 World Cup?", // not in the docs: should say it doesn't know
];

const candidates = ["answerQuestion", "answer", "ask", "askFootyGen", "chat", "query", "runRag", "generateAnswer"];
const fnName =
  candidates.find((n) => typeof rag[n] === "function") ??
  (typeof rag.default === "function" ? "default" : null);

if (!fnName) {
  console.log("Couldn't find the question function. Exports in rag.js:", Object.keys(rag));
  process.exit(1);
}

const fn = fnName === "default" ? rag.default : rag[fnName];
console.log(`Using rag.${fnName}()\n`);

for (const q of questions) {
  console.log("=".repeat(70));
  console.log("Q:", q);
  try {
    const result = await fn(q);
    if (typeof result === "string") console.log("A:", result);
    else console.dir(result, { depth: 4 });
  } catch (err) {
    console.log("ERROR:", err.message);
  }
  console.log();
}

process.exit(0);