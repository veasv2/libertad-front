'use client';
// src/types/enums/usuario.ts
import type { PaletteColorKey } from 'src/theme/core';

import type { TableHeadCellProps } from 'src/components/table';
import type { IUserItem, IUserTableFilters } from 'src/types/user';
import Typography from '@mui/material/Typography';
import { useState, useCallback } from 'react';
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

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { ESTADO_USUARIO_OPTIONS, TIPO_USUARIO_OPTIONS } from 'src/types/enums/usuario-enum';
import { Usuario, USUARIOS_PRUEBA } from 'src/models/seguridad/usuario';

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

import { UserTableRow } from './usuario-table-row';
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
  { id: '', label: 'Acciones', width: 88 }  // Para acciones
];

export function UsuarioTableView() {
  const table = useTable();

  const confirmDialog = useBoolean();

  const [tableData, setTableData] = useState<Usuario[]>(USUARIOS_PRUEBA);

  const filters = useSetState<IUserTableFilters>({ name: '', role: [], status: 'all' });
  const { state: currentFilters, setState: updateFilters } = filters;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!currentFilters.name || currentFilters.role.length > 0 || currentFilters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    (uuid: string) => {
      const deleteRow = tableData.filter((row) => row.uuid !== uuid);

      toast.success('¡Eliminado con éxito!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.uuid));

    toast.success('¡Eliminado con éxito!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Eliminar"
      content={
        <>
          ¿Estás seguro de que deseas eliminar <strong> {table.selected.length} </strong> ítems?
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDeleteRows();
            confirmDialog.onFalse();
          }}
        >
          Eliminar
        </Button>
      }
    />
  );

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
                    {/* {['active', 'pending', 'banned', 'rejected'].includes(tab.value)
                      ? tableData.filter((user) => user.status === tab.value).length
                      : tableData.length} */}
                    1
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
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}

                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <UserTableRow
                        key={row.uuid}
                        row={row}
                        selected={table.selected.includes(row.uuid)}
                        onSelectRow={() => table.onSelectRow(row.uuid)}
                        onDeleteRow={() => handleDeleteRow(row.uuid)}
                        editHref={paths.seguridad.user.edit(row.uuid)}
                      />
                    ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

      {renderConfirmDialog()}
    </>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: Usuario[];
  filters: IUserTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((user) => user.nombres.toLowerCase().includes(name.toLowerCase()));
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.estado === status);
  }

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.tipo));
  }

  return inputData;
}
