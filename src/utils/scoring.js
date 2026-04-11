/**
 * Compute vote scores from an array of response objects.
 * Each response has a `votes` object: { cardId: 'GREEN' | 'AMBER' | 'RED' }
 *
 * Returns: { [cardId]: { GREEN: n, AMBER: n, RED: n, total: n } }
 */
export function computeScores(responses) {
  const scores = {};
  for (const r of responses) {
    for (const [cardId, vote] of Object.entries(r.votes || {})) {
      if (!scores[cardId]) scores[cardId] = { GREEN: 0, AMBER: 0, RED: 0, total: 0 };
      if (scores[cardId][vote] !== undefined) scores[cardId][vote]++;
      scores[cardId].total++;
    }
  }
  return scores;
}

/**
 * Format a count as a percentage string.
 */
export function pct(count, total) {
  if (total === 0) return '0%';
  return `${Math.round((count / total) * 100)}%`;
}

/**
 * Determine the majority vote for a card.
 */
export function getMajority(scores, cardId) {
  const s = scores[cardId];
  if (!s) return 'GREEN';
  if (s.GREEN >= s.AMBER && s.GREEN >= s.RED) return 'GREEN';
  if (s.AMBER >= s.GREEN && s.AMBER >= s.RED) return 'AMBER';
  return 'RED';
}

/**
 * Get trend arrow comparing current scores to previous scores.
 * Returns '↑', '↓', '→', or null.
 */
export function getTrend(scores, prevScores, cardId, totalResponses) {
  if (!prevScores || !prevScores[cardId] || !scores[cardId]) return null;
  const curr = scores[cardId].GREEN / Math.max(totalResponses, 1);
  const prev = prevScores[cardId].GREEN / Math.max(prevScores[cardId].total, 1);
  if (curr > prev + 0.05) return '↑';
  if (curr < prev - 0.05) return '↓';
  return '→';
}
