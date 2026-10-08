import {
  memo, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type { ApiMessage, ApiNewMediaTodo } from '../../../api/types';
import type { TabState } from '../../../global/types/tabState';

import { requestMeasure } from '../../../lib/fasterdom/fasterdom';
import { selectChatMessage } from '../../../global/selectors';
import buildClassName from '../../../util/buildClassName';
import { generateUniqueNumberId } from '../../../util/generateUniqueId';
import { MEMO_EMPTY_ARRAY } from '../../../util/memo';

import useCurrentOrPrev from '../../../hooks/useCurrentOrPrev';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';
import useReorderableList from '../../../hooks/useReorderableList';

import Icon from '../../common/icons/Icon';
import Button from '../../ui/Button';
import InputText from '../../ui/InputText';
import Island, {
  IslandDescription,
  IslandTitle,
} from '@gili/layout/Island';
import Modal, {
  ModalCloseButton,
  ModalHeader,
  ModalHeaderAction,
  ModalTitle,
} from '@gili/modal/Modal';
import SwitchField from '@gili/templates/SwitchField';

import styles from './ToDoListModal.module.scss';

export type OwnProps = {
  modal: TabState['todoListModal'];
  onSend: (todoList: ApiNewMediaTodo) => void;
  onClear: () => void;
};

export type StateProps = {
  editingMessage?: ApiMessage;
  maxItemsCount: number;
  maxTitleLength: number;
  maxItemLength: number;
};

type TodoItem = {
  id: number;
  text: string;
  isFrozen?: boolean;
};

const ToDoListModal = ({
  modal,
  editingMessage,
  maxItemsCount,
  maxTitleLength,
  maxItemLength,
  onSend,
  onClear,
}: OwnProps & StateProps) => {
  const { editTodo, closeTodoListModal, appendTodoList } = getActions();

  const lang = useLang();

  const itemListRef = useRef<HTMLDivElement>();

  const [title, setTitle] = useState('');
  const [items, setItems] = useState<TodoItem[]>(() => [createTodoItem()]);
  const [isOthersCanComplete, setIsOthersCanComplete] = useState(true);
  const [isOthersCanAppend, setIsOthersCanAppend] = useState(true);

  const isOpen = Boolean(modal);
  const renderingModal = useCurrentOrPrev(modal);
  // Treat "Add task" as edit mode for own checklists
  const isAddTaskMode = Boolean(renderingModal?.forNewTask && !editingMessage?.isOutgoing);

  const editingTodo = editingMessage?.content.todo?.todo;
  const parsedCheckList = editingMessage ? undefined : renderingModal?.initialCheckList;

  const frozenItems = useMemo(() => {
    if (!isAddTaskMode || !editingTodo) {
      return MEMO_EMPTY_ARRAY;
    }

    return editingTodo.items.map((item): TodoItem => ({
      id: item.id,
      text: item.title.text,
      isFrozen: true,
    }));
  }, [isAddTaskMode, editingTodo]);

  const availableItemsCount = maxItemsCount - frozenItems.length;

  useLayoutEffect(() => {
    if (!editingTodo) {
      return;
    }

    setTitle(editingTodo.title.text);
    setIsOthersCanComplete(editingTodo.othersCanComplete ?? false);
    setIsOthersCanAppend(editingTodo.othersCanAppend ?? false);

    if (isAddTaskMode) {
      return;
    }

    const editingItems = editingTodo.items.map((item): TodoItem => ({
      id: item.id,
      text: item.title.text,
    }));
    setItems(normalizeItems(editingItems, maxItemsCount));
  }, [editingTodo, isAddTaskMode, maxItemsCount]);

  useLayoutEffect(() => {
    if (!isOpen || !parsedCheckList) {
      return;
    }

    setTitle(parsedCheckList.title || '');
    setItems(normalizeItems(parsedCheckList.items.map((text) => createTodoItem(text)), maxItemsCount));
  }, [isOpen, maxItemsCount, parsedCheckList]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setTitle('');
    setItems([createTodoItem()]);
    setIsOthersCanComplete(true);
    setIsOthersCanAppend(true);
  }, [isOpen]);

  const filledItems = useMemo(() => {
    return items.map((item) => ({
      id: item.id,
      text: item.text.trim().substring(0, maxItemLength),
    })).filter(({ text }) => Boolean(text));
  }, [items, maxItemLength]);

  const reorderableItemIds = useMemo(() => {
    return filledItems.map(({ id }) => id);
  }, [filledItems]);

  const renderingItems = useMemo(() => {
    return [...frozenItems, ...items];
  }, [frozenItems, items]);

  const trimmedTitle = useMemo(() => title.trim().substring(0, maxTitleLength), [maxTitleLength, title]);
  const remainingItemsCount = Math.max(availableItemsCount - filledItems.length, 0);
  const isSubmitDisabled = (!isAddTaskMode && !trimmedTitle) || !filledItems.length;
  const modalTitleKey = isAddTaskMode
    ? 'TitleAppendToDoList'
    : editingMessage ? 'TitleEditToDoList' : 'TitleNewToDoList';
  const submitLabelKey = isAddTaskMode ? 'Add' : editingMessage ? 'Save' : 'Create';

  const handleReorderItems = useLastCallback((itemIds: number[]) => {
    setItems((currentItems) => {
      const itemsById = new Map(currentItems.map((item) => [item.id, item]));
      const nextItems = itemIds.reduce<TodoItem[]>((result, id) => {
        const item = itemsById.get(id);

        if (item) {
          result.push(item);
        }

        return result;
      }, []);

      return normalizeItems(nextItems, availableItemsCount);
    });
  });

  const {
    draggedId: draggedItemId,
    getRowProps: getReorderableRowProps,
    getDragElementProps: getReorderableDragElementProps,
    getHandleProps: getReorderableHandleProps,
    getPlaceholderStyle: getReorderablePlaceholderStyle,
    getDragStyle: getReorderableDragStyle,
  } = useReorderableList({
    itemIds: reorderableItemIds,
    withAutoscroll: true,
    onReorder: handleReorderItems,
  });

  const updateItem = useLastCallback((id: number, value: string) => {
    const nextItems = items.map((item) => (
      item.id === id ? { ...item, text: value } : item
    ));

    setItems(normalizeItems(nextItems, availableItemsCount));
  });

  const handleRemoveItem = useLastCallback((id: number) => {
    setItems(normalizeItems(items.filter((item) => item.id !== id), availableItemsCount));
  });

  const focusItemInput = useLastCallback((shouldFocusLast?: boolean) => {
    if (!itemListRef.current) {
      return;
    }

    const inputs = itemListRef.current.querySelectorAll<HTMLInputElement>(`.${styles.itemInput} input`);
    const input = shouldFocusLast ? inputs[inputs.length - 1] : inputs[0];

    if (!input) {
      return;
    }

    requestMeasure(() => {
      input.focus();
    });
  });

  const handleTitleKeyDown = useLastCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return;
    }

    e.preventDefault();
    focusItemInput();
  });

  const handleItemKeyDown = useLastCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return;
    }

    e.preventDefault();
    focusItemInput(true);
  });

  const handleTitleChange = useLastCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.currentTarget.value);
  });

  const handleSubmit = useLastCallback(() => {
    if (!isOpen) {
      return;
    }

    const todoItems = filledItems.map(({ id, text }) => ({
      id,
      title: { text },
    }));

    if (isAddTaskMode && editingMessage) {
      appendTodoList({
        chatId: editingMessage.chatId,
        messageId: editingMessage.id,
        items: todoItems,
      });
      closeTodoListModal();
      return;
    }

    const payload: ApiNewMediaTodo = {
      todo: {
        title: { text: trimmedTitle },
        items: todoItems,
        othersCanComplete: isOthersCanComplete,
        othersCanAppend: isOthersCanAppend,
      },
    };

    if (editingMessage) {
      editTodo({
        chatId: editingMessage.chatId,
        todo: payload,
        messageId: editingMessage.id,
      });
    } else {
      onSend(payload);
    }

    closeTodoListModal();
  });

  const renderHeader = useMemo(() => (
    <ModalHeader>
      <ModalCloseButton />
      <ModalTitle noAutoFocus>{lang(modalTitleKey)}</ModalTitle>
      <ModalHeaderAction>
        <Button
          color="primary"
          pill
          disabled={isSubmitDisabled}
          noForcedUpperCase
          size="smaller"
          onClick={handleSubmit}
        >
          {lang(submitLabelKey)}
        </Button>
      </ModalHeaderAction>
    </ModalHeader>
  ), [isSubmitDisabled, lang, modalTitleKey, submitLabelKey]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClear}
      header={renderHeader}
      ariaLabel={lang(modalTitleKey)}
      width="slim"
    >
      <IslandTitle>{lang('InputTitle')}</IslandTitle>
      <Island>
        <InputText
          className={styles.input}
          label={lang('InputTitle')}
          value={title}
          maxLength={maxTitleLength}
          disabled={isAddTaskMode}
          autoFocus={!isAddTaskMode}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
        />
      </Island>

      <IslandTitle>{lang('ToDoListTasksTitle')}</IslandTitle>
      <Island ref={itemListRef} className={styles.itemList} teactFastList>
        {renderingItems.map((item, index) => {
          if (item.isFrozen) {
            return (
              <div key={item.id} className={styles.itemRowFrame}>
                <div className={styles.itemRow}>
                  <div className={styles.itemLeadingIcon} />
                  <InputText
                    className={styles.itemInput}
                    value={item.text}
                    disabled
                  />
                </div>
              </div>
            );
          }

          const isFilledItem = Boolean(item.text.trim());
          const isAddItemRow = !isFilledItem && index === renderingItems.length - 1;
          const isFirstEditableItem = index === frozenItems.length;
          const shouldShowRemoveButton = items.length > 1 && !isAddItemRow;
          const rowProps = isFilledItem ? getReorderableRowProps(item.id) : undefined;
          const handleProps = isFilledItem ? getReorderableHandleProps(item.id) : undefined;
          const dragElementProps = isFilledItem ? getReorderableDragElementProps(item.id) : undefined;
          const placeholderStyle = isFilledItem ? getReorderablePlaceholderStyle(item.id) : undefined;
          const dragStyle = isFilledItem ? getReorderableDragStyle(item.id) : undefined;

          return (
            <div
              key={item.id}
              ref={rowProps?.ref}
              className={styles.itemRowFrame}
              style={placeholderStyle}
            >
              <div
                ref={dragElementProps?.ref}
                style={dragStyle}
                className={buildClassName(
                  styles.itemRow,
                  isAddItemRow && styles.itemRowAdd,
                  draggedItemId === item.id && styles.itemRowDragging,
                )}
              >
                <div
                  className={buildClassName(
                    styles.itemLeadingIcon,
                    isAddItemRow && styles.itemLeadingIconAdd,
                    isFilledItem && styles.itemDragHandle,
                  )}
                  role={handleProps?.role}
                  tabIndex={handleProps?.tabIndex}
                  aria-label={isFilledItem ? lang('DragToSortAria') : undefined}
                  onMouseDown={handleProps?.onMouseDown}
                  onTouchStart={handleProps?.onTouchStart}
                  onKeyDown={handleProps?.onKeyDown}
                  ref={handleProps?.ref}
                >
                  <Icon
                    name={isAddItemRow ? 'add' : 'hamburger'}
                    className={styles.itemLeadingIconGlyph}
                  />
                </div>
                <InputText
                  className={buildClassName(styles.itemInput, isAddItemRow && styles.itemInputAdd)}
                  placeholder={isAddItemRow ? lang('TitleAddTask') : lang('TitleTask')}
                  value={item.text}
                  maxLength={maxItemLength}
                  autoFocus={isAddTaskMode && isFirstEditableItem}
                  onChange={(e) => updateItem(item.id, e.currentTarget.value)}
                  onKeyDown={handleItemKeyDown}
                />
                {shouldShowRemoveButton && (
                  <Button
                    round
                    size="tiny"
                    color="translucent"
                    className={styles.itemRemove}
                    ariaLabel={lang('Delete')}
                    iconName="close"
                    onClick={() => handleRemoveItem(item.id)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </Island>
      <IslandDescription>
        {remainingItemsCount > 0 ? (
          lang('HintTodoListTasksCount2', { count: remainingItemsCount }, { pluralValue: remainingItemsCount })
        ) : lang('ToDoListTasksLimitReached')}
      </IslandDescription>

      {!isAddTaskMode && (
        <>
          <IslandTitle>{lang('PollModalSettingsTitle')}</IslandTitle>
          <Island>
            <SwitchField
              label={lang('AllowOthersMarkAsDone')}
              checked={isOthersCanComplete}
              onChange={setIsOthersCanComplete}
            />
            <SwitchField
              label={lang('AllowOthersAddTasks')}
              checked={isOthersCanAppend}
              onChange={setIsOthersCanAppend}
            />
          </Island>
        </>
      )}
    </Modal>
  );
};

function createTodoItem(text = ''): TodoItem {
  return {
    id: generateUniqueNumberId(),
    text,
  };
}

function normalizeItems(items: TodoItem[], maxItemsCount: number) {
  const nextItems = [...items];

  while (
    nextItems.length > 1
    && !nextItems[nextItems.length - 1].text.trim()
    && !nextItems[nextItems.length - 2].text.trim()
  ) {
    nextItems.pop();
  }

  if (!nextItems.length) {
    nextItems.push(createTodoItem());
  }

  if (nextItems.length < maxItemsCount && nextItems[nextItems.length - 1].text.trim()) {
    nextItems.push(createTodoItem());
  }

  return nextItems;
}

export default memo(withGlobal<OwnProps>(
  (global, { modal }): Complete<StateProps> => {
    const { appConfig } = global;
    const editingMessage = modal?.messageId ? selectChatMessage(global, modal.chatId, modal.messageId) : undefined;

    return {
      editingMessage,
      maxItemsCount: appConfig.todoItemsMax,
      maxTitleLength: appConfig.todoTitleLengthMax,
      maxItemLength: appConfig.todoItemLengthMax,
    };
  },
)(ToDoListModal));
