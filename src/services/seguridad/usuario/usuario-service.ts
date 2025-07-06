// src/services/seguridad/usuario/usuario-service.ts

import type { SWRConfiguration } from 'swr';
import type { UsuarioListaParams, UsuarioListaResult, UsuarioData, UsuarioWhere } from './types';
import type { Usuario } from 'src/models/seguridad/usuario';

import useSWR from 'swr';
import { useMemo } from 'react';

import axiosInstance from 'src/http/client';
import { endpoints } from 'src/http';

const swrOptions: SWRConfiguration = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

// Fetcher personalizado usando axiosInstance
async function postFetcher([url, params]: [string, any]) {
    const { data } = await axiosInstance.post(url, params);
    return data;
}

// Fetcher GET con axiosInstance
async function getFetcher([url, params]: [string, any]) {
    const { data } = await axiosInstance.get(url, { params });
    return data;
}

function useGetUsuariosData(params: UsuarioListaParams) {
    const swrKey = params ? [endpoints.seguridad.usuario.lista, params] : null;

    const { data, isLoading, error, isValidating } = useSWR<{
        data: Usuario[];
        total: number;
    }>(swrKey, postFetcher, swrOptions);

    return {
        data,
        isLoading,
        error,
        isValidating
    };
}

export function useUsuariosList(params: UsuarioListaParams): UsuarioListaResult {
    const { data, isLoading, error } = useGetUsuariosData(params);

    const dataList = data?.data || [];
    const total = data?.total || 0;

    const { page, pageSize } = params.pagination;

    const totalPages = Math.ceil(total / pageSize);
    const inicio = total > 0 ? (page - 1) * pageSize + 1 : 0;
    const fin = total > 0 ? Math.min(page * pageSize, total) : 0;

    return {
        data: dataList,
        total,
        isLoading,
        error,
        inicio,
        fin,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        currentPage: page,
    };
}


export function useGetUsuario(usuarioId: string) {
    const swrKey = usuarioId ? [endpoints.seguridad.usuario.detalle, { usuarioId }] : null;

    const { data, isLoading, error, isValidating } = useSWR<{ usuario: Usuario }>(
        swrKey,
        getFetcher,
        swrOptions
    );

    return useMemo(() => ({
        usuario: data?.usuario,
        usuarioLoading: isLoading,
        usuarioError: error,
        usuarioValidating: isValidating,
    }), [data?.usuario, isLoading, error, isValidating]);
}
