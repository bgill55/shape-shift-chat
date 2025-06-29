import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = "light" | "dark";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const initialState: ThemeContextType = {
  theme: "dark", 
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeContext = createContext<ThemeContextType>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark", 
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme | null;
      if (storedTheme && (storedTheme === "light" || storedTheme === "dark")) {
        return storedTheme;
      }
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemPrefersDark) {
        return "dark";
      }
      if (defaultTheme === "light" || defaultTheme === "dark") {
        return defaultTheme;
      }
      return "dark"; 
    } catch (e) {
      console.warn('[ThemeProvider] localStorage not available for theme persistence, using defaultTheme:', defaultTheme);
      if (defaultTheme === "light" || defaultTheme === "dark") {
        return defaultTheme;
      }
      try {
          const systemPrefersDarkFallback = window.matchMedia("(prefers-color-scheme: dark)").matches;
          if (systemPrefersDarkFallback) {
            return "dark";
          }
      } catch (systemMatchError) {
          console.warn('[ThemeProvider] window.matchMedia not available, falling back to dark.');
      }
      return "dark"; 
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    try {
      localStorage.setItem(storageKey, theme);
    } catch (e) {
      console.warn('[ThemeProvider] Failed to set theme in localStorage:', e);
    }
  }, [theme, storageKey]);

  const setTheme = (newTheme: Theme) => {
    if (newTheme !== "light" && newTheme !== "dark") {
      console.warn(`[ThemeProvider] Invalid theme value: ${newTheme}. Theme not changed.`);
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
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) { 
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

