import { describe, it, expect } from 'vitest';
import { defaultCards } from '../../defaultCards';

describe('defaultCards', () => {
  it('contains exactly 10 cards', () => {
    expect(defaultCards).toHaveLength(10);
  });

  it('every card has required fields', () => {
    for (const card of defaultCards) {
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('title');
      expect(card).toHaveProperty('awesome');
      expect(card).toHaveProperty('crappy');
      expect(typeof card.id).toBe('string');
      expect(typeof card.title).toBe('string');
      expect(card.id.length).toBeGreaterThan(0);
      expect(card.title.length).toBeGreaterThan(0);
      expect(card.awesome.length).toBeGreaterThan(0);
      expect(card.crappy.length).toBeGreaterThan(0);
    }
  });

  it('has unique IDs', () => {
    const ids = defaultCards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes all expected Spotify health check dimensions', () => {
    const titles = defaultCards.map((c) => c.title);
    const expected = [
      'Easy to Release',
      'Suitable Process',
      'Tech Quality',
      'Value',
      'Speed',
      'Mission',
      'Fun',
      'Learning',
      'Support',
      'Autonomy',
    ];
    for (const t of expected) {
      expect(titles).toContain(t);
    }
  });
});
