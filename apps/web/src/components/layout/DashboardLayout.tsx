import { ReactNode, useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Building2, Users, FileText, DollarSign, Wrench, TrendingUp, Settings, Menu } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ExitImpersonationBanner } from '@/features/admin/components/ExitImpersonationBanner';
import { useImpersonation } from '@/features/admin/hooks/useImpersonation';
import { api } from '@/api/client';

const { Building, TrendingDown, Hammer } = { Building: Building2, TrendingDown: TrendingUp, Hammer: Wrench };

export function DashboardLayout({ children }: { children?: ReactNode }) {
    const { logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isImpersonating, impersonatedTenantId } = useImpersonation();

    // Set impersonation header if impersonating
    useEffect(() => {
        if (isImpersonating && impersonatedTenantId) {
            api.defaults.headers.common['x-impersonate-tenant'] = impersonatedTenantId;
        } else {
            delete api.defaults.headers.common['x-impersonate-tenant'];
        }
    }, [isImpersonating, impersonatedTenantId]);

    const navItems = [
        { label: "Panel", href: "/dashboard", icon: Home },
        { label: "Propiedades", href: "/properties", icon: Building },
        { label: "Inquilinos", href: "/renters", icon: Users },
        { label: "Contratos", href: "/leases", icon: FileText },
        { label: "Aumentos IPC", href: "/rent-increases", icon: TrendingUp },
        { label: "Pagos", href: "/payments", icon: DollarSign },
        { label: "Gastos", href: "/expenses", icon: TrendingDown },
        { label: "Mantenimiento", href: "/maintenance", icon: Hammer },
        { label: "Configuración", href: "/settings", icon: Settings },
    ];

    const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center">R</div>
                    Rent Manager
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href || (item.href !== "/dashboard" && location.pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.label}
                            to={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={() => {
                        logout();
                        onClose?.();
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Exit Impersonation Banner */}
            <ExitImpersonationBanner />

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col overflow-hidden ${isImpersonating ? 'pt-14' : ''}`}>
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-lg text-indigo-600">
                        <div className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm">R</div>
                        Rent Manager
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </header>

                {/* Mobile Sidebar Sheet */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetContent side="left" className="p-0 w-64">
                        <SidebarContent onClose={() => setIsMobileMenuOpen(false)} />
                    </SheetContent>
                </Sheet>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
}
