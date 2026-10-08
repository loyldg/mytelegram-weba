import type { FC } from '../../../../lib/teact/teact';
import { memo, useCallback } from '../../../../lib/teact/teact';

import { STICKER_SIZE_PASSCODE } from '../../../../config';
import { LOCAL_TGS_URLS } from '../../../common/helpers/animatedAssets';

import useHistoryBack from '../../../../hooks/useHistoryBack';
import useLang from '../../../../hooks/useLang';

import AnimatedIcon from '../../../common/AnimatedIcon';
import Island from '../../../gili/layout/Island';
import Button from '../../../ui/Button';

type OwnProps = {
  isActive?: boolean;
  onReset: (forceReturnToChatList?: boolean) => void;
};

const SettingsPasscodeCongratulations: FC<OwnProps> = ({
  isActive, onReset,
}) => {
  const lang = useLang();

  const fullReset = useCallback(() => {
    onReset(true);
  }, [onReset]);

  useHistoryBack({ isActive, onBack: onReset });

  return (
    <div className="settings-content local-passcode custom-scroll">
      <div className="settings-content-header no-border">
        <AnimatedIcon
          size={STICKER_SIZE_PASSCODE}
          tgsUrl={LOCAL_TGS_URLS.Congratulations}
          className="settings-content-icon"
        />

        <p className="settings-item-description mb-3" dir="auto">
          {lang('SettingsPasscodeSuccess', undefined, { withNodes: true, renderTextFilters: ['br'] })}
        </p>
      </div>

      <Island>
        <Button onClick={fullReset}>{lang('Back')}</Button>
      </Island>
    </div>
  );
};

export default memo(SettingsPasscodeCongratulations);
