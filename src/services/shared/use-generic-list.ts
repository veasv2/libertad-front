import useSWR from 'swr';
import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';
import type { ApiResponse, ListParams, ListResult } from 'src/types/query';
import { postFetcher, getFetcher } from 'src/http/fetcher';

const swrOptions: SWRConfiguration = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

export function useGenericList<T, W>(
    endpoint: string,
    params: ListParams<W>
): ListResult<T> {
    const swrKey = params ? [endpoint, params] : null;

    const { data, isLoading, error, isValidating, mutate } = useSWR<ApiResponse<T>>(
        swrKey,
        postFetcher,
        swrOptions
    );

    return useMemo(() => ({
        data: data?.data || [],
        total: data?.total || 0,
        inicio: data?.inicio || 0,
        fin: data?.fin || 0,
        totalPages: data?.totalPages || 0,
        hasNextPage: data?.hasNextPage || false,
        hasPrevPage: data?.hasPrevPage || false,
        currentPage: data?.currentPage || 1,
        appliedSort: data?.appliedSort,
        isLoading,
        error,
        isValidating,
        refetch: mutate
    }), [data, isLoading, error, isValidating, mutate]);
}

export function useGenericItem<T>(
    endpoint: string,
    params: Record<string, any>
) {
    const swrKey = params ? [endpoint, params] : null;

    const { data, isLoading, error, isValidating } = useSWR<T>(
        swrKey,
        getFetcher,
        swrOptions
    );

    return useMemo(() => ({
        data,
        isLoading,
        error,
        isValidating
    }), [data, isLoading, error, isValidating]);
}