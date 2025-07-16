// src/contexts/filters/generic-filters-context.tsx

import { createContext, useContext, useCallback, useMemo, ReactNode, useReducer, useEffect, useRef } from 'react';

// Tipo más específico para sort
import type { SortConfig } from './types';
export type { SortConfig }; // Re-exportar para compatibilidad

// Tipos genéricos para filtros
export interface GenericFiltersState<ToolbarFilters = any, ExtraState = any> {
    // Filtros del toolbar (busqueda, selects, etc)
    toolbarFilters: ToolbarFilters;
    // Filtros de tabs, etc
    extraState: ExtraState;
    // Ordenamiento tipado
    sort: SortConfig[];
    // Paginación
    page: number;
    pageSize: number;
    // Selección única
    selectedId: string | null;
    // Filtros aplicados (para tracking de cambios pendientes)
    appliedToolbarFilters: ToolbarFilters;
}

export type GenericFiltersAction<ToolbarFilters, ExtraState> =
    | { type: 'SET_TOOLBAR_FILTERS'; payload: ToolbarFilters }
    | { type: 'SET_EXTRA_STATE'; payload: ExtraState }
    | { type: 'SET_SORT'; payload: SortConfig[] }
    | { type: 'SET_PAGE'; payload: number }
    | { type: 'SET_PAGE_SIZE'; payload: number }
    | { type: 'SET_SELECTED_ID'; payload: string | null }
    | { type: 'APPLY_TOOLBAR_FILTERS'; payload: ToolbarFilters }
    | { type: 'RESET_ALL_FILTERS'; payload: GenericFiltersState<ToolbarFilters, ExtraState> }
    | { type: 'INITIALIZE_FROM_URL'; payload: Partial<GenericFiltersState<ToolbarFilters, ExtraState>> }
    | { type: 'VERIFY_SELECTION'; payload: { availableIds: string[]; fromUrl?: boolean } };

export interface GenericFiltersContextValue<ToolbarFilters = any, ExtraState = any> {
    state: GenericFiltersState<ToolbarFilters, ExtraState>;
    hasPendingChanges: (localToolbarFilters?: ToolbarFilters) => boolean;
    setToolbarFilters: (filters: ToolbarFilters) => void;
    setExtraState: (extra: ExtraState) => void;
    setSort: (sort: SortConfig[]) => void;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    setSelectedId: (id: string | null) => void;
    applyToolbarFilters: (filters: ToolbarFilters) => void;
    resetPage: () => void;
    resetAllFilters: () => void;
    verifySelection: (availableIds: string[], fromUrl?: boolean) => void;
    hasActiveFilters: boolean;
    canReset: boolean;
    getServiceParams: () => any;
}

// Configuración del provider
interface GenericFiltersProviderProps<ToolbarFilters, ExtraState> {
    children: ReactNode;
    initialState: GenericFiltersState<ToolbarFilters, ExtraState>;
    stateToUrlParams: (state: GenericFiltersState<ToolbarFilters, ExtraState>) => string;
    urlParamsToState: (params: URLSearchParams) => Partial<GenericFiltersState<ToolbarFilters, ExtraState>>;
    getServiceParams: (state: GenericFiltersState<ToolbarFilters, ExtraState>) => any;
    // Nuevas opciones de configuración
    enableUrlSync?: boolean;
    urlSyncDebounce?: number;
    validateFilters?: (filters: unknown) => filters is ToolbarFilters;
}

// Función de comparación optimizada
function deepEqual<T>(a: T, b: T): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    if (typeof a === 'object') {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);

        if (aKeys.length !== bKeys.length) return false;

        for (const key of aKeys) {
            if (!bKeys.includes(key)) return false;
            if (!deepEqual((a as any)[key], (b as any)[key])) return false;
        }
        return true;
    }

    return false;
}

// Reducer con manejo de errores mejorado
function genericFiltersReducer<ToolbarFilters, ExtraState>(
    state: GenericFiltersState<ToolbarFilters, ExtraState>,
    action: GenericFiltersAction<ToolbarFilters, ExtraState>
): GenericFiltersState<ToolbarFilters, ExtraState> {
    try {
        switch (action.type) {
            case 'SET_TOOLBAR_FILTERS':
                return { ...state, toolbarFilters: action.payload, page: 0 };
            case 'SET_EXTRA_STATE':
                return { ...state, extraState: action.payload, page: 0 };
            case 'SET_SORT':
                return { ...state, sort: action.payload, page: 0 };
            case 'SET_PAGE':
                return { ...state, page: action.payload, selectedId: null };
            case 'SET_PAGE_SIZE':
                return { ...state, pageSize: action.payload, page: 0, selectedId: null };
            case 'SET_SELECTED_ID':
                return { ...state, selectedId: action.payload };
            case 'APPLY_TOOLBAR_FILTERS':
                return {
                    ...state,
                    toolbarFilters: action.payload,
                    page: 0,
                    appliedToolbarFilters: action.payload
                };
            case 'RESET_ALL_FILTERS':
                return { ...action.payload };
            case 'VERIFY_SELECTION': {
                const { availableIds, fromUrl } = action.payload;
                const currentSelectedId = state.selectedId;
                if (currentSelectedId && !availableIds.includes(currentSelectedId)) {
                    if (fromUrl) {
                        console.warn('Selected item not found in current results');
                    }
                    return { ...state, selectedId: null };
                }
                return state;
            }
            case 'INITIALIZE_FROM_URL':
                return { ...state, ...action.payload };
            default:
                console.warn('Unknown action type:', (action as any).type);
                return state;
        }
    } catch (error) {
        console.error('Error in filters reducer:', error);
        return state;
    }
}

// Hook personalizado para manejo de URL con debounce
function useUrlSync<T>(
    state: T,
    stateToUrlParams: (state: T) => string,
    enabled: boolean = true,
    debounceMs: number = 300
) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!enabled) return;

        // Limpiar timeout anterior
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            const urlParams = stateToUrlParams(state);
            const currentUrl = window.location.pathname;
            const newUrl = urlParams ? `${currentUrl}?${urlParams}` : currentUrl;

            if (window.location.href !== window.location.origin + newUrl) {
                window.history.replaceState({}, '', newUrl);
            }
        }, debounceMs);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [state, stateToUrlParams, enabled, debounceMs]);
}

export function createGenericFiltersContext<ToolbarFilters, ExtraState>() {
    const FiltersContext = createContext<GenericFiltersContextValue<ToolbarFilters, ExtraState> | undefined>(undefined);

    function Provider({
        children,
        initialState,
        stateToUrlParams,
        urlParamsToState,
        getServiceParams,
        enableUrlSync = true,
        urlSyncDebounce = 300,
        validateFilters
    }: GenericFiltersProviderProps<ToolbarFilters, ExtraState>) {
        const [state, dispatch] = useReducer(genericFiltersReducer<ToolbarFilters, ExtraState>, initialState);
        const isInitialized = useRef(false);

        // Inicializar desde URL una sola vez
        useEffect(() => {
            if (!isInitialized.current) {
                const params = new URLSearchParams(window.location.search);
                const urlState = urlParamsToState(params);

                // Validar filtros si se proporciona validador
                if (validateFilters && urlState.toolbarFilters) {
                    if (!validateFilters(urlState.toolbarFilters)) {
                        console.warn('Invalid filters from URL, using defaults');
                        urlState.toolbarFilters = initialState.toolbarFilters;
                        urlState.appliedToolbarFilters = initialState.appliedToolbarFilters;
                    }
                }

                dispatch({ type: 'INITIALIZE_FROM_URL', payload: urlState });
                isInitialized.current = true;
            }
        }, [urlParamsToState, validateFilters, initialState]);

        // Sincronizar con URL usando el hook personalizado
        useUrlSync(state, stateToUrlParams, enableUrlSync, urlSyncDebounce);

        // Función optimizada para detectar cambios pendientes
        const hasPendingChanges = useCallback((localToolbarFilters?: ToolbarFilters) => {
            const compare = localToolbarFilters !== undefined ? localToolbarFilters : state.toolbarFilters;
            return !deepEqual(compare, state.appliedToolbarFilters);
        }, [state.toolbarFilters, state.appliedToolbarFilters]);

        // Memoizar las funciones del contexto
        const setToolbarFilters = useCallback((filters: ToolbarFilters) => {
            dispatch({ type: 'SET_TOOLBAR_FILTERS', payload: filters });
        }, []);

        const setExtraState = useCallback((extra: ExtraState) => {
            dispatch({ type: 'SET_EXTRA_STATE', payload: extra });
        }, []);

        const setSort = useCallback((sort: SortConfig[]) => {
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

        const applyToolbarFilters = useCallback((filters: ToolbarFilters) => {
            dispatch({ type: 'APPLY_TOOLBAR_FILTERS', payload: filters });
        }, []);

        const resetPage = useCallback(() => {
            dispatch({ type: 'SET_PAGE', payload: 0 });
        }, []);

        const resetAllFilters = useCallback(() => {
            dispatch({ type: 'RESET_ALL_FILTERS', payload: initialState });
        }, [initialState]);

        const verifySelection = useCallback((availableIds: string[], fromUrl: boolean = false) => {
            dispatch({ type: 'VERIFY_SELECTION', payload: { availableIds, fromUrl } });
        }, []);

        // Memoizar valores computados
        const hasActiveFilters = useMemo(() => {
            return !deepEqual(state.appliedToolbarFilters, initialState.appliedToolbarFilters) ||
                !deepEqual(state.extraState, initialState.extraState) ||
                !deepEqual(state.sort, initialState.sort);
        }, [state.appliedToolbarFilters, state.extraState, state.sort, initialState]);

        const canReset = useMemo(() => hasActiveFilters, [hasActiveFilters]);

        const getServiceParamsMemo = useCallback(() => {
            return getServiceParams(state);
        }, [getServiceParams, state]);

        const value = useMemo(() => ({
            state,
            hasPendingChanges,
            setToolbarFilters,
            setExtraState,
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
            getServiceParams: getServiceParamsMemo,
        }), [
            state,
            hasPendingChanges,
            setToolbarFilters,
            setExtraState,
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
            getServiceParamsMemo,
        ]);

        return (
            <FiltersContext.Provider value={value}>
                {children}
            </FiltersContext.Provider>
        );
    }

    function useFilters() {
        const context = useContext(FiltersContext);
        if (!context) {
            throw new Error('useFilters must be used within a FiltersProvider');
        }
        return context;
    }

    return { Provider, useFilters };
}