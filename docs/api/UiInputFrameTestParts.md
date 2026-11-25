# UiInputFrameTestParts

Use `ui.inputFrame(frame)` from the Playwright driver to find the painted
compound frame. Pass the instance that owns the editors and their supporting
content. The result has one `surface: Locator` for the actual painted frame.
The caller checks geometry, focus and interaction independently.

Import the return type from `@uninterface/testing/playwright`.
[Rendered parts](presentation-parts.md)
