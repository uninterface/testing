# Uninterface testing

`@uninterface/testing` helps application authors and backend implementers test
rendered Uninterface components. Tests identify controls by their meaning, such
as a field name or a business key. The backend adapter maps those requests to
the rendered controls. Your application supplies the page, test data, and
expected outcome.

For example, a Playwright test can choose a category by its key and verify the
value the application saves. Set up the shared `test` fixture first using the
[setup guide](docs/setup.md).

```ts
import { expect } from '@playwright/test'
import { test } from './fixtures'

test('save the selected category', async ({ page, ui }) => {
  await page.goto('/records/new')
  const editor = ui.within(page.getByTestId('record-editor'))
  await editor.select({ name: 'Category' }).choose({ key: 'services' })
  await page.getByRole('button', { name: 'Save record' }).click()
  await expect(page.getByTestId('saved-category')).toHaveText('services')
})
```

See the [API reference](docs/api/README.md) and
[backend mapping contract](docs/adapter-contract.md) for details.
See [package release](docs/package-release.md) for the build and publish checks.

## License

Uninterface source is available under the [MIT License](LICENSE).
