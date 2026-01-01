import { useState, useEffect } from 'react';

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
      <div className="text-center p-8 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl border-2 border-primary/30 shadow-2xl backdrop-blur-sm">
        <div className="animate-pulse">
          <p className="text-2xl md:text-3xl text-primary font-bold">🎉 الحلقة الآن أو قريبًا جدًا 🎉</p>
        </div>
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'يوم', icon: '📅' },
    { value: timeLeft.hours, label: 'ساعة', icon: '🕐' },
    { value: timeLeft.minutes, label: 'دقيقة', icon: '⏱️' },
    { value: timeLeft.seconds, label: 'ثانية', icon: '⚡' },
  ];

  return (
    <div className="text-center py-8">
      <h3 className="text-2xl md:text-3xl mb-8 text-foreground font-bold">
        ⏰ الحلقة القادمة بعد
      </h3>
      <div className="flex justify-center gap-3 md:gap-6 flex-wrap" dir="ltr">
        {timeUnits.map((unit, index) => (
          <div
            key={index}
            className={`
              relative overflow-hidden
              bg-gradient-to-br from-card via-card to-card/80
              border-2 border-primary/30 rounded-2xl 
              p-4 md:p-6 min-w-[80px] md:min-w-[110px]
              shadow-xl hover:shadow-2xl
              transform hover:scale-105 transition-all duration-300
              ${index === 3 ? 'animate-pulse' : ''}
            `}
          >
            {/* خلفية متدرجة */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
            
            {/* أيقونة */}
            <div className="relative text-2xl mb-2">{unit.icon}</div>
            
            {/* الرقم */}
            <div className={`
              relative text-4xl md:text-5xl font-black text-primary
              drop-shadow-lg
              ${index === 3 ? 'animate-bounce' : ''}
            `}>
              {String(unit.value).padStart(2, '0')}
            </div>
            
            {/* التسمية */}
            <div className="relative text-sm md:text-base text-muted-foreground mt-2 font-medium">
              {unit.label}
            </div>
            
            {/* تأثير لامع */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
