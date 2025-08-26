// components/editor/Toolbar.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $createCodeNode } from "@lexical/code";
import { CAN_UNDO_COMMAND, CAN_REDO_COMMAND } from "lexical";
import { mergeRegister } from "@lexical/utils";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CodeXml,
  Italic,
  Link,
  List,
  ListOrdered,
  ListX,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "quote" | "code";

function Btn({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  const base =
    "px-2.5 h-8 border rounded text-sm hover:bg-gray-50 hover:text-text disabled:opacity-50";
  const act = active
    ? "bg-black text-white border-black"
    : "bg-white text-black";
  return <button className={`${base} ${act} ${className ?? ""}`} {...props} />;
}

export default function Toolbar() {
  const [editor] = useLexicalComposerContext();

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [isBold, setBold] = useState(false);
  const [isItalic, setItalic] = useState(false);
  const [isUnderline, setUnderline] = useState(false);
  const [isStrike, setStrike] = useState(false);
  const [blockType, setBlockType] = useState<BlockType>("paragraph");

  // Suivi des états (formats + type de bloc)
  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          setBold(selection.hasFormat("bold"));
          setItalic(selection.hasFormat("italic"));
          setUnderline(selection.hasFormat("underline"));
          setStrike(selection.hasFormat("strikethrough"));

          const anchor = selection.anchor.getNode();
          const element = anchor.getTopLevelElementOrThrow();
          const type = element.getType();

          if (type === "heading") {
            // @ts-expect-error getTag() existe sur HeadingNode
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            setBlockType(element.getTag() as "h1" | "h2" | "h3");
          } else if (type === "quote") {
            setBlockType("quote");
          } else if (type === "code") {
            setBlockType("code");
          } else {
            setBlockType("paragraph");
          }
        });
      }),
      editor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);

  const setParagraph = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => $createParagraphNode());
    });
  }, [editor]);

  const applyBlock = useCallback(
    (tag: BlockType) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        if (tag === "paragraph") {
          $setBlocksType(selection, () => $createParagraphNode());
        } else if (tag === "quote") {
          $setBlocksType(selection, () => $createQuoteNode());
        } else if (tag === "code") {
          $setBlocksType(selection, () => $createCodeNode());
        } else {
          $setBlocksType(selection, () => $createHeadingNode(tag));
        }
      });
    },
    [editor],
  );

  const toggleList = useCallback(
    (type: "ol" | "ul") => {
      if (type === "ol")
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      else editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    },
    [editor],
  );

  const removeList = useCallback(() => {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  }, [editor]);

  const toggleLink = useCallback(() => {
    const url = window.prompt("URL du lien (laisser vide pour retirer) :", "");
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url ?? null);
  }, [editor]);

  return (
    <div className="flex flex-wrap gap-2 border-b bg-gray-50 p-2">
      <Btn
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        disabled={!canUndo}
      >
        <Undo2 className="h-4 w-4" />
      </Btn>
      <Btn
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        disabled={!canRedo}
      >
        <Redo2 className="h-4 w-4" />
      </Btn>

      <span className="mx-1 w-px bg-gray-300" />

      <Btn
        active={isBold}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        <Bold className="h-4 w-4" />
      </Btn>
      <Btn
        active={isItalic}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        <Italic className="h-4 w-4" />
      </Btn>
      <Btn
        active={isUnderline}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      >
        <Underline className="h-4 w-4" />
      </Btn>
      <Btn
        active={isStrike}
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
      >
        <Strikethrough className="h-4 w-4" />
      </Btn>
      <Btn onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}>
        <CodeXml className="h-4 w-4" />
      </Btn>

      <span className="mx-1 w-px bg-gray-300" />

      <select
        className="h-8 rounded border bg-white px-2 text-sm text-black"
        value={blockType}
        onChange={(e) => {
          const v = e.target.value as BlockType;
          setBlockType(v);
          applyBlock(v);
        }}
      >
        <option value="paragraph">Paragraphe</option>
        <option value="h1">Titre H1</option>
        <option value="h2">Titre H2</option>
        <option value="h3">Titre H3</option>
        <option value="quote">Citation</option>
        <option value="code">Code block</option>
      </select>

      <Btn onClick={() => toggleList("ul")}>
        <List className="h-4 w-4" />
      </Btn>
      <Btn onClick={() => toggleList("ol")}>
        <ListOrdered className="h-4 w-4" />
      </Btn>
      <Btn onClick={removeList}>
        <ListX className="h-4 w-4" />
      </Btn>

      <span className="mx-1 w-px bg-gray-300" />

      <Btn
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
      >
        <AlignLeft className="h-4 w-4" />
      </Btn>
      <Btn
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
      >
        <AlignCenter className="h-4 w-4" />
      </Btn>
      <Btn
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
      >
        <AlignRight className="h-4 w-4" />
      </Btn>
      <Btn
        onClick={() =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
        }
      >
        <AlignJustify className="h-4 w-4" />
      </Btn>

      <span className="mx-1 w-px bg-gray-300" />

      <Btn onClick={toggleLink}>
        <Link className="h-4 w-4" />
      </Btn>
    </div>
  );
}
