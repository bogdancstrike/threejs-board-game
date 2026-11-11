import { test as base, expect, type BrowserContext } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
const enabled = process.env.COVERAGE === "true";
async function save(coverage: unknown) {
  if (!coverage || typeof coverage !== "object") return;
  await mkdir("coverage/browser/raw", { recursive: true });
  await writeFile(
    `coverage/browser/raw/${randomUUID()}.json`,
    JSON.stringify(coverage),
  );
}
async function collect(context: BrowserContext) {
  for (const page of context.pages()) {
    try {
      await save(await page.evaluate(() => (globalThis as any).__coverage__));
    } catch {
      /* A navigation may already have closed this realm. */
    }
  }
}
export const test = base.extend<{ coverageCollector: void }>({
  coverageCollector: [
    async ({ browser }, use) => {
      if (!enabled) {
        await use();
        return;
      }
      const original = browser.newContext.bind(browser);
      browser.newContext = async (options) => {
        const context = await original(options);
        await context.exposeBinding(
          "__saveTestCoverage",
          async (_source, data) => save(data),
        );
        await context.addInitScript(() =>
          window.addEventListener("beforeunload", () => {
            void (window as any).__saveTestCoverage(
              (window as any).__coverage__,
            );
          }),
        );
        const close = context.close.bind(context);
        context.close = async (options) => {
          await collect(context);
          await close(options);
        };
        return context;
      };
      await use();
      for (const context of browser.contexts()) await collect(context);
      browser.newContext = original;
    },
    { auto: true },
  ],
});
export { expect };
