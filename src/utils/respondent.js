/**
 * Manages respondent tokens and submission state via localStorage.
 */

export function getToken(sessionId) {
  const key = `shc_token_${sessionId}`;
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

export function hasSubmitted(sessionId) {
  return localStorage.getItem(`shc_submitted_${sessionId}`) === 'true';
}

export function markSubmitted(sessionId) {
  localStorage.setItem(`shc_submitted_${sessionId}`, 'true');
}
