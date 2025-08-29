import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface InstallBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ onInstall, onDismiss }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-sidebar-bg)] text-[rgb(var(--fg))] p-4 flex justify-between items-center border-t border-[var(--color-sidebar-border)] shadow-lg">
      <p className="text-sm">Enjoying the app? Install it to your home screen for easy access!</p>
      <div className="flex items-center gap-2">
        <Button onClick={onInstall} variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Install
        </Button>
        <Button onClick={onDismiss} variant="ghost" size="icon">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
