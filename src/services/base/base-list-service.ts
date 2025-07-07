// src/services/base/base-list-service.ts - HOOK GENÉRICO

import useSWR from 'swr';
import type { ApiListRequest, ListHookResult } from 'src/types/api';
import type { ApiListClient } from 'src/http/api-client';

interface UseListOptions {
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
}

export function useBaseList<TData, TFilter>(
    client: ApiListClient<TData, TFilter>,
    request: ApiListRequest<TFilter>,
    options: UseListOptions = {}
): ListHookResult<TData> {
    const swrKey = ['list', client.constructor.name, request];

    const { data, error, isLoading, mutate } = useSWR(
        swrKey,
        () => client.list(request),
        {
            revalidateOnFocus: options.revalidateOnFocus ?? false,
            revalidateOnReconnect: options.revalidateOnReconnect ?? false,
        }
    );

    return {
        data: data?.data ?? [],
        total: data?.total ?? 0,
        inicio: data?.inicio ?? 0,
        fin: data?.fin ?? 0,
        totalPages: data?.totalPages ?? 0,
        hasNextPage: data?.hasNextPage ?? false,
        hasPrevPage: data?.hasPrevPage ?? false,
        currentPage: data?.currentPage ?? 1,
        appliedSort: data?.appliedSort,
        isLoading,
        error,
        refetch: mutate
    };
}