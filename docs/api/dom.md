# Mounted DOM testing

Use [rendered presentation parts](presentation-parts.md) to inspect mounted field, card, table, temporal and menu presentation, or card regions in parsed server HTML.

Use `@uninterface/testing/dom` with your own mounted fixture and DOM environment. The adapter identifies the rendered parts. The test supplies the business key, expected text, and expected outcome.

Use [`ui.menu(surface)`](UiMenuTest.md#mounted-dom) to inspect command-menu
entries by key.

## Navigation

`ui.navigationEntry(scope, { name, kind })` returns a rendered
`HTMLElement` or `null`. Set `kind` to `'submenu'` for a branch trigger or
`'destination'` for an href destination. `name` is the rendered
`aria-label` as an exact string or a regular expression. The lookup ignores
hidden entries and throws when more than one entry matches.

```js
const trigger = ui.navigationEntry(mainNavigation, {
  name: 'Examples',
  kind: 'submenu',
})
assert.ok(trigger)
trigger.click()
await fixture.flush()

const popup = trigger.ownerDocument.getElementById(
  trigger.getAttribute('aria-controls'),
)
assert.ok(popup)
const menus = ui.navigationEntry(popup, { name: 'Menus', kind: 'destination' })
assert.equal(menus?.getAttribute('aria-current'), 'page')
```

Pass the popup as a separate scope when it is teleported. The fixture and test
own actions and assertions. Use [Playwright navigation helpers](UiTest.md) to
test browser actionability and keyboard behavior.

## Select

```js
import { createUiDomTest } from '@uninterface/testing/dom'
import { uiDomTestAdapter } from '@uninterface/backend/testing/dom'

const ui = createUiDomTest(uiDomTestAdapter, { settle: fixture.flush })
const category = ui.select(fixture.host.querySelector('[data-testid="category"]'))
await category.choose({ key: 'services' })
category.expectLabel('Services')
assert.equal(fixture.category(), 'services')
```

The example assumes a mounted fixture, a flush function, and `assert` from `node:assert/strict`. Configure the backend adapter once in test setup. Pass the native select or semantic combobox element to `ui.select(control)`.

| Member | Behavior |
| --- | --- |
| `control` | The supplied semantic target. |
| `isNative()` | Reports whether the rendered target is a native select. |
| `open()` | Sends ArrowDown to a closed composite picker and checks expansion and popup ownership. For a native select, its options are already available to inspect. |
| `popup()` | Returns the owned composite surface when it is mounted, or the native select element. |
| `sourceStatus()` | Returns the control's source announcement. |
| `candidates()` | Returns rendered business options, including disabled choices. Open a composite picker first. |
| `candidateKey(option)` | Reads the exact business key from a rendered choice. |
| `choose({ key })` | Opens the picker if needed, finds a unique enabled choice by key, and dispatches the DOM interaction. Assert the resulting label or business value in the test. |
| `displayedLabel()` and `expectLabel(label)` | Read or assert the rendered selected label or placeholder. |
| `expectSourceState(state)` | Checks the announced source state. Pending states must also expose `aria-busy`. |
| `expectLoading(label?)` | Checks pending state and its announcement. Pass a label to check that it stays displayed. |
| `expectStatus(message, label)` | Checks the associated source announcement and displayed label. For an open composite picker or a native select it also checks that the picker presents the message and offers no selectable status rows. |

For a successful empty result, open the picker and assert `expectSourceState('ready')` and zero `candidates()`. This distinguishes an empty result from loading and source failure. Open a composite picker before checking loading or error if the test needs to cover the popup presentation. A closed composite can still announce its source state.

The choice and label operations also work with `UiPaginatorSizeSelect`.
Pass the page size as a string key, such as `{ key: '20' }`. Source assertions
apply to controls that render a source announcement.

`createUiDomTest(adapter, { settle })` returns a `UiDomTest` that produces `UiDomSelectTest` objects. Supply a `settle` callback when the fixture needs to flush rendering after an interaction. Observations are synchronous. `UiDomTestAdapter` and `UiDomSelectTestParts` describe backend mappings. Use `uiNativeDomTestAdapter` for native selects that follow the [rendered metadata contract](../adapter-contract.md#dom-select).

Use a browser test for hit testing, placement, keyboard behavior in the browser, and the appearance of a native popup. The DOM harness dispatches synthetic events and observes the resulting DOM.
