import { useAuth } from "../contexts/AuthContext"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../api/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "sonner"

export function DashboardPage() {
    const { user, logout } = useAuth()
    const queryClient = useQueryClient()
    const [newName, setNewName] = useState("")
    const [newAddress, setNewAddress] = useState("")

    const { data: properties, isLoading } = useQuery({
        queryKey: ['properties'],
        queryFn: async () => {
            const res = await api.get('/api/properties');
            return res.data;
        }
    })

    const createMutation = useMutation({
        mutationFn: async () => {
            await api.post('/api/properties', { name: newName, address: newAddress });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            setNewName("");
            setNewAddress("");
            toast.success("Property created!");
        },
        onError: () => toast.error("Failed to create property")
    })

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Tenant: {user?.tenantId}</span>
                    <Button variant="outline" onClick={logout}>Logout</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle>My Properties</CardTitle></CardHeader>
                    <CardContent>
                        {isLoading ? <p>Loading...</p> : (
                            <ul className="space-y-2">
                                {properties?.map((p: any) => (
                                    <li key={p.id} className="p-2 border rounded shadow-sm">
                                        <b>{p.name}</b> <br />
                                        <span className="text-sm text-gray-500">{p.address}</span>
                                    </li>
                                ))}
                                {properties?.length === 0 && <p>No properties found.</p>}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Add Property</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Input placeholder="Property Name" value={newName} onChange={e => setNewName(e.target.value)} />
                        <Input placeholder="Address" value={newAddress} onChange={e => setNewAddress(e.target.value)} />
                        <Button onClick={() => createMutation.mutate()} disabled={!newName || !newAddress}>
                            {createMutation.isPending ? 'Saving...' : 'Create'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
