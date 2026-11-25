# UiTableTest

Use `await ui.table(table).headerSeparator()` to measure the rendered divider
between the table header and the body rows. It returns viewport-relative `x`,
`y`, `width` and `height`. The divider may be a separate element or the bottom
borders of the header cells. The call throws when the mapping or rendered
divider is absent. Measure it again after changing the layout or scrolling.

Use [UiColumnHeaderTest](UiColumnHeaderTest.md) to inspect parts of an
individual header cell.
