// src/sections/seguridad/usuario/usuario-active-filters.tsx

import { useState, useCallback, useMemo } from 'react';

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
import { TIPO_USUARIO_OPTIONS, ESTADO_USUARIO_OPTIONS } from 'src/types/enums/usuario-enum';
import { useUsuarioFilters } from './usuario-filters-context';

// ----------------------------------------------------------------------

type Props = {
    totalResults?: number;
    compact?: boolean;
    sx?: any;
};

export function UsuarioActiveFilters({ totalResults, sx }: Props) {
    // ✅ Usar el contexto en lugar de props
    const {
        state,
        hasPendingChanges,
        setSearch,
        setTipo,
        setEstado,
        resetAllFilters,
        hasActiveFilters,
        applyToolbarFilters // ✅ AGREGADO: Para aplicar filtros inmediatamente
    } = useUsuarioFilters();

    // ✅ Usar la función hasPendingChanges sin parámetros para el estado actual
    const currentHasPendingChanges = hasPendingChanges();

    const [showPopup, setShowPopup] = useState(false);

    // Helper para obtener el label del tipo de usuario
    const getTipoLabel = useCallback((tipoValue: string) => {
        return TIPO_USUARIO_OPTIONS.find(option => option.value === tipoValue)?.label || tipoValue;
    }, []);

    // Helper para obtener el label del estado
    const getEstadoLabel = useCallback((estadoValue: string) => {
        return ESTADO_USUARIO_OPTIONS.find(option => option.value === estadoValue)?.label || estadoValue;
    }, []);

    // ✅ MODIFICADO: Handlers para remover filtros específicos y aplicar inmediatamente
    const handleRemoveSearch = useCallback(() => {
        // Aplicar inmediatamente el filtro sin el search
        applyToolbarFilters('', state.tipo);
    }, [applyToolbarFilters, state.tipo]);

    const handleRemoveTipo = useCallback((inputValue?: string) => {
        let newTipo: typeof state.tipo;

        if (inputValue) {
            newTipo = state.tipo.filter((item) => item !== inputValue);
        } else {
            newTipo = [];
        }

        // Aplicar inmediatamente el filtro con el nuevo tipo
        applyToolbarFilters(state.search, newTipo);
    }, [applyToolbarFilters, state.search, state.tipo]);

    const handleRemoveEstado = useCallback(() => {
        setEstado('all');
        // El estado se aplica inmediatamente porque no forma parte de los filtros del toolbar
    }, [setEstado]);

    // ✅ MODIFICADO: Reset completo que aplica inmediatamente
    const handleClearAll = useCallback(() => {
        resetAllFilters();
        setShowPopup(false);
        // resetAllFilters ya maneja la aplicación inmediata
    }, [resetAllFilters]);

    // ✅ CORREGIDO: Función para obtener el contador de filtros aplicados
    const getFilterCount = useCallback(() => {
        let count = 0;
        // Solo contar filtros que están realmente aplicados (no los cambios pendientes)
        if (state.search && !currentHasPendingChanges) count++;
        if (state.tipo.length > 0 && !currentHasPendingChanges) count++;
        if (state.estado !== 'all') count++;
        return count;
    }, [state.search, state.tipo.length, state.estado, currentHasPendingChanges]);

    // ✅ CORREGIDO: Verificar filtros aplicados vs pendientes
    const hasAppliedFilters = useMemo(() => {
        return !!(
            (state.search && !currentHasPendingChanges) ||
            (state.tipo.length > 0 && !currentHasPendingChanges) ||
            state.estado !== 'all'
        );
    }, [state.search, state.tipo.length, state.estado, currentHasPendingChanges]);

    // Componente de filtro individual en popup
    const FilterItem = ({
        field,
        operator,
        value,
        onRemove
    }: {
        field: string;
        operator: string;
        value: string;
        onRemove: () => void;
    }) => (
        <Box
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
            <IconButton color="error" onClick={onRemove}>
                <Iconify icon="solar:close-circle-bold" />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {field}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    {operator}
                </Typography>
                <Chip
                    clickable
                    color="primary"
                    variant="outlined"
                    label={value}
                />
            </Box>
        </Box>
    );

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
                    {currentHasPendingChanges && (
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
                    {/* ✅ Solo mostrar filtros aplicados, no los pendientes */}

                    {/* Filtro de búsqueda */}
                    {state.search && !currentHasPendingChanges && (
                        <FilterItem
                            field="Búsqueda"
                            operator="contiene"
                            value={`"${state.search}"`}
                            onRemove={handleRemoveSearch}
                        />
                    )}

                    {/* Filtros de tipo */}
                    {state.tipo.length > 0 && !currentHasPendingChanges && (
                        <>
                            {state.tipo.length === 1 ? (
                                <FilterItem
                                    field="Tipo"
                                    operator="es"
                                    value={getTipoLabel(state.tipo[0])}
                                    onRemove={() => handleRemoveTipo(state.tipo[0])}
                                />
                            ) : (
                                <FilterItem
                                    field="Tipo"
                                    operator="en"
                                    value={`(${state.tipo.map(getTipoLabel).join(', ')})`}
                                    onRemove={() => handleRemoveTipo()}
                                />
                            )}
                        </>
                    )}

                    {/* Filtro de estado */}
                    {state.estado !== 'all' && (
                        <FilterItem
                            field="Estado"
                            operator="es"
                            value={getEstadoLabel(state.estado)}
                            onRemove={handleRemoveEstado}
                        />
                    )}

                    {/* Mensaje si no hay filtros aplicados */}
                    {!hasAppliedFilters && (
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 4,
                                color: 'text.secondary',
                            }}
                        >
                            <Iconify icon="solar:filter-bold" sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                            <Typography variant="body2">
                                No hay filtros aplicados
                            </Typography>
                            {currentHasPendingChanges && (
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
                    onClick={handleClearAll}
                    disabled={!hasAppliedFilters}
                >
                    Limpiar todos los filtros
                </Button>
            </DialogActions>
        </Dialog>
    );

    // ✅ Si no hay filtros aplicados, no mostrar nada
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
                {/* Chip con icono de ojo y texto */}
                <Chip
                    size="small"
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Iconify icon="solar:eye-bold" width={14} />
                            <span>{`${getFilterCount()} filtro${getFilterCount() !== 1 ? 's' : ''}`}</span>
                            {currentHasPendingChanges && (
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
                        backgroundColor: currentHasPendingChanges ? 'warning.lighter' : 'primary.lighter',
                        color: currentHasPendingChanges ? 'warning.dark' : 'primary.dark',
                        border: '1px solid',
                        borderColor: currentHasPendingChanges ? 'warning.light' : 'primary.light',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        height: 24,
                        '&:hover': {
                            backgroundColor: currentHasPendingChanges ? 'warning.light' : 'primary.light',
                        },
                        '& .MuiChip-label': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                        },
                    }}
                />

                {/* Botón para limpiar filtros */}
                <IconButton
                    size="small"
                    onClick={handleClearAll}
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

            {/* Popup de filtros detallados */}
            {renderFilterPopup()}
        </>
    );
}