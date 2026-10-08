import type { OrderMode, RepeatMode } from '../../../types';
import type { IconName } from '../../../types/icons';

export const ORDER_BUTTON_ICONS: IconName[] = [
  'order', 'shuffle', 'repeat', 'repeat-one', 'repeat-order', 'repeat-shuffle',
];

export function getOrderButtonIcon(orderMode: OrderMode, repeatMode: RepeatMode): IconName {
  if (repeatMode === 'one') return 'repeat-one';
  if (orderMode === 'shuffle') return repeatMode === 'all' ? 'repeat-shuffle' : 'shuffle';
  if (orderMode === 'reverse') return repeatMode === 'all' ? 'repeat-order' : 'order';
  return repeatMode === 'all' ? 'repeat' : 'order';
}
