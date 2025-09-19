TypeScript and ESLint compatibility

This project uses TypeScript and the TypeScript ESLint tooling. A few notes to avoid warnings and ensure linting works:

- Supported setup used during development:
  - Node: 22.12.0
  - npm: 10.9.0
  - TypeScript: ^5.8.x
  - @typescript-eslint/parser and @typescript-eslint/eslint-plugin: 8.44.0 (pinned)

- If you upgrade TypeScript to a newer major (eg 5.9+), upgrade `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` to matching versions that declare support for that TypeScript version.

- To update the eslint tooling safely:
  1. Update the versions in `devDependencies` (package.json).
  2. Run `npm install`.
  3. Run `npx ng lint` and fix any new warnings/errors.

If you see the warning:

"You are currently running a version of TypeScript which is not officially supported by @typescript-eslint/typescript-estree"

then update the @typescript-eslint packages (as above) to versions that support your installed TypeScript.
