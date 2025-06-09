
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  imageUrl?: string;
  botName?: string; // Track which bot sent the message for multi-bot chats
}
