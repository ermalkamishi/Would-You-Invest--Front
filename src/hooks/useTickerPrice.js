import { useEffect, useState, useRef } from 'react';

/**
 * Simulates a live-ticking share price for a startup with micro-fluctuations.
 * Returns both the current price and a direction string ('up', 'down', 'neutral')
 * to trigger flash animations in the UI.
 * 
 * @param {number} basePrice - The current real price from the backend.
 * @param {number} tickInterval - How often to tick in ms (default 3s).
 */
export function useTickerPrice(basePrice, tickInterval = 3000) {
  const [displayPrice, setDisplayPrice] = useState(basePrice);
  const [direction, setDirection] = useState('neutral');
  const prevPriceRef = useRef(basePrice);

  // If basePrice changes from backend, force update and trigger flash
  useEffect(() => {
    if (basePrice !== prevPriceRef.current) {
      setDirection(basePrice > prevPriceRef.current ? 'up' : 'down');
      setDisplayPrice(basePrice);
      prevPriceRef.current = basePrice;

      const timeout = setTimeout(() => setDirection('neutral'), 1000);
      return () => clearTimeout(timeout);
    }
  }, [basePrice]);

  useEffect(() => {
    const timer = setInterval(() => {
      // Tiny random fluctuation: +/- 0.01%
      const pct = (Math.random() - 0.5) * 0.0002; // max +/- 0.01%
      const fluctuation = pct * basePrice;

      setDisplayPrice((prev) => {
        const next = parseFloat(Math.max(0.01, prev + fluctuation).toFixed(4));
        if (next > prev) {
          setDirection('up');
        } else if (next < prev) {
          setDirection('down');
        } else {
          setDirection('neutral');
        }
        prevPriceRef.current = next;
        return next;
      });

      // Clear flash class after animation duration
      setTimeout(() => setDirection('neutral'), 1000);
    }, tickInterval);

    return () => clearInterval(timer);
  }, [basePrice, tickInterval]);

  return { price: displayPrice, direction };
}
