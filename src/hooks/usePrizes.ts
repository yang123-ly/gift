import { useState, useEffect, useCallback } from 'react';
import { Prize } from '../types';

const STORAGE_KEY = 'lottery-wheel-prizes-v3';

const DEFAULT_PRIZES: Prize[] = [
  { id: 'p1', name: '蔻驰流浪包', icon: 'fa-bag-shopping', image: 'https://coach.scene7.com/is/image/Coach/ch857_b4bk_a0?wid=400', color: '#f43f5e', probability: 8, effect: 'fireworks', rarity: 'legendary' },
  { id: 'p2', name: '蔻驰挂链', icon: 'fa-link', image: 'https://coach.scene7.com/is/image/Coach/cs246_b4b4_a0?wid=400', color: '#eab308', probability: 10, effect: 'starBurst', rarity: 'epic' },
  { id: 'p3', name: '蔻驰内搭', icon: 'fa-shirt', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80', color: '#3b82f6', probability: 10, effect: 'confetti', rarity: 'epic' },
  { id: 'p4', name: '发发发彩票礼包', icon: 'fa-ticket', image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=200&q=80', color: '#f59e0b', probability: 10, effect: 'goldRain', rarity: 'rare' },
  { id: 'p5', name: '星星人农场盲盒', icon: 'fa-box-open', image: 'https://img.jiemian.com/101/original/20260821/178729856048231300.jpg', color: '#a855f7', probability: 8, effect: 'confetti', rarity: 'rare' },
  { id: 'p6', name: '星星人挂件外壳', icon: 'fa-star', image: 'https://img.jiemian.com/101/original/vcg/20220825/1661435138910_a700x398.jpg', color: '#06b6d4', probability: 8, effect: 'starBurst', rarity: 'common' },
  { id: 'p7', name: 'yoyo酱手表支架', icon: 'fa-clock', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80', color: '#ec4899', probability: 8, effect: 'confetti', rarity: 'common' },
  { id: 'p8', name: '露露拉蒙外套', icon: 'fa-vest-patches', image: 'https://image.lululemon.cn/public/images/b1/dc/a9/50f79cb56e2a00a2af41bb4df70b5a73f592a744.jpg?1723187720', color: '#10b981', probability: 8, effect: 'fireworks', rarity: 'rare' },
  { id: 'p9', name: '谢谢参与', icon: 'fa-face-smile', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&q=80', color: '#64748b', probability: 30, effect: 'none', rarity: 'common' }
];

function loadPrizes(): Prize[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p: Prize, i: number) => ({
          ...p,
          image: p.image || DEFAULT_PRIZES[i % DEFAULT_PRIZES.length].image
        }));
      }
    }
  } catch (e) {}
  return DEFAULT_PRIZES;
}

export function usePrizes() {
  const [prizes, setPrizes] = useState<Prize[]>(loadPrizes);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prizes));
  }, [prizes]);

  const addPrize = useCallback((prize: Omit<Prize, 'id'>) => {
    setPrizes(prev => [...prev, { ...prize, id: `p${Date.now()}` }]);
  }, []);

  const updatePrize = useCallback((id: string, patch: Partial<Prize>) => {
    setPrizes(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const removePrize = useCallback((id: string) => {
    setPrizes(prev => prev.filter(p => p.id !== id));
  }, []);

  const resetPrizes = useCallback(() => {
    setPrizes(DEFAULT_PRIZES);
  }, []);

  const movePrize = useCallback((id: string, direction: number) => {
    setPrizes(prev => {
      const index = prev.findIndex(p => p.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  return { prizes, addPrize, updatePrize, removePrize, resetPrizes, movePrize };
}

export function pickWeightedPrize(prizes: Prize[]): number {
  const total = prizes.reduce((s, p) => s + p.probability, 0);
  let r = Math.random() * total;
  for (let i = 0; i < prizes.length; i++) {
    r -= prizes[i].probability;
    if (r <= 0) return i;
  }
  return prizes.length - 1;
}
