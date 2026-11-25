# jsdom environment

Use `@uninterface/testing/jsdom` with jsdom 27.4.0. Construct a fresh
`JSDOM` instance per test, configure its window before mounting the fixture,
and close it during cleanup. The helpers apply changes to the supplied window.

- `installDomEnvironment(window)` supplies missing browser APIs for mounted
  DOM tests, including observers and `DataTransfer` backed by jsdom's file
  lists. It replaces jsdom's unimplemented document scroll method.
- `installMenuDomEnvironment(window)` includes the common setup and adds
  visibility and hit-test fallbacks for menu focus tests.
- `installDisabledButtonBlur(window)` opts a test into blurring focused
  buttons when they become disabled.
- `isChecked(control)` reads the checked state of a native or ARIA checkbox.

`withBuiltDomFixture(build, entry, inspect)` bundles the fixture named by a
file URL using the caller's [fixture build function](fixture-build.md) and
production Vue behavior. It
evaluates the bundle in a fresh jsdom window with `installDomEnvironment`,
calls `inspect(exports, window)`, and closes the window when the callback
finishes. The callback owns mounting and disposing any application it uses.

Use real browser tests for geometry, hit targets, animation and visual focus.
