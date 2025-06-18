
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel, // Added
  DropdownMenuTrigger,
  DropdownMenuSeparator, // Added for visual separation
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react'; // Added Settings
import { Link } from 'react-router-dom'; // Added

export function UserMenu() {
  const { user, displayName, signOut } = useAuth(); // Added displayName

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
        <DropdownMenuSeparator className="bg-[#393c43]" />
        <DropdownMenuItem onClick={signOut} className="text-white hover:!bg-[#393c43] focus:!bg-[#393c43] cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
