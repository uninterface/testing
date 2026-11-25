# UiPopoverTest

Use `ui.popover(dialog).surface()` after opening a `UiPopover`. Find the
dialog by its accessible name or a test ID.

```ts
const dialog = page.getByRole('dialog', { name: 'Filters', exact: true })
const panel = await ui.popover(dialog).surface()
```

`surface(): Promise<Locator>` returns the one visible panel for that popover.
The panel is the rendered box that paints the popover and contains its content.
It can be the dialog element itself or a panel inside it. Use the returned
locator to measure the panel or check overlap. Tests supply their own pointer
actions and dismissal assertions.
