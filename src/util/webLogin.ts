import { getActions, getGlobal } from '../global';

import { getCurrentMaxAccountCount, getCurrentProdAccountCount } from '../global/helpers/misc';
import { selectTabState } from '../global/selectors';
import { callApi } from '../api/gramjs';
import { IS_MULTIACCOUNT_SUPPORTED } from './browser/globalEnvironment';
import { processDeepLink } from './deeplink';
import { getCurrentTabId } from './establishMultitabRole';
import {
  ACCOUNT_SLOT, getAccountsInfo, getAccountSlotUrl, getFirstLoggedInAccountSlot, loadSlotSession,
} from './multiaccount';
import {
  completeWebLogin, getPendingWebLogin, parseInitialLocationHash, parseLocationHash, setPendingWebLogin,
} from './routing';
import { checkSessionLocked, hasStoredSession } from './sessions';
import { handoffWebLogin } from './webLoginHandoff';

export async function resolveWebLogin() {
  const request = getPendingWebLogin()!;
  const accounts = getAccountsInfo();
  if (!IS_MULTIACCOUNT_SUPPORTED) {
    const session = loadSlotSession(1);
    if (session?.userId) accounts[1] = { userId: session.userId, isTest: session.isTest };
  }
  const matchingSlot = Object.entries(accounts).find(([, account]) => (
    account.userId === request.userId && Boolean(account.isTest) === request.isTest
  ))?.[0];
  let slot = matchingSlot ? Number(matchingSlot) : 1;
  if (!matchingSlot) {
    if (!request.isTest && getCurrentProdAccountCount() >= getCurrentMaxAccountCount()) {
      rejectWebLogin();
      return true;
    }
    while (loadSlotSession(slot)) slot += 1;
  }
  if (slot === (ACCOUNT_SLOT || 1)) return true;
  if (!IS_MULTIACCOUNT_SUPPORTED || !await handoffWebLogin(getAccountSlotUrl(slot, !matchingSlot, request.isTest))) {
    rejectWebLogin();
    return true;
  }
  return false;
}

export function rejectWebLogin(isInvalid?: boolean) {
  setPendingWebLogin(undefined);
  if (hasStoredSession()) return;
  const slot = getFirstLoggedInAccountSlot();
  if (slot) {
    window.location.replace(getAccountSlotUrl(slot));
  } else if (isInvalid) {
    getActions().showNotification({ message: { key: 'WebLoginInvalid' }, tabId: getCurrentTabId() });
  }
}

// A dispatched token belongs to the running authentication flow and cannot be replayed after interruption
export function interruptWebLogin() {
  const request = getPendingWebLogin();
  if (request && !request.token) rejectWebLogin();
}

export function finishWebLogin(userId: string) {
  const request = getPendingWebLogin();
  const global = getGlobal();
  if (!request || !global.isSynced || checkSessionLocked() || global.passcode.isScreenLocked
    || !selectTabState(global, getCurrentTabId()).isMasterTab) return;
  if (request.userId !== userId) {
    rejectWebLogin(true);
    return;
  }
  if (request.token) {
    void callApi('cancelWebTokenAuthorization', { token: request.token }).catch(() => undefined);
  }
  completeWebLogin();
  const destination = parseLocationHash(userId);
  if (destination) getActions().openThread({ ...destination, tabId: getCurrentTabId() });
  const parameters = parseInitialLocationHash();
  if (parameters?.tgaddr) {
    const link = parameters.tgaddr;
    delete parameters.tgaddr;
    processDeepLink(link, { type: 'inner' });
  }
}
