
import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenu } from '@/components/UserMenu';

interface MobileHeaderProps {
  onAddShape: () => void;
  onOpenApiConfig: () => void;
}

export function MobileHeader({ onAddShape, onOpenApiConfig }: MobileHeaderProps) {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#2f3136] border-b border-[#202225] p-3 flex items-center justify-between min-h-[64px] safe-area-inset-top">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-[rgb(var(--fg))] hover:bg-[#393c43] p-2" />
        <span className="font-semibold text-[rgb(var(--fg))] text-sm">Shapes Shift</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          onClick={onAddShape}
          variant="ghost"
          size="sm"
          className="text-[rgb(var(--fg))] hover:bg-[#393c43] p-2"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button
          onClick={onOpenApiConfig}
          variant="ghost"
          size="sm"
          className="text-[rgb(var(--fg))] hover:bg-[#393c43] p-2"
        >
          <Settings className="w-4 h-4" />
        </Button>
        <UserMenu />
      </div>
    </div>
  );
}
