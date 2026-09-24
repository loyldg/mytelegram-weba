import { PASSCODE_IDB_STORE } from '../browser/idb';

export const PASSCODE_META_KEY = 'meta';
export const PASSCODE_STATE_LOCK_NAME = 'tt-passcode-state';

export type PasscodeMeta = {
  version: number;
  generation: string;
  kdfSalt: number[];
  kdfIterations: number;
  wrappedDek: number[];
  lockEpoch: number;
  passkey?: {
    credentialId: number[];
    prfSalt: number[];
    wrappedDek: number[];
  };
  isLocked?: boolean;
  invalidAttemptsCount?: number;
  timeoutUntil?: number;
  autolockDuration?: number;
  isDisabling?: boolean;
};

export function loadPasscodeMeta() {
  return PASSCODE_IDB_STORE.get<PasscodeMeta>(PASSCODE_META_KEY);
}

export function requestPasscodeStateLock<T>(callback: () => Promise<T>) {
  return navigator.locks.request(PASSCODE_STATE_LOCK_NAME, callback);
}
