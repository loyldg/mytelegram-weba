import { IS_SCREEN_LOCKED_CACHE_KEY } from '../../config';

const SESSION_STORE_CHANGED_EVENT = 'tt-session-store-changed';

const encryptedValues = new Map<string, string>();
const dirtyKeys = new Set<string>();

let isEncrypted = false;
let isHydrated = false;

export function readSessionValue(key: string) {
  if (isEncrypted) return encryptedValues.get(key);
  return localStorage.getItem(key) ?? undefined;
}

export function writeSessionValue(key: string, value: string) {
  if (isEncrypted) {
    encryptedValues.set(key, value);
    dirtyKeys.add(key);
    notifySessionStoreChanged();
    return;
  }

  localStorage.setItem(key, value);
}

export function removeSessionValue(key: string) {
  if (isEncrypted) {
    encryptedValues.delete(key);
    dirtyKeys.add(key);
    notifySessionStoreChanged();
    return;
  }

  localStorage.removeItem(key);
}

export function collectSessionValues(keys: string[]) {
  const snapshot: Record<string, string> = {};
  keys.forEach((key) => {
    const value = readSessionValue(key);
    if (value !== undefined) snapshot[key] = value;
  });
  return snapshot;
}

export function getSessionValueKeys() {
  return isEncrypted ? Array.from(encryptedValues.keys()) : Object.keys(localStorage);
}

export function enableEncryptedSessionStore(snapshot: Record<string, string> = {}) {
  replaceEncryptedSessionStore(snapshot);
}

export function replaceEncryptedSessionStore(snapshot: Record<string, string>) {
  isEncrypted = true;
  encryptedValues.clear();
  Object.entries(snapshot).forEach(([key, value]) => encryptedValues.set(key, value));
  dirtyKeys.clear();
  isHydrated = true;
  notifySessionStoreChanged();
}

export function mergeEncryptedSessionStore(snapshot: Record<string, string>) {
  const dirtyEntries = Array.from(dirtyKeys, (key) => [key, encryptedValues.get(key)] as const);
  encryptedValues.clear();
  Object.entries(snapshot).forEach(([key, value]) => encryptedValues.set(key, value));
  dirtyEntries.forEach(([key, value]) => {
    if (value === undefined) {
      encryptedValues.delete(key);
    } else {
      encryptedValues.set(key, value);
    }
  });
  isEncrypted = true;
  isHydrated = true;
  notifySessionStoreChanged();
}

export function getDirtySessionKeys() {
  return Array.from(dirtyKeys);
}

export function clearFlushedSessionKeys(keys: string[], values: Record<string, string>) {
  keys.forEach((key) => {
    if (encryptedValues.get(key) === values[key]) dirtyKeys.delete(key);
  });
}

export function lockEncryptedSessionStore() {
  isEncrypted = true;
  isHydrated = false;
  encryptedValues.clear();
  dirtyKeys.clear();
  notifySessionStoreChanged();
}

export function disableEncryptedSessionStore(keys: string[]) {
  clearPersistentSessionValues(keys);
  encryptedValues.forEach((value, key) => localStorage.setItem(key, value));
  resetSessionStore();
}

export function resetSessionStore() {
  encryptedValues.clear();
  dirtyKeys.clear();
  isEncrypted = false;
  isHydrated = false;
  notifySessionStoreChanged();
}

export function clearPersistentSessionValues(keys: string[]) {
  keys.forEach((key) => localStorage.removeItem(key));
}

export function isEncryptedSessionStoreEnabled() {
  return isEncrypted;
}

export function isEncryptedSessionStoreHydrated() {
  return isHydrated;
}

export function isSessionStoreLocked() {
  if (isEncrypted) return !isHydrated;

  const passcodeState = localStorage.getItem(IS_SCREEN_LOCKED_CACHE_KEY);
  return passcodeState === 'enabling'
    || passcodeState === 'disabling'
    || passcodeState === 'true'
    || passcodeState === 'false';
}

export function addSessionStoreChangeListener(listener: NoneToVoidFunction) {
  window.addEventListener(SESSION_STORE_CHANGED_EVENT, listener);
  return () => window.removeEventListener(SESSION_STORE_CHANGED_EVENT, listener);
}

function notifySessionStoreChanged() {
  window.dispatchEvent(new Event(SESSION_STORE_CHANGED_EVENT));
}
