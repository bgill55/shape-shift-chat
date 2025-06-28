// src/contexts/ThemeContext.tsx
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
  theme: "dark", // Default value, will be updated by useState initialization
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeContext = createContext<ThemeContextType>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark", // Default to dark if nothing else is set
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme | null;
      if (storedTheme && (storedTheme === "light" || storedTheme === "dark")) {
        return storedTheme;
      }
      // Check system preference if no valid stored theme
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemPrefersDark) {
        return "dark";
      }
      // Fallback to defaultTheme prop if it's 'light' or 'dark'
      // If defaultTheme was 'system', systemPrefersDark already handled it.
      if (defaultTheme === "light" || defaultTheme === "dark") {
        return defaultTheme;
      }
      return "dark"; // Final fallback, ensures a valid Theme type
    } catch (e) {
      // localStorage might not be available (e.g., SSR or restricted env)
      console.warn('[ThemeProvider] localStorage not available for theme persistence, using defaultTheme:', defaultTheme);
      // Fallback logic if localStorage fails, similar to above but without localStorage access
      if (defaultTheme === "light" || defaultTheme === "dark") {
        return defaultTheme;
      }
      try {
          const systemPrefersDarkFallback = window.matchMedia("(prefers-color-scheme: dark)").matches;
          if (systemPrefersDarkFallback) {
            return "dark";
          }
      } catch (systemMatchError) {
          // window.matchMedia might also not be available
          console.warn('[ThemeProvider] window.matchMedia not available, falling back to dark.');
      }
      return "dark"; // Final hardcoded fallback
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
  if (context === undefined) { // Check against undefined as initialState is an object
    // This can happen if useTheme is used outside of ThemeProvider
    // Or if the context was somehow not provided a value, though initialState should prevent that.
    // However, the more robust check is if context is still initialState or truly undefined.
    // For a required context, throwing an error if it's undefined is standard.
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Ensure no stray characters or markdown formatting beyond this point.
// The file should end after the closing brace of the useTheme function.
