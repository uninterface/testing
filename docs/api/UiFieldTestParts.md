# UiFieldTestParts

Public type from `@uninterface/testing/playwright`.

Rendered parts returned by `await test.field(editor)` for an existing semantic editor locator. Resolve again after changing presentation strategies.

- `label: Locator`: the one currently presented associated label, including the deliberately visually hidden label in hidden mode. Exclude inactive native copies.
- `labelTarget: Locator`: the real pointer receiver at the visible label's position. Normally the label itself; for a native label with pointer events disabled, the containing interactive field surface. Keep `label` pointing to the actual painted label. Activation must click at that label's position inside `labelTarget`, with ordinary actionability checks, then assert focus on the semantic editor. A hidden label is not a pointer activation target.
- `surface: Locator`: the editor's visible control surface, excluding feedback. Pass the semantic combobox for a select or the outer control for a segmented editor. The surface may be a native wrapper or the owning input frame in a field with one semantic editor.
- `required.elements: Locator`: explicit required-annotation elements, possibly empty.
- `required.before` and `required.after`: hosts whose respective CSS pseudo-elements can render a required asterisk; inspect computed content to determine whether each marker is present. These locators identify potential hosts even when annotations are off.

Mappings identify actual rendered parts and do not decide whether a presentation passes. The harness checks that label, label target and surface are unambiguous. The test owns expectations for names, marker count/placement, geometry and preserved identity. A missing adapter mapping fails explicitly. This initial mapping covers single editors; group legends and arbitrary composite-editor internals need separate contracts.

Verify mappings with visible, floating and hidden labels where supported, all required-annotation modes, and native transitions. A backend must not return an inactive duplicate, omit an unwanted marker, or create replacement DOM for inspection. Use [clickUiFieldLabel](clickUiFieldLabel.md) to exercise pointer activation through the mapped target. See the [adapter contract](../adapter-contract.md).
