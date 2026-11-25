# UiColumnHeaderTest

Use `ui.columnHeaders(table)` to find the column header cells of a rendered
`UiTable`. Pass one of those cells to `await ui.columnHeader(header).parts()`
to resolve its [rendered header parts](UiColumnHeaderTestParts.md).

Find filter buttons and named column resize separators through their accessible
roles within that header.
