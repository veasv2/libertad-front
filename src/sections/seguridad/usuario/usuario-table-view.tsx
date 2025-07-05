'use client';

import type { TableHeadCellProps } from 'src/components/table';
import type { IUserItem, IUserTableFilters } from 'src/types/user';

import { useState, useCallback, useMemo } from 'react';
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
import { _roles, _userList, USER_STATUS_OPTIONS } from 'src/_mock';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
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
import { UserTableToolbar } from './usuario-table-toolbar';
import { UserTableFiltersResult } from './usuario-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'name', label: 'Name' },
  { id: 'phoneNumber', label: 'Phone number', width: 180 },
  { id: 'company', label: 'Company', width: 220 },
  { id: 'role', label: 'Role', width: 180 },
  { id: 'status', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

// Constantes para mejores mensajes
const MESSAGES = {
  DELETE_SUCCESS: 'Usuario eliminado exitosamente',
  DELETE_MULTIPLE_SUCCESS: 'Usuarios eliminados exitosamente',
  DELETE_CONFIRMATION: '¿Estás seguro de que quieres eliminar',
  DELETE_CONFIRMATION_MULTIPLE: 'elementos?',
} as const;

// ----------------------------------------------------------------------

export function UsuarioTableView() {
  const table = useTable();
  const confirmDialog = useBoolean();

  const [tableData, setTableData] = useState<IUserItem[]>(_userList);

  const filters = useSetState<IUserTableFilters>({
    name: '',
    role: [],
    status: 'all'
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  // Memoización de datos filtrados para evitar cálculos innecesarios
  const dataFiltered = useMemo(() =>
    applyFilter({
      inputData: tableData,
      comparator: getComparator(table.order, table.orderBy),
      filters: currentFilters,
    }),
    [tableData, table.order, table.orderBy, currentFilters]
  );

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  // Memoización del estado de reset
  const canReset = useMemo(() =>
    !!currentFilters.name ||
    currentFilters.role.length > 0 ||
    currentFilters.status !== 'all',
    [currentFilters]
  );

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  // Memoización de contadores por estado
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const validStatuses = ['active', 'pending', 'banned', 'rejected'];

    validStatuses.forEach(status => {
      counts[status] = tableData.filter(user => user.status === status).length;
    });
    counts.all = tableData.length;

    return counts;
  }, [tableData]);

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      setTableData(deleteRow);
      toast.success(MESSAGES.DELETE_SUCCESS);
      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    setTableData(deleteRows);
    toast.success(MESSAGES.DELETE_MULTIPLE_SUCCESS);
    table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  const handleConfirmDelete = useCallback(() => {
    handleDeleteRows();
    confirmDialog.onFalse();
  }, [handleDeleteRows, confirmDialog]);

  // Función para determinar el color del tab
  const getTabColor = useCallback((tabValue: string) => {
    switch (tabValue) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'banned':
        return 'error';
      default:
        return 'default';
    }
  }, []);

  // Función para determinar si el tab está activo
  const isTabActive = useCallback((tabValue: string) => {
    return tabValue === 'all' || tabValue === currentFilters.status;
  }, [currentFilters.status]);

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Eliminar usuarios"
      content={
        <>
          {MESSAGES.DELETE_CONFIRMATION} <strong>{table.selected.length}</strong> {MESSAGES.DELETE_CONFIRMATION_MULTIPLE}
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirmDelete}
        >
          Eliminar
        </Button>
      }
    />
  );

  const renderStatusTabs = () => (
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
      {STATUS_OPTIONS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            <Label
              variant={isTabActive(tab.value) ? 'filled' : 'soft'}
              color={getTabColor(tab.value)}
            >
              {statusCounts[tab.value] || 0}
            </Label>
          }
        />
      ))}
    </Tabs>
  );

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Lista de usuarios"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Usuario', href: paths.seguridad.user.root },
            { name: 'Lista' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.seguridad.user.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Agregar usuario
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          {renderStatusTabs()}

          <UserTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            options={{ roles: _roles }}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Eliminar seleccionados">
                  <IconButton color="primary" onClick={confirmDialog.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headCells={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        editHref={paths.seguridad.user.edit(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 76}
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
  inputData: IUserItem[];
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

  let filteredData = stabilizedThis.map((el) => el[0]);

  // Aplicar filtros de forma más eficiente
  if (name) {
    const searchTerm = name.toLowerCase().trim();
    filteredData = filteredData.filter((user) =>
      user.name.toLowerCase().includes(searchTerm)
    );
  }

  if (status !== 'all') {
    filteredData = filteredData.filter((user) => user.status === status);
  }

  if (role.length > 0) {
    filteredData = filteredData.filter((user) => role.includes(user.role));
  }

  return filteredData;
}