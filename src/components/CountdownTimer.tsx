import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

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

  // بناء وحدات الوقت مع إخفاء الأيام إذا كانت 0
  const timeUnits = [
    ...(timeLeft.days > 0 ? [{ value: timeLeft.days, label: 'DAYS', arabicLabel: 'يوم' }] : []),
    { value: timeLeft.hours, label: 'HOURS', arabicLabel: 'ساعة' },
    { value: timeLeft.minutes, label: 'MINUTES', arabicLabel: 'دقيقة' },
    { value: timeLeft.seconds, label: 'SECONDS', arabicLabel: 'ثانية' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black/95 border border-green-900/50 shadow-2xl">
      {/* تأثير التوهج الأخضر */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-green-500/5"></div>
      
      <div className="relative p-6 md:p-8">
        {/* العنوان */}
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-bold text-green-400/80">
            الحلقة القادمة بعد
          </h3>
        </div>
        
        {/* العداد بنمط LED */}
        <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap" dir="ltr">
          {timeUnits.map((unit, index) => (
            <div key={index} className="flex items-center">
              {/* بطاقة الرقم */}
              <div className="relative text-center">
                {/* الرقم بنمط LED */}
                <div 
                  className="font-mono text-5xl md:text-7xl font-bold text-green-400 tabular-nums tracking-wider"
                  style={{
                    textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.4), 0 0 60px rgba(34, 197, 94, 0.2)',
                    fontFamily: '"Share Tech Mono", "Courier New", monospace',
                  }}
                >
                  {String(unit.value).padStart(2, '0')}
                </div>
                
                {/* التسمية */}
                <div 
                  className="text-[10px] md:text-xs font-medium text-green-600/70 uppercase tracking-widest mt-1"
                  style={{
                    textShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
                  }}
                >
                  {unit.label}
                </div>
              </div>
              
              {/* الفاصل : بين الأرقام */}
              {index < timeUnits.length - 1 && (
                <div 
                  className="text-4xl md:text-6xl font-bold text-green-400 mx-1 md:mx-3 animate-pulse"
                  style={{
                    textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.4)',
                  }}
                >
                  :
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* شريط سفلي مضيء */}
        <div className="mt-6 h-0.5 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
      </div>
    </div>
  );
}
