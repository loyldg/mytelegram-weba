import { memo, useEffect, useMemo } from '../../lib/teact/teact';
import { withGlobal } from '../../global';

import type { ApiAttachment, ApiAudio } from '../../api/types';
import type { ThemeKey } from '../../types';

import { selectTheme } from '../../global/selectors';
import { DRAFT_CAPABILITIES } from '../../global/selectors/audioPlayer';
import { makeDraftTrackKey, peek } from '../../util/audioPlayback/mediaPool';
import { stopTransientTrack } from '../../util/audioPlayback/playbackController';

import useFlag from '../../hooks/useFlag';

import TrackRow from './TrackRow';

type OwnProps = {
  attachment: ApiAttachment;
  className?: string;
  onDecodeError?: NoneToVoidFunction;
};

type StateProps = {
  theme: ThemeKey;
};

const AttachmentAudio = ({
  attachment, className, theme, onDecodeError,
}: OwnProps & StateProps) => {
  const trackKey = makeDraftTrackKey(attachment.uniqueId);
  const [hasStarted, markStarted] = useFlag();

  const audio = useMemo<ApiAudio>(() => ({
    mediaType: 'audio',
    id: attachment.uniqueId,
    size: attachment.size,
    mimeType: attachment.mimeType,
    fileName: attachment.filename,
    duration: attachment.audio?.duration || 0,
    title: attachment.audio?.title,
    performer: attachment.audio?.performer,
  }), [attachment]);

  useEffect(() => {
    if (!hasStarted || !onDecodeError) return undefined;

    const element = peek(trackKey);
    if (!element) return undefined;

    if (element.error) {
      onDecodeError();
      return undefined;
    }

    const handleError = () => onDecodeError();
    element.addEventListener('error', handleError);

    return () => element.removeEventListener('error', handleError);
  }, [hasStarted, trackKey, onDecodeError]);

  useEffect(() => {
    return () => stopTransientTrack(trackKey);
  }, [trackKey]);

  return (
    <TrackRow
      theme={theme}
      variant="attachment"
      className={className}
      audio={audio}
      trackKey={trackKey}
      mediaType="audio"
      capabilities={DRAFT_CAPABILITIES}
      src={attachment.blobUrl}
      originalDuration={audio.duration}
      coverBlobUrl={attachment.previewBlobUrl}
      onBeforePlay={markStarted}
    />
  );
};

export default memo(withGlobal<OwnProps>(
  (global): Complete<StateProps> => {
    return {
      theme: selectTheme(global),
    };
  },
)(AttachmentAudio));
