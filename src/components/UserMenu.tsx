
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from "react-router-dom";
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

export function UserMenu() {
  const { user, displayName, signOut } = useAuth();
  const navigate = useNavigate(); // Add this line

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Button color should adapt to theme or be explicitly set for header if sidebar doesn't change */}
        <Button variant="ghost" size="icon" className="text-[rgb(var(--fg))] hover:bg-accent hover:text-accent-foreground" aria-label="User menu">
          <User className="w-5 h-5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[rgb(var(--card))] border-border text-[rgb(var(--fg))] w-56">
        <DropdownMenuLabel className="font-normal" key={displayName}>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName || user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/settings/profile")} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
