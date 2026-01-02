import { useState, useEffect } from 'react';
import { Clock, Calendar, Sparkles } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 text-center shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuMSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary-foreground animate-pulse" />
        <p className="text-2xl md:text-3xl text-primary-foreground font-bold">
          🎉 الحلقة الآن أو قريبًا جدًا! 🎉
        </p>
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'يوم', arabicLabel: 'يوم' },
    { value: timeLeft.hours, label: 'ساعة', arabicLabel: 'ساعة' },
    { value: timeLeft.minutes, label: 'دقيقة', arabicLabel: 'دقيقة' },
    { value: timeLeft.seconds, label: 'ثانية', arabicLabel: 'ثانية' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-muted/50 border border-border shadow-xl">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-pulse"></div>
      
      {/* زخرفة الحدود */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      
      <div className="relative p-6 md:p-8">
        {/* العنوان */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-primary" />
          <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            الحلقة القادمة بعد
          </h3>
          <Clock className="w-6 h-6 text-primary animate-pulse" />
        </div>
        
        {/* العداد */}
        <div className="flex justify-center gap-3 md:gap-5 flex-wrap" dir="ltr">
          {timeUnits.map((unit, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* البطاقة الرئيسية */}
              <div className="relative bg-gradient-to-br from-primary/10 via-card to-primary/5 border border-primary/20 rounded-xl p-4 md:p-6 min-w-[80px] md:min-w-[110px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-primary/40">
                {/* تأثير التوهج */}
                <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                
                {/* الرقم */}
                <div className="relative">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-primary via-primary to-primary/60 bg-clip-text text-transparent tabular-nums drop-shadow-sm">
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  
                  {/* خط فاصل مزخرف */}
                  <div className="my-2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                  
                  {/* التسمية */}
                  <div className="text-sm md:text-base font-medium text-muted-foreground">
                    {unit.arabicLabel}
                  </div>
                </div>
                
                {/* نقطة متحركة في الزاوية */}
                {index < timeUnits.length - 1 && (
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-ping hidden md:block"></div>
                )}
              </div>
              
              {/* الفواصل بين الأرقام */}
              {index < timeUnits.length - 1 && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary/50 hidden md:flex flex-col gap-1">
                  <span className="block w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="block w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* شريط التقدم */}
        <div className="mt-8 relative">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full transition-all duration-1000 ease-out animate-pulse"
              style={{ 
                width: `${Math.max(5, 100 - (timeLeft.days * 2))}%`
              }}
            ></div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-3">
            ⏰ لا تفوّت الحلقة!
          </p>
        </div>
      </div>
    </div>
  );
}
