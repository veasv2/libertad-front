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
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import type { PaletteColorKey } from 'src/theme/core';
import type { TableHeadCellProps } from 'src/components/table';
import type { IUserItem, IUserTableFilters } from 'src/types/user';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Usuario } from 'src/models/seguridad/usuario';
import { ESTADO_USUARIO_OPTIONS, TIPO_USUARIO_OPTIONS } from 'src/types/enums/usuario-enum';

// Importar el servicio
import { useUsuariosList } from 'src/services/seguridad/usuario/usuario-service';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { UsuarioTableRow } from './usuario-table-row';
import { UsuarioTableToolbar } from './usuario-table-toolbar';

const ESTADO_USUARIO = [
  { value: 'all', label: 'Todos', color: 'default' as PaletteColorKey },
  ...ESTADO_USUARIO_OPTIONS
];

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'dni_email', label: 'Usuario' },
  { id: 'nombre_apellidos', label: 'Nombres', width: 150 },
  { id: 'telefono', label: 'Teléfono', width: 100 },
  { id: 'tipo', label: 'Tipo', width: 100 },
  { id: 'estado', label: 'Estado', width: 100 },
  { id: 'ultimo_acceso', label: 'Conexión', width: 120 },
  { id: '', label: '', width: 64 }  // Para acciones
];

export function UsuarioTableView() {
  const table = useTable();
  const confirmDialog = useBoolean();

  // Estado para los filtros
  const filters = useSetState<IUserTableFilters>({ name: '', role: [], status: 'all' });
  const { state: currentFilters, setState: updateFilters } = filters;

  // Construir los parámetros para el servicio basado en los filtros
  const serviceParams = useMemo(() => {
    const where: any = {};

    // Filtro por nombre
    if (currentFilters.name) {
      where.nombres = { contains: currentFilters.name };
    }

    // Filtro por estado
    if (currentFilters.status !== 'all') {
      where.estado = { equals: currentFilters.status };
    }

    // Filtro por roles/tipos
    if (currentFilters.role.length > 0) {
      where.tipo = { in: currentFilters.role };
    }

    return {
      where,
      pagination: {
        page: table.page + 1, // El servicio espera página base 1
        pageSize: table.rowsPerPage,
      },
    };
  }, [currentFilters, table.page, table.rowsPerPage]);

  // Usar el servicio para obtener datos
  const { data: usuarios, total, isLoading, error } = useUsuariosList(serviceParams);

  // Manejar estados de carga y error
  if (error) {
    toast.error('Error al cargar usuarios');
  }

  const canReset =
    !!currentFilters.name || currentFilters.role.length > 0 || currentFilters.status !== 'all';

  const notFound = (!usuarios.length && canReset) || !usuarios.length;

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  // Contar usuarios por estado para los tabs
  const getUsuarioCountByStatus = useCallback((status: string) => {
    if (status === 'all') return total;

    // Para obtener el conteo exacto, podrías hacer una consulta adicional
    // o mantener un estado local con todos los usuarios
    return 0; // Placeholder - implementar según necesidades
  }, [total]);

  return (
    <>
      <DashboardContent>
        <Box sx={{ mb: { xs: 1, md: 2 } }}>
          <Typography variant="h5">Lista de Usuarios</Typography>
        </Box>

        <Card>
          <Tabs
            value={currentFilters.status}
            onChange={handleFilterStatus}
            sx={[
              (theme) => ({
                px: { md: 2.5 },
                boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }),
            ]}
          >
            {ESTADO_USUARIO.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={tab.value === currentFilters.status ? 'filled' : 'soft'}
                    color={tab.color}
                  >
                    {getUsuarioCountByStatus(tab.value)}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <UsuarioTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            options={{ tipoUsuario: TIPO_USUARIO_OPTIONS }}
          />

          <Box sx={{ position: 'relative' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headCells={TABLE_HEAD}
                  rowCount={total}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {isLoading ? (
                    // Mostrar skeleton o loader mientras carga
                    Array.from({ length: table.rowsPerPage }).map((_, index) => (
                      <tr key={index}>
                        <td colSpan={TABLE_HEAD.length}>
                          <Box sx={{ p: 2, textAlign: 'center' }}>
                            Cargando...
                          </Box>
                        </td>
                      </tr>
                    ))
                  ) : (
                    usuarios.map((row) => (
                      <UsuarioTableRow
                        key={row.uuid}
                        row={row}
                        selected={table.selected.includes(row.uuid)}
                        onSelectRow={() => table.onSelectRow(row.uuid)}
                        editHref={paths.seguridad.user.edit(row.uuid)}
                      />
                    ))
                  )}

                  <TableNoData notFound={notFound && !isLoading} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={total}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>
    </>
  );
}