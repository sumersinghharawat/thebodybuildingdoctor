import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

export function htmlToPlainText(html) {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

export default function RichTextEditor({
    value = '',
    onChange,
    placeholder = 'Write your content…',
    minHeight = '12rem',
    required = false,
}) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-amber-400 underline',
                },
            }),
            Placeholder.configure({ placeholder }),
        ],
        content: value || '',
        editorProps: {
            attributes: {
                class: 'rich-editor__content focus:outline-none',
            },
        },
        onUpdate: ({ editor: currentEditor }) => {
            onChange?.(currentEditor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) return;

        const current = editor.getHTML();
        const next = value || '';

        if (current !== next) {
            editor.commands.setContent(next, false);
        }
    }, [editor, value]);

    if (!editor) {
        return (
            <div
                className="rich-editor rounded-lg border border-slate-700 bg-slate-900/80"
                style={{ minHeight }}
            />
        );
    }

    return (
        <div className="rich-editor rounded-lg border border-slate-700 bg-slate-900/80">
            <div className="flex flex-wrap gap-1 border-b border-slate-800 p-2">
                <ToolbarButton
                    active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    label="Bold"
                >
                    <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    label="Italic"
                >
                    <em>I</em>
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive('underline')}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    label="Underline"
                >
                    <span className="underline">U</span>
                </ToolbarButton>
                <ToolbarDivider />
                <ToolbarButton
                    active={editor.isActive('heading', { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    label="Heading 2"
                >
                    H2
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive('heading', { level: 3 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    label="Heading 3"
                >
                    H3
                </ToolbarButton>
                <ToolbarDivider />
                <ToolbarButton
                    active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    label="Bullet list"
                >
                    • List
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    label="Numbered list"
                >
                    1. List
                </ToolbarButton>
                <ToolbarDivider />
                <ToolbarButton
                    active={editor.isActive('link')}
                    onClick={() => {
                        const previousUrl = editor.getAttributes('link').href;
                        const url = window.prompt('Enter URL', previousUrl || 'https://');

                        if (url === null) return;

                        if (url === '') {
                            editor.chain().focus().extendMarkRange('link').unsetLink().run();
                            return;
                        }

                        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                    }}
                    label="Link"
                >
                    Link
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                    label="Clear formatting"
                >
                    Clear
                </ToolbarButton>
            </div>
            <div className="p-3" style={{ minHeight }}>
                <EditorContent editor={editor} />
            </div>
            {required && !htmlToPlainText(value) && (
                <p className="border-t border-slate-800 px-3 py-2 text-xs text-slate-500">
                    This field is required.
                </p>
            )}
        </div>
    );
}

function ToolbarButton({ active, onClick, label, children }) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            onClick={onClick}
            className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                active
                    ? 'bg-accent text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
        >
            {children}
        </button>
    );
}

function ToolbarDivider() {
    return <span className="mx-1 w-px self-stretch bg-slate-800" />;
}
