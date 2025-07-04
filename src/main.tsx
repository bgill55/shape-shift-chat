import React, { lazy, Suspense } from 'react'; // Import React, lazy, and Suspense
import { createRoot } from 'react-dom/client';
import './index.css';
import { ThemeProvider } from '@/contexts/ThemeContext'; // Import ThemeProvider

const LazyApp = lazy(() => import('./App.tsx')); // Dynamically import App

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Suspense fallback={<div>Loading...</div>}> {/* Add Suspense with a fallback */}
        <LazyApp />
      </Suspense>
    </ThemeProvider>
  </React.StrictMode>
);
