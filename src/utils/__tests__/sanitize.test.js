import { describe, it, expect } from 'vitest';
import { sanitizeText } from '../sanitize';

describe('sanitizeText', () => {
  it('returns empty string for falsy input', () => {
    expect(sanitizeText('')).toBe('');
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
  });

  it('passes through plain text unchanged', () => {
    expect(sanitizeText('Hello world')).toBe('Hello world');
    expect(sanitizeText('Great job team!')).toBe('Great job team!');
  });

  it('strips HTML tags', () => {
    expect(sanitizeText('<b>bold</b>')).toBe('bold');
    expect(sanitizeText('<script>alert("xss")</script>')).toBe('');
    expect(sanitizeText('<img src=x onerror=alert(1)>')).toBe('');
  });

  it('strips nested/complex HTML', () => {
    expect(sanitizeText('<div><p>nested <strong>text</strong></p></div>')).toBe('nested text');
  });

  it('handles HTML entities in text', () => {
    const result = sanitizeText('Tom &amp; Jerry');
    expect(result).toBe('Tom &amp; Jerry');
  });

  it('strips event handlers from tags', () => {
    expect(sanitizeText('<a href="#" onclick="alert(1)">click</a>')).toBe('click');
  });
});
