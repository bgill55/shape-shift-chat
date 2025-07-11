
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react'; 
import { Link } from 'react-router-dom';

export function UserMenu() {
  const { user, displayName, signOut } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Button color should adapt to theme or be explicitly set for header if sidebar doesn't change */}
        <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent hover:text-accent-foreground">
          <User className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground w-56">
        <DropdownMenuLabel className="font-normal px-2 py-1.5 text-muted-foreground">
          <div className="truncate">{displayName || user.email || 'User'}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild className="cursor-pointer hover:!bg-accent focus:!bg-accent">
          <Link to="/settings/profile" className="flex items-center"> {/* Ensure Link takes full width and flex properties */}
            <Settings className="w-4 h-4 mr-2" />
            Profile Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem onClick={signOut} className="cursor-pointer hover:!bg-accent focus:!bg-accent flex items-center">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
