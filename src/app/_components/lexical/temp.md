# Racoon Lexical — adaptation (header/footer/images/vidéos)

Ci‑dessous :

1. `nodes.ts` — définitions des nodes Header, Footer, Image, Video
2. `CustomLexicalEditor.tsx` — ton éditeur, modifié pour enregistrer/charger et déclarer les nodes
3. `Toolbar.tsx` — ta toolbar, modifiée pour insérer Header/Footer/Image/Video

> Dépendances en plus : `@lexical/utils`

---

## 1) `components/editor/nodes.ts`

```ts
"use client";
import type { NodeKey, EditorConfig } from "lexical";
import { ElementNode, DecoratorNode } from "lexical";

// ===== HEADER BLOCK =====
export class HeaderBlockNode extends ElementNode {
  static getType(): string { return "header-block"; }
  static clone(node: HeaderBlockNode): HeaderBlockNode { return new HeaderBlockNode(node.__key); }
  constructor(key?: NodeKey) { super(key); }
  createDOM(_config: EditorConfig): HTMLElement {
    const dom = document.createElement("section");
    dom.className = "relative rounded-2xl p-6 mb-4 border border-gray-200 bg-white shadow-sm";
    dom.setAttribute("data-block", "header");
    return dom;
  }
  updateDOM(): boolean { return false; }
  exportJSON(): any { return { ...super.exportJSON(), type: "header-block", version: 1 }; }
  static importJSON(): HeaderBlockNode { return new HeaderBlockNode(); }
  isInline(): boolean { return false; }
  canBeEmpty(): boolean { return true; }
}

// ===== FOOTER BLOCK =====
export class FooterBlockNode extends ElementNode {
  static getType(): string { return "footer-block"; }
  static clone(node: FooterBlockNode): FooterBlockNode { return new FooterBlockNode(node.__key); }
  constructor(key?: NodeKey) { super(key); }
  createDOM(_config: EditorConfig): HTMLElement {
    const dom = document.createElement("footer");
    dom.className = "relative rounded-2xl p-6 mt-4 border border-gray-200 bg-white shadow-sm";
    dom.setAttribute("data-block", "footer");
    return dom;
  }
  updateDOM(): boolean { return false; }
  exportJSON(): any { return { ...super.exportJSON(), type: "footer-block", version: 1 }; }
  static importJSON(): FooterBlockNode { return new FooterBlockNode(); }
  isInline(): boolean { return false; }
  canBeEmpty(): boolean { return true; }
}

// ===== IMAGE NODE =====
export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string; __alt: string; __width: number | null;
  static getType(): string { return "image"; }
  static clone(node: ImageNode): ImageNode { return new ImageNode(node.__src, node.__alt, node.__width, node.__key); }
  constructor(src: string, alt = "", width: number | null = null, key?: NodeKey) {
    super(key); this.__src = src; this.__alt = alt; this.__width = width;
  }
  createDOM(): HTMLElement { return document.createElement("span"); }
  updateDOM(): boolean { return false; }
  exportJSON(): any { return { type: "image", version: 1, src: this.__src, alt: this.__alt, width: this.__width ?? undefined }; }
  static importJSON(json: any): ImageNode { return new ImageNode(json.src, json.alt ?? "", json.width ?? null); }
  decorate(): JSX.Element {
    return (
      <img
        src={this.__src}
        alt={this.__alt}
        style={{ width: this.__width ? `${this.__width}px` : undefined, maxWidth: "100%" }}
        className="rounded-xl shadow-sm border border-gray-200"
        draggable={false}
      />
    );
  }
}

// ===== VIDEO NODE =====
export class VideoNode extends DecoratorNode<JSX.Element> {
  __src: string; __poster?: string; __controls: boolean; __loop: boolean; __muted: boolean; __autoPlay: boolean;
  static getType(): string { return "video"; }
  static clone(node: VideoNode): VideoNode { return new VideoNode(node.__src, node.__poster, node.__controls, node.__loop, node.__muted, node.__autoPlay, node.__key); }
  constructor(src: string, poster?: string, controls = true, loop = false, muted = false, autoPlay = false, key?: NodeKey) {
    super(key); this.__src = src; this.__poster = poster; this.__controls = controls; this.__loop = loop; this.__muted = muted; this.__autoPlay = autoPlay;
  }
  createDOM(): HTMLElement { return document.createElement("span"); }
  updateDOM(): boolean { return false; }
  exportJSON(): any { return { type: "video", version: 1, src: this.__src, poster: this.__poster, controls: this.__controls, loop: this.__loop, muted: this.__muted, autoPlay: this.__autoPlay }; }
  static importJSON(json: any): VideoNode { return new VideoNode(json.src, json.poster, json.controls ?? true, json.loop ?? false, json.muted ?? false, json.autoPlay ?? false); }
  decorate(): JSX.Element {
    return (
      <video
        src={this.__src}
        poster={this.__poster}
        controls={this.__controls}
        loop={this.__loop}
        muted={this.__muted}
        autoPlay={this.__autoPlay}
        className="rounded-xl shadow-sm border border-gray-200 max-w-full"
      />
    );
  }
}
```

---

## 2) `components/editor/CustomLexicalEditor.tsx`

> Version adaptée de ton fichier. Changements :
>
> * Ajout des nodes `HeaderBlockNode`, `FooterBlockNode`, `ImageNode`, `VideoNode`
> * Déclaration des nodes dans `initialConfig.nodes`
> * (Optionnel) meilleur placeholder / styles inchangés

```tsx
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

// NEW: custom nodes
import { HeaderBlockNode, FooterBlockNode, ImageNode, VideoNode } from "./nodes";

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
};

function onError(error: Error) { console.error(error); }

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
        // builtin
        HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, CodeNode,
        // custom
        HeaderBlockNode, FooterBlockNode, ImageNode, VideoNode,
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
    onChangeJSON?.(JSON.stringify(editorState.toJSON()));
  };

  return (
    <div className="rounded border">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <div className="relative p-3">
          <RichTextPlugin
            contentEditable={<ContentEditable className="prose min-h-[220px] max-w-none outline-none" />}
            placeholder={<div className="pointer-events-none absolute inset-0 overflow-hidden p-3 text-gray-400 select-none">{placeholder}</div>}
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
```

---

## 3) `components/editor/Toolbar.tsx`

> Version adaptée :
>
> * Ajout de boutons **Header**, **Footer**, **Image**, **Vidéo**
> * Header/Footer uniques (1 seul de chaque)

```tsx
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
  $insertNodes,
  $createTextNode,
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
import { $nodesOfType } from "@lexical/utils";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CodeXml,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  ListX,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  PanelTop,
  PanelBottom,
  ImagePlus,
  Film,
} from "lucide-react";

// NEW: nodes
import { HeaderBlockNode, FooterBlockNode, ImageNode, VideoNode } from "./nodes";

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "quote" | "code";

function Btn({ active, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  const base = "px-2.5 h-8 border rounded text-sm hover:bg-gray-50 disabled:opacity-50";
  const act = active ? "bg-black text-white border-black" : "bg-white text-black";
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
        (payload) => { setCanUndo(payload); return false; },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => { setCanRedo(payload); return false; },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);

  const applyBlock = useCallback((tag: BlockType) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      if (tag === "paragraph") $setBlocksType(selection, () => $createParagraphNode());
      else if (tag === "quote") $setBlocksType(selection, () => $createQuoteNode());
      else if (tag === "code") $setBlocksType(selection, () => $createCodeNode());
      else $setBlocksType(selection, () => $createHeadingNode(tag));
    });
  }, [editor]);

  const toggleList = useCallback((type: "ol" | "ul") => {
    if (type === "ol") editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    else editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const removeList = useCallback(() => { editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined); }, [editor]);

  const toggleLink = useCallback(() => {
    const url = window.prompt("URL du lien (laisser vide pour retirer) :", "");
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url ?? null);
  }, [editor]);

  // ===== Insertion Header/Footer/Image/Video =====
  const insertHeader = useCallback(() => {
    editor.update(() => {
      const existing = $nodesOfType(HeaderBlockNode);
      if (existing.length) return; // 1 seul header
      const node = new HeaderBlockNode();
      $insertNodes([node]);
      node.append($createParagraphNode().append($createTextNode("Titre de la page")));
    });
  }, [editor]);

  const insertFooter = useCallback(() => {
    editor.update(() => {
      const existing = $nodesOfType(FooterBlockNode);
      if (existing.length) return; // 1 seul footer
      const node = new FooterBlockNode();
      $insertNodes([node]);
      node.append($createParagraphNode().append($createTextNode("© " + new Date().getFullYear())));
    });
  }, [editor]);

  const insertImage = useCallback(() => {
    const url = window.prompt("URL de l'image :");
    if (!url) return;
    editor.update(() => { $insertNodes([new ImageNode(url, "image")]); });
  }, [editor]);

  const insertVideo = useCallback(() => {
    const url = window.prompt("URL de la vidéo (mp4/webm/hls) :");
    if (!url) return;
    editor.update(() => { $insertNodes([new VideoNode(url, undefined, true, false, false, false)]); });
  }, [editor]);

  return (
    <div className="flex flex-wrap gap-2 border-b bg-gray-50 p-2">
      <Btn onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} disabled={!canUndo}><Undo2 className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} disabled={!canRedo}><Redo2 className="h-4 w-4" /></Btn>

      <span className="mx-1 w-px bg-gray-300" />

      <Btn active={isBold} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}><Bold className="h-4 w-4" /></Btn>
      <Btn active={isItalic} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}><Italic className="h-4 w-4" /></Btn>
      <Btn active={isUnderline} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}><Underline className="h-4 w-4" /></Btn>
      <Btn active={isStrike} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}><Strikethrough className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}><CodeXml className="h-4 w-4" /></Btn>

      <span className="mx-1 w-px bg-gray-300" />

      <select className="h-8 rounded border bg-white px-2 text-sm text-black" value={blockType} onChange={(e) => { const v = e.target.value as BlockType; setBlockType(v); applyBlock(v); }}>
        <option value="paragraph">Paragraphe</option>
        <option value="h1">Titre H1</option>
        <option value="h2">Titre H2</option>
        <option value="h3">Titre H3</option>
        <option value="quote">Citation</option>
        <option value="code">Code block</option>
      </select>

      <Btn onClick={() => toggleList("ul")}><List className="h-4 w-4" /></Btn>
      <Btn onClick={() => toggleList("ol")}><ListOrdered className="h-4 w-4" /></Btn>
      <Btn onClick={removeList}><ListX className="h-4 w-4" /></Btn>

      <span className="mx-1 w-px bg-gray-300" />

      <Btn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}><AlignLeft className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}><AlignCenter className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}><AlignRight className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")}><AlignJustify className="h-4 w-4" /></Btn>

      <span className="mx-1 w-px bg-gray-300" />

      <Btn onClick={toggleLink}><LinkIcon className="h-4 w-4" /></Btn>

      <span className="mx-1 w-px bg-gray-300" />

      {/* NEW: Blocks & Médias */}
      <Btn onClick={insertHeader} title="Ajouter un Header"><PanelTop className="h-4 w-4" /></Btn>
      <Btn onClick={insertFooter} title="Ajouter un Footer"><PanelBottom className="h-4 w-4" /></Btn>
      <Btn onClick={insertImage} title="Insérer une image"><ImagePlus className="h-4 w-4" /></Btn>
      <Btn onClick={insertVideo} title="Insérer une vidéo"><Film className="h-4 w-4" /></Btn>
    </div>
  );
}
```

---

### Notes d’intégration

* Si tu veux **uploader** plutôt qu’un prompt d’URL, remplace `window.prompt(...)` par ton flux d’upload (retourne ensuite l’URL publique et insère le node).
* Les nodes Header/Footer sont uniques. Si tu veux autoriser plusieurs sections, crée un `SectionBlockNode` (copie du HeaderBlockNode en changeant `getType()`).
* Sauvegarde/chargement : tu stockes la **chaîne JSON** de `editorState.toJSON()` comme tu le fais déjà.
* Styles : remplace les classes Tailwind des `createDOM` si tu as un design system.
