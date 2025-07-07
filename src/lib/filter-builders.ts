// src/lib/filter-builders.ts

import type { SortConfig, SortColumn } from 'src/types/filters';

// ================================================================
// BUILDER PARA ORDENAMIENTO
// ================================================================

export class SortBuilder {
    private sorts: SortColumn[] = [];

    asc(column: string): this {
        this.sorts.push({ column, direction: 'asc' });
        return this;
    }

    desc(column: string): this {
        this.sorts.push({ column, direction: 'desc' });
        return this;
    }

    clear(): this {
        this.sorts = [];
        return this;
    }

    build(): SortConfig {
        return this.sorts;
    }
}

export class FilterBuilder<T> {
    protected filters: Partial<T> = {};

    // Métodos para filtros de string
    stringEquals(field: keyof T, value: string): this {
        this.filters[field] = { equals: value } as T[keyof T];
        return this;
    }

    stringContains(field: keyof T, value: string): this {
        this.filters[field] = { contains: value } as T[keyof T];
        return this;
    }

    stringStartsWith(field: keyof T, value: string): this {
        this.filters[field] = { startsWith: value } as T[keyof T];
        return this;
    }

    stringIn(field: keyof T, values: string[]): this {
        this.filters[field] = { in: values } as T[keyof T];
        return this;
    }

    // Métodos para filtros de número
    numberEquals(field: keyof T, value: number): this {
        this.filters[field] = { equals: value } as T[keyof T];
        return this;
    }

    numberGreaterThan(field: keyof T, value: number): this {
        this.filters[field] = { gt: value } as T[keyof T];
        return this;
    }

    numberGreaterOrEqual(field: keyof T, value: number): this {
        this.filters[field] = { gte: value } as T[keyof T];
        return this;
    }

    numberLessThan(field: keyof T, value: number): this {
        this.filters[field] = { lt: value } as T[keyof T];
        return this;
    }

    numberLessOrEqual(field: keyof T, value: number): this {
        this.filters[field] = { lte: value } as T[keyof T];
        return this;
    }

    numberIn(field: keyof T, values: number[]): this {
        this.filters[field] = { in: values } as T[keyof T];
        return this;
    }

    // Métodos para filtros de fecha
    dateEquals(field: keyof T, value: string | Date): this {
        const dateStr = value instanceof Date ? value.toISOString() : value;
        this.filters[field] = { equals: dateStr } as T[keyof T];
        return this;
    }

    dateAfter(field: keyof T, value: string | Date): this {
        const dateStr = value instanceof Date ? value.toISOString() : value;
        this.filters[field] = { gt: dateStr } as T[keyof T];
        return this;
    }

    dateBefore(field: keyof T, value: string | Date): this {
        const dateStr = value instanceof Date ? value.toISOString() : value;
        this.filters[field] = { lt: dateStr } as T[keyof T];
        return this;
    }

    dateRange(field: keyof T, from: string | Date, to: string | Date): this {
        const fromStr = from instanceof Date ? from.toISOString() : from;
        const toStr = to instanceof Date ? to.toISOString() : to;
        this.filters[field] = { gte: fromStr, lte: toStr } as T[keyof T];
        return this;
    }

    // Métodos para filtros enum
    enumEquals(field: keyof T, value: string): this {
        this.filters[field] = { equals: value } as T[keyof T];
        return this;
    }

    enumIn(field: keyof T, values: string[]): this {
        this.filters[field] = { in: values } as T[keyof T];
        return this;
    }

    // ← NUEVO: Método para agregar filtros complejos (OR/AND)
    addComplexFilter(filterObject: Partial<T>): this {
        Object.assign(this.filters, filterObject);
        return this;
    }

    // Método para obtener los filtros construidos
    build(): Partial<T> {
        return this.filters;
    }

    // Método para limpiar filtros
    clear(): this {
        this.filters = {};
        return this;
    }
}

export function createGlobalSearch<T>(
    searchTerm: string,
    fields: (keyof T)[]
): { OR: Partial<T>[] } {
    return {
        OR: fields.map(field => ({
            [field]: { contains: searchTerm }
        } as Partial<T>))
    };
}