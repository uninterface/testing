# UiMultiSelectTest

Import from `@uninterface/testing/playwright`.

Returned by `uiTest.multiSelect(target)`. Exposes `control`, `open()`, `candidates()`, `setSelected(key, selected)`, `expectSelected(key, selected = true)` and `clear()`. Native multiple listboxes need no popup opening. Composite pickers use backend-mapped triggers and candidates. Clear may retain locked selections. Actions check enabled state and use normal clicks or native selectOption; they never force interaction or set application model state. Verify empty/special keys, disabled values and retained memberships.

`close()` dismisses a composite popup with Escape and is a no-op for a native listbox. setSelected(), expectSelected() and clear() leave the popup closed, so subsequent actions are not blocked by an owned popup. open()/candidates() deliberately leave it open for inspection. Shared operations remain backend-independent; adapters only identify parts.
