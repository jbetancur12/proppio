import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '../../lib/logger';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to our backend logger
        logger.error('Uncaught error in ErrorBoundary', { error, errorInfo });
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border-t-4 border-red-500">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="text-red-500 w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Ups! Algo salió mal</h1>
                        <p className="text-gray-600 mb-6">
                            Ha ocurrido un error inesperado en la aplicación. Hemos sido notificados y estamos
                            trabajando en ello.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-red-50 p-4 rounded text-left text-xs mb-6 overflow-auto max-h-32 text-red-800 font-mono">
                                {this.state.error.toString()}
                            </div>
                        )}

                        <Button
                            onClick={this.handleReload}
                            className="bg-indigo-600 hover:bg-indigo-700 w-full flex items-center justify-center"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Recargar Aplicación
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
