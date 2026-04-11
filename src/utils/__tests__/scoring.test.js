import { describe, it, expect } from 'vitest';
import { computeScores, pct, getMajority, getTrend } from '../scoring';

describe('computeScores', () => {
  it('returns empty object for empty responses', () => {
    expect(computeScores([])).toEqual({});
  });

  it('tallies votes from a single response', () => {
    const responses = [
      { votes: { 'easy-to-release': 'GREEN', speed: 'RED' } },
    ];
    const scores = computeScores(responses);
    expect(scores['easy-to-release']).toEqual({ GREEN: 1, AMBER: 0, RED: 0, total: 1 });
    expect(scores.speed).toEqual({ GREEN: 0, AMBER: 0, RED: 1, total: 1 });
  });

  it('aggregates votes across multiple responses', () => {
    const responses = [
      { votes: { fun: 'GREEN' } },
      { votes: { fun: 'GREEN' } },
      { votes: { fun: 'AMBER' } },
      { votes: { fun: 'RED' } },
    ];
    const scores = computeScores(responses);
    expect(scores.fun).toEqual({ GREEN: 2, AMBER: 1, RED: 1, total: 4 });
  });

  it('handles responses with missing votes gracefully', () => {
    const responses = [{ votes: null }, { votes: undefined }, {}];
    const scores = computeScores(responses);
    expect(scores).toEqual({});
  });

  it('ignores invalid vote values', () => {
    const responses = [{ votes: { fun: 'INVALID' } }];
    const scores = computeScores(responses);
    expect(scores.fun).toEqual({ GREEN: 0, AMBER: 0, RED: 0, total: 1 });
  });
});

describe('pct', () => {
  it('returns "0%" when total is zero', () => {
    expect(pct(0, 0)).toBe('0%');
    expect(pct(5, 0)).toBe('0%');
  });

  it('calculates correct percentage', () => {
    expect(pct(1, 4)).toBe('25%');
    expect(pct(3, 4)).toBe('75%');
    expect(pct(4, 4)).toBe('100%');
  });

  it('rounds to nearest integer', () => {
    expect(pct(1, 3)).toBe('33%');
    expect(pct(2, 3)).toBe('67%');
  });
});

describe('getMajority', () => {
  it('returns GREEN when no scores exist for cardId', () => {
    expect(getMajority({}, 'missing')).toBe('GREEN');
  });

  it('returns the color with the most votes', () => {
    const scores = {
      card1: { GREEN: 5, AMBER: 2, RED: 1 },
      card2: { GREEN: 1, AMBER: 5, RED: 2 },
      card3: { GREEN: 1, AMBER: 2, RED: 5 },
    };
    expect(getMajority(scores, 'card1')).toBe('GREEN');
    expect(getMajority(scores, 'card2')).toBe('AMBER');
    expect(getMajority(scores, 'card3')).toBe('RED');
  });

  it('ties favor GREEN over AMBER over RED', () => {
    const scores = {
      tied: { GREEN: 3, AMBER: 3, RED: 3 },
    };
    expect(getMajority(scores, 'tied')).toBe('GREEN');

    const amberRedTie = {
      tied2: { GREEN: 1, AMBER: 3, RED: 3 },
    };
    expect(getMajority(amberRedTie, 'tied2')).toBe('AMBER');
  });
});

describe('getTrend', () => {
  it('returns null when previous scores are missing', () => {
    const scores = { card1: { GREEN: 3, AMBER: 1, RED: 0, total: 4 } };
    expect(getTrend(scores, null, 'card1', 4)).toBeNull();
    expect(getTrend(scores, {}, 'card1', 4)).toBeNull();
  });

  it('returns null when card is missing from current scores', () => {
    const prev = { card1: { GREEN: 2, AMBER: 1, RED: 1, total: 4 } };
    expect(getTrend({}, prev, 'card1', 4)).toBeNull();
  });

  it('returns ↑ when green ratio increased by more than 5%', () => {
    const prev = { card1: { GREEN: 2, AMBER: 1, RED: 1, total: 4 } }; // 50%
    const curr = { card1: { GREEN: 4, AMBER: 0, RED: 0, total: 4 } }; // 100%
    expect(getTrend(curr, prev, 'card1', 4)).toBe('↑');
  });

  it('returns ↓ when green ratio decreased by more than 5%', () => {
    const prev = { card1: { GREEN: 4, AMBER: 0, RED: 0, total: 4 } }; // 100%
    const curr = { card1: { GREEN: 1, AMBER: 1, RED: 2, total: 4 } }; // 25%
    expect(getTrend(curr, prev, 'card1', 4)).toBe('↓');
  });

  it('returns → when green ratio is within 5% threshold', () => {
    const prev = { card1: { GREEN: 2, AMBER: 1, RED: 1, total: 4 } }; // 50%
    const curr = { card1: { GREEN: 2, AMBER: 1, RED: 1, total: 4 } }; // 50%
    expect(getTrend(curr, prev, 'card1', 4)).toBe('→');
  });
});
