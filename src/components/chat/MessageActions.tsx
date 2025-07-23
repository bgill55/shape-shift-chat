
import { MoreHorizontal, Edit, Trash2, RotateCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface MessageActionsProps {
  messageId: string;
  isBot: boolean;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
}

export function MessageActions({ 
  messageId, 
  isBot, 
  onEdit, 
  onDelete, 
  onRegenerate 
}: MessageActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0" aria-label="More message actions">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 bg-[rgb(var(--card))] border-[rgb(var(--border))] text-[rgb(var(--fg))]">
        {isBot && onRegenerate && (
          <DropdownMenuItem onClick={() => onRegenerate(messageId)}>
            <RotateCcw className="mr-2 h-3 w-3" />
            Regenerate
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onEdit(messageId)}>
          <Edit className="mr-2 h-3 w-3" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(messageId)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-3 w-3" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
