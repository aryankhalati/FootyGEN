import { askLLM } from "./llm.js";

async function run() {
  console.log("Q1: What is the offside rule?");
  console.log(await askLLM("What is the offside rule?"));

  console.log("\nQ2: What is a false 9?");
  console.log(await askLLM("What is a false 9?"));

  console.log("\nQ3: Who are you?");
  console.log(await askLLM("Who are you?"));
}

run();