// src/sections/seguridad/usuario/ax-table-pagination.tsx

import { forwardRef, ReactNode } from 'react';
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
import type { TablePaginationProps } from '@mui/material/TablePagination';

// ----------------------------------------------------------------------

type AxTablePaginationProps = TablePaginationProps & {
    showFilters?: boolean;
    ActiveFiltersComponent?: ReactNode;
};

export const AxTablePagination = forwardRef<HTMLDivElement, AxTablePaginationProps>(
    ({ showFilters = false, ActiveFiltersComponent, ...paginationProps }, ref) => {
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
                    {showFilters && ActiveFiltersComponent}
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

AxTablePagination.displayName = 'AxTablePagination';