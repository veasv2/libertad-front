import type { EntityFiltersConfig } from 'src/contexts/filters/filter-config-types';
import { TIPO_USUARIO_OPTIONS } from 'src/types/enums/usuario-enum';

export const usuarioPageRoutes = {
    root: '/seguridad/usuario',
    new: '/seguridad/usuario/nuevo',
    edit: (id: string) => `/seguridad/usuario/${id}/editar`,
    view: (id: string) => `/seguridad/usuario/${id}`,
};

export const usuarioOpcionConfig: EntityFiltersConfig = {
    filters: [
        {
            name: 'tipo',
            label: 'Tipo de Usuario',
            type: 'multiselect',
            mode: 'deferred',
            options: TIPO_USUARIO_OPTIONS,
            field: 'tipo',
            operator: 'in'
        },
        {
            name: 'search',
            label: 'Buscar',
            type: 'text',
            mode: 'deferred',
            placeholder: 'Buscar por nombre, apellidos, email o DNI...',
            searchFields: ['nombres', 'apellido_paterno', 'apellido_materno', 'email', 'dni'],
            operator: 'contains'
        },
        {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            mode: 'immediate',
            options: [
                { value: 'all', label: 'Todos' },
                { value: 'ACTIVO', label: 'Activo' },
                { value: 'INACTIVO', label: 'Inactivo' },
                { value: 'SUSPENDIDO', label: 'Suspendido' },
                { value: 'PENDIENTE', label: 'Pendiente' },
                { value: 'BAJA', label: 'Baja' }
            ],
            field: 'estado',
            operator: 'equals'
        }
    ],
    searchFields: ['nombres', 'apellido_paterno', 'apellido_materno', 'email', 'dni'],
    defaultSort: [{ column: 'nombres', direction: 'asc' as const }],
    defaultPageSize: 10,
    estadoField: 'estado'
}; 