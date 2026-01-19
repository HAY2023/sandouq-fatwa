import { Construction, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface MaintenancePageProps {
  message?: string;
}

const MaintenancePage = ({ message = 'الموقع تحت الصيانة، يرجى العودة لاحقاً' }: MaintenancePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/50 flex items-center justify-center p-4 overflow-hidden" dir="rtl">
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md relative z-10"
      >
        {/* أيقونة الصيانة */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mb-8"
        >
          <div className="w-28 h-28 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/10">
            <Construction className="w-14 h-14 text-primary" />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 w-28 h-28 mx-auto rounded-full border-2 border-primary/20"
          />
        </motion.div>
        
        {/* العنوان */}
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          الموقع تحت الصيانة
        </motion.h1>
        
        {/* الرسالة */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed px-4"
        >
          {message}
        </motion.p>
        
        {/* زر إعادة المحاولة */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            onClick={() => window.location.reload()} 
            className="gap-2 shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </Button>
        </motion.div>
        
        {/* رسالة إضافية */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-muted-foreground mt-8"
        >
          نعتذر عن أي إزعاج. سيعود الموقع قريباً بإذن الله.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;
