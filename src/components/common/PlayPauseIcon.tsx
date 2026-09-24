import { memo, useRef, useState } from '../../lib/teact/teact';

import { LOCAL_TGS_PREVIEW_URLS, LOCAL_TGS_URLS } from './helpers/animatedAssets';

import useSyncEffect from '../../hooks/useSyncEffect';

import AnimatedIconWithPreview from './AnimatedIconWithPreview';

type OwnProps = {
  isPlaying: boolean;
  size?: number;
  className?: string;
  // Skips playback synchronization after mounting
  shouldSkipInitialTransition?: boolean;
  // Resets the icon to its current idle frame while hidden
  isTransitionDisabled?: boolean;
};

const IDLE_PLAY: [number, number] = [0, 0];
const IDLE_PAUSE: [number, number] = [41, 41];
const TO_PAUSE: [number, number] = [0, 41];
const TO_PLAY: [number, number] = [41, 83];
const SPEED = 2;
const DEFAULT_SIZE = 40;

const PlayPauseIcon = ({
  isPlaying, size = DEFAULT_SIZE, className, shouldSkipInitialTransition, isTransitionDisabled,
}: OwnProps) => {
  const idleSegment = isPlaying ? IDLE_PAUSE : IDLE_PLAY;
  const [segment, setSegment] = useState<[number, number]>(idleSegment);
  // Mounting with `isPlaying=true` means playback is settled, so the next change is a real user toggle
  const hasStateChangedRef = useRef(isPlaying);

  useSyncEffect(([prevIsPlaying, wasTransitionDisabled]) => {
    if (isTransitionDisabled || wasTransitionDisabled) {
      setSegment(idleSegment);
      hasStateChangedRef.current = isPlaying;
      return;
    }

    if (prevIsPlaying === undefined || prevIsPlaying === isPlaying) return;

    const shouldAnimate = !shouldSkipInitialTransition || hasStateChangedRef.current;
    setSegment(shouldAnimate ? (isPlaying ? TO_PAUSE : TO_PLAY) : idleSegment);
    hasStateChangedRef.current = true;
  }, [isPlaying, isTransitionDisabled, idleSegment, shouldSkipInitialTransition]);

  return (
    <AnimatedIconWithPreview
      tgsUrl={LOCAL_TGS_URLS.PlayPause}
      previewUrl={isPlaying ? LOCAL_TGS_PREVIEW_URLS.PlayPausePaused : LOCAL_TGS_PREVIEW_URLS.PlayPause}
      className={className}
      size={size}
      play={segment.toString()}
      playSegment={segment}
      speed={SPEED}
      noLoop
      nonInteractive
      forceAlways
      shouldUseTextColor
      noPreviewTransition
    />
  );
};

export default memo(PlayPauseIcon);
