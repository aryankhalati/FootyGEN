import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const sentences = [
  "The false 9 drops deep to create space for the wingers.",
  "A centre-forward who drops into midfield pulls defenders out of position.",
  "The referee showed a red card for a dangerous tackle.",
];

// Cosine similarity: closer to 1 means closer in meaning
function cosine(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function run() {
  // Turn all 3 sentences into vectors in one call
 const result = await pc.inference.embed({
  model: process.env.EMBED_MODEL,
  inputs: sentences,
  parameters: { inputType: "passage" },
});
  const vectors = result.data.map((d) => d.values);

  console.log("Vector length:", vectors[0].length);

  // Compare every pair
  const pairs = [];
  for (let i = 0; i < sentences.length; i++) {
    for (let j = i + 1; j < sentences.length; j++) {
      pairs.push({ a: i + 1, b: j + 1, score: cosine(vectors[i], vectors[j]) });
    }
  }
  pairs.sort((x, y) => y.score - x.score);

  for (const p of pairs) {
    console.log(`Sentence ${p.a} vs ${p.b}: ${p.score.toFixed(3)}`);
  }
  console.log(`\nMost similar: sentence ${pairs[0].a} and sentence ${pairs[0].b}`);
}

run();