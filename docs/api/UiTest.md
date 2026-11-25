# UiTest

Public type from `@uninterface/testing/playwright`.

The harness exposes `within(scope: Locator): UiTest`, `select(target: UiTestTarget): UiSelectTest` and `checkbox(target: UiTestTarget): UiCheckboxTest`. Scope applies to initial discovery; popup ownership survives teleporting. The backend must identify actual parts. Verify that operating one repeated editor leaves the other unchanged.

`field(control: Locator): Promise<UiFieldTestParts>` resolves presentation parts for an existing semantic editor. Call again after changing label strategies. The backend supplies locations; the caller supplies assertions. See [UiFieldTestParts](UiFieldTestParts.md).

`modal(dialog: Locator): Promise<UiModalTestParts>` resolves the body and
actions region of one rendered `UiModal`. Find the dialog by its accessible
name or a test ID. Assert the actions you expect to render in the returned
region. See [UiModalTestParts](UiModalTestParts.md).

`popover(dialog: Locator): UiPopoverTest` exposes the visible panel surface of
an open `UiPopover`. See [UiPopoverTest](UiPopoverTest.md).

`menu(surface: Locator): UiMenuTest` scopes command entry and popup lookup to
an already rendered `UiMenu` surface. See [UiMenuTest](UiMenuTest.md).

`navigationEntry({ name, kind }): Locator` discovers a `UiNavMenu` submenu trigger (`kind: 'submenu'`) or href destination (`kind: 'destination'`) by exact accessible name (or regular expression). Backend mappings own native roles and element targeting; tests use normal Playwright click, keyboard and state assertions. The entry must be rendered before acting: open its parents first. Discovery includes visible entries only and fails on ambiguity through Playwright's normal strictness.

`within()` limits navigation discovery to DOM descendants. It does not follow teleported navigation branches automatically; use the owning popup locator as a separate scope, or page scope when names are unique. This locator API does not implement a navigation-path engine, command entries without hrefs, or menu keyboard policy. Verify routing/history and retained business state separately from locating an entry.

`columnHeaders(table: Locator): Locator` locates the column headers of an existing table, which callers can first discover by role and accessible name. The default uses Playwright's `columnheader` role query. A backend adapter can map native header elements when role inference differs from browser accessibility semantics. Verify roles independently when using that mapping.

`columnHeader(header: Locator): UiColumnHeaderTest` exposes the rendered
caption and sorting parts of one header. `table(table: Locator): UiTableTest`
measures the rendered header separator. See [table header inspection](UiTableTest.md).

`radioGroup(target)` and `checkboxGroup(target)` return [UiChoiceGroupTest](UiChoiceGroupTest.md). Targets identify the group by accessible name, test ID or locator; options use semantic keys.

`multiSelect(target): UiMultiSelectTest` discovers a native listbox or composite combobox and provides membership operations through backend mappings.

`stepSkipReason(step, { browserName, viewportWidth })` looks up an accepted exception for a named browser test step. It returns `undefined` when the adapter omits the hook or the exception does not apply. The caller can mark the step as skipped and include the reason in the report. See [UiTestAdapter](UiTestAdapter.md).
