// /src/services/shared/use-summary.ts

import useSWR from 'swr';
import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';
import { postFetcher } from 'src/http/fetcher';
import type {
    SummaryItem,
    SummaryResult,
    SummaryApiResponse
} from 'src/types/summary';

const swrOptions: SWRConfiguration = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

export function useSummary(
    endpoint: string,
    params?: Record<string, any>
): SummaryResult {
    const swrKey = params ? [endpoint, params] : endpoint;

    const { data, isLoading, error, isValidating, mutate } = useSWR<SummaryApiResponse>(
        swrKey,
        postFetcher,
        swrOptions
    );

    return useMemo(() => {
        const total = data?.total || 0;
        const items: SummaryItem[] = data?.groups?.map(group => ({
            label: group.group || 'Sin clasificar',
            value: group.count,
            percentage: total > 0 ? Math.round((group.count / total) * 100) : 0
        })) || [];

        return {
            total,
            items,
            isLoading,
            error,
            isValidating,
            refetch: mutate
        };
    }, [data, isLoading, error, isValidating, mutate]);
}

// Utilidades helper
export function getSummaryByLabel(summary: SummaryResult, label: string): SummaryItem | undefined {
    return summary.items.find(item =>
        item.label.toLowerCase() === label.toLowerCase()
    );
}

export function getTotalByLabels(summary: SummaryResult, labels: string[]): number {
    return summary.items
        .filter(item => labels.includes(item.label))
        .reduce((total, item) => total + item.value, 0);
}