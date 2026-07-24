import { useEffect, useState } from 'react';

/**
 * Returns the current Date, refreshed every `intervalMs`.
 * Replaces the old `setInterval(atualizarDataHora, 60000)` + direct DOM writes.
 */
export function useClock(intervalMs = 60000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

export function formatDataHora(date) {
  const dia = date.toLocaleDateString('pt-BR');
  const hora = date.toLocaleTimeString('pt-BR').slice(0, 5);
  return `📅 ${dia} ${hora}`;
}
