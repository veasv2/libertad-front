import type { SelectChangeEvent } from '@mui/material/Select';
import type { UseSetStateReturn } from 'minimal-shared/hooks';

import { useCallback } from 'react';
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

import type { IUserTableFilters } from 'src/types/user';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { TIPO_USUARIO_OPTIONS } from 'src/types/enums/usuario-enum';

// ----------------------------------------------------------------------

type Props = {
  onResetPage: () => void;
  filters: UseSetStateReturn<IUserTableFilters>;
  options: {};
};

export function UsuarioTableToolbar({ filters, options, onResetPage }: Props) {
  const menuActions = usePopover();

  const { state: currentFilters, setState: updateFilters } = filters;

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onResetPage();
      updateFilters({ name: event.target.value });
    },
    [onResetPage, updateFilters]
  );

  const handleFilterRole = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const newValue =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;
      onResetPage();
      updateFilters({ role: newValue });
    },
    [onResetPage, updateFilters]
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
          <InputLabel htmlFor="filter-role-select">Tipo de Usuario</InputLabel>
          <Select
            multiple
            label="Tipo de Usuario"
            value={currentFilters.role}
            onChange={handleFilterRole}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            inputProps={{ id: 'filter-role-select' }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
          >
            {TIPO_USUARIO_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.label}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={currentFilters.role.includes(option.label)}
                  slotProps={{ input: { id: `${option.label}-checkbox` } }}
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
            value={currentFilters.name}
            onChange={handleFilterName}
            placeholder="Buscar..."
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
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{ px: 2.5, py: 1 }}
            >
              Agregar
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
