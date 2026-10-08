import type { ApiMessage, ApiMessageSearchType } from '../../api/types';
import type {
  ChatMediaSearchParams,
  ChatMediaSearchSegment,
  LoadingState,
  MiddleSearchParams,
  MiddleSearchResults,
  SharedMediaType,
  ThreadId,
} from '../../types';
import type { GlobalState, TabArgs } from '../types';

import { getCurrentTabId } from '../../util/establishMultitabRole';
import {
  areSortedArraysEqual, areSortedArraysIntersecting, omit, unique,
} from '../../util/iteratees';
import {
  buildChatThreadKey, buildMediaSearchKey, isMessageInMediaWindow, isMessageLocal,
} from '../helpers';
import { selectTabState } from '../selectors';
import { selectChatMediaSearch } from '../selectors/middleSearch';
import { updateTabState } from './tabs';

interface SharedMediaSearchParams {
  currentType?: SharedMediaType;
  resultsByType?: Partial<Record<SharedMediaType, {
    totalCount?: number;
    nextOffsetId: number;
    foundIds: number[];
  }>>;
}

function replaceMiddleSearch<T extends GlobalState>(
  global: T,
  chatThreadKey: string,
  searchParams?: MiddleSearchParams,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const current = selectTabState(global, tabId).middleSearch.byChatThreadKey;
  if (!searchParams) {
    return updateTabState(global, {
      middleSearch: {
        byChatThreadKey: omit(current, [chatThreadKey]),
      },
    }, tabId);
  }

  const { type = 'chat', ...rest } = searchParams;
  return updateTabState(global, {
    middleSearch: {
      byChatThreadKey: {
        ...selectTabState(global, tabId).middleSearch.byChatThreadKey,
        [chatThreadKey]: {
          type,
          ...rest,
        },
      },
    },
  }, tabId);
}

export function updateMiddleSearch<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  update: Partial<MiddleSearchParams>,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const chatThreadKey = buildChatThreadKey(chatId, threadId);
  const currentSearch = selectTabState(global, tabId).middleSearch.byChatThreadKey[chatThreadKey];

  const updated = {
    type: 'chat',
    ...currentSearch,
    ...update,
  } satisfies MiddleSearchParams;

  if (!updated.isHashtag) {
    updated.type = 'chat';
  }

  if (currentSearch && (
    currentSearch.type !== updated.type
    || currentSearch.savedTag !== updated.savedTag
    || currentSearch.fromPeerId !== updated.fromPeerId
  )) {
    updated.results = undefined;
  }

  return replaceMiddleSearch(global, chatThreadKey, updated, tabId);
}

export function resetMiddleSearch<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  return replaceMiddleSearch(global, buildChatThreadKey(chatId, threadId), {
    type: 'chat',
  }, tabId);
}

function replaceMiddleSearchResults<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  results: MiddleSearchResults,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  return updateMiddleSearch(global, chatId, threadId, {
    results,
    fetchingQuery: undefined,
  }, tabId);
}

export function updateMiddleSearchResults<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  update: MiddleSearchResults,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const chatThreadKey = buildChatThreadKey(chatId, threadId);
  const { results } = selectTabState(global, tabId).middleSearch.byChatThreadKey[chatThreadKey] || {};
  const prevQuery = (results?.query) || '';
  if (update.query !== prevQuery) {
    return replaceMiddleSearchResults(global, chatId, threadId, update, tabId);
  }

  const prevFoundIds = (results?.foundIds) || [];
  const {
    query, foundIds: newFoundIds, totalCount, nextOffsetId, nextOffsetPeerId, nextOffsetRate,
  } = update;
  const foundIds = unique(Array.prototype.concat(prevFoundIds, newFoundIds));
  const foundOrPrevFoundIds = areSortedArraysEqual(prevFoundIds, foundIds) ? prevFoundIds : foundIds;

  return replaceMiddleSearchResults(
    global, chatId, threadId, {
      query,
      foundIds: foundOrPrevFoundIds,
      totalCount,
      nextOffsetId,
      nextOffsetRate,
      nextOffsetPeerId,
    }, tabId,
  );
}

export function closeMiddleSearch<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const chatThreadKey = buildChatThreadKey(chatId, threadId);

  return replaceMiddleSearch(global, chatThreadKey, undefined, tabId);
}

function replaceSharedMediaSearch<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  searchParams: SharedMediaSearchParams,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const chatThreadKey = buildChatThreadKey(chatId, threadId);

  return updateTabState(global, {
    sharedMediaSearch: {
      byChatThreadKey: {
        ...selectTabState(global, tabId).sharedMediaSearch.byChatThreadKey,
        [chatThreadKey]: searchParams,
      },
    },
  }, tabId);
}

export function updateSharedMediaSearchType<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  currentType: SharedMediaType | undefined,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const chatThreadKey = buildChatThreadKey(chatId, threadId);

  return replaceSharedMediaSearch(global, chatId, threadId, {
    ...selectTabState(global, tabId).sharedMediaSearch.byChatThreadKey[chatThreadKey],
    currentType,
  }, tabId);
}

export function replaceSharedMediaSearchResults<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  type: ApiMessageSearchType,
  foundIds?: number[],
  totalCount?: number,
  nextOffsetId?: number,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const chatThreadKey = buildChatThreadKey(chatId, threadId);

  return replaceSharedMediaSearch(global, chatId, threadId, {
    ...selectTabState(global, tabId).sharedMediaSearch.byChatThreadKey[chatThreadKey],
    resultsByType: {
      ...(selectTabState(global, tabId).sharedMediaSearch.byChatThreadKey[chatThreadKey] || {}).resultsByType,
      [type]: {
        foundIds,
        totalCount,
        nextOffsetId,
      },
    },
  }, tabId);
}

export function updateSharedMediaSearchResults<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  type: SharedMediaType,
  newFoundIds: number[],
  totalCount?: number,
  nextOffsetId?: number,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const chatThreadKey = buildChatThreadKey(chatId, threadId);

  const { resultsByType } = selectTabState(global, tabId).sharedMediaSearch.byChatThreadKey[chatThreadKey] || {};
  const prevFoundIds = resultsByType?.[type] ? resultsByType[type].foundIds : [];
  const foundIds = orderFoundIdsByDescending(unique(Array.prototype.concat(prevFoundIds, newFoundIds)));
  const foundOrPrevFoundIds = areSortedArraysEqual(prevFoundIds, foundIds) ? prevFoundIds : foundIds;

  return replaceSharedMediaSearchResults(
    global,
    chatId,
    threadId,
    type,
    foundOrPrevFoundIds,
    totalCount,
    nextOffsetId,
    tabId,
  );
}

function orderFoundIdsByDescending(listedIds: number[]) {
  return listedIds.sort((a, b) => b - a);
}

function orderFoundIdsByAscending(array: number[]) {
  return array.sort((a, b) => a - b);
}

export function mergeWithChatMediaSearchSegment(
  foundIds: number[],
  loadingState: LoadingState,
  segment?: ChatMediaSearchSegment,
): ChatMediaSearchSegment {
  if (!segment) {
    return {
      foundIds,
      loadingState,
    };
  }
  return {
    foundIds: areSortedArraysEqual(segment.foundIds, foundIds)
      ? segment.foundIds
      : orderFoundIdsByAscending(unique(segment.foundIds.concat(foundIds))),
    loadingState: {
      areAllItemsLoadedForwards: loadingState.areAllItemsLoadedForwards
        || segment.loadingState.areAllItemsLoadedForwards,
      areAllItemsLoadedBackwards: loadingState.areAllItemsLoadedBackwards
        || segment.loadingState.areAllItemsLoadedBackwards,
    },
  };
}

function mergeChatMediaSearchSegments(currentSegment: ChatMediaSearchSegment, segments: ChatMediaSearchSegment[]) {
  let mergedSegment = currentSegment;
  const otherSegments: ChatMediaSearchSegment[] = [];

  segments.forEach((segment) => {
    if (segment === mergedSegment || !segment.foundIds.length) return;

    if (areSortedArraysIntersecting(segment.foundIds, mergedSegment.foundIds)) {
      mergedSegment = mergeWithChatMediaSearchSegment(mergedSegment.foundIds, mergedSegment.loadingState, segment);
    } else {
      otherSegments.push(segment);
    }
  });

  return { currentSegment: mergedSegment, segments: otherSegments };
}

export function updateChatMediaSearchResults<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  mediaType: SharedMediaType,
  currentSegment: ChatMediaSearchSegment,
  searchParams: ChatMediaSearchParams,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const merged = mergeChatMediaSearchSegments(
    currentSegment, [searchParams.currentSegment, ...searchParams.segments],
  );

  return replaceChatMediaSearchResults(
    global,
    chatId,
    threadId,
    mediaType,
    merged.currentSegment,
    merged.segments,
    tabId,
  );
}

function removeIdFromSegment(id: number, segment: ChatMediaSearchSegment): ChatMediaSearchSegment {
  const foundIds = segment.foundIds.filter((foundId) => foundId !== id);

  return {
    ...segment,
    foundIds,
  };
}

function removeIdsFromChatMediaSearchParams(
  id: number,
  searchParams: ChatMediaSearchParams,
): ChatMediaSearchParams {
  const currentSegment = removeIdFromSegment(id, searchParams.currentSegment);
  const segments = searchParams.segments.map((segment) => removeIdFromSegment(id, segment));

  return {
    ...searchParams,
    currentSegment,
    segments,
  };
}

export function removeIdFromSearchResults<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  mediaType: SharedMediaType,
  id: number,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const searchParams = selectChatMediaSearch(global, chatId, threadId, mediaType, tabId);
  if (!searchParams) return global;

  const updatedSearchParams = removeIdsFromChatMediaSearchParams(id, searchParams);

  return replaceChatMediaSearch(
    global,
    chatId,
    threadId,
    mediaType,
    updatedSearchParams,
    tabId,
  );
}

function resetForwardsLoadingStateInParams(
  searchParams: ChatMediaSearchParams,
) {
  searchParams.currentSegment.loadingState.areAllItemsLoadedForwards = false;
  searchParams.segments.forEach((segment) => {
    segment.loadingState.areAllItemsLoadedForwards = false;
  });
}

export function updateChatMediaLoadingState<T extends GlobalState>(
  global: T,
  newMessage: ApiMessage,
  chatId: string,
  threadId: ThreadId,
  mediaType: SharedMediaType,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  if (!isMessageInMediaWindow(newMessage, mediaType)) {
    return global;
  }
  const searchParams = selectChatMediaSearch(global, chatId, threadId, mediaType, tabId);
  if (!searchParams) return global;

  if (isMessageLocal(newMessage)) {
    resetForwardsLoadingStateInParams(searchParams);

    return replaceChatMediaSearch(
      global,
      chatId,
      threadId,
      mediaType,
      searchParams,
      tabId,
    );
  }

  const appendNewId = (segment: ChatMediaSearchSegment) => (
    segment.loadingState.areAllItemsLoadedForwards && !segment.foundIds.includes(newMessage.id)
      ? { ...segment, foundIds: segment.foundIds.concat(newMessage.id) }
      : segment
  );

  return replaceChatMediaSearchResults(
    global,
    chatId,
    threadId,
    mediaType,
    appendNewId(searchParams.currentSegment),
    searchParams.segments.map(appendNewId),
    tabId,
  );
}

export function updateChatMediaSearchPendingRequest<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  mediaType: SharedMediaType,
  pendingRequest: ChatMediaSearchParams['pendingRequest'],
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const searchParams = selectChatMediaSearch(global, chatId, threadId, mediaType, tabId);
  if (!searchParams) return global;

  return replaceChatMediaSearch(global, chatId, threadId, mediaType, { ...searchParams, pendingRequest }, tabId);
}

export function initializeChatMediaSearchResults<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  mediaType: SharedMediaType,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const loadingState: LoadingState = {
    areAllItemsLoadedForwards: false,
    areAllItemsLoadedBackwards: false,
  };
  const currentSegment: ChatMediaSearchSegment = {
    foundIds: [],
    loadingState,
  };
  const segments: ChatMediaSearchSegment[] = [];

  const isLoading = false;

  return replaceChatMediaSearch(global, chatId, threadId, mediaType, {
    currentSegment,
    segments,
    isLoading,
  }, tabId);
}

export function setChatMediaSearchLoading<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  mediaType: SharedMediaType,
  isLoading: boolean,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const mediaSearchKey = buildMediaSearchKey(chatId, threadId, mediaType);
  const searchParams = selectTabState(global, tabId).chatMediaSearch.byChatThreadKey[mediaSearchKey];

  if (!searchParams) {
    return global;
  }

  return replaceChatMediaSearch(global, chatId, threadId, mediaType, {
    ...searchParams,
    isLoading,
  }, tabId);
}

export function replaceChatMediaSearchResults<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  mediaType: SharedMediaType,
  currentSegment: ChatMediaSearchSegment,
  segments: ChatMediaSearchSegment[],
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const mediaSearchKey = buildMediaSearchKey(chatId, threadId, mediaType);

  return replaceChatMediaSearch(global, chatId, threadId, mediaType, {
    ...selectTabState(global, tabId).chatMediaSearch.byChatThreadKey[mediaSearchKey],
    currentSegment,
    segments,
  }, tabId);
}

function replaceChatMediaSearch<T extends GlobalState>(
  global: T,
  chatId: string,
  threadId: ThreadId,
  mediaType: SharedMediaType,
  searchParams: ChatMediaSearchParams,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const mediaSearchKey = buildMediaSearchKey(chatId, threadId, mediaType);

  return updateTabState(global, {
    chatMediaSearch: {
      byChatThreadKey: {
        ...selectTabState(global, tabId).chatMediaSearch.byChatThreadKey,
        [mediaSearchKey]: searchParams,
      },
    },
  }, tabId);
}
