import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { useOnboarding } from "./hooks/useOnboarding";
import OnboardingFlow from "./components/OnboardingFlow";
import { InstallBanner } from "./components/InstallBanner";
import { ThemeProvider } from './contexts/ThemeContext';
import '@khmyznikov/pwa-install';

const Auth = lazy(() => import('./pages/Auth'));
const Index = lazy(() => import('./pages/Index'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <img src="/assets/X_large_image.png" alt="Loading..." className="w-1/2" />
  </div>
);

const App = () => {
  const { hasSeenOnboarding, markOnboardingAsSeen } = useOnboarding();
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const pwaInstallRef = useRef<any>(null);

  useEffect(() => {
    const pwaInstallElement = document.getElementById('pwa-install-dialog');
    pwaInstallRef.current = pwaInstallElement;
    const dismissed = localStorage.getItem('shapeShiftInstallDismissed');
    if (!dismissed) {
      const timer = setTimeout(() => {
        if (pwaInstallRef.current?.isInstallAvailable) {
          setShowInstallBanner(true);
        }
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstall = () => {
    if (pwaInstallRef.current) {
      pwaInstallRef.current.showDialog(true);
    }
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('shapeShiftInstallDismissed', 'true');
    setShowInstallBanner(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ThemeProvider>
            <Toaster />
            <Sonner />
            {showInstallBanner && <InstallBanner onInstall={handleInstall} onDismiss={handleDismiss} />}
            <pwa-install id="pwa-install-dialog" manifest-url="/manifest.webmanifest" name="Shape Shift" icon="/assets/shapeshift_pwa.jpg" manual-chrome="true" manual-apple="true"></pwa-install>
            <BrowserRouter>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      {hasSeenOnboarding ? <Index /> : <OnboardingFlow onComplete={markOnboardingAsSeen} />}
                    </ProtectedRoute>
                  } />
                  <Route path="/settings/profile" element={
                    <ProtectedRoute>
                      <ProfileSettings />
                    </ProtectedRoute>
                  } />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;