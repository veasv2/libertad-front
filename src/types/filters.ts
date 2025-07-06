// src/types/filters.ts

/**
 * Filtros para campos de texto/string
 */
export interface StringFilter {
    equals?: string;
    contains?: string;
    startsWith?: string;
    endsWith?: string;
    in?: string[];
}

/**
 * Filtros para campos numéricos
 */
export interface NumberFilter {
    equals?: number;
    gt?: number;        // greater than
    gte?: number;       // greater than or equal
    lt?: number;        // less than
    lte?: number;       // less than or equal
    in?: number[];
}

/**
 * Filtros para campos de fecha
 */
export interface DateFilter {
    equals?: Date | string;
    gt?: Date | string;
    gte?: Date | string;
    lt?: Date | string;
    lte?: Date | string;
    in?: (Date | string)[];
}

/**
 * Filtros para campos enum/selección
 */
export interface EnumFilter<T = string> {
    equals?: T;
    in?: T[];
}

/**
 * Filtros para campos booleanos
 */
export interface BooleanFilter {
    equals?: boolean;
}

// ----------------------------------------------------------------------
// Configuración de paginación
// ----------------------------------------------------------------------

export interface PaginationConfig {
    page: number;          // página actual (1-indexed)
    pageSize: number;      // registros por página
}

// ----------------------------------------------------------------------
// Resultado paginado genérico
// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------
// Base para parámetros de consulta
// ----------------------------------------------------------------------

export interface BaseListParams<W = any> {
    where?: W;
    pagination?: PaginationConfig;
}