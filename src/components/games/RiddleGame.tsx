import { useState, useEffect } from 'react';

interface Props {
  onWin: () => void;
  onClose: () => void;
}

interface Riddle {
  emojis: string;
  answer: string;
  hint: string;
}

const RIDDLES: Riddle[] = [
  { emojis: '🎂🕯️🎉', answer: '生日', hint: '每年一次的特殊日子' },
  { emojis: '🎁❓', answer: '礼物', hint: '转盘上抽到的东西' },
  { emojis: '🌧️☂️', answer: '雨伞', hint: '下雨天的必备品' },
  { emojis: '📱💬', answer: '微信', hint: '聊天社交软件' },
  { emojis: '🐱🐟', answer: '猫', hint: '爱吃鱼的宠物' },
  { emojis: '🌞🌻', answer: '向日葵', hint: '朝着太阳开的花' },
  { emojis: '❄️⛄', answer: '雪人', hint: '冬天堆出来的' },
  { emojis: '🚀🌙', answer: '火箭', hint: '飞向月球的交通工具' },
  { emojis: '🍜🥢', answer: '面条', hint: '用筷子吃的长条食物' },
  { emojis: '👓📖', answer: '眼镜', hint: '看书时戴在脸上的' }
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const TOTAL = 5;
const MAX_SKIP = 3;

export default function RiddleGame({ onWin, onClose }: Props) {
  const [questions, setQuestions] = useState<Riddle[]>([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [skipsLeft, setSkipsLeft] = useState(MAX_SKIP);
  const [won, setWon] = useState(false);
  const [pool, setPool] = useState<Riddle[]>([]);

  const startGame = () => {
    const picked = shuffle(RIDDLES).slice(0, TOTAL);
    setQuestions(picked);
    setPool(shuffle(RIDDLES).filter(r => !picked.includes(r)));
    setCurrent(0);
    setInput('');
    setFeedback('none');
    setSkipsLeft(MAX_SKIP);
    setWon(false);
  };

  useEffect(() => {
    startGame();
  }, []);

  const submit = () => {
    if (feedback === 'correct' || questions.length === 0) return;
    const q = questions[current];
    if (input.trim() === q.answer) {
      setFeedback('correct');
      setTimeout(() => {
        if (current + 1 >= TOTAL) {
          setWon(true);
          onWin();
        } else {
          setCurrent(c => c + 1);
          setInput('');
          setFeedback('none');
        }
      }, 700);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback('none'), 600);
    }
  };

  const skip = () => {
    if (skipsLeft <= 0 || pool.length === 0 || feedback === 'correct') return;
    const [next, ...rest] = pool;
    setQuestions(prev => prev.map((q, i) => (i === current ? next : q)));
    setPool(rest);
    setSkipsLeft(s => s - 1);
    setInput('');
    setFeedback('none');
  };

  const q = questions[current];

  return (
    <div className="space-y-4">
      {won ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <i className="fa-solid fa-trophy text-4xl text-amber-400"></i>
          <p className="font-bold text-lg">全部答对！获得 1 张抽奖券</p>
          <div className="flex gap-3">
            <button onClick={startGame} className="px-4 py-2 rounded-lg text-sm bg-slate-700 hover:bg-slate-600 transition-colors">
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
      ) : q ? (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">
              <i className="fa-solid fa-puzzle-piece text-violet-400 mr-1.5"></i>
              第 <span className="font-bold text-violet-300">{current + 1}</span>/{TOTAL} 题
            </span>
            <span className="text-slate-400">
              <i className="fa-solid fa-forward mr-1"></i>换题机会 {skipsLeft}
            </span>
          </div>

          <div className="rounded-xl bg-gradient-to-b from-sky-900/40 to-indigo-900/40 border border-white/10 py-8 text-center">
            <div className="text-4xl tracking-widest mb-3">{q.emojis}</div>
            <p className="text-xs text-slate-400">
              <i className="fa-solid fa-lightbulb text-amber-300 mr-1"></i>提示：{q.hint}
            </p>
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="输入你的答案"
              className={`flex-1 bg-slate-900 border rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors ${
                feedback === 'wrong'
                  ? 'border-rose-500 animate-[shake_0.4s]'
                  : feedback === 'correct'
                  ? 'border-emerald-400'
                  : 'border-white/10 focus:border-amber-400'
              }`}
            />
            <button
              onClick={submit}
              disabled={feedback === 'correct'}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-400 to-rose-500 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {feedback === 'correct' ? (
                <i className="fa-solid fa-check text-white"></i>
              ) : (
                '提交'
              )}
            </button>
          </div>

          {feedback === 'wrong' && (
            <p className="text-xs text-rose-400 text-center">
              <i className="fa-solid fa-xmark mr-1"></i>答案不对，再想想～
            </p>
          )}
          {feedback === 'correct' && (
            <p className="text-xs text-emerald-400 text-center">
              <i className="fa-solid fa-circle-check mr-1"></i>答对了！
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={skip}
              disabled={skipsLeft <= 0 || pool.length === 0}
              className="flex-1 py-2 rounded-lg text-sm bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-shuffle mr-1.5"></i>换一题
            </button>
            <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 transition-colors">
              去抽奖
            </button>
          </div>
        </>
      ) : null}
      <style>{`@keyframes shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-6px) } 75% { transform: translateX(6px) } }`}</style>
    </div>
  );
}
