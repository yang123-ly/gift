import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'lottery-wheel-tickets';

export function useTickets() {
  const [tickets, setTickets] = useState<number>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? parseInt(raw, 10) : NaN;
    return isNaN(n) ? 3 : n;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(tickets));
  }, [tickets]);

  const addTicket = useCallback((count = 1) => {
    setTickets(prev => prev + count);
  }, []);

  const consumeTicket = useCallback((): boolean => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const current = raw ? parseInt(raw, 10) : 0;
    if (current <= 0) return false;
    setTickets(prev => Math.max(0, prev - 1));
    return true;
  }, []);

  return { tickets, addTicket, consumeTicket };
}
