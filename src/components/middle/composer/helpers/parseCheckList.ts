import type { ApiInputRichMessage, ApiPageBlock } from '../../../../api/types';

import { getRichTextPlainText } from '../../../../global/helpers/richMessage';

export type ParsedCheckList = {
  title?: string;
  items: string[];
};

type CheckListLimits = {
  maxItemsCount: number;
  maxTitleLength: number;
  maxItemLength: number;
};

// Matches a single list line, e.g. `- Task`, `• Task`, `2) Task`, `3. [x] Task`
const LIST_ITEM_PATTERN = /^(?:[-–—•*·‣▪]|\d{1,3}[.)])\s+(?:\[[ xX]\]\s+)?(.+)$/;
const LINE_BREAKS_PATTERN = /\s*\n\s*/g;
const MIN_TEXT_ITEMS_COUNT = 2;
const MAX_TITLE_LINES_COUNT = 1;

export function parseCheckList(
  richMessage: ApiInputRichMessage, limits: CheckListLimits,
): ParsedCheckList | undefined {
  const hasListBlocks = richMessage.blocks.some((block) => block.type === 'list' || block.type === 'orderedList');

  const checkList = hasListBlocks
    ? parseCheckListFromListBlocks(richMessage.blocks)
    : parseCheckListFromText(richMessage.blocks);

  // A checklist over the limits would be silently truncated, losing part of the source text
  return checkList && isCheckListWithinLimits(checkList, limits) ? checkList : undefined;
}

function isCheckListWithinLimits(checkList: ParsedCheckList, limits: CheckListLimits): boolean {
  return checkList.items.length <= limits.maxItemsCount
    && (!checkList.title || checkList.title.length <= limits.maxTitleLength)
    && checkList.items.every((item) => item.length <= limits.maxItemLength);
}

function parseCheckListFromListBlocks(blocks: ApiPageBlock[]): ParsedCheckList | undefined {
  let title: string | undefined;
  let hasListStarted = false;
  const items: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.type === 'paragraph') {
      const text = getRichTextPlainText(block.text).replace(LINE_BREAKS_PATTERN, ' ').trim();
      if (!text) {
        continue;
      }

      if (hasListStarted || title !== undefined) {
        return undefined;
      }

      title = text;
      continue;
    }

    if (block.type === 'list' || block.type === 'orderedList') {
      hasListStarted = true;
      for (let j = 0; j < block.items.length; j++) {
        const item = block.items[j];
        if (item.type !== 'text') {
          return undefined;
        }

        const itemText = getRichTextPlainText(item.text).replace(LINE_BREAKS_PATTERN, ' ').trim();
        if (itemText) {
          items.push(itemText);
        }
      }
      continue;
    }

    return undefined;
  }

  return items.length ? { title, items } : undefined;
}

function parseCheckListFromText(blocks: ApiPageBlock[]): ParsedCheckList | undefined {
  const lines: string[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type !== 'paragraph') {
      return undefined;
    }

    lines.push(...getRichTextPlainText(block.text).split('\n'));
  }

  const cleanLines = lines.map((line) => line.trim()).filter(Boolean);

  const firstItemIndex = cleanLines.findIndex((line) => LIST_ITEM_PATTERN.test(line));
  if (firstItemIndex === -1 || firstItemIndex > MAX_TITLE_LINES_COUNT) {
    return undefined;
  }

  const items: string[] = [];
  for (let i = firstItemIndex; i < cleanLines.length; i++) {
    const itemText = cleanLines[i].match(LIST_ITEM_PATTERN)?.[1].trim();
    if (!itemText) {
      return undefined;
    }

    items.push(itemText);
  }

  if (items.length < MIN_TEXT_ITEMS_COUNT) {
    return undefined;
  }

  return {
    title: firstItemIndex ? cleanLines[0] : undefined,
    items,
  };
}
