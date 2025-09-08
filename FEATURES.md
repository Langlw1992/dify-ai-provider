# Dify AI Provider Features

This document provides detailed information about the advanced features of the Dify AI Provider for Vercel AI SDK.

## 🧠 Reasoning Support

The provider automatically detects and parses `<think>...</think>` tags in Dify responses, converting them into proper AI SDK reasoning events.

### How it works

When Dify returns content like:
```
<think>
Let me think about quantum computing...
It involves quantum bits or qubits...
</think>

Quantum computing is a revolutionary technology...
```

The provider automatically:
1. Detects the `<think>` tags
2. Emits `reasoning-start` event
3. Streams reasoning content via `reasoning-delta` events
4. Emits `reasoning-end` when `</think>` is found
5. Separately streams the answer content via `text-delta` events

### Usage Example

```typescript
for await (const part of result.fullStream) {
  switch (part.type) {
    case 'reasoning-start':
      console.log('AI is thinking...');
      break;
      
    case 'reasoning-delta':
      console.log(`Thought: ${part.delta}`);
      break;
      
    case 'reasoning-end':
      console.log('Thinking complete');
      break;
  }
}
```

## 📊 Workflow Tracking

The provider monitors Dify workflow execution in real-time, providing detailed insights into:

- Workflow start/finish times
- Individual node execution
- Node types and performance
- Total execution duration

### Workflow Events

#### `workflow_started`
```typescript
{
  type: 'raw',
  rawValue: {
    difyEvent: 'workflow_started',
    workflow_run_id: 'wf_123',
    data: {
      workflow_id: 'workflow_456',
      created_at: 1640995200
    }
  }
}
```

#### `node_started` / `node_finished`
```typescript
{
  type: 'raw',
  rawValue: {
    difyEvent: 'node_finished',
    duration: 1.5, // seconds
    data: {
      node_id: 'node_789',
      node_type: 'llm'
    }
  }
}
```

#### `workflow_finished`
```typescript
{
  type: 'raw',
  rawValue: {
    difyEvent: 'workflow_finished',
    executionReport: {
      workflowId: 'workflow_456',
      duration: 5.2,
      nodes: [
        {
          nodeId: 'node_789',
          nodeType: 'llm',
          duration: 1.5
        }
      ]
    }
  }
}
```

## 🤖 Agent Support

For Dify Agent applications, the provider captures detailed agent behavior:

### Agent Thought Process
```typescript
{
  type: 'raw',
  rawValue: {
    difyEvent: 'agent_thought',
    thought: 'I need to search for information about quantum computing',
    observation: 'Found relevant research papers',
    tool: 'web_search',
    tool_input: '{"query": "quantum computing basics"}',
    position: 1
  }
}
```

### Usage Example
```typescript
for await (const part of result.fullStream) {
  if (part.type === 'raw' && part.rawValue.difyEvent === 'agent_thought') {
    const thought = part.rawValue;
    console.log(`Agent thinking: ${thought.thought}`);
    if (thought.tool) {
      console.log(`Using tool: ${thought.tool}`);
    }
  }
}
```

## 📈 Execution Reports

The provider generates comprehensive execution reports available in the `finish` event:

```typescript
{
  type: 'finish',
  usage: {
    inputTokens: 150,
    outputTokens: 300,
    totalTokens: 450
  },
  providerMetadata: {
    dify: {
      conversationId: 'conv_123',
      messageId: 'msg_456',
      taskId: 'task_789',
      workflowExecution: {
        workflowId: 'workflow_456',
        workflowRunId: 'wf_123',
        startedAt: 1640995200,
        finishedAt: 1640995205,
        duration: 5,
        nodes: [
          {
            nodeId: 'node_1',
            nodeType: 'llm',
            startedAt: 1640995200,
            finishedAt: 1640995202,
            duration: 2
          }
        ]
      }
    }
  }
}
```

## 🔄 Conversation Management

### Starting a New Conversation
```typescript
const result = streamText({
  model: dify,
  messages: [{ role: "user", content: "Hello!" }],
  headers: { "user-id": "user-123" }
  // No chat-id = new conversation
});
```

### Continuing an Existing Conversation
```typescript
const result = streamText({
  model: dify,
  messages: [{ role: "user", content: "Continue our discussion" }],
  headers: { 
    "user-id": "user-123",
    "chat-id": "conv_456" // Use conversation ID from previous response
  }
});
```

## 🛠️ Error Handling

The provider handles various error scenarios:

### API Errors
```typescript
for await (const part of result.fullStream) {
  if (part.type === 'error') {
    console.error('Dify API error:', part.error);
  }
}
```

### Unknown Events
Unknown Dify events are automatically passed through as `raw` events:

```typescript
{
  type: 'raw',
  rawValue: {
    difyEvent: 'unknown_event_type',
    // ... original Dify event data
  }
}
```

## 🎯 Type Safety

The provider includes comprehensive TypeScript types:

```typescript
import type { 
  DifyChatSettings,
  DifyChatModelId,
  DifyStreamEvent 
} from 'dify-ai-provider';

// All events are properly typed
for await (const part of result.fullStream) {
  // TypeScript knows the exact shape of each event type
  if (part.type === 'reasoning-delta') {
    console.log(part.delta); // ✅ TypeScript knows this exists
    console.log(part.id);    // ✅ TypeScript knows this exists
  }
}
```

## 🚀 Performance Considerations

- **Streaming**: Use streaming mode for real-time user experience
- **Buffering**: The provider efficiently buffers content to parse `<think>` tags
- **Memory**: Workflow state is cleaned up after each completion
- **Network**: Minimal overhead added to Dify's native streaming

## 🔧 Advanced Configuration

### Custom Base URL (Self-hosted Dify)
```typescript
import { createDifyProvider } from "dify-ai-provider";

const difyProvider = createDifyProvider({
  baseURL: "https://your-dify-instance.com/v1",
  headers: {
    "Custom-Header": "value"
  }
});
```

### Custom Fetch Implementation
```typescript
const difyProvider = createDifyProvider({
  fetch: customFetchImplementation
});
```

This comprehensive feature set makes the Dify AI Provider a powerful bridge between Dify's capabilities and the Vercel AI SDK ecosystem.