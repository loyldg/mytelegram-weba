import type {
  ApiInlineButtonAction,
  ApiInputRichMessage,
  ApiKeyboardButton,
  ApiPageBlock,
  ApiRichButton,
  ApiRichText,
} from '../../api/types';

export const MAX_BUTTONS_PER_ROW = 8;

export function isButtonUnsupported(action: ApiKeyboardButton['action']) {
  return action.type === 'unsupported' || action.type === 'disabled'
    || (action.type === 'callback' && action.requiresPassword)
    || (action.type === 'switchBotInline' && Boolean(action.peerTypes?.length));
}

export function canAuthorButton(action: ApiInlineButtonAction) {
  return action.type === 'url' || action.type === 'userProfile' || action.type === 'copy' || action.type === 'disabled';
}

export function normalizeButtonText(text: ApiRichText): ApiRichText {
  switch (text.type) {
    case 'plain':
    case 'empty':
    case 'customEmoji':
      return text;
    case 'date':
      return { ...text, text: normalizeButtonText(text.text) };
    case 'concat':
      return { type: 'concat', texts: text.texts.map(normalizeButtonText) };
    case 'image':
      return { type: 'empty' };
    case 'math':
      return { type: 'plain', text: text.source };
    default:
      return normalizeButtonText(text.text);
  }
}

export function getRichMessageButtons(richMessage: ApiInputRichMessage) {
  const buttons: ApiRichButton[] = [];
  richMessage.blocks.forEach(visitBlock);
  return buttons;

  function visitText(text: ApiRichText) {
    if (text.type === 'button') buttons.push(text);
    if (text.type === 'concat') text.texts.forEach(visitText);
    else if ('text' in text && typeof text.text === 'object') visitText(text.text);
  }

  function visitBlock(block: ApiPageBlock) {
    if ('text' in block) visitText(block.text);
    if ('title' in block && typeof block.title === 'object') visitText(block.title);
    if ('caption' in block) {
      if ('type' in block.caption) visitText(block.caption);
      else {
        visitText(block.caption.text);
        visitText(block.caption.credit);
      }
    }
    if ('blocks' in block) block.blocks.forEach(visitBlock);
    if (block.type === 'buttonRow') {
      buttons.push(...block.buttons);
    } else if (block.type === 'list' || block.type === 'orderedList') {
      block.items.forEach((item) => {
        if (item.type === 'text') visitText(item.text);
        else item.blocks.forEach(visitBlock);
      });
    } else if (block.type === 'table') {
      block.rows.forEach((row) => row.cells.forEach((cell) => {
        if (cell.text) visitText(cell.text);
      }));
    }
  }
}
