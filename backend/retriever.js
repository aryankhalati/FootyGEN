import "dotenv/config";
import { pc, embedQuery } from "./embedder.js";

const index = pc.index(process.env.PINECONE_INDEX);

export const TOP_K = 6;
export const MIN_TOP_SCORE = 0.2; // provisional floor, only catches obvious junk

export async function retrieve(question) {
  const vector = await embedQuery(question);
  const result = await index.query({ vector, topK: TOP_K, includeMetadata: true });

  const matches = result.matches.map((m) => ({
    id: m.id,
    score: m.score,
    title: m.metadata.title,
    section: m.metadata.section,
    text: m.metadata.text,
  }));

  const topScore = matches[0]?.score ?? 0;
  return { matches, topScore, inScope: topScore >= MIN_TOP_SCORE };
}