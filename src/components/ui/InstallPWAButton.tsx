
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const InstallPWAButton = () => {
  const { canInstall, triggerInstall } = usePWAInstall();

  if (!canInstall) {
    return null;
  }

  return (
    <Button
      onClick={triggerInstall}
      variant="outline"
      className="w-full justify-start text-left p-2 bg-green-600 hover:bg-green-700 text-white border-green-800 mt-2"
      title="Install Shape Shift as a desktop app"
    >
      <Download className="w-5 h-5 mr-3" />
      Install App
    </Button>
  );
};
