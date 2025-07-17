// src/contexts/filters/use-entity-filters.ts

import { useCallback, useMemo } from 'react';
import type { SortConfig } from './types';

// Hook de utilidad para filtros de entidades
export function useEntityFilters<ToolbarFilters, ExtraState>(
    useFiltersHook: () => any
) {
    const filters = useFiltersHook();

    // Memoizar valores computados comunes
    const computedValues = useMemo(() => {
        const { state, hasActiveFilters, canReset } = filters;

        return {
            // Estado actual
            currentFilters: state.toolbarFilters,
            currentExtraState: state.extraState,
            currentSort: state.sort,
            currentPage: state.page,
            currentPageSize: state.pageSize,
            selectedId: state.selectedId,

            // Estado aplicado
            appliedFilters: state.appliedToolbarFilters,

            // Flags de estado
            hasActiveFilters,
            canReset,
            hasPendingChanges: filters.hasPendingChanges(),

            // Paginación
            pagination: {
                page: state.page,
                pageSize: state.pageSize,
                totalPages: 0, // Se calcula externamente
            }
        };
    }, [filters]);

    // Funciones de conveniencia
    const resetToDefaults = useCallback(() => {
        filters.resetAllFilters();
    }, [filters]);

    const applyCurrentFilters = useCallback(() => {
        filters.applyToolbarFilters(filters.state.toolbarFilters);
    }, [filters]);

    const setSearchTerm = useCallback((search: string) => {
        filters.setToolbarFilters({
            ...filters.state.toolbarFilters,
            search
        });
    }, [filters]);

    const setSort = useCallback((sort: SortConfig[]) => {
        filters.setSort(sort);
    }, [filters]);

    const setPage = useCallback((page: number) => {
        filters.setPage(page);
    }, [filters]);

    const setPageSize = useCallback((pageSize: number) => {
        filters.setPageSize(pageSize);
    }, [filters]);

    const setSelectedId = useCallback((id: string | null) => {
        filters.setSelectedId(id);
    }, [filters]);

    const setExtraState = useCallback((extra: ExtraState) => {
        filters.setExtraState(extra);
    }, [filters]);

    // Función para obtener parámetros del servicio
    const getServiceParams = useCallback(() => {
        return filters.getServiceParams();
    }, [filters]);

    return {
        ...computedValues,
        ...filters,

        // Funciones de conveniencia
        resetToDefaults,
        applyCurrentFilters,
        setSearchTerm,
        setSort,
        setPage,
        setPageSize,
        setSelectedId,
        setExtraState,
        getServiceParams,
    };
}

// Hook específico para filtros con búsqueda
export function useSearchableFilters<ToolbarFilters extends { search: string }, ExtraState>(
    useFiltersHook: () => any
) {
    const entityFilters = useEntityFilters<ToolbarFilters, ExtraState>(useFiltersHook);

    const searchTerm = entityFilters.currentFilters.search;
    const hasSearchTerm = searchTerm.trim().length > 0;

    return {
        ...entityFilters,
        searchTerm,
        hasSearchTerm,
        clearSearch: () => entityFilters.setSearchTerm(''),
    };
}

// Hook específico para filtros con paginación
export function usePaginatedFilters<ToolbarFilters, ExtraState>(
    useFiltersHook: () => any,
    totalItems: number = 0
) {
    const entityFilters = useEntityFilters<ToolbarFilters, ExtraState>(useFiltersHook);

    const totalPages = Math.ceil(totalItems / entityFilters.currentPageSize);
    const hasNextPage = entityFilters.currentPage < totalPages - 1;
    const hasPrevPage = entityFilters.currentPage > 0;

    const goToNextPage = useCallback(() => {
        if (hasNextPage) {
            entityFilters.setPage(entityFilters.currentPage + 1);
        }
    }, [entityFilters, hasNextPage]);

    const goToPrevPage = useCallback(() => {
        if (hasPrevPage) {
            entityFilters.setPage(entityFilters.currentPage - 1);
        }
    }, [entityFilters, hasPrevPage]);

    const goToPage = useCallback((page: number) => {
        if (page >= 0 && page < totalPages) {
            entityFilters.setPage(page);
        }
    }, [entityFilters, totalPages]);

    return {
        ...entityFilters,
        totalItems,
        totalPages,
        hasNextPage,
        hasPrevPage,
        goToNextPage,
        goToPrevPage,
        goToPage,
    };
} 