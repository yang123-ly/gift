import { useState } from 'react';
import { Prize, EffectType, Rarity, RARITY_LABELS, EFFECT_LABELS, RARITY_COLORS, PRESET_IMAGES } from '../types';

interface PrizeFormProps {
  initial?: Prize | null;
  onSave: (data: Omit<Prize, 'id'>) => void;
  onClose: () => void;
}

const ICONS = [
  'fa-gift', 'fa-star', 'fa-crown', 'fa-gem', 'fa-coins', 'fa-headphones',
  'fa-heart', 'fa-ticket', 'fa-wand-magic-sparkles', 'fa-ring', 'fa-trophy', 'fa-face-smile'
];

const COLORS = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4', '#f59e0b', '#eab308', '#64748b'];

const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
const EFFECTS: EffectType[] = ['confetti', 'fireworks', 'goldRain', 'starBurst', 'none'];

export default function PrizeForm({ initial, onSave, onClose }: PrizeFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? 'fa-gift');
  const [image, setImage] = useState(initial?.image ?? PRESET_IMAGES[0]);
  const [color, setColor] = useState(initial?.color ?? '#f43f5e');
  const [probability, setProbability] = useState(initial?.probability ?? 10);
  const [rarity, setRarity] = useState<Rarity>(initial?.rarity ?? 'common');
  const [effect, setEffect] = useState<EffectType>(initial?.effect ?? 'confetti');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('请输入奖品名称');
      return;
    }
    onSave({ name: name.trim(), icon, image, color, probability, effect, rarity });
  };

  const inputCls = 'w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-400 transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-slate-800 rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-bold">{initial ? '编辑奖品' : '新增奖品'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">奖品名称</label>
            <input className={inputCls} value={name} onChange={e => { setName(e.target.value); setError(''); }} placeholder="请输入奖品名称" />
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">奖品图片</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {PRESET_IMAGES.map(img => (
                <button
                  key={img}
                  onClick={() => setImage(img)}
                  className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    image === img ? 'border-amber-400 scale-105' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input className={inputCls} value={image} onChange={e => setImage(e.target.value)} placeholder="或粘贴图片链接" />
            {image && (
              <div className="mt-2 flex items-center gap-2">
                <img src={image} alt="预览" className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                <span className="text-xs text-slate-500">图片预览</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">图标</label>
            <div className="grid grid-cols-6 gap-2">
              {ICONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`h-10 rounded-lg flex items-center justify-center transition-all ${
                    icon === ic ? 'bg-amber-400/20 border border-amber-400 text-amber-300' : 'bg-slate-900 border border-white/10 text-slate-300 hover:border-white/30'
                  }`}
                >
                  <i className={`fa-solid ${ic}`}></i>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">颜色</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-800 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              中奖概率 <span className="text-amber-300 font-bold">{probability}</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={0} max={100} value={probability}
                onChange={e => setProbability(Number(e.target.value))}
                className="flex-1 accent-amber-400"
              />
              <input
                type="number" min={0} max={100} value={probability}
                onChange={e => setProbability(Math.min(100, Math.max(0, Number(e.target.value))))}
                className={`${inputCls} w-20 text-center`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">稀有度</label>
            <div className="grid grid-cols-4 gap-2">
              {RARITIES.map(r => (
                <button
                  key={r}
                  onClick={() => setRarity(r)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    rarity === r ? 'border-transparent text-white' : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/30'
                  }`}
                  style={rarity === r ? { backgroundColor: RARITY_COLORS[r] } : undefined}
                >
                  {RARITY_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">中奖特效</label>
            <div className="grid grid-cols-3 gap-2">
              {EFFECTS.map(ef => (
                <button
                  key={ef}
                  onClick={() => setEffect(ef)}
                  className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                    effect === ef
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                      : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/30'
                  }`}
                >
                  {EFFECT_LABELS[ef]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm bg-slate-700 hover:bg-slate-600 transition-colors">
            取消
          </button>
          <button onClick={handleSave} className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-400 to-rose-500 text-white hover:opacity-90 transition-opacity shadow-lg shadow-rose-500/25">
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
