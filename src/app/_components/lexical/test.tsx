import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type JSX,
} from "react";
import {
  LexicalComposer,
  type InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  ElementNode,
  type EditorConfig,
  type NodeKey,
  DecoratorNode,
  type SerializedElementNode,
  type SerializedLexicalNode,
  type Spread,
  type LexicalEditor,
  type EditorState,
} from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { twMerge } from "tailwind-merge";

// =====================
// THEME (Tailwind classes)
// =====================
const theme = {
  paragraph: "mb-2",
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline underline-offset-4",
    strikethrough: "line-through",
    code: "font-mono px-1 rounded bg-gray-100 dark:bg-zinc-800",
  },
  heading: {
    h1: "text-3xl font-bold tracking-tight mb-3",
    h2: "text-2xl font-semibold tracking-tight mb-2",
    h3: "text-xl font-semibold tracking-tight mb-2",
  },
  quote: "border-l-4 pl-3 italic text-gray-600 dark:text-gray-300",
  list: {
    listitem: "ml-6",
    nested: {
      listitem: "ml-6",
    },
    ol: "list-decimal ml-6",
    ul: "list-disc ml-6",
  },
};

// =====================================================
// HEADER / FOOTER BLOCKS — ElementNodes with children
// =====================================================
export type SerializedHeaderBlockNode = Spread<
  {
    type: "header-block";
    version: 1;
  },
  SerializedElementNode
>;

export class HeaderBlockNode extends ElementNode {
  static getType(): string {
    return "header-block";
  }
  static clone(node: HeaderBlockNode): HeaderBlockNode {
    return new HeaderBlockNode(node.__key);
  }
  constructor(key?: NodeKey) {
    super(key);
  }
  createDOM(_config: EditorConfig): HTMLElement {
    const dom = document.createElement("section");
    dom.className =
      "relative rounded-2xl p-6 mb-4 border border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 shadow-sm";
    dom.setAttribute("data-block", "header");
    return dom;
  }
  updateDOM(_prevNode: HeaderBlockNode, _dom: HTMLElement): boolean {
    return false;
  }
  static importJSON(
    serializedNode: SerializedHeaderBlockNode,
  ): HeaderBlockNode {
    const node = new HeaderBlockNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    return node;
  }
  exportJSON(): SerializedHeaderBlockNode {
    return {
      ...super.exportJSON(),
      type: "header-block",
      version: 1,
    } as SerializedHeaderBlockNode;
  }
  // Make sure it behaves as a block with children
  static importDOM(): null {
    return null;
  }
  isInline(): boolean {
    return false;
  }
  canBeEmpty(): boolean {
    return true;
  }
}

export type SerializedFooterBlockNode = Spread<
  {
    type: "footer-block";
    version: 1;
  },
  SerializedElementNode
>;

export class FooterBlockNode extends ElementNode {
  static getType(): string {
    return "footer-block";
  }
  static clone(node: FooterBlockNode): FooterBlockNode {
    return new FooterBlockNode(node.__key);
  }
  constructor(key?: NodeKey) {
    super(key);
  }
  createDOM(_config: EditorConfig): HTMLElement {
    const dom = document.createElement("footer");
    dom.className =
      "relative rounded-2xl p-6 mt-4 border border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 shadow-sm";
    dom.setAttribute("data-block", "footer");
    return dom;
  }
  updateDOM(_prevNode: FooterBlockNode, _dom: HTMLElement): boolean {
    return false;
  }
  static importJSON(
    serializedNode: SerializedFooterBlockNode,
  ): FooterBlockNode {
    const node = new FooterBlockNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    return node;
  }
  exportJSON(): SerializedFooterBlockNode {
    return {
      ...super.exportJSON(),
      type: "footer-block",
      version: 1,
    } as SerializedFooterBlockNode;
  }
  static importDOM(): null {
    return null;
  }
  isInline(): boolean {
    return false;
  }
  canBeEmpty(): boolean {
    return true;
  }
}

// =====================================
// MEDIA NODES — simple DecoratorNodes
// =====================================
export type SerializedImageNode = {
  type: "image";
  version: 1;
  src: string;
  alt?: string;
  width?: number | null;
};

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __alt: string;
  __width: number | null;

  static getType(): string {
    return "image";
  }
  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__alt, node.__width, node.__key);
  }
  constructor(
    src: string,
    alt = "",
    width: number | null = null,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__width = width;
  }
  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    return dom;
  }
  updateDOM(): boolean {
    return false;
  }
  static importJSON(json: SerializedImageNode): ImageNode {
    return new ImageNode(json.src, json.alt ?? "", json.width ?? null);
  }
  exportJSON(): SerializedImageNode {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      alt: this.__alt,
      width: this.__width ?? undefined,
    };
  }
  decorate(): JSX.Element {
    return (
      <img
        src={this.__src}
        alt={this.__alt}
        style={{
          width: this.__width ? `${this.__width}px` : undefined,
          maxWidth: "100%",
        }}
        className="rounded-xl border border-gray-200 shadow-sm dark:border-zinc-800"
        draggable={false}
      />
    );
  }
}

export type SerializedVideoNode = {
  type: "video";
  version: 1;
  src: string;
  poster?: string;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
};

export class VideoNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __poster?: string;
  __controls: boolean;
  __loop: boolean;
  __muted: boolean;
  __autoPlay: boolean;

  static getType(): string {
    return "video";
  }
  static clone(node: VideoNode): VideoNode {
    return new VideoNode(
      node.__src,
      node.__poster,
      node.__controls,
      node.__loop,
      node.__muted,
      node.__autoPlay,
      node.__key,
    );
  }
  constructor(
    src: string,
    poster?: string,
    controls = true,
    loop = false,
    muted = false,
    autoPlay = false,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__poster = poster;
    this.__controls = controls;
    this.__loop = loop;
    this.__muted = muted;
    this.__autoPlay = autoPlay;
  }
  createDOM(): HTMLElement {
    return document.createElement("span");
  }
  updateDOM(): boolean {
    return false;
  }
  static importJSON(json: SerializedVideoNode): VideoNode {
    return new VideoNode(
      json.src,
      json.poster,
      json.controls ?? true,
      json.loop ?? false,
      json.muted ?? false,
      json.autoPlay ?? false,
    );
  }
  exportJSON(): SerializedVideoNode {
    return {
      type: "video",
      version: 1,
      src: this.__src,
      poster: this.__poster,
      controls: this.__controls,
      loop: this.__loop,
      muted: this.__muted,
      autoPlay: this.__autoPlay,
    };
  }
  decorate(): JSX.Element {
    return (
      <video
        src={this.__src}
        poster={this.__poster}
        controls={this.__controls}
        loop={this.__loop}
        muted={this.__muted}
        autoPlay={this.__autoPlay}
        className="max-w-full rounded-xl border border-gray-200 shadow-sm dark:border-zinc-800"
      />
    );
  }
}

// =====================================
// INSERT helpers
// =====================================
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $nodesOfType } from "lexical";

function useInsertBlockMenu(options: {
  onPickImageUrl: () => Promise<string | null>;
  onPickVideoUrl: () => Promise<string | null>;
}) {
  const [editor] = useLexicalComposerContext();

  const insertHeader = useCallback(() => {
    editor.update(() => {
      const already = $nodesOfType(HeaderBlockNode);
      if (already.length > 0) return; // enforce single header
      const node = new HeaderBlockNode();
      $insertNodes([node]);
      node.append(
        $createParagraphNode().append($createTextNode("Titre de la page")),
      );
    });
  }, [editor]);

  const insertFooter = useCallback(() => {
    editor.update(() => {
      const already = $nodesOfType(FooterBlockNode);
      if (already.length > 0) return; // enforce single footer
      const node = new FooterBlockNode();
      $insertNodes([node]);
      node.append(
        $createParagraphNode().append(
          $createTextNode("© " + new Date().getFullYear() + " – Votre site"),
        ),
      );
    });
  }, [editor]);

  const insertSection = useCallback(() => {
    editor.update(() => {
      const p = $createParagraphNode();
      $insertNodes([p]);
    });
  }, [editor]);

  const insertImage = useCallback(async () => {
    const url = await options.onPickImageUrl();
    if (!url) return;
    editor.update(() => {
      const img = new ImageNode(url, "image");
      $insertNodes([img]);
    });
  }, [editor, options]);

  const insertVideo = useCallback(async () => {
    const url = await options.onPickVideoUrl();
    if (!url) return;
    editor.update(() => {
      const vid = new VideoNode(url, undefined, true, false, false, false);
      $insertNodes([vid]);
    });
  }, [editor, options]);

  return {
    insertHeader,
    insertFooter,
    insertSection,
    insertImage,
    insertVideo,
  };
}

// =====================================
// TOOLBAR
// =====================================
function Toolbar({
  onImagePick,
  onVideoPick,
}: {
  onImagePick: () => Promise<string | null>;
  onVideoPick: () => Promise<string | null>;
}) {
  const {
    insertHeader,
    insertFooter,
    insertSection,
    insertImage,
    insertVideo,
  } = useInsertBlockMenu({
    onPickImageUrl: onImagePick,
    onPickVideoUrl: onVideoPick,
  });

  return (
    <div className="sticky top-0 z-10 -mx-2 mb-3 flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white/70 p-2 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
      <button
        onClick={insertHeader}
        className="rounded-lg border px-3 py-1 hover:bg-gray-50 dark:hover:bg-zinc-800"
      >
        Header
      </button>
      <button
        onClick={insertSection}
        className="rounded-lg border px-3 py-1 hover:bg-gray-50 dark:hover:bg-zinc-800"
      >
        Paragraphe
      </button>
      <button
        onClick={insertFooter}
        className="rounded-lg border px-3 py-1 hover:bg-gray-50 dark:hover:bg-zinc-800"
      >
        Footer
      </button>
      <span className="mx-1 w-px bg-gray-200 dark:bg-zinc-800" />
      <button
        onClick={insertImage}
        className="rounded-lg border px-3 py-1 hover:bg-gray-50 dark:hover:bg-zinc-800"
      >
        Image
      </button>
      <button
        onClick={insertVideo}
        className="rounded-lg border px-3 py-1 hover:bg-gray-50 dark:hover:bg-zinc-800"
      >
        Vidéo
      </button>
    </div>
  );
}

// =====================================
// PICKERS (URL prompt by default, can be swapped for uploaders)
// =====================================
async function defaultUrlPicker(
  kind: "image" | "video",
): Promise<string | null> {
  const label =
    kind === "image" ? "URL de l'image" : "URL de la vidéo (mp4, webm)";
  const url = window.prompt(label + " :");
  if (!url) return null;
  try {
    new URL(url);
    return url;
  } catch {
    alert("URL invalide");
    return null;
  }
}

// =====================================
// MAIN EDITOR COMPONENT
// =====================================
export type PageEditorProps = {
  initialState?: string; // JSON Lexical state
  onChangeJSON?: (json: string) => void;
  // Optional custom pickers to integrate your upload backend
  pickImageUrl?: () => Promise<string | null>;
  pickVideoUrl?: () => Promise<string | null>;
  className?: string;
};

function Placeholder() {
  return (
    <div className="pointer-events-none absolute top-3 left-3 text-gray-400 select-none">
      Commencez à écrire… Ajoutez un Header, des médias, puis un Footer.
    </div>
  );
}

export default function LexicalPageEditor({
  initialState,
  onChangeJSON,
  pickImageUrl,
  pickVideoUrl,
  className,
}: PageEditorProps) {
  const initialConfig: InitialConfigType = useMemo(
    () => ({
      namespace: "racoon-cms-page-editor",
      editable: true,
      onError(error) {
        console.error(error);
        throw error;
      },
      theme,
      nodes: [
        HeaderBlockNode,
        FooterBlockNode,
        ImageNode,
        VideoNode,
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        CodeNode,
        CodeHighlightNode,
        LinkNode,
      ],
      editorState: (editor: LexicalEditor) => {
        if (initialState) {
          const state = editor.parseEditorState(initialState);
          editor.setEditorState(state);
        }
      },
    }),
    [initialState],
  );

  const [json, setJson] = useState<string | null>(null);

  const handleChange = useCallback(
    (state: EditorState) => {
      state.read(() => {
        const str = JSON.stringify(state);
        setJson(str);
        onChangeJSON?.(str);
      });
    },
    [onChangeJSON],
  );

  const handlePickImage = useCallback(
    () => (pickImageUrl ?? (() => defaultUrlPicker("image")))(),
    [pickImageUrl],
  );
  const handlePickVideo = useCallback(
    () => (pickVideoUrl ?? (() => defaultUrlPicker("video")))(),
    [pickVideoUrl],
  );

  return (
    <div className={twMerge("mx-auto w-full max-w-3xl", className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar onImagePick={handlePickImage} onVideoPick={handlePickVideo} />
        <div className="relative min-h-[320px] rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[260px] p-2 outline-none" />
            }
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <AutoFocusPlugin />
          <OnChangePlugin onChange={handleChange} />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          État JSON (aperçu) — idéal pour sauvegarder dans votre base de données
          :
          <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-50 p-2 break-words whitespace-pre-wrap dark:bg-zinc-900">
            {json}
          </pre>
        </div>
      </LexicalComposer>
    </div>
  );
}

// =============================
// USAGE EXAMPLE (optional)
// =============================
// <LexicalPageEditor onChangeJSON={(json)=>save(json)}
//   pickImageUrl={async ()=>{
//     // 1) via upload: open <input type="file" accept="image/*" />
//     // 2) send to your backend, return the public URL
//     return "https://example.com/your-image.jpg";
//   }}
//   pickVideoUrl={async ()=>{
//     return "https://example.com/video.mp4";
//   }}
// />
