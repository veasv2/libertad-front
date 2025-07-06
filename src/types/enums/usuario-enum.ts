import type { PaletteColorKey } from 'src/theme/core';

// ============================================================================
// OBJETOS CONST CON PROPIEDADES (ENFOQUE SIMPLE)
// ============================================================================

export const TipoUsuario = {
    SUPERADMIN: {
        value: "SUPERADMIN",
        label: "Super Administrador",
        color: "error" as PaletteColorKey,
        description: "Acceso total al sistema"
    },
    ALCALDE: {
        value: "ALCALDE",
        label: "Alcalde",
        color: "warning" as PaletteColorKey,
        description: "Máxima autoridad municipal"
    },
    FUNCIONARIO: {
        value: "FUNCIONARIO",
        label: "Funcionario",
        color: "primary" as PaletteColorKey,
        description: "Empleado municipal"
    }
} as const;

export const EstadoUsuario = {
    ACTIVO: {
        value: "ACTIVO",
        label: "Activo",
        color: "success" as PaletteColorKey,
        description: "Usuario habilitado en el sistema"
    },
    INACTIVO: {
        value: "INACTIVO",
        label: "Inactivo",
        color: "secondary" as PaletteColorKey,
        description: "Usuario deshabilitado temporalmente"
    },
    SUSPENDIDO: {
        value: "SUSPENDIDO",
        label: "Suspendido",
        color: "info" as PaletteColorKey,
        description: "Usuario suspendido por violación de políticas"
    },
    BAJA: {
        value: "BAJA",
        label: "Dado de Baja",
        color: "error" as PaletteColorKey,
        description: "Usuario dado de baja definitiva"
    },
    PENDIENTE: {
        value: "PENDIENTE",
        label: "Pendiente",
        color: "warning" as PaletteColorKey,
        description: "Usuario creado pero no activado"
    }
} as const;


export const TIPO_USUARIO_OPTIONS = Object.values(TipoUsuario);
export const ESTADO_USUARIO_OPTIONS = Object.values(EstadoUsuario);

export type TipoUsuarioValue = typeof TipoUsuario[keyof typeof TipoUsuario]['value'];
export type EstadoUsuarioValue = typeof EstadoUsuario[keyof typeof EstadoUsuario]['value'];