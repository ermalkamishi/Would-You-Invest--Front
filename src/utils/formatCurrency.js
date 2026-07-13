/**
 * Formats a number as a dollar currency string.
 * e.g., 10000 => "$10,000"
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a price with up to 4 decimal places for share prices.
 * e.g., 0.12 => "$0.12"
 */
export function formatSharePrice(price) {
  if (price === null || price === undefined) return '$0.00';
  return `$${Number(price).toFixed(4).replace(/\.?0+$/, '')}`;
}
