import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SplashScreen } from "@/components/SplashScreen";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { useSettings } from "@/hooks/useSettings";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import SecurityLogs from "./pages/SecurityLogs";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import Maintenance from "./pages/Maintenance";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 دقائق
      gcTime: 1000 * 60 * 60, // ساعة واحدة
      retry: 2,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst', // محاولة استخدام الذاكرة المؤقتة أولاً
    },
  },
});

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

// Main app content with maintenance check
function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const { data: settings } = useSettings();

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

  // Check if maintenance mode is enabled (but allow admin access)
  const isMaintenanceMode = settings?.maintenance_mode;
  const currentPath = window.location.pathname;
  const isAdminRoute = currentPath.startsWith('/admin') || currentPath.startsWith('/security-logs');

  // Show maintenance page for non-admin routes when maintenance mode is enabled
  if (isMaintenanceMode && !isAdminRoute) {
    return <Maintenance message={settings?.maintenance_message} />;
  }

  return (
    <>
      {/* Show splash screen only on first visit - سريع */}
      {showSplash && isFirstVisit && (
        <SplashScreen onComplete={handleSplashComplete} duration={1800} />
      )}
      
      <ConnectionStatus />
      
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/security-logs" element={<SecurityLogs />} />
          <Route path="/install" element={<Install />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <DirectionHandler>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </DirectionHandler>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
