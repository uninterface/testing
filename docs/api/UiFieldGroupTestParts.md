# UiFieldGroupTestParts

Returned by `ui.fieldGroup(group)`. **label** identifies the actual group
title or legend, including an associated visually hidden title. **controlArea**
is the rendered region containing the group’s editors. It may be the group
itself where the editors have no additional shared wrapper. Inspect each
editor’s own label through `field()`.

The Playwright mapping includes `required.elements` for explicit required
markers and `required.before` and `required.after` for elements that paint
generated markers. Inspect the rendered content of those pseudo-elements to
count visible markers. Mounted DOM mappings expose the label and control area.

See [presentation mappings](presentation-parts.md).
