import type { Theme, Components } from '@mui/material/styles';
import type { SettingsState } from 'src/components/settings';

import { cardClasses } from '@mui/material/Card';

// ----------------------------------------------------------------------

export function applySettingsToComponents(settingsState?: SettingsState): {
  components: Components<Theme>;
} {
  const MuiCssBaseline: Components<Theme>['MuiCssBaseline'] = {
    styleOverrides: (theme) => ({
      html: {
        fontSize: settingsState?.fontSize,
      },
      body: {
        [`& .${cardClasses.root}`]: {
          ...(settingsState?.contrast === 'hight' && {
            '--card-shadow': theme.vars.customShadows.z1,
          }),
        },
      },
    }),
  };

  return {
    components: {
      MuiCssBaseline,
    },
  };
}
