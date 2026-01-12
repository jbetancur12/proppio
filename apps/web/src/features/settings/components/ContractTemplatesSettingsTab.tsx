import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import { api } from "@/api/client";
import { toast } from "sonner";
import { ContractEditor } from "../../leases/components/ContractEditor";

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
    const [templateContent, setTemplateContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
        setTemplateContent("");
    };

    const handleEdit = (template: ContractTemplate) => {
        setIsEditing(true);
        setCurrentTemplateId(template.id);
        setTemplateName(template.name);
        setTemplateContent(template.content);
    };

    const handleSave = async () => {
        if (!templateName.trim() || !templateContent.trim()) {
            toast.error("Nombre y contenido son requeridos");
            return;
        }

        try {
            if (currentTemplateId) {
                await api.put(`/api/leases/templates/${currentTemplateId}`, { name: templateName, content: templateContent });
                toast.success("Plantilla actualizada");
            } else {
                await api.post('/api/leases/templates', { name: templateName, content: templateContent });
                toast.success("Plantilla creada");
            }
            setIsEditing(false);
            fetchTemplates();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        } catch {
            toast.error("Error al eliminar");
        }
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

                <ContractEditor
                    initialContent={templateContent}
                    onUpdate={setTemplateContent}
                    variables={variables}
                    previewData={{
                        renter: {
                            firstName: "Juan",
                            lastName: "Pérez",
                            documentNumber: "12345678"
                        },
                        unit: {
                            name: "Apto 101",
                            property: {
                                address: "Calle 123 # 45-67"
                            }
                        },
                        monthlyRent: "$1.500.000",
                        startDate: "2024-01-01",
                        endDate: "2025-01-01"
                    }}
                />
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
