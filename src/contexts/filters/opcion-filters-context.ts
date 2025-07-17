import { useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import type { EntityFiltersConfig } from './filter-config-types';

interface FiltersState {
    activeFilters: Record<string, any>; // todos los filtros aplicados (inmediatos + diferidos)
    extraState: Record<string, any>;
    sort: any[];
    page: number;
    pageSize: number;
    selectedId: string | null;
}

type FiltersAction =
    | { type: 'SET_IMMEDIATE_FILTER'; payload: { name: string; value: any } }
    | { type: 'APPLY_DEFERRED_FILTERS'; payload: Record<string, any> }
    | { type: 'SET_EXTRA_STATE'; payload: Record<string, any> }
    | { type: 'SET_SORT'; payload: any[] }
    | { type: 'SET_PAGE'; payload: number }
    | { type: 'SET_PAGE_SIZE'; payload: number }
    | { type: 'SET_SELECTED_ID'; payload: string | null }
    | { type: 'RESET_ALL_FILTERS'; payload: { config: EntityFiltersConfig } }
    | { type: 'LOAD_FROM_URL'; payload: { activeFilters: Record<string, any>; extraState: Record<string, any>; selectedId: string | null } };

// Utility function para limpiar filtros vacíos
const cleanEmptyFilters = (filters: Record<string, any>): Record<string, any> => {
    return Object.entries(filters).reduce((acc, [key, value]) => {
        if (
            value !== undefined &&
            value !== null &&
            !(typeof value === 'string' && value.trim() === '') &&
            !(Array.isArray(value) && value.length === 0)
        ) {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, any>);
};

// Utility function para parsear parámetros de URL
const parseUrlParams = (config: EntityFiltersConfig) => {
    if (typeof window === 'undefined') {
        return {
            activeFilters: {},
            extraState: { estado: 'all' },
            selectedId: null,
        };
    }

    const urlParams = new URLSearchParams(window.location.search);
    const activeFilters: Record<string, any> = {};
    const extraState: Record<string, any> = { estado: 'all' };
    let selectedId: string | null = null;

    // Parse known filter parameters
    config.filters.forEach(filter => {
        const value = urlParams.get(filter.name);
        if (value) {
            if (filter.type === 'multiselect') {
                activeFilters[filter.name] = value.split(',');
            } else {
                activeFilters[filter.name] = value;
            }
        }
    });

    // Parse search fields
    config.searchFields.forEach(field => {
        const value = urlParams.get(field);
        if (value) {
            activeFilters[field] = value;
        }
    });

    // Parse any other parameters as generic filters
    // This handles cases like ?tipo=ALCALDE that aren't defined in config
    const knownParams = new Set([
        ...config.filters.map(f => f.name),
        ...config.searchFields,
        'estado',
        'selectedId',
        'page',
        'pageSize',
        'sort'
    ]);

    urlParams.forEach((value, key) => {
        if (!knownParams.has(key) && value) {
            // Check if value contains commas (potential array)
            if (value.includes(',')) {
                activeFilters[key] = value.split(',');
            } else {
                activeFilters[key] = value;
            }
        }
    });

    // Parse estado parameter
    const estado = urlParams.get('estado');
    if (estado) {
        extraState.estado = estado;
    }

    // Parse selectedId parameter
    const selectedIdParam = urlParams.get('selectedId');
    if (selectedIdParam) {
        selectedId = selectedIdParam;
    }

    return {
        activeFilters: cleanEmptyFilters(activeFilters),
        extraState,
        selectedId,
    };
};

const filtersReducer = (state: FiltersState, action: FiltersAction): FiltersState => {
    switch (action.type) {
        case 'SET_IMMEDIATE_FILTER':
            return {
                ...state,
                activeFilters: {
                    ...state.activeFilters,
                    [action.payload.name]: action.payload.value
                },
                page: 0 // Reset page when filters change
            };

        case 'APPLY_DEFERRED_FILTERS': {
            const combined = { ...state.activeFilters, ...action.payload };
            const cleanedFilters = cleanEmptyFilters(combined);
            return {
                ...state,
                activeFilters: cleanedFilters,
                page: 0
            };
        }

        case 'SET_EXTRA_STATE':
            return {
                ...state,
                extraState: action.payload,
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
                page: action.payload
            };

        case 'SET_PAGE_SIZE':
            return {
                ...state,
                pageSize: action.payload,
                page: 0
            };

        case 'SET_SELECTED_ID':
            return {
                ...state,
                selectedId: action.payload
            };

        case 'RESET_ALL_FILTERS':
            return {
                activeFilters: {},
                extraState: { estado: 'all' },
                sort: action.payload.config.defaultSort,
                page: 0,
                pageSize: action.payload.config.defaultPageSize || 10,
                selectedId: null,
            };

        case 'LOAD_FROM_URL':
            return {
                ...state,
                activeFilters: action.payload.activeFilters,
                extraState: action.payload.extraState,
                selectedId: action.payload.selectedId,
                page: 0 // Reset page when loading from URL
            };

        default:
            return state;
    }
};

export function useFilters(config: EntityFiltersConfig) {
    const configRef = useRef(config);
    configRef.current = config;

    // Initialize state with URL parameters
    const initialState = useMemo(() => {
        const urlParams = parseUrlParams(config);
        return {
            activeFilters: urlParams.activeFilters,
            extraState: urlParams.extraState,
            sort: config.defaultSort,
            page: 0,
            pageSize: config.defaultPageSize || 10,
            selectedId: urlParams.selectedId,
        };
    }, [config]);

    const [state, dispatch] = useReducer(filtersReducer, initialState);

    // Actions - solo necesitan useCallback los que se pasan como props
    const setImmediateFilter = useCallback((name: string, value: any) => {
        dispatch({ type: 'SET_IMMEDIATE_FILTER', payload: { name, value } });
    }, []);

    // Cuando se hace click en “Actualizar”:
    const applyDeferredFilters = useCallback((deferred: Record<string, any>) => {
        dispatch({ type: 'APPLY_DEFERRED_FILTERS', payload: deferred });
    }, []);

    const setExtraState = useCallback((extra: Record<string, any>) => {
        dispatch({ type: 'SET_EXTRA_STATE', payload: extra });
    }, []);

    const setSort = useCallback((sort: any[]) => {
        dispatch({ type: 'SET_SORT', payload: sort });
    }, []);

    const setPage = useCallback((page: number) => {
        dispatch({ type: 'SET_PAGE', payload: page });
    }, []);

    const setPageSize = useCallback((pageSize: number) => {
        dispatch({ type: 'SET_PAGE_SIZE', payload: pageSize });
    }, []);

    const setSelectedId = useCallback((selectedId: string | null) => {
        dispatch({ type: 'SET_SELECTED_ID', payload: selectedId });
    }, []);

    const resetAllFilters = useCallback(() => {
        dispatch({ type: 'RESET_ALL_FILTERS', payload: { config: configRef.current } });
    }, []);

    const loadFromUrl = useCallback(() => {
        const urlParams = parseUrlParams(configRef.current);
        dispatch({ type: 'LOAD_FROM_URL', payload: urlParams });
    }, []);

    // Listen for popstate events (back/forward navigation)
    useEffect(() => {
        const handlePopState = () => {
            loadFromUrl();
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [loadFromUrl]);

    // Sincronizar la URL cada vez que cambian los filtros aplicados
    useEffect(() => {
        const params = new URLSearchParams();

        // Add all active filters to URL
        for (const key in state.activeFilters) {
            const value = state.activeFilters[key];
            if (Array.isArray(value) && value.length > 0) {
                params.set(key, value.join(','));
            } else if (typeof value === 'string' && value.trim() !== '') {
                params.set(key, value);
            } else if (value !== undefined && value !== null && value !== '') {
                params.set(key, String(value));
            }
        }

        // Add estado if not 'all'
        if (state.extraState?.estado && state.extraState.estado !== 'all') {
            params.set('estado', state.extraState.estado);
        }

        // Add selectedId if present
        if (state.selectedId) {
            params.set('selectedId', state.selectedId);
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
    }, [state.activeFilters, state.extraState, state.selectedId]);

    // Computed properties - optimizadas
    const hasActiveFilters = useMemo(() => {
        return Object.keys(state.activeFilters).length > 0 ||
            state.extraState.estado !== 'all' ||
            JSON.stringify(state.sort) !== JSON.stringify(configRef.current.defaultSort);
    }, [state.activeFilters, state.extraState.estado, state.sort]);

    const canReset = hasActiveFilters; // No necesita useMemo ya que es una simple referencia

    // Service params generator - optimizado con configRef
    const getServiceParams = useCallback(() => {
        const currentConfig = configRef.current;
        const conditions: any[] = [];

        // Search filters
        const searchTerm = state.activeFilters.search?.trim();
        if (searchTerm && currentConfig.searchFields.length > 0) {
            const searchConditions = currentConfig.searchFields.map(field => ({
                [field]: { contains: searchTerm }
            }));
            conditions.push({ OR: searchConditions });
        }

        // Known filters from config
        currentConfig.filters.forEach(filter => {
            const value = state.activeFilters[filter.name];
            if (value && (Array.isArray(value) ? value.length > 0 : value !== '')) {
                if (filter.name === 'search' && filter.searchFields) {
                    // Search filter already handled above
                } else if (filter.field && filter.operator) {
                    conditions.push({
                        [filter.field]: { [filter.operator]: value }
                    });
                }
            }
        });

        // Generic filters (not defined in config)
        const knownFilterNames = new Set([
            'search',
            ...currentConfig.filters.map(f => f.name),
            ...currentConfig.searchFields
        ]);

        Object.entries(state.activeFilters).forEach(([key, value]) => {
            if (!knownFilterNames.has(key) && value && (Array.isArray(value) ? value.length > 0 : value !== '')) {
                // For generic filters, use equals operator by default
                if (Array.isArray(value)) {
                    conditions.push({ [key]: { in: value } });
                } else {
                    conditions.push({ [key]: { equals: value } });
                }
            }
        });

        // Estado filter - solo usar extraState.estado si no hay filtro de estado en activeFilters
        const hasEstadoFilter = state.activeFilters.estado !== undefined && state.activeFilters.estado !== null;
        if (!hasEstadoFilter && state.extraState.estado !== 'all' && currentConfig.estadoField) {
            conditions.push({ [currentConfig.estadoField]: { equals: state.extraState.estado } });
        }

        // Build final WHERE
        let finalWhere;
        if (conditions.length === 0) {
            finalWhere = undefined;
        } else if (conditions.length === 1) {
            finalWhere = conditions[0];
        } else {
            finalWhere = { AND: conditions };
        }

        const params = {
            where: finalWhere,
            pagination: {
                page: state.page + 1,
                pageSize: state.pageSize,
            },
            sort: state.sort,
        };
        return params;
    }, [state]);

    // Verify selection helper - optimizado
    const verifySelection = useCallback((availableIds: string[], fromUrl: boolean = false) => {
        if (state.selectedId && !availableIds.includes(state.selectedId)) {
            setSelectedId(null);
        }
    }, [state.selectedId, setSelectedId]);

    // Return memoizado para evitar re-renders innecesarios
    const filtersApi = useMemo(() => ({
        state,
        setImmediateFilter,
        applyDeferredFilters,
        setExtraState,
        setSort,
        setPage,
        setPageSize,
        setSelectedId,
        resetAllFilters,
        loadFromUrl,
        hasActiveFilters,
        canReset,
        getServiceParams,
        verifySelection,
    }), [
        state,
        setImmediateFilter,
        applyDeferredFilters,
        setExtraState,
        setSort,
        setPage,
        setPageSize,
        setSelectedId,
        resetAllFilters,
        loadFromUrl,
        hasActiveFilters,
        canReset,
        getServiceParams,
        verifySelection,
    ]);

    return filtersApi;
} 