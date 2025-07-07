// src/services/seguridad/usuario/types.ts

import type {
    StringFilter,
    NumberFilter,
    DateFilter,
    EnumFilter,
    PaginationConfig,
    SortConfig // ← NUEVO: Importar ordenamiento
} from 'src/types/filters';

import type { Usuario } from 'src/models/seguridad/usuario';
import type { TipoUsuarioValue, EstadoUsuarioValue } from 'src/types/enums/usuario-enum';

// ================================================================
// FILTROS ESPECÍFICOS PARA USUARIO
// ================================================================

/**
 * Filtros específicos para la entidad Usuario
 * Coincide exactamente con el backend Python
 */
export interface UsuarioWhere {
    // Campos de identificación
    id?: NumberFilter;
    uuid?: StringFilter;
    email?: StringFilter;
    dni?: StringFilter;

    // Campos de nombre
    nombres?: StringFilter;
    apellido_paterno?: StringFilter;
    telefono?: StringFilter;

    // Campos enum
    tipo?: EnumFilter<TipoUsuarioValue>;
    estado?: EnumFilter<EstadoUsuarioValue>;

    // Campos de fecha
    ultimo_acceso?: DateFilter;
    fecha_creacion?: DateFilter;
    fecha_actualizacion?: DateFilter;

    // Campos de control (opcional, dependiendo de tu modelo)
    intentos_fallidos?: NumberFilter;
    bloqueado_hasta?: DateFilter;

    // Lógica avanzada (AND/OR)
    AND?: UsuarioWhere[];
    OR?: UsuarioWhere[];
}

// ================================================================
// REQUEST/RESPONSE
// ================================================================

/**
 * Parámetros para listar usuarios
 * Coincide con el formato que espera tu backend
 */
export interface UsuarioListaParams {
    where?: UsuarioWhere;
    pagination: PaginationConfig;     // Obligatorio
    sort?: SortConfig;               // ← NUEVO: Ordenamiento opcional
}

/**
 * Respuesta que viene del backend
 * Coincide exactamente con tu UsuarioListResponse de Python
 */
export interface UsuarioApiResponse {
    data: Usuario[];
    total: number;
    inicio: number;
    fin: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    currentPage: number;
    appliedSort?: SortConfig;        // ← NUEVO: Ordenamiento aplicado
}

/**
 * Resultado del hook (combina API + estado del frontend)
 */
export interface UsuarioListaResult extends UsuarioApiResponse {
    // Estados del frontend
    isLoading: boolean;
    error?: Error;
    refetch: () => void;             // ← NUEVO: Función para recargar
}

// ================================================================
// TIPOS AUXILIARES (para otros hooks)
// ================================================================

/**
 * Datos que retorna la API para usuario individual
 */
export interface UsuarioDetailResponse {
    usuario: Usuario;
}

/**
 * Parámetros para búsqueda simplificada
 */
export interface UsuarioSearchParams {
    searchTerm: string;
    includeInactive?: boolean;
    type?: TipoUsuarioValue;
    pagination: PaginationConfig;
    sort?: SortConfig;
}

// ================================================================
// TIPOS PARA BUILDERS (opcional - para uso futuro)
// ================================================================

/**
 * Configuración para preset de filtros
 */
export interface UsuarioFilterPreset {
    where?: UsuarioWhere;
    sort?: SortConfig;
    description?: string;
}

/**
 * Presets comunes predefinidos
 */
export interface UsuarioPresets {
    activeUsers: UsuarioFilterPreset;
    recentUsers: UsuarioFilterPreset;
    adminUsers: UsuarioFilterPreset;
    blockedUsers: UsuarioFilterPreset;
}