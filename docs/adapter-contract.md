# Component testing adapter contract, version 1

The adapter maps rendered controls to their actual parts. It returns locators or DOM elements and never performs interactions, sets model state, modifies DOM, suppresses failures or supplies alternate acceptance rules. A component's props alone are not evidence of correct rendering.

## Select

Discovery yields the semantic native select or combobox with its field ID. The harness retains that ID across modal accessibility changes, without assuming IDs are stable across page loads. `data-testid`, when supplied by the application, must reach that same semantic target.

A select mapping supplies:

- `kind`: `native` or `composite`, checked against the actual element.
- `trigger`: the real pointer target. It can differ from the semantic input.
- `selection`: the rendered selected label or placeholder, without unrelated widget text.
- `popup()`: the owning popup surface, resolved through the control's `aria-controls` relationship. Teleporting does not change ownership. A native select returns its own element.

Composite candidates retain `role=option`. Each business candidate has `data-uninterface-key` on itself or a contained label node, carrying its exact semantic string key. Status rows have no business key. Native options use their native `value`, `hidden` and `disabled` attributes. Duplicate translated labels must not prevent key-based selection. Annotation must accompany the actual candidate, not a hidden replica.

The existing accessible source announcement `${control.id}-source-status` carries `data-uninterface-source-state`: `idle`, `loading`, `refreshing`, `ready`, or `error`. This describes source state, separately from validation's busy state. These attributes are observation metadata, never CSS styling gates. The shared status assertion also inspects the actual opened popup or native options and rejects enabled status candidates. Native toolkit loading messages remain backend-owned and localized.

A pending source does not disable opening. For composite selects, a visible popup, `aria-expanded=true`, and Playwright actionability determine interaction readiness; source readiness is independent. A missing, ambiguous or obsolete mapping fails visibly. Unsupported virtualized interaction needs an explicit future contract, not silent fallback to global labels or direct model updates.

## DOM select

A backend exports a version 1 `uiDomTestAdapter` from `./testing/dom`. Its
`select(control)` mapping receives the rendered element and returns its
`kind`, a `selection()` lookup, and an optional `popup(owned)` lookup.
The harness resolves `owned` from the control's `aria-controls`. Map it to
the picker surface that contains the options and source feedback when the
toolkit renders those parts outside the referenced element. Keep the mapping
within the control's own popup and resolve parts against the live DOM.

DOM mappings use the same business keys and source announcement as the browser
harness. Native select options use their `value` as their key. Mark the
synthetic native status option with `data-uninterface-select-status` so the
harness can verify its disabled presentation and exclude it from business
candidates. Composite status rows carry no business key. The mapping returns
elements and leaves event dispatch and assertions to the shared harness and test.

## Checkbox

The mapping supplies the real pointer target for an already discovered semantic checkbox. Usually this is the input or ARIA checkbox itself; a native label can be the pointer target when the input has no clickable area. Disabled/checked observations always use the semantic control. The harness checks availability, clicks only when a change is necessary, then observes checked state.

## Field presentation inspection

The optional `field(control)` mapping accepts the semantic editor and returns [UiFieldTestParts](api/UiFieldTestParts.md): its active label, control surface and required-decoration locations. All supplied backends implement it. The shared harness rejects missing mappings and ambiguous labels/surfaces; mappings must not filter out defects to manufacture success.

Map the actual presented label rather than an inactive toolkit copy. In hidden mode, retain the associated visually hidden label. Exclude feedback from the control surface. Required-decoration mappings include every explicit annotation element and all hosts whose before/after pseudo-elements can supply a required asterisk. Presence follows rendered elements and computed content, not props or expected strategy values. Generated-content hosts can remain present while their marker is disabled. Backend-owned marker-position tests must also check native default placement; the portable `yes` request does not mandate a universal prefix or suffix.

The painted `label` and its `labelTarget` pointer receiver are separate parts. Native labels can use `pointer-events: none` while the field beneath them handles the pointer. Map the actual receiving surface in that case; do not replace the painted-label locator or change native CSS to make the label itself hit-testable. A shared label-activation operation clicks at the visible label's position relative to `labelTarget` with normal Playwright hit testing, then verifies the editor receives focus. Clicking an arbitrary point elsewhere in the field does not establish label activation. Unrelated covers must still cause failure; no forced clicks, synthetic events or focus repair are allowed.

Resolve again after strategy changes. Shared tests retain accessible-name, availability, identity, annotation and geometry assertions. Native typography scales and supported presentation adaptations remain explicit contract expectations; a mapping does not select alternative acceptance rules. Wait for native transitions before reading stable geometry or colors. Keep native CSS/class fidelity assertions in backend-owned suites. Group legends and generalized composite editors are outside this initial mapping.

## Modal region inspection

The optional `modal(dialog)` mapping returns [UiModalTestParts](api/UiModalTestParts.md)
for one rendered `UiModal`. Identify the named body region and the actual
region that hosts `#actions` or `#footer`. The body may contain its own
scrolling descendants. The actions locator may be empty when the modal
omits its footer.

Scope both locators to the supplied modal's own regions. Exclude nested
dialogs and footers authored inside the body. Locate the actions region
independently of the text, role or placement of its children so a
misplaced action still fails the caller's assertion.

## Popover panel inspection

The optional `popoverSurface(dialog)` mapping identifies the painted panel
owned by one open `UiPopover`. Map the dialog itself when it paints the panel,
or the owned panel inside it when the dialog is a positioning wrapper. The
locator stays scoped to that instance even when a child popup is teleported.
The harness requires one visible panel. Tests own geometry, hit-testing and
dismissal assertions.

## Table header inspection

`columnHeaderParts(header)` maps the rendered caption and the actual sort
target and indicator for one header. Leave the sort locators empty for a
non-sortable column. Keyboard order and typography expectations belong to
the test.

`tableHeaderSeparator(table)` returns the elements that paint the separator
between that table’s header and body rows. Use `box` for a separate divider or
`bottom-border` for the header cells that paint it. Keep the locator scoped
to the supplied table. The harness measures the rendered bounds in the
viewport.

## Navigation entry discovery

The optional `navigationEntry(scope, { name, kind })` mapping discovers a `UiNavMenu` submenu trigger or href destination, returning a locator for the actual accessible entry. The backend owns native role differences, including differences between root navigation and nested menus. Preserve supplied scope and exact accessible-name matching (or the caller's regular expression), exclude hidden entries and unrelated controls, and retain ambiguity failures. The shared test owns opening, clicking, keyboard actions, navigation/history assertions and retained-state checks. Do not navigate by URL or synthesize activation inside the mapping.

Parents must be opened before acting on descendants. `within()` uses DOM scope; it does not infer ownership of teleported navigation branches. Callers can scope to the owned popup explicitly or use page scope for unique names. Command entries without hrefs and generalized navigation-path traversal are outside this mapping. Missing adapter support fails visibly. All supplied backends implement this discovery.

The mounted DOM harness exposes `navigationEntry(scope, { name, kind })`.
It matches the real entry's rendered `aria-label` in the supplied DOM scope.
An optional `navigationEntries(scope, kind)` adapter mapping supplies the
actual candidate elements for that kind. The default handles native disclosure
buttons and href anchors marked with `data-entry-key`. Supply an override
when the toolkit uses another element as its semantic entry. The harness owns
name matching, scope, hidden-entry filtering and ambiguity checks.

## Command-menu entry discovery

`ui.menu(surface).entry({ key })` uses the rendered `role="menu"` surface in
either runner. Place `data-entry-key` with the exact authored key on the actual
`menuitem`, `menuitemcheckbox`, or `menuitemradio`. The shared harness resolves
the entry in its own surface through this metadata. Keep the actual role,
accessible name, disabled state and checked state available for test assertions.

The optional Playwright `menuPopup(menu)` mapping receives the accessible
menu locator and returns that open menu's visible floating box. Map the menu
itself when it owns the visible bounds, or the containing popup surface when
the toolkit provides one. Keep the mapping scoped to that menu even when a
submenu is teleported. An inline root has no popup. The harness requires one
match and leaves viewport, focus and interaction assertions to the caller.

## Browser test step exceptions

A browser test can opt in to a known, accepted exception by querying
`ui.stepSkipReason()` for a specific step ID and supplying the browser name
and viewport width. The optional adapter hook returns a reason only for the
matching step and conditions. Without a reason, the step runs normally.
The caller records the reason on the skipped step. Required capability
checks must run for every backend that declares the capability.

## File input presentation

The selected backend's testing entry can export `browserControlParts` using
[BrowserControlParts](api/BrowserControlParts.md). Its file input mappings
identify the chooser, displayed filename, Clear action, frame, and keyboard
focus paint on the rendered component. The shared suite owns the file
selection, keyboard actions, geometry and focus expectations. It can mount the
same [file input fixture](api/fixture-build.md#file-input-fixture) with every
backend.

## Rendered presentation parts

[Presentation mappings](api/presentation-parts.md) cover owned field, card,
table, feedback, progress, upload, temporal and menu parts. Scope each part to
its instance. For teleported feedback, use the originating field’s identity
and map its own popup. Resolve alternate native parts against the rendered
state. A missing optional region must be observable as an empty locator or a
null DOM part. Keep backend-specific fidelity checks in the owning backend
suite.

## Backend-owned tests

Backends may add toolkit fidelity, native composition and upgrade regressions. These complement shared conformance and application tests. They must not replace shared requirements or turn a failed required capability into a skip.

Backend package metadata declares additional test files by runner:

```json
{
  "uninterface": {
    "testing": {
      "dom": ["testing/menu-dom.test.mjs"],
      "browser": ["testing/presentation.spec.ts"]
    }
  }
}
```

Paths must stay within the backend package and refer to existing files. Missing declarations mean an empty additional suite.

A compatible orchestrator loads the selected backend’s `testing.browser` files alongside shared browser acceptance. It must not load other backends’ cases and report them as skipped. `testing.dom` files run through a separate Node/DOM environment. Discover paths from metadata rather than hardcoding backend-name branches. Suite selection must not rewrite the application’s backend configuration.

Declaring files does not configure Playwright, start a server or supply DOM/build utilities. The runner must supply those prerequisites and document its commands, discovery and report locations. Backend authors may also provide their own configuration and native-reference checks without changing this mapping contract.

The supplied backend suites currently depend on external development build/DOM utilities and shared fixtures. They are backend-owned but not self-contained package tests; extraction requires those support utilities or equivalent configuration. Consumer tests using this harness are independent of those suites.
