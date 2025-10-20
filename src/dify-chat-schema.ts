import { z } from "zod";

export const completionResponseSchema = z.object({
  id: z.string(),
  answer: z.string(),
  task_id: z.string(),
  conversation_id: z.string(),
  message_id: z.string(),
  metadata: z.object({
    usage: z.object({
      completion_tokens: z.number(),
      prompt_tokens: z.number(),
      total_tokens: z.number(),
    }),
  }),
});

export const errorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  status: z.number(),
});

// Define a base schema with common fields that all events might have
export const difyStreamEventBase = z
  .object({
    event: z.string(),
    conversation_id: z.string().optional(),
    message_id: z.string().optional(),
    task_id: z.string().optional(),
    created_at: z.number().optional(),
  })
  .passthrough();

// Create schemas for specific event types
export const workflowStartedSchema = difyStreamEventBase.extend({
  event: z.literal("workflow_started"),
  workflow_run_id: z.string(),
  data: z
    .object({
      id: z.string(),
      workflow_id: z.string(),
      created_at: z.number(),
      inputs: z.record(z.any()),
    })
    .passthrough(),
});

export const workflowFinishedSchema = difyStreamEventBase.extend({
  event: z.literal("workflow_finished"),
  workflow_run_id: z.string(),
  data: z
    .object({
      id: z.string(),
      workflow_id: z.string(),
      total_tokens: z.number(),
      created_at: z.number(),
      status: z.string(),
      outputs: z.record(z.any()),
      error: z.string(),
      elapsed_time: z.number(),
      total_steps: z.number(),
      created_by: z.object({
        id: z.string(),
        user: z.string(),
      }),
      finished_at: z.number(),
      exceptions_count: z.number(),
      files: z.array(z.any()),
    })
    .passthrough(),
});

export const nodeStartedSchema = difyStreamEventBase.extend({
  event: z.literal("node_started"),
  workflow_run_id: z.string(),
  data: z
    .object({
      id: z.string(),
      node_id: z.string(),
      node_type: z.string(),
      title: z.string(),
      index: z.number(),
      predecessor_node_id: z.string().nullable(),
      inputs: z.record(z.any()).nullable(),
      created_at: z.number(),
      extras: z.record(z.any()),
      parallel_id: z.string().nullable(),
      parallel_start_node_id: z.string().nullable(),
      parent_parallel_id: z.string().nullable(),
      parent_parallel_start_node_id: z.string().nullable(),
      iteration_id: z.string().nullable(),
      loop_id: z.string().nullable(),
      parallel_run_id: z.string().nullable(),
      agent_strategy: z.any().nullable(),
    })
    .passthrough(),
});

export const nodeFinishedSchema = difyStreamEventBase.extend({
  event: z.literal("node_finished"),
  workflow_run_id: z.string(),
  data: z
    .object({
      id: z.string(),
      node_id: z.string(),
      node_type: z.string(),
      title: z.string(),
      index: z.number(),
      predecessor_node_id: z.string().nullable(),
      inputs: z.record(z.any()).nullable(),
      process_data: z.any().nullable(),
      outputs: z.record(z.any()).nullable(), // Can be null
      status: z.string(),
      error: z.string().nullable(),
      elapsed_time: z.number(),
      execution_metadata: z.record(z.any()).nullable(), // Can be null
      created_at: z.number(),
      finished_at: z.number(),
      files: z.array(z.any()),
      parallel_id: z.string().nullable(),
      parallel_start_node_id: z.string().nullable(),
      parent_parallel_id: z.string().nullable(),
      parent_parallel_start_node_id: z.string().nullable(),
      iteration_id: z.string().nullable(),
      loop_id: z.string().nullable(),
    })
    .passthrough(),
});

export const messageSchema = difyStreamEventBase.extend({
  event: z.literal("message"),
  id: z.string().optional(),
  answer: z.string(),
  from_variable_selector: z.array(z.string()).optional(),
});

export const messageEndSchema = difyStreamEventBase.extend({
  event: z.literal("message_end"),
  id: z.string(),
  metadata: z
    .object({
      usage: z
        .object({
          prompt_tokens: z.number(),
          completion_tokens: z.number(),
          total_tokens: z.number(),
          prompt_unit_price: z.string(),
          prompt_price_unit: z.string(),
          prompt_price: z.string(),
          completion_unit_price: z.string(),
          completion_price_unit: z.string(),
          completion_price: z.string(),
          total_price: z.string(),
          currency: z.string(),
          latency: z.number(),
        })
        .passthrough(),
      annotation_reply: z.any().nullable(),
      retriever_resources: z.array(z.any()),
    })
    .passthrough(),
  files: z.array(z.any()),
  quoteInfo: z.record(z.any()),
});

export const ttsMessageSchema = difyStreamEventBase.extend({
  event: z.literal("tts_message"),
  audio: z.string(),
});

export const ttsMessageEndSchema = difyStreamEventBase.extend({
  event: z.literal("tts_message_end"),
  audio: z.string(),
});

export const pingSchema = difyStreamEventBase.extend({
  event: z.literal("ping"),
});

// {
// success: true,
//   value: {
//     event: 'agent_thought',
//     conversation_id: '6aa52695-406a-408a-898f-37946c44af19',
//     message_id: '6f8fafdd-b585-4067-bcc8-866026d67101',
//     task_id: 'eadf26b9-4c0f-4562-8cca-c1ce8e47399d',
//     created_at: 1749536594,
//     id: 'aeeec11f-d613-4616-844d-0c19f52bc59d',
//     position: 1,
//     thought: 'Hello! How can I assist you today? 😊',
//     observation: '',
//     tool: '',
//     tool_labels: {},
//     tool_input: '',
//     message_files: []
//   },
//   rawValue: {
//     event: 'agent_thought',
//     conversation_id: '6aa52695-406a-408a-898f-37946c44af19',
//     message_id: '6f8fafdd-b585-4067-bcc8-866026d67101',
//     created_at: 1749536594,
//     task_id: 'eadf26b9-4c0f-4562-8cca-c1ce8e47399d',
//     id: 'aeeec11f-d613-4616-844d-0c19f52bc59d',
//     position: 1,
//     thought: 'Hello! How can I assist you today? 😊',
//     observation: '',
//     tool: '',
//     tool_labels: {},
//     tool_input: '',
//     message_files: []
//   }
// }

// {
// success: true,
// value: {
//   event: 'message_end',
//   conversation_id: '6aa52695-406a-408a-898f-37946c44af19',
//   message_id: '6f8fafdd-b585-4067-bcc8-866026d67101',
//   task_id: 'eadf26b9-4c0f-4562-8cca-c1ce8e47399d',
//   created_at: 1749536594,
//   id: '6f8fafdd-b585-4067-bcc8-866026d67101',
//   metadata: { usage: [Object] },
//   files: null
// },
// rawValue: {
//   event: 'message_end',
//   conversation_id: '6aa52695-406a-408a-898f-37946c44af19',
//   message_id: '6f8fafdd-b585-4067-bcc8-866026d67101',
//   created_at: 1749536594,
//   task_id: 'eadf26b9-4c0f-4562-8cca-c1ce8e47399d',
//   id: '6f8fafdd-b585-4067-bcc8-866026d67101',
//   metadata: { usage: [Object] },
//   files: null
// }

// }

// {
// event: 'agent_message',
// conversation_id: '6aa52695-406a-408a-898f-37946c44af19',
// message_id: '6f8fafdd-b585-4067-bcc8-866026d67101',
// task_id: 'eadf26b9-4c0f-4562-8cca-c1ce8e47399d',
// created_at: 1749536594,
// id: '6f8fafdd-b585-4067-bcc8-866026d67101',
// answer: ''
//

export const agentMessageSchema = difyStreamEventBase.extend({
  event: z.literal("agent_message"),
  answer: z.string(),
});

export const agentThoughtSchema = difyStreamEventBase.extend({
  event: z.literal("agent_thought"),
  thought: z.string(),
  observation: z.string(),
  tool: z.string(),
  tool_labels: z.record(z.string(), z.string()),
  tool_input: z.string(),
  message_files: z.array(z.unknown()),
});

// Combine all schemas with discriminatedUnion
export const difyStreamEventSchema = z
  .discriminatedUnion("event", [
    workflowStartedSchema,
    workflowFinishedSchema,
    nodeStartedSchema,
    nodeFinishedSchema,
    messageSchema,
    messageEndSchema,
    ttsMessageSchema,
    ttsMessageEndSchema,
    agentThoughtSchema,
    agentMessageSchema,
    pingSchema,
  ])
  .or(difyStreamEventBase); // Fallback for any other event types

// Export TypeScript types for each event schema
export type CompletionResponse = z.infer<typeof completionResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type DifyStreamEventBase = z.infer<typeof difyStreamEventBase>;

// Workflow event types
export type WorkflowStartedEvent = z.infer<typeof workflowStartedSchema>;
export type WorkflowFinishedEvent = z.infer<typeof workflowFinishedSchema>;

// Node event types
export type NodeStartedEvent = z.infer<typeof nodeStartedSchema>;
export type NodeFinishedEvent = z.infer<typeof nodeFinishedSchema>;

// Message event types
export type MessageEvent = z.infer<typeof messageSchema>;
export type MessageEndEvent = z.infer<typeof messageEndSchema>;

// TTS event types
export type TtsMessageEvent = z.infer<typeof ttsMessageSchema>;
export type TtsMessageEndEvent = z.infer<typeof ttsMessageEndSchema>;

// Agent event types
export type AgentMessageEvent = z.infer<typeof agentMessageSchema>;
export type AgentThoughtEvent = z.infer<typeof agentThoughtSchema>;

// System event types
export type PingEvent = z.infer<typeof pingSchema>;

// Union type for all events
export type DifyStreamEvent = z.infer<typeof difyStreamEventSchema>;
