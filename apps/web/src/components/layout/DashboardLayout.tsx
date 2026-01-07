import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Building,
    Home,
    Users,
    Settings,
    LogOut,
    Menu,
    FileText,
    DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: "Panel", href: "/dashboard", icon: Home },
        { label: "Propiedades", href: "/properties", icon: Building },
        { label: "Inquilinos", href: "/renters", icon: Users },
        { label: "Contratos", href: "/leases", icon: FileText },
        { label: "Pagos", href: "/payments", icon: DollarSign },
        { label: "Configuración", href: "/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100 mb-4">
                    <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center">R</div>
                        Rent Manager
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.href) || (item.href === '/dashboard' && location.pathname === '/');
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-600 shadow-sm"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {user?.userId?.slice(0, 2).toUpperCase() || 'AD'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
                            <p className="text-xs text-gray-500 truncate">{user?.tenantId}</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
                        <LogOut size={18} className="mr-2" />
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-200 p-4 md:hidden flex items-center justify-between">
                    <span className="font-bold text-indigo-600">Rent Manager</span>
                    <Button variant="ghost" size="icon"><Menu /></Button>
                </header>
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
