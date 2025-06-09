
import { Chatbot } from '@/pages/Index';
import { Bot, MessageCircle, Users } from 'lucide-react';

interface GroupChatHeaderProps {
  selectedChatbots: Chatbot[];
}

export function GroupChatHeader({ selectedChatbots }: GroupChatHeaderProps) {
  const isGroupChat = selectedChatbots.length > 1;
  
  return (
    <div className="px-4 py-3 bg-[#2f3136] border-b border-[#202225] flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {selectedChatbots.map((chatbot, index) => (
            <div 
              key={chatbot.id}
              className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center border-2 border-[#2f3136]"
              style={{ zIndex: selectedChatbots.length - index }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center gap-2">
            {isGroupChat ? (
              <Users className="w-4 h-4 text-[#96989d]" />
            ) : (
              <MessageCircle className="w-4 h-4 text-[#96989d]" />
            )}
            <h2 className="text-white font-semibold">
              {isGroupChat 
                ? `Group Chat (${selectedChatbots.length})` 
                : selectedChatbots[0].name
              }
            </h2>
          </div>
          <p className="text-xs text-[#96989d]">
            {isGroupChat 
              ? `Active: ${selectedChatbots.map(bot => `@${bot.name.toLowerCase().replace(/\s+/g, '')}`).join(', ')}`
              : `Direct conversation with ${selectedChatbots[0].name}`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
