import type { ClientBoundMessageEvent, WorkerBoundMessageEvent } from '../global/shared/sharedWorker';

import { createSharedWorker } from '../global/shared/sharedWorker';
import { getAccountSlot } from './accountSlot';
import { getPendingWebLogin, setPendingWebLogin } from './routing';

const HANDOFF_KEY = 'tt-web-login-handoff';
const HANDOFF_TIMEOUT_MS = 3000;

// Claim starts before asynchronous application initialization and consumes the tab's ID immediately
export const webLoginHandoffPromise = claimWebLogin();

async function claimWebLogin() {
  let id: string | undefined;
  try {
    id = sessionStorage.getItem(HANDOFF_KEY) || undefined;
    sessionStorage.removeItem(HANDOFF_KEY);
  } catch {
    return false;
  }
  if (!id) return true;
  const response = await sendWebLoginMessage({ type: 'claimWebLogin', id, slot: getAccountSlot(location.href) || 1 });
  if (getPendingWebLogin()) return true;
  if (response?.type !== 'webLoginClaimed' || !response.request) return false;
  setPendingWebLogin(response.request);
  return true;
}

export async function handoffWebLogin(url: string) {
  const request = getPendingWebLogin();
  if (!request) {
    window.location.replace(url);
    return true;
  }
  const id = crypto.randomUUID();
  const response = await sendWebLoginMessage({ type: 'retainWebLogin', id, slot: getAccountSlot(url) || 1, request });
  if (response?.type !== 'webLoginRetained') return false;
  try {
    sessionStorage.setItem(HANDOFF_KEY, id);
  } catch {
    return false;
  }
  setPendingWebLogin(undefined);
  window.location.replace(url);
  return true;
}

function sendWebLoginMessage(message: WorkerBoundMessageEvent & { id: string }) {
  return new Promise<ClientBoundMessageEvent | undefined>((resolve) => {
    let worker: SharedWorker;
    try {
      worker = createSharedWorker();
      worker.port.start();
      worker.port.onmessage = ({ data }: MessageEvent<ClientBoundMessageEvent>) => {
        if ('id' in data && data.id === message.id) finish(data);
      };
      worker.port.postMessage(message);
    } catch {
      resolve(undefined);
      return;
    }
    const timeout = window.setTimeout(() => finish(), HANDOFF_TIMEOUT_MS);
    function finish(response?: ClientBoundMessageEvent) {
      clearTimeout(timeout);
      worker.port.close();
      resolve(response);
    }
  });
}
