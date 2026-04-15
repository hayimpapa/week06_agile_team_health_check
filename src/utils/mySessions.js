// Local-only record of sessions the admin has created on this browser.
// Stored in localStorage so returning admins can find their sessions without
// having to keep the share URL or PIN around.
//
// Shape: [{ id, name, pin, createdAt }, ...]

const STORAGE_KEY = 'squadhc:my-sessions';
const MAX_ENTRIES = 50;

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // localStorage disabled (private mode) or corrupt JSON — start fresh.
    return [];
  }
}

function writeAll(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage full or disabled — silently drop; this is a convenience cache.
  }
}

export function getMySessions() {
  return readAll().sort((a, b) => {
    const ta = new Date(a.createdAt).getTime() || 0;
    const tb = new Date(b.createdAt).getTime() || 0;
    return tb - ta;
  });
}

export function saveMySession({ id, name, pin, createdAt }) {
  if (!id) return;
  const others = readAll().filter((s) => s.id !== id);
  const next = [
    { id, name, pin, createdAt: createdAt || new Date().toISOString() },
    ...others,
  ].slice(0, MAX_ENTRIES);
  writeAll(next);
}

export function removeMySession(id) {
  writeAll(readAll().filter((s) => s.id !== id));
}
