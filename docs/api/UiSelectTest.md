# UiSelectTest

Public type from `@uninterface/testing/playwright`.

The select harness exposes the semantic `control: Locator` and these asynchronous methods:

| Method | Guarantee |
|---|---|
| `isNative()` | Reports the verified interaction model |
| `open()` | Opens a composite picker with a normal click; waits for expanded state and visible owned popup; rejects native popup inspection |
| `popupSurface()` | Returns the one visible, owned popup surface of an already open composite picker. Rejects native popup inspection. |
| `candidates()` | Returns owned rendered options; opens composite pickers; native options are DOM observations |
| `choose({ key })` | Uses exact semantic key, checks availability, performs a real interaction and checks resulting displayed label |
| `expectLabel(label)` | Waits for displayed selected/placeholder text |
| `expectSourceState(state)` | Waits for source-state annotation; loading/refreshing additionally requires semantic busy state |
| `expectLoading(label?)` | Checks pending state, busy semantics and actual popup/option status; optionally verifies retained label |
| `expectStatus(message, label, inspectPopup = true)` | Checks the associated announcement, retained label and status presentation; false permits a closed lazy composite popup |
| `expectPlaceholderHidden(label)` | Checks hidden native placeholder or absence from composite candidates |

Backend mappings own target, selection and popup resolution. Toolkit loading text is read from its announcement, not imposed by shared code. The harness does not wait for unrelated operations or animations. Native `candidates()` does not inspect an OS popup. Verify saved business data independently: duplicate labels cannot prove stored-key correctness from label assertions alone.
