# uiNativeTestAdapter

Public constant from `@uninterface/testing/playwright`.

Reusable version-1 adapter for native select and checkbox presentation. The select itself is the trigger; `option:checked` supplies displayed selection. Native choose uses Playwright `selectOption`, not a model setter. Use only with native select backends; mismatched interaction models fail. Verify selected value and visible-label semantics separately from OS popup geometry.

Its optional field mapping uses the editor as its surface and its associated HTML label. It maps label before/after pseudo-elements as possible required-asterisk hosts and no explicit marker elements. Backends with explicit markers or duplicate labels must override that mapping.

Its navigation mapping identifies named submenu buttons and href links marked as actual navigation entries. Backends using native menuitem roles override it. Discovery retains scope, visible-entry filtering and Playwright strictness; callers open parent menus and assert the resulting navigation.

Its choice mapping resolves marked option rows by stable key, then finds the semantic radio/checkbox. Native inputs are their own pointer targets; adapters with hidden native inputs override the target mapping.
