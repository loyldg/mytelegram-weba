import type { SharedMediaType, ThreadId } from '../../types';
import type { GlobalState, TabArgs } from '../types';

import { getCurrentTabId } from '../../util/establishMultitabRole';
import { buildChatThreadKey, buildMediaSearchKey } from '../helpers/middleSearch';
import { selectCurrentMessageList } from './messages';
import { selectTabState } from './tabs';

export function selectCurrentMiddleSearch<T extends GlobalState>(
  global: T,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
) {
  const { chatId, threadId } = selectCurrentMessageList(global, tabId) || {};
  if (!chatId || !threadId) {
    return undefined;
  }

  const chatThreadKey = buildChatThreadKey(chatId, threadId);

  return selectTabState(global, tabId).middleSearch.byChatThreadKey[chatThreadKey];
}

export function selectCurrentSharedMediaSearch<T extends GlobalState>(
  global: T,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
) {
  const { chatId, threadId } = selectCurrentMessageList(global, tabId) || {};
  if (!chatId || !threadId) {
    return undefined;
  }

  const chatThreadKey = buildChatThreadKey(chatId, threadId);

  return selectTabState(global, tabId).sharedMediaSearch.byChatThreadKey[chatThreadKey];
}

export function selectCurrentChatMediaSearch<T extends GlobalState>(
  global: T, mediaType: SharedMediaType,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
) {
  const { chatId, threadId } = selectCurrentMessageList(global, tabId) || {};
  if (!chatId || !threadId) {
    return undefined;
  }

  return selectChatMediaSearch(global, chatId, threadId, mediaType, tabId);
}

export function selectChatMediaSearch<T extends GlobalState>(
  global: T, chatId: string | undefined, threadId: ThreadId | undefined, mediaType: SharedMediaType,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
) {
  if (!chatId || !threadId) {
    return undefined;
  }

  const mediaSearchKey = buildMediaSearchKey(chatId, threadId, mediaType);

  return selectTabState(global, tabId).chatMediaSearch.byChatThreadKey[mediaSearchKey];
}
