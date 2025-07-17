// src/contexts/filters/filter-config-types.ts

export interface SortConfig {
    column: string;
    direction: 'asc' | 'desc';
}

export interface FilterConfig {
    name: string;
    label: string;
    type: 'text' | 'select' | 'multiselect' | 'date' | 'boolean';
    mode: 'immediate' | 'deferred';
    options?: { value: string; label: string }[];
    placeholder?: string;
    // Configuración de backend
    field?: string; // campo en la base de datos
    operator?: 'equals' | 'in' | 'contains' | 'startsWith' | 'endsWith';
    searchFields?: string[]; // para filtros de búsqueda
}

export interface EntityFiltersConfig {
    filters: FilterConfig[];
    searchFields: string[]; // campos por defecto para búsqueda
    defaultSort: SortConfig[];
    defaultPageSize?: number;
    estadoField?: string;
} 