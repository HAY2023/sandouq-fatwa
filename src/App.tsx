import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SplashScreen } from "@/components/SplashScreen";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import Index from "./pages/Index";
const Admin = React.lazy(() => import("./pages/Admin"));
const SecurityLogs = React.lazy(() => import("./pages/SecurityLogs"));
const Install = React.lazy(() => import("./pages/Install"));
const Archive = React.lazy(() => import("./pages/Archive"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Component to handle document direction based on language
function DirectionHandler({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  
  return <>{children}</>;
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Check if it's the first visit in this session
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      sessionStorage.setItem('hasVisited', 'true');
    } else {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <DirectionHandler>
          <TooltipProvider>
            {/* Show splash screen only on first visit */}
            {showSplash && isFirstVisit && (
              <SplashScreen onComplete={handleSplashComplete} duration={2500} />
            )}
            
            <ConnectionStatus />
            
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/security-logs" element={<SecurityLogs />} />
                  <Route path="/install" element={<Install />} />
                  <Route path="/archive" element={<Archive />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </React.Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </DirectionHandler>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
