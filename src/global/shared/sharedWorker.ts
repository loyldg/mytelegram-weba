import type { DiffObject } from '../../util/deepDiff';
import type { PendingWebLogin } from '../../util/routing';
import type { SharedState } from '../types';

import { APP_NAME } from '../../config';

declare global {
  interface WorkerOptions {
    extendedLifetime?: boolean;
  }
}

interface GetFullStateEvent {
  type: 'reqGetFullState';
  localState: SharedState;
}

interface UpdateStateEvent {
  type: 'reqUpdateState';
  update: DiffObject<SharedState>;
}

interface RetainPasscodeNavigationDekEvent {
  type: 'retainPasscodeNavigationDek';
  dek: ArrayBuffer;
  generation: string;
}

interface RequestPasscodeNavigationDekEvent {
  type: 'requestPasscodeNavigationDek';
  generation: string;
}

interface ClearPasscodeNavigationDekEvent {
  type: 'clearPasscodeNavigationDek';
  generation?: string;
}

interface ResetSharedStateEvent {
  type: 'resetSharedState';
}

interface StateUpdateEvent {
  type: 'stateUpdate';
  update: DiffObject<SharedState>;
}

interface FullStateEvent {
  type: 'fullState';
  state: SharedState;
}

interface PasscodeNavigationDekEvent {
  type: 'passcodeNavigationDek';
  dek?: ArrayBuffer;
  generation: string;
}

export type WorkerBoundMessageEvent = GetFullStateEvent
  | { type: 'retainWebLogin'; id: string; slot: number; request: PendingWebLogin }
  | { type: 'claimWebLogin'; id: string; slot: number }
  | UpdateStateEvent
  | RetainPasscodeNavigationDekEvent
  | RequestPasscodeNavigationDekEvent
  | ClearPasscodeNavigationDekEvent
  | ResetSharedStateEvent;

export type ClientBoundMessageEvent = StateUpdateEvent | FullStateEvent | PasscodeNavigationDekEvent
  | { type: 'webLoginRetained'; id: string }
  | { type: 'webLoginClaimed'; id: string; request?: PendingWebLogin };

export function createSharedWorker() {
  return new SharedWorker(new URL('./sharedState.worker.ts', import.meta.url), {
    name: APP_NAME,
    type: 'module',
    extendedLifetime: true,
  });
}
