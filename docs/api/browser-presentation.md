# Browser presentation

Use the [rendered presentation mappings](presentation-parts.md) to identify the target before measuring paint. For the border kind, the test should also compare the focused and resting border to establish that focus visibly changes the surface.

Import these helpers from `@uninterface/testing/playwright`. Pass the actual
rendered surface. Use the backend adapter when the semantic control and its
painted surface are different elements.

- `waitForPresentation(surface: Locator): Promise<void>` waits for the
  surface to be visible and for pending or running animations on the
  surface and its ancestors to settle. Choose a surface that comes to rest.
- `expectContainedFocusPaint(paint: FocusPaint): Promise<void>` waits for
  presentation and checks that the specified paint is visible and fits
  within clipping ancestors. Focus the control before calling it.
- `readContainedFocusPaint(element, paint)` performs the inspection in
  the browser. Pass it to `Locator.evaluate` with the paint descriptor
  excluding `target`. It returns `{ fits: true }` on success, or
  `{ fits: false, reason, ...details }` with the reason and any relevant
  diagnostics.

`FocusPaint` contains a `target: Locator` and a `kind` of `outline`,
`inset-shadow`, `underline`, `background`, or `border`. Use `pseudo` for paint on
`::before` or `::after`. Set `inset: true` on an outline to require it to
stay within the target itself. Choose the kind based on what the backend
actually paints in the focused state.
