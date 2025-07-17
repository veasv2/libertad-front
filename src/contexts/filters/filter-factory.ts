// src/contexts/filters/filter-factory.ts

import { createGenericFiltersContext } from './generic-filters-context';
import type { SortConfig } from './types';

// Tipos base para filtros comunes
export interface BaseToolbarFilters {
    search: string;
}

export interface BaseExtraState {
    estado: string;
}

// Configuración para crear filtros específicos
export interface FilterConfig<ToolbarFilters extends BaseToolbarFilters, ExtraState extends BaseExtraState> {
    // Configuración de búsqueda
    searchFields: string[];
    // Configuración de filtros adicionales
    additionalFilters?: {
        [K in keyof ToolbarFilters]?: {
            field: string;
            operator: 'equals' | 'in' | 'contains' | 'startsWith' | 'endsWith';
            transform?: (value: any) => any;
        };
    };
    // Configuración de estado
    estadoField?: string;
    // Configuración de ordenamiento por defecto
    defaultSort: SortConfig[];
    // Configuración de paginación
    defaultPageSize?: number;
    // Validadores personalizados
    validateFilters?: (filters: unknown) => filters is ToolbarFilters;
    validateExtraState?: (extra: unknown) => extra is ExtraState;
}

// Factory para crear filtros específicos
export function createEntityFilters<ToolbarFilters extends BaseToolbarFilters, ExtraState extends BaseExtraState>(
    config: FilterConfig<ToolbarFilters, ExtraState>
) {
    const { Provider, useFilters } = createGenericFiltersContext<ToolbarFilters, ExtraState>();

    // Estado inicial
    const getInitialState = (): any => ({
        toolbarFilters: {
            search: '',
            ...Object.keys(config.additionalFilters || {}).reduce((acc, key) => {
                const filterConfig = config.additionalFilters![key as keyof typeof config.additionalFilters];
                // Determinar si debe ser array basado en el operador
                acc[key] = (filterConfig as any)?.operator === 'in' ? [] : '';
                return acc;
            }, {} as any)
        },
        extraState: {
            estado: 'all',
        },
        sort: config.defaultSort,
        page: 0,
        pageSize: config.defaultPageSize || 10,
        selectedId: null,
        appliedToolbarFilters: {
            search: '',
            ...Object.keys(config.additionalFilters || {}).reduce((acc, key) => {
                const filterConfig = config.additionalFilters![key as keyof typeof config.additionalFilters];
                // Determinar si debe ser array basado en el operador
                acc[key] = (filterConfig as any)?.operator === 'in' ? [] : '';
                return acc;
            }, {} as any)
        },
    });

    // Función para convertir estado a URL
    const stateToUrlParams = (state: any) => {
        const params = new URLSearchParams();

        // Búsqueda
        if (state.appliedToolbarFilters.search?.trim()) {
            params.set('search', state.appliedToolbarFilters.search.trim());
        }

        // Filtros adicionales
        if (config.additionalFilters) {
            Object.entries(config.additionalFilters).forEach(([key, filterConfig]) => {
                const value = state.appliedToolbarFilters[key];
                if (value && (Array.isArray(value) ? value.length > 0 : value !== '')) {
                    const serializedValue = Array.isArray(value) ? value.join(',') : value;
                    params.set(key, serializedValue);
                }
            });
        }

        // Estado
        if (state.extraState.estado !== 'all') {
            params.set('estado', state.extraState.estado);
        }

        // Selección
        if (state.selectedId) {
            params.set('selectedId', state.selectedId);
        }

        // Paginación
        if (state.page > 0) {
            params.set('page', state.page.toString());
        }

        if (state.pageSize !== (config.defaultPageSize || 10)) {
            params.set('pageSize', state.pageSize.toString());
        }

        // Ordenamiento
        const currentSort = state.sort[0];
        if (currentSort && !config.defaultSort.some(defaultSort =>
            defaultSort.column === currentSort.column && defaultSort.direction === currentSort.direction
        )) {
            const sortParam = state.sort.map((s: any) => `${s.column}:${s.direction}`).join(',');
            params.set('sort', sortParam);
        }

        return params.toString();
    };

    // Función para convertir URL a estado
    const urlParamsToState = (params: URLSearchParams) => {
        const search = params.get('search')?.trim() || '';
        const estado = params.get('estado') || 'all';
        const selectedId = params.get('selectedId') || null;
        const page = Math.max(0, parseInt(params.get('page') || '0', 10) || 0);
        const pageSize = Math.max(1, parseInt(params.get('pageSize') || (config.defaultPageSize || 10).toString(), 10) || (config.defaultPageSize || 10));

        // Parsear filtros adicionales
        const toolbarFilters: any = { search };
        if (config.additionalFilters) {
            Object.entries(config.additionalFilters).forEach(([key, filterConfig]) => {
                const paramValue = params.get(key);
                if (paramValue) {
                    const filterConfigForKey = config.additionalFilters![key as keyof typeof config.additionalFilters];
                    if ((filterConfigForKey as any)?.operator === 'in') {
                        toolbarFilters[key] = paramValue.split(',').filter(Boolean);
                    } else {
                        toolbarFilters[key] = paramValue;
                    }
                } else {
                    const filterConfigForKey = config.additionalFilters![key as keyof typeof config.additionalFilters];
                    toolbarFilters[key] = (filterConfigForKey as any)?.operator === 'in' ? [] : '';
                }
            });
        }

        // Parsear ordenamiento
        const sortParam = params.get('sort');
        let sort = config.defaultSort;
        if (sortParam) {
            sort = sortParam.split(',').map(s => {
                const [column, direction] = s.split(':');
                return {
                    column: column || config.defaultSort[0].column,
                    direction: (direction as 'asc' | 'desc') || 'asc'
                };
            });
        }

        return {
            toolbarFilters,
            extraState: { estado },
            appliedToolbarFilters: toolbarFilters,
            selectedId,
            page,
            pageSize,
            sort,
        };
    };

    // Función para parámetros del servicio
    const getServiceParams = (state: any) => {
        const conditions: any[] = [];
        const { appliedToolbarFilters, extraState } = state;

        // Filtro de búsqueda
        const searchTerm = appliedToolbarFilters.search?.trim();
        if (searchTerm && config.searchFields.length > 0) {
            const searchConditions = config.searchFields.map(field => ({
                [field]: { contains: searchTerm }
            }));
            conditions.push({ OR: searchConditions });
        }

        // Filtros adicionales
        if (config.additionalFilters) {
            Object.entries(config.additionalFilters).forEach(([key, filterConfig]) => {
                const value = appliedToolbarFilters[key];
                if (value && (Array.isArray(value) ? value.length > 0 : value !== '')) {
                    const transformedValue = filterConfig.transform ? filterConfig.transform(value) : value;
                    conditions.push({
                        [filterConfig.field]: { [filterConfig.operator]: transformedValue }
                    });
                }
            });
        }

        // Filtro de estado
        if (extraState.estado !== 'all' && config.estadoField) {
            conditions.push({ [config.estadoField]: { equals: extraState.estado } });
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
    };

    return {
        Provider,
        useFilters,
        getInitialState,
        stateToUrlParams,
        urlParamsToState,
        getServiceParams,
        config
    };
} 