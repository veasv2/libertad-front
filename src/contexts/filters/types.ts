// src/contexts/filters/types.ts

export interface SortConfig {
    column: string;
    direction: 'asc' | 'desc';
}

export interface FilterConfig<TToolbar, TExtra> {
    entityName: string;
    initialState: {
        toolbarFilters: TToolbar;
        extraState: TExtra;
        sort: SortConfig[];
        pageSize: number;
    };
    urlMapping: {
        // Mapeo simple de campo -> parámetro URL
        [K in keyof TToolbar]?: string;
    } & {
        [K in keyof TExtra]?: string;
    };
    serviceMapping: {
        // Cómo mapear cada filtro a condiciones del servicio
        search?: (value: string) => any[];
        [key: string]: (value: any) => any;
    };
}