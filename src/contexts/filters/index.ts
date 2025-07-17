// src/contexts/filters/index.ts

// Exportar el contexto genérico
export { createGenericFiltersContext } from './generic-filters-context';
export type {
    GenericFiltersState,
    GenericFiltersAction,
    GenericFiltersContextValue
} from './generic-filters-context';

// Exportar el factory
export { createEntityFilters } from './filter-factory';
export type {
    BaseToolbarFilters,
    BaseExtraState
} from './filter-factory';

// Exportar configuraciones predefinidas
export {
    createBasicSearchConfig,
    createCategoryFilterConfig,
    createTypeFilterConfig,
    createAdvancedStateConfig,
    usuarioPresetConfig,
    rolPresetConfig,
    tipoDocumentoPresetConfig,
    permisoPresetConfig,
    moduloPresetConfig,
} from './preset-configs';

// Exportar hooks de utilidad
export {
    useEntityFilters,
    useSearchableFilters,
    usePaginatedFilters,
} from './use-entity-filters';

// Exportar tipos de configuración
export type { FilterConfig, EntityFiltersConfig } from './filter-config-types';

// Exportar contexto de opciones
export { useFilters } from './opcion-filters-context';

// Exportar tipos
export type { SortConfig } from './types';