import { useState, useEffect, useRef } from 'react';

interface Props {
  onWin: () => void;
  onClose: () => void;
}

interface Balloon {
  id: number;
  left: number;
  color: string;
  duration: number;
  delay: number;
  popped: boolean;
}

const COLORS = ['#f472b6', '#fbbf24', '#60a5fa', '#34d399', '#a78bfa', '#fb7185'];
const TARGET = 8;
const GAME_TIME = 15;

export default function BalloonGame({ onWin, onClose }: Props) {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const idRef = useRef(0);
  const wonRef = useRef(false);

  useEffect(() => {
    const spawn = window.setInterval(() => {
      idRef.current += 1;
      const balloon: Balloon = {
        id: idRef.current,
        left: 5 + Math.random() * 85,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        duration: 3 + Math.random() * 2.5,
        delay: 0,
        popped: false
      };
      setBalloons(prev => [...prev.slice(-14), balloon]);
    }, 600);
    return () => window.clearInterval(spawn);
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;
    const timer = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (!wonRef.current) setStatus('lost');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const pop = (id: number) => {
    if (status !== 'playing') return;
    setBalloons(prev => prev.map(b => (b.id === id ? { ...b, popped: true } : b)));
    setPoppedCount(prev => {
      const next = prev + 1;
      if (next >= TARGET && !wonRef.current) {
        wonRef.current = true;
        setStatus('won');
        onWin();
      }
      return next;
    });
  };

  const restart = () => {
    setBalloons([]);
    setPoppedCount(0);
    setTimeLeft(GAME_TIME);
    setStatus('playing');
    wonRef.current = false;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">
          <i className="fa-solid fa-burst text-pink-400 mr-1.5"></i>
          已戳破 <span className="font-bold text-pink-300">{poppedCount}</span>/{TARGET}
        </span>
        <span className={`font-bold ${timeLeft <= 5 ? 'text-rose-400' : 'text-amber-300'}`}>
          <i className="fa-solid fa-stopwatch mr-1.5"></i>{timeLeft}s
        </span>
      </div>
      <div className="relative h-52 rounded-xl bg-gradient-to-b from-sky-900/40 to-indigo-900/40 border border-white/10 overflow-hidden">
        {balloons.map(b => (
          <button
            key={b.id}
            onClick={() => pop(b.id)}
            disabled={b.popped}
            className="absolute bottom-0 text-3xl transition-transform"
            style={{
              left: `${b.left}%`,
              color: b.color,
              animation: `floatUp ${b.duration}s linear forwards`,
              opacity: b.popped ? 0 : 1,
              transform: b.popped ? 'scale(1.6)' : undefined,
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))'
            }}
          >
            <span className="block relative">
              <span
                className="block w-9 h-11 rounded-full"
                style={{ backgroundColor: b.color, boxShadow: `inset -4px -4px 8px rgba(0,0,0,0.2), inset 4px 4px 8px rgba(255,255,255,0.4)` }}
              />
              <span className="block w-px h-5 bg-white/50 mx-auto" />
            </span>
          </button>
        ))}
        {status !== 'playing' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-3">
            {status === 'won' ? (
              <>
                <i className="fa-solid fa-trophy text-4xl text-amber-400"></i>
                <p className="font-bold text-lg">挑战成功！获得 1 张抽奖券</p>
              </>
            ) : (
              <>
                <i className="fa-solid fa-face-frown text-4xl text-slate-400"></i>
                <p className="font-bold text-lg">时间到，再试一次吧</p>
              </>
            )}
            <div className="flex gap-3">
              <button onClick={restart} className="px-4 py-2 rounded-lg text-sm bg-slate-700 hover:bg-slate-600 transition-colors">
                再玩一次
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-400 to-rose-500 hover:opacity-90 transition-opacity"
              >
                去抽奖
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500 text-center">
        <i className="fa-solid fa-circle-info mr-1"></i>
        {GAME_TIME} 秒内戳破 {TARGET} 个气球即可获得 1 张抽奖券
      </p>
      <style>{`@keyframes floatUp { from { transform: translateY(20px) } to { transform: translateY(-230px) } }`}</style>
    </div>
  );
}
