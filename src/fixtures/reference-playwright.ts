import { test, expect, type Page } from '@playwright/test'
import {
  createUiTest,
  type BrowserControlParts,
  type UiTestAdapter,
} from '../playwright.js'
import type { createBrowserFixture } from '../fixture-build.mjs'

/** Register the portable checks for a supplying backend's reference fixture. */
export function testReferenceFixture(
  openFixture: ReturnType<typeof createBrowserFixture>,
  adapterMapping: UiTestAdapter,
  {
    collapsibleTrigger,
    nativeCollapsibleTrigger,
    nativeModal,
    openNativeModalFixture,
    nestedNavigation,
    verifyLoading,
  }: {
    collapsibleTrigger: BrowserControlParts['collapsibleTrigger']
    nativeCollapsibleTrigger?: BrowserControlParts['collapsibleTrigger']
    nativeModal: boolean
    openNativeModalFixture?: (page: Page) => Promise<void>
    nestedNavigation?: boolean
    verifyLoading?: (page: Page) => Promise<void>
  },
) {
  test('collapsible native presentation and summary typography can be compared', async ({
    page,
  }, testInfo) => {
    for (const width of [1100, 390]) {
      await page.setViewportSize({ width, height: 900 })
      for (const direction of ['ltr', 'rtl']) {
        await openFixture(page)
        await page.evaluate((dir) => {
          document.documentElement.dir = dir
        }, direction)
        const adapter = page.locator('[data-adapter-collapsible]')
        const trigger = collapsibleTrigger(adapter, 'Additional information')
        const native = page.locator('[data-native-collapsible]')
        await expect(trigger).toBeVisible()
        await expect(adapter.locator('h1,h2,h3,h4,h5,h6')).toHaveCount(0)
        if (await native.count()) {
          const original =
            nativeCollapsibleTrigger?.(native, 'Additional information') ??
            native.getByRole('button', {
              name: 'Additional information',
              exact: true,
            })
          await expect(original).toBeVisible()
          const typography = (element: HTMLElement) => {
            const style = getComputedStyle(element)
            return {
              font: style.fontFamily,
              size: style.fontSize,
              weight: style.fontWeight,
              top: style.paddingTop,
              bottom: style.paddingBottom,
            }
          }
          expect(await trigger.evaluate(typography)).toEqual(
            await original.evaluate(typography),
          )
          await original.click()
          await expect(
            native.getByText('Retained detail content.'),
          ).toBeVisible()
        }
        await trigger.focus()
        await page.keyboard.press('Enter')
        await expect(trigger).toHaveAttribute('aria-expanded', 'true')
        await expect(
          adapter.getByText('Retained detail content.'),
        ).toBeVisible()
        await testInfo.attach(`collapsible-${width}-${direction}-open`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        })
        await page.keyboard.press('Space')
        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
        await expect(adapter.getByText('Retained detail content.')).toBeHidden()
        await testInfo.attach(`collapsible-${width}-${direction}-closed`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        })
      }
    }
  })

  test('native and adapter presentations can be reviewed in common states', async ({
    page,
  }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    for (const width of [1100, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await openFixture(page)
      const adapter = page.getByRole('region', { name: 'Uninterface adapter' })
      const native = page.getByRole('region', { name: 'Native reference' })
      await expect(
        adapter.getByRole('textbox', { name: 'Name', exact: true }),
      ).toBeVisible()
      await expect(native).toBeVisible()
      for (const state of ['Normal', 'Invalid', 'Loading', 'Disabled']) {
        if (state !== 'Normal')
          await page.getByRole('checkbox', { name: state, exact: true }).check()
        if (state === 'Invalid')
          await expect(
            adapter.getByText('Enter a name.', { exact: true }),
          ).toBeVisible()
        if (state === 'Loading' || state === 'Disabled')
          await expect(
            adapter.getByRole('button', { name: 'Save', exact: true }),
          ).toBeDisabled()
        await testInfo.attach(`${width}-${state}`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        })
        if (state !== 'Normal')
          await page
            .getByRole('checkbox', { name: state, exact: true })
            .uncheck()
      }
      await adapter
        .getByRole('button', { name: 'Commands', exact: true })
        .click()
      const menu = page.getByRole('menu', { name: 'Commands', exact: true })
      await expect(menu).toBeVisible()
      const box = await menu.boundingBox()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1)
      await testInfo.attach(`${width}-menu`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      })
      await page.keyboard.press('Escape')
      await expect(menu).toBeHidden()
    }
    expect(errors).toEqual([])
  })

  test('reference select preserves source feedback and nested navigation remains operable', async ({
    page,
  }, testInfo) => {
    await openFixture(page)
    const adapter = page.getByRole('region', { name: 'Uninterface adapter' })
    const source = page.getByRole('combobox', {
      name: 'Source state',
      exact: true,
    })
    const ui = createUiTest(page, adapterMapping)
    const picker = ui.within(adapter).select({ name: 'Location' })
    const nativeSelect = await picker.isNative()
    for (const [state, expectedState, message] of [
      ['loading', 'loading', undefined],
      ['error', 'error', 'Entries could not be loaded.'],
      ['empty', 'ready', 'No entries available.'],
      ['ready', 'ready', undefined],
    ] as const) {
      await source.selectOption(state)
      await picker.expectSourceState(expectedState)
      if (!nativeSelect) await picker.open()
      if (state === 'loading') {
        await picker.expectLoading()
        await verifyLoading?.(page)
      } else if (message) {
        await picker.expectStatus(message, 'Shanghai')
      }
      await testInfo.attach(`native-and-adapter-source-${state}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      })
      if (!nativeSelect) await page.keyboard.press('Escape')
    }
    if (!nestedNavigation) return
    const examples = adapter.locator('[data-entry-key="examples"]')
    await examples.click()
    const panel = page.locator(
      `[id="${await examples.getAttribute('aria-controls')}"]`,
    )
    await expect(panel).toBeVisible()
    const more = panel.locator('[data-entry-key="more"]')
    await more.click()
    const nested = page.locator(
      `[id="${await more.getAttribute('aria-controls')}"]`,
    )
    await expect(nested).toBeVisible()
    const destination = ui.within(nested).navigationEntry({
      name: 'Forms',
      kind: 'destination',
    })
    await expect(destination).toBeVisible()
    await testInfo.attach('recursive-native-navigation', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })
    await destination.focus()
    await page.keyboard.press('Escape')
    await expect(examples).toHaveAttribute('aria-expanded', 'true')
    await expect(more).toBeFocused()
  })

  for (const direction of ['ltr', 'rtl']) {
    test(`modal actions preserve declaration and keyboard sequence in ${direction}`, async ({
      page,
    }, testInfo) => {
      await openFixture(page)
      await page.evaluate((dir) => {
        document.documentElement.dir = dir
      }, direction)
      await page
        .getByRole('button', { name: 'Open adapter modal', exact: true })
        .click()
      const modal = page.getByRole('dialog', {
        name: 'Modal presentation',
        exact: true,
      })
      const ok = modal.getByRole('button', { name: 'OK', exact: true })
      const cancel = modal.getByRole('button', { name: 'Cancel', exact: true })
      await expect(modal).toBeVisible()
      await expect(
        modal.getByRole('heading', { name: 'Modal presentation' }),
      ).toBeFocused()
      await page.keyboard.press('Tab')
      await expect(
        modal.getByRole('button', { name: 'Close', exact: true }),
      ).toBeFocused()
      await page.keyboard.press('Tab') // keyboard-accessible body scrollport
      await page.keyboard.press('Tab')
      await expect(ok).toBeFocused()
      await page.keyboard.press('Tab')
      await expect(cancel).toBeFocused()
      const before = await ok.boundingBox(),
        secondBefore = await cancel.boundingBox()
      await page.evaluate((dir) => {
        document.documentElement.dir = dir === 'rtl' ? 'ltr' : 'rtl'
      }, direction)
      const after = await ok.boundingBox(),
        secondAfter = await cancel.boundingBox()
      expect(Math.sign(before!.x - secondBefore!.x)).toBe(
        -Math.sign(after!.x - secondAfter!.x),
      )
      await expect(cancel).toBeFocused()
      await testInfo.attach(`modal-${direction}`, {
        body: await page.screenshot(),
        contentType: 'image/png',
      })
      await cancel.click()
      await expect(modal).toHaveCount(0)
    })
  }

  if (nativeModal) {
    test('modal title typography agrees with the installed native reference', async ({
      page,
      context,
    }, testInfo) => {
      const title = (fixturePage: Page) =>
        fixturePage
          .getByText('Modal presentation', { exact: true })
          .filter({ visible: true })

      async function measure(fixturePage: Page, opener: string, image: string) {
        await fixturePage
          .getByRole('button', { name: opener, exact: true })
          .click()
        const heading = title(fixturePage)
        await expect(heading).toBeVisible()
        const typography = await heading.evaluate((element) => {
          const style = getComputedStyle(element)
          return {
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
          }
        })
        await testInfo.attach(image, {
          body: await fixturePage.screenshot(),
          contentType: 'image/png',
        })
        return typography
      }

      await openFixture(page)
      const nativePage = openNativeModalFixture ? await context.newPage() : page
      try {
        await openNativeModalFixture?.(nativePage)
        const nativeTitle = await measure(
          nativePage,
          'Open native modal',
          'native-modal',
        )
        if (nativePage === page) {
          await page
            .getByRole('button', { name: 'Cancel', exact: true })
            .click()
          await expect(title(page)).toBeHidden()
        }
        const adapterTitle = await measure(
          page,
          'Open adapter modal',
          'adapter-modal',
        )
        expect(adapterTitle).toEqual(nativeTitle)
      } finally {
        if (nativePage !== page) await nativePage.close()
      }
    })
  }
}
