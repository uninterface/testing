# Set up Uninterface tests

[Package README](../README.md) · [API reference](api/README.md) ·
[Backend mapping contract](adapter-contract.md)

Add `@uninterface/testing` as a development dependency (`devDependencies`) in
your application or backend test project. Use its imports in test code and test
configuration. Install the dependencies required by your chosen entry point.
For Playwright, install `@playwright/test`. The npm package provides ESM and
TypeScript declarations for the test runner. Follow your Core and backend setup
guides for their requirements.

## Configure Playwright

Start the application server or configure Playwright's `webServer`. Set
`use.baseURL` and install the browser you intend to test with. Resolve the same
backend in the running application and in the Playwright process. This example
uses `@uninterface/backend` as the selected backend's package alias.

In your test directory, create `fixtures.ts`. Choose the native adapter for a
backend with native select and checkbox controls, such as Plain.

```ts
import { test as base } from '@playwright/test'
import {
  createUiTest,
  uiNativeTestAdapter,
  type UiTest,
} from '@uninterface/testing/playwright'

export const test = base.extend<{ ui: UiTest }>({
  ui: async ({ page }, use) => {
    await use(createUiTest(page, uiNativeTestAdapter))
  },
})
```

Import `test` from that fixture in specs. For the README example, serve
`/records/new` with a region identified by the `record-editor` test ID, a
Category field offering the `services` key, a Save record button, and an
output identified by `saved-category` that displays the saved key.

Use the selected backend's adapter when a scenario needs backend-specific
mappings. For a Playwright process running directly on Node.js, the backend
adapter must resolve to JavaScript. Keep adapter selection in test setup so
business specs can run against the same scenarios across backends. See the
[native adapter contract](api/uiNativeTestAdapter.md).

## Set up a mounted fixture

Use [mounted DOM testing](api/dom.md) to inspect or operate rendered controls
in your own DOM test runner. Supply the backend's `./testing/dom` adapter and
a function to settle pending rendering when needed.

Use [fixture builds](api/fixture-build.md) if the test needs to bundle a Vue
fixture with a specific backend. Install Vite, the Vue Vite plugin and
`@uninterface/uninterface` for that entry point. If you run the result in jsdom, the
[jsdom environment helpers](api/jsdom.md) can provide the browser APIs needed
by your fixture. The test creates, mounts and disposes its fixture.

## Verification limits

Playwright helpers use ordinary browser actions and Playwright's actionability
checks. Composite choices use clicks, and native selects use `selectOption`.
Assert business results independently, especially when options share a label.
The [select reference](api/UiSelectTest.md) explains native popup limits and
what selection waits for.

Use browser tests for geometry, animation, and visible focus. Test keyboard
traversal as part of the application's workflow. The harness supplies rendered
targets and interactions, and applications define their own accessibility
checks and acceptance requirements.
