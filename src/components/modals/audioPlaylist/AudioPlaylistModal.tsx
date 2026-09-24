import { memo, useEffect, useMemo, useRef, useState } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type { ApiAudio, ApiPeer } from '../../../api/types';
import type { TabState } from '../../../global/types';
import type { PlaybackItemRef, PlaybackSource, PlaylistKey } from '../../../types';
import { MAIN_THREAD_ID } from '../../../api/types';
import { LoadMoreDirection } from '../../../types';

import { requestMeasure, requestMutation } from '../../../lib/fasterdom/fasterdom';
import { getPeerTitle } from '../../../global/helpers/peers';
import {
  selectChatMessageOrEphemeral, selectIsMessageProtected, selectPeer, selectTabState,
} from '../../../global/selectors';
import {
  selectCurrentPlaylistKey, selectPlaybackItem, selectPlaybackMedia, selectPlaybackSource, selectPlaylistKeys,
  selectRichMessageAudios,
} from '../../../global/selectors/audioPlayer';
import { selectUserSavedMusic } from '../../../global/selectors/users';
import { ensureAudioContext } from '../../../util/audioPlayback/audioAnalyser';
import { makeMessageTrackKey } from '../../../util/audioPlayback/mediaPool';
import * as playbackController from '../../../util/audioPlayback/playbackController';
import { getState, subscribe } from '../../../util/audioPlayback/playbackController';
import buildClassName from '../../../util/buildClassName';
import { isSearchResultKey, parseSearchResultKey } from '../../../util/keys/searchResultKey';

import useForceUpdate from '../../../hooks/useForceUpdate';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';
import useReorderableList from '../../../hooks/useReorderableList';

import Icon from '../../common/icons/Icon';
import PlayableAudio from '../../common/PlayableAudio';
import ProfileMusic from '../../common/ProfileMusic';
import Island from '../../gili/layout/Island';
import InfiniteScroll from '../../ui/InfiniteScroll';
import Modal from '../../ui/Modal';
import PlaylistControls from './PlaylistControls';
import PlaylistTrack from './PlaylistTrack';

import styles from './AudioPlaylistModal.module.scss';

export type OwnProps = {
  modal: TabState['isAudioPlaylistModalOpen'];
};

type StateProps = {
  source?: PlaybackSource;
  chatId?: string;
  messageId?: number;
  currentKey?: PlaylistKey;
  playlistIds?: readonly PlaylistKey[];
  savedMusicById?: Record<string, ApiAudio>;
  isSavedMusicFullyLoaded?: boolean;
  playlistPeer?: ApiPeer;
  isOwnPlaylist?: boolean;
  isPlaylistLoaded?: boolean;
  isAudioTrack?: boolean;
  isSavedMusicStatusLoaded?: boolean;
  richMessageAudioById?: Record<string, ApiAudio>;
  isRichMessageProtected?: boolean;
};

const AudioPlaylistModal = ({
  modal,
  source,
  chatId,
  messageId,
  currentKey,
  playlistIds,
  savedMusicById,
  isSavedMusicFullyLoaded,
  playlistPeer,
  isOwnPlaylist,
  isPlaylistLoaded,
  isAudioTrack,
  isSavedMusicStatusLoaded,
  richMessageAudioById,
  isRichMessageProtected,
}: OwnProps & StateProps) => {
  const {
    closeAudioPlaylistModal, openAudioPlayer, searchChatMediaMessages, loadSavedMusic, searchMessagesGlobal,
    reorderSavedMusic, loadSavedMusicIds,
  } = getActions();

  const isOpen = Boolean(modal);

  const scrollRef = useRef<HTMLDivElement>();
  const forceUpdate = useForceUpdate();
  const lang = useLang();

  const [previewOrder, setPreviewOrder] = useState<string[] | undefined>();
  const lastDraggedIdRef = useRef<string | undefined>();

  useEffect(() => subscribe(forceUpdate), [forceUpdate]);
  const { isPlaying, duration } = getState();

  const isChatSource = source?.type === 'chat';

  const displayedIds = useMemo(() => {
    if (!playlistIds) return undefined;
    if (source?.type === 'savedMusic') {
      return playlistIds.filter((id) => typeof id === 'string' && savedMusicById?.[id]);
    }

    return isChatSource ? playlistIds.slice().reverse() : playlistIds.slice();
  }, [playlistIds, isChatSource, source?.type, savedMusicById]);

  const richMessageTracks = useMemo(() => {
    if (source?.type !== 'richMessage' || !richMessageAudioById) return undefined;

    return new Map(Object.values(richMessageAudioById).map((audio) => [audio.id, {
      audio,
      item: {
        type: 'message',
        chatId: source.chatId,
        threadId: source.threadId,
        messageId: source.messageId,
        documentId: audio.id,
      } satisfies PlaybackItemRef,
    }]));
  }, [source, richMessageAudioById]);

  const loadMoreChatTracks = useLastCallback((direction: LoadMoreDirection) => {
    if (source?.type !== 'chat' || messageId === undefined) return;

    searchChatMediaMessages({
      chatId: source.chatId,
      threadId: source.threadId,
      mediaType: source.mediaType,
      currentMediaMessageId: messageId,
      direction,
    });
  });

  const handleLoadMore = useLastCallback(({ offsetId }: { offsetId?: string | number }) => {
    if (source?.type === 'savedMusic') {
      const isBottomEdge = offsetId === undefined || offsetId === displayedIds?.[displayedIds.length - 1];
      if (isBottomEdge && !isSavedMusicFullyLoaded) {
        loadSavedMusic({ userId: source.peerId });
      }
      return;
    }

    if (source?.type === 'globalSearch') {
      searchMessagesGlobal({ type: source.mediaType });
      return;
    }

    loadMoreChatTracks(LoadMoreDirection.Backwards);
  });

  const [viewportIds, getMore] = useInfiniteScroll(
    handleLoadMore, displayedIds, !isOpen, undefined, currentKey,
  );

  const handleScrollLoadMore = useLastCallback((
    { direction, noScroll }: { direction: LoadMoreDirection; noScroll?: boolean },
  ) => {
    getMore?.({ direction, noScroll });

    if (direction === LoadMoreDirection.Forwards) {
      loadMoreChatTracks(LoadMoreDirection.Forwards);
    }
  });

  useEffect(() => {
    if (!isOpen || source?.type !== 'chat' || messageId === undefined) return;

    searchChatMediaMessages({
      chatId: source.chatId,
      threadId: source.threadId,
      mediaType: source.mediaType,
      currentMediaMessageId: messageId,
      direction: LoadMoreDirection.Forwards,
    });
  }, [isOpen, source, messageId, searchChatMediaMessages]);

  useEffect(() => {
    if (!isOpen || source?.type !== 'savedMusic' || isSavedMusicFullyLoaded || playlistIds?.length) return;

    loadSavedMusic({ userId: source.peerId });
  }, [isOpen, source, isSavedMusicFullyLoaded, playlistIds, loadSavedMusic]);

  const hasAudioTrack = isAudioTrack || source?.type === 'savedMusic';

  useEffect(() => {
    if (!isOpen || !hasAudioTrack || isSavedMusicStatusLoaded) return;

    loadSavedMusicIds();
  }, [isOpen, hasAudioTrack, isSavedMusicStatusLoaded, loadSavedMusicIds]);

  const shouldShowModal = isOpen && isPlaylistLoaded && (!isAudioTrack || isSavedMusicStatusLoaded);

  const canReorder = Boolean(isOwnPlaylist && displayedIds && displayedIds.length > 1);

  const reorderableIds = useMemo(() => (
    canReorder ? (previewOrder || (displayedIds as string[])) : undefined
  ), [canReorder, previewOrder, displayedIds]);

  const handleReorder = useLastCallback((ids: string[], movedId?: string) => {
    if (movedId !== undefined) {
      const newIndex = ids.indexOf(movedId);
      reorderSavedMusic({
        audioId: movedId,
        afterAudioId: newIndex > 0 ? ids[newIndex - 1] : undefined,
      });
      return;
    }

    setPreviewOrder(ids);
  });

  const {
    draggedId,
    getRowProps,
    getDragElementProps,
    getHandleProps,
    getPlaceholderStyle,
    getDragStyle,
  } = useReorderableList({
    itemIds: reorderableIds || [],
    isDisabled: !canReorder,
    withAutoscroll: true,
    onReorder: handleReorder,
  });

  useEffect(() => {
    if (draggedId !== undefined) {
      lastDraggedIdRef.current = draggedId;
      return;
    }

    const movedId = lastDraggedIdRef.current;
    lastDraggedIdRef.current = undefined;
    if (!movedId || !previewOrder) return;

    setPreviewOrder(undefined);

    const newIndex = previewOrder.indexOf(movedId);
    if (newIndex < 0 || newIndex === displayedIds?.indexOf(movedId)) return;

    reorderSavedMusic({
      audioId: movedId,
      afterAudioId: newIndex > 0 ? previewOrder[newIndex - 1] : undefined,
    });
  }, [draggedId, previewOrder, displayedIds, reorderSavedMusic]);

  const handleTrackClick = useLastCallback((trackMessageId: number, trackChatId: string) => {
    if (source?.type === 'chat') {
      playbackController.prepareTrackSwitch(makeMessageTrackKey(source.chatId, trackMessageId));
      openAudioPlayer({
        item: {
          type: 'message', chatId: source.chatId, threadId: source.threadId, messageId: trackMessageId,
        },
      });
      return;
    }

    if (source?.type === 'globalSearch') {
      playbackController.prepareTrackSwitch(makeMessageTrackKey(trackChatId, trackMessageId));
      openAudioPlayer({
        item: {
          type: 'message', chatId: trackChatId, threadId: MAIN_THREAD_ID, messageId: trackMessageId,
        },
      });
    }
  });

  function renderMessageTrack(trackId: PlaylistKey) {
    const parsedKey = isSearchResultKey(trackId) ? parseSearchResultKey(trackId) : undefined;
    const trackChatId = parsedKey ? parsedKey[0] : chatId;
    const trackMessageId = parsedKey ? parsedKey[1] : trackId;
    if (!trackChatId || typeof trackMessageId !== 'number') return undefined;

    return (
      <PlaylistTrack
        chatId={trackChatId}
        messageId={trackMessageId}
        threadId={source?.type === 'chat' ? source.threadId : undefined}
        playbackSource={source!}
        onPlay={handleTrackClick}
      />
    );
  }

  function renderRichMessageTrack(trackId: PlaylistKey) {
    const track = typeof trackId === 'string' ? richMessageTracks?.get(trackId) : undefined;
    if (!track || source?.type !== 'richMessage') return undefined;

    return (
      <PlayableAudio
        audio={track.audio}
        item={track.item}
        source={source}
        variant="sharedMedia"
        noProgress
        withPlayingRing
        canDownload={!isRichMessageProtected}
      />
    );
  }

  function renderSavedMusicTrack(trackId: PlaylistKey) {
    if (source?.type !== 'savedMusic') return undefined;

    const trackAudio = typeof trackId === 'string' ? savedMusicById?.[trackId] : undefined;
    if (!trackAudio) return undefined;

    return (
      <ProfileMusic
        audio={trackAudio}
        peerId={source.peerId}
        noProgress
        withPlayingRing
      />
    );
  }

  const handlePlayPause = useLastCallback(() => {
    ensureAudioContext();
    playbackController.togglePlayPause();
  });

  const revealedForRef = useRef<PlaylistKey>();
  useEffect(() => {
    if (!shouldShowModal || currentKey === undefined) {
      revealedForRef.current = undefined;
      return;
    }
    if (revealedForRef.current === currentKey || !viewportIds) return;

    revealedForRef.current = currentKey;
    const list = scrollRef.current;
    const element = list?.querySelector<HTMLElement>(`[data-track-id="${currentKey}"]`);
    if (!list || !element) return;

    requestMeasure(() => {
      const listRect = list.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = list.scrollTop + elementRect.top - listRect.top - (listRect.height - elementRect.height) / 2;

      requestMutation(() => {
        list.scrollTop = scrollTop;
      });
    });
  }, [shouldShowModal, currentKey, viewportIds]);

  function renderTrack(trackId: PlaylistKey) {
    switch (source?.type) {
      case 'savedMusic':
        return renderSavedMusicTrack(trackId);
      case 'richMessage':
        return renderRichMessageTrack(trackId);
      default:
        return renderMessageTrack(trackId);
    }
  }

  const hasList = Boolean(displayedIds && displayedIds.length > 1);

  const title = source?.type === 'savedMusic'
    ? (isOwnPlaylist
      ? lang('PlaylistYourTitle')
      : lang('PlaylistTitle', { peer: playlistPeer ? getPeerTitle(lang, playlistPeer) : '' }))
    : lang('Playlist');

  function renderSortableTracks() {
    const windowIds = new Set(viewportIds);
    // The dragged row stays rendered even when the viewport window moves past it,
    // otherwise its placeholder and drag element unmount mid-drag and the drop is lost
    const renderedIds = reorderableIds!.filter((id) => windowIds.has(id) || id === draggedId);

    return renderedIds.map((id) => {
      const rowProps = getRowProps(id);
      const handleProps = getHandleProps(id);
      const dragElementProps = getDragElementProps(id);

      return (
        <div
          key={id}
          ref={rowProps.ref}
          className={buildClassName(
            styles.trackRow,
            id === currentKey && styles.activeTrackRow,
            'scroll-item',
          )}
          style={getPlaceholderStyle(id)}
          data-track-id={id}
        >
          <div
            ref={dragElementProps.ref}
            style={getDragStyle(id)}
            className={buildClassName(styles.reorderRow, draggedId === id && styles.draggedRow)}
          >
            {renderSavedMusicTrack(id)}
            <div
              ref={handleProps.ref}
              className={styles.dragHandle}
              role={handleProps.role}
              tabIndex={handleProps.tabIndex}
              aria-label={lang('DragToSortAria')}
              onMouseDown={handleProps.onMouseDown}
              onTouchStart={handleProps.onTouchStart}
              onKeyDown={handleProps.onKeyDown}
            >
              <Icon name="hamburger" className={styles.dragHandleIcon} />
            </div>
          </div>
        </div>
      );
    });
  }

  return (
    <Modal
      isOpen={shouldShowModal}
      className={styles.modal}
      contentClassName={styles.content}
      title={title}
      hasCloseButton
      isCondensedHeader
      onClose={closeAudioPlaylistModal}
    >
      {hasList && (
        <Island className={styles.listIsland}>
          <InfiniteScroll
            ref={scrollRef}
            items={viewportIds}
            itemSelector=".scroll-item"
            onLoadMore={handleScrollLoadMore}
            className={buildClassName('custom-scroll', styles.list)}
          >
            {canReorder ? renderSortableTracks() : viewportIds?.map((trackId) => (
              <div
                key={trackId}
                className={buildClassName(
                  styles.trackRow,
                  trackId === currentKey && styles.activeTrackRow,
                  'scroll-item',
                )}
                data-track-id={trackId}
              >
                {renderTrack(trackId)}
              </div>
            ))}
          </InfiniteScroll>
        </Island>
      )}

      <PlaylistControls
        isPlaying={isPlaying}
        duration={duration}
        onPlayPause={handlePlayPause}
        onSeek={playbackController.seek}
      />
    </Modal>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): Complete<StateProps> => {
    const { activeItem } = selectTabState(global).audioPlayer;
    const chatId = activeItem?.type === 'message' ? activeItem.chatId : undefined;
    const messageId = activeItem?.type === 'message' ? activeItem.messageId : undefined;
    const source = selectPlaybackSource(global);
    const savedMusic = source?.type === 'savedMusic' ? selectUserSavedMusic(global, source.peerId) : undefined;
    const currentMedia = selectPlaybackMedia(global, selectPlaybackItem(global));
    const richMessage = source?.type === 'richMessage'
      ? selectChatMessageOrEphemeral(global, source.chatId, source.messageId) : undefined;

    return {
      source,
      chatId,
      messageId,
      currentKey: selectCurrentPlaylistKey(global),
      playlistIds: selectPlaylistKeys(global),
      savedMusicById: savedMusic?.byId,
      isSavedMusicFullyLoaded: savedMusic?.isFullyLoaded,
      playlistPeer: source?.type === 'savedMusic' ? selectPeer(global, source.peerId) : undefined,
      isOwnPlaylist: source?.type === 'savedMusic' && source.peerId === global.currentUserId,
      isPlaylistLoaded: source?.type !== 'savedMusic' || Boolean(savedMusic?.isLoaded),
      isAudioTrack: currentMedia?.mediaType === 'audio',
      isSavedMusicStatusLoaded: Boolean(global.users.savedMusicById),
      richMessageAudioById: source?.type === 'richMessage'
        ? selectRichMessageAudios(global, source.chatId, source.messageId)?.byId : undefined,
      isRichMessageProtected: richMessage && selectIsMessageProtected(global, richMessage),
    };
  },
)(AudioPlaylistModal));
