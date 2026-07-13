import { API_BASE } from '../../config';

export async function claimStipend(userId, token) {
  const res = await fetch(`${API_BASE}/auth/claim-stipend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to claim stipend');
  }
  return res.json();
}

export async function fetchUserProfile(userId) {
  const res = await fetch(`${API_BASE}/users/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function fetchUserPortfolio(userId) {
  const res = await fetch(`${API_BASE}/investments/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch user portfolio');
  return res.json();
}
