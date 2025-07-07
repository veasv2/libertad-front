import { useGenericList, useGenericItem } from 'src/services/shared/use-generic-list';
import { endpoints } from 'src/http/endpoints';
import type { UsuarioListParams, UsuarioListResult, UsuarioWhere } from './usuario-types';
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