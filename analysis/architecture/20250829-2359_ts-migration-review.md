Status summary

- Type-check: tsconfig.test.json passes; tsconfig.json fails (TS6059 from playwright includes). Build fails due to src/test.ts typing of window helpers being included in production TS program.
- Tests: Mocha not discovering .ts tests with current script; Playwright 7/10 passing, 3 failing due to outdated selectors/indexing and manual init expectations.
- Demo: demo.html serves and initializes without JS errors via http-server; core interactions render.

Key findings

- Main tsconfig includes playwright/**/* with rootDir=src, causing TS6059. Remove playwright from main program or set rootDir to "." with separate test configs.
- tsconfig.webpack.json includes all src/**/*, inadvertently type-checking dev-only src/test.ts in production. Exclude it or add window typings if keeping.
- Unit test command should add --extension ts (or use ts-mocha) and avoid building before tests, or ensure build passes first.
- E2E tests reference legacy .jexcel selectors and mis-index totals cell (row-number td offset); update to .jss_* and index 4 or slice.

Next steps

- Fix tsconfig.json/webpack config as above and rerun: npm run build, npm run type-check, and npx playwright test.
- Update mocha test script and validate unit tests run green.