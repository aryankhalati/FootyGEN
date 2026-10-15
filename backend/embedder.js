import "dotenv/config";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first"); // fixes ECONNRESET on networks with flaky IPv6
import { Pinecone } from "@pinecone-database/pinecone";

export const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const BATCH_SIZE = 50; // embed in small batches to stay under API limits

async function embed(texts, inputType) {
  const vectors = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const result = await pc.inference.embed({
      model: process.env.EMBED_MODEL,
      inputs: batch,
      parameters: { inputType },
    });
    vectors.push(...result.data.map((d) => d.values));
  }
  return vectors;
}

// Docs are embedded as "passage", questions as "query" (this model expects both)
export function embedPassages(texts) {
  return embed(texts, "passage");
}

export async function embedQuery(question) {
  const [vector] = await embed([question], "query");
  return vector;
}