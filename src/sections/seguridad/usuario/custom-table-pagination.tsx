// src/sections/seguridad/usuario/custom-table-pagination.tsx

import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
import type { TablePaginationProps } from '@mui/material/TablePagination';

import { UsuarioActiveFilters } from './usuario-active-filters';

// ----------------------------------------------------------------------

type CustomTablePaginationProps = TablePaginationProps & {
    showFilters?: boolean;
};

export const CustomTablePagination = forwardRef<HTMLDivElement, CustomTablePaginationProps>(
    ({ showFilters = false, ...paginationProps }, ref) => {
        return (
            <Box
                ref={ref}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderTop: 1,
                    borderColor: 'divider',
                    minHeight: 52,
                }}
            >
                {/* Lado izquierdo - Filtros activos */}
                <Box sx={{ flex: '0 0 auto', px: 2, py: 1 }}>
                    {showFilters && (
                        <UsuarioActiveFilters
                            compact={true}
                            totalResults={paginationProps.count}
                        />
                    )}
                </Box>

                {/* Lado derecho - Paginación */}
                <Box sx={{ flex: '1 1 auto', display: 'flex', justifyContent: 'flex-end' }}>
                    <TablePagination
                        {...paginationProps}
                        sx={{
                            border: 'none',
                            '& .MuiTablePagination-toolbar': {
                                minHeight: 52,
                            },
                        }}
                    />
                </Box>
            </Box>
        );
    }
);

CustomTablePagination.displayName = 'CustomTablePagination';