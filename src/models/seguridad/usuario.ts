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

export const USUARIOS_PRUEBA: Usuario[] = [
    {
        uuid: '11111111-aaaa-1111-aaaa-111111111111',
        dni: '12345678',
        email: 'super.admin@municipio.gob.pe',
        nombres: 'Carlos',
        apellido_paterno: 'Ramirez',
        apellido_materno: 'Lopez',
        telefono: '987654321',
        tipo: 'SUPERADMIN',
        estado: 'ACTIVO',
        ultimo_acceso: '2025-07-05T12:00:00Z',
    },
    {
        uuid: '22222222-bbbb-2222-bbbb-222222222222',
        dni: '87654321',
        email: 'alcalde.juarez@municipio.gob.pe',
        nombres: 'Juan',
        apellido_paterno: 'Juarez',
        apellido_materno: 'Salas',
        telefono: '912345678',
        tipo: 'ALCALDE',
        estado: 'INACTIVO',
        ultimo_acceso: '2025-07-04T09:15:00Z',
    },
    {
        uuid: '33333333-cccc-3333-cccc-333333333333',
        dni: '23456789',
        email: 'ana.funcionaria@municipio.gob.pe',
        nombres: 'Ana',
        apellido_paterno: 'Martinez',
        apellido_materno: 'Torres',
        tipo: 'FUNCIONARIO',
        estado: 'SUSPENDIDO',
        ultimo_acceso: '2025-07-03T16:45:00Z',
    },
    {
        uuid: '44444444-dddd-4444-dddd-444444444444',
        dni: '34567890',
        email: 'luis.super@municipio.gob.pe',
        nombres: 'Luis',
        apellido_paterno: 'Castro',
        apellido_materno: 'Rojas',
        telefono: '998877665',
        tipo: 'SUPERADMIN',
        estado: 'BAJA',
    },
    {
        uuid: '55555555-eeee-5555-eeee-555555555555',
        dni: '45678901',
        email: 'rosa.alcaldesa@municipio.gob.pe',
        nombres: 'Rosa',
        apellido_paterno: 'Flores',
        apellido_materno: 'Chavez',
        tipo: 'ALCALDE',
        estado: 'PENDIENTE',
    },
    {
        uuid: '66666666-ffff-6666-ffff-666666666666',
        dni: '56789012',
        email: 'pedro.funcionario@municipio.gob.pe',
        nombres: 'Pedro',
        apellido_paterno: 'Sanchez',
        apellido_materno: 'Vega',
        telefono: '934567890',
        tipo: 'FUNCIONARIO',
        estado: 'ACTIVO',
        ultimo_acceso: '2025-06-30T10:30:00Z',
    },
    {
        uuid: '77777777-aaaa-7777-aaaa-777777777777',
        dni: '67890123',
        email: 'elena.super@municipio.gob.pe',
        nombres: 'Elena',
        apellido_paterno: 'Mendez',
        apellido_materno: 'Huaman',
        tipo: 'SUPERADMIN',
        estado: 'ACTIVO',
        ultimo_acceso: '2025-07-01T08:00:00Z',
    },
    {
        uuid: '88888888-bbbb-8888-bbbb-888888888888',
        dni: '78901234',
        email: 'jorge.alcalde@municipio.gob.pe',
        nombres: 'Jorge',
        apellido_paterno: 'Quispe',
        apellido_materno: 'Morales',
        telefono: '945678901',
        tipo: 'ALCALDE',
        estado: 'SUSPENDIDO',
    },
    {
        uuid: '99999999-cccc-9999-cccc-999999999999',
        dni: '89012345',
        email: 'maria.funcionaria@municipio.gob.pe',
        nombres: 'Maria',
        apellido_paterno: 'Gomez',
        apellido_materno: 'Salazar',
        tipo: 'FUNCIONARIO',
        estado: 'PENDIENTE',
    },
    {
        uuid: 'aaaaaaaa-dddd-aaaa-dddd-aaaaaaaaaaaa',
        dni: '90123456',
        email: 'victor.super@municipio.gob.pe',
        nombres: 'Victor',
        apellido_paterno: 'Ortega',
        apellido_materno: 'Castillo',
        telefono: '956789012',
        tipo: 'SUPERADMIN',
        estado: 'INACTIVO',
        ultimo_acceso: '2025-07-02T14:20:00Z',
    },
];
