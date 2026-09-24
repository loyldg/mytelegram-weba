import type { ApiAudio, ApiInstantViewPage, ApiPageBlock } from '../../api/types';

import { buildCollectionByKey } from '../../util/iteratees';

export function getPageBlocksAudios(blocks: ApiPageBlock[]): ApiAudio[] {
  return blocks.flatMap((block) => {
    switch (block.type) {
      case 'audio':
        return [block.audio];
      case 'cover':
        return getPageBlocksAudios([block.cover]);
      case 'collage':
      case 'slideshow':
        return getPageBlocksAudios(block.items);
      case 'list':
      case 'orderedList':
        return block.items.flatMap((item) => (item.type === 'blocks' ? getPageBlocksAudios(item.blocks) : []));
      default:
        return 'blocks' in block ? getPageBlocksAudios(block.blocks) : [];
    }
  });
}

export function buildPageAudioById(page: ApiInstantViewPage): Record<string, ApiAudio> | undefined {
  const audios = getPageBlocksAudios(page.blocks);

  return audios.length ? buildCollectionByKey(audios, 'id') : undefined;
}
