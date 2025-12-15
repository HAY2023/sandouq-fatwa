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
      <div className="text-center p-6 bg-primary/10 rounded-xl">
        <p className="text-lg text-primary font-medium">الحلقة الآن أو قريبًا جدًا</p>
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
    <div className="text-center">
      <h3 className="text-xl mb-4 text-muted-foreground">الحلقة القادمة بعد</h3>
      <div className="flex justify-center gap-3 flex-wrap" dir="ltr">
        {timeUnits.map((unit, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-xl p-4 min-w-[70px] shadow-sm"
          >
            <div className="text-3xl font-bold text-primary">{unit.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
