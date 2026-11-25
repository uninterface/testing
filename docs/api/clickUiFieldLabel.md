# clickUiFieldLabel

Public function from `@uninterface/testing/playwright`.

`clickUiFieldLabel(parts: UiFieldTestParts): Promise<void>` clicks the
center of the rendered label through its mapped pointer target. Get the
parts from [ui.field(editor)](UiTest.md#uitest). The helper scrolls the
label into view, waits for its presentation to settle, and uses ordinary
Playwright pointer actionability. Supply a visible label.

```ts
import { clickUiFieldLabel } from '@uninterface/testing/playwright'

const period = ui.radioGroup({ name: 'Period' })
await clickUiFieldLabel(await ui.field(period.control))
await expect(period.option('week')).toBeFocused()
await expect(period.option('week')).toBeChecked()
```

The caller asserts the resulting focus and state. The adapter identifies
the visible label and actual pointer receiver, which can be different
elements when the toolkit's label passes clicks through. See
[UiFieldTestParts](UiFieldTestParts.md).
