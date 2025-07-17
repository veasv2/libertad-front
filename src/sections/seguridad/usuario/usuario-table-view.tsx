// src/sections/seguridad/usuario/usuario-table-view.tsx

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';

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
import { DashboardContent } from 'src/layouts/dashboard';

import { useUsuarioList, useUsuarioStatusSummary } from 'src/services/seguridad/usuario/usuario-service';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';

import { UsuarioTableRow } from './usuario-table-row';
import { UsuarioTableToolbar } from './usuario-table-toolbar';
import { AxTablePagination } from 'src/components/ax/ax-table-pagination';
import { AxActiveFilter } from 'src/components/ax/ax-active-filter';

// Importar desde la nueva ubicación
import { UsuarioOpcionProvider } from './usuario-opcion-context';
import { useUsuarioOpcion } from './usuario-opcion-context';
import { SortConfig } from 'src/contexts/filters';

// Helper para mapear estados a colores
const getStatusColor = (status: string): PaletteColorKey | 'default' => {
  const colorMap: Record<string, PaletteColorKey | 'default'> = {
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
  { id: 'checkbox', label: '', width: 48 },
  { id: 'email', label: 'Usuario', sort: true },
  { id: 'nombres', label: 'Nombres', width: { xs: 120, sm: 150, md: 180 }, sort: true },
  { id: 'telefono', label: 'Teléfono', width: { xs: 90, sm: 100, md: 120 }, hide: { xs: true, sm: false } },
  { id: 'tipo', label: 'Tipo', width: { xs: 80, sm: 100, md: 120 }, sort: true },
  { id: 'estado', label: 'Estado', width: { xs: 80, sm: 100, md: 120 }, sort: true },
  { id: 'ultimo_acceso', label: 'Conexión', width: { xs: 100, sm: 120, md: 140 }, sort: true, hide: { xs: true, md: false } },
  { id: 'actions', label: '', width: 64 }
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
  // Usar el nuevo contexto de opciones
  const {
    state,
    setExtraState,
    setSort,
    setPage,
    setPageSize,
    setSelectedId,
    hasActiveFilters,
    canReset,
    applyFilters,
    resetAllFilters,
    getServiceParams,
    verifySelection
  } = useUsuarioOpcion();

  // Resumen SIN filtros del toolbar (solo totales generales)
  const {
    total: summaryTotal,
    items: summaryItems,
    isLoading: summaryLoading
  } = useUsuarioStatusSummary();

  // getServiceParams() funciona exactamente igual
  const serviceParams = getServiceParams();
  console.log('[TABLE VIEW] serviceParams:', serviceParams, 'ref:', serviceParams);
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

  // Verificar selección cuando cambien los resultados
  useEffect(() => {
    if (usuarios && usuarios.length > 0 && state.selectedId) {
      const availableIds = usuarios.map(u => u.uuid);
      const isInitialLoad = window.location.search.includes('selectedId');
      verifySelection(availableIds, isInitialLoad);

      if (isInitialLoad && state.selectedId && !availableIds.includes(state.selectedId)) {
        toast.warning('El elemento seleccionado no está en la lista actual');
      }
    }
  }, [usuarios, state.selectedId, verifySelection]);

  // Manejar errores
  if (error) {
    toast.error('Error al cargar usuarios');
  }

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
      color: getStatusColor(item.label) as PaletteColorKey,
      count: item.value
    }));

    return [allTab, ...statusTabs];
  }, [summaryTotal, summaryItems]);

  // Handler para cambiar tab
  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      setExtraState({ ...state.extraState, estado: newValue });
    },
    [setExtraState, state.extraState]
  );

  // ✅ CAMBIO 4: Simplificar el handler de sort (usa los nuevos tipos)
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
        setSort(newSort as SortConfig[]);
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

  // Handler para selección de fila
  const handleSelectRow = useCallback((userId: string) => {
    if (state.selectedId === userId) {
      setSelectedId(null);
    } else {
      setSelectedId(userId);
    }
  }, [state.selectedId, setSelectedId]);

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
          value={state.extraState.estado}
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
                  variant={tab.value === state.extraState.estado ? 'filled' : 'soft'}
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
                      selected={state.selectedId === row.uuid}
                      onSelectRow={() => handleSelectRow(row.uuid)}
                      editHref={`/seguridad/usuario/${row.uuid}/editar`}
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
          <AxTablePagination
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
            ActiveFiltersComponent={
              <AxActiveFilter
                filters={getActiveFilters(state.activeFilters || {}, state.extraState, setExtraState, applyFilters)}
                hasPendingChanges={false}
                onClearAll={resetAllFilters}
              />
            }
          />
        </Box>
      </Card>
    </DashboardContent>
  );
}

// Simplificar getActiveFilters (tipos más específicos)
function getActiveFilters(
  activeFilters: any,
  extraState: any,
  setExtraState: (extra: any) => void,
  applyFilters: (filters: any) => void
) {
  const filters = [];

  if (activeFilters.search) {
    filters.push({
      key: 'search',
      label: 'Búsqueda',
      value: activeFilters.search,
      onRemove: () => applyFilters({ ...activeFilters, search: '' }),
    });
  }

  if (activeFilters.tipo && activeFilters.tipo.length > 0) {
    filters.push({
      key: 'tipo',
      label: 'Tipo',
      value: activeFilters.tipo.join(', '),
      onRemove: () => applyFilters({ ...activeFilters, tipo: [] }),
    });
  }

  if (extraState.estado && extraState.estado !== 'all') {
    filters.push({
      key: 'estado',
      label: 'Estado',
      value: extraState.estado,
      onRemove: () => setExtraState({
        ...extraState,
        estado: 'all'
      }),
    });
  }

  return filters;
}

// El componente principal no necesita provider ya que usa el contexto directamente
export function UsuarioTableView() {
  return (
    <UsuarioOpcionProvider>
      <UsuarioTableViewContent />
    </UsuarioOpcionProvider>
  );
}