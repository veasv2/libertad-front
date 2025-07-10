import type { SelectChangeEvent } from '@mui/material/Select';

import { useState, useCallback, useEffect } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';

import type { TipoUsuarioValue } from 'src/types/enums/usuario-enum';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { TIPO_USUARIO_OPTIONS } from 'src/types/enums/usuario-enum';
import { useUsuarioFilters } from './usuario-filters-context';

// ----------------------------------------------------------------------

export function UsuarioTableToolbar() {
  const menuActions = usePopover();
  const { state, applyToolbarFilters } = useUsuarioFilters();

  // Estados locales para manejar inputs antes de aplicar
  const [localSearch, setLocalSearch] = useState(state.search);
  const [localTipo, setLocalTipo] = useState<TipoUsuarioValue[]>(state.tipo);

  // Sincronizar estados locales cuando cambie el estado del contexto
  useEffect(() => {
    setLocalSearch(state.search);
    setLocalTipo(state.tipo);
  }, [state.search, state.tipo]);

  const handleChangeSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSearch(event.target.value);
    },
    []
  );

  const handleChangeTipo = useCallback(
    (event: SelectChangeEvent<TipoUsuarioValue[]>) => {
      const newValue = typeof event.target.value === 'string'
        ? []
        : event.target.value;
      setLocalTipo(newValue);
    },
    []
  );

  const handleApplyFilters = useCallback(() => {
    applyToolbarFilters(localSearch, localTipo);
  }, [localSearch, localTipo, applyToolbarFilters]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleApplyFilters();
      }
    },
    [handleApplyFilters]
  );

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <MenuItem onClick={() => menuActions.onClose()}>
          <Iconify icon="solar:printer-minimalistic-bold" />
          Imprimir
        </MenuItem>
        <MenuItem onClick={() => menuActions.onClose()}>
          <Iconify icon="solar:import-bold" />
          Importar
        </MenuItem>
        <MenuItem onClick={() => menuActions.onClose()}>
          <Iconify icon="solar:export-bold" />
          Exportar
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <Box
        sx={{
          p: 2.5,
          gap: 2,
          display: 'flex',
          pr: { xs: 2.5, md: 1 },
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-end', md: 'center' },
        }}
      >
        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 250 } }}>
          <InputLabel htmlFor="filter-tipo-select">Tipo de Usuario</InputLabel>
          <Select
            multiple
            label="Tipo de Usuario"
            value={localTipo}
            onChange={handleChangeTipo}
            renderValue={(selected) =>
              selected.map(value =>
                TIPO_USUARIO_OPTIONS.find(option => option.value === value)?.label
              ).join(', ')
            }
            inputProps={{ id: 'filter-tipo-select' }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
          >
            {TIPO_USUARIO_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={localTipo.includes(option.value)}
                  slotProps={{ input: { id: `${option.value}-checkbox` } }}
                />
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{
            gap: 2,
            width: 1,
            flexGrow: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
          }}
        >
          <TextField
            fullWidth
            value={localSearch}
            onChange={handleChangeSearch}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por nombre, apellidos, email o DNI..."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box
            sx={{
              gap: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <Button
              component={RouterLink}
              href={paths.seguridad.user.new}
              variant="outlined"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{ px: 2.5, py: 1 }}
            >
              Agregar
            </Button>

            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:restart-bold" />}
              onClick={handleApplyFilters}
              sx={{ px: 2.5, py: 1 }}
            >
              Actualizar
            </Button>

            <IconButton onClick={menuActions.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {renderMenuActions()}
    </>
  );
}