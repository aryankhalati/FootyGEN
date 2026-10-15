import { loadDocs } from "./loader.js";
import { chunkAll } from "./chunker.js";

const docs = await loadDocs();
console.log(`Loaded ${docs.length} docs`);

const chunks = chunkAll(docs);
for (const d of docs) {
  const count = chunks.filter((c) => c.metadata.source === d.source).length;
  console.log(`  ${d.source}: ${count} chunks`);
}
console.log(`Total chunks: ${chunks.length}`);

const sizes = chunks.map((c) => c.text.split(/\s+/).length);
console.log(`Shortest: ${Math.min(...sizes)} words, longest: ${Math.max(...sizes)} words`);

console.log("\n--- Sample chunk ---");
console.log(chunks[5].text);
console.log(chunks[5].id, chunks[5].metadata);