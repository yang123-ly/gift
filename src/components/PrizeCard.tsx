import { Prize, RARITY_LABELS, RARITY_COLORS } from '../types';

interface Props {
  prize: Prize;
  revealed: boolean;
  flipping: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function PrizeCard({ prize, revealed, flipping, disabled, onClick }: Props) {
  const faceUp = revealed || flipping;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative w-full aspect-[3/4] [perspective:1000px] group focus:outline-none"
      style={{ cursor: disabled && !revealed ? 'not-allowed' : 'pointer' }}
    >
      <div
        className="absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d]"
        style={{ transform: faceUp ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <div
          className={`absolute inset-0 rounded-2xl [backface-visibility:hidden] border overflow-hidden ${
            revealed
              ? 'border-white/20'
              : 'border-pink-300/30 group-hover:border-amber-300/70 group-hover:-translate-y-1.5 group-hover:shadow-[0_10px_30px_rgba(244,114,182,0.35)]'
          } transition-all duration-300 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500`}
        >
          <div className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: 'radial-gradient(circle at 30% 20%, #fff 1.5px, transparent 1.5px), radial-gradient(circle at 70% 60%, #fff 1px, transparent 1px), radial-gradient(circle at 40% 80%, #fff 1px, transparent 1px)',
              backgroundSize: '60px 60px, 45px 45px, 75px 75px'
            }}
          />
          <div className="relative h-full flex flex-col items-center justify-center gap-2">
            <i className="fa-solid fa-gift text-4xl text-white/90 drop-shadow-lg group-hover:scale-110 transition-transform"></i>
            <span className="text-2xl font-extrabold text-amber-200 drop-shadow">?</span>
            <span className="text-[10px] tracking-[0.3em] text-white/70">神秘礼物</span>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] border border-white/20 overflow-hidden bg-slate-800"
          style={{ boxShadow: `0 0 24px ${prize.color}40` }}
        >
          <div className="h-[62%] w-full overflow-hidden" style={{ backgroundColor: `${prize.color}25` }}>
            <img src={prize.image} alt={prize.name} className="w-full h-full object-cover" />
          </div>
          <div className="px-2 pt-2 flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-white truncate max-w-full">{prize.name}</span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${RARITY_COLORS[prize.rarity]}25`, color: RARITY_COLORS[prize.rarity] }}
            >
              {RARITY_LABELS[prize.rarity]}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
