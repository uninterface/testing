# UiUploadRegionTestParts

Returned asynchronously by `ui.uploadRegion(region)`. **surface** locates
the rendered region. **chooser** finds the actual chooser action.
**chooserFocus** describes its rendered focus paint using [FocusPaint](browser-presentation.md).
Resolve again when ready changes to recovery, since a different surface or
button can paint the indication. Test normal keyboard activation and focus
before inspecting paint.

See [presentation mappings](presentation-parts.md).
