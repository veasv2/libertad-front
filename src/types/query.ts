// src/types/query.ts

import type { PaginationConfig, SortConfig } from 'src/types/filters';

/**
 * Base para filtros con AND / OR
 */
export interface BaseWhere {
    AND?: BaseWhere[];
    OR?: BaseWhere[];
}

/**
 * Parámetros para listar entidades
 */
export interface ListParams<W = BaseWhere> {
    where?: W;
    pagination: PaginationConfig;
    sort?: SortConfig;
}

/**
 * Respuesta de API para listas
 */
export interface ApiResponse<T> {
    data: T[];
    total: number;
    inicio: number;
    fin: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    currentPage: number;
    appliedSort?: SortConfig;
}

/**
 * Resultado que combina API + estado frontend
 */
export interface ListResult<T> extends ApiResponse<T> {
    isLoading: boolean;
    error?: Error;
    refetch: () => void;
}

/**
 * Preset de filtros
 */
export interface FilterPreset<W = BaseWhere> {
    where?: W;
    sort?: SortConfig;
    description?: string;
}

/**
 * Conjunto de presets
 */
export interface Presets<W = BaseWhere> {
    [key: string]: FilterPreset<W>;
}
