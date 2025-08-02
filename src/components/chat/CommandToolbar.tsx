
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
    { id: 'voice', label: '!voice', description: 'Request a spoken response from the bot' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-start gap-2 p-2 bg-[rgb(var(--card))] border-t border-[#202225]">
      {commands.map((command) => (
        <Button
          key={command.id}
          variant="outline"
          size="sm"
          onClick={() => onCommand(command.label)}
          className="bg-[rgb(var(--card))] hover:bg-[rgb(var(--card))] text-[rgb(var(--fg))] border-cyan-600 text-xs whitespace-nowrap"
          title={command.description}
          aria-label={command.description}
        >
          <Wand2 className="w-3.5 h-3.5 mr-1.5" />
          {command.label}
        </Button>
      ))}
    </div>
  );
}
