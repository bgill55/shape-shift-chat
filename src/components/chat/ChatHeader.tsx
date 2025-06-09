
import { Chatbot } from '@/pages/Index';

interface ChatHeaderProps {
  selectedChatbot: Chatbot;
}

export function ChatHeader({ selectedChatbot }: ChatHeaderProps) {
  return (
    <div className="h-16 bg-[#36393f] border-b border-[#202225] flex items-center px-4">
      <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center mr-3">
        <span className="text-white font-semibold text-sm">
          {selectedChatbot.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div>
        <h3 className="text-white font-semibold">{selectedChatbot.name}</h3>
        <p className="text-[#96989d] text-sm">{selectedChatbot.url}</p>
      </div>
    </div>
  );
}
