import { memo, useMemo } from '../../lib/teact/teact';
import { getActions, withGlobal } from '../../global';

import type { ApiAudio } from '../../api/types';
import type { PlaybackItemRef, PlaybackSource } from '../../types';
import type { MenuItemContextAction } from '../ui/ListItem';

import { getIsDownloading } from '../../global/helpers';
import { selectActiveDownloads } from '../../global/selectors';

import useLang from '../../hooks/useLang';
import useLastCallback from '../../hooks/useLastCallback';

import PlayableAudio from './PlayableAudio';

type OwnProps = {
  audio: ApiAudio;
  peerId: string;
  className?: string;
  noProgress?: boolean;
  withPlayingRing?: boolean;
};

type StateProps = {
  isDownloading: boolean;
  isSaved?: boolean;
  isSavedMusicLoading?: boolean;
};

const ProfileMusic = ({
  audio,
  peerId,
  className,
  noProgress,
  withPlayingRing,
  isDownloading,
  isSaved,
  isSavedMusicLoading,
}: OwnProps & StateProps) => {
  const {
    cancelMediaDownload, downloadMedia, toggleMusicInProfile, openForwardMenu,
  } = getActions();

  const lang = useLang();

  const item = useMemo<PlaybackItemRef>(() => ({ type: 'savedMusic', peerId, audioId: audio.id }), [peerId, audio.id]);
  const source = useMemo<PlaybackSource>(() => ({ type: 'savedMusic', peerId }), [peerId]);

  const handleToggleInProfile = useLastCallback(() => {
    toggleMusicInProfile({ audio });
  });

  const handleDownloadClick = useLastCallback(() => {
    if (isDownloading) {
      cancelMediaDownload({ media: audio });
    } else {
      downloadMedia({ media: audio });
    }
  });

  const handleForward = useLastCallback(() => {
    openForwardMenu({ fromChatId: peerId, audioItem: item });
  });

  const contextActions = useMemo((): MenuItemContextAction[] => [{
    title: lang('Forward'),
    icon: 'forward',
    handler: handleForward,
  }, {
    title: isDownloading ? lang('ContextCancelDownload') : lang('MediaDownload'),
    icon: isDownloading ? 'stop' : 'download',
    handler: handleDownloadClick,
  }, {
    isSeparator: true,
  }, {
    title: lang(isSaved ? 'AudioRemoveFromProfile' : 'AudioAddToProfile'),
    icon: isSaved ? 'remove-music' : 'add-music',
    destructive: isSaved,
    handler: isSavedMusicLoading ? undefined : handleToggleInProfile,
  }], [lang, isDownloading, isSaved, isSavedMusicLoading]);

  return (
    <PlayableAudio
      audio={audio}
      item={item}
      source={source}
      variant="sharedMedia"
      className={className}
      noProgress={noProgress}
      withPlayingRing={withPlayingRing}
      canDownload
      contextActions={contextActions}
    />
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { audio }): Complete<StateProps> => {
    return {
      isDownloading: getIsDownloading(selectActiveDownloads(global), audio),
      isSaved: global.users.savedMusicById?.[audio.id],
      isSavedMusicLoading: global.users.isSavedMusicLoading,
    };
  },
)(ProfileMusic));
