import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { UsuarioTableView } from 'src/sections/seguridad/usuario/usuario-table-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `User list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <UsuarioTableView />;
}
