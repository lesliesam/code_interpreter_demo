import fs from 'fs'
import OpenAI from 'openai'
import { config } from 'dotenv'

config()

const openai = new OpenAI(process.env.OPENAI_API_KEY)

export async function uploadFile (fileDir, purpose) {
  const file = await openai.files.create({
    file: fs.createReadStream(fileDir),
    purpose
  })

  console.log(file)
  return file
}

export async function createAssistant (
  name,
  instructions,
  model,
  tools,
  tool_resources
) {
  const assistant = await openai.beta.assistants.create({
    instructions,
    name,
    tools,
    tool_resources,
    model
  })

  console.log(assistant)
  return assistant
}

export async function getAssistantById (assistantId) {
  const assistant = await openai.beta.assistants.retrieve(assistantId)

  console.log(assistant)
  return assistant
}

export async function createChatThread () {
  const chatThread = await openai.beta.threads.create()

  console.log(chatThread)
  return chatThread
}

export async function getChatThreadById (chatThreadId) {
  const thread = await openai.beta.threads.retrieve(chatThreadId)

  console.log(thread)
  return thread
}

export async function createMessageOnThread (threadId, message) {
  const threadMessages = await openai.beta.threads.messages.create(
    threadId,
    message
  )

  console.log(threadMessages)
  return threadMessages
}

export async function createRun (threadId, assistant_id, stream) {
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id,
    stream
  })

  if (stream) {
    for await (const event of run) {
      console.log(event)
    }
  } else {
    console.log(run)
  }

  return run
}

export async function listRunByThread(threadId) {
  const runs = await openai.beta.threads.runs.list(
    threadId
  );

  console.log(runs);
  if (runs.data.length > 0) {
    return runs.data[0]
  } else {
    return null;
  }
}

export async function retrieveRunUntilComplete (threadId, runId) {
  const run = await openai.beta.threads.runs.retrieve(threadId, runId)
  console.log(run)

  if (run.status !== 'completed') {
    console.log('Status is not completed. Retrying...')

    // Wait for 1 second (1000 milliseconds)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Recursively call retrieveRun
    return retrieveRunUntilComplete(threadId, runId)
  }

  console.log('Status is completed.')
  return run
}

export async function listThreadMessages (threadId) {
  const threadMessages = await openai.beta.threads.messages.list(threadId)

  console.log(JSON.stringify(threadMessages, null, 2))
  return threadMessages
}
