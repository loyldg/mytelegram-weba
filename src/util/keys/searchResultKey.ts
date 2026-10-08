import type { ApiMessage } from '../../api/types';

export type SearchResultKey = `${string}_${number}`;

export function buildSearchResultKey(chatId: string, messageId: number): SearchResultKey {
  return `${chatId}_${messageId}`;
}

export function getSearchResultKey(message: ApiMessage): SearchResultKey {
  const { chatId, id } = message;

  return buildSearchResultKey(chatId, id);
}

export function isSearchResultKey(key: string | number): key is SearchResultKey {
  return typeof key === 'string' && key.includes('_');
}

export function parseSearchResultKey(key: SearchResultKey) {
  const [chatId, messageId] = key.split('_');

  return [chatId, Number(messageId)] as const;
}
