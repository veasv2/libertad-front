// src/sections/seguridad/usuario/usuario-filters-context.tsx

'use client';

import { createContext, useContext, useCallback, useMemo, ReactNode, useReducer, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

    // Selección única
    selectedId: string | null;

    // Filtros aplicados (para tracking de cambios pendientes)
    appliedToolbarFilters: {
        search: string;
        tipo: TipoUsuarioValue[];
    };
}

type UsuarioFiltersAction =
    | { type: 'SET_SEARCH'; payload: string }
    | { type: 'SET_TIPO'; payload: TipoUsuarioValue[] }
    | { type: 'SET_ESTADO'; payload: string }
    | { type: 'SET_SORT'; payload: SortConfig }
    | { type: 'SET_PAGE'; payload: number }
    | { type: 'SET_PAGE_SIZE'; payload: number }
    | { type: 'SET_SELECTED_ID'; payload: string | null }
    | { type: 'APPLY_TOOLBAR_FILTERS'; payload: { search: string; tipo: TipoUsuarioValue[] } }
    | { type: 'RESET_ALL_FILTERS' }
    | { type: 'INITIALIZE_FROM_URL'; payload: Partial<UsuarioFiltersState> }
    | { type: 'VERIFY_SELECTION'; payload: { availableIds: string[]; fromUrl?: boolean } };

interface UsuarioFiltersContextValue {
    // Estado actual
    state: UsuarioFiltersState;

    // Función para verificar cambios pendientes
    hasPendingChanges: (localSearch?: string, localTipo?: TipoUsuarioValue[]) => boolean;

    // Acciones específicas
    setSearch: (search: string) => void;
    setTipo: (tipo: TipoUsuarioValue[]) => void;
    setEstado: (estado: string) => void;
    setSort: (sort: SortConfig) => void;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    setSelectedId: (id: string | null) => void;

    // Acciones compuestas
    applyToolbarFilters: (search: string, tipo: TipoUsuarioValue[]) => void;
    resetPage: () => void;
    resetAllFilters: () => void;
    verifySelection: (availableIds: string[], fromUrl?: boolean) => void;

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
    selectedId: null,
    appliedToolbarFilters: {
        search: '',
        tipo: []
    }
};

function usuarioFiltersReducer(state: UsuarioFiltersState, action: UsuarioFiltersAction): UsuarioFiltersState {
    switch (action.type) {
        case 'SET_SEARCH':
            return {
                ...state,
                search: action.payload,
                page: 0
            };

        case 'SET_TIPO':
            return {
                ...state,
                tipo: action.payload,
                page: 0
            };

        case 'SET_ESTADO':
            return {
                ...state,
                estado: action.payload,
                page: 0
            };

        case 'SET_SORT':
            return {
                ...state,
                sort: action.payload,
                page: 0
            };

        case 'SET_PAGE':
            return {
                ...state,
                page: action.payload,
                selectedId: null // Limpiar selección al cambiar página
            };

        case 'SET_PAGE_SIZE':
            return {
                ...state,
                pageSize: action.payload,
                page: 0,
                selectedId: null // Limpiar selección al cambiar página
            };

        case 'SET_SELECTED_ID':
            return {
                ...state,
                selectedId: action.payload
            };

        case 'APPLY_TOOLBAR_FILTERS':
            return {
                ...state,
                search: action.payload.search,
                tipo: action.payload.tipo,
                page: 0,
                appliedToolbarFilters: {
                    search: action.payload.search,
                    tipo: action.payload.tipo
                }
            };

        case 'RESET_ALL_FILTERS':
            return {
                ...initialState
            };

        case 'VERIFY_SELECTION':
            const { availableIds, fromUrl } = action.payload;
            const currentSelectedId = state.selectedId;

            if (currentSelectedId && !availableIds.includes(currentSelectedId)) {
                // Si hay selección pero no está en resultados disponibles
                if (fromUrl) {
                    // Solo mostrar toast si viene de URL (carga inicial)
                    // El toast se manejará en el componente que llama a esta acción
                    console.warn('Selected item not found in current results');
                }
                return {
                    ...state,
                    selectedId: null // Limpiar selección silenciosamente
                };
            }
            return state;

        case 'INITIALIZE_FROM_URL':
            return {
                ...state,
                ...action.payload
            };

        default:
            return state;
    }
}

const UsuarioFiltersContext = createContext<UsuarioFiltersContextValue | undefined>(undefined);

// ----------------------------------------------------------------------

interface UsuarioFiltersProviderProps {
    children: ReactNode;
}

export function UsuarioFiltersProvider({ children }: UsuarioFiltersProviderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [state, dispatch] = useReducer(usuarioFiltersReducer, initialState);

    // Función para convertir estado a URL params
    const stateToUrlParams = useCallback((filterState: UsuarioFiltersState) => {
        const params = new URLSearchParams();

        // Solo agregar parámetros que no sean valores por defecto
        if (filterState.appliedToolbarFilters.search) {
            params.set('search', filterState.appliedToolbarFilters.search);
        }

        if (filterState.appliedToolbarFilters.tipo.length > 0) {
            params.set('tipo', filterState.appliedToolbarFilters.tipo.join(','));
        }

        if (filterState.estado !== 'all') {
            params.set('estado', filterState.estado);
        }

        if (filterState.selectedId) {
            params.set('selectedId', filterState.selectedId);
        }

        if (filterState.page > 0) {
            params.set('page', filterState.page.toString());
        }

        if (filterState.pageSize !== 10) {
            params.set('pageSize', filterState.pageSize.toString());
        }

        if (filterState.sort[0]?.column !== 'nombres' || filterState.sort[0]?.direction !== 'asc') {
            const sortParam = filterState.sort.map(s => `${s.column}:${s.direction}`).join(',');
            params.set('sort', sortParam);
        }

        return params.toString();
    }, []);

    // Función para parsear URL params a estado
    const urlParamsToState = useCallback((params: URLSearchParams): Partial<UsuarioFiltersState> => {
        const search = params.get('search') || '';
        const tipoParam = params.get('tipo');
        const tipo = tipoParam ? tipoParam.split(',') as TipoUsuarioValue[] : [];
        const estado = params.get('estado') || 'all';
        const selectedId = params.get('selectedId') || null;
        const page = parseInt(params.get('page') || '0');
        const pageSize = parseInt(params.get('pageSize') || '10');

        const sortParam = params.get('sort');
        let sort: SortConfig = [{ column: 'nombres', direction: 'asc' }];
        if (sortParam) {
            sort = sortParam.split(',').map(s => {
                const [column, direction] = s.split(':');
                return { column, direction: direction as 'asc' | 'desc' };
            });
        }

        return {
            search,
            tipo,
            estado,
            selectedId,
            page,
            pageSize,
            sort,
            appliedToolbarFilters: {
                search,
                tipo
            }
        };
    }, []);

    // Inicializar desde URL al montar
    useEffect(() => {
        const urlState = urlParamsToState(searchParams);
        dispatch({ type: 'INITIALIZE_FROM_URL', payload: urlState });
    }, []); // Solo al montar

    // Sincronizar cambios de estado con URL
    useEffect(() => {
        const urlParams = stateToUrlParams(state);
        const currentUrl = window.location.pathname;
        const newUrl = urlParams ? `${currentUrl}?${urlParams}` : currentUrl;

        // Solo actualizar si la URL realmente cambió
        if (window.location.href !== window.location.origin + newUrl) {
            router.replace(newUrl, { scroll: false });
        }
    }, [state, stateToUrlParams, router]);

    // Función para verificar cambios pendientes
    const hasPendingChanges = useCallback((localSearch?: string, localTipo?: TipoUsuarioValue[]) => {
        const searchToCompare = localSearch !== undefined ? localSearch : state.search;
        const tipoToCompare = localTipo !== undefined ? localTipo : state.tipo;

        return (
            searchToCompare !== state.appliedToolbarFilters.search ||
            JSON.stringify(tipoToCompare) !== JSON.stringify(state.appliedToolbarFilters.tipo)
        );
    }, [state.search, state.tipo, state.appliedToolbarFilters]);

    // Acciones específicas
    const setSearch = useCallback((search: string) => {
        dispatch({ type: 'SET_SEARCH', payload: search });
    }, []);

    const setTipo = useCallback((tipo: TipoUsuarioValue[]) => {
        dispatch({ type: 'SET_TIPO', payload: tipo });
    }, []);

    const setEstado = useCallback((estado: string) => {
        dispatch({ type: 'SET_ESTADO', payload: estado });
    }, []);

    const setSort = useCallback((sort: SortConfig) => {
        dispatch({ type: 'SET_SORT', payload: sort });
    }, []);

    const setPage = useCallback((page: number) => {
        dispatch({ type: 'SET_PAGE', payload: page });
    }, []);

    const setPageSize = useCallback((pageSize: number) => {
        dispatch({ type: 'SET_PAGE_SIZE', payload: pageSize });
    }, []);

    const setSelectedId = useCallback((id: string | null) => {
        dispatch({ type: 'SET_SELECTED_ID', payload: id });
    }, []);

    // Acciones compuestas
    const applyToolbarFilters = useCallback((search: string, tipo: TipoUsuarioValue[]) => {
        dispatch({ type: 'APPLY_TOOLBAR_FILTERS', payload: { search, tipo } });
    }, []);

    const resetPage = useCallback(() => {
        dispatch({ type: 'SET_PAGE', payload: 0 });
    }, []);

    const resetAllFilters = useCallback(() => {
        dispatch({ type: 'RESET_ALL_FILTERS' });
    }, []);

    const verifySelection = useCallback((availableIds: string[], fromUrl: boolean = false) => {
        dispatch({ type: 'VERIFY_SELECTION', payload: { availableIds, fromUrl } });
    }, []);

    // Verificaciones
    const hasActiveFilters = useMemo(() => {
        return !!(
            state.appliedToolbarFilters.search ||
            state.appliedToolbarFilters.tipo.length > 0 ||
            state.estado !== 'all'
        );
    }, [state.appliedToolbarFilters.search, state.appliedToolbarFilters.tipo.length, state.estado]);

    const canReset = useMemo(() => {
        return hasActiveFilters;
    }, [hasActiveFilters]);

    // Parámetros para el servicio (usando filtros aplicados)
    const getServiceParams = useCallback(() => {
        const conditions: UsuarioWhere[] = [];

        // 1. Filtro de búsqueda de texto (OR anidado) - usar filtros aplicados
        if (state.appliedToolbarFilters.search && state.appliedToolbarFilters.search.trim()) {
            const searchTerm = state.appliedToolbarFilters.search.trim();
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

        // 2. Filtro de tipo (AND) - usar filtros aplicados
        if (state.appliedToolbarFilters.tipo && state.appliedToolbarFilters.tipo.length > 0) {
            conditions.push({
                tipo: { in: state.appliedToolbarFilters.tipo }
            });
        }

        // 3. Filtro de estado del tab (AND) - este se aplica inmediatamente
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
    }, [state.appliedToolbarFilters, state.estado, state.page, state.pageSize, state.sort]);

    const value = useMemo(() => ({
        state,
        hasPendingChanges,
        setSearch,
        setTipo,
        setEstado,
        setSort,
        setPage,
        setPageSize,
        setSelectedId,
        applyToolbarFilters,
        resetPage,
        resetAllFilters,
        verifySelection,
        hasActiveFilters,
        canReset,
        getServiceParams,
    }), [
        state,
        hasPendingChanges,
        setSearch,
        setTipo,
        setEstado,
        setSort,
        setPage,
        setPageSize,
        setSelectedId,
        applyToolbarFilters,
        resetPage,
        resetAllFilters,
        verifySelection,
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