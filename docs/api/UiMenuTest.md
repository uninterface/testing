# Command-menu lookup

`ui.menu(surface).entry({ key })` locates a command, checkbox item, radio item,
or submenu trigger by the exact key supplied to the entry control. Disabled
entries are available for inspection.

Open a popup before looking for its entries. Pass the rendered menu surface,
including a separate surface for a submenu. Groups belong to their parent
menu. Each lookup excludes entries owned by another menu, including nested
surfaces. The test supplies the action and expected outcome.

## Playwright

`UiMenuTest.entry({ key: string }): Locator` returns a Playwright locator
for the accessible entry. An absent entry matches nothing. Actions retain
Playwright's strictness when a key matches more than one entry.

```ts
const commands = page.getByRole('menu', { name: 'Record commands' })
const email = ui.menu(commands).entry({ key: 'email' })
await email.click()
await expect(email).toBeChecked()
```

`UiMenuTest.popup(): Promise<Locator>` returns the visible floating box for
one open command menu. Pass the rendered menu by role and accessible name.
The returned locator may identify the menu itself or its enclosing popup
container. Use it to measure the popup's viewport bounds, and call it for each
open submenu whose bounds you need. It requires a backend popup mapping and
fails if the mapping does not resolve exactly one box. Inline root menus have
no floating box. `entry()` also works on inline menus.

## Mounted DOM

`UiDomMenuTest.entry({ key: string }): HTMLElement | null` returns the current
entry element or `null` when absent. Duplicate matches throw. The fixture
supplies the rendered `role="menu"` element and settles updates after actions.

```js
const commands = ui.menu(surface)
const email = commands.entry({ key: 'email' })
assert.ok(email)
email.click()
await fixture.flush()
assert.equal(commands.entry({ key: 'email' }).getAttribute('aria-checked'), 'true')
```

Both runners use the same [rendered entry metadata](../adapter-contract.md#command-menu-entry-discovery).
