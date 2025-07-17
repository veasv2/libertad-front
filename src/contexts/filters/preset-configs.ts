// src/contexts/filters/preset-configs.ts

import type { FilterConfig } from './filter-factory';
import type { SortConfig } from './types';

// Configuraciones predefinidas para casos comunes

// Configuración básica para entidades con búsqueda simple
export function createBasicSearchConfig(
    searchFields: string[],
    defaultSort: SortConfig[],
    options?: {
        defaultPageSize?: number;
        estadoField?: string;
    }
): FilterConfig<any, any> {
    return {
        searchFields,
        defaultSort,
        defaultPageSize: options?.defaultPageSize || 10,
        estadoField: options?.estadoField || 'estado',
    };
}

// Configuración para entidades con filtros de categoría
export function createCategoryFilterConfig(
    searchFields: string[],
    categoryField: string,
    defaultSort: SortConfig[],
    options?: {
        defaultPageSize?: number;
        estadoField?: string;
    }
): FilterConfig<any, any> {
    return {
        searchFields,
        additionalFilters: {
            categoria: {
                field: categoryField,
                operator: 'in' as const,
            }
        },
        defaultSort,
        defaultPageSize: options?.defaultPageSize || 10,
        estadoField: options?.estadoField || 'estado',
    };
}

// Configuración para entidades con filtros de tipo
export function createTypeFilterConfig(
    searchFields: string[],
    typeField: string,
    defaultSort: SortConfig[],
    options?: {
        defaultPageSize?: number;
        estadoField?: string;
    }
): FilterConfig<any, any> {
    return {
        searchFields,
        additionalFilters: {
            tipo: {
                field: typeField,
                operator: 'in' as const,
            }
        },
        defaultSort,
        defaultPageSize: options?.defaultPageSize || 10,
        estadoField: options?.estadoField || 'estado',
    };
}

// Configuración para entidades con filtros de estado avanzado
export function createAdvancedStateConfig(
    searchFields: string[],
    defaultSort: SortConfig[],
    options?: {
        defaultPageSize?: number;
        estadoField?: string;
        additionalFilters?: Record<string, any>;
    }
): FilterConfig<any, any> {
    return {
        searchFields,
        additionalFilters: options?.additionalFilters,
        defaultSort,
        defaultPageSize: options?.defaultPageSize || 10,
        estadoField: options?.estadoField || 'estado',
    };
}

// Configuraciones específicas por dominio

// Configuración para usuarios
export const usuarioPresetConfig = createTypeFilterConfig(
    ['nombres', 'apellido_paterno', 'apellido_materno', 'email', 'dni'],
    'tipo',
    [{ column: 'nombres', direction: 'asc' as const }],
    { defaultPageSize: 10 }
);

// Configuración para roles
export const rolPresetConfig = createCategoryFilterConfig(
    ['nombre', 'descripcion'],
    'permisos',
    [{ column: 'nombre', direction: 'asc' as const }],
    { defaultPageSize: 10 }
);

// Configuración para tipos de documento
export const tipoDocumentoPresetConfig = createCategoryFilterConfig(
    ['nombre', 'descripcion', 'codigo'],
    'categoria',
    [{ column: 'nombre', direction: 'asc' as const }],
    { defaultPageSize: 10 }
);

// Configuración para permisos
export const permisoPresetConfig = createBasicSearchConfig(
    ['nombre', 'descripcion', 'modulo'],
    [{ column: 'nombre', direction: 'asc' as const }],
    { defaultPageSize: 15 }
);

// Configuración para módulos
export const moduloPresetConfig = createBasicSearchConfig(
    ['nombre', 'descripcion'],
    [{ column: 'nombre', direction: 'asc' as const }],
    { defaultPageSize: 20 }
); 