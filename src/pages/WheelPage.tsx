import { useState, CSSProperties } from 'react';
import { Prize, EffectType, RARITY_LABELS, RARITY_COLORS } from '../types';
import { pickWeightedPrize } from '../hooks/usePrizes';
import { useDrawnPrizes } from '../hooks/useDrawnPrizes';
import EffectsCanvas from '../components/EffectsCanvas';
import TicketModal from '../components/TicketModal';
import CountdownGate from '../components/CountdownGate';
import PrizeCard from '../components/PrizeCard';

interface Props {
  prizeStore: {
    prizes: Prize[];
    addPrize: (p: Omit<Prize, 'id'>) => void;
    updatePrize: (id: string, patch: Partial<Prize>) => void;
    removePrize: (id: string) => void;
    resetPrizes: () => void;
  };
  ticketStore: {
    tickets: number;
    addTicket: (count?: number) => void;
    consumeTicket: () => boolean;
  };
}

interface HistoryItem {
  prize: Prize;
  time: string;
}

export default function WheelPage({ prizeStore, ticketStore }: Props) {
  const { prizes } = prizeStore;
  const { tickets, addTicket, consumeTicket } = ticketStore;
  const { drawnIds, markDrawn, resetDrawn } = useDrawnPrizes();
  const [flippingId, setFlippingId] = useState<string | null>(null);
  const [flipPrize, setFlipPrize] = useState<Prize | null>(null);
  const [winner, setWinner] = useState<Prize | null>(null);
  const [effect, setEffect] = useState<EffectType | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [drawing, setDrawing] = useState(false);

  const isAlwaysVisible = (p: Prize) => p.name.includes('谢谢参与');
  const available = prizes.filter(p => !drawnIds.includes(p.id) || isAlwaysVisible(p));
  const allDrawn = prizes.length > 0 && available.length === 0;

  const drawCard = (clickedId: string) => {
    if (drawing || allDrawn) return;
    if (tickets <= 0) {
      setShowTicketModal(true);
      return;
    }
    consumeTicket();
    setDrawing(true);
    setWinner(null);
    const pickIdx = pickWeightedPrize(available);
    const picked = available[pickIdx];
    setFlippingId(clickedId);
    setFlipPrize(picked);
    window.setTimeout(() => {
      setWinner(picked);
      markDrawn(picked.id);
      setEffect(picked.effect === 'none' ? null : picked.effect);
      setHistory(prev =>
        [{ prize: picked, time: new Date().toLocaleTimeString('zh-CN', { hour12: false }) }, ...prev].slice(0, 10)
      );
      setDrawing(false);
    }, 900);
  };

  const cardPrize = (p: Prize) => {
    if (flippingId === p.id && flipPrize) return flipPrize;
    return p;
  };

  return (
    <CountdownGate>
    <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
      <div className="flex flex-col items-center">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-pink-300 via-amber-200 to-pink-300 bg-clip-text text-transparent">
            <i className="fa-solid fa-cake-candles text-pink-300 mr-2"></i>
            生日快乐 · 幸运礼物抽卡
            <i className="fa-solid fa-cake-candles text-pink-300 ml-2"></i>
          </h2>
          <p className="text-sm text-rose-200/70 mt-1.5">
            <i className="fa-solid fa-heart text-rose-300 mr-1.5"></i>
            选一张卡片翻开，揭晓属于你的神秘礼物（每份礼物只能抽中一次）
          </p>
        </div>

        <div className="w-full max-w-2xl rounded-3xl bg-white/5 border border-white/10 backdrop-blur p-6">
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
            {prizes.map(p => {
              const revealed = drawnIds.includes(p.id) || isAlwaysVisible(p);
              return (
                <PrizeCard
                  key={p.id}
                  prize={cardPrize(p)}
                  revealed={revealed}
                  flipping={flippingId === p.id && !revealed}
                  disabled={drawing || allDrawn || revealed}
                  onClick={() => drawCard(p.id)}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 flex-wrap justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <i className="fa-solid fa-ticket text-amber-400"></i>
            <span className="text-sm text-slate-300">抽奖券</span>
            <span className={`text-lg font-extrabold ${tickets > 0 ? 'text-amber-300' : 'text-rose-400'}`}>{tickets}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <i className="fa-solid fa-gift text-pink-400"></i>
            <span className="text-sm text-slate-300">剩余礼物</span>
            <span className="text-lg font-extrabold text-pink-300">{available.filter(p => !isAlwaysVisible(p)).length}</span>
          </div>
          <button
            onClick={() => setShowTicketModal(true)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-sky-500 to-indigo-500 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-indigo-500/25"
          >
            <i className="fa-solid fa-plus mr-1.5"></i>获取抽奖券
          </button>
        </div>
        <p className="mt-3 text-slate-400 text-sm text-center">
          <i className="fa-solid fa-wand-magic-sparkles text-amber-400 mr-2"></i>
          {allDrawn
            ? '所有礼物都已揭晓！'
            : tickets > 0
            ? '点击任意背面朝上的卡片翻开，每次消耗 1 张抽奖券'
            : '抽奖券不足，上传图片、拍照或玩小游戏获取'}
        </p>
        {allDrawn && (
          <button
            onClick={() => {
              if (window.confirm('确定重置所有礼物吗？重置后礼物将重新变为未知状态。')) resetDrawn();
            }}
            className="mt-3 px-4 py-2 rounded-full text-sm bg-white/10 hover:bg-white/20 transition-all"
          >
            <i className="fa-solid fa-rotate-left mr-1.5"></i>重置礼物
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur">
          <h3 className="font-bold mb-3 text-amber-300">
            <i className="fa-solid fa-gift mr-2"></i>礼物墙
            <span className="ml-2 text-xs font-normal text-slate-400">
              已揭晓 {drawnIds.length}/{prizes.length}
            </span>
          </h3>
          <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {prizes.map(p => {
              const revealed = drawnIds.includes(p.id) || isAlwaysVisible(p);
              return (
                <li
                  key={p.id}
                  className={`flex items-center gap-3 text-sm rounded-lg px-3 py-2 transition-colors ${
                    revealed ? 'bg-white/5 hover:bg-white/10' : 'bg-violet-500/10 border border-violet-400/20'
                  }`}
                >
                  {revealed ? (
                    <>
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-8 h-8 rounded-full object-cover ring-2"
                        style={{ '--tw-ring-color': `${p.color}66` } as CSSProperties}
                      />
                      <span className="flex-1 truncate">{p.name}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${RARITY_COLORS[p.rarity]}25`, color: RARITY_COLORS[p.rarity] }}
                      >
                        {RARITY_LABELS[p.rarity]}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold">
                        ?
                      </span>
                      <span className="flex-1 truncate text-violet-200">神秘礼物</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-400/15 text-violet-300">未揭晓</span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur">
          <h3 className="font-bold mb-3 text-amber-300">
            <i className="fa-solid fa-clock-rotate-left mr-2"></i>抽奖记录
          </h3>
          {history.length === 0 ? (
            <p className="text-slate-500 text-sm">暂无记录，快去抽卡吧</p>
          ) : (
            <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {history.map((h, i) => (
                <li key={i} className="flex items-center gap-3 text-sm bg-white/5 rounded-lg px-3 py-2">
                  <img src={h.prize.image} alt={h.prize.name} className="w-7 h-7 rounded-full object-cover" />
                  <span className="flex-1 truncate">{h.prize.name}</span>
                  <span className="text-slate-500 text-xs">{h.time}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setWinner(null)}>
          <div
            className="relative rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-amber-400/40 p-10 text-center shadow-[0_0_60px_rgba(245,158,11,0.35)] animate-[popIn_0.4s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            <div
              className="relative w-28 h-28 mx-auto rounded-full mb-5 overflow-hidden ring-4"
              style={{ backgroundColor: `${winner.color}30`, boxShadow: `0 0 40px ${winner.color}60`, '--tw-ring-color': winner.color } as CSSProperties}
            >
              <img src={winner.image} alt={winner.name} className="w-full h-full object-cover" />
              <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-slate-900/80 flex items-center justify-center">
                <i className={`fa-solid ${winner.icon} text-xs`} style={{ color: winner.color }}></i>
              </span>
            </div>
            <p className="text-amber-300 text-sm mb-2 tracking-widest">神秘礼物揭晓</p>
            <h2 className="text-3xl font-extrabold mb-3">{winner.name}</h2>
            <span
              className="inline-block text-xs px-3 py-1 rounded-full font-bold mb-6"
              style={{ backgroundColor: `${RARITY_COLORS[winner.rarity]}25`, color: RARITY_COLORS[winner.rarity] }}
            >
              {RARITY_LABELS[winner.rarity]}
            </span>
            <div>
              <button
                onClick={() => setWinner(null)}
                className="px-8 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-rose-500/30"
              >
                开心收下
              </button>
            </div>
          </div>
        </div>
      )}

      <EffectsCanvas effect={effect} onDone={() => setEffect(null)} />
      {showTicketModal && (
        <TicketModal tickets={tickets} onEarn={() => addTicket(1)} onClose={() => setShowTicketModal(false)} />
      )}
      <style>{`@keyframes popIn { 0% { transform: scale(0.7); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }`}</style>
    </div>
    </CountdownGate>
  );
}
