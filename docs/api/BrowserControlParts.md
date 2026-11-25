# BrowserControlParts

Import this type from `@uninterface/testing/playwright` when supplying
backend-specific locators for these presentation checks. The mapping returns
Playwright locators. The test performs interaction and checks outcomes.

- `collapsibleTrigger(scope, name)` locates a disclosure trigger by name within
  the supplied page or locator.
- `temporalMode(trigger, value, label)` locates the native control or menu option
  for the `start` or `bounded` temporal mode. The test can select the value on the
  native control or open the popup before clicking its option.
- `fileInputName(root)` locates the native file input, whose selected file names
  are available through `files`, or the text that displays the selected name.
- `fileInput(root, clearName)` locates the native `chooser`, the painted `frame`,
  the `focusedFrame` while it reflects focus within, and the named `clear`
  button. `clearFocus` describes the actual keyboard focus paint shown when
  Clear has focus. Pass it to [expectContainedFocusPaint](browser-presentation.md).
  The shared test verifies focus, frame geometry and clearing through normal
  keyboard interaction.

Verify that each locator identifies the active rendered part in its scope.
