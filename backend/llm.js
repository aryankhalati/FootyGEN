import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Football persona. In Row 8 we extend this with "answer only from the docs".
const SYSTEM_PROMPT =
  "You are FootyGEN, a football knowledge assistant. " +
  "Answer clearly and concisely in plain language. " +
  "If you are not sure about something, say so instead of guessing.";

// One function that talks to Groq. The rest of the backend calls this.
export async function askLLM(userMessage, systemPrompt = SYSTEM_PROMPT) {
  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL,
    temperature: 0.2, // low = consistent answers
    max_tokens: 1000, // ceiling on reply length (thinking tokens count too)
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  return completion.choices[0].message.content;
}