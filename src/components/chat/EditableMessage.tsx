
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X } from 'lucide-react';

interface EditableMessageProps {
  content: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
}

export function EditableMessage({ content, onSave, onCancel }: EditableMessageProps) {
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    if (editedContent.trim()) {
      onSave(editedContent.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[80px] resize-none bg-[#40444b] border-[#4f545c] text-[rgb(var(--fg))]"
        autoFocus
      />
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={handleSave}
          disabled={!editedContent.trim()}
        >
          <Check className="h-3 w-3 mr-1" />
          Save
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onCancel}
        >
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      </div>
      <p className="text-xs text-[#72767d]">
        Press Ctrl+Enter to save, Escape to cancel
      </p>
    </div>
  );
}
