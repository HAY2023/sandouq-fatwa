import { useState, useEffect } from 'react';
import { Sparkles, Clock, Timer } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  style?: number; // 1: LED أخضر, 2: كلاسيكي, 3: بسيط, 4: دائري
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}

// حساب الوقت المتبقي
function calculateTimeLeft(targetDate: string) {
  const difference = new Date(targetDate).getTime() - new Date().getTime();
  
  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

// نمط LED الأخضر الرقمي
function LEDStyle({ timeLeft, bgColor, textColor, borderColor }: { 
  timeLeft: { days: number; hours: number; minutes: number; seconds: number };
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}) {
  const bg = bgColor || '#000000';
  const text = textColor || '#22c55e';
  const border = borderColor || '#166534';
  
  const timeUnits = [
    ...(timeLeft.days > 0 ? [{ value: timeLeft.days, label: 'DAYS' }] : []),
    { value: timeLeft.hours, label: 'HOURS' },
    { value: timeLeft.minutes, label: 'MINUTES' },
    { value: timeLeft.seconds, label: 'SECONDS' },
  ];

  return (
    <div 
      className="relative overflow-hidden rounded-2xl shadow-2xl"
      style={{ backgroundColor: bg, borderColor: border, borderWidth: '1px', borderStyle: 'solid' }}
    >
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${text}10, transparent, ${text}10)` }}></div>
      
      <div className="relative p-6 md:p-8">
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-bold" style={{ color: `${text}cc` }}>
            الحلقة القادمة بعد
          </h3>
        </div>
        
        <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap" dir="ltr">
          {timeUnits.map((unit, index) => (
            <div key={index} className="flex items-center">
              <div className="relative text-center">
                <div 
                  className="font-mono text-5xl md:text-7xl font-bold tabular-nums tracking-wider"
                  style={{
                    color: text,
                    textShadow: `0 0 20px ${text}cc, 0 0 40px ${text}66, 0 0 60px ${text}33`,
                    fontFamily: '"Share Tech Mono", "Courier New", monospace',
                  }}
                >
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div 
                  className="text-[10px] md:text-xs font-medium uppercase tracking-widest mt-1"
                  style={{ color: `${text}b3`, textShadow: `0 0 10px ${text}80` }}
                >
                  {unit.label}
                </div>
              </div>
              
              {index < timeUnits.length - 1 && (
                <div 
                  className="text-4xl md:text-6xl font-bold mx-1 md:mx-3 animate-pulse"
                  style={{ color: text, textShadow: `0 0 20px ${text}cc, 0 0 40px ${text}66` }}
                >
                  :
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 h-0.5" style={{ background: `linear-gradient(to right, transparent, ${text}80, transparent)` }}></div>
      </div>
    </div>
  );
}

// النمط الكلاسيكي الأنيق
function ClassicStyle({ timeLeft }: { timeLeft: { days: number; hours: number; minutes: number; seconds: number } }) {
  const timeUnits = [
    ...(timeLeft.days > 0 ? [{ value: timeLeft.days, label: 'يوم' }] : []),
    { value: timeLeft.hours, label: 'ساعة' },
    { value: timeLeft.minutes, label: 'دقيقة' },
    { value: timeLeft.seconds, label: 'ثانية' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20 shadow-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
      
      <div className="relative p-6 md:p-8">
        <div className="text-center mb-6 flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg md:text-xl font-bold text-primary">
            الحلقة القادمة بعد
          </h3>
        </div>
        
        <div className="flex justify-center items-center gap-3 md:gap-6 flex-wrap" dir="rtl">
          {timeUnits.map((unit, index) => (
            <div key={index} className="text-center">
              <div className="bg-card border-2 border-primary/30 rounded-xl p-4 md:p-6 shadow-lg min-w-[70px] md:min-w-[90px]">
                <div className="text-3xl md:text-5xl font-bold text-foreground tabular-nums">
                  {String(unit.value).padStart(2, '0')}
                </div>
              </div>
              <div className="text-sm md:text-base font-medium text-muted-foreground mt-2">
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// النمط البسيط المينيمال
function MinimalStyle({ timeLeft }: { timeLeft: { days: number; hours: number; minutes: number; seconds: number } }) {
  const formatTime = () => {
    const parts = [];
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
    parts.push(`${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`);
    return parts.join(' ');
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-md">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Timer className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">الحلقة القادمة بعد</span>
        </div>
        <div 
          className="text-4xl md:text-6xl font-mono font-bold text-foreground tabular-nums tracking-wider"
          dir="ltr"
        >
          {formatTime()}
        </div>
        {timeLeft.days > 0 && (
          <div className="text-sm text-muted-foreground mt-2">
            {timeLeft.days} يوم
          </div>
        )}
      </div>
    </div>
  );
}

// النمط الدائري
function CircularStyle({ timeLeft }: { timeLeft: { days: number; hours: number; minutes: number; seconds: number } }) {
  const timeUnits = [
    ...(timeLeft.days > 0 ? [{ value: timeLeft.days, max: 30, label: 'يوم', color: 'stroke-blue-500' }] : []),
    { value: timeLeft.hours, max: 24, label: 'ساعة', color: 'stroke-emerald-500' },
    { value: timeLeft.minutes, max: 60, label: 'دقيقة', color: 'stroke-amber-500' },
    { value: timeLeft.seconds, max: 60, label: 'ثانية', color: 'stroke-rose-500' },
  ];

  const CircleProgress = ({ value, max, color }: { value: number; max: number; color: string }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = ((max - value) / max) * circumference;
    
    return (
      <svg className="w-24 h-24 md:w-28 md:h-28 -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className="fill-none stroke-muted/30"
          strokeWidth="6"
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className={`fill-none ${color} transition-all duration-300`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
        />
      </svg>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
      <div className="relative p-6 md:p-8">
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-bold text-white/90">
            الحلقة القادمة بعد
          </h3>
        </div>
        
        <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap" dir="rtl">
          {timeUnits.map((unit, index) => (
            <div key={index} className="relative flex flex-col items-center">
              <div className="relative">
                <CircleProgress value={unit.value} max={unit.max} color={unit.color} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                    {String(unit.value).padStart(2, '0')}
                  </span>
                </div>
              </div>
              <span className="text-xs md:text-sm text-white/60 mt-2">{unit.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// المكون المنتهي
function ExpiredState() {
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

export function CountdownTimer({ targetDate, style = 1, bgColor, textColor, borderColor }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return <ExpiredState />;
  }

  switch (style) {
    case 2:
      return <ClassicStyle timeLeft={timeLeft} />;
    case 3:
      return <MinimalStyle timeLeft={timeLeft} />;
    case 4:
      return <CircularStyle timeLeft={timeLeft} />;
    default:
      return <LEDStyle timeLeft={timeLeft} bgColor={bgColor} textColor={textColor} borderColor={borderColor} />;
  }
}

// مكون المعاينة للإعدادات
interface CountdownTimerPreviewProps {
  style: number;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}

export function CountdownTimerPreview({ style, bgColor, textColor, borderColor }: CountdownTimerPreviewProps) {
  // استخدام وقت ثابت للمعاينة (3 أيام و 5 ساعات و 23 دقيقة و 45 ثانية)
  const previewTimeLeft = { days: 3, hours: 5, minutes: 23, seconds: 45 };

  switch (style) {
    case 2:
      return <ClassicStyle timeLeft={previewTimeLeft} />;
    case 3:
      return <MinimalStyle timeLeft={previewTimeLeft} />;
    case 4:
      return <CircularStyle timeLeft={previewTimeLeft} />;
    default:
      return <LEDStyle timeLeft={previewTimeLeft} bgColor={bgColor} textColor={textColor} borderColor={borderColor} />;
  }
}
