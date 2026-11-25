# UiModalTestParts

Public type from `@uninterface/testing/playwright`. Use it through
`await ui.modal(dialog)` after opening a `UiModal`.

- `body: Locator` identifies the modal’s named body region. In content-scroll
  mode, a descendant can own scrolling inside that region.
- `actions: Locator` identifies the region hosting either the `actions` slot
  or the custom `footer` slot. The locator matches zero elements when the
  modal has no footer.

```ts
const dialog = page.getByRole('dialog', { name: 'Edit record', exact: true })
const { body, actions } = await ui.modal(dialog)
await body.getByRole('textbox', { name: 'Name', exact: true }).fill('New name')
await actions.getByRole('button', { name: 'Save record', exact: true }).click()
await expect(page.getByTestId('saved-name')).toHaveText('New name')
```

The harness checks that the dialog and body each resolve once and that the
actions region resolves at most once. Locators stay live as the view updates.
The test owns assertions about slot content, form association, scrolling,
focus, and business outcomes. See the [modal mapping contract](../adapter-contract.md#modal-region-inspection).
