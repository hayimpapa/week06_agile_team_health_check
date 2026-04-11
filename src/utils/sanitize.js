import DOMPurify from 'dompurify';

/**
 * Sanitize user-provided text to prevent XSS.
 * Strips all HTML tags, returning plain text only.
 */
export function sanitizeText(dirty) {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}
