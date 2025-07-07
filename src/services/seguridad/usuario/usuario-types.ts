import type { StringFilter, EnumFilter } from 'src/types/filters';
import type { ListParams, ApiResponse, ListResult, FilterPreset, Presets } from 'src/types/query';

import type { Usuario } from 'src/models/seguridad/usuario';
import type { TipoUsuarioValue, EstadoUsuarioValue } from 'src/types/enums/usuario-enum';

export interface UsuarioWhere {
    uuid?: StringFilter;
    email?: StringFilter;
    dni?: StringFilter;

    nombres?: StringFilter;
    apellido_materno?: StringFilter;
    apellido_paterno?: StringFilter;
    telefono?: StringFilter;

    tipo?: EnumFilter<TipoUsuarioValue>;
    estado?: EnumFilter<EstadoUsuarioValue>;

    AND?: UsuarioWhere[];
    OR?: UsuarioWhere[];
}

export type UsuarioListParams = ListParams<UsuarioWhere>;
export type UsuarioApiResponse = ApiResponse<Usuario>;
export type UsuarioListResult = ListResult<Usuario>;
export type UsuarioFilterPreset = FilterPreset<UsuarioWhere>;
export type UsuarioPresets = Presets<UsuarioWhere>;
