import type { ClientBoundMessageEvent, WorkerBoundMessageEvent } from '../../global/shared/sharedWorker';

import { createSharedWorker } from '../../global/shared/sharedWorker';

const PASSCODE_NAVIGATION_DEK_REQUEST_TIMEOUT_MS = 1000;

let sharedWorker: SharedWorker | undefined;

export function initPasscodeNavigation(
  getDek: () => ArrayBuffer | undefined,
  getGeneration: () => string | undefined,
) {
  getSharedWorker();

  window.addEventListener('pagehide', () => {
    const dek = getDek();
    const generation = getGeneration();
    if (!dek || !generation) return;
    const worker = getSharedWorker();
    if (!worker) return;

    sendToWorker(worker, {
      type: 'retainPasscodeNavigationDek',
      dek,
      generation,
    });
  });
}

export function requestPasscodeNavigationDek(generation: string): Promise<ArrayBuffer | undefined> {
  const worker = getSharedWorker();
  if (!worker) return Promise.resolve(undefined);
  const { port } = worker;

  return new Promise((resolve) => {
    function finish(dek?: ArrayBuffer) {
      port.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
      resolve(dek);
    }

    function handleMessage({ data }: MessageEvent<ClientBoundMessageEvent>) {
      if (data.type === 'passcodeNavigationDek' && data.generation === generation) finish(data.dek);
    }

    port.addEventListener('message', handleMessage);
    const timeout = window.setTimeout(() => finish(), PASSCODE_NAVIGATION_DEK_REQUEST_TIMEOUT_MS);
    if (!sendToWorker(worker, { type: 'requestPasscodeNavigationDek', generation })) finish();
  });
}

export function clearPasscodeNavigationDek(generation?: string) {
  const worker = getSharedWorker();
  if (!worker) return;

  sendToWorker(worker, { type: 'clearPasscodeNavigationDek', generation });
}

function getSharedWorker() {
  if (!('SharedWorker' in globalThis)) return undefined;
  if (!sharedWorker) {
    try {
      const worker = createSharedWorker();
      worker.port.start();
      sharedWorker = worker;
    } catch {
      return undefined;
    }
  }
  return sharedWorker;
}

function sendToWorker(worker: SharedWorker, event: WorkerBoundMessageEvent) {
  try {
    worker.port.postMessage(event);
    return true;
  } catch {
    if (sharedWorker === worker) sharedWorker = undefined;
    return false;
  }
}
