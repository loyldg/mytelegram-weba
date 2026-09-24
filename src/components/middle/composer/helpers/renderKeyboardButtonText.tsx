import { type TeactNode } from '../../../../lib/teact/teact';

import type { ApiKeyboardButton } from '../../../../api/types';
import type { LangFn } from '../../../../util/localization';

import { STARS_ICON_PLACEHOLDER } from '../../../../config';
import { replaceWithTeact } from '../../../../util/replaceWithTeact';
import renderText from '../../../common/helpers/renderText';

import Icon from '../../../common/icons/Icon';

export default function renderKeyboardButtonText(
  lang: LangFn,
  button: ApiKeyboardButton,
  isReceipt?: boolean,
): TeactNode {
  if (button.action.type === 'buy' && isReceipt) {
    return lang('PaymentReceipt');
  }

  if (button.action.type === 'buy') {
    return replaceWithTeact(button.text, STARS_ICON_PLACEHOLDER, <Icon name="star" />);
  }

  return renderText(button.text);
}
