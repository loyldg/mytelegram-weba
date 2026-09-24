import { Extension } from '@tiptap/core';
import {
  Fragment,
  type Node as ProseMirrorNode,
  Slice,
} from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';

import {
  buildBotApiHtmlSerializer,
  normalizeBotApiHtml,
  serializeTiptapPlainText,
} from '../../../../util/tiptap/botApiHtml';
import {
  EMOJI_NODE_NAME,
} from '../../../../util/tiptap/constants';
import { preserveCopiedRichEditorTable } from './richEditorTable';

export const RichEditorBotApiHtml = Extension.create({
  name: 'richEditorBotApiHtml',

  addProseMirrorPlugins() {
    return [new Plugin({
      props: {
        clipboardTextParser: (text, context, _isPlainText, view) => {
          const { schema } = view.state;
          const marks = context.marks();
          const paragraphs = text.split(/\r\n?|\n/).map((line) => (
            schema.nodes.paragraph.create(undefined, line ? schema.text(line, marks) : undefined)
          ));
          return Slice.maxOpen(Fragment.fromArray(paragraphs));
        },
        clipboardSerializer: buildBotApiHtmlSerializer(this.editor.schema),
        clipboardTextSerializer: ({ content }) => serializeTiptapPlainText(content),
        transformCopied: (slice, view) => replaceEmojiNodes(
          preserveCopiedRichEditorTable(slice, view.state.selection),
        ),
        transformPastedHTML: normalizeBotApiHtml,
      },
    })];
  },
});

function replaceEmojiNodes(slice: Slice) {
  return new Slice(
    replaceEmojiNodesInFragment(slice.content),
    slice.openStart,
    slice.openEnd,
  );
}

function replaceEmojiNodesInFragment(fragment: Fragment) {
  const nodes: ProseMirrorNode[] = [];

  fragment.forEach((node) => {
    if (node.type.name === EMOJI_NODE_NAME) {
      nodes.push(node.type.schema.text(node.attrs.alt, node.marks));
      return;
    }

    nodes.push(node.copy(replaceEmojiNodesInFragment(node.content)));
  });

  return Fragment.fromArray(nodes);
}
