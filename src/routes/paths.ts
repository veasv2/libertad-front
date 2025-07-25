// ----------------------------------------------------------------------
import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  SEGURIDAD: '/seguridad',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    two: `${ROOTS.DASHBOARD}/two`,
    three: `${ROOTS.DASHBOARD}/three`,
    group: {
      root: `${ROOTS.DASHBOARD}/group`,
      five: `${ROOTS.DASHBOARD}/group/five`,
      six: `${ROOTS.DASHBOARD}/group/six`,
    },
  },
  seguridad: {
    root: ROOTS.SEGURIDAD,
    usuario: {
      root: `${ROOTS.SEGURIDAD}/usuario`,
      nuevo: `${ROOTS.SEGURIDAD}/usuario/nuevo`,
      detalle: (id: string) => `${ROOTS.SEGURIDAD}/usuario/${id}`,
      editar: (id: string) => `${ROOTS.SEGURIDAD}/usuario/${id}/edit`
    },
    user: {
      root: `${ROOTS.SEGURIDAD}/user`,
      new: `${ROOTS.SEGURIDAD}/user/new`,
      list: `${ROOTS.SEGURIDAD}/user/list`,
      cards: `${ROOTS.SEGURIDAD}/user/cards`,
      profile: `${ROOTS.SEGURIDAD}/user/profile`,
      account: `${ROOTS.SEGURIDAD}/user/account`,
      edit: (id: string) => `${ROOTS.SEGURIDAD}/user/${id}/edit`,
      // demo: { edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit` },
    },
  },
  product: {
    root: `${ROOTS.DASHBOARD}/product`,
    new: `${ROOTS.DASHBOARD}/product/new`,
    details: (id: string) => `${ROOTS.DASHBOARD}/product/${id}`,
    edit: (id: string) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
    demo: {
      details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
      edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
    },
  },
}
