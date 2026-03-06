import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useEffect, useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { SplashScreen } from "@/components/SplashScreen";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";

const Index = lazy(() => import("./pages/Index"));
const Admin = lazy(() => import("./pages/Admin"));
const SecurityLogs = lazy(() => import("./pages/SecurityLogs"));
const Install = lazy(() => import("./pages/Install"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="text-muted-foreground">...</div></div>}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/security-logs" element={<SecurityLogs />} />
                  <Route path="/install" element={<Install />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </DirectionHandler>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
