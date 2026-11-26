# Fixture builds

`@uninterface/testing/fixture-build` assembles Vue/Vite fixtures for an
explicitly supplied backend. Install Vite `^7.3.7 || ~8.1.6 || ~8.2.4 || ^8.3.3`,
`@vitejs/plugin-vue` `^6.0.0`, and `@uninterface/uninterface` in the environment
running the build. Use a Vue plugin release with a Vite peer that includes your
Vite version. The `6.0.10` plugin supports Vite 7 and 8.

`fixtureBuildConfig(backend)` returns an inline Vite config with Vue, the core
icon loader, and resolution of `@uninterface/backend` to the supplied backend.
`buildFixture(options, backend)` merges that config with the supplied Vite
options and returns Vite's build result. It propagates Vite errors.

Supply `resolveBackend(subpath)` to resolve the backend's own exports. An
empty subpath means the package root. The callback must return an absolute
filesystem path or file URL. Supply `backendVite` when that backend needs its
Vite hook. Use absolute fixture paths derived from the test module to run from
different working directories.

```js
import { fileURLToPath } from 'node:url'
import { buildFixture } from '@uninterface/testing/fixture-build'

const backend = {
  resolveBackend: (subpath) =>
    import.meta.resolve(
      subpath ? `@example/adapter/${subpath}` : '@example/adapter',
    ),
}

await buildFixture(
  {
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(new URL('./fixture.ts', import.meta.url)),
        name: 'Fixture',
        formats: ['iife'],
      },
    },
  },
  backend,
)
```

Replace the example package name with the backend installed for the test.
Verify the rendered fixture uses the intended backend's styles and controls.

For a Playwright test, `createBrowserFixture(build, entryUrl)` returns an
async function that opens a page from an in-memory fixture bundle. Pass a
bound fixture build function and a file URL to the fixture entry. The entry
mounts its own application and can import backend and application styles.
The helper serves the bundled script and stylesheet through Playwright routes
and reuses the bundle when opening pages in the same worker. It verifies that
the opened document uses standards mode for layout.

Call the returned function with a Playwright page and, optionally, a record
of string query parameters. The fixture can read them from `location.search`
to select a scenario before mounting. Each opening uses the same bundle.

## File input fixture

`mountFileInputFixture(options?: { disabled?: boolean }): Promise<void>` from
`@uninterface/testing/fixtures/file-input` mounts one **Attachment** field and
its file input in an English application. Call it from a browser fixture
entry that imports core and selected backend styles, then open it with
`createBrowserFixture`. The test scopes the backend’s `fileInput` and
`fileInputName` mappings to `[data-file-input-fixture]`, supplies the test file,
viewport and direction, and performs the keyboard actions itself. Pass
`disabled: true` to mount a disabled field editor. See
[BrowserControlParts](BrowserControlParts.md).

## Collection fixture

`mountCollectionFixture(): Promise<void>` from
`@uninterface/testing/fixtures/collection` mounts a small in-memory order
collection. It renders a sortable table, an Amount range filter, and a
**Show cards** action. The card presentation keeps the same query and offers
sort and filter panels that adapt to the viewport.

Call it from a browser fixture entry built with `createBrowserFixture`.
The entry imports core and the selected backend's styles, and the test
supplies a viewport and optional `dir` (`ltr` or `rtl`) and `theme`
(`light` or `dark`) query parameters. The backend must support document
color mode. This fixture entry point also requires Vue.

## Native locale fixture

Use `createLocaleFixture(useNativeMessage)` from
`@uninterface/testing/fixtures/locale` in a backend-owned fixture entry.
The supplied function runs inside the mounted application's Vue setup and
returns a function that reads one translated native message. Export the
returned `mountLocale` and `renderLocale` functions from the fixture entry.

`verifyNativeLocale(build, entryUrl, traditionalLocale)` from
`@uninterface/testing/fixtures/locale-dom` verifies concurrent server
rendering, hydration, locale switching, and isolation across two apps.
Supply the backend's fixture builder and its expected native alias for
`zh-Hant`. The assertion helper uses Node.js and jsdom.

## Native reference fixture

`mountReferenceFixture(native)` from
`@uninterface/testing/fixtures/reference` renders the supplied Vue reference
beside a shared Uninterface composition. Both receive the same invalid,
loading, disabled, and source-state switches. Import the selected backend
and core styles in the fixture entry.

`testReferenceFixture(openFixture, adapter, options)` from
`@uninterface/testing/fixtures/reference-playwright` registers portable
Playwright checks and captures comparison screenshots. Supply the
backend's adapter, collapsible trigger locator, and whether it provides a
native modal. Backends can opt in to the nested navigation check and supply
a callback that verifies their own native loading artwork.
Supply `openNativeModalFixture(page)` when the upstream modal needs its own
document styling. The typography comparison opens that fixture in a separate
page in the same browser context and measures the adapter title in the ordinary
comparison fixture.
