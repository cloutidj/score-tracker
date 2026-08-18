// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // One exported type per file (see docs/CONVENTIONS.md#file-organization).
      // Guards the most common regression; the full rule is convention.
      'max-classes-per-file': ['error', 1],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'st',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'st',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    // The chrome primitives are components on an ATTRIBUTE selector
    // (`button[stButton]`), the same shape Material uses: a call site stays a
    // plain `<button>`, so its semantics, focus order and `aria-*` are the
    // browser's rather than ours. The default rule reads `button` as the selector
    // and rejects it for not starting with `st`; checked as an attribute, the
    // usual `st` prefix and camelCase style apply and hold.
    files: ['src/app/ui/button/*.ts'],
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'st',
          style: 'camelCase',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
