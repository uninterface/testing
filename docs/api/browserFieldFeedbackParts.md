# browserFieldFeedbackParts

Backend mapping helper from `@uninterface/testing/playwright`.
`browserFieldFeedbackParts(editor, invalidSelector)` returns
`Promise<UiFieldFeedbackTestParts>`. The supplied editor must have its
stable rendered ID. The helper locates the field’s error description and
its associated floating tooltip using that identity. Supply the backend
selector for the rendered invalid state. The selected surface must be the
editor or one of its actual ancestors. Test visible paint and accessible
semantics separately.

See [presentation mappings](presentation-parts.md).
