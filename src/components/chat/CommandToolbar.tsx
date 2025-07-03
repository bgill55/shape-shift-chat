
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommandToolbarProps {
  onCommand: (command: string) => void;
}

export function CommandToolbar({ onCommand }: CommandToolbarProps) {
  const commands = [
    { id: 'imagine', label: '!imagine', description: 'Create an image with a prompt' },
    { id: 'sleep', label: '!sleep', description: 'Save memories from the current conversation' },
    { id: 'info', label: '!info', description: 'Get information about the shape' },
    { id: 'wack', label: '!wack', description: 'Reset short-term memory' },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-[#36393f] border-t border-[#202225]">
      {commands.map((command) => (
        <Button
          key={command.id}
          variant="outline"
          size="sm"
          onClick={() => onCommand(command.label)}
          className="bg-neutral-700 hover:bg-neutral-600 text-neutral-200 border-neutral-600"
          title={command.description}
        >
          <Wand2 className="w-4 h-4 mr-2" />
          {command.label}
        </Button>
      ))}
    </div>
  );
}
