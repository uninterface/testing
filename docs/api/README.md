# Testing API

## Playwright

- [createUiTest](createUiTest.md) — function.
- [clickUiFieldLabel](clickUiFieldLabel.md) — function.
- [Rendered presentation parts](presentation-parts.md) — cards, fields, tables, feedback, progress, uploads, temporal pickers and menu icons.
- [Browser presentation helpers](browser-presentation.md) — animation settling and visible focus paint.
- [UiTest](UiTest.md) — type.
- [UiTestTarget](UiTestTarget.md) — type.
- [UiTestAdapter](UiTestAdapter.md) — type.
- [BrowserControlParts](BrowserControlParts.md) — type for rendered disclosure, temporal mode and file name parts.
- [UiFieldTestParts](UiFieldTestParts.md) — type.
- [UiCardTestParts](UiCardTestParts.md)
- [UiFieldGroupTestParts](UiFieldGroupTestParts.md)
- [UiCheckableTestParts](UiCheckableTestParts.md)
- [UiInputFrameTestParts](UiInputFrameTestParts.md)
- [UiFieldFeedbackTestParts](UiFieldFeedbackTestParts.md)
- [UiTableBodyTestParts](UiTableBodyTestParts.md)
- [UiFeedbackItemTestParts](UiFeedbackItemTestParts.md)
- [UiProgressBarTestParts](UiProgressBarTestParts.md)
- [UiUploadRegionTestParts](UiUploadRegionTestParts.md)
- [UiTemporalPickerTestParts](UiTemporalPickerTestParts.md)
- [UiMenuEntryIconTestParts](UiMenuEntryIconTestParts.md)
- [browserFieldFeedbackParts](browserFieldFeedbackParts.md)
- [UiModalTestParts](UiModalTestParts.md) — type.
- [UiTableTest](UiTableTest.md) — type for measuring the table header separator.
- [UiColumnHeaderTest](UiColumnHeaderTest.md) — type for Playwright column header inspection.
- [UiColumnHeaderTestParts](UiColumnHeaderTestParts.md) — type for rendered column header parts.
- [UiPopoverTest](UiPopoverTest.md) — type for Playwright popover panel lookup.
- [UiMenuTest](UiMenuTest.md) — type for Playwright command-menu entry and popup lookup.
- [UiSelectTestParts](UiSelectTestParts.md) — type.
- [UiSelectSourceState](UiSelectSourceState.md) — type.
- [UiCheckboxTest](UiCheckboxTest.md) — type.
- [uiNativeTestAdapter](uiNativeTestAdapter.md) — constant.
- [UiSelectTest](UiSelectTest.md) — type.

- [UiChoiceGroupTest](UiChoiceGroupTest.md) — type.

- [UiMultiSelectTestParts](UiMultiSelectTestParts.md)

- [UiMultiSelectTest](UiMultiSelectTest.md)

## DOM

- [DOM select harness](dom.md) covers `createUiDomTest`, `uiNativeDomTestAdapter`, and their types from `@uninterface/testing/dom`.
- [UiDomMenuTest](UiMenuTest.md#mounted-dom) covers command-menu entry lookup from `@uninterface/testing/dom`.

## Fixture setup

- [Fixture builds](fixture-build.md) covers `fixtureBuildConfig`, `buildFixture`, and `createBrowserFixture` from `@uninterface/testing/fixture-build`.
- [Collection fixture](fixture-build.md#collection-fixture) covers `mountCollectionFixture` from `@uninterface/testing/fixtures/collection`.
- [Native locale fixture](fixture-build.md#native-locale-fixture) covers shared setup for translator isolation and hydration checks.
- [Native reference fixture](fixture-build.md#native-reference-fixture) covers the side-by-side comparison host and browser checks.
- [jsdom environment](jsdom.md) covers the optional browser API shims from `@uninterface/testing/jsdom`.
