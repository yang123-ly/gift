import { useState, useEffect, ReactNode } from 'react';

const OPEN_TIME = new Date('2026-10-29T00:00:00').getTime();

export function isDebugMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('debug') === '1' || params.get('debug') === 'true';
}

function formatUnit(value: number) {
  return String(value).padStart(2, '0');
}

export default function CountdownGate({ children }: { children: ReactNode }) {
  const [remaining, setRemaining] = useState(() => OPEN_TIME - Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(OPEN_TIME - Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (remaining <= 0 || isDebugMode()) return <>{children}</>;

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  const units = [
    { label: '天', value: days },
    { label: '时', value: formatUnit(hours) },
    { label: '分', value: formatUnit(minutes) },
    { label: '秒', value: formatUnit(seconds) }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-amber-400 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(244,114,182,0.4)] animate-pulse">
        <i className="fa-solid fa-cake-candles text-3xl text-white"></i>
      </div>
      <h2 className="text-2xl font-extrabold bg-gradient-to-r from-pink-300 via-amber-200 to-pink-300 bg-clip-text text-transparent mb-2">
        生日惊喜即将开启
      </h2>
      <p className="text-sm text-rose-200/70 mb-8">
        <i className="fa-solid fa-heart text-rose-300 mr-1.5"></i>
        开奖时间：2026年10月29日，请耐心等待这份心意
      </p>
      <div className="flex items-center gap-3">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-center gap-3">
            <div className="w-20 rounded-2xl bg-white/5 border border-white/10 backdrop-blur px-3 py-4">
              <div className="text-3xl font-extrabold text-amber-300 tabular-nums">{u.value}</div>
              <div className="text-xs text-slate-400 mt-1">{u.label}</div>
            </div>
            {i < units.length - 1 && <span className="text-2xl text-pink-300/60 font-bold">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
