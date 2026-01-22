import { useState, useEffect } from 'react';
import { Sparkles, Clock, Timer, Hourglass } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  style?: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ targetDate, style = 1 }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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
    ...(timeLeft.days > 0 ? [{ value: timeLeft.days, label: 'DAYS', arabicLabel: 'يوم' }] : []),
    { value: timeLeft.hours, label: 'HOURS', arabicLabel: 'ساعة' },
    { value: timeLeft.minutes, label: 'MINUTES', arabicLabel: 'دقيقة' },
    { value: timeLeft.seconds, label: 'SECONDS', arabicLabel: 'ثانية' },
  ];

  // Style 1: Green LED Digital Clock
  if (style === 1) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-black/95 border border-green-900/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-green-500/5"></div>
        <div className="relative p-6 md:p-8">
          <div className="text-center mb-6">
            <h3 className="text-lg md:text-xl font-bold text-green-400/80">الحلقة القادمة بعد</h3>
          </div>
          <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap" dir="ltr">
            {timeUnits.map((unit, index) => (
              <div key={index} className="flex items-center">
                <div className="relative text-center">
                  <div 
                    className="font-mono text-5xl md:text-7xl font-bold text-green-400 tabular-nums tracking-wider"
                    style={{
                      textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.4), 0 0 60px rgba(34, 197, 94, 0.2)',
                      fontFamily: '"Share Tech Mono", "Courier New", monospace',
                    }}
                  >
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] md:text-xs font-medium text-green-600/70 uppercase tracking-widest mt-1"
                    style={{ textShadow: '0 0 10px rgba(34, 197, 94, 0.5)' }}>
                    {unit.label}
                  </div>
                </div>
                {index < timeUnits.length - 1 && (
                  <div className="text-4xl md:text-6xl font-bold text-green-400 mx-1 md:mx-3 animate-pulse"
                    style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.4)' }}>:</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 h-0.5 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
        </div>
      </div>
    );
  }

  // Style 2: Flip Clock (Cards)
  if (style === 2) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-bold text-white/90">الحلقة القادمة بعد</h3>
        </div>
        <div className="flex justify-center items-center gap-3 md:gap-6 flex-wrap" dir="ltr">
          {timeUnits.map((unit, index) => (
            <div key={index} className="flex items-center">
              <div className="text-center">
                <div className="relative bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg p-4 md:p-6 shadow-lg border border-slate-600">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-slate-900/50"></div>
                  <span className="text-4xl md:text-6xl font-bold text-white tabular-nums" style={{ fontFamily: '"Roboto Mono", monospace' }}>
                    {String(unit.value).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-xs md:text-sm text-slate-400 mt-2 block uppercase tracking-wider">{unit.arabicLabel}</span>
              </div>
              {index < timeUnits.length - 1 && (
                <div className="text-3xl md:text-5xl font-bold text-slate-500 mx-2">:</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Style 3: Circular Progress
  if (style === 3) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 p-6 md:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-bold text-white">الحلقة القادمة بعد</h3>
        </div>
        <div className="flex justify-center items-center gap-4 md:gap-8 flex-wrap" dir="ltr">
          {timeUnits.map((unit, index) => {
            const maxValue = unit.label === 'DAYS' ? 30 : unit.label === 'HOURS' ? 24 : 60;
            const progress = (unit.value / maxValue) * 100;
            return (
              <div key={index} className="relative">
                <svg className="w-20 h-20 md:w-28 md:h-28 transform -rotate-90">
                  <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle cx="50%" cy="50%" r="45%" fill="none" stroke="url(#gradient)" strokeWidth="8"
                    strokeDasharray={`${progress * 2.83} 283`} strokeLinecap="round" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl md:text-3xl font-bold text-white">{String(unit.value).padStart(2, '0')}</span>
                  <span className="text-[10px] md:text-xs text-purple-300">{unit.arabicLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Style 4: Neon Glow
  if (style === 4) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-black p-6 md:p-8 shadow-2xl border border-pink-500/30">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-cyan-500/10"></div>
        <div className="relative text-center mb-6">
          <h3 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">الحلقة القادمة بعد</h3>
        </div>
        <div className="relative flex justify-center items-center gap-2 md:gap-4 flex-wrap" dir="ltr">
          {timeUnits.map((unit, index) => (
            <div key={index} className="flex items-center">
              <div className="text-center">
                <div className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-pink-400 via-purple-400 to-cyan-400"
                  style={{ textShadow: '0 0 30px rgba(236, 72, 153, 0.5), 0 0 60px rgba(34, 211, 238, 0.3)', fontFamily: '"Orbitron", sans-serif' }}>
                  {String(unit.value).padStart(2, '0')}
                </div>
                <span className="text-xs text-pink-300/80 uppercase tracking-widest">{unit.label}</span>
              </div>
              {index < timeUnits.length - 1 && (
                <div className="text-4xl md:text-6xl font-bold text-pink-400 mx-2 animate-pulse">:</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Style 5: Minimal Cards
  if (style === 5) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">الحلقة القادمة بعد</h3>
        </div>
        <div className="flex justify-center items-center gap-3 md:gap-6 flex-wrap" dir="ltr">
          {timeUnits.map((unit, index) => (
            <div key={index} className="flex items-center">
              <div className="text-center bg-slate-100 dark:bg-slate-800 rounded-xl p-4 md:p-6 min-w-[70px] md:min-w-[100px]">
                <span className="text-3xl md:text-5xl font-light text-slate-800 dark:text-white tabular-nums">
                  {String(unit.value).padStart(2, '0')}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase">{unit.arabicLabel}</p>
              </div>
              {index < timeUnits.length - 1 && (
                <span className="text-2xl md:text-4xl text-slate-300 dark:text-slate-600 mx-1">:</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Style 6: Gradient Boxes
  if (style === 6) {
    const gradients = ['from-rose-500 to-orange-500', 'from-amber-500 to-yellow-500', 'from-emerald-500 to-teal-500', 'from-blue-500 to-indigo-500'];
    return (
      <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-bold text-white">الحلقة القادمة بعد</h3>
        </div>
        <div className="flex justify-center items-center gap-3 md:gap-5 flex-wrap" dir="ltr">
          {timeUnits.map((unit, index) => (
            <div key={index} className="text-center">
              <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} rounded-xl p-4 md:p-6 shadow-lg`}>
                <span className="text-4xl md:text-6xl font-bold text-white tabular-nums drop-shadow-lg">
                  {String(unit.value).padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs md:text-sm text-slate-400 mt-2 block">{unit.arabicLabel}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Style 7: Retro LCD
  if (style === 7) {
    return (
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-amber-100 to-amber-200 p-6 md:p-8 shadow-xl border-4 border-amber-800/50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
        <div className="relative text-center mb-4">
          <h3 className="text-base md:text-lg font-bold text-amber-900">الحلقة القادمة بعد</h3>
        </div>
        <div className="relative flex justify-center items-center gap-1 md:gap-2" dir="ltr">
          {timeUnits.map((unit, index) => (
            <div key={index} className="flex items-center">
              <div className="text-center bg-amber-900/10 rounded px-3 py-2">
                <span className="text-4xl md:text-6xl font-bold text-amber-900 tabular-nums" style={{ fontFamily: '"LCD", "Courier New", monospace' }}>
                  {String(unit.value).padStart(2, '0')}
                </span>
              </div>
              {index < timeUnits.length - 1 && (
                <span className="text-3xl md:text-5xl text-amber-800 mx-1 animate-pulse">:</span>
              )}
            </div>
          ))}
        </div>
        <div className="relative text-center mt-3 flex justify-center gap-4 md:gap-8">
          {timeUnits.map((unit, index) => (
            <span key={index} className="text-[10px] md:text-xs text-amber-700 uppercase w-16 md:w-24">{unit.arabicLabel}</span>
          ))}
        </div>
      </div>
    );
  }

  // Style 8: Glassmorphism
  if (style === 8) {
    return (
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3))' }}>
        <div className="absolute inset-0 backdrop-blur-xl bg-white/10"></div>
        <div className="relative text-center mb-6">
          <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-lg">الحلقة القادمة بعد</h3>
        </div>
        <div className="relative flex justify-center items-center gap-3 md:gap-6 flex-wrap" dir="ltr">
          {timeUnits.map((unit, index) => (
            <div key={index} className="flex items-center">
              <div className="text-center backdrop-blur-md bg-white/20 rounded-2xl p-4 md:p-6 border border-white/30 shadow-lg">
                <span className="text-4xl md:text-6xl font-bold text-white tabular-nums drop-shadow-lg">
                  {String(unit.value).padStart(2, '0')}
                </span>
                <p className="text-xs text-white/80 mt-1">{unit.arabicLabel}</p>
              </div>
              {index < timeUnits.length - 1 && (
                <span className="text-3xl md:text-5xl text-white/60 mx-2">:</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Style 9: Dark Elegant
  if (style === 9) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 shadow-2xl border border-amber-500/20">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        <div className="text-center mb-6">
          <Clock className="w-6 h-6 mx-auto mb-2 text-amber-500" />
          <h3 className="text-lg md:text-xl font-bold text-amber-100">الحلقة القادمة بعد</h3>
        </div>
        <div className="flex justify-center items-center gap-4 md:gap-8 flex-wrap" dir="ltr">
          {timeUnits.map((unit, index) => (
            <div key={index} className="text-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-amber-500/20 rounded-lg blur-lg"></div>
                <div className="relative bg-slate-800 rounded-lg px-4 py-3 md:px-6 md:py-4 border border-amber-500/30">
                  <span className="text-4xl md:text-6xl font-light text-amber-100 tabular-nums" style={{ fontFamily: '"Playfair Display", serif' }}>
                    {String(unit.value).padStart(2, '0')}
                  </span>
                </div>
              </div>
              <span className="text-xs text-amber-500/80 mt-2 block uppercase tracking-widest">{unit.arabicLabel}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Style 10: Modern Split
  if (style === 10) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 md:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative text-center mb-6">
          <Timer className="w-8 h-8 mx-auto mb-2 text-white/90" />
          <h3 className="text-lg md:text-xl font-bold text-white">الحلقة القادمة بعد</h3>
        </div>
        <div className="relative flex justify-center items-center gap-2 md:gap-4 flex-wrap" dir="ltr">
          {timeUnits.map((unit, index) => (
            <div key={index} className="flex items-center">
              <div className="text-center">
                <div className="flex gap-1">
                  {String(unit.value).padStart(2, '0').split('').map((digit, dIndex) => (
                    <div key={dIndex} className="bg-white/20 backdrop-blur rounded-lg px-3 py-2 md:px-4 md:py-3">
                      <span className="text-3xl md:text-5xl font-bold text-white">{digit}</span>
                    </div>
                  ))}
                </div>
                <span className="text-xs text-white/70 mt-2 block">{unit.arabicLabel}</span>
              </div>
              {index < timeUnits.length - 1 && (
                <span className="text-2xl md:text-4xl text-white/50 mx-1 self-start mt-2 md:mt-3">:</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default fallback to style 1
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black/95 border border-green-900/50 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-green-500/5"></div>
      <div className="relative p-6 md:p-8">
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-bold text-green-400/80">الحلقة القادمة بعد</h3>
        </div>
        <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap" dir="ltr">
          {timeUnits.map((unit, index) => (
            <div key={index} className="flex items-center">
              <div className="relative text-center">
                <div 
                  className="font-mono text-5xl md:text-7xl font-bold text-green-400 tabular-nums tracking-wider"
                  style={{
                    textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.4), 0 0 60px rgba(34, 197, 94, 0.2)',
                    fontFamily: '"Share Tech Mono", "Courier New", monospace',
                  }}
                >
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="text-[10px] md:text-xs font-medium text-green-600/70 uppercase tracking-widest mt-1"
                  style={{ textShadow: '0 0 10px rgba(34, 197, 94, 0.5)' }}>
                  {unit.label}
                </div>
              </div>
              {index < timeUnits.length - 1 && (
                <div className="text-4xl md:text-6xl font-bold text-green-400 mx-1 md:mx-3 animate-pulse"
                  style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.4)' }}>:</div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 h-0.5 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
      </div>
    </div>
  );
}
