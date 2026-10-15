import "dotenv/config";
import { loadDocs } from "./loader.js";
import { chunkAll } from "./chunker.js";
import { pc, embedPassages } from "./embedder.js";

const index = pc.index(process.env.PINECONE_INDEX);
const UPSERT_BATCH = 100;

async function run() {
  // 1. Load and chunk
  const docs = await loadDocs();
  const chunks = chunkAll(docs);
  console.log(`Loaded ${docs.length} docs, ${chunks.length} chunks`);

  // 2. Embed every chunk's text
  const vectors = await embedPassages(chunks.map((c) => c.text));
  console.log(`Embedded ${vectors.length} chunks (${vectors[0].length} numbers each)`);

  // 3. Clear old records so a re-ingest never leaves stale chunks behind
    try {
    await index.deleteAll();
    console.log("Cleared old records");
  } catch (err) {
    console.log(`Nothing cleared (${err.name}: ${err.message})`);
  }

  // 4. Upsert: id + vector + metadata (text is stored so retrieval returns it directly)
  const records = chunks.map((c, i) => ({
    id: c.id,
    values: vectors[i],
    metadata: { ...c.metadata, text: c.text },
  }));

  for (let i = 0; i < records.length; i += UPSERT_BATCH) {
    await index.upsert({ records: records.slice(i, i + UPSERT_BATCH) });
  }
  console.log(`Upserted ${records.length} records into "${process.env.PINECONE_INDEX}"`);
}

run().catch((err) => {
  console.error("Ingest failed:", err);
  process.exit(1);
});