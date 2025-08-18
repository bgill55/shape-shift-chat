
import { MoreHorizontal, Edit, Trash2, RotateCcw, Share2, Reply } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Chatbot } from '@/pages/Index';

interface MessageActionsProps {
  messageId: string;
  isBot: boolean;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onRegenerate?: (messageId: string, apiKey: string, selectedChatbot: Chatbot) => void;
  onShareToReddit: () => void;
  apiKey: string;
  chatbot?: Chatbot; // Make chatbot optional
  onReply: (messageId: string) => void; // New prop
}

export function MessageActions({ 
  messageId, 
  isBot, 
  onEdit, 
  onDelete, 
  onRegenerate, 
  onShareToReddit,
  apiKey, 
  chatbot,
  onReply // New prop
}: MessageActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label="More message actions">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 bg-[rgb(var(--card))] border-[rgb(var(--border))] text-[rgb(var(--fg))]">
        <DropdownMenuItem onClick={() => onReply(messageId)} className="cursor-pointer">
          <Reply className="mr-2 h-3 w-3" />
          Reply
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShareToReddit} className="cursor-pointer">
          <Share2 className="mr-2 h-3 w-3" />
          Share
        </DropdownMenuItem>
        {isBot && onRegenerate && chatbot && (
          <DropdownMenuItem onClick={() => onRegenerate(messageId, apiKey, chatbot)} className="cursor-pointer">
            <RotateCcw className="mr-2 h-3 w-3" />
            Regenerate
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onEdit(messageId)} className="cursor-pointer">
          <Edit className="mr-2 h-3 w-3" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(messageId)}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          <Trash2 className="mr-2 h-3 w-3" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
