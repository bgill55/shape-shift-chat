
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  imageUrl?: string;
  botName?: string; // Track which bot sent the message for multi-bot chats
  chatbotId?: string; // Add chatbotId to the Message interface
  parent_message_id?: string; // Add parent_message_id for threading
}
