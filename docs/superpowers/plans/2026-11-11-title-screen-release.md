# Title Screen and Verified Release Implementation Plan

**Goal:** Ship a visual start menu and a completely playable release with passing E2E flows and at least 90% measured line coverage in both frontend and backend.

**Architecture:** Preserve Three.js rendering and the authoritative FastAPI room aggregate. Add a small title-screen component that orchestrates existing setup, settings and continue flows. Instrument all application TypeScript during coverage runs, report browser and unit coverage separately, and include all backend application modules.

**Tech Stack:** TypeScript, Vite, Three.js, Playwright, Vitest/Istanbul, Python, pytest-cov, FastAPI, PostgreSQL.

- [x] Add `src/ui/start-menu.ts`, title-screen CSS and menu lifecycle in `src/main.ts`; cover initial load, Continue, New Game, settings, help, world choice and returning to the menu.
- [x] Keep local and room progress separate. Confirm before leaving a current room for a new party. Restore pending encounters after Continue. Pause local play while in the menu and disclose that live room turns continue.
- [x] Add coverage instrumentation and collection for all `src/**/*.ts`, plus backend branch/line reporting. No app-code exclusions to inflate coverage.
- [x] Add meaningful tests for uncovered rules, failures, persistence, permissions, settings and interactions. Complete full solo/hotseat/remote games and rematches through the supported UI/API contract.
- [ ] Run all checks, enforce frontend/backend line thresholds at 90%, and record branch metrics separately.
- [ ] Refresh screenshots and README; deploy Docker services on localhost:7777; smoke-test the production build, then commit and push.

Coverage implementation note: Vite browser instrumentation and Vitest instrumentation produce different source-map statement ranges. They are intentionally **not merged**. The frontend release threshold uses instrumented browser coverage across every application TypeScript file; Vitest is reported independently.
