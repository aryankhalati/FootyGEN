import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.join(__dirname, "..", "docs");

const VALID_CATEGORIES = [
  "laws",
  "formations",
  "roles",
  "tactics",
  "managers",
  "players",
];

// Reads every doc in /docs (including subfolders) and returns clean objects
export async function loadDocs() {
  const entries = await fs.readdir(DOCS_DIR, { recursive: true });
  const docs = [];

  for (const entry of entries) {
    const fileName = path.basename(entry);
    // Only .md files, and skip _template.md
    if (!entry.endsWith(".md") || fileName.startsWith("_")) continue;

    const raw = await fs.readFile(path.join(DOCS_DIR, entry), "utf8");
    const { data, content } = matter(raw);

    // Fail loudly on bad front matter so a typo never reaches the index
    if (!data.title) throw new Error(`${entry}: missing title`);
    if (!VALID_CATEGORIES.includes(data.category)) {
      throw new Error(`${entry}: category must be one of ${VALID_CATEGORIES.join(", ")}`);
    }

    docs.push({
      source: entry.replaceAll("\\", "/"),
      title: data.title,
      category: data.category,
      tags: (data.tags || []).map(String),
      aliases: (data.aliases || []).map(String),
      content: content.replace(/\r\n/g, "\n"), // Windows line endings
    });
  }

  return docs;
}