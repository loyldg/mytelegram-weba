import type { FC } from '../../lib/teact/teact';
import React, { memo, useCallback } from '../../lib/teact/teact';
import { getActions, withGlobal } from '../../global';

import type { ApiMessage } from '../../api/types';
import type { IAlbum } from '../../types';

import {
  getPrivateChatUserId,
  getUserFirstOrLastName,
  isChatBasicGroup,
  isChatSuperGroup,
  isUserId,
} from '../../global/helpers';
import {
  selectAllowedMessageActions,
  selectBot,
  selectChat,
  selectCurrentMessageList,
  selectUser,
} from '../../global/selectors';
import renderText from './helpers/renderText';

import useOldLang from '../../hooks/useOldLang';

import Button from '../ui/Button';
import Modal from '../ui/Modal';

export type OwnProps = {
  isOpen: boolean;
  isSchedule: boolean;
  message: ApiMessage;
  album?: IAlbum;
  onClose: NoneToVoidFunction;
  onConfirm?: NoneToVoidFunction;
};

type StateProps = {
  canDeleteForAll?: boolean;
  contactName?: string;
  willDeleteForCurrentUserOnly?: boolean;
  willDeleteForAll?: boolean;
};

const DeleteMessageModal: FC<OwnProps & StateProps> = ({
  isOpen,
  isSchedule,
  message,
  album,
  canDeleteForAll,
  contactName,
  willDeleteForCurrentUserOnly,
  willDeleteForAll,
  onConfirm,
  onClose,
}) => {
  const {
    deleteMessages,
    deleteScheduledMessages,
  } = getActions();

  const handleDeleteMessageForAll = useCallback(() => {
    onConfirm?.();
    const messageIds = album?.messages
      ? album.messages.map(({ id }) => id)
      : [message.id];
    deleteMessages({ messageIds, shouldDeleteForAll: true });
    onClose();
  }, [onConfirm, album, message.id, deleteMessages, onClose]);

  const handleDeleteMessageForSelf = useCallback(() => {
    onConfirm?.();
    const messageIds = album?.messages
      ? album.messages.map(({ id }) => id)
      : [message.id];
    if (isSchedule) {
      deleteScheduledMessages({ messageIds });
    } else {
      deleteMessages({
        messageIds,
        shouldDeleteForAll: false,
      });
    }
    onClose();
  }, [onConfirm, album, message.id, isSchedule, onClose, deleteScheduledMessages, deleteMessages]);

  const lang = useOldLang();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onEnter={isOpen && !canDeleteForAll ? handleDeleteMessageForSelf : undefined}
      className="delete"
      title={lang('DeleteSingleMessagesTitle')}
    >
      <p>{lang('AreYouSureDeleteSingleMessage')}</p>
      {willDeleteForCurrentUserOnly && (
        <p>{lang('lng_delete_for_me_chat_hint', 1, 'i')}</p>
      )}
      {willDeleteForAll && (
        <p>{lang('lng_delete_for_everyone_hint', 1, 'i')}</p>
      )}
      <div className={canDeleteForAll ? 'dialog-buttons-column' : 'dialog-buttons'}>
        {canDeleteForAll && (
          <Button color="danger" className="confirm-dialog-button" isText onClick={handleDeleteMessageForAll}>
            {contactName && renderText(lang('Conversation.DeleteMessagesFor', contactName))}
            {!contactName && lang('Conversation.DeleteMessagesForEveryone')}
          </Button>
        )}
        <Button color="danger" className="confirm-dialog-button" isText onClick={handleDeleteMessageForSelf}>
          {lang(canDeleteForAll ? 'ChatList.DeleteForCurrentUser' : 'Delete')}
        </Button>
        <Button className="confirm-dialog-button" isText onClick={onClose}>{lang('Cancel')}</Button>
      </div>
    </Modal>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { message, isSchedule }): StateProps => {
    const { threadId } = selectCurrentMessageList(global) || {};
    const { canDeleteForAll } = (threadId && selectAllowedMessageActions(global, message, threadId)) || {};
    const chat = selectChat(global, message.chatId);
    const contactName = chat && isUserId(chat.id)
      ? getUserFirstOrLastName(selectUser(global, getPrivateChatUserId(chat)!))
      : undefined;
    const isChatWithBot = Boolean(selectBot(global, message.chatId));

    const willDeleteForCurrentUserOnly = (chat && isChatBasicGroup(chat) && !canDeleteForAll) || isChatWithBot;
    const willDeleteForAll = chat && isChatSuperGroup(chat);

    return {
      canDeleteForAll: !isSchedule && canDeleteForAll,
      contactName,
      willDeleteForCurrentUserOnly,
      willDeleteForAll,
    };
  },
)(DeleteMessageModal));
