# ROW 1
what an LLM is, and reasoning models vs fast GPT-style models
-> it is model which is used for generating text reasoning models are used for deep thinking, research or heavy tasks, gpt style for quick answers

what a token is
-> smallest unit of text which a model processes

what context and the context window are
-> context -> everything the model sees going in: your instructions, the user’s question, message history
-> context window -> The context window is a per-conversation size limit that counts input and output tokens together. If the prompt is huge, there’s less room left for the answer. Nothing resets over time.

what inference is
-> process of entering a prompt, model understanding it, processing it, and giving appropriate answer

why .env stays out of GitHub
-> so that api keys are not pushed which can be security risks, anyone with your key can use up your quota.

# ROW 2
prompt - the text we write on chatbot which gives us answer it has following components
input, instruction, context, output indicator

zero shot prompting - we dont give any eg to the model we directly write a prompt 
few shot prompting - we give an eg to the model so that it can overcome the shortcomings of 0 shot and also give better response

# ROW 3
max tokens = the cap on how long one reply can be. If the reply hits it, it gets cut off.
temperature 0 -> very similar answer
temperature 2 -> very varied answers
top -p is an alternative to temperature and it works on probability

prompt writing
safe silent summary types
give clear instructions of what u want 
and always provide the context like summary or analysis or deepdive etc

RAG
had some randome names of players who dont exist so when we use rag it will only use info from my docs