import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react';

interface ContractEditorProps {
    initialContent?: string;
    onUpdate: (content: string) => void;
    editable?: boolean;
    variables?: Array<{ label: string; value: string }>;
    previewData?: Record<string, unknown>;
}

export function ContractEditor({ initialContent = '', onUpdate, editable = true, variables = [], previewData }: ContractEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Escribe el contenido del contrato aquí...',
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: initialContent,
        editable: editable,
        onUpdate: ({ editor }) => {
            onUpdate(editor.getHTML());
        },
    });

    // Update content if initialContent changes externally

    useEffect(() => {
        if (editor && initialContent !== editor.getHTML()) {
            // Only update if content is different to avoid cursor jumping or loops
            // Ideally we checking logic strictly but simpler for now:
            // If completely different (like loading a new template), set it.
            // If just typing, onUpdate handles it.

            // A common pattern is to only setContent if the editor is empty or we explicitly switched templates (parent logic control).
            // For now, let's allow parent to drive content updates carefully.
            if (!editor.isFocused) {
                editor.commands.setContent(initialContent);
            }
        }
    }, [initialContent, editor]);

    const insertVariable = (variable: string) => {
        editor?.chain().focus().insertContent(variable).run();
    };

    const [mode, setMode] = useState<'edit' | 'preview'>('edit');
    const [previewContent, setPreviewContent] = useState('');

    useEffect(() => {
        if (mode === 'preview' && editor) {
            let content = editor.getHTML();
            if (previewData) {
                // Replace variables with preview data
                // This regex matches {{variable.path}}
                content = content.replace(/{{([\w.]+)}}/g, (match, path) => {
                    // Try to resolve path in previewData
                    // Ideally we flatten or support nested. Let's support simple nested or just direct map.
                    // If previewData is a flat map of "renter.firstName": "Juan", then simple lookup.
                    // If it is an object, we need to traverse.
                    // Let's assume previewData is an object matching the structure or a flat map? 
                    // The previous logic used specific replacements.
                    // Let's try to resolve using a helper or just checking keys.

                    // Simple traversal helper
                    const value = path.split('.').reduce((obj: unknown, key: string) => {
                        if (obj && typeof obj === 'object') {
                            return (obj as Record<string, unknown>)[key];
                        }
                        return undefined;
                    }, previewData);
                    return value !== undefined ? String(value) : match;
                });
            }
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPreviewContent(prev => prev !== content ? content : prev);
        }
    }, [mode, editor, previewData]);

    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-end gap-2 border-b">
                <Button
                    variant={mode === 'edit' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('edit')}
                    className="rounded-b-none"
                    type="button"
                >
                    Editar
                </Button>
                <Button
                    variant={mode === 'preview' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('preview')}
                    className="rounded-b-none"
                    type="button"
                >
                    Vista Previa
                </Button>
            </div>

            {mode === 'edit' ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className={`${variables.length > 0 ? 'md:col-span-3' : 'md:col-span-4'} border rounded-lg p-2 min-h-[400px] bg-white flex flex-col`}>
                        {editable && (
                            <div className="mb-2 border-b pb-2 space-x-1 flex flex-wrap gap-y-2">
                                <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`px-2 ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700' : ''}`} title="Negrita">
                                    <Bold size={16} />
                                </Button>
                                <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-2 ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : ''}`} title="Cursiva">
                                    <Italic size={16} />
                                </Button>

                                <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

                                <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 text-indigo-700' : ''}`} title="Título">
                                    <Heading2 size={16} />
                                </Button>
                                <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-2 ${editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-700' : ''}`} title="Lista con viñetas">
                                    <List size={16} />
                                </Button>
                                <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`px-2 ${editor.isActive('orderedList') ? 'bg-indigo-100 text-indigo-700' : ''}`} title="Lista numerada">
                                    <ListOrdered size={16} />
                                </Button>

                                <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

                                <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`px-2 ${editor.isActive({ textAlign: 'left' }) ? 'bg-indigo-100 text-indigo-700' : ''}`} title="Alinear izquierda">
                                    <AlignLeft size={16} />
                                </Button>
                                <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`px-2 ${editor.isActive({ textAlign: 'center' }) ? 'bg-indigo-100 text-indigo-700' : ''}`} title="Centrar">
                                    <AlignCenter size={16} />
                                </Button>
                                <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`px-2 ${editor.isActive({ textAlign: 'right' }) ? 'bg-indigo-100 text-indigo-700' : ''}`} title="Alinear derecha">
                                    <AlignRight size={16} />
                                </Button>
                                <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`px-2 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-indigo-100 text-indigo-700' : ''}`} title="Justificar">
                                    <AlignJustify size={16} />
                                </Button>
                            </div>
                        )}
                        <EditorContent editor={editor} className="prose max-w-none focus:outline-none flex-1 overflow-y-auto" />
                    </div>

                    {editable && variables.length > 0 && (
                        <div className="md:col-span-1 border rounded-lg p-4 bg-gray-50 h-fit max-h-[400px] overflow-y-auto">
                            <h4 className="font-medium mb-3 text-sm text-gray-700">Variables Disponibles</h4>
                            <div className="space-y-2">
                                {variables.map(v => (
                                    <button
                                        key={v.value}
                                        onClick={() => insertVariable(v.value)}
                                        className="w-full text-left text-xs bg-white border p-2 rounded hover:bg-gray-100 transition-colors flex justify-between group"
                                        type="button"
                                    >
                                        <span>{v.label}</span>
                                        <span className="text-blue-600 opacity-0 group-hover:opacity-100">+</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="border rounded-lg p-8 min-h-[400px] bg-white shadow-sm overflow-y-auto prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                </div>
            )}
        </div>
    );
}
