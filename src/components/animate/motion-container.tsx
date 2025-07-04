import type { MotionProps } from 'framer-motion';
import type { BoxProps } from '@mui/material/Box';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';

import { varContainer } from './variants';

// ----------------------------------------------------------------------

export type MotionContainerProps = BoxProps &
  MotionProps & {
    animate?: boolean;
    action?: boolean;
  };

export function MotionContainer({
  sx,
  animate,
  children,
  action = false,
  ...other
}: MotionContainerProps) {
  return (
    <Box
      component={m.div}
      variants={varContainer()}
      initial={action ? false : 'initial'}
      animate={action ? (animate ? 'animate' : 'exit') : 'animate'}
      exit={action ? undefined : 'exit'}
      sx={sx}
      {...other}
    >
      {children}
    </Box>
  );
}
