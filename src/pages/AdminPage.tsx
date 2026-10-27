import { useState } from 'react';
import { Prize, RARITY_LABELS, EFFECT_LABELS, RARITY_COLORS } from '../types';
import PrizeForm from '../components/PrizeForm';
import PasswordGate from '../components/PasswordGate';

interface PrizeStore {
  prizes: Prize[];
  addPrize: (p: Omit<Prize, 'id'>) => void;
  updatePrize: (id: string, patch: Partial<Prize>) => void;
  removePrize: (id: string) => void;
  resetPrizes: () => void;
  movePrize: (id: string, direction: number) => void;
}

export default function AdminPage({ prizeStore }: { prizeStore: PrizeStore }) {
  const { prizes, addPrize, updatePrize, removePrize, resetPrizes, movePrize } = prizeStore;
  const [editing, setEditing] = useState<Prize | null>(null);
  const [showForm, setShowForm] = useState(false);

  const totalProb = prizes.reduce((s, p) => s + p.probability, 0);
  const legendaryCount = prizes.filter(p => p.rarity === 'legendary').length;
  const topPrize = prizes.reduce<Prize | null>((best, p) => (!best || p.probability > best.probability ? p : best), null);

  const openAdd = () => { setEditing(null); setShowForm(true); };
  const openEdit = (p: Prize) => { setEditing(p); setShowForm(true); };

  const handleSave = (data: Omit<Prize, 'id'>) => {
    if (editing) updatePrize(editing.id, data);
    else addPrize(data);
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (p: Prize) => {
    if (window.confirm(`确定删除奖品「${p.name}」吗？`)) removePrize(p.id);
  };

  const handleReset = () => {
    if (window.confirm('确定恢复默认奖品配置吗？当前修改将丢失。')) resetPrizes();
  };

  const adjustProb = (p: Prize, delta: number) => {
    const next = Math.max(0, Math.min(100, p.probability + delta));
    updatePrize(p.id, { probability: next });
  };

  const stats = [
    { label: '奖品总数', value: prizes.length, icon: 'fa-gift', grad: 'from-rose-400 to-pink-600' },
    { label: '总概率', value: `${totalProb}%`, icon: 'fa-percent', grad: 'from-sky-400 to-blue-600' },
    { label: '传说奖品', value: legendaryCount, icon: 'fa-crown', grad: 'from-amber-400 to-orange-600' },
    { label: '最高概率', value: topPrize ? topPrize.name : '-', icon: 'fa-arrow-trend-up', grad: 'from-emerald-400 to-teal-600' }
  ];

  return (
    <PasswordGate>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">转盘管理</h2>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 transition-all"
          >
            <i className="fa-solid fa-rotate-left mr-1.5"></i>恢复默认
          </button>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-400 to-rose-500 hover:opacity-90 shadow-lg shadow-rose-500/25 transition-all"
          >
            <i className="fa-solid fa-plus mr-1.5"></i>新增奖品
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-all">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.grad} flex items-center justify-center mb-3`}>
              <i className={`fa-solid ${s.icon} text-white text-sm`}></i>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent truncate">
              {s.value}
            </div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">
          <i className="fa-solid fa-chart-simple mr-2 text-sky-400"></i>概率分布
        </h3>
        {totalProb !== 100 && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-xs">
            <i className="fa-solid fa-triangle-exclamation mr-1.5"></i>
            当前总概率为 {totalProb}%，不等于 100%。抽奖时将按各奖品权重自动归一化计算。
          </div>
        )}
        <div className="space-y-2.5">
          {prizes.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="w-24 text-xs text-slate-300 truncate">{p.name}</span>
              <div className="flex-1 h-4 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalProb > 0 ? (p.probability / totalProb) * 100 : 0}%`,
                    background: `linear-gradient(90deg, ${p.color}, ${p.color}bb)`
                  }}
                />
              </div>
              <span className="w-14 text-right text-xs text-slate-400">{p.probability}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 font-medium">奖品</th>
              <th className="px-4 py-3 font-medium">稀有度</th>
              <th className="px-4 py-3 font-medium">概率</th>
              <th className="px-4 py-3 font-medium">中奖特效</th>
              <th className="px-4 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {prizes.map((p, idx) => (
              <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover ring-1 ring-white/20" />
                    <span className="font-medium">{p.name}</span>
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: p.color }}></span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${RARITY_COLORS[p.rarity]}25`, color: RARITY_COLORS[p.rarity] }}
                  >
                    {RARITY_LABELS[p.rarity]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => adjustProb(p, -1)}
                      className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-xs transition-all"
                    >
                      <i className="fa-solid fa-minus"></i>
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={p.probability}
                      onChange={e => updatePrize(p.id, { probability: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                      className="w-14 px-1.5 py-1 rounded bg-white/10 border border-white/10 text-center text-xs focus:outline-none focus:border-amber-400/50"
                    />
                    <button
                      onClick={() => adjustProb(p, 1)}
                      className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-xs transition-all"
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300 text-xs">{EFFECT_LABELS[p.effect]}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => movePrize(p.id, -1)}
                      disabled={idx === 0}
                      className="w-7 h-7 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <i className="fa-solid fa-arrow-up text-xs"></i>
                    </button>
                    <button
                      onClick={() => movePrize(p.id, 1)}
                      disabled={idx === prizes.length - 1}
                      className="w-7 h-7 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <i className="fa-solid fa-arrow-down text-xs"></i>
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 hover:bg-sky-500/30 transition-all"
                    >
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/30 transition-all"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {prizes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500 text-sm">
                  暂无奖品，点击右上角「新增奖品」开始配置
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <PrizeForm initial={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
    </PasswordGate>
  );
}
