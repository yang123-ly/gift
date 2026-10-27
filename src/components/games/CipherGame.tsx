import { useState, useMemo } from 'react';

interface Props {
  onWin: () => void;
  onClose: () => void;
}

interface Puzzle {
  cipher: string;
  hintType: string;
  answer: string;
  clue: string;
}

const CAESAR = (word: string, shift: number) =>
  word.split('').map(c => String.fromCharCode(((c.charCodeAt(0) - 97 + shift) % 26) + 97)).join('');

const REVERSE = (word: string) => word.split('').reverse().join('');

const NUMERIC = (word: string) => word.split('').map(c => c.charCodeAt(0) - 96).join('-');

const PUZZLES: Puzzle[] = [
  { cipher: CAESAR('birthday', 3), hintType: '凯撒密码：每个字母向后移3位', answer: 'birthday', clue: '生日' },
  { cipher: CAESAR('happy', 3), hintType: '凯撒密码：每个字母向后移3位', answer: 'happy', clue: '开心的' },
  { cipher: REVERSE('gift'), hintType: '倒序密码：字母顺序颠倒', answer: 'gift', clue: '礼物' },
  { cipher: REVERSE('cake'), hintType: '倒序密码：字母顺序颠倒', answer: 'cake', clue: '蛋糕' },
  { cipher: NUMERIC('love'), hintType: '数字密码：1=a, 2=b ... 26=z', answer: 'love', clue: '爱' },
  { cipher: NUMERIC('star'), hintType: '数字密码：1=a, 2=b ... 26=z', answer: 'star', clue: '星星' }
];

const ROUND_SIZE = 3;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function CipherGame({ onWin, onClose }: Props) {
  const [round, setRound] = useState(() => shuffle(PUZZLES).slice(0, ROUND_SIZE));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [hintsLeft, setHintsLeft] = useState(2);
  const [showClue, setShowClue] = useState(false);
  const [won, setWon] = useState(false);

  const puzzle = round[index];

  const restart = () => {
    setRound(shuffle(PUZZLES).slice(0, ROUND_SIZE));
    setIndex(0);
    setInput('');
    setFeedback('none');
    setHintsLeft(2);
    setShowClue(false);
    setWon(false);
  };

  const submit = () => {
    if (feedback === 'correct') return;
    if (input.trim().toLowerCase() === puzzle.answer) {
      setFeedback('correct');
      setTimeout(() => {
        if (index + 1 >= ROUND_SIZE) {
          setWon(true);
          onWin();
        } else {
          setIndex(i => i + 1);
          setInput('');
          setFeedback('none');
          setShowClue(false);
        }
      }, 900);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback('none'), 600);
    }
  };

  const useHint = () => {
    if (hintsLeft <= 0 || showClue) return;
    setHintsLeft(h => h - 1);
    setShowClue(true);
  };

  const cipherChars = useMemo(() => puzzle.cipher.split(/(?<=.)/), [puzzle]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">
          <i className="fa-solid fa-key text-amber-400 mr-1.5"></i>
          第 <span className="font-bold text-amber-300">{Math.min(index + 1, ROUND_SIZE)}</span>/{ROUND_SIZE} 题
        </span>
        <span className="text-slate-400">
          <i className="fa-solid fa-lightbulb text-yellow-300 mr-1.5"></i>
          提示剩余 <span className="font-bold text-yellow-300">{hintsLeft}</span>
        </span>
      </div>

      {!won ? (
        <>
          <div className="rounded-xl bg-slate-900/60 border border-white/10 p-4">
            <p className="text-xs text-slate-400 mb-3">
              <i className="fa-solid fa-shield-halved text-sky-400 mr-1.5"></i>
              {puzzle.hintType}
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {cipherChars.map((c, i) => (
                <span
                  key={i}
                  className="min-w-[34px] h-11 px-1.5 flex items-center justify-center rounded-lg bg-gradient-to-b from-slate-700 to-slate-800 border border-white/15 text-amber-200 font-mono font-bold text-lg shadow-md"
                >
                  {c}
                </span>
              ))}
            </div>
            {showClue && (
              <p className="text-center text-xs text-emerald-300 mt-3">
                <i className="fa-solid fa-circle-info mr-1"></i>线索：{puzzle.clue}，首字母 {puzzle.answer[0].toUpperCase()}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="输入解密后的英文单词"
              className={`flex-1 bg-slate-900 border rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-colors ${
                feedback === 'wrong'
                  ? 'border-rose-400 animate-[shake_0.4s]'
                  : feedback === 'correct'
                  ? 'border-emerald-400'
                  : 'border-white/10 focus:border-amber-400'
              }`}
            />
            <button
              onClick={submit}
              className="px-4 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-400 to-rose-500 hover:opacity-90 transition-opacity"
            >
              解密
            </button>
          </div>

          {feedback === 'correct' && (
            <p className="text-center text-xs text-emerald-400">
              <i className="fa-solid fa-circle-check mr-1"></i>解密成功！
            </p>
          )}
          {feedback === 'wrong' && (
            <p className="text-center text-xs text-rose-400">
              <i className="fa-solid fa-circle-xmark mr-1"></i>答案不对，再想想
            </p>
          )}

          <button
            onClick={useHint}
            disabled={hintsLeft <= 0 || showClue}
            className="w-full py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-lightbulb text-yellow-300 mr-1.5"></i>
            {showClue ? '本题已使用提示' : hintsLeft > 0 ? '使用提示' : '提示已用完'}
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <i className="fa-solid fa-trophy text-4xl text-amber-400"></i>
          <p className="font-bold text-lg">全部解密成功！获得 1 张抽奖券</p>
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

      <style>{`@keyframes shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-5px) } 75% { transform: translateX(5px) } }`}</style>
    </div>
  );
}
