import '@trivago/prettier-plugin-sort-imports';
import 'prettier-plugin-tailwindcss';

const config = {
  semi: true,
  printWidth: 80,
  tabWidth: 2,
  bracketSpacing: true,
  bracketSameLine: false,
  useTabs: false,
  arrowParens: 'always',
  trailingComma: 'all',
  singleQuote: true,

  importOrderParserPlugins: ['classProperties', 'typescript', 'jsx'],
  importOrder: [
    '<THIRD_PARTY_MODULES>',
    '^@/(.*)$',
    '^\\.\\.(.*)$',
    '^\\.(.*)$',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,

  tailwindFunctions: ['clsx', 'cx', 'cva', 'cn'],
  tailwindStylesheet: './app/globals.css',
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
};
export default config;
