import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import SecurityLogs from "./pages/SecurityLogs";
import NotFound from "./pages/NotFound";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DirectionHandler>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/security-logs" element={<SecurityLogs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DirectionHandler>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
