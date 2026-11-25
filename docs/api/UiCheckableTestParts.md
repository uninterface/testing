# UiCheckableTestParts

The `checkable(control)` Playwright mapping takes the actual checkbox, radio
or switch. Import its return type from `@uninterface/testing/playwright`.

- `text: Locator` identifies the visible option text.
- `surface: Locator` identifies the painted checkbox, radio or switch
  indicator, which can contain or be separate from the semantic target.

Use the semantic target for name, state and activation. Use these parts to
measure the label and indicator. See [rendered parts](presentation-parts.md).
