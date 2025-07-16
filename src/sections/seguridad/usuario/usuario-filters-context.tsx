// src/sections/seguridad/usuario/usuario-filters.ts

import type { ReactNode } from 'react';
import { createGenericFiltersContext } from 'src/contexts/filters/generic-filters-context';
import type { TipoUsuarioValue } from 'src/types/enums/usuario-enum';
import { SortConfig } from 'src/contexts/filters';

// Tipos específicos para Usuario
export interface UsuarioToolbarFilters {
    search: string;
    tipo: TipoUsuarioValue[];
}

export interface UsuarioExtraState {
    estado: string;
}

// Estado inicial
const initialState = {
    toolbarFilters: {
        search: '',
        tipo: [] as TipoUsuarioValue[]
    },
    extraState: {
        estado: 'all'
    },
    sort: [{ column: 'nombres', direction: 'asc' as const }],
    page: 0,
    pageSize: 10,
    selectedId: null,
    appliedToolbarFilters: {
        search: '',
        tipo: [] as TipoUsuarioValue[]
    },
};

// Función para convertir estado a URL
function stateToUrlParams(state: any) {
    const params = new URLSearchParams();

    if (state.appliedToolbarFilters.search?.trim()) {
        params.set('search', state.appliedToolbarFilters.search.trim());
    }

    if (state.appliedToolbarFilters.tipo.length > 0) {
        params.set('tipo', state.appliedToolbarFilters.tipo.join(','));
    }

    if (state.extraState.estado !== 'all') {
        params.set('estado', state.extraState.estado);
    }

    if (state.selectedId) {
        params.set('selectedId', state.selectedId);
    }

    if (state.page > 0) {
        params.set('page', state.page.toString());
    }

    if (state.pageSize !== 10) {
        params.set('pageSize', state.pageSize.toString());
    }

    const currentSort = state.sort[0];
    if (currentSort &&
        (currentSort.column !== 'nombres' || currentSort.direction !== 'asc')) {
        const sortParam = state.sort.map((s: any) => `${s.column}:${s.direction}`).join(',');
        params.set('sort', sortParam);
    }

    return params.toString();
}

// Función para convertir URL a estado
function urlParamsToState(params: URLSearchParams) {
    const search = params.get('search')?.trim() || '';
    const tipoParam = params.get('tipo');
    const tipo = tipoParam ? tipoParam.split(',').filter(Boolean) as TipoUsuarioValue[] : [];
    const estado = params.get('estado') || 'all';
    const selectedId = params.get('selectedId') || null;
    const page = Math.max(0, parseInt(params.get('page') || '0', 10) || 0);
    const pageSize = Math.max(1, parseInt(params.get('pageSize') || '10', 10) || 10);

    // Parsear sort
    const sortParam = params.get('sort');
    let sort: SortConfig[] = [{ column: 'nombres', direction: 'asc' as const }];
    if (sortParam) {
        sort = sortParam.split(',').map(s => {
            const [column, direction] = s.split(':');
            return {
                column: column || 'nombres',
                direction: (direction as 'asc' | 'desc') || 'asc'
            };
        });
    }

    return {
        toolbarFilters: { search, tipo },
        extraState: { estado },
        appliedToolbarFilters: { search, tipo },
        selectedId,
        page,
        pageSize,
        sort,
    };
}

// Función para parámetros del servicio
function getServiceParams(state: any) {
    const conditions: any[] = [];
    const { appliedToolbarFilters, extraState } = state;

    // Filtro de búsqueda
    const searchTerm = appliedToolbarFilters.search?.trim();
    if (searchTerm) {
        conditions.push({
            OR: [
                { nombres: { contains: searchTerm } },
                { apellido_paterno: { contains: searchTerm } },
                { apellido_materno: { contains: searchTerm } },
                { email: { contains: searchTerm } },
                { dni: { contains: searchTerm } },
            ],
        });
    }

    // Filtro de tipo
    if (appliedToolbarFilters.tipo.length > 0) {
        conditions.push({ tipo: { in: appliedToolbarFilters.tipo } });
    }

    // Filtro de estado
    if (extraState.estado !== 'all') {
        conditions.push({ estado: { equals: extraState.estado as any } });
    }

    // Construir WHERE final
    let finalWhere;
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
        sort: state.sort,
    };
}

// Crear el contexto
const { Provider, useFilters } = createGenericFiltersContext<UsuarioToolbarFilters, UsuarioExtraState>();

// Provider personalizado
export function UsuarioFiltersProvider({ children }: { children: ReactNode }) {
    return (
        <Provider
            initialState={initialState}
            stateToUrlParams={stateToUrlParams}
            urlParamsToState={urlParamsToState}
            getServiceParams={getServiceParams}
        >
            {children}
        </Provider>
    );
}

// Hook personalizado
export function useUsuarioFilters() {
    return useFilters();
}