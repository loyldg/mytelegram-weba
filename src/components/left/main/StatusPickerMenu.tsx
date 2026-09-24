import type { ElementRef } from '../../../lib/teact/teact';
import {
  memo, useCallback, useEffect, useRef,
} from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type { ApiSticker } from '../../../api/types';

import { selectIsContextMenuTranslucent } from '../../../global/selectors';
import { IS_TUCK_SUPPORTED } from '../../../util/browser/windowEnvironment';

import useTuckFilter from '../../../hooks/useTuckFilter';

import CustomEmojiPicker from '../../common/CustomEmojiPicker';
import Menu from '../../ui/Menu';
import Portal from '../../ui/Portal';

import styles from './StatusPickerMenu.module.scss';

export type OwnProps = {
  isOpen: boolean;
  statusButtonRef: ElementRef<HTMLButtonElement>;
  onEmojiStatusSelect: (emojiStatus: ApiSticker) => void;
  onClose: () => void;
};

interface StateProps {
  areFeaturedStickersLoaded?: boolean;
  isTranslucent?: boolean;
}

const FILTER_ID = 'status-picker-tuck-filter';

const StatusPickerMenu = ({
  isOpen,
  statusButtonRef,
  areFeaturedStickersLoaded,
  isTranslucent,
  onEmojiStatusSelect,
  onClose,
}: OwnProps & StateProps) => {
  const { loadFeaturedEmojiStickers } = getActions();

  const transformOriginXRef = useRef<number>(0);
  const pickerListStyle = useTuckFilter(FILTER_ID);

  useEffect(() => {
    if (!statusButtonRef.current) return;
    transformOriginXRef.current = statusButtonRef.current.getBoundingClientRect().right;
  }, [isOpen, statusButtonRef]);

  useEffect(() => {
    if (isOpen && !areFeaturedStickersLoaded) {
      loadFeaturedEmojiStickers();
    }
  }, [areFeaturedStickersLoaded, isOpen, loadFeaturedEmojiStickers]);

  const handleEmojiSelect = useCallback((sticker: ApiSticker) => {
    onEmojiStatusSelect(sticker);
    onClose();
  }, [onClose, onEmojiStatusSelect]);

  return (
    <Portal>
      <Menu
        isOpen={isOpen}
        noCompact
        positionX="left"
        bubbleClassName={styles.menuContent}
        onClose={onClose}
        transformOriginX={transformOriginXRef.current}
      >
        <CustomEmojiPicker
          idPrefix="status-emoji-set-"
          className={IS_TUCK_SUPPORTED ? styles.extendedPicker : undefined}
          pickerListStyle={pickerListStyle}
          loadAndPlay={isOpen}
          isHidden={!isOpen}
          isStatusPicker
          isTuckEnabled={IS_TUCK_SUPPORTED}
          isTranslucent={isTranslucent}
          onDismiss={onClose}
          onCustomEmojiSelect={handleEmojiSelect}
        />
      </Menu>
    </Portal>
  );
};

export default memo(withGlobal<OwnProps>((global): Complete<StateProps> => {
  return {
    areFeaturedStickersLoaded: Boolean(global.customEmojis.featuredIds?.length),
    isTranslucent: selectIsContextMenuTranslucent(global),
  };
})(StatusPickerMenu));
