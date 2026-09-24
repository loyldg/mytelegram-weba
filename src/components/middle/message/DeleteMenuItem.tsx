import { memo } from '../../../lib/teact/teact';

import { getServerTime } from '../../../util/serverTime';

import useForceUpdate from '../../../hooks/useForceUpdate';
import useLang from '../../../hooks/useLang';

import Icon from '../../common/icons/Icon';
import MenuItem, { MenuItemSubtitle, MenuItemTitle } from '../../ui/MenuItem';
import TextTimer from '../../ui/TextTimer';

type OwnProps = {
  autoDeleteAt?: number;
  onDelete?: NoneToVoidFunction;
};

function DeleteMenuItem({ autoDeleteAt, onDelete }: OwnProps) {
  const forceUpdate = useForceUpdate();
  const lang = useLang();

  const hasAutoDeleteTimer = Boolean(autoDeleteAt && autoDeleteAt > getServerTime());

  return (
    <MenuItem destructive icon="delete" onClick={onDelete}>
      <MenuItemTitle>{lang('Delete')}</MenuItemTitle>
      {hasAutoDeleteTimer && (
        <MenuItemSubtitle>
          <Icon name="timer" className="in-text-icon" />
          {lang('AutoDeleteIn', {
            time: <TextTimer endsAt={autoDeleteAt!} mode="rounded" onEnd={forceUpdate} />,
          }, { withNodes: true })}
        </MenuItemSubtitle>
      )}
    </MenuItem>
  );
}

export default memo(DeleteMenuItem);
