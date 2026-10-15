import "dotenv/config";
import { pc, embedQuery } from "./embedder.js";

const index = pc.index(process.env.PINECONE_INDEX);

// Usage: node quickCheck.js "your question"
const question = process.argv[2] || "How does a false 9 work?";

const stats = await index.describeIndexStats();
console.log("Index stats:", JSON.stringify(stats, null, 2));

const vector = await embedQuery(question);
const result = await index.query({ vector, topK: 3, includeMetadata: true });

console.log(`\nTop 3 for: "${question}"`);
for (const m of result.matches) {
  console.log(`${m.score.toFixed(3)}  ${m.metadata.title} > ${m.metadata.section}`);
}