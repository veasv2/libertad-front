// src/contexts/filters/factory.ts
// VERSIÓN SIMPLE PARA DEBUG

import type { ReactNode } from 'react';
import { createGenericFiltersContext } from './generic-filters-context';
import type { FilterConfig } from './types';

// Función simple de prueba
export function createEntityFilters<TToolbar, TExtra>(
    config: FilterConfig<TToolbar, TExtra>
) {
    console.log('Factory called with config:', config.entityName);

    // Por ahora, retornamos algo simple
    const { Provider, useFilters } = createGenericFiltersContext<TToolbar, TExtra>();

    const CustomProvider = ({ children }: { children: ReactNode }) => {
        return (
            <Provider
                initialState={{
                    ...config.initialState,
                    page: 0,
                    selectedId: null,
                    appliedToolbarFilters: config.initialState.toolbarFilters,
                }}
                stateToUrlParams={() => ''}
                urlParamsToState={() => ({})}
                getServiceParams={() => ({})}
            >
                {children}
            </Provider>
        );
    };

    return {
        Provider: CustomProvider,
        useFilters,
        config,
    };
}