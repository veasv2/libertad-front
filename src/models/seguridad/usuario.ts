// src/models/seguridad/usuario.ts
import { BaseEntity } from 'src/models/base/base-entity';
import { TipoUsuarioValue, EstadoUsuarioValue } from 'src/types/enums/usuario-enum';

export interface Usuario extends BaseEntity {
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