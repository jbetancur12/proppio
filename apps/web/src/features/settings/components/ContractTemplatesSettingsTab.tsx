import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { api } from "@/api/client";
import { toast } from "sonner";

// Local axios instance removed in favor of shared client


interface ContractTemplate {
    id: string;
    name: string;
    content: string;
    isActive: boolean;
}

export function ContractTemplatesSettingsTab() {
    const [templates, setTemplates] = useState<ContractTemplate[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
    const [templateName, setTemplateName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Escribe el contenido del contrato aquí...',
            }),
        ],
        content: '',
        editable: true,
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/api/leases/templates');
            setTemplates(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar plantillas");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        if (templates.length >= 2) {
            toast.error("Solo se permiten un máximo de 2 plantillas.");
            return;
        }
        setIsEditing(true);
        setCurrentTemplateId(null);
        setTemplateName("");
        editor?.commands.setContent("");
    };

    const handleEdit = (template: ContractTemplate) => {
        setIsEditing(true);
        setCurrentTemplateId(template.id);
        setTemplateName(template.name);
        editor?.commands.setContent(template.content);
    };

    const handleSave = async () => {
        if (!templateName.trim() || !editor?.getHTML()) {
            toast.error("Nombre y contenido son requeridos");
            return;
        }

        const content = editor.getHTML();

        try {
            if (currentTemplateId) {
                await api.put(`/api/leases/templates/${currentTemplateId}`, { name: templateName, content });
                toast.success("Plantilla actualizada");
            } else {
                await api.post('/api/leases/templates', { name: templateName, content });
                toast.success("Plantilla creada");
            }
            setIsEditing(false);
            fetchTemplates();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al guardar");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta plantilla?")) return;
        try {
            await api.delete(`/api/leases/templates/${id}`);
            toast.success("Plantilla eliminada");
            fetchTemplates();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const insertVariable = (variable: string) => {
        editor?.chain().focus().insertContent(variable).run();
    };

    const variables = [
        { label: "Nombre Inquilino", value: "{{renter.firstName}}" },
        { label: "Apellido Inquilino", value: "{{renter.lastName}}" },
        { label: "Cédula", value: "{{renter.documentNumber}}" },
        { label: "Dirección Inmueble", value: "{{unit.property.address}}" },
        { label: "Unidad", value: "{{unit.name}}" },
        { label: "Canon", value: "{{monthlyRent}}" },
        { label: "Fecha Inicio", value: "{{startDate}}" },
        { label: "Fecha Fin", value: "{{endDate}}" },
    ];

    if (isEditing) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Editor de Plantilla</h3>
                    <div className="space-x-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Guardar</Button>
                    </div>
                </div>

                <Input
                    placeholder="Nombre de la plantilla"
                    value={templateName}
                    onChange={e => setTemplateName(e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 border rounded-lg p-2 min-h-[400px] bg-white">
                        <div className="mb-2 border-b pb-2 space-x-2">
                            <Button size="sm" variant="ghost" onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? 'bg-slate-200' : ''}>Bold</Button>
                            <Button size="sm" variant="ghost" onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive('italic') ? 'bg-slate-200' : ''}>Italic</Button>
                            <Button size="sm" variant="ghost" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={editor?.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''}>H2</Button>
                            <Button size="sm" variant="ghost" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={editor?.isActive('bulletList') ? 'bg-slate-200' : ''}>List</Button>
                        </div>
                        <EditorContent editor={editor} className="prose max-w-none focus:outline-none min-h-[300px]" />
                    </div>
                    <div className="md:col-span-1 border rounded-lg p-4 bg-gray-50 h-fit">
                        <h4 className="font-medium mb-3 text-sm text-gray-700">Variables Disponibles</h4>
                        <div className="space-y-2">
                            {variables.map(v => (
                                <button
                                    key={v.value}
                                    onClick={() => insertVariable(v.value)}
                                    className="w-full text-left text-xs bg-white border p-2 rounded hover:bg-gray-100 transition-colors flex justify-between group"
                                >
                                    <span>{v.label}</span>
                                    <span className="text-blue-600 opacity-0 group-hover:opacity-100">+</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Plantillas de Contrato</CardTitle>
                        <CardDescription>Gestiona las plantillas para generar contratos automáticamente (Máx 2).</CardDescription>
                    </div>
                    <Button onClick={handleCreate} disabled={templates.length >= 2}>
                        <Plus className="w-4 h-4 mr-2" /> Nueva Plantilla
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p>Cargando...</p>
                ) : (
                    <div className="grid gap-4">
                        {templates.map(template => (
                            <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{template.name}</h4>
                                        <p className="text-sm text-gray-500">{template.isActive ? 'Activa' : 'Inactiva'}</p>
                                    </div>
                                </div>
                                <div className="space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(template.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {templates.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No hay plantillas creadas.
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
