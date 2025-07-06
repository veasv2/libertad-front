import globals from 'globals';
import eslintJs from '@eslint/js';
import eslintTs from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

// ----------------------------------------------------------------------

const commonRules = () => ({});
const importRules = () => ({});
const unusedImportsRules = () => ({});
const sortImportsRules = () => ({});

// ----------------------------------------------------------------------

export const customConfig = {
  plugins: {
    'react-hooks': reactHooksPlugin,
    'unused-imports': unusedImportsPlugin,
    perfectionist: perfectionistPlugin,
    import: importPlugin,
  },
  settings: {
    ...importPlugin.configs.typescript.settings,
    'import/resolver': {
      ...importPlugin.configs.typescript.settings['import/resolver'],
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    // ⚠️ Todo desactivado
  },
};

// ----------------------------------------------------------------------

export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },

  // ⚠️ Ignora todo
  { ignores: ['*'] },

  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: 'detect' } },
  },
  eslintJs.configs.recommended,
  ...eslintTs.configs.recommended,
  reactPlugin.configs.flat.recommended,
  customConfig,
];
