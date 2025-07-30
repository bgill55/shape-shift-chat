import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

const LazyApp = lazy(() => import('./App.tsx'));

registerSW();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <LazyApp />
    </Suspense>
  </React.StrictMode>
);
