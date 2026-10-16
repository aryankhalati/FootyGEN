import "dotenv/config";
import { pc, embedQuery } from "./embedder.js";

const index = pc.index(process.env.PINECONE_INDEX);

export const TOP_K = 6;
export const MIN_TOP_SCORE = 0.3; // retuned for the 39-doc knowledge base

export const CATEGORIES = ["laws", "formations", "roles", "tactics", "managers", "players"];

// category is optional: pass one of CATEGORIES to search only that group of docs
export async function retrieve(question, category) {
  const vector = await embedQuery(question);

  const query = { vector, topK: TOP_K, includeMetadata: true };
  if (category) query.filter = { category: { $eq: category } };

  const result = await index.query(query);

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