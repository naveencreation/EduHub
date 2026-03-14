'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Heading1, 
  Heading2 
} from 'lucide-react';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const activeClass = "bg-gray-200 text-gray-900";
  const defaultClass = "text-gray-600 hover:bg-gray-100";
  const btnClass = "p-2 rounded-md transition-colors";

  return (
    <div className="flex flex-wrap gap-1 border-b p-2 bg-gray-50/50 rounded-t-md">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`${btnClass} ${editor.isActive('bold') ? activeClass : defaultClass}`}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`${btnClass} ${editor.isActive('italic') ? activeClass : defaultClass}`}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`${btnClass} ${editor.isActive('strike') ? activeClass : defaultClass}`}
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`${btnClass} ${editor.isActive('code') ? activeClass : defaultClass}`}
      >
        <Code className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${btnClass} ${editor.isActive('heading', { level: 1 }) ? activeClass : defaultClass}`}
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${btnClass} ${editor.isActive('heading', { level: 2 }) ? activeClass : defaultClass}`}
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${btnClass} ${editor.isActive('bulletList') ? activeClass : defaultClass}`}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${btnClass} ${editor.isActive('orderedList') ? activeClass : defaultClass}`}
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`${btnClass} ${editor.isActive('blockquote') ? activeClass : defaultClass}`}
      >
        <Quote className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className={`${btnClass} ${defaultClass}`}
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={`${btnClass} ${defaultClass}`}
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function TipTapEditor({ value, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Keep editor synced if initial value changes externally (e.g. initial load)
  // Only update if it hasn't been edited recently to avoid jumping cursor
  if (editor && value && editor.getHTML() !== value && !editor.isFocused) {
    editor.commands.setContent(value);
  }

  return (
    <div className="flex flex-col border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
      <MenuBar editor={editor} />
      <div className="bg-white overflow-y-auto max-h-[600px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
