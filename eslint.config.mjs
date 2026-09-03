import next from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * Flat config, spread straight in — no FlatCompat shim, one fewer dependency.
 * `core-web-vitals` carries the React and a11y rules; `typescript` adds the
 * TypeScript parser and plugin (they are separate entry points in Next 16).
 */
const eslintConfig = [
  ...next,
  ...nextTypescript,
  {
    ignores: [
      '.claude/**',
      '.next/**',
      'node_modules/**',
      'out/**',
      'next-env.d.ts',
      'src/lib/photos.generated.ts',
    ],
  },
  {
    // eslint-plugin-react (vendored inside eslint-config-next) detects the React
    // version by calling context.getFilename(), which ESLint 10 removed — that
    // throws before any rule runs. Naming the version skips detection entirely.
    settings: { react: { version: '19.2' } },
    rules: {
      // The r3f scene graph is declarative JSX over three.js objects; the
      // react/no-unknown-property rule does not know about them.
      'react/no-unknown-property': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];

export default eslintConfig;
