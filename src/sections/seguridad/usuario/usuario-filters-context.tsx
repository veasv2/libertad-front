'use client';

import { createContext, useContext, useCallback, useMemo, ReactNode, useState } from 'react';
import type { UsuarioWhere } from 'src/services/seguridad/usuario/usuario-types';
import type { TipoUsuarioValue } from 'src/types/enums/usuario-enum';
import type { SortConfig } from 'src/types/filters';

// ----------------------------------------------------------------------

interface UsuarioFiltersState {
    // Filtros del toolbar
    search: string;
    tipo: TipoUsuarioValue[];

    // Filtro del tab de estado
    estado: string;

    // Ordenamiento
    sort: SortConfig;

    // Paginación
    page: number;
    pageSize: number;
}

interface UsuarioFiltersContextValue {
    // Estado actual
    state: UsuarioFiltersState;

    // Acciones específicas
    setSearch: (search: string) => void;
    setTipo: (tipo: TipoUsuarioValue[]) => void;
    setEstado: (estado: string) => void;
    setSort: (sort: SortConfig) => void;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;

    // Acciones compuestas
    applyToolbarFilters: (search: string, tipo: TipoUsuarioValue[]) => void;
    resetPage: () => void;
    resetAllFilters: () => void;

    // Verificaciones
    hasActiveFilters: boolean;
    canReset: boolean;

    // Parámetros para el servicio
    getServiceParams: () => {
        where?: UsuarioWhere;
        pagination: {
            page: number;
            pageSize: number;
        };
        sort: SortConfig;
    };
}

const initialState: UsuarioFiltersState = {
    search: '',
    tipo: [],
    estado: 'all',
    sort: [{ column: 'nombres', direction: 'asc' }],
    page: 0,
    pageSize: 10,
};

const UsuarioFiltersContext = createContext<UsuarioFiltersContextValue | undefined>(undefined);

// ----------------------------------------------------------------------

interface UsuarioFiltersProviderProps {
    children: ReactNode;
}

export function UsuarioFiltersProvider({ children }: UsuarioFiltersProviderProps) {
    const [state, setState] = useState<UsuarioFiltersState>(initialState);

    // Acciones específicas
    const setSearch = useCallback((search: string) => {
        setState(prev => ({
            ...prev,
            search,
            page: 0
        }));
    }, []);

    const setTipo = useCallback((tipo: TipoUsuarioValue[]) => {
        setState(prev => ({
            ...prev,
            tipo,
            page: 0
        }));
    }, []);

    const setEstado = useCallback((estado: string) => {
        setState(prev => ({
            ...prev,
            estado,
            page: 0
        }));
    }, []);

    const setSort = useCallback((sort: SortConfig) => {
        setState(prev => ({
            ...prev,
            sort,
            page: 0
        }));
    }, []);

    const setPage = useCallback((page: number) => {
        setState(prev => ({
            ...prev,
            page
        }));
    }, []);

    const setPageSize = useCallback((pageSize: number) => {
        setState(prev => ({
            ...prev,
            pageSize,
            page: 0
        }));
    }, []);

    // Acciones compuestas
    const applyToolbarFilters = useCallback((search: string, tipo: TipoUsuarioValue[]) => {
        setState(prev => ({
            ...prev,
            search,
            tipo,
            page: 0
        }));
    }, []);

    const resetPage = useCallback(() => {
        setState(prev => ({
            ...prev,
            page: 0
        }));
    }, []);

    const resetAllFilters = useCallback(() => {
        setState(initialState);
    }, []);

    // Verificaciones
    const hasActiveFilters = useMemo(() => {
        return !!(
            state.search ||
            state.tipo.length > 0 ||
            state.estado !== 'all'
        );
    }, [state]);

    const canReset = useMemo(() => {
        return hasActiveFilters;
    }, [hasActiveFilters]);

    // Parámetros para el servicio
    const getServiceParams = useCallback(() => {
        const conditions: UsuarioWhere[] = [];

        // 1. Filtro de búsqueda de texto (OR anidado)
        if (state.search && state.search.trim()) {
            const searchTerm = state.search.trim();
            conditions.push({
                OR: [
                    { nombres: { contains: searchTerm } },
                    { apellido_paterno: { contains: searchTerm } },
                    { apellido_materno: { contains: searchTerm } },
                    { email: { contains: searchTerm } },
                    { dni: { contains: searchTerm } }
                ]
            });
        }

        // 2. Filtro de tipo (AND)
        if (state.tipo && state.tipo.length > 0) {
            conditions.push({
                tipo: { in: state.tipo }
            });
        }

        // 3. Filtro de estado del tab (AND)
        if (state.estado !== 'all') {
            conditions.push({
                estado: { equals: state.estado }
            });
        }

        // Construir el WHERE final
        let finalWhere: UsuarioWhere | undefined;

        if (conditions.length === 0) {
            finalWhere = undefined;
        } else if (conditions.length === 1) {
            finalWhere = conditions[0];
        } else {
            finalWhere = { AND: conditions };
        }

        return {
            where: finalWhere,
            pagination: {
                page: state.page + 1,
                pageSize: state.pageSize,
            },
            sort: state.sort
        };
    }, [state]);

    const value = useMemo(() => ({
        state,
        setSearch,
        setTipo,
        setEstado,
        setSort,
        setPage,
        setPageSize,
        applyToolbarFilters,
        resetPage,
        resetAllFilters,
        hasActiveFilters,
        canReset,
        getServiceParams,
    }), [
        state,
        setSearch,
        setTipo,
        setEstado,
        setSort,
        setPage,
        setPageSize,
        applyToolbarFilters,
        resetPage,
        resetAllFilters,
        hasActiveFilters,
        canReset,
        getServiceParams,
    ]);

    return (
        <UsuarioFiltersContext.Provider value={value}>
            {children}
        </UsuarioFiltersContext.Provider>
    );
}

// Hook para usar el contexto
export function useUsuarioFilters() {
    const context = useContext(UsuarioFiltersContext);
    if (!context) {
        throw new Error('useUsuarioFilters must be used within a UsuarioFiltersProvider');
    }
    return context;
}