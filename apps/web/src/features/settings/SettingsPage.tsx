import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettingsTab } from "./components/ProfileSettingsTab";
import { SubscriptionSettingsTab } from "./components/SubscriptionSettingsTab";

export function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Configuración</h1>
                <p className="text-muted-foreground">
                    Gestiona tu perfil, seguridad y suscripción.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Perfil y Seguridad</TabsTrigger>
                    <TabsTrigger value="subscription">Suscripción</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <ProfileSettingsTab />
                </TabsContent>

                <TabsContent value="subscription" className="space-y-4">
                    <SubscriptionSettingsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
