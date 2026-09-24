import type { GlobalState, TabState } from '../types';

import { INITIAL_GLOBAL_STATE, INITIAL_TAB_STATE } from '../initialState';

export function updatePasscodeSettings<T extends GlobalState>(
  global: T,
  update: GlobalState['passcode'],
): T {
  return {
    ...global,
    passcode: {
      ...global.passcode,
      ...update,
    },
  };
}

export function clearPasscodeSettings<T extends GlobalState>(global: T): T {
  return {
    ...global,
    passcode: {},
  };
}

// Only origin-wide shared settings stay plaintext while the account is locked
export function clearGlobalForLockScreen<T extends GlobalState>(global: T, withTabState = true): T {
  return {
    ...INITIAL_GLOBAL_STATE,
    passcode: global.passcode,
    sharedState: global.sharedState,
    ...(withTabState && {
      byTabId: Object.values(global.byTabId).reduce((acc, { id: tabId, isMasterTab }) => {
        acc[tabId] = { ...INITIAL_TAB_STATE, isMasterTab, id: tabId };
        return acc;
      }, {} as Record<number, TabState>),
    }),
  } as T;
}
