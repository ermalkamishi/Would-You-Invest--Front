import { API_BASE } from '../../config';

/**
 * Fetch all bets for a user (and trigger real-time resolution on the backend).
 */
export async function fetchUserBets(userId) {
  const res = await fetch(`${API_BASE}/bets/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch user bets');
  return res.json();
}

/**
 * Place a new milestone bet.
 */
export async function placeBet(userId, startupId, milestoneType, targetValue, prediction, betAmount, token) {
  const res = await fetch(`${API_BASE}/bets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId,
      startupId,
      milestoneType,
      targetValue,
      prediction,
      betAmount,
    }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    let parsedMessage = 'Failed to place bet';
    try {
      const parsed = JSON.parse(errorText);
      parsedMessage = parsed.message || parsedMessage;
    } catch {}
    throw new Error(parsedMessage);
  }
  return res.json();
}
