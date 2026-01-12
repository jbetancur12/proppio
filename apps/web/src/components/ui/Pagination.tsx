import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, hasNextPage, hasPreviousPage }: PaginationProps) {
    // Determine if we can go back/forward based on props or pages
    const canGoBack = hasPreviousPage ?? currentPage > 1;
    const canGoNext = hasNextPage ?? currentPage < totalPages;

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="flex-1 text-sm text-gray-500">
                Página <span className="font-medium text-gray-900">{currentPage}</span> de{' '}
                <span className="font-medium text-gray-900">{totalPages}</span>
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={!canGoBack}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Anterior
                </Button>
                <div className="hidden md:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Logic to show window of pages around current
                        let p = i + 1;
                        if (totalPages > 5) {
                            if (currentPage > 3) p = currentPage - 3 + i;
                            if (p > totalPages) p = totalPages - 4 + i; // adjust if near end
                        }
                        // Simple fallback for now: show first 5 or logic needs to be complex
                        // Let's stick to simple "Previous | Next" for robustness first iteration
                        // But rendering numbers is nice.

                        // Let's implement a simple version that just shows current window
                        // If logic complex, I'll stick to Prev/Next buttons only for now to ensure it works
                        // without bugs.
                        return null;
                    })}
                </div>
                <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={!canGoNext}>
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
