// src/sections/seguridad/usuario/usuario-table-view.tsx

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

import { useUsuarioList } from 'src/services/seguridad/usuario/usuario-service';
import type { UsuarioListParams, UsuarioWhere } from 'src/services/seguridad/usuario/usuario-types';
import type { SortConfig } from 'src/types/filters';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useTable } from 'src/components/table';

import { UsuarioTableRow } from './usuario-table-row';
import { UsuarioTableToolbar } from './usuario-table-toolbar';
import { CustomTablePagination } from './custom-table-pagination'; // ✅ NUEVO COMPONENTE

const ESTADO_USUARIO = [
  { value: 'all', label: 'Todos', color: 'default' as PaletteColorKey },
  ...ESTADO_USUARIO_OPTIONS
];

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

export function UsuarioTableView() {
  const table = useTable();

  // Estado simplificado: Solo manejar filtros del toolbar
  const filters = useSetState<UsuarioWhere>({});
  const { state: toolbarFilters, setState: updateToolbarFilters } = filters;

  // Estado para el tab de estado (separado del filtro principal)
  const [selectedTab, setSelectedTab] = useState('all');

  // Estado para ordenamiento
  const [sortConfig, setSortConfig] = useState<SortConfig>([
    { column: 'nombres', direction: 'asc' }
  ]);

  // Parámetros corregidos
  const serviceParams = useMemo((): UsuarioListParams => {
    const conditions: UsuarioWhere[] = [];

    // 1. Filtro de búsqueda de texto (OR anidado)
    if (toolbarFilters.OR && toolbarFilters.OR.length > 0) {
      conditions.push({
        OR: toolbarFilters.OR
      });
    }

    // 2. Filtro de tipo (AND)
    if (toolbarFilters.tipo && toolbarFilters.tipo.in && toolbarFilters.tipo.in.length > 0) {
      conditions.push({
        tipo: toolbarFilters.tipo
      });
    }

    // 3. Filtro de estado del tab (AND)
    if (selectedTab !== 'all') {
      conditions.push({
        estado: { equals: selectedTab }
      });
    }

    // Construir el WHERE final
    let finalWhere: UsuarioWhere | undefined;

    if (conditions.length === 0) {
      finalWhere = undefined;
    } else if (conditions.length === 1) {
      finalWhere = conditions[0];
    } else {
      finalWhere = { AND: conditions };
    }

    const params = {
      where: finalWhere,
      pagination: {
        page: table.page + 1,
        pageSize: table.rowsPerPage,
      },
      sort: sortConfig
    };

    return params;
  }, [toolbarFilters, table.page, table.rowsPerPage, selectedTab, sortConfig]);

  // Usar el servicio actualizado
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

  // Actualizar lógica de canReset
  const canReset = !!(
    toolbarFilters.OR || // Hay búsqueda de texto
    toolbarFilters.tipo?.in?.length || // Hay filtro de tipo
    selectedTab !== 'all' // Hay filtro de estado
  );

  const notFound = (!usuarios.length && canReset) || (!usuarios.length && !isLoading);

  // ✅ HANDLER para cambiar tab (usado por FiltersResult)
  const handleTabChange = useCallback((newTab: string) => {
    table.onResetPage();
    setSelectedTab(newTab);
  }, [table]);

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleTabChange(newValue);
    },
    [handleTabChange]
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

  // Función para obtener conteo por estado
  const getUsuarioCountByStatus = useCallback((status: string) => {
    if (status === 'all') return total;
    return 0;
  }, [total]);

  return (
    <>
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
          <Tabs
            value={selectedTab}
            onChange={handleFilterStatus}
            sx={[
              (theme) => ({
                px: { md: 2.5 },
                boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
                flexShrink: 0,
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
                    variant={tab.value === selectedTab ? 'filled' : 'soft'}
                    color={tab.color}
                  >
                    {getUsuarioCountByStatus(tab.value)}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <Box sx={{ flexShrink: 0 }}>
            <UsuarioTableToolbar
              filters={filters}
              onResetPage={table.onResetPage}
            />
          </Box>

          {/* Contenedor de tabla con altura fija */}
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
                          sortConfig?.[0]?.column === headCell.id
                            ? sortConfig[0].direction
                            : false
                        }
                        sx={{ width: headCell.width }}
                      >
                        {headCell.sort && headCell.id ? (
                          <TableSortLabel
                            hideSortIcon
                            active={sortConfig?.[0]?.column === headCell.id}
                            direction={
                              sortConfig?.[0]?.column === headCell.id
                                ? sortConfig[0].direction
                                : 'asc'
                            }
                            onClick={() => handleSort(headCell.id)}
                          >
                            {headCell.label}

                            {sortConfig?.[0]?.column === headCell.id ? (
                              <Box component="span" sx={visuallyHidden}>
                                {sortConfig[0].direction === 'desc' ? 'sorted descending' : 'sorted ascending'}
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
                    // Skeleton optimizado
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
                    )
                    )
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

                  {/* Mensaje cuando no hay datos */}
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

              {/* Espaciador flexible para empujar la paginación hacia abajo */}
              <Box sx={{ flex: 1, minHeight: 20 }} />
            </Scrollbar>
          </Box>

          {/* ✅ PAGINACIÓN PERSONALIZADA CON FILTROS */}
          <Box sx={{ flexShrink: 0 }}>
            <CustomTablePagination
              page={table.page}
              count={total}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              showFirstButton
              showLastButton
              // Props específicos para filtros
              filters={filters}
              selectedTab={selectedTab}
              onTabChange={handleTabChange}
              showFilters={canReset}
            />
          </Box>
        </Card>
      </DashboardContent>
    </>
  );
}