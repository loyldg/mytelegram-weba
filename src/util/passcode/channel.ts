import type { GlobalActions } from '../../global';

import { getDek, getDekGeneration } from './index';

const CHANNEL_NAME = 'tt-passcode';
const DEK_REQUEST_TIMEOUT = 1500;

type PasscodeChannelMessage = {
  type: 'requestDek';
  generation: string;
} | {
  type: 'dek';
  dek: ArrayBuffer;
  generation: string;
} | {
  type: 'stateChanged';
  dek?: ArrayBuffer;
  generation?: string;
} | {
  type: 'reset';
} | {
  type: 'sessionsChanged';
  generation: string;
};

type PasscodeChannelActions = Pick<
  GlobalActions,
  'onPasscodeSessionsChanged' | 'onPasscodeStateChangedRemotely'
>;

const channel = new BroadcastChannel(CHANNEL_NAME);
export function subscribeToPasscodeChannel(loadActions: () => Promise<PasscodeChannelActions>) {
  channel.addEventListener('message', (event) => handleMessage(event, loadActions));
}

export function requestDekFromOtherTabs(generation: string): Promise<ArrayBuffer | undefined> {
  return new Promise((resolve) => {
    function finish(dek?: ArrayBuffer) {
      channel.removeEventListener('message', handleDekMessage);
      clearTimeout(timeout);
      resolve(dek);
    }

    function handleDekMessage({ data }: MessageEvent<PasscodeChannelMessage>) {
      if (data.type === 'dek' && data.generation === generation) finish(data.dek);
    }

    channel.addEventListener('message', handleDekMessage);
    const timeout = window.setTimeout(() => finish(), DEK_REQUEST_TIMEOUT);
    channel.postMessage({ type: 'requestDek', generation });
  });
}

export function broadcastPasscodeState(dek?: ArrayBuffer, generation = getDekGeneration()) {
  channel.postMessage({ type: 'stateChanged', dek, generation });
}

export function broadcastPasscodeReset() {
  channel.postMessage({ type: 'reset' });
}

export function broadcastPasscodeSessionsChanged(generation: string) {
  channel.postMessage({ type: 'sessionsChanged', generation });
}

async function handleMessage(
  { data }: MessageEvent<PasscodeChannelMessage>,
  loadActions: () => Promise<PasscodeChannelActions>,
) {
  switch (data.type) {
    case 'requestDek': {
      const dek = getDek();
      const generation = getDekGeneration();
      if (dek && generation === data.generation) {
        channel.postMessage({ type: 'dek', dek, generation });
      }
      break;
    }

    case 'stateChanged': {
      const actions = await loadActions();
      actions.onPasscodeStateChangedRemotely({ dek: data.dek, generation: data.generation });
      break;
    }

    case 'reset': {
      window.location.reload();
      break;
    }

    case 'sessionsChanged': {
      const actions = await loadActions();
      actions.onPasscodeSessionsChanged({ generation: data.generation });
      break;
    }

    case 'dek':
      // Handled by temporary listeners in `requestDekFromOtherTabs`
      break;
  }
}
