# Tasks

1. Expose the `version` from `package.json` to the UI (typed JSON import or a build-time constant).
2. Add a pure function that builds the `Version X.Y.Z` label, and render it as a footer in `configPage()` in `src/ui/config-page.ts`.
3. Add a unit test in `tests/` that asserts the label text for a given version (`Version 0.4.2`) and that `configPage()` output contains it.
4. Run `npm run build` and `npm test`; confirm no other UI output changes.
