// src/lib/filter-engine.ts

import type {
    StringFilter,
    NumberFilter,
    DateFilter,
    EnumFilter,
    BooleanFilter,
    PaginationConfig,
    PaginatedResult
} from 'src/types/filters';

// ----------------------------------------------------------------------

/**
 * Aplica filtro de texto a un valor
 */
function applyStringFilter(value: string | undefined | null, filter: StringFilter): boolean {
    if (!value) return false;

    const valueStr = value.toString().toLowerCase();

    if (filter.equals !== undefined) {
        return valueStr === filter.equals.toLowerCase();
    }

    if (filter.contains !== undefined) {
        return valueStr.includes(filter.contains.toLowerCase());
    }

    if (filter.startsWith !== undefined) {
        return valueStr.startsWith(filter.startsWith.toLowerCase());
    }

    if (filter.endsWith !== undefined) {
        return valueStr.endsWith(filter.endsWith.toLowerCase());
    }

    if (filter.in !== undefined && filter.in.length > 0) {
        return filter.in.some(item => valueStr === item.toLowerCase());
    }

    return true;
}

/**
 * Aplica filtro numérico a un valor
 */
function applyNumberFilter(value: number | undefined | null, filter: NumberFilter): boolean {
    if (value === undefined || value === null) return false;

    if (filter.equals !== undefined) {
        return value === filter.equals;
    }

    if (filter.gt !== undefined) {
        return value > filter.gt;
    }

    if (filter.gte !== undefined) {
        return value >= filter.gte;
    }

    if (filter.lt !== undefined) {
        return value < filter.lt;
    }

    if (filter.lte !== undefined) {
        return value <= filter.lte;
    }

    if (filter.in !== undefined && filter.in.length > 0) {
        return filter.in.includes(value);
    }

    return true;
}

/**
 * Aplica filtro de fecha a un valor
 */
function applyDateFilter(value: string | Date | undefined | null, filter: DateFilter): boolean {
    if (!value) return false;

    const dateValue = new Date(value).getTime();

    if (filter.equals !== undefined) {
        const compareDate = new Date(filter.equals).getTime();
        return dateValue === compareDate;
    }

    if (filter.gt !== undefined) {
        const compareDate = new Date(filter.gt).getTime();
        return dateValue > compareDate;
    }

    if (filter.gte !== undefined) {
        const compareDate = new Date(filter.gte).getTime();
        return dateValue >= compareDate;
    }

    if (filter.lt !== undefined) {
        const compareDate = new Date(filter.lt).getTime();
        return dateValue < compareDate;
    }

    if (filter.lte !== undefined) {
        const compareDate = new Date(filter.lte).getTime();
        return dateValue <= compareDate;
    }

    if (filter.in !== undefined && filter.in.length > 0) {
        return filter.in.some(date => {
            const compareDate = new Date(date).getTime();
            return dateValue === compareDate;
        });
    }

    return true;
}

/**
 * Aplica filtro enum a un valor
 */
function applyEnumFilter<T>(value: T | undefined | null, filter: EnumFilter<T>): boolean {
    if (value === undefined || value === null) return false;

    if (filter.equals !== undefined) {
        return value === filter.equals;
    }

    if (filter.in !== undefined && filter.in.length > 0) {
        return filter.in.includes(value);
    }

    return true;
}

/**
 * Aplica filtro booleano a un valor
 */
function applyBooleanFilter(value: boolean | undefined | null, filter: BooleanFilter): boolean {
    if (value === undefined || value === null) return false;

    if (filter.equals !== undefined) {
        return value === filter.equals;
    }

    return true;
}

// ----------------------------------------------------------------------

/**
 * Aplica un filtro específico a un objeto
 */
export function applyFieldFilter<T>(
    item: T,
    field: keyof T,
    filter: StringFilter | NumberFilter | DateFilter | EnumFilter<any> | BooleanFilter
): boolean {
    const value = item[field];

    // Determinar tipo de filtro y aplicar
    if ('contains' in filter || 'startsWith' in filter || 'endsWith' in filter) {
        return applyStringFilter(value as string, filter as StringFilter);
    }

    if ('gt' in filter || 'gte' in filter || 'lt' in filter || 'lte' in filter) {
        // Podría ser número o fecha
        if (value instanceof Date || typeof value === 'string') {
            return applyDateFilter(value as string | Date, filter as DateFilter);
        } else {
            return applyNumberFilter(value as number, filter as NumberFilter);
        }
    }

    if ('equals' in filter) {
        if (typeof value === 'boolean') {
            return applyBooleanFilter(value, filter as BooleanFilter);
        }
        if (typeof value === 'string') {
            return applyStringFilter(value, filter as StringFilter);
        }
        if (typeof value === 'number') {
            return applyNumberFilter(value, filter as NumberFilter);
        }
        if (value instanceof Date || typeof value === 'string') {
            return applyDateFilter(value as string | Date, filter as DateFilter);
        }
        // Para enums y otros tipos
        return applyEnumFilter(value, filter as EnumFilter<any>);
    }

    if ('in' in filter) {
        if (typeof value === 'string') {
            return applyStringFilter(value, filter as StringFilter);
        }
        if (typeof value === 'number') {
            return applyNumberFilter(value, filter as NumberFilter);
        }
        if (value instanceof Date || typeof value === 'string') {
            return applyDateFilter(value as string | Date, filter as DateFilter);
        }
        // Para enums
        return applyEnumFilter(value, filter as EnumFilter<any>);
    }

    return true;
}

// ----------------------------------------------------------------------

/**
 * Aplica paginación a un array de datos
 */
export function applyPagination<T>(
    data: T[],
    pagination: PaginationConfig
): PaginatedResult<T> {
    const { page, pageSize } = pagination;
    const total = data.length;
    const totalPages = Math.ceil(total / pageSize);
    const inicio = (page - 1) * pageSize;
    const fin = Math.min(inicio + pageSize, total);

    const paginatedData = data.slice(inicio, inicio + pageSize);

    return {
        data: paginatedData,
        total,
        inicio: inicio + 1, // 1-indexed para mostrar
        fin,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        currentPage: page,
    };
}