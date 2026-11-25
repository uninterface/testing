# UiTestAdapter

See [rendered presentation parts](presentation-parts.md) for optional mappings for fields, checkables, input frames, button focus, cards, tables, feedback, progress, upload, temporal pickers and menu icons.

Public type from `@uninterface/testing/playwright`.

Versioned backend mapping with `version: 1`, `select(control: Locator): UiSelectTestParts`, and `checkbox(control: Locator): Locator`. Mappings identify parts without acting or rewriting assertions. See the [mapping contract](../adapter-contract.md). Verify ownership, pointer actionability and state against real rendered views, including teleports.

Optional `field(control: Locator): Promise<UiFieldTestParts>` maps one field editor's painted label, label pointer target, surface and required decorations. The supplying backends implement it; other adapters may omit it if field inspection is not used. Calling field inspection without a mapping throws. See [UiFieldTestParts](UiFieldTestParts.md).

Optional `modal(dialog: Locator): UiModalTestParts` maps one rendered
`UiModal` to its own body and optional actions region. Calling modal
inspection without a mapping throws. See [UiModalTestParts](UiModalTestParts.md).

Optional `popoverSurface(dialog: Locator): Locator` maps one open
`UiPopover` dialog to its painted panel. See [UiPopoverTest](UiPopoverTest.md).

Optional `navigationEntry(scope: Page | Locator, target: { name: string | RegExp; kind: 'submenu' | 'destination' }): Locator` maps named `UiNavMenu` submenu triggers and href destinations. It must retain the supplied scope and exact-name semantics and target actual entry elements, excluding unrelated buttons/links. Native roles may differ between roots and nested popups. The harness throws when this mapping is absent. Mapping must not click, expand menus, navigate directly or change acceptance assertions. See [UiTest](UiTest.md) for scope and teleport limits.

Optional `columnHeaderParts(header: Locator)` maps the caption, sort target and
indicator. Optional `tableHeaderSeparator(table: Locator)` maps the divider
elements and how they paint. See [table header inspection](UiTableTest.md).

Optional `columnHeaders(table: Locator): Locator` maps the rendered column headers of the supplied table. Keep the mapping scoped to that table's own header. The harness uses `table.getByRole('columnheader')` by default. Verify the mapped elements' accessibility roles separately if the mapping bypasses Playwright role inference.

Optional `choice(group, key, kind)` resolves `{ control, target }` for one radio or checkbox option. The control is the semantic state/keyboard target; target receives real pointer clicks. Mapping belongs to the backend; missing mappings fail explicitly. It must not select by duplicated labels, change model state or repair focus.

Optional `multiSelect(control)` asynchronously returns UiMultiSelectTestParts, mapping the picker and explicit clear action. The shared harness owns multiple-selection operations.

Optional `stepSkipReason(step, { browserName, viewportWidth })` returns a nonempty reason for an accepted exception to a named browser test step. Return `undefined` for other step IDs and environments. The test owns the step ID and must explicitly opt in by querying it. See the [adapter contract](../adapter-contract.md#browser-test-step-exceptions).
