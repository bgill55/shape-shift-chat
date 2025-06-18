
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel, // Added
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Sun, Moon } from 'lucide-react'; // Added Sun, Moon
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext'; // Added useTheme

export function UserMenu() {
  const { user, displayName, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Added theme and toggleTheme

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-[#393c43]">
          <User className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#2f3136] border-[#202225] w-56">
        <DropdownMenuLabel className="font-normal px-2 py-1.5 text-[#b9bbbe]">
          <div className="truncate">{displayName || user.email || 'User'}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#393c43]" />
        <DropdownMenuItem asChild className="text-white hover:!bg-[#393c43] focus:!bg-[#393c43] cursor-pointer">
          <Link to="/settings/profile">
            <Settings className="w-4 h-4 mr-2" />
            Profile Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleTheme} className="text-white hover:!bg-[#393c43] focus:!bg-[#393c43] cursor-pointer">
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 mr-2" />
          ) : (
            <Moon className="w-4 h-4 mr-2" />
          )}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#393c43]" />
        <DropdownMenuItem onClick={signOut} className="text-white hover:!bg-[#393c43] focus:!bg-[#393c43] cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
