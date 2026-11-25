# UiChoiceGroupTest

Import this interface from `@uninterface/testing/playwright`. Returned by UiTest.radioGroup and UiTest.checkboxGroup.

```ts
interface UiChoiceGroupTest {
  readonly control: Locator
  option(key: string): Locator
  choose(key: string): Promise<void>
  setChecked(key: string, checked: boolean): Promise<void>
}
```

The control is the group surface. option resolves one semantic input by stable key through the backend mapping. choose clicks an enabled radio and verifies checked state; setChecked toggles an enabled checkbox only as needed and verifies the result. Wrong operation/group combinations fail. It neither removes retained values nor alters business state directly. Duplicate labels and arbitrary key strings must remain unambiguous. Pointer actionability is preserved; the driver never forces a covered target.

Verify option mapping against actual rendering for each backend, then use option(key) for keyboard and disabled-state assertions. Retained missing values have no selectable option; inspect the group's visible retained text instead.
