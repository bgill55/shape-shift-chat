
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, SunMoon } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 oled:-rotate-90 oled:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 oled:-rotate-90 oled:scale-0" />
      <SunMoon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all oled:rotate-0 oled:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
