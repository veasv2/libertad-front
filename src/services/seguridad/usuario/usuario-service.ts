// src/services/seguridad/usuario/usuario-service.ts

import type { SWRConfiguration } from 'swr';
import type { UsuarioListaParams, UsuarioListaResult, UsuarioApiResponse } from './types';
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

// ================================================================
// FETCHERS
// ================================================================

// Fetcher para POST (listas con filtros)
async function postFetcher([url, params]: [string, any]) {
    const { data } = await axiosInstance.post(url, params);
    return data;
}

// Fetcher para GET (detalle de usuario)
async function getFetcher([url, params]: [string, any]) {
    const { data } = await axiosInstance.get(url, { params });
    return data;
}

// ================================================================
// HOOK INTERNO PARA OBTENER DATOS
// ================================================================

function useGetUsuariosData(params: UsuarioListaParams) {
    const swrKey = params ? [endpoints.seguridad.usuario.lista, params] : null;

    const { data, isLoading, error, isValidating, mutate } = useSWR<UsuarioApiResponse>(
        swrKey,
        postFetcher,
        swrOptions
    );

    return {
        data,
        isLoading,
        error,
        isValidating,
        refetch: mutate
    };
}

// ================================================================
// HOOK PRINCIPAL PARA LISTA DE USUARIOS
// ================================================================

export function useUsuariosList(params: UsuarioListaParams): UsuarioListaResult {
    const { data, isLoading, error, refetch } = useGetUsuariosData(params);

    return useMemo(() => ({
        // Datos del backend (vienen directamente de la respuesta)
        data: data?.data || [],
        total: data?.total || 0,
        inicio: data?.inicio || 0,
        fin: data?.fin || 0,
        totalPages: data?.totalPages || 0,
        hasNextPage: data?.hasNextPage || false,
        hasPrevPage: data?.hasPrevPage || false,
        currentPage: data?.currentPage || 1,
        appliedSort: data?.appliedSort,

        // Estado del frontend
        isLoading,
        error,
        refetch
    }), [data, isLoading, error, refetch]);
}

// ================================================================
// HOOK PARA USUARIO INDIVIDUAL
// ================================================================

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

// ================================================================
// HOOKS ESPECIALIZADOS (OPCIONALES)
// ================================================================

/**
 * Hook para obtener solo usuarios activos
 */
export function useUsuariosActivos(
    params: Omit<UsuarioListaParams, 'where'> & { where?: UsuarioListaParams['where'] }
): UsuarioListaResult {
    const requestParams: UsuarioListaParams = {
        ...params,
        where: {
            ...params.where,
            estado: { equals: 'ACTIVO' }
        }
    };

    return useUsuariosList(requestParams);
}

/**
 * Hook para búsqueda de usuarios con término de búsqueda
 */
export function useUsuariosSearch(
    searchTerm: string,
    params: Omit<UsuarioListaParams, 'where'> & { where?: UsuarioListaParams['where'] }
): UsuarioListaResult {
    const requestParams: UsuarioListaParams = useMemo(() => {
        if (!searchTerm.trim()) {
            return params as UsuarioListaParams;
        }

        return {
            ...params,
            where: {
                ...params.where,
                OR: [
                    { nombres: { contains: searchTerm } },
                    { apellido_paterno: { contains: searchTerm } },
                    { email: { contains: searchTerm } },
                    { dni: { contains: searchTerm } }
                ]
            }
        };
    }, [searchTerm, params]);

    return useUsuariosList(requestParams);
}

/**
 * Hook para usuarios con filtros y ordenamiento predefinidos
 */
export function useUsuariosWithDefaults(
    customParams?: Partial<UsuarioListaParams>
): UsuarioListaResult {
    const defaultParams: UsuarioListaParams = {
        where: {
            estado: { equals: 'ACTIVO' }
        },
        pagination: {
            page: 1,
            pageSize: 20
        },
        sort: [
            { column: 'nombres', direction: 'asc' }
        ]
    };

    const mergedParams: UsuarioListaParams = {
        ...defaultParams,
        ...customParams,
        where: {
            ...defaultParams.where,
            ...customParams?.where
        }
    };

    return useUsuariosList(mergedParams);
}