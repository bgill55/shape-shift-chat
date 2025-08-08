import { Message } from '@/types/message';

export async function handleCommand(command: string, args: string): Promise<Message> {
  if (command === '!info') {
    try {
      const response = await fetch(`https://api.shapes.inc/shapes/public/${args}`);
      if (response.status === 404) {
        return {
          id: (Date.now() + Math.random()).toString(),
          content: `Shape '${args}' not found. Please check the username and try again.`, 
          sender: 'bot',
          timestamp: new Date(),
          botName: 'Shape Info',
        };
      }

      const data = await response.json();
      console.log('Shapes API Response Data:', data);

      

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`API request failed: ${response.status} ${errorData.message}`);
      }

      const { name, username, search_description, user_count, message_count, avatar_url } = data;
      const content = `
### ${name} (@${username})

**Description:** ${search_description || 'N/A'}

**User Count:** ${user_count?.toLocaleString() || 'N/A'}
**Message Count:** ${message_count?.toLocaleString() || 'N/A'}

![Avatar](${avatar_url})
      `;
      return {
        id: (Date.now() + Math.random()).toString(),
        content,
        sender: 'bot',
        timestamp: new Date(),
        botName: 'Shape Info',
      };
    } catch (error) {
      console.error('Error fetching shape info:', error);
      const errorMessageContent = error instanceof Error ? error.message : "Sorry, I encountered an error while processing your message.";
      return {
        id: (Date.now() + Math.random()).toString(),
        content: `Error fetching shape info for ${args}: ${errorMessageContent}.`,
        sender: 'bot',
        timestamp: new Date(),
        botName: 'Shape Info',
      };
    }
  } else if (command === '!web') {
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