# UiColumnHeaderTestParts

The [column header test](UiColumnHeaderTest.md) returns three Playwright locators.

- `caption` identifies the rendered text container for the column caption.
- `sortTarget` identifies the actual keyboard and pointer sort target. It can
  be the header cell or a control inside it.
- `sortIndicator` identifies the rendered sort affordance. Its bounds can
  represent sorting's position when the sort target is the entire cell.

The two sort locators match nothing when the header has no sorting treatment.
