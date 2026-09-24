import { memo } from '../../lib/teact/teact';
import { getActions, withGlobal } from '../../global';

import type { ApiAudio, ApiMessage } from '../../api/types';
import type {
  AudioVariant, PlaybackItemRef, PlaybackSource, ThemeKey,
} from '../../types';
import type { MenuItemContextAction } from '../ui/ListItem';
import { ApiMediaFormat } from '../../api/types';

import { getIsDownloading, getMediaFormat, getMediaHash } from '../../global/helpers';
import { selectActiveDownloads, selectTheme } from '../../global/selectors';
import {
  getPlaybackCapabilities, makeTrackKeyFromItem, selectPlaybackMessage,
} from '../../global/selectors/audioPlayer';
import { prepareTrackSwitch } from '../../util/audioPlayback/playbackController';

import useLastCallback from '../../hooks/useLastCallback';
import useMedia from '../../hooks/useMedia';
import useMediaWithLoadProgress from '../../hooks/useMediaWithLoadProgress';

import TrackRow from './TrackRow';

type OwnProps = {
  audio: ApiAudio;
  item: PlaybackItemRef;
  source: PlaybackSource;
  variant: AudioVariant;
  className?: string;
  isOwn?: boolean;
  noProgress?: boolean;
  withPlayingRing?: boolean;
  canDownload?: boolean;
  contextActions?: MenuItemContextAction[];
};

type StateProps = {
  originMessage?: ApiMessage;
  theme: ThemeKey;
  isDownloading: boolean;
};

const PlayableAudio = ({
  audio,
  item,
  source,
  variant,
  className,
  isOwn,
  noProgress,
  withPlayingRing,
  canDownload,
  contextActions,
  originMessage,
  theme,
  isDownloading,
}: OwnProps & StateProps) => {
  const { openAudioPlayer, downloadMedia, cancelMediaDownload } = getActions();

  const trackKey = makeTrackKeyFromItem(item);

  const coverBlobUrl = useMedia(getMediaHash(audio, 'pictogram'), false, ApiMediaFormat.BlobUrl);
  const mediaData = useMedia(getMediaHash(audio, 'inline'), false, getMediaFormat(audio, 'inline'));

  const { loadProgress: downloadProgress } = useMediaWithLoadProgress(
    getMediaHash(audio, 'download'),
    !isDownloading,
    getMediaFormat(audio, 'download'),
  );

  const handleBeforePlay = useLastCallback(() => {
    prepareTrackSwitch(trackKey);
    openAudioPlayer({ item, source });
  });

  const handleDownloadClick = useLastCallback(() => {
    if (isDownloading) {
      cancelMediaDownload({ media: audio });
    } else {
      downloadMedia({ media: audio, originMessage });
    }
  });

  return (
    <TrackRow
      theme={theme}
      variant={variant}
      className={className}
      audio={audio}
      trackKey={trackKey}
      mediaType="audio"
      capabilities={getPlaybackCapabilities(item.type)}
      src={mediaData}
      originalDuration={audio.duration}
      coverBlobUrl={coverBlobUrl}
      isOwn={isOwn}
      noProgress={noProgress}
      withPlayingRing={withPlayingRing}
      isDownloading={isDownloading}
      canDownload={canDownload}
      downloadProgress={downloadProgress}
      contextActions={contextActions}
      onBeforePlay={handleBeforePlay}
      onDownloadClick={handleDownloadClick}
    />
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { audio, item }): Complete<StateProps> => {
    return {
      originMessage: selectPlaybackMessage(global, item),
      theme: selectTheme(global),
      isDownloading: getIsDownloading(selectActiveDownloads(global), audio),
    };
  },
)(PlayableAudio));
