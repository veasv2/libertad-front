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
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

import type { PaletteColorKey } from 'src/theme/core';
import type { IUserTableFilters } from 'src/types/user';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Usuario } from 'src/models/seguridad/usuario';
import { ESTADO_USUARIO_OPTIONS, TIPO_USUARIO_OPTIONS } from 'src/types/enums/usuario-enum';

// ← IMPORTACIONES ACTUALIZADAS
import { useUsuarioList } from 'src/services/seguridad/usuario/usuario-service';
import type { UsuarioListParams } from 'src/services/seguridad/usuario/usuario-types';
import type { SortConfig } from 'src/types/filters';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  useTable,
} from 'src/components/table';

import { UsuarioTableRow } from './usuario-table-row';
import { UsuarioTableToolbar } from './usuario-table-toolbar';

const ESTADO_USUARIO = [
  { value: 'all', label: 'Todos', color: 'default' as PaletteColorKey },
  ...ESTADO_USUARIO_OPTIONS
];

// ← TABLA HEADERS RESPONSIVA
const TABLE_HEAD = [
  { id: 'email', label: 'Usuario', sort: true },
  { id: 'nombres', label: 'Nombres', width: { xs: 120, sm: 150, md: 180 }, sort: true },
  { id: 'telefono', label: 'Teléfono', width: { xs: 90, sm: 100, md: 120 }, hide: { xs: true, sm: false } },
  { id: 'tipo', label: 'Tipo', width: { xs: 80, sm: 100, md: 120 }, sort: true },
  { id: 'estado', label: 'Estado', width: { xs: 80, sm: 100, md: 120 }, sort: true },
  { id: 'ultimo_acceso', label: 'Conexión', width: { xs: 100, sm: 120, md: 140 }, sort: true, hide: { xs: true, md: false } },
  { id: '', label: '', width: 64 }  // Para acciones
];

// ← Estilos CSS integrados
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

  // ← ESTADO ACTUALIZADO PARA FILTROS Y ORDENAMIENTO
  const filters = useSetState<IUserTableFilters>({
    name: '',
    role: [],
    status: 'all'
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  // ← NUEVO: Estado para ordenamiento
  const [sortConfig, setSortConfig] = useState<SortConfig>([
    { column: 'nombres', direction: 'asc' }
  ]);

  // ← PARÁMETROS ACTUALIZADOS PARA EL SERVICIO
  const serviceParams = useMemo((): UsuarioListParams => {
    const where: any = {};

    // Búsqueda por nombre (si existe)
    if (currentFilters.name) {
      where.OR = [
        { nombres: { contains: currentFilters.name, mode: 'insensitive' } },
        { apellido_paterno: { contains: currentFilters.name, mode: 'insensitive' } },
        { email: { contains: currentFilters.name, mode: 'insensitive' } },
        { dni: { contains: currentFilters.name, mode: 'insensitive' } }
      ];
    }

    // Filtro por estado
    if (currentFilters.status !== 'all') {
      where.estado = { equals: currentFilters.status };
    }

    // Filtro por roles/tipos (múltiples)
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

  // ← USAR EL SERVICIO ACTUALIZADO
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

  const canReset =
    !!currentFilters.name || currentFilters.role.length > 0 || currentFilters.status !== 'all';

  const notFound = (!usuarios.length && canReset) || (!usuarios.length && !isLoading);

  // ← HANDLERS ACTUALIZADOS

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  // ← NUEVO: Handler para ordenamiento
  const handleSort = useCallback(
    (columnId: string) => {
      // Mapear IDs de columna a nombres de campo del backend
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
          // Cambiar dirección
          return prevSort.map(s =>
            s.column === fieldName
              ? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' }
              : s
          );
        } else {
          // Agregar nueva columna de ordenamiento (reemplazar el anterior)
          return [{ column: fieldName, direction: 'asc' }];
        }
      });

      table.onResetPage();
    },
    [table]
  );

  // ← NUEVO: Función para obtener conteo por estado (opcional)
  const getUsuarioCountByStatus = useCallback((status: string) => {
    if (status === 'all') return total;
    // Para conteos exactos, podrías mantener un estado separado o hacer consultas adicionales
    return 0;
  }, [total]);

  return (
    <>
      <DashboardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 80px)' }, // ← 64px móvil, 80px desktop
        }}
      >
        <Box sx={{ mb: { xs: 1, md: 2 } }}>
          <Typography variant="h5">Lista de Usuarios</Typography>
        </Box>

        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1, // ← Ocupa el espacio restante
            overflow: 'hidden', // ← Evita desbordamiento
          }}
        >
          <Tabs
            value={currentFilters.status}
            onChange={handleFilterStatus}
            sx={[
              (theme) => ({
                px: { md: 2.5 },
                boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
                flexShrink: 0, // ← No se encoge
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

          <Box sx={{ flexShrink: 0 }}> {/* ← Toolbar fijo */}
            <UsuarioTableToolbar
              filters={filters}
              onResetPage={table.onResetPage}
              options={{ tipoUsuario: TIPO_USUARIO_OPTIONS }}
            />
          </Box>

          {/* ← CONTENEDOR DE TABLA CON ALTURA FIJA */}
          <Box
            sx={{
              flex: 1, // ← Ocupa el espacio restante
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: 0, // ← Importante para Firefox
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
                  minWidth: { xs: 600, sm: 800, md: 960 }, // ← Responsive
                  '& .MuiTableCell-root': {
                    whiteSpace: 'nowrap', // ← Evita saltos de línea
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }
                }}
              >
                <TableHead sx={{
                  '& .MuiTableCell-root': {
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'background.paper',
                    zIndex: 1,
                  }
                }}>
                  <TableRow>
                    {table.selected.length > 0 && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={table.selected.length > 0 && table.selected.length < total}
                          checked={total > 0 && table.selected.length === total}
                          onChange={(event) => {
                            // Lógica para seleccionar/deseleccionar todos
                            if (event.target.checked) {
                              // Seleccionar todos los IDs de la página actual
                              usuarios.forEach(user => table.onSelectRow(user.uuid));
                            } else {
                              // Deseleccionar todos
                              table.onSelectAllRows([]);
                            }
                          }}
                          slotProps={{
                            input: {
                              id: 'all-row-checkbox',
                              'aria-label': 'All row Checkbox',
                            },
                          }}
                        />
                      </TableCell>
                    )}

                    {TABLE_HEAD.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        align={headCell.align || 'left'}
                        sortDirection={sortConfig[0]?.column === headCell.id ? sortConfig[0]?.direction : false}
                        sx={{ width: headCell.width }}
                      >
                        {headCell.sort && headCell.id ? (
                          <TableSortLabel
                            hideSortIcon
                            active={sortConfig[0]?.column === headCell.id}
                            direction={sortConfig[0]?.column === headCell.id ? sortConfig[0]?.direction : 'asc'}
                            onClick={() => handleSort(headCell.id)}
                          >
                            {headCell.label}

                            {sortConfig[0]?.column === headCell.id ? (
                              <Box component="span" sx={visuallyHidden}>
                                {sortConfig[0]?.direction === 'desc' ? 'sorted descending' : 'sorted ascending'}
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
                    // ← Skeleton optimizado
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} style={{ height: 73 }}>
                        <td colSpan={TABLE_HEAD.length}>
                          <Box sx={{
                            p: 2,
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%'
                          }}>
                            {index === 2 && (
                              <Typography variant="body2" color="text.secondary">
                                Cargando usuarios...
                              </Typography>
                            )}
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

                  {/* ← Mensaje cuando no hay datos */}
                  {!isLoading && usuarios.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={TABLE_HEAD.length} sx={{
                        textAlign: 'center',
                        py: 10,
                        color: 'text.secondary'
                      }}>
                        <Typography variant="h6" gutterBottom>
                          {notFound ? 'No se encontraron resultados' : 'Sin registros'}
                        </Typography>
                        <Typography variant="body2">
                          {canReset
                            ? 'Intenta ajustar los filtros de búsqueda.'
                            : 'No hay usuarios registrados en el sistema.'
                          }
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* ← Espaciador flexible para empujar la paginación hacia abajo */}
              <Box sx={{ flex: 1, minHeight: 20 }} />
            </Scrollbar>
          </Box>

          <Box sx={{
            flexShrink: 0,
            borderTop: 1,
            borderColor: 'divider',
            position: 'relative'
          }}>
            <TablePagination
              page={table.page}
              count={total}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              showFirstButton
              showLastButton
              sx={{ borderTopColor: 'transparent' }}
            />
          </Box>
        </Card>
      </DashboardContent>
    </>
  );
}