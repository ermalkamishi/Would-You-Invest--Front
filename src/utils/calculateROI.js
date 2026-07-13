/**
 * Calculates and formats the ROI percentage between entry price and current price.
 * e.g., (0.10, 1.40) => "+1300.00%"
 */
export function calculateROI(entryPrice, currentPrice) {
  if (!entryPrice || entryPrice === 0) return '0.00%';
  const roi = ((currentPrice - entryPrice) / entryPrice) * 100;
  const sign = roi >= 0 ? '+' : '';
  return `${sign}${roi.toFixed(2)}%`;
}

/**
 * Returns true if the ROI is positive.
 */
export function isPositiveROI(entryPrice, currentPrice) {
  return currentPrice >= entryPrice;
}
