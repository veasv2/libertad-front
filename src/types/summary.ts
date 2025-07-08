// src/types/summary.ts

export interface SummaryItem {
    label: string;
    value: number;
    percentage?: number;
}

export interface SummaryResult {
    total: number;
    items: SummaryItem[];
    isLoading: boolean;
    error: any;
    isValidating: boolean;
    refetch: () => void;
}

export interface SummaryApiResponse {
    total: number;
    groups: Array<{
        group: string;
        count: number
    }>;
}