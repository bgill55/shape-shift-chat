
import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenu } from '@/components/UserMenu';
import { ThemeSelector } from '@/components/ui/ThemeSelector';

interface MobileHeaderProps {
  onAddShape: () => void;
  onOpenApiConfig: () => void;
}

export function MobileHeader({ onAddShape, onOpenApiConfig }: MobileHeaderProps) {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--color-sidebar-bg)] border-b border-[var(--color-sidebar-border)] p-3 flex items-center justify-between min-h-[64px] safe-area-inset-top">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-item-hover)] p-2" />
        <span className="font-semibold text-[var(--color-sidebar-text)] text-sm">Shapes Shift</span>
      </div>
      
      <div className="flex items-center gap-1">
        <ThemeSelector />
        <Button
          onClick={onAddShape}
          variant="ghost"
          size="sm"
          className="text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-item-hover)] p-2"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button
          onClick={onOpenApiConfig}
          variant="ghost"
          size="sm"
          className="text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-item-hover)] p-2"
        >
          <Settings className="w-4 h-4" />
        </Button>
        <UserMenu />
      </div>
    </div>
  );
}
