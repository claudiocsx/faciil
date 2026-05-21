import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

const calcTimeLeft = (endsAt) => {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
};

const CountdownTimer = ({ endsAt, onExpired, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(endsAt));
  const expiredCalled = useRef(false);

  useEffect(() => {
    setTimeLeft(calcTimeLeft(endsAt));
    expiredCalled.current = false;
    const interval = setInterval(() => {
      const tl = calcTimeLeft(endsAt);
      setTimeLeft(tl);
      if (!tl && !expiredCalled.current) {
        expiredCalled.current = true;
        onExpired?.();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt, onExpired]);

  if (!timeLeft) return null;

  if (compact) {
    const h = String(timeLeft.hours).padStart(2, '0');
    const m = String(timeLeft.minutes).padStart(2, '0');
    const s = String(timeLeft.seconds).padStart(2, '0');
    return (
      <span className="font-bold tabular-nums" style={{ color: '#EF4444' }}>
        {h}:{m}:{s}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5" aria-live="polite">
      <Clock size={14} style={{ color: '#EF4444' }} />
      <span className="text-xs font-bold" style={{ color: '#EF4444' }}>
        {timeLeft.hours > 0 && `${timeLeft.hours}h `}
        {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  );
};

export default CountdownTimer;
