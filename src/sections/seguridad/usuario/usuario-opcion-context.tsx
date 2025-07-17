import React, { createContext, useContext } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import { useFilters } from 'src/contexts/filters/opcion-filters-context';
import { usuarioOpcionConfig } from './usuario-opcion-config';

// Tipado del contexto
export type UsuarioOpcionContextType = ReturnType<typeof useUsuarioOpcionContext>;

const UsuarioOpcionContext = createContext<UsuarioOpcionContextType | null>(null);

export function UsuarioOpcionProvider({ children }: { children: React.ReactNode }) {
    const value = useUsuarioOpcionContext();
    return (
        <UsuarioOpcionContext.Provider value={value}>
            {children}
        </UsuarioOpcionContext.Provider>
    );
}

// Nuevo hook para consumir el contexto
export function useUsuarioOpcion() {
    const ctx = useContext(UsuarioOpcionContext);
    if (!ctx) throw new Error('useUsuarioOpcion debe usarse dentro de UsuarioOpcionProvider');
    return ctx;
}

export function useUsuarioOpcionContext() {
    const filters = useFilters(usuarioOpcionConfig);
    const configRef = useRef(usuarioOpcionConfig);

    // Extraer dinámicamente los filtros diferidos de la configuración - memoizado una sola vez
    const DEFERRED_FILTERS = useMemo(() => {
        return configRef.current.filters
            .filter(filter => filter.mode === 'deferred')
            .map(filter => filter.name);
    }, []);

    // Helper para verificar si un filtro es diferido - optimizado con Set
    const deferredFiltersSet = useMemo(() => new Set(DEFERRED_FILTERS), [DEFERRED_FILTERS]);

    const isDeferred = useCallback((filterName: string) => {
        return deferredFiltersSet.has(filterName);
    }, [deferredFiltersSet]);

    // Método para filtros inmediatos - optimizado
    const setFilter = useCallback((name: string, value: any) => {
        if (!isDeferred(name)) {
            filters.setImmediateFilter(name, value);
        }
        // Los filtros diferidos se manejan en el estado local del componente
    }, [filters.setImmediateFilter, isDeferred]);

    // Método para aplicar todos los filtros (inmediatos + diferidos)
    const applyFilters = useCallback((deferred: Record<string, any>) => {
        filters.applyDeferredFilters(deferred);
    }, [filters.applyDeferredFilters]);

    // Helper para verificar si hay cambios pendientes en los diferidos - optimizado
    const hasPendingChanges = useCallback((deferred: Record<string, any>) => {
        // Compara los valores diferidos locales con los aplicados globales
        return DEFERRED_FILTERS.some(key => {
            const localValue = deferred[key];
            const appliedValue = filters.state.activeFilters[key];

            // Comparación optimizada
            if (localValue === appliedValue) return false;

            // Para strings
            if (typeof localValue === 'string' || typeof appliedValue === 'string') {
                return (localValue || '') !== (appliedValue || '');
            }

            // Para arrays - comparación optimizada
            if (Array.isArray(localValue) || Array.isArray(appliedValue)) {
                const localArray = Array.isArray(localValue) ? localValue : [];
                const appliedArray = Array.isArray(appliedValue) ? appliedValue : [];

                return localArray.length !== appliedArray.length ||
                    localArray.some((item, index) => item !== appliedArray[index]);
            }

            // Para otros tipos
            return localValue !== appliedValue;
        });
    }, [filters.state.activeFilters, DEFERRED_FILTERS]);

    // Retornar valor memoizado para evitar re-renders innecesarios
    const contextValue = useMemo(() => ({
        ...filters,
        setFilter,
        applyFilters,
        hasPendingChanges,
        filtersConfig: configRef.current,
        DEFERRED_FILTERS,
    }), [
        filters,
        setFilter,
        applyFilters,
        hasPendingChanges,
        DEFERRED_FILTERS,
    ]);

    return contextValue;
} 