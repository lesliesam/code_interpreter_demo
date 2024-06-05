import {
  createAssistant,
  getAssistantById,
  createChatThread,
  createMessageOnThread,
  createRun,
  listRunByThread,
  submitToolOutputs,
  retrieveRunUntilComplete,
  listThreadMessages
} from './openai.js'

/////////////////////////////
// 1. Create a new assistant
// assistantId eg: asst_qSVhVDLpLFQMUQ03GyJNT8y4
/////////////////////////////
// const assistant = await createAssistant(
//   'Math Tutor with function',
//   'You are a loan underwriter. Use the provided functions to answer questions.',
//   'gpt-3.5-turbo',
//   [
//     {
//       type: 'function',
//       function: {
//         name: 'getLoanRate',
//         description: 'Get the loan rate of the Bank of American',
//         parameters: {
//           type: 'object',
//           properties: {
//             location: {
//               type: 'string',
//               description: 'The city and state e.g. San Francisco, CA'
//             },
//             unit: { type: 'string' }
//           },
//           required: ['location']
//         }
//       }
//     }
// //   ]
// // )
///////////////////////////
// Or get existing one.
///////////////////////////
const assistant = await getAssistantById('asst_qSVhVDLpLFQMUQ03GyJNT8y4')

/////////////////////////////
// 2. Create a chat thread
// threadId eg: thread_stjNHFGKkFTCsjnYUj62kvqC
/////////////////////////////
const thread = await createChatThread()

/////////////////////////////
// 3. Create a message on thread
/////////////////////////////
await createMessageOnThread(thread.id, {
  role: 'user',
  content: 'What is the loan rate in New York city recently?'
})

/////////////////////////////
// 4. Run the thread on assistant
// runId eg: run_ZJWV7Lj1UIFOu8xcxFiUwTTZ
/////////////////////////////
await createRun(thread.id, assistant.id, true)

/////////////////////////////
// 5. Generate function call result
/////////////////////////////
const run = await listRunByThread(thread.id)
if (run.status == 'requires_action') {
  const toolCalls = run.required_action.submit_tool_outputs.tool_calls
  console.log(JSON.stringify(toolCalls))

  // Summarize outputs into the tool_outputs
  const tool_outputs = []
  for (const toolCall of toolCalls) {
    // Loop through each function call
    if (toolCall.type === 'function') {
      // Get the function name and args
      const functionId = toolCall.id
      const functionName = toolCall.function.name
      const functionArguments = JSON.parse(toolCall.function.arguments)

      // Use Reflect to invoke the target function.
      const toolCallFunctions = await import('./toolCallFunctions.js')
      const functionObject = Reflect.get(toolCallFunctions, functionName)
      if (functionObject) {
        const result = await asyncReflect(functionObject, functionArguments)
        console.log(result)

        tool_outputs.push({
          tool_call_id: functionId,
          output: result
        })
      } else {
        console.error(`Function Not found: ${functionName}`)
      }
    }
  }

  /////////////////////////////
  // 6. Submit call result
  /////////////////////////////
  await submitToolOutputs(thread.id, run.id, tool_outputs);
}

await retrieveRunUntilComplete(thread.id, run.id); 
await listThreadMessages(thread.id);


async function asyncReflect (functionObject, functionArgs) {
  const resultPromise = Reflect.apply(
    functionObject,
    null,
    Object.values(functionArgs)
  )
  const result = await resultPromise
  return result
}
