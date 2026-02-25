import { memo } from '../../lib/teact/teact';

import type { ApiStarGiftAttributeRarity } from '../../api/types';

import buildClassName from '../../util/buildClassName';
import { getGiftRarityTitle } from './helpers/gifts';

import useLang from '../../hooks/useLang';

import BadgeButton from './BadgeButton';

import styles from './GiftRarityBadge.module.scss';

type OwnProps = {
  rarity: ApiStarGiftAttributeRarity;
};

const GiftRarityBadge = ({ rarity }: OwnProps) => {
  const lang = useLang();

  return (
    <BadgeButton className={buildClassName(styles.root, rarity.type !== 'regular' && styles[rarity.type])}>
      {getGiftRarityTitle(lang, rarity)}
    </BadgeButton>
  );
};

export default memo(GiftRarityBadge);
