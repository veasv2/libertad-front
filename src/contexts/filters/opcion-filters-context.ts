import { useState, useCallback, useMemo, useEffect } from 'react';
import type { EntityFiltersConfig } from './filter-config-types';

interface FiltersState {
    activeFilters: Record<string, any>; // todos los filtros aplicados (inmediatos + diferidos)
    extraState: Record<string, any>;
    sort: any[];
    page: number;
    pageSize: number;
    selectedId: string | null;
}

export function useFilters(config: EntityFiltersConfig) {
    const [state, setState] = useState<FiltersState>({
        activeFilters: {},
        extraState: { estado: 'all' },
        sort: config.defaultSort,
        page: 0,
        pageSize: config.defaultPageSize || 10,
        selectedId: null,
    });

    // Cuando se aplica un filtro inmediato:
    const setImmediateFilter = useCallback((name: string, value: any) => {
        setState(s => ({
            ...s,
            activeFilters: {
                ...s.activeFilters,
                [name]: value
            }
        }));
    }, []);

    // Cuando se hace click en “Actualizar”:
    const applyDeferredFilters = useCallback((deferred: Record<string, any>) => {
        setState(s => {
            // Combina los inmediatos (ya en activeFilters) con los diferidos (deferred)
            const combined = { ...s.activeFilters, ...deferred };
            // Elimina los filtros vacíos
            Object.keys(combined).forEach(key => {
                const v = combined[key];
                if (
                    v === undefined ||
                    v === null ||
                    (typeof v === 'string' && v.trim() === '') ||
                    (Array.isArray(v) && v.length === 0)
                ) {
                    delete combined[key];
                }
            });
            console.log('[CONTEXT] applyDeferredFilters - combined:', combined);
            return { ...s, activeFilters: combined };
        });
    }, []);

    const setExtraState = useCallback((extra: Record<string, any>) => {
        setState(s => ({ ...s, extraState: extra, page: 0 }));
    }, []);

    const setSort = useCallback((sort: any[]) => {
        setState(s => ({ ...s, sort, page: 0 }));
    }, []);

    const setPage = useCallback((page: number) => {
        setState(s => ({ ...s, page }));
    }, []);

    const setPageSize = useCallback((pageSize: number) => {
        setState(s => ({ ...s, pageSize, page: 0 }));
    }, []);

    const setSelectedId = useCallback((selectedId: string | null) => {
        setState(s => ({ ...s, selectedId }));
    }, []);

    const resetAllFilters = useCallback(() => {
        setState({
            activeFilters: {},
            extraState: { estado: 'all' },
            sort: config.defaultSort,
            page: 0,
            pageSize: config.defaultPageSize || 10,
            selectedId: null,
        });
    }, [config]);

    // Sincronizar la URL cada vez que cambian los filtros aplicados
    useEffect(() => {
        const params = new URLSearchParams();
        for (const key in state.activeFilters) {
            const value = state.activeFilters[key];
            if (Array.isArray(value) && value.length > 0) {
                params.set(key, value.join(','));
            } else if (typeof value === 'string' && value.trim() !== '') {
                params.set(key, value);
            }
        }
        if (state.extraState?.estado && state.extraState.estado !== 'all') {
            params.set('estado', state.extraState.estado);
        }
        if (state.selectedId) {
            params.set('selectedId', state.selectedId);
        }
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }, [state.activeFilters, state.extraState, state.selectedId]);

    // Computed properties
    const hasActiveFilters = useMemo(() => {
        return JSON.stringify(state.activeFilters) !== JSON.stringify({}) ||
            state.extraState.estado !== 'all' ||
            JSON.stringify(state.sort) !== JSON.stringify(config.defaultSort);
    }, [state.activeFilters, state.extraState.estado, state.sort, config.defaultSort]);

    const canReset = useMemo(() => hasActiveFilters, [hasActiveFilters]);

    // Service params generator
    const getServiceParams = useCallback(() => {
        const conditions: any[] = [];

        // Search filters
        const searchTerm = state.activeFilters.search?.trim();
        if (searchTerm && config.searchFields.length > 0) {
            const searchConditions = config.searchFields.map(field => ({
                [field]: { contains: searchTerm }
            }));
            conditions.push({ OR: searchConditions });
        }

        // Additional filters
        config.filters.forEach(filter => {
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

        // Estado filter
        if (state.extraState.estado !== 'all' && config.estadoField) {
            conditions.push({ [config.estadoField]: { equals: state.extraState.estado } });
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
        console.log('[CONTEXT] getServiceParams - params enviados al backend:', params);
        return params;
    }, [state, config]);

    // Verify selection helper
    const verifySelection = useCallback((availableIds: string[], fromUrl: boolean = false) => {
        if (state.selectedId && !availableIds.includes(state.selectedId)) {
            if (fromUrl) {
                console.warn('Selected item not found in current results');
            }
            setSelectedId(null);
        }
    }, [state.selectedId, setSelectedId]);

    // Al final, retorna SIEMPRE un nuevo objeto para forzar reactividad
    const filtersApi = {
        state,
        setImmediateFilter,
        applyDeferredFilters,
        setExtraState,
        setSort,
        setPage,
        setPageSize,
        setSelectedId,
        resetAllFilters,
        hasActiveFilters,
        canReset,
        getServiceParams,
        verifySelection,
    };
    // Log para depuración
    console.log('[CONTEXT] useFilters re-render, state:', state);
    return filtersApi;
} 