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
      <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-xl md:text-2xl text-primary font-semibold">الحلقة الآن أو قريبًا جدًا</p>
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'يوم' },
    { value: timeLeft.hours, label: 'ساعة' },
    { value: timeLeft.minutes, label: 'دقيقة' },
    { value: timeLeft.seconds, label: 'ثانية' },
  ];

  return (
    <div className="text-center py-6">
      <h3 className="text-xl md:text-2xl mb-6 text-foreground font-semibold">
        الحلقة القادمة بعد
      </h3>
      <div className="flex justify-center gap-2 md:gap-4 flex-wrap" dir="ltr">
        {timeUnits.map((unit, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-3 md:p-5 min-w-[70px] md:min-w-[90px] shadow-sm"
          >
            <div className="text-3xl md:text-4xl font-bold text-primary tabular-nums">
              {String(unit.value).padStart(2, '0')}
            </div>
            <div className="text-sm text-muted-foreground mt-1 font-medium">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}