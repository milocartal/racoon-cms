"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { TRANSFORMERS } from "@lexical/markdown";

import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { CodeNode } from "@lexical/code";

import Toolbar from "./Toolbar";
import type { EditorState, LexicalEditor } from "lexical";
import { useMemo } from "react";

export type LexicalEditorProps = {
  initialContent?: string; // Lexical serialized state object
  onChangeJSON?: (json: string) => void; // callback à chaque modif
  placeholder?: string;
};

const theme = {
  paragraph: "mb-3",
  quote: "border-l-4 pl-3 italic text-gray-700",
  heading: {
    h1: "text-3xl font-semibold mb-3",
    h2: "text-2xl font-semibold mb-3",
    h3: "text-xl font-semibold mb-2",
  },
  list: {
    ul: "list-disc pl-6 mb-3",
    ol: "list-decimal pl-6 mb-3",
    listitem: "mb-1",
  },
  code: "font-mono text-sm bg-gray-100 rounded p-2 block mb-3 overflow-x-auto",
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "font-mono bg-gray-100 rounded px-1",
  },
  link: "text-blue-600 underline underline-offset-2",
  // Ajoute d'autres classes si besoin
};

function onError(error: Error) {
  console.error(error);
}

export default function CustomLexicalEditor({
  initialContent = '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
  onChangeJSON,
  placeholder = "Écris ton contenu…",
}: LexicalEditorProps) {
  const initialConfig = useMemo(
    () => ({
      namespace: "racoon-editor",
      theme,
      onError,
      editable: true,
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        LinkNode,
        AutoLinkNode,
        CodeNode,
      ],
      editorState: (editor: LexicalEditor) => {
        if (initialContent) {
          const state = editor.parseEditorState(initialContent);
          editor.setEditorState(state);
        }
      },
    }),
    [initialContent],
  );

  const handleChange = (editorState: EditorState) => {
    console.log("Editor state changed:", editorState.toJSON());
    onChangeJSON?.(JSON.stringify(editorState.toJSON()));
  };

  return (
    <div className="rounded border">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <div className="relative p-3">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="prose min-h-[220px] max-w-none outline-none" />
            }
            placeholder={
              <div className="pointer-events-none absolute inset-0 overflow-hidden p-3 text-gray-400 select-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <OnChangePlugin onChange={handleChange} />
        </div>
      </LexicalComposer>
    </div>
  );
}
