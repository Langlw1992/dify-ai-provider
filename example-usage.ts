import { streamText } from "ai";
import { difyProvider } from "./src/dify-provider";

// 示例：使用新的 Dify AI Provider 功能
async function exampleUsage() {
  const dify = difyProvider("your-dify-application-id", {
    responseMode: "streaming",
  });

  const result = streamText({
    model: dify,
    messages: [{ role: "user", content: "请解释量子计算的基本原理，并进行深入思考。" }],
    headers: { 
      "user-id": "example-user-123",
      // "chat-id": "existing-conversation-id" // 可选：继续现有对话
    },
  });

  console.log("开始处理 AI 响应...\n");

  // 监听完整的流事件
  for await (const part of result.fullStream) {
    switch (part.type) {
      case 'reasoning-start':
        console.log(`🤔 开始推理 (ID: ${part.id})`);
        break;
        
      case 'reasoning-delta':
        console.log(`💭 推理过程: ${part.delta}`);
        break;
        
      case 'reasoning-end':
        console.log(`✅ 推理完成 (ID: ${part.id})\n`);
        break;
        
      case 'text-start':
        console.log(`📝 开始输出答案 (ID: ${part.id})`);
        break;
        
      case 'text-delta':
        process.stdout.write(part.delta); // 实时输出答案
        break;
        
      case 'text-end':
        console.log(`\n✅ 答案输出完成 (ID: ${part.id})\n`);
        break;
        
      case 'response-metadata':
        console.log(`📊 响应元数据: ID=${part.id}, 时间=${part.timestamp?.toISOString()}`);
        break;
        
      case 'raw':
        const rawData = part.rawValue as any;
        if (rawData.difyEvent === 'workflow_started') {
          console.log(`🚀 工作流开始: ${rawData.workflow_run_id}`);
        } else if (rawData.difyEvent === 'workflow_finished') {
          console.log(`🏁 工作流完成: 耗时 ${rawData.duration}秒`);
          if (rawData.executionReport) {
            console.log(`📈 执行报告: ${rawData.executionReport.nodes?.length || 0} 个节点`);
          }
        } else if (rawData.difyEvent === 'node_started') {
          console.log(`🔧 节点开始: ${rawData.data?.node_type} (${rawData.data?.node_id})`);
        } else if (rawData.difyEvent === 'node_finished') {
          console.log(`✅ 节点完成: 耗时 ${rawData.duration}秒`);
        } else if (rawData.difyEvent === 'agent_thought') {
          console.log(`🧠 Agent 思考: ${rawData.thought}`);
          if (rawData.tool) {
            console.log(`🛠️  使用工具: ${rawData.tool}`);
          }
        }
        break;
        
      case 'finish':
        console.log('\n🎉 生成完成!');
        console.log(`📊 Token 使用情况:`);
        console.log(`   输入: ${part.usage.inputTokens}`);
        console.log(`   输出: ${part.usage.outputTokens}`);
        console.log(`   总计: ${part.usage.totalTokens}`);
        
        // 访问 Dify 特定的元数据
        const difyData = part.providerMetadata?.dify;
        if (difyData) {
          console.log(`\n🔗 Dify 信息:`);
          console.log(`   对话ID: ${difyData.conversationId}`);
          console.log(`   消息ID: ${difyData.messageId}`);
          
          if (difyData.workflowExecution) {
            const execution = difyData.workflowExecution as any;
            console.log(`\n⚙️  工作流执行报告:`);
            console.log(`   工作流ID: ${execution.workflowId}`);
            console.log(`   总耗时: ${execution.duration}秒`);
            console.log(`   节点数量: ${execution.nodes?.length || 0}`);
            
            if (execution.nodes?.length > 0) {
              console.log(`\n📋 节点详情:`);
              execution.nodes.forEach((node: any, index: number) => {
                console.log(`   ${index + 1}. ${node.nodeType} (${node.nodeId}): ${node.duration || 'N/A'}秒`);
              });
            }
          }
        }
        break;
        
      case 'error':
        console.error('❌ 发生错误:', part.error);
        break;
    }
  }
}

// 运行示例
if (require.main === module) {
  exampleUsage().catch(console.error);
}

export { exampleUsage };