const MAX_WORDS = 250; // sections longer than this get split
const OVERLAP_WORDS = 40; // words repeated between split parts

// Splits one long section into overlapping windows of words
function splitLongText(text) {
  const words = text.split(/\s+/);
  if (words.length <= MAX_WORDS) return [text];

  const parts = [];
  const step = MAX_WORDS - OVERLAP_WORDS;
  for (let start = 0; start < words.length; start += step) {
    parts.push(words.slice(start, start + MAX_WORDS).join(" "));
    if (start + MAX_WORDS >= words.length) break;
  }
  return parts;
}

// Turns one doc into chunks, one per "##" section
export function chunkDoc(doc) {
  // Part [0] is the "# Title" line before the first "##", so we drop it
  const sections = doc.content.split(/^## /m).slice(1);
  const slug = doc.source.split("/").pop().replace(".md", "");
  const chunks = [];
  let n = 0;

  for (const section of sections) {
    const newline = section.indexOf("\n");
    if (newline === -1) continue;
    const heading = section.slice(0, newline).trim();
    const body = section.slice(newline + 1).trim();
    if (!body) continue;

    const aka = doc.aliases.length ? ` | also known as: ${doc.aliases.join(", ")}` : "";
    const header = `${doc.title} | ${doc.category}${aka} | ${heading}`;

    for (const part of splitLongText(body)) {
      n++;
      chunks.push({
        id: `${slug}#${String(n).padStart(2, "0")}`,
        text: `${header}\n${part}`,
        metadata: {
          title: doc.title,
          category: doc.category,
          tags: doc.tags,
          section: heading,
          source: doc.source,
        },
      });
    }
  }
  return chunks;
}

export function chunkAll(docs) {
  return docs.flatMap(chunkDoc);
}