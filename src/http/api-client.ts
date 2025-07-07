// =================================================================
// 3. src/lib/api-client.ts - CLIENTE HTTP GENÉRICO
// =================================================================

import axiosInstance from 'src/http/client';
import type { ApiListRequest, ApiListResponse } from 'src/types/api';

export class ApiListClient<TData, TFilter = any> {
    constructor(private endpoint: string) { }

    async list(request: ApiListRequest<TFilter>): Promise<ApiListResponse<TData>> {
        const { data } = await axiosInstance.post(`${this.endpoint}/lista`, request);
        return data;
    }

    async getById(id: string): Promise<TData> {
        const { data } = await axiosInstance.get(`${this.endpoint}/${id}`);
        return data;
    }
}
