// src/services/usuario/types.ts

import type {
    StringFilter,
    DateFilter,
    EnumFilter,
    PaginatedResult,
    PaginationConfig
} from 'src/types/filters';

import type { Usuario } from 'src/models/seguridad/usuario';
import type { TipoUsuarioValue, EstadoUsuarioValue } from 'src/types/enums/usuario-enum';

// ----------------------------------------------------------------------

/**
 * Filtros específicos para la entidad Usuario
 */
export interface UsuarioWhere {
    // Campos de texto
    dni?: StringFilter;
    email?: StringFilter;
    nombres?: StringFilter;
    apellido_paterno?: StringFilter;
    apellido_materno?: StringFilter;
    telefono?: StringFilter;

    // Campos enum
    tipo?: EnumFilter<TipoUsuarioValue>;
    estado?: EnumFilter<EstadoUsuarioValue>;

    // Campos de fecha
    ultimo_acceso?: DateFilter;

    // Lógica avanzada (opcional para casos complejos)
    AND?: UsuarioWhere[];
    OR?: UsuarioWhere[];
}

/**
 * Parámetros para listar usuarios (OBLIGATORIOS)
 */
export interface UsuarioListaParams {
    where?: UsuarioWhere;
    pagination: PaginationConfig;  // ← OBLIGATORIO, sin default
}

/**
 * Resultado de la consulta de usuarios
 */
export interface UsuarioListaResult extends PaginatedResult<Usuario> {
    data: Usuario[];
    total: number;
    isLoading: boolean;
    error?: Error;
}

// ----------------------------------------------------------------------

/**
 * Datos que retorna la API para usuarios
 */
export interface UsuarioData {
    usuarios: Usuario[];
}