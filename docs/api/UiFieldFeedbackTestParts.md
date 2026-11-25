# UiFieldFeedbackTestParts

Returned asynchronously by `ui.fieldFeedback(editor)`. **message** locates
the associated error description, which may be hidden when feedback is a
tooltip. **tooltip** locates the rendered floating error for that field even
when teleported. **invalidSurface** locates the rendered editor or ancestor
carrying invalid presentation. An absent part yields an empty locator.
Check the editor’s actual accessible association separately.

See [presentation mappings](presentation-parts.md).
