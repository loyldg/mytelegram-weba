import type { PlaylistKey, ShuffleState } from '../../types';
import type { GlobalState, TabArgs, TabState } from '../types';

import { REMEMBER_SHUFFLED_ORDER_ITEMS } from '../../config';
import { getCurrentTabId } from '../../util/establishMultitabRole';
import { selectTabState } from '../selectors/tabs';
import { updateTabState } from './tabs';

function replaceShuffleState<T extends GlobalState>(
  global: T, shuffle: ShuffleState | undefined, tabId: number,
): T {
  return updateTabState(global, {
    audioPlayer: { ...selectTabState(global, tabId).audioPlayer, shuffle },
  }, tabId);
}

export function clearShuffleStateInAllTabs<T extends GlobalState>(global: T): T {
  Object.values(global.byTabId).forEach(({ id, audioPlayer }) => {
    if (audioPlayer.shuffle) global = replaceShuffleState(global, undefined, id);
  });

  return global;
}

export function initShuffleState<T extends GlobalState>(
  global: T, keys: readonly PlaylistKey[], currentKey: PlaylistKey, areAllLoaded: boolean,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const playlist = Array.from(keys);

  return replaceShuffleState(global, {
    playlist,
    nonPlayedKeys: playlist.filter((key) => key !== currentKey),
    playedKeys: [currentKey],
    indexInPlayed: 0,
    areAllLoaded,
  }, tabId);
}

export function pushPlayedTrack<T extends GlobalState>(
  global: T, key: PlaylistKey, ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const shuffle = selectTabState(global, tabId).audioPlayer.shuffle;
  if (!shuffle) return global;
  if (shuffle.playedKeys[shuffle.indexInPlayed] === key) return global;

  const playedKeys = shuffle.playedKeys.slice(0, shuffle.indexInPlayed + 1).concat(key);

  return replaceShuffleState(global, {
    ...shuffle,
    playedKeys,
    indexInPlayed: playedKeys.length - 1,
    nonPlayedKeys: shuffle.nonPlayedKeys.filter((nonPlayedKey) => nonPlayedKey !== key),
  }, tabId);
}

export function stepInPlayedHistory<T extends GlobalState>(
  global: T, delta: number, ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const shuffle = selectTabState(global, tabId).audioPlayer.shuffle;
  if (!shuffle) return global;

  const indexInPlayed = Math.max(0, Math.min(shuffle.playedKeys.length - 1, shuffle.indexInPlayed + delta));

  return replaceShuffleState(global, { ...shuffle, indexInPlayed }, tabId);
}

export function ensureShuffleMove<T extends GlobalState>(
  global: T, ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const shuffle = selectTabState(global, tabId).audioPlayer.shuffle;
  if (!shuffle || shuffle.nonPlayedKeys.length > 0) return global;

  const freeUpCount = Math.max(
    Math.floor(shuffle.playedKeys.length / 2),
    shuffle.playedKeys.length - REMEMBER_SHUFFLED_ORDER_ITEMS,
  );
  if (freeUpCount <= 0) return global;

  const released = shuffle.playedKeys.slice(0, freeUpCount);

  return replaceShuffleState(global, {
    ...shuffle,
    playedKeys: shuffle.playedKeys.slice(freeUpCount),
    indexInPlayed: Math.max(0, shuffle.indexInPlayed - freeUpCount),
    nonPlayedKeys: shuffle.nonPlayedKeys.concat(released),
  }, tabId);
}

export function appendShufflePlaylist<T extends GlobalState>(
  global: T, keys: readonly PlaylistKey[], areAllLoaded: boolean,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const shuffle = selectTabState(global, tabId).audioPlayer.shuffle;
  if (!shuffle) return global;

  const known = new Set(shuffle.playlist);
  const fresh = keys.filter((key) => !known.has(key));
  if (!fresh.length && areAllLoaded === shuffle.areAllLoaded) return global;

  return replaceShuffleState(global, {
    ...shuffle,
    playlist: shuffle.playlist.concat(fresh),
    nonPlayedKeys: shuffle.nonPlayedKeys.concat(fresh),
    areAllLoaded,
  }, tabId);
}

export function detachGlobalSearchPlaylist<T extends GlobalState>(
  global: T, ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const { audioPlayer } = selectTabState(global, tabId);
  if (audioPlayer.source?.type !== 'globalSearch') return global;

  return updateTabState(global, {
    audioPlayer: {
      ...audioPlayer, source: { type: 'single' }, shuffle: undefined, pendingStep: undefined,
    },
  }, tabId);
}

export function keepPlayingSearchResults<T extends GlobalState>(
  global: T, ...[tabId = getCurrentTabId()]: TabArgs<T>
): TabState['globalSearch']['resultsByType'] {
  const { audioPlayer, globalSearch } = selectTabState(global, tabId);
  if (audioPlayer.source?.type !== 'globalSearch') return undefined;

  const { mediaType } = audioPlayer.source;
  const results = globalSearch.resultsByType?.[mediaType];
  if (!results?.foundIds.length) return undefined;

  return {
    [mediaType]: { ...results, totalCount: results.foundIds.length },
  };
}

export function removeTrackFromShuffle<T extends GlobalState>(
  global: T, key: PlaylistKey, ...[tabId = getCurrentTabId()]: TabArgs<T>
): T {
  const shuffle = selectTabState(global, tabId).audioPlayer.shuffle;
  if (!shuffle) return global;

  const removedIndexInPlayed = shuffle.playedKeys.indexOf(key);
  if (removedIndexInPlayed === -1 && !shuffle.playlist.includes(key)) return global;

  const notRemoved = (playlistKey: PlaylistKey) => playlistKey !== key;
  const playedKeys = shuffle.playedKeys.filter(notRemoved);
  const shiftedIndex = removedIndexInPlayed !== -1 && removedIndexInPlayed < shuffle.indexInPlayed
    ? shuffle.indexInPlayed - 1
    : shuffle.indexInPlayed;

  return replaceShuffleState(global, {
    ...shuffle,
    playlist: shuffle.playlist.filter(notRemoved),
    nonPlayedKeys: shuffle.nonPlayedKeys.filter(notRemoved),
    playedKeys,
    indexInPlayed: Math.max(0, Math.min(shiftedIndex, playedKeys.length - 1)),
  }, tabId);
}
