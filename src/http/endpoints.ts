// src/http/endpoints.ts

export const endpoints = {
    chat: '/api/chat',
    kanban: '/api/kanban',
    calendar: '/api/calendar',
    auth: {
        me: '/api/auth/me',
        signIn: '/api/auth/sign-in',
        signUp: '/api/auth/sign-up',
    },
    mail: {
        list: '/api/mail/list',
        details: '/api/mail/details',
        labels: '/api/mail/labels',
    },
    post: {
        list: '/api/post/list',
        details: '/api/post/details',
        latest: '/api/post/latest',
        search: '/api/post/search',
    },
    product: {
        list: '/api/product/list',
        details: '/api/product/details',
        search: '/api/product/search',
    },
    seguridad: {
        usuario: {
            lista: '/api/v1/seguridad/usuario/lista',
            detalle: '/api/v1/seguridad/usuario/detalle',
            resumen: '/api/v1/seguridad/usuario/resumen'
        }
    },
} as const;