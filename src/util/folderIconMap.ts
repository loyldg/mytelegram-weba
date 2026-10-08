import type { IconName } from '../types/icons';

export const folderIconMap: Record<string, IconName> = {
  '🗂': 'folder-filled',
  '⭐': 'star-regular-filled',
  '🤖': 'folder-tabs-bot',
  '👥': 'group-filled',
  '👤': 'user-filled',
  '✅': 'comments',
  '📢': 'megaphone-filled',
  '💬': 'folder-tabs-chats',
};

export const emojiToFolderIcon = (emoji: string): IconName | undefined => {
  return folderIconMap[emoji];
};
