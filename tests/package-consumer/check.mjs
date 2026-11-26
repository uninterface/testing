import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import {
  createUiDomTest,
  uiNativeDomTestAdapter,
} from '@uninterface/testing/dom'
import { buildFixture } from '@uninterface/testing/fixture-build'
import {
  createUiTest,
  uiNativeTestAdapter,
} from '@uninterface/testing/playwright'

assert.equal(typeof createUiTest, 'function')
assert.equal(typeof uiNativeTestAdapter.select, 'function')
await import('@uninterface/backend/testing')
await import('@uninterface/backend/testing/dom')

const { window } = new JSDOM(
  '<select><option value="supplies">Supplies</option><option value="services">Services</option></select>',
)
try {
  const control = window.document.querySelector('select')
  const select = createUiDomTest(uiNativeDomTestAdapter).select(control)
  await select.choose({ key: 'services' })
  assert.equal(control.value, 'services')
  assert.equal(
    typeof (await import('@uninterface/testing/jsdom')).installDomEnvironment,
    'function',
  )
  assert.equal(
    typeof (await import('@uninterface/testing/fixtures/locale-dom'))
      .verifyNativeLocale,
    'function',
  )
} finally {
  window.close()
}

const entry = new URL('fixture.mjs', import.meta.url)
await writeFile(
  entry,
  `
export { mountCollectionFixture } from '@uninterface/testing/fixtures/collection'
export { mountFileInputFixture } from '@uninterface/testing/fixtures/file-input'
export { mountReferenceFixture } from '@uninterface/testing/fixtures/reference'
`,
)
const result = await buildFixture(
  {
    logLevel: 'error',
    build: {
      write: false,
      lib: { entry: fileURLToPath(entry), formats: ['es'] },
    },
  },
  {
    resolveBackend: (subpath) =>
      import.meta.resolve(
        subpath ? `@uninterface/backend/${subpath}` : '@uninterface/backend',
      ),
  },
)
const output = (Array.isArray(result) ? result : [result]).flatMap(
  (bundle) => bundle.output,
)
assert.ok(
  output.some(
    (file) => file.type === 'asset' && file.fileName.endsWith('.css'),
  ),
  'Compiled fixtures retain their CSS',
)
