import type { IUserItem } from 'src/types/user';

import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import type { Usuario } from 'src/models/seguridad/usuario';
import { fTime, fDate } from 'src/utils/format-time';
import { EstadoUsuario, TipoUsuario } from 'src/types/enums/usuario-enum';

type Props = {
  row: Usuario;
  selected: boolean;
  editHref: string;
  onSelectRow: () => void;
  onDeleteRow: () => void;
};

export function UserTableRow({ row, selected, editHref, onSelectRow, onDeleteRow }: Props) {
  const menuActions = usePopover();
  const confirmDialog = useBoolean();
  const quickEditForm = useBoolean();

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <li>
          <MenuItem component={RouterLink} href={editHref} onClick={() => menuActions.onClose()}>
            <Iconify icon="solar:eye-bold" />
            Ver
          </MenuItem>
        </li>
        <li>
          <MenuItem component={RouterLink} href={editHref} onClick={() => menuActions.onClose()}>
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>
        </li>

        <MenuItem
          onClick={() => {
            confirmDialog.onTrue();
            menuActions.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Eliminar
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content="Are you sure want to delete?"
      action={
        <Button variant="contained" color="error" onClick={onDeleteRow}>
          Eliminar
        </Button>
      }
    />
  );

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>


        <TableCell id="dni_email">
          <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar alt={row.dni} src={row.email} />

            <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
              <Link
                component={RouterLink}
                href={editHref}
                color="inherit"
                sx={{ cursor: 'pointer' }}
              >
                {row.dni}
              </Link>
              <Box component="span" sx={{ color: 'text.disabled' }}>
                {row.email}
              </Box>
            </Stack>
          </Box>
        </TableCell>
        <TableCell>
          <Box sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}>
            <span>{row.nombres}</span>
            <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
              {row.apellido_paterno + " " + row.apellido_materno}
            </Box>
          </Box>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.telefono}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={TipoUsuario[row.tipo].color}
          >
            {row.tipo}
          </Label>
        </TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={EstadoUsuario[row.estado].color}
          >
            {row.estado}
          </Label>
        </TableCell>
        <TableCell>
          <Box sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}>
            <span>{row.ultimo_acceso && fDate(row.ultimo_acceso)}</span>
            <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
              {row.ultimo_acceso && fTime(row.ultimo_acceso)}
            </Box>
          </Box>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>

            <IconButton
              color={menuActions.open ? 'inherit' : 'primary'}
              onClick={menuActions.onOpen}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow >

      {renderMenuActions()}
      {renderConfirmDialog()}
    </>
  );
}
