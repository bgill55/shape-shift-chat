
import { Chatbot } from '@/pages/Index';

export interface ParsedMention {
  chatbot: Chatbot;
  mentionText: string;
}

export function parseMentions(content: string, availableChatbots: Chatbot[]): ParsedMention[] {
  const mentions: ParsedMention[] = [];
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    const mentionName = match[1].toLowerCase();
    
    // Find chatbot by name (case insensitive, spaces removed)
    const chatbot = availableChatbots.find(bot => 
      bot.name.toLowerCase().replace(/\s+/g, '') === mentionName
    );

    if (chatbot) {
      mentions.push({
        chatbot,
        mentionText: match[0]
      });
    }
  }

  return mentions;
}

export function getUniqueMentionedChatbots(mentions: ParsedMention[]): Chatbot[] {
  const uniqueChatbots = new Map<string, Chatbot>();
  
  mentions.forEach(mention => {
    uniqueChatbots.set(mention.chatbot.id, mention.chatbot);
  });

  return Array.from(uniqueChatbots.values());
}

export function highlightMentions(content: string, availableChatbots: Chatbot[]): string {
  const mentionRegex = /@(\w+)/g;
  
  return content.replace(mentionRegex, (match, mentionName) => {
    const chatbot = availableChatbots.find(bot => 
      bot.name.toLowerCase().replace(/\s+/g, '') === mentionName.toLowerCase()
    );
    
    if (chatbot) {
      return `<span class="text-[#5865f2] font-semibold">${match}</span>`;
    }
    
    return match;
  });
}
