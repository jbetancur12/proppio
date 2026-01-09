import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Users, BarChart3, FileText, Settings, TrendingUp } from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: BarChart3 },
        { name: 'Tenants', href: '/admin/tenants', icon: Building2 },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Financial Metrics', href: '/admin/financial-metrics', icon: TrendingUp },
        { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
        { name: 'Settings', href: '/admin/settings', icon: Settings }
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white">
                <div className="p-6">
                    <h1 className="text-2xl font-bold">Super Admin</h1>
                    <p className="text-sm text-gray-400 mt-1">Proppio</p>
                </div>

                <nav className="mt-6">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-64 p-6 border-t border-gray-800">
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }}
                        className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
