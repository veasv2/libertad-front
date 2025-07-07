// src/types/api.ts

import type { PaginationConfig, SortConfig } from './filters';

export interface ApiListRequest<TFilter = any> {
    where?: TFilter;
    pagination?: PaginationConfig;
    sort?: SortConfig;
}

export interface ApiListResponse<TData> {
    data: TData[];
    total: number;
    inicio: number;
    fin: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    currentPage: number;
    appliedSort?: SortConfig;
}

export interface ListHookResult<TData> extends ApiListResponse<TData> {
    isLoading: boolean;
    error?: Error;
    refetch: () => void;
}

export interface ListHookOptions {
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
    revalidateIfStale?: boolean;
}

export interface ApiDetailRequest {
    id: string | number;
}

export interface ApiDetailResponse<TData> {
    data: TData;
}

export interface DetailHookResult<TData> {
    data?: TData;
    isLoading: boolean;
    error?: Error;
    refetch: () => void;
}