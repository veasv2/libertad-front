import React, { createContext, useContext } from 'react';
import { useCallback } from 'react';
import { useFilters } from 'src/contexts/filters/opcion-filters-context';
import { usuarioOpcionConfig } from './usuario-opcion-config';
import type { ReactNode } from 'react';
import type { EntityFiltersConfig } from 'src/contexts/filters/filter-config-types';

// Define los nombres de los filtros diferidos
const DEFERRED_FILTERS = ['search'];

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

    // Método para filtros inmediatos
    const setFilter = useCallback((name: string, value: any) => {
        if (DEFERRED_FILTERS.includes(name)) {
            // No aplicar aún, solo actualizar el estado local en el componente
            // (el componente debe manejar el estado local de los diferidos)
        } else {
            filters.setImmediateFilter(name, value);
        }
    }, [filters]);

    // Método para aplicar todos los filtros (inmediatos + diferidos)
    const applyFilters = useCallback((deferred: Record<string, any>) => {
        filters.applyDeferredFilters(deferred);
    }, [filters]);

    // Helper para verificar si hay cambios pendientes en los diferidos
    const hasPendingChanges = useCallback((deferred: Record<string, any>) => {
        // Compara los valores diferidos locales con los aplicados globales
        return DEFERRED_FILTERS.some(
            key => (deferred[key] || '') !== (filters.state.activeFilters[key] || '')
        );
    }, [filters.state.activeFilters]);

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