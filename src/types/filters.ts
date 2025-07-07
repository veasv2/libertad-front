// src/types/filters.ts

export interface StringFilter {
    equals?: string;
    contains?: string;
    startsWith?: string;
    endsWith?: string;
    in?: string[];
}

export interface NumberFilter {
    equals?: number;
    gt?: number;        // greater than
    gte?: number;       // greater than or equal
    lt?: number;        // less than
    lte?: number;       // less than or equal
    in?: number[];
}

export interface DateFilter {
    equals?: Date | string;
    gt?: Date | string;
    gte?: Date | string;
    lt?: Date | string;
    lte?: Date | string;
    in?: (Date | string)[];
}

export interface EnumFilter<T = string> {
    equals?: T;
    in?: T[];
}

export interface BooleanFilter {
    equals?: boolean;
}

export interface SortColumn {
    column: string;
    direction: 'asc' | 'desc';
}

export type SortConfig = SortColumn[];


// ================================================================
// RESULTADO PAGINADO
// ================================================================

export interface PaginationConfig {
    page: number;
    pageSize: number;
}

export interface PaginatedResult<T> {
    data: T[];              // datos de la página actual
    total: number;          // total de registros después de filtros
    inicio: number;         // índice del primer elemento (1-indexed)
    fin: number;           // índice del último elemento
    totalPages: number;     // total de páginas
    hasNextPage: boolean;   // hay página siguiente
    hasPrevPage: boolean;   // hay página anterior
    currentPage: number;    // página actual
}

export interface BaseListParams<W = any> {
    where?: W;
    pagination?: PaginationConfig;
    sort?: SortConfig;      // ← NUEVO: Ordenamiento
}