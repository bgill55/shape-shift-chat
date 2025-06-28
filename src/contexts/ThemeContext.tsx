import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Define Theme type
export type Theme = "light" | "dark";

// 2. Define ThemeProviderProps
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme; // Explicitly 'light' or 'dark', 'system' handled at init
  storageKey?: string;
}

// 3. Define ThemeContextType
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// 4. Create ThemeContext
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 5. Implement ThemeProvider component
export function ThemeProvider({
  children,
  defaultTheme = "dark", // Defaulting to dark as per many modern apps
  storageKey = "vite-ui-theme", // Changed from "ui-theme" to match original thought if using Vite
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme | null;
      if (storedTheme) {
        return storedTheme;
      }

      // If no stored theme, check system preference
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemPrefersDark) {
        return "dark";
      }
      // Fallback to light if system doesn't prefer dark (or if matchMedia is not supported, though unlikely)
      // Or use defaultTheme if it's explicitly 'light' or 'dark'
      return defaultTheme;
    } catch (e) {
      // localStorage can throw errors in some environments (e.g., private browsing, SSR)
      console.warn("Could not access localStorage for theme, using default:", e);
      return defaultTheme;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);

    try {
      localStorage.setItem(storageKey, theme);
    } catch (e) {
      console.warn("Could not save theme to localStorage:", e);
    }
  }, [theme, storageKey]);

  const setTheme = (newTheme: Theme) => {
    if (newTheme !== "light" && newTheme !== "dark") {
      console.warn(`Invalid theme value: ${newTheme}. Theme must be "light" or "dark".`);
      return;
    }
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 6. Create and export useTheme custom hook
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

