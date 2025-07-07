// src/models/seguridad/usuario.ts

import { TipoUsuarioValue, EstadoUsuarioValue } from 'src/types/enums/usuario-enum';

export interface Usuario {
    uuid: string;
    dni: string;
    email: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    telefono?: string;
    tipo: TipoUsuarioValue;
    estado: EstadoUsuarioValue;
    ultimo_acceso?: string;
}