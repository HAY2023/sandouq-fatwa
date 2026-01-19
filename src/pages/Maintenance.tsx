import { Construction, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MaintenancePageProps {
  message?: string;
}

const MaintenancePage = ({ message = 'الموقع تحت الصيانة، يرجى العودة لاحقاً' }: MaintenancePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4" dir="rtl">
      <div className="text-center max-w-md">
        {/* أيقونة الصيانة */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Construction className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full border-4 border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
        </div>
        
        {/* العنوان */}
        <h1 className="text-3xl font-bold text-foreground mb-4">
          الموقع تحت الصيانة
        </h1>
        
        {/* الرسالة */}
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          {message}
        </p>
        
        {/* زر إعادة المحاولة */}
        <Button 
          onClick={() => window.location.reload()} 
          className="gap-2"
          size="lg"
        >
          <RefreshCw className="w-4 h-4" />
          إعادة المحاولة
        </Button>
        
        {/* رسالة إضافية */}
        <p className="text-sm text-muted-foreground mt-8">
          نعتذر عن أي إزعاج. سيعود الموقع قريباً بإذن الله.
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
