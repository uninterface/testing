# UiCheckboxTest

Public type from `@uninterface/testing/playwright`.

Exposes `control: Locator` and `setChecked(checked: boolean): Promise<void>`. The latter asserts enabled state, clicks the mapped pointer surface only if needed, and waits for semantic checked state. Backends must reflect native/ARIA checked and disabled states correctly. Verify idempotence, disabled behavior and covered-target failure.

When setChecked starts from mixed state it first resolves the checkbox through ordinary activation, then toggles again if needed to reach false. It never sets the model or indeterminate property directly.
