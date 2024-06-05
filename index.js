
import {
  uploadFile,
  createAssistant,
  getAssistantById,
  createChatThread,
  createMessageOnThread,
  createRun,
  listRunByThread,
  retrieveRunUntilComplete,
  listThreadMessages
} from './openai.js';

/////////////////////////////
// 1. Create a new assistant
// fileId eg: asst_JL3IS43WvG8FQWDnUYiUdI4m
/////////////////////////////
const file = await uploadFile(
  'csv/data-downloadAt-050624-1127.csv', 
  "assistants"
);

/////////////////////////////
// 1. Create a new assistant
// assistantId eg: asst_JL3IS43WvG8FQWDnUYiUdI4m
/////////////////////////////
const assistant = await createAssistant(
  "Math Tutor with file", 
  "You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
  "gpt-4-turbo",
  [{ type: "code_interpreter" }],
  {"code_interpreter": {"file_ids": [file.id]}}
);
// /////////////////////////////
// // // Or get existing one.
// /////////////////////////////
// // const assistant = await getAssistantById('asst_JL3IS43WvG8FQWDnUYiUdI4m');


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
  { role: "user", content: "Can you tell me the avg Asking Rent of these properties?" }
);

/////////////////////////////
// 4. Run the thread on assistant
// runId eg: run_ZJWV7Lj1UIFOu8xcxFiUwTTZ
/////////////////////////////
await createRun(thread.id, assistant.id, true);

/////////////////////////////
// 5. Get the run result
/////////////////////////////
const run = await listRunByThread(thread.id);

await retrieveRunUntilComplete(thread.id, run.id); 
await listThreadMessages(thread.id);

