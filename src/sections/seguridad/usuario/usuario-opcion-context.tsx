import React, { createContext, useContext } from 'react';
import { useCallback, useMemo } from 'react';
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

    // Extraer dinámicamente los filtros diferidos de la configuración
    const DEFERRED_FILTERS = useMemo(() => {
        return usuarioOpcionConfig.filters
            .filter(filter => filter.mode === 'deferred')
            .map(filter => filter.name);
    }, []);

    // Helper para verificar si un filtro es diferido
    const isDeferred = useCallback((filterName: string) => {
        return DEFERRED_FILTERS.includes(filterName);
    }, [DEFERRED_FILTERS]);

    // Método para filtros inmediatos
    const setFilter = useCallback((name: string, value: any) => {
        if (isDeferred(name)) {
            // No aplicar aún, solo actualizar el estado local en el componente
            // (el componente debe manejar el estado local de los diferidos)
        } else {
            filters.setImmediateFilter(name, value);
        }
    }, [filters, isDeferred]);

    // Método para aplicar todos los filtros (inmediatos + diferidos)
    const applyFilters = useCallback((deferred: Record<string, any>) => {
        filters.applyDeferredFilters(deferred);
    }, [filters]);

    // Helper para verificar si hay cambios pendientes en los diferidos
    const hasPendingChanges = useCallback((deferred: Record<string, any>) => {
        // Compara los valores diferidos locales con los aplicados globales
        return DEFERRED_FILTERS.some(key => {
            const localValue = deferred[key];
            const appliedValue = filters.state.activeFilters[key];

            // Para strings
            if (typeof localValue === 'string' || typeof appliedValue === 'string') {
                return (localValue || '') !== (appliedValue || '');
            }

            // Para arrays
            if (Array.isArray(localValue) || Array.isArray(appliedValue)) {
                const localArray = Array.isArray(localValue) ? localValue : [];
                const appliedArray = Array.isArray(appliedValue) ? appliedValue : [];

                if (localArray.length !== appliedArray.length) return true;
                return localArray.some((item, index) => item !== appliedArray[index]);
            }

            // Para otros tipos
            return localValue !== appliedValue;
        });
    }, [filters.state.activeFilters, DEFERRED_FILTERS]);

    // Retornar SIEMPRE un nuevo objeto para forzar reactividad
    const contextValue = {
        ...filters,
        setFilter,
        applyFilters,
        hasPendingChanges,
        filtersConfig: usuarioOpcionConfig,
        DEFERRED_FILTERS,
    };
    // Log para depuración
    console.log('[CONTEXT] useUsuarioOpcionContext re-render, state:', filters.state);
    return contextValue;
} 