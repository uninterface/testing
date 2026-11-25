# UiTestTarget

Public type from `@uninterface/testing/playwright`.

`Locator | { name: string | RegExp } | { testId: string }`. Names use exact role-based discovery (combobox or checkbox); regular expressions retain Playwright matching semantics. Test IDs and supplied locators must identify the semantic control, not a field wrapper. Ambiguity fails instead of selecting the first match. Verify names and optional IDs in conformance tests.
