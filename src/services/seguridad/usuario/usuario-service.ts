// src/services/seguridad/usuario/usuario-service.ts

import { useGenericList, useGenericItem } from 'src/services/shared/use-generic-list';
import { useSummary } from 'src/services/shared/use-summary';
import { endpoints } from 'src/http/endpoints';
import type {
    UsuarioListParams,
    UsuarioListResult,
    UsuarioWhere,
    UsuarioSummaryResult
} from './usuario-types';
import type { Usuario } from 'src/models/seguridad/usuario';

export function useUsuarioList(params: UsuarioListParams): UsuarioListResult {
    return useGenericList<Usuario, UsuarioWhere>(
        endpoints.seguridad.usuario.lista,
        params
    );
}

export function useUsuarioItem(usuarioId: string) {
    return useGenericItem<{ usuario: Usuario }>(
        endpoints.seguridad.usuario.detalle,
        { usuarioId }
    );
}

export function useUsuarioStatusSummary(where?: UsuarioWhere): UsuarioSummaryResult {
    return useSummary(endpoints.seguridad.usuario.resumen, {
        groupBy: 'estado',
        where
    });
}