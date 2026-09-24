import type { MessageListType, ThreadId } from '../types';
import { MAIN_THREAD_ID } from '../api/types';

import { DC_IDS } from '../config';

const MAX_USER_ID_LENGTH = 19;
const MAX_USER_ID = 9223372036854775807n;
const MAX_TEST_DC_ID = 3;

export type PendingWebLogin = {
  token?: string;
  userId: string;
  dcId: number;
  isTest: boolean;
  messageHash?: string;
  parameters?: Record<string, string>;
};

let parsedInitialLocationHash: Record<string, string> | undefined;
let messageHash: string | undefined;
let initialLocationHash = '';
let pendingWebLogin: PendingWebLogin | undefined;
let hasInvalidWebLogin = false;

captureInitialLocation();

function captureInitialLocation() {
  const url = new URL(window.location.href);
  const hash = url.hash.slice(1);
  const separator = hash.indexOf('?');
  const hasParameters = hash.includes('=') || hash.startsWith('tgWebAuth') || hash.includes('&');
  const navigation = separator >= 0 ? hash.slice(0, separator) : !hasParameters ? hash : '';
  const parameters = new URLSearchParams(separator >= 0 ? hash.slice(separator + 1) : hasParameters ? hash : '');
  const hasAuth = [...parameters.keys()].some((key) => key.startsWith('tgWebAuth'));
  const hasDuplicateAuth = [...parameters.keys()].some((key) => (
    key.startsWith('tgWebAuth') && parameters.getAll(key).length !== 1
  ));
  const auth = Object.fromEntries(parameters);
  for (const key of [...parameters.keys()]) {
    if (key.startsWith('tgWebAuth')) parameters.delete(key);
  }
  url.hash = navigation + (parameters.size ? `${navigation ? '?' : ''}${parameters}` : '');
  initialLocationHash = url.hash;
  url.hash = navigation;
  if (hasAuth || parameters.size) window.history.replaceState(window.history.state, '', url);

  messageHash = navigation;
  parsedInitialLocationHash = parameters.size ? Object.fromEntries(parameters) : undefined;
  if (!hasAuth) return;

  const { tgWebAuthToken: token, tgWebAuthUserId: userId, tgWebAuthDcId: dc, tgWebAuthTest: test } = auth;
  const dcId = Number(dc);
  const isTest = test === '1';
  if (!token || !/^[A-Za-z0-9_-]+={0,2}$/.test(token) || !userId || !/^[1-9]\d*$/.test(userId)
    || userId.length > MAX_USER_ID_LENGTH || BigInt(userId) > MAX_USER_ID
    || !/^[1-5]$/.test(dc) || !DC_IDS.some((id) => id === dcId)
    || (isTest && dcId > MAX_TEST_DC_ID) || (test !== undefined && test !== '0' && test !== '1')
    || hasDuplicateAuth) {
    hasInvalidWebLogin = true;
    messageHash = undefined;
    parsedInitialLocationHash = undefined;
    return;
  }
  pendingWebLogin = {
    token, userId, dcId, isTest,
    messageHash, parameters: parsedInitialLocationHash,
  };
  messageHash = undefined;
  parsedInitialLocationHash = undefined;
}

export function getPendingWebLogin() {
  return pendingWebLogin;
}

export function setPendingWebLogin(request?: PendingWebLogin) {
  pendingWebLogin = request;
}

export function consumeInvalidWebLogin() {
  const isInvalid = hasInvalidWebLogin;
  hasInvalidWebLogin = false;
  return isInvalid;
}

export function completeWebLogin() {
  messageHash = pendingWebLogin!.messageHash;
  parsedInitialLocationHash = pendingWebLogin!.parameters;
  pendingWebLogin = undefined;
}

export function resetInitialLocationHash() {
  pendingWebLogin = undefined;
  messageHash = undefined;
  parsedInitialLocationHash = undefined;
  initialLocationHash = '';
}

export function resetLocationHash() {
  window.location.hash = '';
}

export const createLocationHash = (chatId: string, type: MessageListType, threadId: ThreadId): string => {
  const displayType = type === 'thread' ? undefined : type;
  const parts = threadId === MAIN_THREAD_ID ? [chatId, displayType] : [chatId, threadId, displayType];

  return parts.filter(Boolean).join('_');
};

export function parseLocationHash(currentUserId?: string) {
  parseInitialLocationHash();

  if (!messageHash) return undefined;

  const parts = messageHash.split('_');
  let chatId: string | undefined;
  let type: string | undefined;
  let threadId: string | undefined;
  if (parts.length === 1) {
    chatId = parts[0];
  } else if (parts.length === 2) {
    const isType = ['thread', 'pinned', 'scheduled'].includes(parts[1]);
    chatId = parts[0];
    type = isType ? parts[1] : 'thread';
    threadId = !isType ? parts[1] : undefined;
  } else if (parts.length >= 3) {
    [chatId, threadId, type] = parts;
  }
  if (!chatId?.match(/^-?\d+$/)) return undefined;

  const isType = ['thread', 'pinned', 'scheduled'].includes(type!);

  const castedThreadId = (chatId === currentUserId ? threadId : Number(threadId)) || MAIN_THREAD_ID;

  return {
    chatId,
    type: type && isType ? (type as MessageListType) : 'thread',
    threadId: castedThreadId,
  };
}

export const createMessageHashUrl = (chatId: string, type: MessageListType, threadId: ThreadId): string => {
  const url = new URL(window.location.href);
  url.hash = createLocationHash(chatId, type, threadId);
  return url.href;
};

export function parseInitialLocationHash() {
  return parsedInitialLocationHash;
}

export function getInitialLocationHash() {
  return initialLocationHash;
}
