import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'lottery-wheel-drawn';

export function useDrawnPrizes() {
  const [drawnIds, setDrawnIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drawnIds));
  }, [drawnIds]);

  const markDrawn = useCallback((id: string) => {
    setDrawnIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const resetDrawn = useCallback(() => {
    setDrawnIds([]);
  }, []);

  return { drawnIds, markDrawn, resetDrawn };
}
