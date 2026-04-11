import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getToken, hasSubmitted, markSubmitted } from '../respondent';

describe('respondent utilities', () => {
  let store;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', {
      getItem: (key) => store[key] ?? null,
      setItem: (key, val) => { store[key] = String(val); },
      removeItem: (key) => { delete store[key]; },
    });
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-1234',
    });
  });

  describe('getToken', () => {
    it('creates and stores a new token for a session', () => {
      const token = getToken('session-1');
      expect(token).toBe('test-uuid-1234');
      expect(store['shc_token_session-1']).toBe('test-uuid-1234');
    });

    it('returns the existing token if already stored', () => {
      store['shc_token_session-2'] = 'existing-token';
      const token = getToken('session-2');
      expect(token).toBe('existing-token');
    });
  });

  describe('hasSubmitted', () => {
    it('returns false when nothing is stored', () => {
      expect(hasSubmitted('session-1')).toBe(false);
    });

    it('returns true when submission flag is set', () => {
      store['shc_submitted_session-1'] = 'true';
      expect(hasSubmitted('session-1')).toBe(true);
    });

    it('returns false for other values', () => {
      store['shc_submitted_session-1'] = 'false';
      expect(hasSubmitted('session-1')).toBe(false);
    });
  });

  describe('markSubmitted', () => {
    it('sets the submission flag to true', () => {
      markSubmitted('session-1');
      expect(store['shc_submitted_session-1']).toBe('true');
    });
  });
});
