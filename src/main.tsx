import React, { lazy, Suspense } from 'react'; // Import React, lazy, and Suspense
import { createRoot } from 'react-dom/client';
import './index.css';

const LazyApp = lazy(() => import('./App.tsx')); // Dynamically import App

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}> {/* Add Suspense with a fallback */}
      <LazyApp />
    </Suspense>
  </React.StrictMode>
);
