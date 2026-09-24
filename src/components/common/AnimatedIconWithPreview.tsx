import { memo, useRef } from '../../lib/teact/teact';

import type { OwnProps as AnimatedIconProps } from './AnimatedIcon';

import buildClassName from '../../util/buildClassName';
import buildStyle from '../../util/buildStyle';

import useDynamicColorListener from '../../hooks/stickers/useDynamicColorListener';
import useFlag from '../../hooks/useFlag';
import useLastCallback from '../../hooks/useLastCallback';
import useMediaTransitionDeprecated from '../../hooks/useMediaTransitionDeprecated';

import AnimatedIcon from './AnimatedIcon';

import styles from './AnimatedIconWithPreview.module.scss';

type OwnProps =
  Partial<AnimatedIconProps>
  & {
    previewUrl?: string;
    thumbDataUri?: string;
    noPreviewTransition?: boolean;
    shouldUseTextColor?: boolean;
  };

const ANIMATION_DURATION = 300;

const loadedPreviewUrls = new Set();

function AnimatedIconWithPreview(props: OwnProps) {
  const {
    previewUrl, thumbDataUri, className, shouldUseTextColor, noPreviewTransition, ...otherProps
  } = props;

  const rootRef = useRef<HTMLDivElement>();
  const customColor = useDynamicColorListener(rootRef, undefined, !shouldUseTextColor);

  const [isThumbOpen, , unmarkThumbOpen] = useFlag(Boolean(thumbDataUri));
  const thumbClassNames = useMediaTransitionDeprecated(isThumbOpen);

  const [isPreviewOpen, markPreviewOpen, unmarkPreviewOpen] = useFlag(
    Boolean(noPreviewTransition) || loadedPreviewUrls.has(previewUrl),
  );
  const previewClassNames = useMediaTransitionDeprecated(isPreviewOpen);

  const [isAnimationReady, markAnimationReady] = useFlag(false);

  const handlePreviewLoad = useLastCallback(() => {
    markPreviewOpen();
    loadedPreviewUrls.add(previewUrl);
  });

  const handleAnimationReady = useLastCallback(() => {
    unmarkThumbOpen();
    unmarkPreviewOpen();
    setTimeout(markAnimationReady, ANIMATION_DURATION);
  });

  const { size } = props;

  return (
    <div
      ref={rootRef}
      className={buildClassName(className, styles.root)}
      style={buildStyle(size !== undefined && `width: ${size}px; height: ${size}px;`)}
    >
      {thumbDataUri && !isAnimationReady && (
        <img src={thumbDataUri} className={buildClassName(styles.preview, thumbClassNames)} draggable={false} />
      )}
      {previewUrl && !isAnimationReady && (shouldUseTextColor ? (
        <div
          className={buildClassName(styles.preview, styles.textColorPreview)}
          style={`mask-image: url(${previewUrl})`}
        />
      ) : (
        <img
          src={previewUrl}
          className={buildClassName(styles.preview, !noPreviewTransition && previewClassNames)}
          draggable={false}
          onLoad={handlePreviewLoad}
        />
      ))}
      {/* Without a color the sticker canvas would paint the original tgs colors before the filter appears */}
      {(!shouldUseTextColor || customColor) && (
        <AnimatedIcon {...otherProps} color={customColor} onLoad={handleAnimationReady} />
      )}
    </div>
  );
}

export default memo(AnimatedIconWithPreview);
