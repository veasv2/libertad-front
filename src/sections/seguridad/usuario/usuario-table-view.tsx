'use client';

import { useState, useCallback, useMemo } from 'react';

import Typography from '@mui/material/Typography';
import { varAlpha } from 'minimal-shared/utils';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';

import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';

import { ESTADO_USUARIO_OPTIONS, TIPO_USUARIO_OPTIONS } from 'src/types/enums/usuario-enum';

import { useUsuariosList } from 'src/services/seguridad/usuario/usuario-service';
import type { UsuarioListaParams } from 'src/services/seguridad/usuario/types';
import type { SortConfig } from 'src/types/filters';
import type { IUserTableFilters } from 'src/types/user';
import type { TableHeadCellProps } from 'src/components/table';

import {
  useTable,
  TableNoData,
  TableHeadCustom,
} from 'src/components/table';

import { UsuarioTableRow } from './usuario-table-row';
import { UsuarioTableToolbar } from './usuario-table-toolbar';

import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TablePagination from '@mui/material/TablePagination';
import type { TablePaginationProps } from '@mui/material/TablePagination';
import type { Theme, SxProps } from '@mui/material/styles';

const ESTADO_USUARIO = [
  { value: 'all', label: 'Todos', color: 'default' },
  ...ESTADO_USUARIO_OPTIONS
];

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'email', label: 'Usuario', sort: true },
  { id: 'nombres', label: 'Nombres', width: { xs: 120, sm: 150, md: 180 }, sort: true },
  { id: 'telefono', label: 'Teléfono', width: { xs: 90, sm: 100, md: 120 }, hide: { xs: true, sm: false } },
  { id: 'tipo', label: 'Tipo', width: { xs: 80, sm: 100, md: 120 }, sort: true },
  { id: 'estado', label: 'Estado', width: { xs: 80, sm: 100, md: 120 }, sort: true },
  { id: 'ultimo_acceso', label: 'Conexión', width: { xs: 100, sm: 120, md: 140 }, sort: true, hide: { xs: true, md: false } },
  { id: '', label: '', width: 64 }
];

export function UsuarioTableView() {
  const table = useTable();
  const confirmDialog = useBoolean();

  const filters = useSetState<IUserTableFilters>({
    name: '',
    role: [],
    status: 'all'
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const [sortConfig, setSortConfig] = useState<SortConfig>([
    { column: 'nombres', direction: 'asc' }
  ]);

  const [dense, setDense] = useState(false);

  const serviceParams = useMemo((): UsuarioListaParams => {
    const where: any = {};
    if (currentFilters.name) {
      where.OR = [
        { nombres: { contains: currentFilters.name, mode: 'insensitive' } },
        { apellido_paterno: { contains: currentFilters.name, mode: 'insensitive' } },
        { email: { contains: currentFilters.name, mode: 'insensitive' } },
        { dni: { contains: currentFilters.name, mode: 'insensitive' } }
      ];
    }
    if (currentFilters.status !== 'all') {
      where.estado = { equals: currentFilters.status };
    }
    if (currentFilters.role.length > 0) {
      where.tipo = { in: currentFilters.role };
    }

    return {
      where: Object.keys(where).length > 0 ? where : undefined,
      pagination: {
        page: table.page + 1,
        pageSize: table.rowsPerPage,
      },
      sort: sortConfig
    };
  }, [currentFilters, table.page, table.rowsPerPage, sortConfig]);

  const {
    data: usuarios,
    total,
    isLoading,
    error
  } = useUsuariosList(serviceParams);

  if (error) {
    toast.error('Error al cargar usuarios');
  }

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  const handleSort = useCallback(
    (columnId: string) => {
      const fieldMapping: Record<string, string> = {
        'email': 'email',
        'nombres': 'nombres',
        'tipo': 'tipo',
        'estado': 'estado',
        'ultimo_acceso': 'ultimo_acceso'
      };

      const fieldName = fieldMapping[columnId];
      if (!fieldName) return;

      setSortConfig(prevSort => {
        const existingSort = prevSort.find(s => s.column === fieldName);
        if (existingSort) {
          return prevSort.map(s =>
            s.column === fieldName
              ? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' }
              : s
          );
        } else {
          return [{ column: fieldName, direction: 'asc' }];
        }
      });

      table.onResetPage();
    },
    [table]
  );

  const notFound = (!usuarios.length && (!!currentFilters.name || currentFilters.role.length > 0 || currentFilters.status !== 'all')) || (!usuarios.length && !isLoading);

  return (
    <DashboardContent sx={{ display: 'flex', flexDirection: 'column', height: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 80px)' } }}>
      <Box sx={{ mb: { xs: 1, md: 2 } }}>
        <Typography variant="h5">Lista de Usuarios</Typography>
      </Box>

      <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <Tabs value={currentFilters.status} onChange={handleFilterStatus}>
          {ESTADO_USUARIO.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={
                <Label variant={tab.value === currentFilters.status ? 'filled' : 'soft'} color={tab.color}>
                  {tab.value === 'all' ? total : 0}
                </Label>
              }
              iconPosition="end"
            />
          ))}
        </Tabs>

        <UsuarioTableToolbar
          filters={filters}
          onResetPage={table.onResetPage}
          options={{ tipoUsuario: TIPO_USUARIO_OPTIONS }}
        />

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <Scrollbar sx={{ flex: 1 }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={sortConfig[0]?.direction === 'desc' ? 'desc' : 'asc'}
                orderBy={sortConfig[0]?.column || ''}
                headCells={TABLE_HEAD}
                rowCount={total}
                numSelected={table.selected.length}
                onSort={(id) => handleSort(id)}
              />
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}><td colSpan={TABLE_HEAD.length}><Box sx={{ p: 2, textAlign: 'center' }}>Cargando...</Box></td></tr>
                  ))
                  : usuarios.map((row) => (
                    <UsuarioTableRow
                      key={row.uuid}
                      row={row}
                      selected={table.selected.includes(row.uuid)}
                      onSelectRow={() => table.onSelectRow(row.uuid)}
                      editHref={paths.seguridad.user.edit(row.uuid)}
                    />
                  ))}
                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <Box sx={{ flexShrink: 0, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ position: 'relative' }}>
            <TablePagination
              component="div"
              count={total}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{ borderTopColor: 'transparent' }}
            />
            <FormControlLabel
              label="Dense"
              control={
                <Switch
                  checked={dense}
                  onChange={(e) => setDense(e.target.checked)}
                  slotProps={{ input: { id: 'dense-switch' } }}
                />
              }
              sx={{ pl: 2, py: 1.5, top: 0, position: { sm: 'absolute' } }}
            />
          </Box>
        </Box>
      </Card>
    </DashboardContent>
  );
}
