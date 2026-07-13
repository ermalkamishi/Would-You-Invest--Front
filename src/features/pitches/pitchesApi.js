import { API_BASE } from '../../config';

/**
 * Fetches all pitches from the backend.
 */
export async function fetchPitches(sortBy = 'hot') {
  const res = await fetch(`${API_BASE}/startups?sort=${sortBy}`);
  if (!res.ok) throw new Error('Failed to fetch pitches');
  return res.json();
}

/**
 * Fetches a single pitch by ID.
 */
export async function fetchPitchById(id) {
  const res = await fetch(`${API_BASE}/startups/${id}`);
  if (!res.ok) throw new Error('Failed to fetch pitch');
  return res.json();
}

/**
 * Creates a new pitch (founder action).
 */
export async function createPitch(pitchData, token) {
  const res = await fetch(`${API_BASE}/startups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(pitchData),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Failed to create pitch');
  }
  return res.json();
}

/**
 * Invest virtual money into a pitch.
 */
export async function investInPitch(startupId, amount, userId, token) {
  const res = await fetch(`${API_BASE}/startups/${startupId}/invest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount, userId }),
  });
  if (!res.ok) throw new Error('Failed to invest');
  return res.json();
}

/**
 * Submit a pass reason for a pitch.
 */
export async function submitPassReason(startupId, reason, token) {
  const res = await fetch(`${API_BASE}/startups/${startupId}/pass`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Failed to submit pass reason');
  return res.json();
}

/**
 * Adds a comment to a pitch.
 */
export async function addCommentToPitch(startupId, text, token) {
  const res = await fetch(`${API_BASE}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ startupId, text }),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || 'Failed to post comment');
  }
  return res.json();
}

/**
 * Upvotes a comment.
 */
export async function upvoteCommentApi(commentId, token) {
  const res = await fetch(`${API_BASE}/comments/${commentId}/upvote`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to upvote comment');
  return res.json();
}

