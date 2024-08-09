/**
 * @type {import('prettier').Options}
 */
export default {
  arrowParens: 'avoid',
  printWidth: 160,
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  trailingComma: 'none',
  bracketSpacing: true,
  bracketSameLine: true,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '<BUILTIN_MODULES>', // Node.js built-in modules
    '<THIRD_PARTY_MODULES>', // Imports not matched by other special words or groups.
    '^@plasmo/(.*)$',
    '^@plasmohq/(.*)$',
    '^~(.*)$',
    '^[./]'
  ]
};
