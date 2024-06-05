import OpenAI from "openai";
import { config } from 'dotenv';

config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

/////////////////////////////
// 1. Create a new assistant
// assistantId eg: asst_JL3IS43WvG8FQWDnUYiUdI4m
/////////////////////////////
// const assistant = await createAssistant(
//   "Math Tutor", 
//   "You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
//   "gpt-4-turbo",
//   [{ type: "code_interpreter" }]
// );
// Or get existing one.
const assistant = await getAssistantById('asst_JL3IS43WvG8FQWDnUYiUdI4m');


/////////////////////////////
// 2. Create a chat thread
// threadId eg: thread_stjNHFGKkFTCsjnYUj62kvqC
/////////////////////////////
const thread = await createChatThread();

/////////////////////////////
// 3. Create a message on thread
/////////////////////////////
await createMessageOnThread(
  thread.id,
  { role: "user", content: "What is the sqrt of 125?" }
);

/////////////////////////////
// 4. Run the thread on assistant
// runId eg: run_ZJWV7Lj1UIFOu8xcxFiUwTTZ
/////////////////////////////
let run = await createRun(thread.id, assistant.id);

/////////////////////////////
// 5. Get the run result
/////////////////////////////
await retrieveRunUntilComplete(thread.id, run.id); 
await listThreadMessages(thread.id);


async function createAssistant(name, instructions, model, tools) {
  const assistant = await openai.beta.assistants.create({
    instructions,
    name,
    tools,
    model,
  });

  console.log(assistant);
  return assistant;
}


async function getAssistantById(assistantId) {
  const assistant = await openai.beta.assistants.retrieve(
    assistantId
  );

  console.log(assistant);
  return assistant;
}


async function createChatThread() {
  const chatThread = await openai.beta.threads.create();

  console.log(chatThread);
  return chatThread;
}


async function getChatThreadById(chatThreadId) {
  const thread = await openai.beta.threads.retrieve(
    chatThreadId
  );

  console.log(thread);
  return thread;
}


async function createMessageOnThread(threadId, message) {
  const threadMessages = await openai.beta.threads.messages.create(
    threadId,
    message
  );

  console.log(threadMessages);
  return threadMessages;
}


async function createRun(threadId, assistant_id) {
  const run = await openai.beta.threads.runs.create(
    threadId,
    { assistant_id }
  );

  console.log(run);
  return run;
}


async function retrieveRunUntilComplete(threadId, runId) {
  const run = await openai.beta.threads.runs.retrieve(threadId, runId);
  console.log(run);
  
  if (run.status !== 'completed') {
    console.log("Status is not completed. Retrying...");

    // Wait for 1 second (1000 milliseconds)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Recursively call retrieveRun
    return retrieveRunUntilComplete(threadId, runId);
  }
  
  console.log("Status is completed.");
  return run;
}


async function listThreadMessages(threadId) {
  const threadMessages = await openai.beta.threads.messages.list(
    threadId
  );
  
  console.log(JSON.stringify(threadMessages, null, 2));
  return threadMessages
}