// src/http/fetcher.ts

import type { AxiosRequestConfig } from 'axios';
import axiosInstance from './client';

// ----------------------------------------------------------------------

export const fetcher = async <T = unknown>(
    args: string | [string, AxiosRequestConfig]
): Promise<T> => {
    try {
        const [url, config] = Array.isArray(args) ? args : [args, {}];

        const res = await axiosInstance.get<T>(url, config);

        return res.data;
    } catch (error) {
        console.error('Fetcher failed:', error);
        throw error;
    }
};

async function postFetcher([url, params]: [string, any]) {
    const { data } = await axiosInstance.post(url, params);
    return data;
}

// Fetcher GET con axiosInstance
async function getFetcher([url, params]: [string, any]) {
    const { data } = await axiosInstance.get(url, { params });
    return data;
}