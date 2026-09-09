// storage.js
// Thin localStorage persistence helpers so exam progress survives a refresh.

const STORAGE_KEY = 'one-exam-state-v1';

export function saveState(state) {
  try {
    const serializable = {
      ...state,
      flagged: Array.from(state.flagged || []),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (e) {
    // Storage may be full or unavailable (private mode) — fail silently.
    // eslint-disable-next-line no-console
    console.warn('Failed to persist exam state:', e);
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      flagged: new Set(parsed.flagged || []),
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load exam state:', e);
    return null;
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}
