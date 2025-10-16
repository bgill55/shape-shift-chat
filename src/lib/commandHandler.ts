import { Message } from '@/types/message';

export async function handleCommand(command: string, args: string): Promise<Message> {
  if (command === '!web') {
    // The web search logic will be handled by the Gemini API
    return {
      id: (Date.now() + Math.random()).toString(),
      content: `Searching the web for "${args}"...`,
      sender: 'bot',
      timestamp: new Date(),
      botName: 'Web Search',
    };
  }

  return {
    id: (Date.now() + Math.random()).toString(),
    content: `Unknown command: ${command}`,
    sender: 'bot',
    timestamp: new Date(),
    botName: 'System',
  };
}