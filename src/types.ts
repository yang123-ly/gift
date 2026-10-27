export type EffectType = 'confetti' | 'fireworks' | 'goldRain' | 'starBurst' | 'none';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Prize {
  id: string;
  name: string;
  icon: string;
  image: string;
  color: string;
  probability: number;
  effect: EffectType;
  rarity: Rarity;
}

export const PRESET_IMAGES = [
  'https://coach.scene7.com/is/image/Coach/ch857_b4bk_a0?wid=400',
  'https://coach.scene7.com/is/image/Coach/cs246_b4b4_a0?wid=400',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80',
  'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=200&q=80',
  'https://img.jiemian.com/101/original/20260821/178729856048231300.jpg',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80',
  'https://image.lululemon.cn/public/images/b1/dc/a9/50f79cb56e2a00a2af41bb4df70b5a73f592a744.jpg?1723187720',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&q=80'
];

export const RARITY_LABELS: Record<Rarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说'
};

export const EFFECT_LABELS: Record<EffectType, string> = {
  confetti: '彩带雨',
  fireworks: '烟花绽放',
  goldRain: '金币雨',
  starBurst: '星光爆裂',
  none: '无特效'
};

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b'
};
