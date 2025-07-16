// src/sections/seguridad/usuario/ax-active-filter.tsx

import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type FilterItem = {
    key: string;
    label: string;
    value: string;
    onRemove: () => void;
};

type AxActiveFilterProps = {
    filters: FilterItem[];
    totalResults?: number;
    compact?: boolean;
    sx?: any;
    hasPendingChanges?: boolean;
    onClearAll: () => void;
};

export function AxActiveFilter({
    filters,
    totalResults,
    compact,
    sx,
    hasPendingChanges = false,
    onClearAll,
}: AxActiveFilterProps) {
    const [showPopup, setShowPopup] = useState(false);

    const filterCount = filters.length;
    const hasAppliedFilters = filterCount > 0;

    // Renderizar popup con filtros detallados
    const renderFilterPopup = () => (
        <Dialog
            open={showPopup}
            onClose={() => setShowPopup(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '80vh',
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    pb: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <IconButton onClick={() => setShowPopup(false)} color="primary">
                    <Iconify icon="solar:settings-bold" width={24} />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Filtros aplicados actualmente.
                    </Typography>
                    {hasPendingChanges && (
                        <Typography variant="caption" sx={{ color: 'warning.main' }}>
                            ⚠️ Hay cambios pendientes por aplicar
                        </Typography>
                    )}
                </Box>

                <IconButton onClick={() => setShowPopup(false)}>
                    <Iconify icon="solar:close-circle-bold" width={24} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filters.length > 0 ? (
                        filters.map((filter) => (
                            <Box
                                key={filter.key}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1,
                                    border: '1px solid',
                                    borderColor: 'grey.200',
                                    borderRadius: 2,
                                    backgroundColor: 'grey.50',
                                    '&:hover': {
                                        backgroundColor: 'grey.100',
                                    },
                                }}
                            >
                                <IconButton color="error" onClick={filter.onRemove}>
                                    <Iconify icon="solar:close-circle-bold" />
                                </IconButton>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                        {filter.label}
                                    </Typography>
                                    <Chip
                                        clickable
                                        color="primary"
                                        variant="outlined"
                                        label={filter.value}
                                    />
                                </Box>
                            </Box>
                        ))
                    ) : (
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 4,
                                color: 'text.secondary',
                            }}
                        >
                            <Iconify icon="solar:letter-bold" sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                            <Typography variant="body2">
                                No hay filtros aplicados
                            </Typography>
                            {hasPendingChanges && (
                                <Typography variant="caption" sx={{ color: 'warning.main', mt: 1, display: 'block' }}>
                                    Tienes cambios pendientes por aplicar
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    py: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    justifyContent: 'space-between',
                }}
            >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    💡 Haz clic en la X roja para eliminar cada filtro
                </Typography>

                <Button
                    variant="contained"
                    color="error"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={18} />}
                    onClick={onClearAll}
                    disabled={!hasAppliedFilters}
                >
                    Limpiar todos los filtros
                </Button>
            </DialogActions>
        </Dialog>
    );

    if (!hasAppliedFilters) {
        return null;
    }

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    ...sx
                }}
            >
                <Chip
                    size="small"
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Iconify icon="solar:eye-bold" width={14} />
                            <span>{`${filterCount} filtro${filterCount !== 1 ? 's' : ''}`}</span>
                            {hasPendingChanges && (
                                <Iconify
                                    icon="solar:danger-bold"
                                    width={12}
                                    sx={{ color: 'warning.main', ml: 0.5 }}
                                />
                            )}
                        </Box>
                    }
                    onClick={() => setShowPopup(true)}
                    sx={{
                        backgroundColor: hasPendingChanges ? 'warning.lighter' : 'primary.lighter',
                        color: hasPendingChanges ? 'warning.dark' : 'primary.dark',
                        border: '1px solid',
                        borderColor: hasPendingChanges ? 'warning.light' : 'primary.light',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        height: 24,
                        '&:hover': {
                            backgroundColor: hasPendingChanges ? 'warning.light' : 'primary.light',
                        },
                        '& .MuiChip-label': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                        },
                    }}
                />

                <IconButton
                    size="small"
                    onClick={onClearAll}
                    sx={{
                        color: 'error.main',
                        '&:hover': {
                            backgroundColor: 'error.lighter',
                        },
                        width: 24,
                        height: 24,
                    }}
                    title="Limpiar filtros"
                >
                    <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                </IconButton>
            </Box>
            {renderFilterPopup()}
        </>
    );
}

export type { AxActiveFilterProps, FilterItem };