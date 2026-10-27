import { useState, useRef } from 'react';

interface Props {
  onWin: () => void;
  onClose: () => void;
}

interface GuessRecord {
  guess: string;
  a: number;
  b: number;
}

const MAX_TRIES = 10;

function generateAnswer(): string {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let answer = '';
  while (answer.length < 4) {
    const idx = Math.floor(Math.random() * digits.length);
    answer += digits.splice(idx, 1)[0];
  }
  return answer;
}

function judge(guess: string, answer: string) {
  let a = 0;
  let b = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === answer[i]) a++;
    else if (answer.includes(guess[i])) b++;
  }
  return { a, b };
}

export default function CodeBreaker({ onWin, onClose }: Props) {
  const [answer, setAnswer] = useState(generateAnswer);
  const [digits, setDigits] = useState(['', '', '', '']);
  const [history, setHistory] = useState<GuessRecord[]>([]);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const remaining = MAX_TRIES - history.length;

  const setDigit = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError('');
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const submit = () => {
    if (status !== 'playing') return;
    const guess = digits.join('');
    if (guess.length < 4) {
      setError('请输入完整的4位数字');
      return;
    }
    if (new Set(guess).size !== 4) {
      setError('数字不能重复');
      return;
    }
    const { a, b } = judge(guess, answer);
    const record = { guess, a, b };
    const nextHistory = [...history, record];
    setHistory(nextHistory);
    setDigits(['', '', '', '']);
    inputRefs.current[0]?.focus();
    if (a === 4) {
      setStatus('won');
      onWin();
    } else if (nextHistory.length >= MAX_TRIES) {
      setStatus('lost');
    }
  };

  const restart = () => {
    setAnswer(generateAnswer());
    setDigits(['', '', '', '']);
    setHistory([]);
    setStatus('playing');
    setError('');
  };

  const duplicate = new Set(digits.filter(d => d)).size !== digits.filter(d => d).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">
          <i className="fa-solid fa-key text-amber-400 mr-1.5"></i>
          破解4位神秘数字密码
        </span>
        <span className={`font-bold ${remaining <= 3 ? 'text-rose-400' : 'text-amber-300'}`}>
          <i className="fa-solid fa-hourglass-half mr-1.5"></i>剩余 {remaining} 次
        </span>
      </div>

      <div className="flex items-center justify-center gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            value={d}
            onChange={e => setDigit(i, e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') submit();
              if (e.key === 'Backspace' && !d && i > 0) inputRefs.current[i - 1]?.focus();
            }}
            disabled={status !== 'playing'}
            maxLength={1}
            inputMode="numeric"
            className={`w-14 h-16 text-center text-2xl font-extrabold rounded-xl bg-slate-900 border outline-none transition-colors ${
              duplicate && d
                ? 'border-rose-500 text-rose-400'
                : 'border-white/10 text-white focus:border-amber-400'
            } disabled:opacity-50`}
          />
        ))}
      </div>
      {error && <p className="text-xs text-rose-400 text-center">{error}</p>}
      {duplicate && !error && (
        <p className="text-xs text-rose-400 text-center">数字不能重复</p>
      )}

      {status === 'playing' && (
        <button
          onClick={submit}
          className="w-full py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-400 to-rose-500 hover:opacity-90 transition-opacity shadow-lg shadow-rose-500/25"
        >
          <i className="fa-solid fa-unlock-keyhole mr-1.5"></i>尝试破解
        </button>
      )}

      {history.length > 0 && (
        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
          {history.map((h, i) => {
            const closeness = h.a * 2 + h.b;
            const badgeCls =
              h.a === 4
                ? 'bg-emerald-500/25 text-emerald-300'
                : closeness >= 4
                ? 'bg-lime-500/20 text-lime-300'
                : closeness >= 2
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-slate-500/20 text-slate-300';
            return (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-1.5 text-sm">
                <span className="text-slate-400 text-xs">第 {i + 1} 次</span>
                <span className="font-mono font-bold tracking-widest">{h.guess}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeCls}`}>
                  {h.a}A{h.b}B
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-slate-500 text-center">
        <i className="fa-solid fa-circle-info mr-1"></i>
        A=数字和位置都对，B=数字对但位置错，猜出 4A0B 即获胜
      </p>

      {status !== 'playing' && (
        <div className="flex flex-col items-center gap-3 py-4 rounded-xl bg-black/40 border border-white/10 text-center">
          {status === 'won' ? (
            <>
              <i className="fa-solid fa-trophy text-4xl text-amber-400"></i>
              <p className="font-bold text-lg">破解成功！获得 1 张抽奖券</p>
            </>
          ) : (
            <>
              <i className="fa-solid fa-lock text-4xl text-slate-400"></i>
              <p className="font-bold text-lg">机会用完，正确答案是</p>
              <p className="text-2xl font-extrabold font-mono tracking-widest text-rose-400">{answer}</p>
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
  );
}
