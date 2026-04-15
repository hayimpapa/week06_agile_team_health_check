import { describe, it, expect, beforeEach } from 'vitest';
import { getMySessions, saveMySession, removeMySession } from '../mySessions';

describe('mySessions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty list when nothing has been saved', () => {
    expect(getMySessions()).toEqual([]);
  });

  it('saves and retrieves a session', () => {
    saveMySession({ id: 'a', name: 'Sprint 1', pin: '1234', createdAt: '2026-01-01T00:00:00Z' });
    expect(getMySessions()).toEqual([
      { id: 'a', name: 'Sprint 1', pin: '1234', createdAt: '2026-01-01T00:00:00Z' },
    ]);
  });

  it('sorts newest first', () => {
    saveMySession({ id: 'a', name: 'Older', pin: '1111', createdAt: '2026-01-01T00:00:00Z' });
    saveMySession({ id: 'b', name: 'Newer', pin: '2222', createdAt: '2026-02-01T00:00:00Z' });
    expect(getMySessions().map((s) => s.id)).toEqual(['b', 'a']);
  });

  it('dedupes by id (re-saving replaces the entry)', () => {
    saveMySession({ id: 'a', name: 'First', pin: '1111', createdAt: '2026-01-01T00:00:00Z' });
    saveMySession({ id: 'a', name: 'Updated', pin: '2222', createdAt: '2026-02-01T00:00:00Z' });
    const list = getMySessions();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Updated');
    expect(list[0].pin).toBe('2222');
  });

  it('removes a session by id', () => {
    saveMySession({ id: 'a', name: 'A', pin: '1111', createdAt: '2026-01-01T00:00:00Z' });
    saveMySession({ id: 'b', name: 'B', pin: '2222', createdAt: '2026-02-01T00:00:00Z' });
    removeMySession('a');
    const list = getMySessions();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('b');
  });

  it('defaults createdAt when not supplied', () => {
    saveMySession({ id: 'a', name: 'A', pin: '1111' });
    const [s] = getMySessions();
    expect(typeof s.createdAt).toBe('string');
    expect(Number.isNaN(new Date(s.createdAt).getTime())).toBe(false);
  });

  it('ignores calls with no id', () => {
    saveMySession({ name: 'ghost', pin: '0000' });
    expect(getMySessions()).toEqual([]);
  });

  it('returns [] when stored data is not valid JSON', () => {
    localStorage.setItem('squadhc:my-sessions', 'not-json');
    expect(getMySessions()).toEqual([]);
  });
});
