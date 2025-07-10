'use client';

import { useState, useCallback, useMemo } from 'react';

import Typography from '@mui/material/Typography';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

import type { PaletteColorKey } from 'src/theme/core';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Usuario } from 'src/models/seguridad/usuario';
import { ESTADO_USUARIO_OPTIONS, TIPO_USUARIO_OPTIONS } from 'src/types/enums/usuario-enum';

import {
  useUsuarioList,
  useUsuarioStatusSummary
} from 'src/services/seguridad/usuario/usuario-service';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';
import { useTable } from 'src/components/table';

import { UsuarioTableRow } from './usuario-table-row';
import { UsuarioTableToolbar } from './usuario-table-toolbar';
import { CustomTablePagination } from './custom-table-pagination';
import { UsuarioFiltersProvider, useUsuarioFilters } from './usuario-filters-context';

// Helper para mapear estados a colores
const getStatusColor = (status: string): PaletteColorKey => {
  const colorMap: Record<string, PaletteColorKey> = {
    'ACTIVO': 'success',
    'INACTIVO': 'default',
    'SUSPENDIDO': 'warning',
    'PENDIENTE': 'info',
    'BAJA': 'error'
  };
  return colorMap[status] || 'default';
};

type TableHeaderCell = {
  id: string;
  label: string;
  sort?: boolean;
  width?: any;
  hide?: any;
  align?: 'left' | 'center' | 'right';
};

const TABLE_HEAD: TableHeaderCell[] = [
  { id: 'email', label: 'Usuario', sort: true },
  { id: 'nombres', label: 'Nombres', width: { xs: 120, sm: 150, md: 180 }, sort: true },
  { id: 'telefono', label: 'Teléfono', width: { xs: 90, sm: 100, md: 120 }, hide: { xs: true, sm: false } },
  { id: 'tipo', label: 'Tipo', width: { xs: 80, sm: 100, md: 120 }, sort: true },
  { id: 'estado', label: 'Estado', width: { xs: 80, sm: 100, md: 120 }, sort: true },
  { id: 'ultimo_acceso', label: 'Conexión', width: { xs: 100, sm: 120, md: 140 }, sort: true, hide: { xs: true, md: false } },
  { id: '', label: '', width: 64 }
];

const visuallyHidden = {
  border: 0,
  padding: 0,
  width: '1px',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

// Componente interno que usa el contexto
function UsuarioTableViewContent() {
  const table = useTable();
  const {
    state,
    setEstado,
    setSort,
    setPage,
    setPageSize,
    hasActiveFilters,
    canReset,
    getServiceParams
  } = useUsuarioFilters();

  // Resumen SIN filtros del toolbar (solo totales generales)
  const {
    total: summaryTotal,
    items: summaryItems,
    isLoading: summaryLoading
  } = useUsuarioStatusSummary();

  // Usar el servicio de lista con parámetros del contexto
  const serviceParams = getServiceParams();
  const {
    data: usuarios,
    total,
    isLoading,
    error,
    appliedSort,
    hasNextPage,
    hasPrevPage,
    totalPages
  } = useUsuarioList(serviceParams);

  // Manejar errores
  if (error) {
    toast.error('Error al cargar usuarios');
  }

  const notFound = (!usuarios.length && canReset) || (!usuarios.length && !isLoading);

  // Construir tabs dinámicos basados en el resumen
  const dynamicTabs = useMemo(() => {
    const allTab = {
      value: 'all',
      label: 'Todos',
      color: 'default' as PaletteColorKey,
      count: summaryTotal
    };

    const statusTabs = summaryItems.map(item => ({
      value: item.label,
      label: item.label,
      color: getStatusColor(item.label),
      count: item.value
    }));

    return [allTab, ...statusTabs];
  }, [summaryTotal, summaryItems]);

  // Handler para cambiar tab
  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      setEstado(newValue);
    },
    [setEstado]
  );

  // Handler para ordenamiento
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

      const existingSort = state.sort.find(s => s.column === fieldName);

      if (existingSort) {
        const newSort = state.sort.map(s =>
          s.column === fieldName
            ? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' }
            : s
        );
        setSort(newSort);
      } else {
        setSort([{ column: fieldName, direction: 'asc' }]);
      }
    },
    [state.sort, setSort]
  );

  // Handlers para paginación
  const handlePageChange = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, [setPage]);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
  }, [setPageSize]);

  return (
    <DashboardContent
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 80px)' },
      }}
    >
      <Box sx={{ mb: { xs: 1, md: 2 } }}>
        <Typography variant="h5">Lista de Usuarios</Typography>
      </Box>

      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Tabs dinámicos */}
        <Tabs
          value={state.estado}
          onChange={handleFilterStatus}
          sx={[
            (theme) => ({
              px: { md: 2.5 },
              boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              flexShrink: 0,
            }),
          ]}
        >
          {dynamicTabs.map((tab) => (
            <Tab
              key={tab.value}
              iconPosition="end"
              value={tab.value}
              label={tab.label}
              icon={
                <Label
                  variant={tab.value === state.estado ? 'filled' : 'soft'}
                  color={tab.color}
                >
                  {summaryLoading ? '...' : tab.count}
                </Label>
              }
            />
          ))}
        </Tabs>

        <Box sx={{ flexShrink: 0 }}>
          <UsuarioTableToolbar />
        </Box>

        {/* Tabla */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <Scrollbar
            sx={{
              flex: 1,
              '& .simplebar-content': {
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }
            }}
          >
            <Table
              size={'medium'}
              sx={{
                minWidth: { xs: 600, sm: 800, md: 960 },
                '& .MuiTableCell-root': {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }
              }}
            >
              <TableHead
                sx={{
                  '& .MuiTableCell-root': {
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                  }
                }}>
                <TableRow>
                  {TABLE_HEAD.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.align || 'left'}
                      sortDirection={
                        state.sort?.[0]?.column === headCell.id
                          ? state.sort[0].direction
                          : false
                      }
                      sx={{ width: headCell.width }}
                    >
                      {headCell.sort && headCell.id ? (
                        <TableSortLabel
                          hideSortIcon
                          active={state.sort?.[0]?.column === headCell.id}
                          direction={
                            state.sort?.[0]?.column === headCell.id
                              ? state.sort[0].direction
                              : 'asc'
                          }
                          onClick={() => handleSort(headCell.id)}
                        >
                          {headCell.label}

                          {state.sort?.[0]?.column === headCell.id ? (
                            <Box component="span" sx={visuallyHidden}>
                              {state.sort[0].direction === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      ) : (
                        headCell.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      {TABLE_HEAD.map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Box sx={{ width: '100%' }}>
                            <Skeleton variant="text" />
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
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

                {!isLoading && usuarios.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} sx={{
                      textAlign: 'center',
                      py: 10,
                      color: 'text.secondary'
                    }}>
                      <Typography variant="h6" gutterBottom>
                        No hay registros para mostrar
                      </Typography>
                      <Typography variant="body2">
                        Prueba ajustando los filtros o agrega nuevos registros.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Box sx={{ flex: 1, minHeight: 20 }} />
          </Scrollbar>
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <CustomTablePagination
            page={state.page}
            count={total}
            rowsPerPage={state.pageSize}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            showFirstButton
            showLastButton
            showFilters={canReset}
          />
        </Box>
      </Card>
    </DashboardContent>
  );
}

// Componente principal que provee el contexto
export function UsuarioTableView() {
  return (
    <UsuarioFiltersProvider>
      <UsuarioTableViewContent />
    </UsuarioFiltersProvider>
  );
}