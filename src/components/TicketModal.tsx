import { useState, useRef } from 'react';
import BalloonGame from './BalloonGame';
import RiddleGame from './games/RiddleGame';
import CodeBreaker from './games/CodeBreaker';
import CipherGame from './games/CipherGame';

interface Props {
  tickets: number;
  onEarn: () => void;
  onClose: () => void;
}

type Stage = 'idle' | 'preview' | 'checking' | 'success';
type Mode = 'photo' | 'game' | 'riddle' | 'code' | 'cipher';

const MODE_TABS: { key: Mode; label: string; icon: string }[] = [
  { key: 'photo', label: '上传图片 / 拍照', icon: 'fa-camera' },
  { key: 'game', label: '戳气球', icon: 'fa-gamepad' },
  { key: 'riddle', label: 'Emoji猜词', icon: 'fa-face-laugh-beam' },
  { key: 'code', label: '猜数字', icon: 'fa-hashtag' },
  { key: 'cipher', label: '密码解密', icon: 'fa-user-secret' }
];

export default function TicketModal({ tickets, onEarn, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('photo');
  const [stage, setStage] = useState<Stage>('idle');
  const [previewUrl, setPreviewUrl] = useState('');
  const [earnedCount, setEarnedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStage('preview');
    e.target.value = '';
  };

  const submit = () => {
    setStage('checking');
    setTimeout(() => {
      onEarn();
      setEarnedCount(c => c + 1);
      setStage('success');
    }, 1800);
  };

  const reset = () => {
    setPreviewUrl('');
    setStage('idle');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-slate-800 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-bold">
            <i className="fa-solid fa-ticket text-amber-400 mr-2"></i>获取抽奖券
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 mb-4">
            <span className="text-sm text-slate-300">当前抽奖券</span>
            <span className="text-2xl font-extrabold text-amber-300">
              {tickets}
              <i className="fa-solid fa-ticket text-sm ml-1.5"></i>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {MODE_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setMode(tab.key); setStage('idle'); }}
                className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all ${
                  mode === tab.key
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                    : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/30'
                }`}
              >
                <i className={`fa-solid ${tab.icon} mr-1`}></i>{tab.label}
              </button>
            ))}
          </div>

          {mode === 'game' && (
            <BalloonGame onWin={onEarn} onClose={onClose} />
          )}
          {mode === 'riddle' && (
            <RiddleGame onWin={onEarn} onClose={onClose} />
          )}
          {mode === 'code' && (
            <CodeBreaker onWin={onEarn} onClose={onClose} />
          )}
          {mode === 'cipher' && (
            <CipherGame onWin={onEarn} onClose={onClose} />
          )}

          {mode === 'photo' && stage === 'idle' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400 text-center">上传一张图片或拍照，即可获得 1 张抽奖券</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center gap-2 py-6 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-400/60 hover:bg-slate-900/60 transition-all group"
                >
                  <i className="fa-solid fa-image text-2xl text-sky-400 group-hover:scale-110 transition-transform"></i>
                  <span className="text-sm font-medium">上传图片</span>
                </button>
                <button
                  onClick={() => cameraRef.current?.click()}
                  className="flex flex-col items-center gap-2 py-6 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-400/60 hover:bg-slate-900/60 transition-all group"
                >
                  <i className="fa-solid fa-camera text-2xl text-rose-400 group-hover:scale-110 transition-transform"></i>
                  <span className="text-sm font-medium">拍照上传</span>
                </button>
              </div>
              {earnedCount > 0 && (
                <p className="text-center text-xs text-emerald-400">
                  <i className="fa-solid fa-circle-check mr-1"></i>本次已获得 {earnedCount} 张抽奖券
                </p>
              )}
            </div>
          )}

          {mode === 'photo' && stage === 'preview' && (
            <div className="space-y-4">
              <img src={previewUrl} alt="预览" className="w-full h-48 object-cover rounded-xl border border-white/10" />
              <div className="flex gap-3">
                <button onClick={reset} className="flex-1 py-2.5 rounded-lg text-sm bg-slate-700 hover:bg-slate-600 transition-colors">
                  重新选择
                </button>
                <button
                  onClick={submit}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-400 to-rose-500 hover:opacity-90 transition-opacity shadow-lg shadow-rose-500/25"
                >
                  提交获取抽奖券
                </button>
              </div>
            </div>
          )}

          {mode === 'photo' && stage === 'checking' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <i className="fa-solid fa-spinner fa-spin text-3xl text-amber-400"></i>
              <p className="text-sm text-slate-300">图片校验中，请稍候…</p>
            </div>
          )}

          {mode === 'photo' && stage === 'success' && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <i className="fa-solid fa-check text-3xl text-emerald-400"></i>
              </div>
              <div>
                <p className="font-bold text-lg mb-1">获得 1 张抽奖券！</p>
                <p className="text-sm text-slate-400">当前共有 {tickets} 张，快去抽奖吧</p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={reset} className="flex-1 py-2.5 rounded-lg text-sm bg-slate-700 hover:bg-slate-600 transition-colors">
                  继续获取
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-400 to-rose-500 hover:opacity-90 transition-opacity"
                >
                  去抽奖
                </button>
              </div>
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}
