export const usuarioPageRoutes = {
    root: '/seguridad/usuario',
    new: '/seguridad/usuario/nuevo',
    edit: (id: string) => `/seguridad/usuario/${id}/editar`,
    view: (id: string) => `/seguridad/usuario/${id}`,
}; 