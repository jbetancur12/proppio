import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-ui': [
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-slot',
                        '@radix-ui/react-select',
                        '@radix-ui/react-tabs',
                        '@radix-ui/react-switch',
                        '@radix-ui/react-checkbox',
                        '@radix-ui/react-label',
                        '@radix-ui/react-avatar',
                        '@radix-ui/react-alert-dialog',
                        'lucide-react',
                    ],
                    'vendor-charts': ['recharts'],
                    'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge', 'zod'],
                    'vendor-query': ['@tanstack/react-query'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
});
