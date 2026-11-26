import assert from 'node:assert/strict'
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
assert.equal(typeof buildFixture, 'function')
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
