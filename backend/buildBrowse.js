import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { loadDocs } from "./loader.js";
import { chunkAll } from "./chunker.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Categories shown in the sidebar, in this order (no players)
const ORDER = ["formations", "tactics", "roles", "managers", "laws"];

async function run() {
  const docs = await loadDocs();
  const chunks = chunkAll(docs);

  // Collect unique doc titles per category
  const byCategory = {};
  for (const c of chunks) {
    const { category, title } = c.metadata;
    if (!category || !title) continue;
    if (!byCategory[category]) byCategory[category] = new Set();
    byCategory[category].add(title);
  }

  const browse = ORDER.filter((cat) => byCategory[cat]).map((cat) => ({
    category: cat,
    docs: [...byCategory[cat]].sort().map((title) => ({ title })),
  }));

  writeFileSync(path.join(__dirname, "browse.json"), JSON.stringify(browse, null, 2));

  const total = browse.reduce((n, g) => n + g.docs.length, 0);
  console.log(`Wrote browse.json: ${browse.length} categories, ${total} docs`);
  for (const g of browse) console.log(`  ${g.category}: ${g.docs.length}`);
}

run().catch((err) => {
  console.error("buildBrowse failed:", err);
  process.exit(1);
});